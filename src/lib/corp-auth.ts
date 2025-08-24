// Enhanced Corporate Authentication System for LMeve
import { useKV } from '@github/spark/hooks';
import { useKV } from '@github/spark/hooks';
import React from 'react';

export interface CorporationESIConfig {
  scopes: string[];
  isActive: boolean;

  characterId: numb
  corporationName: string;
  allianceName?: string
  refreshToken: stri
  scopes: string[];
 

  authMethod: 'esi' | 'local'; // Tr

  state: string;
  timestamp: number;
  corporationName: string;
  allianceId?: number;
  allianceName?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  scopes: string[];
  isDirector: boolean;
  isCeo: boolean;
  isAdmin: boolean;
  canManageESI: boolean; // CEO/Director can manage corp ESI
  loginTime: number;
  authMethod: 'esi' | 'local'; // Track how user authenticated
 

export interface ESIAuthState {
  state: string;
  codeVerifier: string;
  timestamp: number;
  redirectUri: string;
}

    'esi-corporations
  clientId: string;

  baseUrl: string;
 

  g
 * Enhanced Corporation Authentication Service
 * Handles ESI authentication with corporation-based access control
 */
class CorporationAuthService {
  private readonly ESI_BASE_URL = 'https://login.eveonline.com/v2/oauth';
  private readonly ESI_SCOPES = [
    'esi-corporations.read_corporation_membership.v1',
    'esi-industry.read_corporation_jobs.v1',
    'esi-assets.read_corporation_assets.v1',
    'esi-corporations.read_blueprints.v1',
    'esi-markets.read_corporation_orders.v1',
      state,
    'esi-killmails.read_corporation_killmails.v1',
    'esi-contracts.read_corporation_contracts.v1',
    'esi-corporations.read_titles.v1',
      url: `${this.ESI_BASE_URL}/authorize?${p
  ];

  constructor(private esiConfig: ESIConfig) {}

  /**
   * Generate ESI OAuth URL for character authentication
   */
  generateESIAuthUrl(): { url: string; state: ESIAuthState } {
    const state = this.generateRandomString(32);
    const codeVerifier = this.generateRandomString(128);
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const redirectUri = `${window.location.origin}${window.location.pathname}`;

    const authState: ESIAuthState = {
    const co
      codeVerifier,
      timestamp: Date.now(),
      redirectUri
      

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.esiConfig.clientId,
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
   * Handle ESI OAuth callback and validate corporation access
   */
  }
    code: string, 
   * Validate corpo
    storedState: ESIAuthState,
    registeredCorps: CorporationESIConfig[]
  ): Promise<AuthenticatedUser> {
    accessToken: string
      throw new Error('Invalid state parameter - possible CSRF attack');
    /

    // Exchange authorization code for access token
    const tokenData = await this.exchangeCodeForToken(code, storedState);
    const { access_token, refresh_token, expires_in } = tokenData;

    const corporationInfo = await this.get
    const characterData = await this.verifyToken(access_token);
    const characterInfo = await this.getCharacterInfo(characterData.CharacterID, access_token);
    const corporationInfo = await this.getCorporationInfo(characterData.corporation_id, access_token);

    // Check corporation access permissions
    const corpAccess = await this.validateCorporationAccess(
      characterData.corporation_id,
      hasAccess: false, 
      registeredCorps,
  }
    );

    if (!corpAccess.hasAccess) {
      throw new Error(corpAccess.reason || 'Access denied');
    }

    // Get user roles and permissions
    const roles = await this.getCharacterRoles(characterData.CharacterID, characterData.corporation_id, access_token);

    return {
      characterId: characterData.CharacterID,
        return { isDirector: false, roles: [] };
      corporationId: characterData.corporation_id,
      corporationName: corporationInfo.name,
      allianceId: corporationInfo.alliance_id,
      allianceName: corporationInfo.alliance_id ? await this.getAllianceName(corporationInfo.alliance_id) : undefined,
      accessToken: access_token,
      console.warn('Error fetching
      tokenExpiry: Date.now() + (expires_in * 1000),
      scopes: characterData.Scopes ? characterData.Scopes.split(' ') : [],
      isDirector: roles.isDirector,
   * Register new corporation ESI access
      isAdmin: false,
      canManageESI: roles.isDirector || corporationInfo.ceo_id === characterData.CharacterID,
      loginTime: Date.now(),
      authMethod: 'esi'
    };
   

     
   * Validate corporation access permissions
     
  private async validateCorporationAccess(

    characterId: number,
    registeredCorps: CorporationESIConfig[],
    accessToken: string
  ): Promise<{ hasAccess: boolean; reason?: string }> {
    
    // Check if corporation is already registered
    const registeredCorp = registeredCorps.find(corp => corp.corporationId === corporationId && corp.isActive);
    
    if (registeredCorp) {
      console.log(`✅ Corporation ${corporationId} is registered - access granted`);
      return { hasAccess: true };
     

    // Corporation not registered - check if user is CEO/Director who can register it
    const corporationInfo = await this.getCorporationInfo(corporationId, accessToken);
    const roles = await this.getCharacterRoles(characterId, corporationId, accessToken);
    
    const isCeo = corporationInfo.ceo_id === characterId;
    const isDirector = roles.isDirector;
    
    if (isCeo || isDirector) {
      console.log(`✅ User is ${isCeo ? 'CEO' : 'Director'} of unregistered corp - access granted for registration`);
      return { hasAccess: true };


    return { 
      hasAccess: false, 
      reason: `Corporation "${corporationInfo.name}" is not registered with LMeve. Contact your CEO or Directors to register corporation ESI access.`
    };
   

     
   * Get character roles from ESI
     
  private async getCharacterRoles(characterId: number, corporationId: number, token: string): Promise<{
    isDirector: boolean;
    roles: string[];
  }> {
    try {
      const response = await fetch(`https://esi.evetech.net/latest/characters/${characterId}/roles/`, {
        headers: {
      expiresIn: data.expires_in
        }
      });

