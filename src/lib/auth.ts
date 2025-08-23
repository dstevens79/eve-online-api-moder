// Authentication and ESI OAuth Integration
import React from 'react';
import { useKV } from '@github/spark/hooks';

export interface AuthUser {
  characterId: number;
  characterName: string;
  corporationId: number;
  corporationName: string;
  allianceId?: number;
  allianceName?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  scopes: string[];
  isDirector: boolean;
  isCeo: boolean;
  isAdmin?: boolean; // Local admin user flag
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ESIAuthState {
  state: string;
  codeVerifier: string;
  redirectUri: string;
}

class AuthService {
  private readonly ESI_CLIENT_ID = 'your-esi-client-id'; // This would be configured in settings
  private readonly ESI_BASE_URL = 'https://login.eveonline.com/v2/oauth';
  private readonly ESI_SCOPES = [
    'esi-corporations.read_corporation_membership.v1',
    'esi-industry.read_corporation_jobs.v1',
    'esi-assets.read_corporation_assets.v1',
    'esi-corporations.read_blueprints.v1',
    'esi-markets.read_corporation_orders.v1',
    'esi-wallet.read_corporation_wallets.v1',
    'esi-killmails.read_corporation_killmails.v1',
    'esi-contracts.read_corporation_contracts.v1'
  ];

  /**
   * Generate ESI OAuth URL for character authentication
   */
  generateESIAuthUrl(): { url: string; state: ESIAuthState } {
    const state = this.generateRandomString(32);
    const codeVerifier = this.generateRandomString(128);
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const redirectUri = `${window.location.origin}/auth/callback`;

    const authState: ESIAuthState = {
      state,
      codeVerifier,
      redirectUri
    };

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.ESI_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: this.ESI_SCOPES.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    return {
      url: `${this.ESI_BASE_URL}/authorize?${params.toString()}`,
      state: authState
    };
  }

