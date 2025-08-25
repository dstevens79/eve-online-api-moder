/**
 * Comprehensive Data Persistence Service for LMeve
 * 
 * This service manages all persistent data storage across the application
 * using the useKV hooks and provides a unified interface for data operations.
 */

import { useKV } from '@github/spark/hooks';

// Type definitions for all persistent data structures
export interface GeneralSettings {
  corpName: string;
  corpTicker: string;
  corpId: number;
  timezone: string;
  language: string;
  sessionTimeout: boolean;
  sessionTimeoutMinutes: number;
  maintenanceMode: boolean;
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxLogRetentionDays: number;
}

export interface DatabaseSettings {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionPoolSize: number;
  queryTimeout: number;
  autoReconnect: boolean;
  charset: string;
  // Sudo database settings for admin operations
  sudoHost: string;
  sudoPort: number;
  sudoUsername: string;
  sudoPassword: string;
  sudoSsl: boolean;
}

export interface ESISettings {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  userAgent: string;
  baseUrl: string;
  scopes: string[];
  rateLimitBuffer: number;
  maxRetries: number;
  requestTimeout: number;
}

export interface SDESettings {
  currentVersion: string;
  lastUpdateCheck: string;
  lastUpdateDate: string;
  autoUpdate: boolean;
  updateSchedule: string; // cron format
  downloadUrl: string;
  extractPath: string;
  backupBeforeUpdate: boolean;
  cleanupAfterUpdate: boolean;
}

export interface SyncSettings {
  enabled: boolean;
  autoSync: boolean;
  syncIntervals: {
    members: number;
    assets: number;
    manufacturing: number;
    mining: number;
    market: number;
    killmails: number;
    income: number;
    structures: number;
    wallets: number;
  };
  lastSyncTimes: {
    members: string;
    assets: string;
    manufacturing: string;
    mining: string;
    market: string;
    killmails: string;
    income: string;
    structures: string;
    wallets: string;
  };
  batchSizes: {
    members: number;
    assets: number;
    manufacturing: number;
    mining: number;
    market: number;
    killmails: number;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  channels: {
    email: boolean;
    inApp: boolean;
    webhook: boolean;
  };
  events: {
    manufacturing: boolean;
    mining: boolean;
    killmails: boolean;
    markets: boolean;
    memberChanges: boolean;
    structureEvents: boolean;
    assetMovements: boolean;
    incomeUpdates: boolean;
  };
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  webhookUrl: string;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

export interface ManualUser {
  id: string;
  username: string;
  passwordHash: string;
  characterName: string;
  corporationName: string;
  corporationId: number;
  roles: string[];
  permissions: string[];
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  loginAttempts: number;
  lockedUntil?: string;
  mustChangePassword: boolean;
  notes: string;
}

export interface CorporationData {
  id: number;
  name: string;
  ticker: string;
  esiTokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    scopes: string[];
  };
  isActive: boolean;
  registeredAt: string;
  lastSync: string;
  syncErrors: number;
  ceoCharacterId: number;
  ceoCharacterName: string;
  allianceId?: number;
  allianceName?: string;
  memberCount: number;
  taxRate: number;
}

export interface IncomeSettings {
  hourlyRates: {
    manufacturing: number;
    mining: number;
    research: number;
    copying: number;
    invention: number;
    reaction: number;
  };
  bonusRates: {
    weekendMultiplier: number;
    nightShiftMultiplier: number;
    holidayMultiplier: number;
  };
  paymentSettings: {
    currency: 'ISK' | 'USD' | 'EUR';
    paymentSchedule: 'daily' | 'weekly' | 'monthly';
    minimumPayout: number;
    taxRate: number;
  };
  categories: {
    id: string;
    name: string;
    baseRate: number;
    multiplier: number;
    isActive: boolean;
  }[];
}

export interface ApplicationData {
  // Global application state
  version: string;
  installedAt: string;
  lastStartup: string;
  startupCount: number;
  
