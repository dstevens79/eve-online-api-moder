/**
 * 
 * 

 * using the useKV hooks and provides a unified interface for data operations.
 */

import { useKV } from '@github/spark/hooks';

}
export interface Da
  port: number;
  username: string;
  ssl: boolean;
  queryTimeout: number;
  charset: string;
  sudoHost: string;
  sudoUsername: string;
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
}

export interface ESISettings {
  clientId: string;
export interface SyncSe
  callbackUrl: string;
  userAgent: string;
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
    manufacturing: boolean;
    markets: boolean;
    structureEvents: boolean;
    incomeUpdates: boolean;
 

    smtpPassword: string;
    fromEmail: stri
  webhookUrl: string
    enabled: boole
    endTime: string
  };

  enabled: boolean;
    mining: number;
    invention: number;
    research: numbe
  };
    
  };
    currency: 'ISK' 
    paymentSchedule
}
export interface Ma
  username: string;
  characterName: strin
  corporationId: nu
  permissions: string[]
  la

  version: string;
  lastStartup: strin
    manufacturing: boolean
    market: boolean
  };
    totalApiCalls: num
    
  maintenance: 
    cleanupSchedule: 
  };

export const defaultG
  se
 

  maxLogRetentionDays: 30,

  host: 'loca
  database: 'lmeve'
  password: '',
  connectionPoolSize:
  au
  sudoHost:
  sudoUsername: 'root',
};
export const default
  clientSecret: '',
  userAgent: 'LMeve Corpora
    'esi-corporations.read_co
    'esi-markets.read_corpor
  ],
  ma
};
export const defaultS
  lastUpdateCheck: ''
  autoUpdate: false,
  downloadUrl: 'https://w
  cleanupAfterUpdate: tr

  en
  syncIntervals: {
    members: 30
    mining: 30,
    killmails: 120,
    wallets: 180,
  lastSyncTimes: {
    
 

    structures: '',
  batchSizes: {
    members: 100
    mining: 100,
    killmails: 25,
  quietHours: {
    startTime: '22:0
    timezone: 'UTC',
};
expo
  channels: {
    inApp: true,
  },
    
    mining: false,
    memberChanges: true,
    assetMovements: false,
  },
    
 

  },
  quietHours:
    startTime: '22:
    timezone: 'UTC',
};
export const defaultIncome
  hourlyRates: {
    manufacturing: 2
    copying: 20000000,  
    reaction: 400000
  bonusRates: {
 

    minimumPayout: 100000000, // 1
  },

  version: '2.0.0',
  lastStartup
    manufacturing: true,
    market: true,
  },
    totalApiCalls: 0,
    
  maintenanc
    cleanupSchedule: '0 1 
  },