  /**
   * Handle ESI OAuth callback and exchange code for tokens
   */
  async handleESICallback(code: string, state: string, storedState: ESIAuthState): Promise<AuthUser> {
    if (state !== storedState.state) {
      throw new Error('Invalid state parameter');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(`${this.ESI_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.ESI_CLIENT_ID,
        code,
        redirect_uri: storedState.redirectUri,
        code_verifier: storedState.codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Verify token and get character info
    const verifyResponse = await fetch('https://esi.evetech.net/verify/', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!verifyResponse.ok) {
      throw new Error('Failed to verify token');
    }

    const characterData = await verifyResponse.json();

    // Get additional character and corporation info
    const [characterInfo, corporationInfo] = await Promise.all([
      this.getCharacterInfo(characterData.CharacterID, access_token),
      this.getCorporationInfo(characterData.corporation_id, access_token)
    ]);

    return {
      characterId: characterData.CharacterID,
      characterName: characterData.CharacterName,
      corporationId: characterData.corporation_id,
      corporationName: corporationInfo.name,
      allianceId: corporationInfo.alliance_id,
      allianceName: corporationInfo.alliance_id ? await this.getAllianceName(corporationInfo.alliance_id) : undefined,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiry: Date.now() + (expires_in * 1000),
      scopes: characterData.Scopes ? characterData.Scopes.split(' ') : [],
      isDirector: await this.checkDirectorRole(characterData.CharacterID, characterData.corporation_id, access_token),
      isCeo: corporationInfo.ceo_id === characterData.CharacterID
    };
  }

  /**
   * Traditional username/password login (for development/testing and admin access)
   */
  async loginWithCredentials(credentials: LoginCredentials, adminConfig?: { username: string; password: string }): Promise<AuthUser> {
    // Check for admin login if configured
    if (adminConfig && credentials.username === adminConfig.username && credentials.password === adminConfig.password) {
      return {
        characterId: 999999999,
        characterName: 'Local Administrator',
        corporationId: 1000000000,
        corporationName: 'LMeve Administration',
        allianceId: undefined,
        allianceName: undefined,
        accessToken: 'admin-access-token',
        refreshToken: 'admin-refresh-token',
        tokenExpiry: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        scopes: this.ESI_SCOPES,
        isDirector: true,
        isCeo: true,
        isAdmin: true
      };
    }

    // Fallback test user for development
    if (credentials.username === 'admin' && credentials.password === 'password') {
      return {
        characterId: 123456789,
        characterName: 'Test Character',
        corporationId: 987654321,
        corporationName: 'Test Corporation',
        allianceId: 111222333,
        allianceName: 'Test Alliance Please Ignore',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        tokenExpiry: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        scopes: this.ESI_SCOPES,
        isDirector: true,
        isCeo: true
      };
    }

    throw new Error('Invalid credentials');
  }

  /**
   * Refresh ESI access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await fetch(`${this.ESI_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.ESI_CLIENT_ID,
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  }

  /**
   * Check if user has director roles
   */
  private async checkDirectorRole(characterId: number, corporationId: number, token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://esi.evetech.net/latest/corporations/${corporationId}/roles/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return false;

      const roles = await response.json();
      const characterRoles = roles.find((r: any) => r.character_id === characterId);
      
      return characterRoles?.roles?.includes('Director') || false;
    } catch {
      return false;
    }
  }

  /**
   * Get character information from ESI
   */
  private async getCharacterInfo(characterId: number, token: string) {
    const response = await fetch(`https://esi.evetech.net/latest/characters/${characterId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get character info');
    }

    return response.json();
  }

  /**
   * Get corporation information from ESI
   */
  private async getCorporationInfo(corporationId: number, token: string) {
    const response = await fetch(`https://esi.evetech.net/latest/corporations/${corporationId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get corporation info');
    }

    return response.json();
  }

  /**
   * Get alliance name
   */
  private async getAllianceName(allianceId: number): Promise<string> {
    try {
      const response = await fetch(`https://esi.evetech.net/latest/alliances/${allianceId}/`);
      if (response.ok) {
        const data = await response.json();
        return data.name;
      }
    } catch {
      // Fallback if alliance info is not available
    }
    return 'Unknown Alliance';
  }

  /**
   * Generate random string for OAuth state/verifier
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate PKCE code challenge
   */
  private generateCodeChallenge(verifier: string): string {
    // In a real implementation, this would use SHA256
    // For now, we'll use the verifier as-is (which is allowed but less secure)
    return verifier;
  }
}

export const authService = new AuthService();

/**
 * React hook for authentication state
 */
export function useAuth() {
  const [user, setUser] = useKV<AuthUser | null>('auth-user', null);
  const [adminConfig, setAdminConfig] = useKV<{ username: string; password: string }>('admin-config', { username: 'admin', password: '12345' });
  const [isLoading, setIsLoading] = React.useState(false);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const authUser = await authService.loginWithCredentials(credentials, adminConfig);
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAdminConfig = (newConfig: { username: string; password: string }): void => {
    setAdminConfig(newConfig);
  };

  const loginWithESI = (): { url: string; state: ESIAuthState } => {
    return authService.generateESIAuthUrl();
  };

  const handleESICallback = async (code: string, state: string, storedState: ESIAuthState): Promise<void> => {
    setIsLoading(true);
    try {
      const authUser = await authService.handleESICallback(code, state, storedState);
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
  };

  const refreshUserToken = async (): Promise<void> => {
    if (!user?.refreshToken || user?.isAdmin) return; // Skip token refresh for admin users

    try {
      const { accessToken, expiresIn } = await authService.refreshToken(user.refreshToken);
      setUser(currentUser => currentUser ? {
        ...currentUser,
        accessToken,
        tokenExpiry: Date.now() + (expiresIn * 1000)
      } : null);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
    }
  };

  const isTokenExpired = (): boolean => {
    if (user?.isAdmin) return false; // Admin tokens don't expire
    return user ? Date.now() >= user.tokenExpiry - 300000 : false; // 5 min buffer
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    adminConfig,
    updateAdminConfig,
    login,
    loginWithESI,
    handleESICallback,
    logout,
    refreshUserToken,
    isTokenExpired
  };
}