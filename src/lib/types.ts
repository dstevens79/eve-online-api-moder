// Common interface for all tab components
export interface TabComponentProps {
  onLoginClick?: () => void;
}

// Tab types for navigation
export type TabType = 'dashboard' | 'members' | 'assets' | 'manufacturing' | 'mining' | 'logistics' | 'killmails' | 'market' | 'income' | 'settings';

// Member management types
export interface Member {
  id: number;
  characterId: number;
  characterName: string;
  corporationId: number;
  corporationName: string;
  allianceId?: number;
  allianceName?: string;
  roles: string[];
  titles: string[];
  lastLogin: string;
  location: string;
  logonDuration: number;
  shipTypeId?: number;
  shipTypeName?: string;
  startDateTime: string;
  logoffDateTime?: string;
  isOnline: boolean;
  accessLevel: 'member' | 'director' | 'ceo';
  joinedDate: string;
  totalSkillPoints: number;
  activeClones: number;
  securityStatus: number;
}

// Manufacturing types
export interface ManufacturingJob {
  jobId: number;
  installerId: number;
  installerName: string;
  facilityId: number;
  facilityName: string;
  stationId: number;
  blueprintId: number;
  blueprintTypeId: number;
  blueprintTypeName: string;
  blueprintLocationId: number;
  outputLocationId: number;
  runs: number;
  cost?: number;
  licensedRuns?: number;
  probability?: number;
  productTypeId?: number;
  productTypeName?: string;
  status: 'active' | 'paused' | 'ready' | 'delivered' | 'cancelled' | 'reverted';
  timeInSeconds: number;
  startDate: string;
  endDate: string;
  pauseDate?: string;
  completedDate?: string;
  completedCharacterId?: number;
  successfulRuns?: number;
  activityId: number;
  activityName: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  profitMargin: number;
  estimatedProfit: number;
  materials: MaterialRequirement[];
}

export interface Blueprint {
  itemId: number;
  typeId: number;
  typeName: string;
  locationId: number;
  locationName: string;
  locationFlag: string;
  quantity: number;
  materialEfficiency: number;
  timeEfficiency: number;
  runs: number;
  isCopy: boolean;
  isOriginal: boolean;
  categoryId: number;
  categoryName: string;
  groupId: number;
  groupName: string;
  metaLevel?: number;
  techLevel?: number;
  estimatedValue: number;
  productTypeId: number;
  productTypeName: string;
  productQuantity: number;
  manufacturingTime: number;
  materials: MaterialRequirement[];
}

export interface ProductionPlan {
  id: string;
  name: string;
  description: string;
  targetProduct: {
    typeId: number;
    typeName: string;
    quantity: number;
  };
  blueprint: {
    typeId: number;
    typeName: string;
    me: number;
    te: number;
    runs: number;
  };
  materials: MaterialRequirement[];
  estimatedCost: number;
  estimatedProfit: number;
  estimatedTime: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'planning' | 'approved' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdDate: string;
  assignedTo?: string;
  startDate?: string;
  completionDate?: string;
}

export interface MaterialRequirement {
  typeId: number;
  typeName: string;
  quantity: number;
  quantityAvailable: number;
  quantityNeeded: number;
  estimatedCost: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  source: 'inventory' | 'market' | 'manufacturing' | 'mining';
}

// Income tracking types
export interface IncomeRecord {
  id: string;
  date: string;
  pilotId: number;
  pilotName: string;
  activityType: 'manufacturing' | 'mining' | 'research' | 'invention' | 'reactions';
  jobId?: number;
  itemTypeId: number;
  itemTypeName: string;
  quantity: number;
  hoursWorked: number;
  ratePerHour: number;
  totalEarned: number;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  approvedDate?: string;
  paidDate?: string;
  notes?: string;
}

export interface IncomeAnalytics {
  totalEarned: number;
  totalHours: number;
  averageRate: number;
  topEarners: Array<{
    pilotName: string;
    totalEarned: number;
    hoursWorked: number;
  }>;
  activityBreakdown: Array<{
    activityType: string;
    totalEarned: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    totalEarned: number;
    totalHours: number;
  }>;
}

// Corporation settings types
export interface CorpSettings {
  corpName: string;
  corpTicker: string;
  timezone: string;
  currency: string;
  notifications: {
    manufacturing: boolean;
    mining: boolean;
    killmails: boolean;
    markets: boolean;
  };
  eveOnlineSync: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number;
    lastSync: string;
    characterId: number;
    corporationId: number;
  };
  dataSyncTimers: {
    members: number;
    assets: number;
    manufacturing: number;
    mining: number;
    market: number;
    killmails: number;
    income: number;
  };
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    connectionPoolSize: number;
    connectionTimeout: number;
    queryTimeout: number;
  };
  incomeRates: {
    manufacturing: number;
    mining: number;
    research: number;
    invention: number;
    reactions: number;
  };
}