  // Feature flags
  features: {
    manufacturing: boolean;
    mining: boolean;
    killmails: boolean;
    market: boolean;
    income: boolean;
    structures: boolean;
    assets: boolean;
    members: boolean;
  };
  
  // Performance metrics
  metrics: {
    totalLogins: number;
    totalApiCalls: number;
    totalDataSynced: number;
    averageResponseTime: number;
    errorCount: number;
    lastErrorAt?: string;
  };
  
  // Maintenance info
  maintenance: {
    nextScheduled?: string;
    lastCompleted?: string;
    autoBackup: boolean;
    backupSchedule: string;
    cleanupSchedule: string;
  };
}

// Default values for all settings
export const DEFAULT_SETTINGS = {
  general: {
    corpName: 'Unknown Corporation',
    corpTicker: 'UNK',
    corpId: 0,
    timezone: 'UTC',
    language: 'en',
    sessionTimeout: true,
    sessionTimeoutMinutes: 30,
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info' as const,
    maxLogRetentionDays: 30,
  } as GeneralSettings,

  database: {
    host: 'localhost',
    port: 3306,
    database: 'lmeve',
    username: 'lmeve',
    password: '',
    ssl: false,
    connectionPoolSize: 10,
    queryTimeout: 30,
    autoReconnect: true,
    charset: 'utf8mb4',
    sudoHost: 'localhost',
    sudoPort: 3306,
    sudoUsername: 'root',
    sudoPassword: '',
    sudoSsl: false,
  } as DatabaseSettings,

  esi: {
    clientId: '',
    clientSecret: '',
    callbackUrl: '',
    userAgent: 'LMeve Corporation Management Tool',
    baseUrl: 'https://login.eveonline.com',
    scopes: [
      'esi-corporations.read_corporation_membership.v1',
      'esi-assets.read_corporation_assets.v1',
      'esi-industry.read_corporation_jobs.v1',
      'esi-killmails.read_corporation_killmails.v1',
      'esi-markets.read_corporation_orders.v1',
      'esi-wallet.read_corporation_wallets.v1',
      'esi-universe.read_structures.v1'
    ],
    rateLimitBuffer: 100,
    maxRetries: 3,
    requestTimeout: 30000,
  } as ESISettings,

  sde: {
    currentVersion: '',
    lastUpdateCheck: '',
    lastUpdateDate: '',
    autoUpdate: false,
    updateSchedule: '0 2 * * 1', // Weekly on Monday at 2 AM
    downloadUrl: 'https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2',
    extractPath: '/tmp/sde',
    backupBeforeUpdate: true,
    cleanupAfterUpdate: true,
  } as SDESettings,

  sync: {
    enabled: true,
    autoSync: false,
    syncIntervals: {
      members: 60,
      assets: 30,
      manufacturing: 15,
      mining: 45,
      market: 10,
      killmails: 120,
      income: 30,
      structures: 180,
      wallets: 60,
    },
    lastSyncTimes: {
      members: '',
      assets: '',
      manufacturing: '',
      mining: '',
      market: '',
      killmails: '',
      income: '',
      structures: '',
      wallets: '',
    },
    batchSizes: {
      members: 100,
      assets: 500,
      manufacturing: 50,
      mining: 100,
      market: 200,
      killmails: 25,
    },
  } as SyncSettings,

  notifications: {
    enabled: true,
    channels: {
      email: false,
      inApp: true,
      webhook: false,
    },
    events: {
      manufacturing: true,
      mining: true,
      killmails: false,
      markets: true,
      memberChanges: true,
      structureEvents: true,
      assetMovements: false,
      incomeUpdates: true,
    },
    emailSettings: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true,
      fromEmail: '',
      fromName: 'LMeve Corporation Management',
    },
    webhookUrl: '',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'UTC',
    },
  } as NotificationSettings,

  income: {
    hourlyRates: {
      manufacturing: 50000000, // 50M ISK/hour
      mining: 30000000,        // 30M ISK/hour
      research: 25000000,      // 25M ISK/hour
      copying: 20000000,       // 20M ISK/hour
      invention: 75000000,     // 75M ISK/hour
      reaction: 40000000,      // 40M ISK/hour
    },
    bonusRates: {
      weekendMultiplier: 1.5,
      nightShiftMultiplier: 1.2,
      holidayMultiplier: 2.0,
    },
    paymentSettings: {
      currency: 'ISK' as const,
      paymentSchedule: 'weekly' as const,
      minimumPayout: 100000000, // 100M ISK minimum
      taxRate: 0.1, // 10% tax
    },
    categories: [
      { id: '1', name: 'Manufacturing', baseRate: 50000000, multiplier: 1.0, isActive: true },
      { id: '2', name: 'Mining', baseRate: 30000000, multiplier: 1.0, isActive: true },
      { id: '3', name: 'Research', baseRate: 25000000, multiplier: 1.0, isActive: true },
      { id: '4', name: 'Copying', baseRate: 20000000, multiplier: 1.0, isActive: true },
      { id: '5', name: 'Invention', baseRate: 75000000, multiplier: 1.0, isActive: true },
      { id: '6', name: 'Reaction', baseRate: 40000000, multiplier: 1.0, isActive: true },
    ],
  } as IncomeSettings,

  application: {
    version: '2.0.0',
    installedAt: new Date().toISOString(),
    lastStartup: new Date().toISOString(),
    startupCount: 1,
    features: {
      manufacturing: true,
      mining: true,
      killmails: true,
      market: true,
      income: true,
      structures: true,
      assets: true,
      members: true,
    },
    metrics: {
      totalLogins: 0,
      totalApiCalls: 0,
      totalDataSynced: 0,
      averageResponseTime: 0,
      errorCount: 0,
    },
    maintenance: {
      autoBackup: true,
      backupSchedule: '0 3 * * *', // Daily at 3 AM
      cleanupSchedule: '0 4 * * 0', // Weekly on Sunday at 4 AM
    },
  } as ApplicationData,
};