expo
export const use
export const useSyncSett
export const useIncomeSettin
export const useApplicati
// U
 

    sde: await spar
    notifications: await spark.kv.get<NotificationSettin
    users: await spark.kv.get<ManualUser[]>
  };
  return {
    exportDate: new Dat
  };

  if (!importData.s
  }
};

  if (settings.esi) await spark.kv.set('lmeve-settings-esi
  if (settings.sync)
  if (setting
  if (settings.appli

export const re
  await spark
  await spark.kv.set('lme
  await spark.kv.set('
  await spark.kv.set('
};
// Backup to downloadabl
  const backup = 
  
  link.href = URL.c
  

export const defaultESISettings: ESISettings = {
  clientId: '',
  clientSecret: '',
  callbackUrl: `${window.location.origin}/auth/callback`,
  userAgent: 'LMeve Corporation Management Tool',
  scopes: [
    'esi-corporations.read_corporation_membership.v1',
    'esi-industry.read_corporation_jobs.v1',
    'esi-markets.read_corporation_orders.v1',
    'esi-universe.read_structures.v1',
  ],
  rateLimitBuffer: 50,
  maxRetries: 3,
  requestTimeout: 10000,
};

export const defaultSDESettings: SDESettings = {
  currentVersion: '',
  lastUpdateCheck: '',
  lastUpdateDate: '',
  autoUpdate: false,
  updateSchedule: '0 2 * * 0', // Weekly at 2 AM on Sunday
  downloadUrl: 'https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2',
  backupBeforeUpdate: true,
  cleanupAfterUpdate: true,
};

export const defaultSyncSettings: SyncSettings = {
  enabled: true,
  autoSync: true,
  syncIntervals: {
    assets: 60,
    members: 30,
    manufacturing: 15,
    mining: 30,
    market: 45,
    killmails: 120,
    income: 60,
    wallets: 180,
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
  },
  batchSizes: {
    assets: 500,
    members: 100,
    manufacturing: 50,
    mining: 100,
    market: 200,
    killmails: 25,
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    timezone: 'UTC',
  },
};

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  channels: {
    email: false,
    inApp: true,
    webhook: false,
  },
  events: {
    syncErrors: true,
    manufacturing: true,
    mining: false,
    markets: false,
    memberChanges: true,
    structureEvents: false,
    assetMovements: false,
    incomeUpdates: false,
  },
  emailSettings: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: '',
  },
  webhookUrl: '',
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    timezone: 'UTC',
  },
};

export const defaultIncomeSettings: IncomeSettings = {
  enabled: true,
  hourlyRates: {
    mining: 30000000,        // 30M ISK/hour
    manufacturing: 25000000, // 25M ISK/hour
    invention: 35000000,     // 35M ISK/hour
    copying: 20000000,       // 20M ISK/hour
    research: 30000000,      // 30M ISK/hour
    reaction: 40000000,      // 40M ISK/hour
  },
  bonusRates: {
    weekendMultiplier: 1.2,
    holidayMultiplier: 1.5,
  },
  paymentSettings: {
    currency: 'ISK',
    minimumPayout: 100000000, // 100M ISK
    paymentSchedule: 'weekly',
  },
};

export const defaultApplicationData: ApplicationData = {
  version: '2.0.0',
  installDate: new Date().toISOString(),
  lastStartup: new Date().toISOString(),
  features: {
    manufacturing: true,
    mining: true,
    market: true,
    structures: true,
  },
  metrics: {
    totalApiCalls: 0,
    averageResponseTime: 0,
    errorRate: 0,
  },
  maintenance: {
    autoBackup: true,
    cleanupSchedule: '0 1 * * *', // Daily at 1 AM
    logRotation: true,
  },
};

// Hook exports for React components
export const useGeneralSettings = () => useKV<GeneralSettings>('lmeve-settings-general', defaultGeneralSettings);
export const useDatabaseSettings = () => useKV<DatabaseSettings>('lmeve-settings-database', defaultDatabaseSettings);
export const useESISettings = () => useKV<ESISettings>('lmeve-settings-esi', defaultESISettings);
export const useSDESettings = () => useKV<SDESettings>('lmeve-settings-sde', defaultSDESettings);
export const useSyncSettings = () => useKV<SyncSettings>('lmeve-settings-sync', defaultSyncSettings);
export const useNotificationSettings = () => useKV<NotificationSettings>('lmeve-settings-notifications', defaultNotificationSettings);
export const useIncomeSettings = () => useKV<IncomeSettings>('lmeve-settings-income', defaultIncomeSettings);
export const useManualUsers = () => useKV<ManualUser[]>('lmeve-manual-users', []);
export const useApplicationData = () => useKV<ApplicationData>('lmeve-application-data', defaultApplicationData);

// Utility functions for data export/import
export const exportAllSettings = async () => {
  const settings = {
    general: await spark.kv.get<GeneralSettings>('lmeve-settings-general'),
    database: await spark.kv.get<DatabaseSettings>('lmeve-settings-database'),
    esi: await spark.kv.get<ESISettings>('lmeve-settings-esi'),
    sde: await spark.kv.get<SDESettings>('lmeve-settings-sde'),
    sync: await spark.kv.get<SyncSettings>('lmeve-settings-sync'),
    notifications: await spark.kv.get<NotificationSettings>('lmeve-settings-notifications'),
    income: await spark.kv.get<IncomeSettings>('lmeve-settings-income'),
    users: await spark.kv.get<ManualUser[]>('lmeve-manual-users'),
    application: await spark.kv.get<ApplicationData>('lmeve-application-data'),
  };

  return {
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    settings,
  };
};

export const importAllSettings = async (importData: any) => {
  if (!importData.settings) {
    throw new Error('Invalid import data format');
  }

  const { settings } = importData;

  if (settings.general) await spark.kv.set('lmeve-settings-general', settings.general);
  if (settings.database) await spark.kv.set('lmeve-settings-database', settings.database);
  if (settings.esi) await spark.kv.set('lmeve-settings-esi', settings.esi);
  if (settings.sde) await spark.kv.set('lmeve-settings-sde', settings.sde);
  if (settings.sync) await spark.kv.set('lmeve-settings-sync', settings.sync);
  if (settings.notifications) await spark.kv.set('lmeve-settings-notifications', settings.notifications);
  if (settings.income) await spark.kv.set('lmeve-settings-income', settings.income);
  if (settings.users) await spark.kv.set('lmeve-manual-users', settings.users);
  if (settings.application) await spark.kv.set('lmeve-application-data', settings.application);
};

// Reset all settings to defaults
export const resetAllSettings = async () => {
  await spark.kv.set('lmeve-settings-general', defaultGeneralSettings);
  await spark.kv.set('lmeve-settings-database', defaultDatabaseSettings);
  await spark.kv.set('lmeve-settings-esi', defaultESISettings);
  await spark.kv.set('lmeve-settings-sde', defaultSDESettings);
  await spark.kv.set('lmeve-settings-sync', defaultSyncSettings);
  await spark.kv.set('lmeve-settings-notifications', defaultNotificationSettings);
  await spark.kv.set('lmeve-settings-income', defaultIncomeSettings);
  await spark.kv.set('lmeve-manual-users', []);
  // Don't reset application data as it contains version info
};

// Backup to downloadable file
export const backupSettings = async () => {
  const backup = await exportAllSettings();
  const dataBlob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `lmeve-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Configuration validation
export const validateSettings = (category: string, settings: any): string[] => {
  const errors: string[] = [];
  
  switch (category) {

      if (!settings.host) errors.push('Database host is required');
      if (!settings.database) errors.push('Database name is required');
      if (!settings.username) errors.push('Database username is required');

    case 'esi':
      if (!settings.clientId) errors.push('ESI Client ID is required');
      if (!settings.clientSecret) errors.push('ESI Client Secret is required');
      break;
    case 'notifications':
      if (settings.channels.email && !settings.emailSettings.smtpHost) {
        errors.push('SMTP host is required for email notifications');

      if (settings.channels.webhook && !settings.webhookUrl) {
        errors.push('Webhook URL is required for webhook notifications');
      }

    case 'income':
      Object.entries(settings.hourlyRates).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0) {
          errors.push(`Invalid hourly rate for ${key}`);
        }
      });
      break;
  }


};