    const response = awai
        console.warn('Could not fetch character roles - access may be limited');
        return { isDirector: false, roles: [] };
      }

      const roleData = await response.json();
      const roles = roleData.roles || [];
      const isDirector = roles.includes('Director');

      return { isDirector, roles };
      const error = a
      console.warn('Error fetching character roles:', error);
      return { isDirector: false, roles: [] };
    }


     
   * Register new corporation ESI access
   */
  async registerCorporationESI(
      throw new Error('Fai
    corporationName: string,
    return response.json(
    registeredBy: number,
  private async getC
  ): Promise<CorporationESIConfig> {
    const config: CorporationESIConfig = {
      corporationId,

      refreshToken,
    }
      registeredBy,
  }
      isActive: true
    co

    console.log(`📝 Registering ESI access for corporation: ${corporationName} (${corporationId})`);
    return config;
   


   * Local admin authentication (unchanged from existing system)

  async loginWithCredentials(username: string, password: string, adminConfig: { username: string; password: string }): Promise<AuthenticatedUser> {
    console.log('🔐 Local login attempt for:', username);
    
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    // Check configured admin credentials
    if (trimmedUsername === adminConfig.username && trimmedPassword === adminConfig.password) {
      console.log('✅ Admin login successful');
      return {
        characterId: 999999999,
        characterName: 'Local Administrator',
        corporationId: 1000000000,
  }
        allianceId: undefined,
        allianceName: undefined,
        accessToken: 'admin-access-token',
        refreshToken: 'admin-refresh-token',
        tokenExpiry: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
/**
        isDirector: true,
export function useC
        isAdmin: true,
        canManageESI: true,
        loginTime: Date.now(),
        authMethod: 'local'
      };
    u

    throw new Error(`Invalid credentials for user: ${trimmedUsername}`);
  }

  /**
  // Debug logging
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await fetch(`${this.ESI_BASE_URL}/token`, {
      isAdmin: user?.
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.esiConfig.clientId}:${this.esiConfig.secretKey}`)}`

      body: new URLSearchParams({
    try {
        refresh_token: refreshToken
      se
    });

    if (!response.ok) {
    }
    }

    const data = await response.json();
    }
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  }

  // Private helper methods
  private async exchangeCodeForToken(code: string, storedState: ESIAuthState) {
    const response = await fetch(`${this.ESI_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.esiConfig.clientId}:${this.esiConfig.secretKey}`)}`
      },

        grant_type: 'authorization_code',
        code,
        redirect_uri: storedState.redirectUri,
        code_verifier: storedState.codeVerifier
      })
      t

    }
      const error = await response.text();
      throw new Error(`Failed to exchange authorization code: ${error}`);
    }

    return response.json();
  )

  private async verifyToken(accessToken: string) {
    const response = await fetch('https://esi.evetech.net/verify/', {
      scopes
        'Authorization': `Bearer ${accessToken}`
    set
    });

    if (!response.ok) {
      throw new Error('Failed to verify token');
    }

    return response.json();
  c

  private async getCharacterInfo(characterId: number, token: string) {
    const response = await fetch(`https://esi.evetech.net/latest/characters/${characterId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {

    }

    return response.json();
  c

  private async getCorporationInfo(corporationId: number, token: string) {
    const response = await fetch(`https://esi.evetech.net/latest/corporations/${corporationId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
    use
    });

    if (!response.ok) {
      throw new Error('Failed to get corporation info');
    }

    return response.json();
  }

  private async getAllianceName(allianceId: number): Promise<string> {
    try {
      const response = await fetch(`https://esi.evetech.net/latest/alliances/${allianceId}/`);
      if (response.ok) {

        return data.name;
      }
    } catch {
      // Fallback if alliance info is not available

    return 'Unknown Alliance';


  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;


  private generateCodeChallenge(verifier: string): string {
    // In a real implementation, this would use SHA256
    // For now, we'll use the verifier as-is (which is allowed but less secure)
    return verifier;
  }
}

/**
 * React hook for corporation-based authentication
 */

  const [user, setUser] = useKV<AuthenticatedUser | null>('corp-auth-user', null);
  const [registeredCorps, setRegisteredCorps] = useKV<CorporationESIConfig[]>('registered-corporations', []);
  const [esiConfig, setESIConfig] = useKV<ESIConfig>('esi-config', {
    clientId: '',
    secretKey: '',
    baseUrl: 'https://login.eveonline.com'
  });
  const [adminConfig, setAdminConfig] = useKV<{ username: string; password: string }>('admin-config', {
    username: 'admin',

  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [authTrigger, setAuthTrigger] = React.useState(0);

  const authService = React.useMemo(() => new CorporationAuthService(esiConfig), [esiConfig]);
  const isAuthenticated = Boolean(user);


  React.useEffect(() => {
    console.log('🔄 CORP AUTH - User state changed:', {
      hasUser: !!user,

      corporationName: user?.corporationName,
      isAdmin: user?.isAdmin,
      authMethod: user?.authMethod,
      canManageESI: user?.canManageESI,
      timestamp: Date.now()

  }, [user, authTrigger]);

  const loginWithCredentials = async (username: string, password: string): Promise<void> => {

    try {
      const authUser = await authService.loginWithCredentials(username, password, adminConfig);
      setUser(authUser);
      setAuthTrigger(prev => prev + 1);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);

  };

  const loginWithESI = (): string => {

      throw new Error('ESI Client ID not configured. Please configure ESI settings first.');

    
    const { url, state } = authService.generateESIAuthUrl();
    sessionStorage.setItem('esi-auth-state', JSON.stringify(state));
    sessionStorage.setItem('esi-login-attempt', 'true');
    return url;


  const handleESICallback = async (code: string, state: string): Promise<void> => {
    setIsLoading(true);

      const storedStateData = sessionStorage.getItem('esi-auth-state');

        throw new Error('No stored ESI auth state found');


      const storedState = JSON.parse(storedStateData) as ESIAuthState;
      const authUser = await authService.handleESICallback(code, state, storedState, registeredCorps);

      setUser(authUser);
      setAuthTrigger(prev => prev + 1);

      // Clean up session storage
      sessionStorage.removeItem('esi-auth-state');






















































































