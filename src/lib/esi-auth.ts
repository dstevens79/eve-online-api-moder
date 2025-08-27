import { 
  ESIAuthState, 
  ESITokenResponse, 
  ESICharacterData, 
  LMeveUser, 
  CorporationConfig 
} from './types';
import { getEVERoleMapping, createUserWithRole } from './roles';

/**
 * EVE Online SSO Authentication Service
 * Implements PKCE (Proof Key for Code Exchange) for secure authentication
 */

// EVE Online SSO endpoints
const ESI_BASE_URL = 'https://esi.evetech.net';
const SSO_BASE_URL = 'https://login.eveonline.com';
const SSO_AUTH_URL = `${SSO_BASE_URL}/v2/oauth/authorize`;
const SSO_TOKEN_URL = `${SSO_BASE_URL}/v2/oauth/token`;
const SSO_VERIFY_URL = `${SSO_BASE_URL}/oauth/verify`;

// Required scopes for corporation management
const REQUIRED_SCOPES = [
  'esi-characters.read_corporation_roles.v1',
  'esi-corporations.read_corporation_membership.v1',
  'esi-universe.read_structures.v1',
  'esi-assets.read_corporation_assets.v1',
  'esi-industry.read_corporation_jobs.v1',
  'esi-wallet.read_corporation_wallets.v1',
  'esi-killmails.read_corporation_killmails.v1'
];