// Hook factories for each settings category
export const useGeneralSettings = () => useKV<GeneralSettings>('lmeve-settings-general', DEFAULT_SETTINGS.general);
export const useDatabaseSettings = () => useKV<DatabaseSettings>('lmeve-settings-database', DEFAULT_SETTINGS.database);
export const useESISettings = () => useKV<ESISettings>('lmeve-settings-esi', DEFAULT_SETTINGS.esi);
export const useSDESettings = () => useKV<SDESettings>('lmeve-settings-sde', DEFAULT_SETTINGS.sde);
export const useSyncSettings = () => useKV<SyncSettings>('lmeve-settings-sync', DEFAULT_SETTINGS.sync);
export const useNotificationSettings = () => useKV<NotificationSettings>('lmeve-settings-notifications', DEFAULT_SETTINGS.notifications);
export const useIncomeSettings = () => useKV<IncomeSettings>('lmeve-settings-income', DEFAULT_SETTINGS.income);
export const useApplicationData = () => useKV<ApplicationData>('lmeve-application-data', DEFAULT_SETTINGS.application);

// Data collections
export const useManualUsers = () => useKV<ManualUser[]>('lmeve-manual-users', []);
export const useCorporationData = () => useKV<CorporationData[]>('lmeve-corporation-data', []);

