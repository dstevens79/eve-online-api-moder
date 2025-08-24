import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gear, 
  Key, 
  Bell, 
  Shield, 
  Database,
  Globe,
  Users,
  Clock,
  Download,
  Upload,
  CheckCircle,
  Warning,
  X,
  Rocket,
  ArrowClockwise,
  LinkSimple,
  Eye,
  EyeSlash,
  Copy,
  Package,
  Factory,
  HardHat,
  TrendUp,
  Crosshair,
  CurrencyDollar,
  List,
  Play,
  Stop,
  Info,
  CloudArrowDown,
  Archive,
  UserCheck,
  Building,
  Wrench,
  Terminal,
  FileText
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useCorporationAuth, type ESIConfig } from '@/lib/corp-auth';
import { CorpSettings } from '@/lib/types';
import { toast } from 'sonner';
import { eveApi, type CharacterInfo, type CorporationInfo } from '@/lib/eveApi';
import { DatabaseManager, DatabaseConfig, DatabaseStatus, defaultDatabaseConfig, TableInfo, DatabaseSetupManager, DatabaseSetupConfig, DatabaseSetupProgress, generateSetupCommands } from '@/lib/database';
import { useSDEManager, type SDEDatabaseStats } from '@/lib/sdeService';
import { AdminLoginTest } from '@/components/AdminLoginTest';
import { SimpleLoginTest } from '@/components/SimpleLoginTest';
import { DatabaseConnectionTest } from '@/components/DatabaseConnectionTest';
import { runDatabaseValidationTests } from '@/lib/databaseTestCases';

interface SyncStatus {
  isRunning: boolean;
  progress: number;
  stage: string;
  error?: string;
}

interface ESIOAuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  characterId?: number;
  characterName?: string;
  corporationId?: number;
}

interface SettingsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Settings({ activeTab, onTabChange }: SettingsProps) {
  const { 
    user, 
    updateAdminConfig, 
    adminConfig, 
    esiConfig, 
    updateESIConfig, 
    registeredCorps 
  } = useCorporationAuth();
  const { sdeStatus, checkForUpdates, downloadSDE, updateDatabase, getDatabaseStats } = useSDEManager();
  const [settings, setSettings] = useKV<CorpSettings>('corp-settings', {
    corpName: user?.corporationName || 'Test Alliance Please Ignore',
    corpTicker: 'TEST',
    corpId: user?.corporationId || 498125261,
    timezone: 'UTC',
    language: 'en',
    notifications: {
      manufacturing: true,
      mining: true,
      killmails: false,
      markets: true,
    },
    eveOnlineSync: {
      enabled: true,
      autoSync: false,
      syncInterval: 30,
      lastSync: new Date().toISOString(),
      characterId: 91316135,
      corporationId: 498125261
    },
    dataSyncTimers: {
      members: 60,
      assets: 30,
      manufacturing: 15,
      mining: 45,
      market: 10,
      killmails: 120,
      income: 30
    },
    database: {
      host: 'localhost',
      port: 3306,
      database: 'lmeve',
      username: 'lmeve_user',
      password: '',
      ssl: false,
      connectionPoolSize: 10,
      queryTimeout: 30,
      autoReconnect: true,
      charset: 'utf8mb4'
    }
  });

  const [esiConfigLocal, setESIConfigLocal] = useKV<any>('esi-config-legacy', {
    clientId: '',
    secretKey: '',
    baseUrl: 'https://login.eveonline.com',
    userAgent: 'LMeve Corporation Management Tool'
  });

  const [oauthState, setOAuthState] = useKV<ESIOAuthState>('esi-oauth', {
    isAuthenticated: false
  });

