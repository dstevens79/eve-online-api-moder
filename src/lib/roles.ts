import { UserRole, RolePermissions, LMeveUser } from './types';

/**
 * Role-based access control system for LMeve
 * Defines permissions for different user roles
 */

export const ROLE_DEFINITIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    // System permissions
    canManageSystem: true,
    canManageMultipleCorps: true,
    canConfigureESI: true,
    canManageDatabase: true,
    
    // Corporation permissions
    canManageCorp: true,
    canManageUsers: true,
    canViewFinancials: true,
    canManageManufacturing: true,
    canManageMining: true,
    canManageAssets: true,
    canManageMarket: true,
    canViewKillmails: true,
    canManageIncome: true,
    
    // Data permissions
    canViewAllMembers: true,
    canEditAllData: true,
    canExportData: true,
    canDeleteData: true,
  },
  
  corp_admin: {
    // System permissions
    canManageSystem: false,
    canManageMultipleCorps: false,
    canConfigureESI: true,
    canManageDatabase: false,
    
    // Corporation permissions
    canManageCorp: true,
    canManageUsers: true,
    canViewFinancials: true,
    canManageManufacturing: true,
    canManageMining: true,
    canManageAssets: true,
    canManageMarket: true,
    canViewKillmails: true,
    canManageIncome: true,
    
    // Data permissions
    canViewAllMembers: true,
    canEditAllData: true,
    canExportData: true,
    canDeleteData: false,
  },
  
  corp_director: {
    // System permissions
    canManageSystem: false,
    canManageMultipleCorps: false,
    canConfigureESI: false,
    canManageDatabase: false,
    
    // Corporation permissions
    canManageCorp: false,
    canManageUsers: false,
    canViewFinancials: true,
    canManageManufacturing: true,
    canManageMining: true,
    canManageAssets: true,
    canManageMarket: true,
    canViewKillmails: true,
    canManageIncome: true,
    
    // Data permissions
    canViewAllMembers: true,
    canEditAllData: true,
    canExportData: true,
    canDeleteData: false,
  },
  
  corp_manager: {
    // System permissions
    canManageSystem: false,
    canManageMultipleCorps: false,
    canConfigureESI: false,
    canManageDatabase: false,
    
    // Corporation permissions
    canManageCorp: false,
    canManageUsers: false,
    canViewFinancials: false,
    canManageManufacturing: true,
    canManageMining: true,
    canManageAssets: false,
    canManageMarket: true,
    canViewKillmails: true,
    canManageIncome: false,
    
    // Data permissions
    canViewAllMembers: true,
    canEditAllData: false,
    canExportData: false,
    canDeleteData: false,
  },
  
  corp_member: {
    // System permissions
    canManageSystem: false,
    canManageMultipleCorps: false,
    canConfigureESI: false,
    canManageDatabase: false,
    
    // Corporation permissions
    canManageCorp: false,
    canManageUsers: false,
    canViewFinancials: false,
    canManageManufacturing: false,
    canManageMining: false,
    canManageAssets: false,
    canManageMarket: false,
    canViewKillmails: true,
    canManageIncome: false,
    
    // Data permissions
    canViewAllMembers: false,
    canEditAllData: false,
    canExportData: false,
    canDeleteData: false,
  },
  
  guest: {
    // System permissions
    canManageSystem: false,
    canManageMultipleCorps: false,
    canConfigureESI: false,
    canManageDatabase: false,
    
    // Corporation permissions
    canManageCorp: false,
    canManageUsers: false,
    canViewFinancials: false,
    canManageManufacturing: false,
    canManageMining: false,
    canManageAssets: false,
    canManageMarket: false,
    canViewKillmails: false,
    canManageIncome: false,
    
    // Data permissions
    canViewAllMembers: false,
    canEditAllData: false,
    canExportData: false,
    canDeleteData: false,
  },
};

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_DEFINITIONS[role];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: LMeveUser | null, permission: keyof RolePermissions): boolean {
  if (!user || !user.isActive) return false;
  return user.permissions[permission] || false;
}

/**
 * Check if a user can access a specific tab
 */