export class ESIAuthService {
  private clientId: string;
  private clientSecret?: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret?: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = `${window.location.origin}/`;
  }

  /**
   * Generate PKCE challenge and verifier
   */
  private async generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    // Generate code verifier (random string)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const verifier = btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Generate code challenge (SHA256 hash of verifier)
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const challenge = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return { verifier, challenge };
  }

  /**
   * Generate random state parameter
   */
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Initiate EVE SSO login
   */
  async initiateLogin(corporationId?: number): Promise<string> {
    console.log('🚀 Initiating EVE SSO login');
    
    const { verifier, challenge } = await this.generatePKCE();
    const state = this.generateState();

    // Store auth state in session storage
    const authState: ESIAuthState = {
      state,
      verifier,
      challenge,
      timestamp: Date.now(),
      corporationId
    };

    sessionStorage.setItem('esi-auth-state', JSON.stringify(authState));
    sessionStorage.setItem('esi-login-attempt', 'true');

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      scope: REQUIRED_SCOPES.join(' '),
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state: state
    });

    const authUrl = `${SSO_AUTH_URL}?${params.toString()}`;
    console.log('🔗 Generated auth URL:', authUrl);
    
    return authUrl;
  }

  /**
   * Handle the authorization callback
   */
  async handleCallback(code: string, state: string): Promise<LMeveUser> {
    console.log('🔄 Processing ESI callback');
    
    // Retrieve stored auth state
    const storedStateData = sessionStorage.getItem('esi-auth-state');
    if (!storedStateData) {
      throw new Error('No stored authentication state found');
    }

    const authState: ESIAuthState = JSON.parse(storedStateData);
    
    // Verify state parameter
    if (state !== authState.state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // Check if state is too old (5 minutes)
    if (Date.now() - authState.timestamp > 5 * 60 * 1000) {
      throw new Error('Authentication state has expired');
    }

    try {
      // Exchange authorization code for access token
      const tokenResponse = await this.exchangeCodeForToken(code, authState.verifier);
      
      // Get character information
      const characterData = await this.getCharacterInfo(tokenResponse.access_token);
      
      // Get character's corporation roles
      const corporationRoles = await this.getCharacterRoles(
        characterData.character_id, 
        tokenResponse.access_token
      );

      // Create user with appropriate role
      const userRole = getEVERoleMapping(corporationRoles);
      
      const userData: Partial<LMeveUser> = {
        characterId: characterData.character_id,
        characterName: characterData.character_name,
        corporationId: characterData.corporation_id,
        allianceId: characterData.alliance_id,
        authMethod: 'esi',
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiry: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        scopes: tokenResponse.scope?.split(' ') || REQUIRED_SCOPES
      };

      const user = createUserWithRole(userData, userRole);
      
      // Get corporation name
      if (user.corporationId) {
        try {
          user.corporationName = await this.getCorporationName(user.corporationId);
        } catch (error) {
          console.warn('Failed to get corporation name:', error);
        }
      }

      // Get alliance name if applicable
      if (user.allianceId) {
        try {
          user.allianceName = await this.getAllianceName(user.allianceId);
        } catch (error) {
          console.warn('Failed to get alliance name:', error);
        }
      }

      console.log('✅ ESI authentication successful:', {
        characterName: user.characterName,
        corporationName: user.corporationName,
        role: user.role
      });

      // Clean up session storage
      sessionStorage.removeItem('esi-auth-state');
      sessionStorage.removeItem('esi-login-attempt');

      return user;
      
    } catch (error) {
      console.error('❌ ESI authentication failed:', error);
      
      // Clean up session storage on error
      sessionStorage.removeItem('esi-auth-state');
      sessionStorage.removeItem('esi-login-attempt');
      
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(code: string, verifier: string): Promise<ESITokenResponse> {
    console.log('🔄 Exchanging code for token');
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      code: code,
      redirect_uri: this.redirectUri,
      code_verifier: verifier
    });

    // Add client secret if available (for confidential clients)
    if (this.clientSecret) {
      body.append('client_secret', this.clientSecret);
    }

    const response = await fetch(SSO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LMeve/1.0 (https://github.com/dstevens79/lmeve)'
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokenData: ESITokenResponse = await response.json();
    console.log('✅ Token exchange successful');
    
    return tokenData;
  }

  /**
   * Get character information from ESI
   */
  private async getCharacterInfo(accessToken: string): Promise<ESICharacterData> {
    console.log('🔄 Getting character info');
    
    const response = await fetch(SSO_VERIFY_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'LMeve/1.0 (https://github.com/dstevens79/lmeve)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get character info: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Character info retrieved:', data.CharacterName);
    
    return {
      character_id: data.CharacterID,
      character_name: data.CharacterName,
      corporation_id: data.CharacterOwnerHash, // This is actually character ID, need to get corp from ESI
      scopes: data.Scopes?.split(' ') || []
    };
  }

  /**
   * Get character's corporation roles
   */
  private async getCharacterRoles(characterId: number, accessToken: string): Promise<string[]> {
    console.log('🔄 Getting character roles');
    
    try {
      const response = await fetch(
        `${ESI_BASE_URL}/latest/characters/${characterId}/roles/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'LMeve/1.0 (https://github.com/dstevens79/lmeve)'
          }
        }
      );

      if (!response.ok) {
        console.warn('Failed to get character roles, using default');
        return [];
      }

      const rolesData = await response.json();
      const roles = rolesData.roles || [];
      
      console.log('✅ Character roles retrieved:', roles);
      return roles;
      
    } catch (error) {
      console.warn('Error getting character roles:', error);
      return [];
    }
  }

  /**
   * Get corporation name
   */
  private async getCorporationName(corporationId: number): Promise<string> {
    const response = await fetch(
      `${ESI_BASE_URL}/latest/corporations/${corporationId}/`,
      {
        headers: {
          'User-Agent': 'LMeve/1.0 (https://github.com/dstevens79/lmeve)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get corporation info: ${response.status}`);
    }

    const data = await response.json();
    return data.name;
  }

  /**
   * Get alliance name
   */
  private async getAllianceName(allianceId: number): Promise<string> {
    const response = await fetch(
      `${ESI_BASE_URL}/latest/alliances/${allianceId}/`,
      {
        headers: {
          'User-Agent': 'LMeve/1.0 (https://github.com/dstevens79/lmeve)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get alliance info: ${response.status}`);
    }

    const data = await response.json();
    return data.name;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<ESITokenResponse> {
    console.log('🔄 Refreshing access token');
    
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId
    });

    // Add client secret if available
    if (this.clientSecret) {
      body.append('client_secret', this.clientSecret);
    }

    const response = await fetch(SSO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LMeve/1.0 (https://github.com/dstevens79/lmeve)'
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const tokenData: ESITokenResponse = await response.json();
    console.log('✅ Token refresh successful');
    
    return tokenData;
  }

  /**
   * Validate if access token is still valid
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(SSO_VERIFY_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'LMeve/1.0 (https://github.com/dstevens79/lmeve)'
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    try {
      await fetch(`${SSO_BASE_URL}/v2/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'LMeve/1.0 (https://github.com/dstevens79/lmeve)'
        },
        body: new URLSearchParams({
          token_type_hint: 'access_token',
          token: accessToken
        }).toString()
      });
      
      console.log('✅ Token revoked successfully');
    } catch (error) {
      console.warn('Failed to revoke token:', error);
    }
  }
}

/**
 * Default ESI Auth Service instance
 * Will be configured based on application settings
 */
export let esiAuthService: ESIAuthService | null = null;

/**
 * Initialize ESI Auth Service with configuration
 */
export function initializeESIAuth(clientId: string, clientSecret?: string): void {
  esiAuthService = new ESIAuthService(clientId, clientSecret);
  console.log('✅ ESI Auth Service initialized');
}

/**
 * Get the configured ESI Auth Service
 */
export function getESIAuthService(): ESIAuthService {
  if (!esiAuthService) {
    throw new Error('ESI Auth Service not initialized. Call initializeESIAuth() first.');
  }
  return esiAuthService;
}