// Static data exports for external use
export const exportAllSettings = async () => {
  const settings = {
    general: await spark.kv.get<GeneralSettings>('lmeve-settings-general'),
    database: await spark.kv.get<DatabaseSettings>('lmeve-settings-database'),
    esi: await spark.kv.get<ESISettings>('lmeve-settings-esi'),
    sde: await spark.kv.get<SDESettings>('lmeve-settings-sde'),
    sync: await spark.kv.get<SyncSettings>('lmeve-settings-sync'),
    notifications: await spark.kv.get<NotificationSettings>('lmeve-settings-notifications'),
    income: await spark.kv.get<IncomeSettings>('lmeve-settings-income'),
    application: await spark.kv.get<ApplicationData>('lmeve-application-data'),
    manualUsers: await spark.kv.get<ManualUser[]>('lmeve-manual-users'),
    corporationData: await spark.kv.get<CorporationData[]>('lmeve-corporation-data'),
  };

  return {
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
    settings,
  };
};

// Import all settings from backup
export const importAllSettings = async (data: any) => {
  if (!data || !data.settings) {
    throw new Error('Invalid backup data format');
  }

  const { settings } = data;

  // Import each settings category if present
  if (settings.general) await spark.kv.set('lmeve-settings-general', settings.general);
  if (settings.database) await spark.kv.set('lmeve-settings-database', settings.database);
  if (settings.esi) await spark.kv.set('lmeve-settings-esi', settings.esi);
  if (settings.sde) await spark.kv.set('lmeve-settings-sde', settings.sde);
  if (settings.sync) await spark.kv.set('lmeve-settings-sync', settings.sync);
  if (settings.notifications) await spark.kv.set('lmeve-settings-notifications', settings.notifications);
  if (settings.income) await spark.kv.set('lmeve-settings-income', settings.income);
  if (settings.application) await spark.kv.set('lmeve-application-data', settings.application);
  if (settings.manualUsers) await spark.kv.set('lmeve-manual-users', settings.manualUsers);
  if (settings.corporationData) await spark.kv.set('lmeve-corporation-data', settings.corporationData);

  return true;
};

// Reset all settings to defaults
export const resetAllSettings = async () => {
  await spark.kv.set('lmeve-settings-general', DEFAULT_SETTINGS.general);
  await spark.kv.set('lmeve-settings-database', DEFAULT_SETTINGS.database);
  await spark.kv.set('lmeve-settings-esi', DEFAULT_SETTINGS.esi);
  await spark.kv.set('lmeve-settings-sde', DEFAULT_SETTINGS.sde);
  await spark.kv.set('lmeve-settings-sync', DEFAULT_SETTINGS.sync);
  await spark.kv.set('lmeve-settings-notifications', DEFAULT_SETTINGS.notifications);
  await spark.kv.set('lmeve-settings-income', DEFAULT_SETTINGS.income);
  
  // Don't reset application data and user data on reset
  return true;
};

// Backup to downloadable file
export const downloadBackup = async () => {
  const backup = await exportAllSettings();
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lmeve-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return true;
};

// Configuration validation
export const validateSettings = (category: keyof typeof DEFAULT_SETTINGS, settings: any): string[] => {
  const errors: string[] = [];

  switch (category) {
    case 'database':
      if (!settings.host) errors.push('Database host is required');
      if (!settings.username) errors.push('Database username is required');
      if (!settings.database) errors.push('Database name is required');
      if (settings.port < 1 || settings.port > 65535) errors.push('Port must be between 1 and 65535');
      break;

    case 'esi':
      if (!settings.clientId) errors.push('ESI Client ID is required');
      if (!settings.clientSecret) errors.push('ESI Client Secret is required');
      if (!settings.callbackUrl) errors.push('Callback URL is required');
      break;

    case 'notifications':
      if (settings.channels.email && !settings.emailSettings.smtpHost) {
        errors.push('SMTP host is required for email notifications');
      }
      if (settings.channels.webhook && !settings.webhookUrl) {
        errors.push('Webhook URL is required for webhook notifications');
      }
      break;

    case 'income':
      Object.entries(settings.hourlyRates).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0) {
          errors.push(`Invalid hourly rate for ${key}`);
        }
      });
      break;
  }

  return errors;
};