export function canAccessTab(user: LMeveUser | null, tab: string): boolean {
  if (!user || !user.isActive) {
    // Only dashboard is accessible without authentication
    return tab === 'dashboard';
  }
  
  switch (tab) {
    case 'dashboard':
      return true; // Always accessible when authenticated
      
    case 'members':
      return hasPermission(user, 'canViewAllMembers');
      
    case 'assets':
      return hasPermission(user, 'canManageAssets');
      
    case 'manufacturing':
      return hasPermission(user, 'canManageManufacturing');
      
    case 'mining':
      return hasPermission(user, 'canManageMining');
      
    case 'logistics':
      return hasPermission(user, 'canManageAssets');
      
    case 'killmails':
      return hasPermission(user, 'canViewKillmails');
      
    case 'market':
      return hasPermission(user, 'canManageMarket');
      
    case 'income':
      return hasPermission(user, 'canManageIncome') || hasPermission(user, 'canViewFinancials');
      
    case 'settings':
      return hasPermission(user, 'canManageCorp') || hasPermission(user, 'canManageSystem');
      
    default:
      return false;
  }
}

/**
 * Check if a user can access a specific settings tab
 */
export function canAccessSettingsTab(user: LMeveUser | null, settingsTab: string): boolean {
  if (!user || !user.isActive) return false;
  
  switch (settingsTab) {
    case 'general':
      return hasPermission(user, 'canManageCorp') || hasPermission(user, 'canManageSystem');
      
    case 'database':
      return hasPermission(user, 'canManageDatabase');
      
    case 'sde':
      return hasPermission(user, 'canManageSystem') || hasPermission(user, 'canManageDatabase');
      
    case 'esi':
      return hasPermission(user, 'canConfigureESI');
      
    case 'sync':
      return hasPermission(user, 'canManageCorp') || hasPermission(user, 'canManageSystem');
      
    case 'notifications':
      return hasPermission(user, 'canManageCorp');
      
    case 'users':
      return hasPermission(user, 'canManageUsers');
      
    case 'debug':
      return hasPermission(user, 'canManageSystem');
      
    default:
      return false;
  }
}

/**
 * Get the highest role from EVE corporation roles
 */
export function getEVERoleMapping(eveRoles: string[]): UserRole {
  // Check for CEO role first
  if (eveRoles.some(role => role.toLowerCase().includes('ceo') || role === 'CEO')) {
    return 'corp_admin';
  }
  
  // Check for director roles
  if (eveRoles.some(role => 
    role.toLowerCase().includes('director') || 
    role.toLowerCase().includes('personnel_manager') ||
    role === 'Director'
  )) {
    return 'corp_director';
  }
  
  // Check for manager-level roles
  if (eveRoles.some(role => 
    role.toLowerCase().includes('manager') ||
    role.toLowerCase().includes('accountant') ||
    role.toLowerCase().includes('factory_manager') ||
    role.toLowerCase().includes('station_manager')
  )) {
    return 'corp_manager';
  }
  
  // Default to member
  return 'corp_member';
}

/**
 * Create a user with appropriate permissions
 */
export function createUserWithRole(
  userData: Partial<LMeveUser>,
  role: UserRole
): LMeveUser {
  const now = new Date().toISOString();
  
  return {
    id: userData.id || `user_${Date.now()}`,
    username: userData.username,
    characterId: userData.characterId,
    characterName: userData.characterName,
    corporationId: userData.corporationId,
    corporationName: userData.corporationName,
    allianceId: userData.allianceId,
    allianceName: userData.allianceName,
    authMethod: userData.authMethod || 'manual',
    role,
    permissions: getRolePermissions(role),
    accessToken: userData.accessToken,
    refreshToken: userData.refreshToken,
    tokenExpiry: userData.tokenExpiry,
    scopes: userData.scopes || [],
    lastLogin: now,
    sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    isActive: true,
    createdDate: userData.createdDate || now,
    createdBy: userData.createdBy,
    updatedDate: now,
    updatedBy: userData.updatedBy,
  };
}

/**
 * Check if a user's session is valid
 */
export function isSessionValid(user: LMeveUser): boolean {
  if (!user.isActive) return false;
  
  const now = Date.now();
  const sessionExpiry = new Date(user.sessionExpiry).getTime();
  
  return now < sessionExpiry;
}

/**
 * Refresh user session
 */
export function refreshUserSession(user: LMeveUser): LMeveUser {
  const now = new Date().toISOString();
  
  return {
    ...user,
    lastLogin: now,
    sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: now,
  };
}