  const [showSecrets, setShowSecrets] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    progress: 0,
    stage: 'Idle'
  });
  const [corpInfo, setCorporationInfo] = useState<CorporationInfo | null>(null);
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo | null>(null);
  
  // Database state
  const [dbManager, setDbManager] = useState<DatabaseManager | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    connectionCount: 0,
    queryCount: 0,
    avgQueryTime: 0,
    uptime: 0
  });
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([]);
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [sdeStats, setSDEStats] = useState<SDEDatabaseStats | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [showConnectionLogs, setShowConnectionLogs] = useState(true); // Show logs by default for debugging
  
  // Database setup state
  const [setupManager, setSetupManager] = useState<DatabaseSetupManager | null>(null);
  const [setupProgress, setSetupProgress] = useState<DatabaseSetupProgress>({
    currentStep: 0,
    totalSteps: 0,
    steps: [],
    isRunning: false,
    completed: false,
    progress: 0,
    currentStage: 'Ready'
  });
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupConfig, setSetupConfig] = useState<DatabaseSetupConfig>({
    lmevePassword: '',
    allowedHosts: '%',
    downloadSDE: true,
    createDatabases: true,
    importSchema: true,
    createUser: true,
    grantPrivileges: true,
    validateSetup: true
  });
  const [showSetupCommands, setShowSetupCommands] = useState(false);
  
  // Admin configuration state
  const [tempAdminConfig, setTempAdminConfig] = useState(adminConfig);

  // Ensure safe access to settings
  const eveOnlineSync = settings?.eveOnlineSync || {
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    lastSync: new Date().toISOString(),
    characterId: 91316135,
    corporationId: 498125261
  };

  // Initialize database manager when settings change
  useEffect(() => {
    if (settings?.database) {
      const manager = new DatabaseManager(settings.database);
      setDbManager(manager);
      setDbStatus(manager.getStatus());
    }
  }, [settings?.database]);

  // Helper function to add connection logs without duplicate timestamps
  const addConnectionLog = (message: string) => {
    setConnectionLogs(prev => [...prev, message].slice(-50)); // Keep last 50 logs
    console.log(message);
  };

  // Clear connection logs
  const clearConnectionLogs = () => {
    setConnectionLogs([]);
    const timestamp = new Date().toLocaleTimeString();
    addConnectionLog(`[${timestamp}] Connection logs cleared`);
  };

  // Database functions with proper logging and click handling
  const handleTestDbConnection = async () => {
    console.log('🧪 Test connection button clicked');
    
    if (!settings.database) {
      const error = 'Please configure database connection settings first';
      toast.error(error);
      addConnectionLog(`❌ Test failed: ${error}`);
      return;
    }
    
    // Clear previous logs to prevent timestamp spam
    setConnectionLogs([]);
    
    const timestamp = new Date().toLocaleTimeString();
    addConnectionLog(`🔍 [${timestamp}] Starting database connection test...`);
    addConnectionLog(`📍 Target: ${settings.database.username}@${settings.database.host}:${settings.database.port}/${settings.database.database}`);
    
    setTestingConnection(true);
    
    try {
      // Create a temporary database manager for testing
      const tempManager = new DatabaseManager(settings.database);
      
      // Intercept console.log calls from the database manager
      const originalConsoleLog = console.log;
      console.log = (...args: any[]) => {
        const message = args.join(' ');
        // Only capture database-related logs, not all console output
        if (message.includes('🔍') || message.includes('🌐') || message.includes('🔌') || 
            message.includes('🔐') || message.includes('🗄️') || message.includes('🔑') || 
            message.includes('✅') || message.includes('❌') || message.includes('⚠️')) {
          const logTimestamp = new Date().toLocaleTimeString();
          addConnectionLog(`[${logTimestamp}] ${message}`);
        }
        originalConsoleLog(...args);
      };
      
      const result = await tempManager.testConnection();
      
      // Restore original console.log
      console.log = originalConsoleLog;
      
      const finalTimestamp = new Date().toLocaleTimeString();
      
      if (result.success && result.validated) {
        const successMsg = `✅ [${finalTimestamp}] Database connection validated successfully! Latency: ${result.latency}ms`;
        toast.success('Database connection test passed!');
        addConnectionLog(successMsg);
        setDbStatus(prev => ({ ...prev, lastError: undefined }));
      } else if (result.success && !result.validated) {
        const warningMsg = `⚠️ [${finalTimestamp}] Connection established but validation incomplete. Latency: ${result.latency}ms`;
        toast.warning('Database connection partially successful');
        addConnectionLog(warningMsg);
      } else {
        const errorMsg = `❌ [${finalTimestamp}] Database connection failed: ${result.error}`;
        toast.error('Database connection test failed!');
        addConnectionLog(errorMsg);
        setDbStatus(prev => ({ ...prev, lastError: result.error }));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown connection error';
      const finalTimestamp = new Date().toLocaleTimeString();
      const fullErrorMsg = `❌ [${finalTimestamp}] Database connection test failed: ${errorMsg}`;
      toast.error('Database connection test failed!');
      addConnectionLog(fullErrorMsg);
      setDbStatus(prev => ({ ...prev, lastError: errorMsg }));
    } finally {
      const endTimestamp = new Date().toLocaleTimeString();
      addConnectionLog(`🏁 [${endTimestamp}] Connection test completed`);
      setTestingConnection(false);
    }
  };

  const handleConnectDb = async () => {
    if (!settings.database) {
      const error = 'Please configure database connection settings first';
      toast.error(error);
      addConnectionLog(`❌ Connect failed: ${error}`);
      return;
    }
    
    addConnectionLog(`🔗 Establishing database connection...`);
    addConnectionLog(`📍 Target: ${settings.database.username}@${settings.database.host}:${settings.database.port}/${settings.database.database}`);
    
    // Create the database manager if it doesn't exist
    let manager = dbManager;
    if (!manager) {
      manager = new DatabaseManager(settings.database);
      setDbManager(manager);
    }
    
    const result = await manager.connect();
    setDbStatus(manager.getStatus());
    
    if (result.success) {
      const successMsg = '✅ Database connection established successfully';
      toast.success(successMsg);
      addConnectionLog(successMsg);
      loadTableInfo();
    } else {
      const errorMsg = `❌ Database connection failed: ${result.error}`;
      toast.error(errorMsg);
      addConnectionLog(errorMsg);
    }
  };

  const handleDisconnectDb = async () => {
    if (!dbManager) return;
    
    addConnectionLog('🔌 Disconnecting from database...');
    await dbManager.disconnect();
    setDbStatus(dbManager.getStatus());
    setTableInfo([]);
    const successMsg = 'Disconnected from database';
    toast.success(successMsg);
    addConnectionLog(`✅ ${successMsg}`);
  };

  const loadTableInfo = async () => {
    if (!dbManager) return;
    
    try {
      const tables = await dbManager.getTableInfo();
      setTableInfo(tables);
    } catch (error) {
      console.error('Failed to load table info:', error);
    }
  };

  const updateDatabaseConfig = (field: keyof DatabaseConfig, value: any) => {
    setSettings(current => {
      if (!current) return current;
      return {
        ...current,
        database: {
          ...current.database,
          [field]: value
        }
      };
    });
  };

  // Database setup handlers
  const handleRunDatabaseSetup = async () => {
    if (!setupConfig.lmevePassword) {
      toast.error('Please enter a password for the lmeve database user');
      return;
    }

    try {
      const manager = new DatabaseSetupManager(setupConfig, (progress) => {
        setSetupProgress(progress);
      });
      
      setSetupManager(manager);
      setSetupProgress(manager.getProgress());
      
      await manager.runSetup();
      
      toast.success('Database setup completed successfully!');
    } catch (error) {
      console.error('Database setup failed:', error);
      toast.error('Database setup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleShowSetupCommands = () => {
    setShowSetupCommands(true);
  };

  // ESI scopes required for LMeve functionality
  const ESI_SCOPES = [
    'esi-corporations.read_corporation_membership.v1',
    'esi-industry.read_corporation_jobs.v1', 
    'esi-assets.read_corporation_assets.v1',
    'esi-corporations.read_blueprints.v1',
    'esi-markets.read_corporation_orders.v1',
    'esi-wallet.read_corporation_wallets.v1',
    'esi-killmails.read_corporation_killmails.v1',
    'esi-contracts.read_corporation_contracts.v1'
  ];

  // Generate OAuth authorization URL
  const generateAuthUrl = () => {
    const state = Math.random().toString(36).substring(2, 15);
    const scopes = ESI_SCOPES.join(' ');
    
    const authUrl = `https://login.eveonline.com/v2/oauth/authorize/?` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
      `client_id=${esiConfig?.clientId || ''}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state}`;
    
    return authUrl;
  };

  const handleESIOAuth = () => {
    if (!esiConfig?.clientId) {
      toast.error('Please configure your ESI Client ID first');
      return;
    }
    
    const authUrl = generateAuthUrl();
    window.open(authUrl, '_blank', 'width=600,height=700');
    toast.info('Complete authorization in the opened window');
  };

  const handleCopyAuthUrl = () => {
    const authUrl = generateAuthUrl();
    navigator.clipboard.writeText(authUrl);
    toast.success('Authorization URL copied to clipboard');
  };

  const handleRevokeESI = () => {
    setOAuthState({
      isAuthenticated: false
    });
    toast.success('ESI authorization revoked');
  };

  const handleSaveESIConfig = () => {
    updateESIConfig(esiConfig);
    toast.success('ESI configuration saved');
  };

  const getScopeDescription = (scope: string): string => {
    const descriptions: Record<string, string> = {
      'esi-corporations.read_corporation_membership.v1': 'Read corporation member list',
      'esi-industry.read_corporation_jobs.v1': 'Read corporation manufacturing jobs',
      'esi-assets.read_corporation_assets.v1': 'Read corporation assets',
      'esi-universe.read_structures.v1': 'Read structure information',
      'esi-corporations.read_structures.v1': 'Read corporation-owned structures'
    };
    return descriptions[scope] || 'EVE Online API access scope';
  };

  // Load corporation and character info on mount
  useEffect(() => {
    const loadEVEData = async () => {
      if (eveOnlineSync.corporationId) {
        try {
          const corp = await eveApi.getCorporation(eveOnlineSync.corporationId);
          setCorporationInfo(corp);
        } catch (error) {
          console.error('Failed to load corporation info:', error);
        }
      }

      if (eveOnlineSync.characterId) {
        try {
          const char = await eveApi.getCharacter(eveOnlineSync.characterId);
          setCharacterInfo(char);
        } catch (error) {
          console.error('Failed to load character info:', error);
        }
      }
    };

    if (eveOnlineSync.enabled) {
      loadEVEData();
    }
  }, [eveOnlineSync.enabled, eveOnlineSync.corporationId, eveOnlineSync.characterId]);

  // Load SDE stats when component mounts
  useEffect(() => {
    const loadSDEStats = async () => {
      if (sdeStatus.isInstalled) {
        const stats = await getDatabaseStats();
        setSDEStats(stats);
      }
    };
    
    loadSDEStats();
  }, [sdeStatus.isInstalled, getDatabaseStats]);

  // Check for SDE updates on mount
  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  // Create/update database manager when database config changes
  useEffect(() => {
    if (settings.database) {
      const manager = new DatabaseManager(settings.database);
      setDbManager(manager);
    }
  }, [settings.database]);

  const handleSyncData = async () => {
    if (syncStatus.isRunning) return;

    setSyncStatus({
      isRunning: true,
      progress: 0,
      stage: 'Initializing...'
    });

    try {
      // Simulate sync process with multiple stages
      const stages = [
        'Connecting to EVE Online API...',
        'Fetching corporation data...',
        'Updating member information...',
        'Syncing industry jobs...',
        'Updating asset database...',
        'Calculating market prices...',
        'Finalizing data...'
      ];

      for (let i = 0; i < stages.length; i++) {
        setSyncStatus({
          isRunning: true,
          progress: ((i + 1) / stages.length) * 100,
          stage: stages[i]
        });

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate some actual API calls
        if (i === 1 && eveOnlineSync.corporationId) {
          try {
            const corp = await eveApi.getCorporation(eveOnlineSync.corporationId);
            setCorporationInfo(corp);
            
            // Update settings with fetched data
            setSettings(current => ({
              ...current,
              corpName: corp.name,
              corpTicker: corp.ticker
            }));
          } catch (error) {
            console.error('Failed to sync corporation data:', error);
          }
        }
      }

      // Update last sync time
      setSettings(current => ({
        ...current,
        eveOnlineSync: {
          ...current.eveOnlineSync,
          lastSync: new Date().toISOString()
        }
      }));

      setSyncStatus({
        isRunning: false,
        progress: 100,
        stage: 'Sync completed successfully!'
      });

      toast.success('EVE Online data synchronized successfully');
      
      // Reset status after a short delay
      setTimeout(() => {
        setSyncStatus({
          isRunning: false,
          progress: 0,
          stage: 'Idle'
        });
      }, 3000);

    } catch (error) {
      setSyncStatus({
        isRunning: false,
        progress: 0,
        stage: 'Sync failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast.error('Failed to sync EVE Online data');
    }
  };

  const handleToggleAutoSync = () => {
    setSettings(current => ({
      ...current,
      eveOnlineSync: {
        ...current.eveOnlineSync,
        autoSync: !current.eveOnlineSync.autoSync
      }
    }));
  };

  const handleToggleEVESync = () => {
    setSettings(current => ({
      ...current,
      eveOnlineSync: {
        ...current.eveOnlineSync,
        enabled: !current.eveOnlineSync.enabled
      }
    }));
  };

  const handleSaveSettings = () => {
    setSettings(settings);
    toast.success('Settings saved successfully');
  };

  const handleSaveAdminConfig = () => {
    updateAdminConfig(tempAdminConfig);
    toast.success('Admin configuration updated');
  };

  // Enhanced database setup functions for one-click setup
  const handleStartSetup = async () => {
    if (!setupConfig.lmevePassword) {
      toast.error('Please enter a password for the lmeve database user');
      return;
    }

    if (setupConfig.lmevePassword.length < 8) {
      toast.error('Password must be at least 8 characters long for production use');
      return;
    }

    // Validate current database connection first
    if (!dbManager) {
      toast.error('Database manager not initialized. Please configure database connection first.');
      return;
    }

    const testResult = await dbManager.testConnection();
    if (!testResult.success) {
      toast.error(`Database connection failed: ${testResult.error}`);
      return;
    }

    const manager = new DatabaseSetupManager((progress) => {
      setSetupProgress(progress);
    });

    setSetupManager(manager);
    setSetupProgress(manager.getProgress());

    try {
      console.log('🚀 Starting complete database setup process');
      
      // Enhanced setup with all LMeve requirements
      const enhancedConfig: DatabaseSetupConfig = {
        ...setupConfig,
        mysqlRootPassword: setupConfig.mysqlRootPassword || '',
        createDatabases: true,
        downloadSDE: true,
        importSchema: true,
        createUser: true,
        grantPrivileges: true,
        validateSetup: true
      };

      const result = await manager.setupNewDatabase(enhancedConfig);
      
      if (result.success) {
        toast.success('Complete database setup completed successfully!');
        
        // Update database config with the new settings
        updateDatabaseConfig('username', 'lmeve');
        updateDatabaseConfig('password', setupConfig.lmevePassword);
        updateDatabaseConfig('database', 'lmeve');
        
        // Trigger SDE download and install as part of complete setup
        console.log('✅ Triggering SDE download as part of complete setup');
        await downloadSDE();
        
        setShowSetupWizard(false);
      } else {
        toast.error(`Complete setup failed: ${result.error}`);
        console.error('❌ Database setup failed:', result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Setup failed: ${errorMessage}`);
      console.error('❌ Setup failed with exception:', error);
    }
  };

  const handleGenerateCommands = () => {
    if (!setupConfig.lmevePassword) {
      toast.error('Please enter a password for the lmeve database user');
      return;
    }

    setShowSetupCommands(true);
  };

  const handleCopyCommands = () => {
    const commands = generateSetupCommands(setupConfig);
    navigator.clipboard.writeText(commands.join('\n'));
    toast.success('Setup commands copied to clipboard');
  };

  const handleNotificationToggle = (type: keyof typeof settings.notifications) => {
    setSettings(current => ({
      ...current,
      notifications: {
        ...current.notifications,
        [type]: !current.notifications[type]
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gear size={24} />
          Corporation Settings
        </h2>
        <p className="text-muted-foreground">
          Configure corporation management preferences and system settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
        <div className="hidden">
          {/* Hidden tabs list since navigation is handled by parent */}
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="eve">EVE Online</TabsTrigger>
            <TabsTrigger value="sde">EVE SDE</TabsTrigger>
            <TabsTrigger value="esi">ESI Config</TabsTrigger>
            <TabsTrigger value="sync">Data Sync</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Corporation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="corpName">Corporation Name</Label>
                  <Input
                    id="corpName"
                    value={settings.corpName}
                    onChange={(e) => setSettings(s => ({ ...s, corpName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corpTicker">Corporation Ticker</Label>
                  <Input
                    id="corpTicker"
                    value={settings.corpTicker}
                    onChange={(e) => setSettings(s => ({ ...s, corpTicker: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => setSettings(s => ({ ...s, timezone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={settings.language}
                    onChange={(e) => setSettings(s => ({ ...s, language: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} />
                Database Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-2">Database Setup:</p>
                <p>
                  LMeve requires a MySQL/MariaDB database to store corporation data. You can either 
                  set up a new database automatically or configure an existing one manually.
                </p>
              </div>

              {/* One-Button Complete Setup */}
              <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wrench size={20} className="text-green-400" />
                    <h4 className="font-medium">Complete Database Setup</h4>
                  </div>
                  <Button
                    onClick={handleStartSetup}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                    disabled={setupManager?.getProgress().isRunning}
                  >
                    {setupManager?.getProgress().isRunning ? (
                      <>
                        <ArrowClockwise size={16} className="mr-2 animate-spin" />
                        Setting Up...
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        One-Click Setup
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Complete automated setup:</strong> Creates databases, downloads EVE SDE data, 
                  imports schema, and configures everything in one step. Requires MySQL root access.
                </p>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="setup-password">LMeve Database Password</Label>
                    <Input
                      id="setup-password"
                      type="password"
                      placeholder="Enter secure password (8+ characters)"
                      value={setupConfig.lmevePassword}
                      onChange={(e) => setSetupConfig(prev => ({ ...prev, lmevePassword: e.target.value }))}
                      disabled={setupManager?.getProgress().isRunning}
                    />
                    <p className="text-xs text-muted-foreground">
                      This password will be used for the 'lmeve' database user
                    </p>
                  </div>
                  
                  {setupManager?.getProgress().isRunning && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{setupProgress.currentStage || 'Initializing...'}</span>
                        <span>{Math.round(setupProgress.progress)}%</span>
                      </div>
                      <Progress value={setupProgress.progress} className="h-2" />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateCommands}
                    disabled={setupManager?.getProgress().isRunning}
                  >
                    <Terminal size={16} className="mr-2" />
                    Manual Commands
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://github.com/dstevens79/lmeve', '_blank')}
                  >
                    <FileText size={16} className="mr-2" />
                    LMeve Guide
                  </Button>
                </div>
              </div>

              {/* Advanced Manual Setup */}
              <div className="border border-accent/20 rounded-lg p-4 bg-accent/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gear size={20} className="text-accent" />
                    <h4 className="font-medium">Manual Database Setup</h4>
                  </div>
                  <Button
                    onClick={() => setShowSetupWizard(true)}
                    className="bg-accent hover:bg-accent/90"
                    size="sm"
                  >
                    <Gear size={16} className="mr-2" />
                    Manual Setup
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  Configure an existing database or use custom setup parameters. 
                  Use this option if you need specific database configurations.
                </p>
              </div>

              {/* Database Validation Examples */}
              <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={20} className="text-blue-400" />
                  <h4 className="font-medium">Database Validation Guide</h4>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  The system validates database connections rigorously. Here are examples of valid and invalid configurations:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-green-400 mb-2">✅ Valid Configurations:</h5>
                    <div className="bg-background/50 border border-green-500/20 rounded p-3 text-sm font-mono space-y-2">
                      <div>Host: localhost, DB: lmeve, User: lmeve, Pass: [8+ chars]</div>
                      <div>Host: localhost, DB: lmeve_test, User: lmeve_user, Pass: [8+ chars]</div>
                      <div>Host: 127.0.0.1, DB: lmeve, User: root, Pass: [secure]</div>
                      <div>Host: db, DB: lmeve, User: lmeve, Pass: [docker]</div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-red-400 mb-2">❌ Invalid Configurations:</h5>
                    <div className="bg-background/50 border border-red-500/20 rounded p-3 text-sm font-mono space-y-2">
                      <div>User: baduser → "Access denied for user 'baduser'"</div>
                      <div>Pass: wrongpass → "Authentication failed"</div>
                      <div>DB: nonexistent_db → "Unknown database"</div>
                      <div>Host: invalid-host → "Host not found or connection refused"</div>
                      <div>DB: empty_db → "Missing required LMeve tables"</div>
                      <div>User: readonly → "Insufficient privileges for LMeve operations"</div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-orange-400 mb-2">⚠️ Common Issues:</h5>
                    <div className="bg-background/50 border border-orange-500/20 rounded p-3 text-sm space-y-1">
                      <div>• Port 3306/3307 must be accessible</div>
                      <div>• Database name must contain 'lmeve'</div>
                      <div>• User must have SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER privileges</div>
                      <div>• EVE SDE tables required for full functionality</div>
                      <div>• Production databases require 8+ character passwords</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Test Configurations */}
              <div className="border border-purple-500/20 rounded-lg p-4 bg-purple-500/5">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck size={20} className="text-purple-400" />
                  <h4 className="font-medium">Quick Test Configurations</h4>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  Use these buttons to quickly test different database scenarios:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSettings(current => ({
                        ...current,
                        database: {
                          ...current.database,
                          host: 'localhost',
                          port: 3306,
                          database: 'lmeve',
                          username: 'lmeve',
                          password: 'lmpassword'
                        }
                      }));
                      toast.info('Set valid local test configuration');
                    }}
                    className="justify-start text-green-400 border-green-500/30"
                  >
                    ✅ Valid Local Config
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSettings(current => ({
                        ...current,
                        database: {
                          ...current.database,
                          host: 'invalid-host-name-that-definitely-does-not-exist',
                          port: 3306,
                          database: 'nonexistent_db',
                          username: 'baduser',
                          password: 'wrongpass'
                        }
                      }));
                      toast.info('Set invalid test configuration');
                    }}
                    className="justify-start text-red-400 border-red-500/30"
                  >
                    ❌ Invalid Test Config
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSettings(current => ({
                        ...current,
                        database: {
                          ...current.database,
                          host: 'localhost',
                          port: 3306,
                          database: 'empty_db',
                          username: 'lmeve',
                          password: 'testpass123'
                        }
                      }));
                      toast.info('Set empty database test');
                    }}
                    className="justify-start text-orange-400 border-orange-500/30"
                  >
                    📭 Empty Database Test
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSettings(current => ({
                        ...current,
                        database: {
                          ...current.database,
                          host: 'timeout-host.local',
                          port: 3306,
                          database: 'lmeve',
                          username: 'lmeve',
                          password: 'lmpassword'
                        }
                      }));
                      toast.info('Set network error test');
                    }}
                    className="justify-start text-yellow-400 border-yellow-500/30"
                  >
                    🌐 Network Error Test
                  </Button>
                </div>
              </div>

              {/* Setup Wizard Modal */}
              {showSetupWizard && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Database Setup Wizard</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSetupWizard(false)}
                        disabled={setupProgress?.isRunning}
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    {!setupProgress?.isRunning ? (
                      <div className="space-y-4">
                        <Alert>
                          <Info size={16} />
                          <AlertDescription>
                            This wizard will create a new LMeve database and optionally download EVE SDE data. 
                            Make sure you have MySQL/MariaDB running and root access.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="setupPassword">Database Password for 'lmeve' user</Label>
                            <Input
                              id="setupPassword"
                              type="password"
                              value={setupConfig.lmevePassword}
                              onChange={(e) => setSetupConfig(c => ({ ...c, lmevePassword: e.target.value }))}
                              placeholder="Enter a secure password (min 8 characters)"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="allowedHosts">Allowed Hosts</Label>
                            <Input
                              id="allowedHosts"
                              value={setupConfig.allowedHosts}
                              onChange={(e) => setSetupConfig(c => ({ ...c, allowedHosts: e.target.value }))}
                              placeholder="% (any host) or specific IP range like 192.168.1.%"
                            />
                            <p className="text-xs text-muted-foreground">
                              Use '%' for any host or specify IP range for security
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Download EVE SDE Data</Label>
                              <p className="text-sm text-muted-foreground">
                                Download and import EVE Static Data Export (~500MB)
                              </p>
                            </div>
                            <Switch
                              checked={setupConfig.downloadSDE}
                              onCheckedChange={(checked) => setSetupConfig(c => ({ ...c, downloadSDE: checked }))}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => setShowSetupWizard(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleStartSetup}
                            disabled={!setupConfig.lmevePassword}
                            className="flex-1 bg-accent hover:bg-accent/90"
                          >
                            <Play size={16} className="mr-2" />
                            Start Setup
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="font-medium mb-2">Setting up database...</h4>
                          <p className="text-sm text-muted-foreground">
                            Step {setupProgress.currentStep} of {setupProgress.totalSteps}
                          </p>
                        </div>

                        <Progress 
                          value={(setupProgress.currentStep / setupProgress.totalSteps) * 100} 
                          className="h-2" 
                        />

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {setupProgress.steps.map((step, index) => (
                            <div key={step.id} className={`p-3 border rounded-lg ${
                              step.status === 'completed' ? 'border-green-500/20 bg-green-500/10' :
                              step.status === 'running' ? 'border-accent/20 bg-accent/10' :
                              step.status === 'failed' ? 'border-red-500/20 bg-red-500/10' :
                              'border-border bg-muted/50'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                {step.status === 'completed' && <CheckCircle size={16} className="text-green-400" />}
                                {step.status === 'running' && <ArrowClockwise size={16} className="text-accent animate-spin" />}
                                {step.status === 'failed' && <X size={16} className="text-red-400" />}
                                {step.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
                                <span className="font-medium text-sm">{step.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{step.description}</p>
                              {step.output && (
                                <p className="text-xs font-mono bg-background/50 p-2 rounded mt-2">{step.output}</p>
                              )}
                              {step.error && (
                                <p className="text-xs text-red-300 bg-red-900/20 p-2 rounded mt-2">{step.error}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {setupProgress.completed && (
                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={() => setShowSetupWizard(false)}
                              className="flex-1"
                            >
                              Close
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Generated Commands Modal */}
              {showSetupCommands && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Database Setup Commands</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyCommands}
                        >
                          <Copy size={16} className="mr-2" />
                          Copy All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSetupCommands(false)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>

                    <Alert className="mb-4">
                      <Terminal size={16} />
                      <AlertDescription>
                        Run these commands on your server with root privileges. Make sure to review and 
                        customize the commands before execution.
                      </AlertDescription>
                    </Alert>

                    <div className="bg-background border rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <pre className="whitespace-pre-wrap">
                        {generateSetupCommands(setupConfig).join('\n')}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Connection Status */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Connection Status</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestDbConnection}
                      disabled={testingConnection}
                      className="relative"
                    >
                      {testingConnection ? (
                        <>
                          <ArrowClockwise size={16} className="mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play size={16} className="mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    
                    {/* Debug button for testing clicks */}
                    {process.env.NODE_ENV === 'development' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('🧪 Debug: Quick test button clicked');
                          const timestamp = new Date().toLocaleTimeString();
                          addConnectionLog(`🧪 [${timestamp}] Debug test button clicked - button functionality working`);
                          toast.success('Debug: Button click registered!');
                        }}
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                      >
                        <UserCheck size={16} className="mr-2" />
                        Debug Test
                      </Button>
                    )}
                    {dbStatus.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnectDb}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Stop size={16} className="mr-2" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleConnectDb}
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Play size={16} className="mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Immediate Test Status */}
                {testingConnection && (
                  <div className="mb-4 p-3 border border-blue-500/20 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-400">
                      <ArrowClockwise size={16} className="animate-spin" />
                      <span className="font-medium">Testing Database Connection...</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Validating network connectivity, authentication, and database structure
                    </p>
                  </div>
                )}

                {dbStatus.connected ? (
                  <div className="p-3 border border-green-500/20 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <CheckCircle size={16} />
                      <span className="font-medium">Connected & Validated</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Connections</p>
                        <p className="font-medium">{dbStatus.connectionCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Queries</p>
                        <p className="font-medium">{dbStatus.queryCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Query Time</p>
                        <p className="font-medium">{Math.round(dbStatus.avgQueryTime)}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Uptime</p>
                        <p className="font-medium">{Math.floor(dbStatus.uptime / 60)}m</p>
                      </div>
                    </div>
                    {dbStatus.lastConnection && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last connected: {new Date(dbStatus.lastConnection).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 border border-orange-500/20 bg-orange-500/10 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-400">
                      <Warning size={16} />
                      <span className="font-medium">Not Connected</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure connection settings and click Connect to establish database connection.
                    </p>
                    {dbStatus.lastError && (
                      <p className="text-xs text-red-300 mt-2">
                        Last error: {dbStatus.lastError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Connection Logs */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Connection Logs</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConnectionLogs(!showConnectionLogs)}
                    >
                      <Eye size={16} className="mr-2" />
                      {showConnectionLogs ? 'Hide' : 'Show'} Logs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearConnectionLogs}
                      disabled={connectionLogs.length === 0}
                    >
                      <X size={16} className="mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>

                {showConnectionLogs && (
                  <div className="space-y-2">
                    <div className="bg-muted/30 border border-border rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs">
                      {connectionLogs.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No connection logs yet. Run a connection test to see detailed logs.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {connectionLogs.map((log, index) => (
                            <div 
                              key={index} 
                              className={`${
                                log.includes('❌') ? 'text-red-300' :
                                log.includes('⚠️') ? 'text-yellow-300' :
                                log.includes('✅') ? 'text-green-300' :
                                log.includes('🔍') || log.includes('🌐') || log.includes('🔌') || 
                                log.includes('🔐') || log.includes('🗄️') || log.includes('🔑') ? 'text-blue-300' :
                                'text-foreground'
                              }`}
                            >
                              {log}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Info size={12} />
                      <span>Logs show the complete database connection validation process including network connectivity, authentication, and database structure checks.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Database Setup */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Database Setup</h4>
                  <Badge variant="outline" className="text-xs">
                    New Installation
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 border border-blue-500/20 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Info size={16} />
                      <span className="font-medium">One-Click Database Setup</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This will create the LMeve database structure and download the EVE Static Data Export (SDE) 
                      using the commands from the original LMeve documentation.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Download & Install EVE SDE</p>
                        <p className="text-xs text-muted-foreground">Downloads the latest EVE universe data (~1GB)</p>
                      </div>
                      <Switch
                        checked={setupConfig.downloadSDE}
                        onCheckedChange={(checked) => setSetupConfig(prev => ({ ...prev, downloadSDE: checked }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="setupPassword">LMeve Database Password</Label>
                      <Input
                        id="setupPassword"
                        type="password"
                        value={setupConfig.lmevePassword}
                        onChange={(e) => setSetupConfig(prev => ({ ...prev, lmevePassword: e.target.value }))}
                        placeholder="Enter password for lmeve user"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="allowedHosts">Allowed Hosts</Label>
                      <Input
                        id="allowedHosts"
                        value={setupConfig.allowedHosts}
                        onChange={(e) => setSetupConfig(prev => ({ ...prev, allowedHosts: e.target.value }))}
                        placeholder="% for any host, or specific IP/hostname"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use '%' to allow connections from any host, or specify specific IPs/hostnames
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleRunDatabaseSetup}
                      disabled={setupProgress.isRunning || !setupConfig.lmevePassword}
                      className="flex-1 bg-accent hover:bg-accent/90"
                    >
                      {setupProgress.isRunning ? (
                        <ArrowClockwise size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Wrench size={16} className="mr-2" />
                      )}
                      {setupProgress.isRunning ? 'Setting Up...' : 'Run Database Setup'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleShowSetupCommands}
                      size="sm"
                    >
                      <Terminal size={16} className="mr-2" />
                      Show Commands
                    </Button>
                  </div>

                  {/* Setup Progress */}
                  {setupProgress.isRunning && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{setupProgress.currentStep}/{setupProgress.totalSteps}</span>
                        </div>
                        <Progress value={(setupProgress.currentStep / setupProgress.totalSteps) * 100} />
                      </div>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {setupProgress.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-2 text-sm">
                            {step.status === 'completed' && <CheckCircle size={14} className="text-green-400" />}
                            {step.status === 'running' && <ArrowClockwise size={14} className="text-blue-400 animate-spin" />}
                            {step.status === 'failed' && <X size={14} className="text-red-400" />}
                            {step.status === 'pending' && <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" />}
                            <span className={step.status === 'completed' ? 'text-green-400' : step.status === 'failed' ? 'text-red-400' : ''}>{step.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Setup Commands Modal */}
                  {showSetupCommands && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Database Setup Commands</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSetupCommands(false)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                          <div className="bg-secondary/20 border border-border rounded p-4 font-mono text-sm">
                            <pre className="whitespace-pre-wrap">{generateSetupCommands(setupConfig).join('\n')}</pre>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(generateSetupCommands(setupConfig).join('\n'));
                              toast.success('Commands copied to clipboard');
                            }}
                            className="flex-1"
                          >
                            <Copy size={16} className="mr-2" />
                            Copy Commands
                          </Button>
                          <Button
                            onClick={() => setShowSetupCommands(false)}
                            className="flex-1"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Connection Settings</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbHost">Host</Label>
                    <Input
                      id="dbHost"
                      value={settings.database?.host || ''}
                      onChange={(e) => updateDatabaseConfig('host', e.target.value)}
                      placeholder="localhost"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbPort">Port</Label>
                    <Input
                      id="dbPort"
                      type="number"
                      value={settings.database?.port || ''}
                      onChange={(e) => updateDatabaseConfig('port', parseInt(e.target.value) || 3306)}
                      placeholder="3306"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dbName">Database Name</Label>
                  <Input
                    id="dbName"
                    value={settings.database?.database || ''}
                    onChange={(e) => updateDatabaseConfig('database', e.target.value)}
                    placeholder="lmeve"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbUsername">Username</Label>
                    <Input
                      id="dbUsername"
                      value={settings.database?.username || ''}
                      onChange={(e) => updateDatabaseConfig('username', e.target.value)}
                      placeholder="lmeve_user"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="dbPassword"
                        type={showDbPassword ? "text" : "password"}
                        value={settings.database?.password || ''}
                        onChange={(e) => updateDatabaseConfig('password', e.target.value)}
                        placeholder="Database password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowDbPassword(!showDbPassword)}
                      >
                        {showDbPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium">Advanced Settings</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbPoolSize">Connection Pool Size</Label>
                    <Input
                      id="dbPoolSize"
                      type="number"
                      min="1"
                      max="50"
                      value={settings.database?.connectionPoolSize || ''}
                      onChange={(e) => updateDatabaseConfig('connectionPoolSize', parseInt(e.target.value) || 10)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbTimeout">Query Timeout (seconds)</Label>
                    <Input
                      id="dbTimeout"
                      type="number"
                      min="5"
                      max="300"
                      value={settings.database?.queryTimeout || ''}
                      onChange={(e) => updateDatabaseConfig('queryTimeout', parseInt(e.target.value) || 30)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbCharset">Character Set</Label>
                    <Input
                      id="dbCharset"
                      value={settings.database?.charset || ''}
                      onChange={(e) => updateDatabaseConfig('charset', e.target.value)}
                      placeholder="utf8mb4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Use SSL</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable SSL/TLS encryption
                      </p>
                    </div>
                    <Switch
                      checked={settings.database?.ssl || false}
                      onCheckedChange={(checked) => updateDatabaseConfig('ssl', checked)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Reconnect</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically reconnect on connection loss
                    </p>
                  </div>
                  <Switch
                    checked={settings.database?.autoReconnect || false}
                    onCheckedChange={(checked) => updateDatabaseConfig('autoReconnect', checked)}
                  />
                </div>
              </div>

              {/* Database Tables */}
              {dbStatus.connected && tableInfo.length > 0 && (
                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Database Tables</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadTableInfo}
                    >
                      <ArrowClockwise size={16} className="mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2 border-b border-border">
                      <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
                        <span>Table Name</span>
                        <span>Rows</span>
                        <span>Size</span>
                        <span>Engine</span>
                        <span>Last Update</span>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {tableInfo.map((table, index) => (
                        <div key={index} className="px-4 py-2 border-b border-border/50 last:border-b-0 hover:bg-muted/30">
                          <div className="grid grid-cols-5 gap-4 text-sm">
                            <span className="font-mono">{table.name}</span>
                            <span>{table.rowCount.toLocaleString()}</span>
                            <span>{table.size}</span>
                            <span>{table.engine}</span>
                            <span className="text-muted-foreground">
                              {new Date(table.lastUpdate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <Button onClick={handleSaveSettings}>Save Database Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eve" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket size={20} />
                EVE Online Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable EVE Online Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Connect to EVE Online ESI API for real-time data
                  </p>
                </div>
                <Switch
                  checked={eveOnlineSync.enabled}
                  onCheckedChange={handleToggleEVESync}
                />
              </div>

              {eveOnlineSync.enabled && (
                <>
                  <div className="border-t border-border pt-6 space-y-4">
                    <h4 className="font-medium">Corporation Information</h4>
                    
                    {corpInfo ? (
                      <div className="p-4 border border-border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{corpInfo.name} [{corpInfo.ticker}]</h5>
                            <p className="text-sm text-muted-foreground">
                              {corpInfo.member_count} members • {corpInfo.tax_rate * 100}% tax rate
                            </p>
                            {corpInfo.date_founded && (
                              <p className="text-xs text-muted-foreground">
                                Founded: {new Date(corpInfo.date_founded).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-green-400 border-green-500/50">
                            <CheckCircle size={14} className="mr-1" />
                            Connected
                          </Badge>
                        </div>
                        {corpInfo.description && (
                          <p className="text-sm text-muted-foreground border-t border-border pt-3">
                            {corpInfo.description}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          No corporation data available. Check your configuration or sync data.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    <h4 className="font-medium">Data Synchronization</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="corpId">Corporation ID</Label>
                        <Input
                          id="corpId"
                          type="number"
                          value={eveOnlineSync.corporationId || ''}
                          onChange={(e) => setSettings(s => ({
                            ...s,
                            eveOnlineSync: {
                              ...s.eveOnlineSync,
                              corporationId: parseInt(e.target.value) || undefined
                            }
                          }))}
                          placeholder="e.g., 498125261"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="charId">Character ID (optional)</Label>
                        <Input
                          id="charId"
                          type="number"
                          value={eveOnlineSync.characterId || ''}
                          onChange={(e) => setSettings(s => ({
                            ...s,
                            eveOnlineSync: {
                              ...s.eveOnlineSync,
                              characterId: parseInt(e.target.value) || undefined
                            }
                          }))}
                          placeholder="e.g., 91316135"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-sync Data</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync data every {eveOnlineSync.syncInterval} minutes
                        </p>
                      </div>
                      <Switch
                        checked={eveOnlineSync.autoSync}
                        onCheckedChange={handleToggleAutoSync}
                      />
                    </div>

                    {eveOnlineSync.autoSync && (
                      <div className="space-y-2">
                        <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                        <Input
                          id="syncInterval"
                          type="number"
                          min="5"
                          max="1440"
                          value={eveOnlineSync.syncInterval}
                          onChange={(e) => setSettings(s => ({
                            ...s,
                            eveOnlineSync: {
                              ...s.eveOnlineSync,
                              syncInterval: parseInt(e.target.value) || 30
                            }
                          }))}
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Last Sync</p>
                          <p className="text-xs text-muted-foreground">
                            {eveOnlineSync.lastSync 
                              ? new Date(eveOnlineSync.lastSync).toLocaleString()
                              : 'Never'
                            }
                          </p>
                        </div>
                        <Button 
                          onClick={handleSyncData} 
                          disabled={syncStatus.isRunning}
                          size="sm"
                        >
                          {syncStatus.isRunning ? (
                            <ArrowClockwise size={16} className="mr-2 animate-spin" />
                          ) : (
                            <Download size={16} className="mr-2" />
                          )}
                          {syncStatus.isRunning ? 'Syncing...' : 'Sync Now'}
                        </Button>
                      </div>

                      {syncStatus.isRunning && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{syncStatus.stage}</span>
                            <span>{Math.round(syncStatus.progress)}%</span>
                          </div>
                          <Progress value={syncStatus.progress} className="h-2" />
                        </div>
                      )}

                      {syncStatus.error && (
                        <div className="p-3 border border-red-500/20 bg-red-500/10 rounded-lg">
                          <div className="flex items-center gap-2 text-red-400">
                            <Warning size={16} />
                            <span className="text-sm font-medium">Sync Error</span>
                          </div>
                          <p className="text-xs text-red-300 mt-1">{syncStatus.error}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <Button onClick={handleSaveSettings}>Save EVE Online Settings</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sde" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive size={20} />
                EVE Static Data Export (SDE)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-2">EVE SDE Database:</p>
                <p>
                  The Static Data Export contains reference data for all items, ships, solar systems, 
                  and other static information in EVE Online. This data is essential for features like 
                  item pricing, manufacturing calculations, and location lookups.
                </p>
              </div>

              {/* Current Status */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Current Status</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkForUpdates}
                    disabled={sdeStatus.isDownloading || sdeStatus.isUpdating}
                  >
                    <ArrowClockwise size={16} className="mr-2" />
                    Check for Updates
                  </Button>
                </div>

                {sdeStatus.isInstalled ? (
                  <div className="space-y-4">
                    <div className="p-3 border border-green-500/20 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle size={16} />
                        <span className="font-medium">SDE Installed</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Version</p>
                          <p className="font-medium">{sdeStatus.currentVersion}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Installed</p>
                          <p className="font-medium">
                            {sdeStatus.installedDate 
                              ? new Date(sdeStatus.installedDate).toLocaleDateString()
                              : 'Unknown'
                            }
                          </p>
                        </div>
                        {sdeStats && (
                          <div>
                            <p className="text-muted-foreground">Database Size</p>
                            <p className="font-medium">{sdeStats.totalSize}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {sdeStats && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Database size={16} className="text-blue-400" />
                            <span className="font-medium">Tables</span>
                          </div>
                          <p className="text-xl font-bold">{sdeStats.tables}</p>
                        </div>
                        <div className="p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <List size={16} className="text-green-400" />
                            <span className="font-medium">Total Rows</span>
                          </div>
                          <p className="text-xl font-bold">{sdeStats.totalRows.toLocaleString()}</p>
                        </div>
                        <div className="p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-purple-400" />
                            <span className="font-medium">Last Update</span>
                          </div>
                          <p className="text-sm font-medium">
                            {new Date(sdeStats.lastUpdate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 border border-orange-500/20 bg-orange-500/10 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-400">
                      <Warning size={16} />
                      <span className="font-medium">SDE Not Installed</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      The EVE Static Data Export is not installed. Download and install it to enable 
                      full functionality.
                    </p>
                  </div>
                )}

                {sdeStatus.isUpdateAvailable && (
                  <div className="p-3 border border-blue-500/20 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Info size={16} />
                      <span className="font-medium">Update Available</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      A newer version of the SDE is available: {sdeStatus.latestVersion}
                    </p>
                  </div>
                )}

                {sdeStatus.lastChecked && (
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(sdeStatus.lastChecked).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Download and Update */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium">Download & Update</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Download Latest SDE</p>
                      <p className="text-sm text-muted-foreground">
                        Download the latest EVE Static Data Export from Fuzzwork
                      </p>
                    </div>
                    <Button
                      onClick={downloadSDE}
                      disabled={sdeStatus.isDownloading || sdeStatus.isUpdating || (!sdeStatus.isUpdateAvailable && sdeStatus.isInstalled)}
                      className="bg-accent hover:bg-accent/90"
                    >
                      {sdeStatus.isDownloading ? (
                        <>
                          <ArrowClockwise size={16} className="mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <CloudArrowDown size={16} className="mr-2" />
                          Download SDE
                        </>
                      )}
                    </Button>
                  </div>

                  {sdeStatus.isDownloading && typeof sdeStatus.downloadProgress === 'number' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Downloading SDE archive...</span>
                        <span>{Math.round(sdeStatus.downloadProgress)}%</span>
                      </div>
                      <Progress value={sdeStatus.downloadProgress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Update Database</p>
                      <p className="text-sm text-muted-foreground">
                        Import SDE data into the database (requires download first)
                      </p>
                    </div>
                    <Button
                      onClick={updateDatabase}
                      disabled={sdeStatus.isDownloading || sdeStatus.isUpdating || sdeStatus.downloadProgress !== 100}
                      variant="outline"
                    >
                      {sdeStatus.isUpdating ? (
                        <>
                          <ArrowClockwise size={16} className="mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="mr-2" />
                          Update Database
                        </>
                      )}
                    </Button>
                  </div>

                  {sdeStatus.error && (
                    <div className="p-3 border border-red-500/20 bg-red-500/10 rounded-lg">
                      <div className="flex items-center gap-2 text-red-400">
                        <Warning size={16} />
                        <span className="font-medium">Error</span>
                      </div>
                      <p className="text-sm text-red-300 mt-1">{sdeStatus.error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Source Information */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium">Data Source</h4>
                <div className="p-3 border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Fuzzwork Enterprises</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://www.fuzzwork.co.uk/dump/', '_blank')}
                    >
                      <Globe size={16} className="mr-2" />
                      Visit Source
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fuzzwork provides regular exports of the EVE Online Static Data Export in MySQL format.
                    This service is maintained by Steve Ronuken and is widely used by EVE third-party applications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={20} />
                ESI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ESI Application Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">ESI Application</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://developers.eveonline.com/applications', '_blank')}
                  >
                    <Globe size={16} className="mr-2" />
                    Manage Apps
                  </Button>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Create an application at developers.eveonline.com</li>
                    <li>Set the callback URL to: <code className="bg-background px-1 rounded">{window.location.origin}</code></li>
                    <li>Copy the Client ID and Client Secret below</li>
                    <li>Save configuration and test login</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={esiConfig.clientId}
                      onChange={(e) => updateESIConfig({ ...esiConfig, clientId: e.target.value })}
                      placeholder="Your EVE Online application Client ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <div className="relative">
                      <Input
                        id="clientSecret"
                        type={showSecrets ? "text" : "password"}
                        value={esiConfig.secretKey}
                        onChange={(e) => updateESIConfig({ ...esiConfig, secretKey: e.target.value })}
                        placeholder="Your EVE Online application Client Secret"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowSecrets(!showSecrets)}
                      >
                        {showSecrets ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered Corporations */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Registered Corporations</h4>
                  <Badge variant="outline">
                    {registeredCorps.filter(corp => corp.isActive).length} Active
                  </Badge>
                </div>
                
                {registeredCorps.length > 0 ? (
                  <div className="space-y-3">
                    {registeredCorps.map((corp) => (
                      <div key={corp.corporationId} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{corp.corporationName}</h5>
                            <p className="text-sm text-muted-foreground">
                              Corp ID: {corp.corporationId} • Registered: {new Date(corp.registeredAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={corp.isActive ? "default" : "secondary"}>
                              {corp.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {corp.keyExpiry && (
                              <Badge variant="outline" className="text-xs">
                                Expires: {new Date(corp.keyExpiry).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-muted-foreground">
                          <p>Scopes: {corp.scopes.join(', ')}</p>
                          <p>Registered by Character ID: {corp.registeredBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-border rounded-lg text-center">
                    <Building size={32} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">No corporations registered</p>
                    <p className="text-xs text-muted-foreground">
                      CEOs and Directors can register their corporations by logging in with EVE Online SSO
                    </p>
                  </div>
                )}
              </div>

              {/* Access Control */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium">Access Control</h4>
                
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Who can access LMeve:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Corporation Members:</strong> Must be in a registered corporation</li>
                    <li><strong>CEOs & Directors:</strong> Can log in to register their corporation</li>
                    <li><strong>Local Admins:</strong> Can access with username/password</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {registeredCorps.reduce((sum, corp) => sum + (corp.isActive ? 1 : 0), 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Active Corps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {esiConfig.clientId ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-muted-foreground">ESI Configured</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <Button onClick={handleSaveSettings}>Save ESI Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Data Synchronization Timers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-2">Polling Configuration:</p>
                <p>
                  Configure how frequently each data type is synchronized with the EVE Online ESI API. 
                  Lower values provide more real-time data but increase API usage. Higher values reduce 
                  server load but data may be less current.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Sync Intervals (minutes)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-blue-400" />
                          <Label className="font-medium">Members</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Corporation member list and roles
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="5"
                          max="1440"
                          value={settings.dataSyncTimers?.members || 60}
                          onChange={(e) => setSettings(s => ({
                            ...s,
                            dataSyncTimers: {
                              ...s.dataSyncTimers,
                              members: parseInt(e.target.value) || 60
                            }
                          }))}
                          className="w-20 text-center"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-green-400" />
                          <Label className="font-medium">Assets</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Corporation assets and locations
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="5"
                          max="1440"
                          value={settings.dataSyncTimers?.assets || 30}
                          onChange={(e) => setSettings(s => ({
                            ...s,
                            dataSyncTimers: {
                              ...s.dataSyncTimers,
                              assets: parseInt(e.target.value) || 30
                            }
                          }))}
                          className="w-20 text-center"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Factory size={16} className="text-purple-400" />
                          <Label className="font-medium">Manufacturing</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Industry jobs and blueprints
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="5"
                          max="1440"
                          value={settings.dataSyncTimers?.manufacturing || 15}
                          onChange={(e) => setSettings(s => ({
                            ...s,
                            dataSyncTimers: {
                              ...s.dataSyncTimers,
                              manufacturing: parseInt(e.target.value) || 15
                            }
                          }))}
                          className="w-20 text-center"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 flex gap-3">
                <Button onClick={handleSaveSettings}>Save Sync Settings</Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSettings(s => ({
                      ...s,
                      dataSyncTimers: {
                        members: 60,
                        assets: 30,
                        manufacturing: 15,
                        mining: 45,
                        market: 10,
                        killmails: 120,
                        income: 30
                      }
                    }));
                    toast.success('Reset to recommended defaults');
                  }}
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Manufacturing Jobs</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about manufacturing job completions and issues
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.manufacturing}
                    onCheckedChange={() => handleNotificationToggle('manufacturing')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mining Operations</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates on mining fleet activities and yields
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.mining}
                    onCheckedChange={() => handleNotificationToggle('mining')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Killmails</Label>
                    <p className="text-sm text-muted-foreground">
                      Corporation member kills and losses
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.killmails}
                    onCheckedChange={() => handleNotificationToggle('killmails')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Market Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Price alerts and market order notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.markets}
                    onCheckedChange={() => handleNotificationToggle('markets')}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSaveSettings}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Admin Configuration - Only show to admins */}
              {user?.isAdmin && (
                <div className="space-y-4">
                  <div className="p-4 border border-accent/20 bg-accent/5 rounded-lg space-y-4">
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} className="text-accent" />
                      <span className="font-medium">Local Administrator Account</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Configure the local administrator login credentials. This account has full system access.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminUsername">Admin Username</Label>
                        <Input
                          id="adminUsername"
                          value={tempAdminConfig.username}
                          onChange={(e) => setTempAdminConfig(c => ({ ...c, username: e.target.value }))}
                          placeholder="admin"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPassword">Admin Password</Label>
                        <Input
                          id="adminPassword"
                          type="password"
                          value={tempAdminConfig.password}
                          onChange={(e) => setTempAdminConfig(c => ({ ...c, password: e.target.value }))}
                          placeholder="Enter secure password"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSaveAdminConfig} size="sm">
                        Update Admin Credentials
                      </Button>
                      <Badge variant="outline" className="text-xs">
                        Current: {adminConfig.username}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4"></div>
                </div>
              )}

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span className="font-medium">Session Timeout</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after 2 hours of inactivity
                  </p>
                  <Switch defaultChecked />
                </div>
                
                <div className="p-4 border border-border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span className="font-medium">Role-Based Access</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Restrict access to sensitive data based on user roles
                  </p>
                  <Switch defaultChecked />
                </div>
                
                <div className="p-4 border border-border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Database size={16} />
                    <span className="font-medium">Data Encryption</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Encrypt sensitive corporation data at rest
                  </p>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCheck size={20} />
                Authentication Debug
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AdminLoginTest />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Simple Auth Service Test</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleLoginTest />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database size={20} />
                Database Connection Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DatabaseConnectionTest />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Info size={20} />
                System Debug Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current User</Label>
                  <div className="p-3 border border-border rounded bg-muted/50 font-mono text-sm">
                    {user ? (
                      <div>
                        <div>Name: {user.characterName}</div>
                        <div>Corp: {user.corporationName}</div>
                        <div>ID: {user.characterId}</div>
                        <div>Admin: {user.isAdmin ? 'Yes' : 'No'}</div>
                        <div>Auth: {user.authMethod}</div>
                        <div>ESI Access: {user.canManageESI ? 'Yes' : 'No'}</div>
                      </div>
                    ) : (
                      'No user logged in'
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Corporation Registry</Label>
                  <div className="p-3 border border-border rounded bg-muted/50 font-mono text-sm max-h-32 overflow-y-auto">
                    {registeredCorps && Object.keys(registeredCorps).length > 0 ? (
                      Object.entries(registeredCorps).map(([corpId, corp]) => (
                        <div key={corpId} className="text-xs">
                          {corp.corporationName} ({corpId})
                        </div>
                      ))
                    ) : (
                      'No corporations registered'
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Admin Configuration</Label>
                  <div className="p-3 border border-border rounded bg-muted/50 font-mono text-sm">
                    <div>Username: {adminConfig.username}</div>
                    <div>Password Set: {adminConfig.password ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>ESI Configuration Status</Label>
                  <div className="p-3 border border-border rounded bg-muted/50 font-mono text-sm">
                    <div>Client ID: {esiConfig.clientId ? 'Configured' : 'Not Set'}</div>
                    <div>Secret: {esiConfig.secretKey ? 'Configured' : 'Not Set'}</div>
                    <div>Base URL: {esiConfig.baseUrl || 'https://login.eveonline.com'}</div>
                    <div>User Agent: {esiConfig.userAgent || 'Not Set'}</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-medium">Database Validation Tests</h4>
                <p className="text-sm text-muted-foreground">
                  Run comprehensive tests to verify database connection validation is working properly.
                  This will test both invalid configurations (should fail) and valid ones (might pass with real MySQL).
                </p>
                <Button
                  onClick={() => {
                    toast.info('Running database validation tests - check browser console for detailed results');
                    runDatabaseValidationTests();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Database size={16} className="mr-2" />
                  Run Database Validation Test Suite
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        </Tabs>
    </div>
  );
}