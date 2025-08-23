// LMeve Application Types

export interface Member {
  id: number;
  name: string;
  corporationId: number;
  characterId: number;
  joinDate: string;
  lastLogin: string;
  title: string;
  roles: string[];
  isActive: boolean;
  securityStatus: number;
  location?: string;
  ship?: string;
}

export interface Asset {
  id: string;
  typeId: number;
  typeName: string;
  quantity: number;
  location: string;
  locationId: number;
  owner: string;
  ownerId: number;
  category: 'ship' | 'module' | 'commodity' | 'blueprint' | 'other';
  estimatedValue: number;
  lastUpdate: string;
}

export interface ManufacturingJob {
  id: string;
  blueprintId: number;
  blueprintName: string;
  runs: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  facility: string;
  facilityId: number;
  installerId: number;
  installerName: string;
  cost: number;
  productQuantity: number;
}

export interface MiningOperation {
  id: string;
  date: string;
  system: string;
  systemId: number;
  ore: string;
  oreTypeId: number;
  quantity: number;
  minerId: number;
  minerName: string;
  estimatedValue: number;
  refined?: boolean;
  minerals?: MineralYield[];
}

export interface MineralYield {
  typeId: number;
  typeName: string;
  quantity: number;
  value: number;
}

export interface Corporation {
  id: number;
  name: string;
  ticker: string;
  memberCount: number;
  taxRate: number;
  ceoId: number;
  ceoName: string;
  allianceId?: number;
  allianceName?: string;
  founded: string;
  description: string;
  headquarters: string;
  netWorth: number;
  walletBalance: number;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalAssets: number;
  totalAssetsValue: number;
  activeJobs: number;
  completedJobsThisMonth: number;
  miningOperationsThisMonth: number;
  miningValueThisMonth: number;
  corpWalletBalance: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'login' | 'asset_update' | 'job_completed' | 'mining' | 'transaction';
  memberId: number;
  memberName: string;
  description: string;
  details?: Record<string, any>;
}

export interface MarketPrice {
  typeId: number;
  typeName: string;
  buyPrice: number;
  sellPrice: number;
  lastUpdate: string;
  volume: number;
  region: string;
  regionId: number;
}

export interface KillmailSummary {
  id: string;
  timestamp: string;
  victim: {
    characterId: number;
    characterName: string;
    corporationId: number;
    corporationName: string;
    shipTypeId: number;
    shipTypeName: string;
    damageTaken: number;
  };
  attackers: Array<{
    characterId?: number;
    characterName?: string;
    corporationId?: number;
    corporationName?: string;
    shipTypeId?: number;
    shipTypeName?: string;
    finalBlow: boolean;
  }>;
  system: string;
  systemId: number;
  totalValue: number;
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  component: React.ComponentType<any>;
  requiredRoles?: string[];
  badge?: string | number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  cached?: boolean;
}

export type TabType = 
  | 'dashboard' 
  | 'members' 
  | 'assets' 
  | 'manufacturing' 
  | 'mining' 
  | 'logistics' 
  | 'killmails' 
  | 'market' 
  | 'settings';