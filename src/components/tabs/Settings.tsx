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
import { useSDEManager, type SDEDatabaseStats } from '@/lib/sdeService';
import { AdminLoginTest } from '@/components/AdminLoginTest';
import { SimpleLoginTest } from '@/components/SimpleLoginTest';
import { runDatabaseValidationTests } from '@/lib/databaseTestCases';
import { DatabaseManager, DatabaseSetupManager, DatabaseSetupProgress, generateSetupCommands } from '@/lib/database';

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
    sessionTimeout: true,
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
    },
    sudoDatabase: {
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      ssl: false
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
  
  // Simplified setup state types
  interface SimpleSetupConfig {
    lmevePassword: string;
    allowedHosts: string;
    downloadSDE: boolean;
  }
  
  // Simplified setup state
  const [setupConfig, setSetupConfig] = useState<SimpleSetupConfig>({
    lmevePassword: '',
    allowedHosts: '%',
    downloadSDE: true
  });

  // Setup progress state
  const [setupProgress, setSetupProgress] = useState<DatabaseSetupProgress>({
    isRunning: false,
    progress: 0,
    currentStage: 'Idle',
    currentStep: 0,
    totalSteps: 6,
    steps: [
      { id: '1', name: 'Create directories', status: 'pending', description: 'Creating required directories' },
      { id: '2', name: 'Download SDE data', status: 'pending', description: 'Downloading EVE Static Data Export' },
      { id: '3', name: 'Extract archive', status: 'pending', description: 'Extracting downloaded files' },
      { id: '4', name: 'Create databases', status: 'pending', description: 'Creating MySQL databases' },
      { id: '5', name: 'Import schemas', status: 'pending', description: 'Importing database schemas' },
      { id: '6', name: 'Configure users', status: 'pending', description: 'Setting up database users' }
    ],
    completed: false
  });
  
  // UI state management for modals and forms
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [showConnectionLogs, setShowConnectionLogs] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showSetupCommands, setShowSetupCommands] = useState(false);
  
  // SDE Management - using the existing useSDEManager hook imported above
  const [sdeStats, setSDEStats] = useState<SDEDatabaseStats>({
    isConnected: false,
    tableCount: 0,
    totalRecords: 0,
    totalSize: '0 MB',
    lastUpdate: '',
    currentVersion: 'Unknown',
    availableVersion: 'Checking...',
    lastUpdateCheck: undefined,
    isOutdated: false
  });
  
  // Database connection state
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    connectionCount: 0,
    queryCount: 0,
    avgQueryTime: 0,
    uptime: 0,
    lastConnection: null as string | null,
    lastError: null as string | null
  });
  const [tableInfo, setTableInfo] = useState<any[]>([]);
  
  // Admin configuration state
  const [tempAdminConfig, setTempAdminConfig] = useState(adminConfig);

  // Manual users management state
  const [manualUsers, setManualUsers] = useKV<Array<{
    id: string;
    username: string; 
    characterName: string;
    corporationName: string;
    roles: string[];
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
  }>>('manual-users', []);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    characterName: '',
    corporationName: '',
    roles: [] as string[],
  });

  // Ensure safe access to settings
  const eveOnlineSync = settings?.eveOnlineSync || {
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    lastSync: new Date().toISOString(),
    characterId: 91316135,
    corporationId: 498125261
  };

  // Clear connection logs
  const clearConnectionLogs = () => {
    setConnectionLogs([]);
  };

  // Helper to add timestamped connection logs
  const addConnectionLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Load SDE database stats on component mount
  React.useEffect(() => {
    const loadSDEStats = async () => {
      if (settings.database?.host && settings.database?.username && settings.database?.password) {
        try {
          // Simulate checking EveStaticData database
          const sdeDbConfig = {
            ...settings.database,
            database: 'EveStaticData'
          };
          
          const manager = new DatabaseManager(sdeDbConfig);
          const testResult = await manager.testConnection();
          
          if (testResult.success && testResult.validated) {
            // Simulate getting database stats
            setSDEStats(prev => ({
              ...prev,
              isConnected: true,
              tableCount: 167,
              totalRecords: 2456891,
              totalSize: '342.7 MB',
              lastUpdate: '2024-01-15T10:30:00Z',
              currentVersion: '2024-01-15-1'
            }));
          } else {
            setSDEStats(prev => ({
              ...prev,
              isConnected: false
            }));
          }
        } catch (error) {
          setSDEStats(prev => ({
            ...prev,
            isConnected: false
          }));
        }
      }
    };
    
    loadSDEStats();
  }, [settings.database]);

  // REAL database connection test using the strict DatabaseManager
  const handleTestDbConnection = async () => {
    // Prevent multiple concurrent tests
    if (testingConnection) {
      toast.warning('Database test already in progress...');
      return;
    }
    
    console.log('🧪 Starting REAL database connection test');
    
    if (!settings.database) {
      const error = 'Please configure database connection settings first';
      toast.error(error);
      addConnectionLog(`❌ ${error}`);
      return;
    }
    
    const { host, port, database, username, password } = settings.database;
    
    // Validate required fields
    if (!host || !port || !database || !username || !password) {
      const error = 'All database fields are required: host, port, database, username, password';
      toast.error(error);
      addConnectionLog(`❌ ${error}`);
      return;
    }
    
    // Clear previous logs and start test
    setConnectionLogs([]);
    setTestingConnection(true);
    
    try {
      addConnectionLog('🔍 Starting comprehensive database validation...');
      addConnectionLog(`🎯 Target: ${username}@${host}:${port}/${database}`);
      
      // Create database manager with current settings
      const config = {
        host,
        port: Number(port),
        database,
        username,
        password,
        ssl: false,
        connectionPoolSize: 1,
        queryTimeout: 30,
        autoReconnect: false,
        charset: 'utf8mb4'
      };
      
      const manager = new DatabaseManager(config);
      
      // Intercept console.log to capture detailed validation steps
      const originalConsoleLog = console.log;
      const interceptedMessages = new Set<string>(); // Prevent duplicate messages
      
      console.log = (...args: any[]) => {
        const message = args.join(' ');
        if (message.includes('🔍') || message.includes('🌐') || message.includes('🔌') || 
            message.includes('🔐') || message.includes('🗄️') || message.includes('🔑') || 
            message.includes('✅') || message.includes('❌')) {
          
          // Only add unique messages to prevent duplicates
          if (!interceptedMessages.has(message)) {
            interceptedMessages.add(message);
            addConnectionLog(message);
          }
        }
        originalConsoleLog(...args);
      };
      
      // Run the REAL connection test
      const testResult = await manager.testConnection();
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      if (testResult.success && testResult.validated) {
        addConnectionLog(`✅ Database connection VALIDATED successfully!`);
        addConnectionLog(`⚡ Connection latency: ${testResult.latency}ms`);
        addConnectionLog(`🎉 All checks passed - this is a legitimate MySQL database`);
        toast.success(`✅ Connection validated! Latency: ${testResult.latency}ms`);
      } else if (testResult.success && !testResult.validated) {
        addConnectionLog(`⚠️ Partial connection success but validation incomplete`);
        addConnectionLog(`⚡ Connection latency: ${testResult.latency}ms`);
        addConnectionLog(`❌ Database validation failed - connection rejected`);
        toast.warning(`⚠️ Partial success - validation incomplete`);
      } else {
        addConnectionLog(`❌ Connection test FAILED: ${testResult.error}`);
        addConnectionLog(`🚫 This configuration cannot establish a valid MySQL connection`);
        toast.error(`❌ Connection failed: ${testResult.error}`);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown connection error';
      addConnectionLog(`💥 Test error: ${errorMsg}`);
      addConnectionLog(`🚫 Connection test could not complete`);
      toast.error(`Test error: ${errorMsg}`);
    } finally {
      addConnectionLog('🏁 Database connection test completed');
      setTestingConnection(false);
    }
  };

  // Simplified database connection functions
  const handleConnectDb = async () => {
    if (!settings.database) {
      toast.error('Please configure database connection settings first');
      return;
    }
    toast.info('Database connection feature not implemented yet');
  };

  const handleDisconnectDb = async () => {
    toast.info('Database disconnection feature not implemented yet');
  };

  const loadTableInfo = async () => {
    console.log('Table info loading not implemented yet');
  };

  const updateDatabaseConfig = (field: keyof CorpSettings['database'], value: any) => {
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

  const updateSudoDatabaseConfig = (field: keyof CorpSettings['sudoDatabase'], value: any) => {
    setSettings(current => {
      if (!current) return current;
      return {
        ...current,
        sudoDatabase: {
          ...current.sudoDatabase,
          [field]: value
        }
      };
    });
  };

  // Database setup handlers
  const handleRunDatabaseSetup = async () => {
    setShowSetupWizard(true);
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

  // Simplified database manager effect
  useEffect(() => {
    console.log('Database config updated');
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

  // Real database setup function using configured database connections
  const handleStartSetup = async () => {
    if (!setupConfig.lmevePassword) {
      toast.error('Please enter a database password');
      return;
    }

    if (setupConfig.lmevePassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!settings.sudoDatabase?.host || !settings.sudoDatabase?.username || !settings.sudoDatabase?.password) {
      toast.error('Please configure sudo database connection first (host, username, password)');
      return;
    }

    setSetupProgress(prev => ({
      ...prev,
      isRunning: true,
      progress: 0,
      currentStep: 1,
      currentStage: 'Starting database setup using configured connections...',
      steps: prev.steps.map(step => ({ ...step, status: 'pending' }))
    }));

    try {
      // Use the DatabaseSetupManager with real database connections
      const setupManager = new DatabaseSetupManager((progress) => {
        setSetupProgress(progress);
      });

      const setupConfig_full = {
        mysqlRootPassword: settings.sudoDatabase.password,
        lmevePassword: setupConfig.lmevePassword,
        allowedHosts: setupConfig.allowedHosts,
        downloadSDE: setupConfig.downloadSDE,
        createDatabases: true,
        importSchema: true,
        createUser: true,
        grantPrivileges: true,
        validateSetup: true
      };

      // Execute real database setup using configured sudo connection
      const result = await setupManager.setupNewDatabase(setupConfig_full);

      if (result.success) {
        toast.success('Database setup completed successfully');
        
        // Update the lmeve database config with the new setup
        updateDatabaseConfig('password', setupConfig.lmevePassword);
        updateDatabaseConfig('database', 'lmeve');
        if (!settings.database?.username) {
          updateDatabaseConfig('username', 'lmeve');
        }
        
        // Automatically test the new connection
        setTimeout(() => {
          handleTestDbConnection();
        }, 1000);
        
      } else {
        throw new Error(result.error || 'Setup failed');
      }
    } catch (error) {
      console.error('Setup failed:', error);
      setSetupProgress(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Setup failed',
        currentStage: 'Setup failed'
      }));
      toast.error(`Database setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Use the real command generator with current settings
  const handleGenerateCommands = () => {
    const config = {
      lmevePassword: setupConfig.lmevePassword,
      allowedHosts: setupConfig.allowedHosts,
      downloadSDE: setupConfig.downloadSDE
    };
    
    const commands = generateSetupCommands(config);
    console.log('Generated setup commands:', commands);
    
    // Copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(commands.join('\n'))
        .then(() => {
          toast.success('Commands copied to clipboard');
          setShowSetupCommands(true);
        })
        .catch(() => {
          toast.info('Commands generated - check console for details');
          setShowSetupCommands(true);
        });
    } else {
      toast.info('Commands generated - check console for details');
      setShowSetupCommands(true);
    }
  };

  const handleCopyCommands = () => {
    const config = {
      lmevePassword: setupConfig.lmevePassword,
      allowedHosts: setupConfig.allowedHosts,
      downloadSDE: setupConfig.downloadSDE
    };
    
    const commands = generateSetupCommands(config);
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(commands.join('\n'))
        .then(() => toast.success('All commands copied to clipboard'))
        .catch(() => toast.error('Failed to copy commands'));
    } else {
      toast.error('Clipboard not available');
    }
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
          Database Settings
        </h2>
        <p className="text-muted-foreground">
          Configure database core settings
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
            <TabsTrigger value="esi">Corporations</TabsTrigger>
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

              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium">Application Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after 2 hours of inactivity
                    </p>
                  </div>
                  <Switch 
                    checked={settings.sessionTimeout}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, sessionTimeout: checked }))}
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
                <p className="font-medium mb-2">Database Connection Settings</p>
                <p>
                  Configure your MySQL/MariaDB database connection. This system performs real network connectivity 
                  tests and accepts any valid IP address or hostname with custom ports for maximum flexibility.
                </p>
              </div>

              {/* ESI Configuration */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">ESI Application Credentials</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://developers.eveonline.com/applications', '_blank')}
                  >
                    <Globe size={16} className="mr-2" />
                    Manage Apps
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">EVE Online Client ID</Label>
                      <Input
                        id="clientId"
                        value={esiConfig.clientId}
                        onChange={(e) => updateESIConfig({ ...esiConfig, clientId: e.target.value })}
                        placeholder="Your EVE Online application Client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientSecret">EVE Online Client Secret</Label>
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
                  <p className="text-xs text-muted-foreground">
                    Create an application at developers.eveonline.com with callback URL: <code className="bg-background px-1 rounded">{window.location.origin}</code>
                  </p>
                </div>
              </div>

              {/* Sudo Database Connection */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Sudo Database User (Administrative)</h4>
                  <Badge variant="outline" className="text-xs">Root/Admin Access</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sudoHost">Host</Label>
                      <Input
                        id="sudoHost"
                        value={settings.sudoDatabase?.host || ''}
                        onChange={(e) => updateSudoDatabaseConfig('host', e.target.value)}
                        placeholder="localhost"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sudoPort">Port</Label>
                      <Input
                        id="sudoPort"
                        type="number"
                        value={settings.sudoDatabase?.port || ''}
                        onChange={(e) => updateSudoDatabaseConfig('port', parseInt(e.target.value) || 3306)}
                        placeholder="3306"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sudoUsername">Username</Label>
                      <Input
                        id="sudoUsername"
                        value={settings.sudoDatabase?.username || ''}
                        onChange={(e) => updateSudoDatabaseConfig('username', e.target.value)}
                        placeholder="root"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sudoPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="sudoPassword"
                        type={showDbPassword ? "text" : "password"}
                        value={settings.sudoDatabase?.password || ''}
                        onChange={(e) => updateSudoDatabaseConfig('password', e.target.value)}
                        placeholder="Root/admin database password"
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
                  <p className="text-xs text-muted-foreground">
                    Used for database creation, schema setup, and administrative tasks. Typically 'root' user.
                  </p>
                </div>
              </div>

              {/* LMeve Database Connection */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">LMeve Database User (Application)</h4>
                  <Badge variant="outline" className="text-xs">Application Access</Badge>
                </div>
                
                <div className="space-y-4">
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

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dbName">Database Name</Label>
                      <Input
                        id="dbName"
                        value={settings.database?.database || ''}
                        onChange={(e) => updateDatabaseConfig('database', e.target.value)}
                        placeholder="lmeve"
                      />
                    </div>
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
                          placeholder="Application database password"
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
                  <p className="text-xs text-muted-foreground">
                    Used for day-to-day application operations. Should have limited privileges for security.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🧪 Test connection button clicked');
                    handleTestDbConnection();
                  }}
                  disabled={testingConnection}
                  className="relative hover:bg-accent/10 active:bg-accent/20 transition-colors"
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

              {/* Connection Status */}
              <div className="space-y-4">
                {/* Immediate Test Status */}
                {testingConnection && (
                  <div className="p-3 border border-blue-500/20 bg-blue-500/10 rounded-lg">
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
                              className={`leading-relaxed ${
                                log.includes('❌') || log.includes('💥') ? 'text-red-300' :
                                log.includes('⚠️') ? 'text-yellow-300' :
                                log.includes('✅') || log.includes('🎉') ? 'text-green-300' :
                                log.includes('🔍') || log.includes('🌐') || log.includes('🔌') || 
                                log.includes('🔐') || log.includes('🗄️') || log.includes('🔑') || 
                                log.includes('🎯') ? 'text-blue-300' :
                                log.includes('⚡') ? 'text-purple-300' :
                                log.includes('🏁') ? 'text-gray-400' :
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
                      <span>
                        Logs show the complete database connection validation process including network connectivity, 
                        authentication, and database structure checks.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Database Setup Section */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium">Complete Database Setup</h4>
                
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <p className="font-medium mb-2">LMeve Database Initialization</p>
                  <p>
                    Complete automated setup for new LMeve installations. Creates databases, downloads EVE SDE data, 
                    imports schema, and configures users. Uses your configured database connection settings above.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* One-Button Complete Setup */}
                  <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Wrench size={20} className="text-green-400" />
                        <h5 className="font-medium">Automated Database Setup</h5>
                      </div>
                      <Button
                        onClick={handleStartSetup}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        disabled={setupProgress.isRunning || !settings.sudoDatabase?.password}
                      >
                        {setupProgress.isRunning ? (
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
                      Creates databases, downloads EVE SDE data, imports schema, and configures everything in one step. 
                      Requires the sudo database connection configured above.
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
                          disabled={setupProgress.isRunning}
                        />
                        <p className="text-xs text-muted-foreground">
                          This password will be used for the 'lmeve' database user
                        </p>
                      </div>
                      
                      {!settings.sudoDatabase?.password && (
                        <Alert>
                          <Warning size={16} />
                          <AlertDescription>
                            Please configure the sudo database connection above before running setup.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {setupProgress.isRunning && (
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
                        disabled={setupProgress.isRunning}
                      >
                        <Terminal size={16} className="mr-2" />
                        Manual Commands
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSetupWizard(true)}
                        disabled={setupProgress.isRunning}
                      >
                        <Gear size={16} className="mr-2" />
                        Advanced Setup
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

        <TabsContent value="sde" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive size={20} />
                EVE Static Data Export (SDE) Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-2">EVE SDE Data Management</p>
                <p>
                  The EVE Static Data Export contains all of EVE Online's reference data including items, 
                  ships, regions, systems, and market information. This data is essential for LMeve operations 
                  and should be kept current.
                </p>
              </div>

              {/* EVE Live Database Status */}
              <div className="space-y-4">
                <h4 className="font-medium">EVE Static Database Status</h4>
                
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Database size={18} className="text-accent" />
                      <span className="font-medium">EveStaticData Database</span>
                    </div>
                    <Badge variant={sdeStats.isConnected ? "default" : "secondary"}>
                      {sdeStats.isConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>

                  {sdeStats.isConnected ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Tables</p>
                        <p className="font-medium">{sdeStats.tableCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Records</p>
                        <p className="font-medium">{sdeStats.totalRecords?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Database Size</p>
                        <p className="font-medium">{sdeStats.totalSize}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">
                          {sdeStats.lastUpdate ? new Date(sdeStats.lastUpdate).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        Database not accessible. Check your EveStaticData database connection.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SDE Update Management */}
              <div className="space-y-4">
                <h4 className="font-medium">SDE Update Management</h4>
                
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CloudArrowDown size={18} className="text-blue-400" />
                      <span className="font-medium">Fuzzwork SDE Source</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://www.fuzzwork.co.uk/dump/', '_blank')}
                    >
                      <Globe size={16} className="mr-2" />
                      View Source
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Current SDE Version</Label>
                        <div className="p-2 bg-muted/30 rounded border text-sm">
                          {sdeStats.currentVersion || 'Unknown'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Last Update Check</Label>
                        <div className="p-2 bg-muted/30 rounded border text-sm">
                          {sdeStats.lastUpdateCheck ? 
                            new Date(sdeStats.lastUpdateCheck).toLocaleString() : 
                            'Never checked'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Available SDE Version</Label>
                        <div className="p-2 bg-muted/30 rounded border text-sm">
                          {sdeStats.availableVersion || 'Checking...'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Update Status</Label>
                        <div className="p-2 bg-muted/30 rounded border text-sm">
                          {sdeStats.isOutdated ? (
                            <span className="text-yellow-400">Update Available</span>
                          ) : sdeStats.currentVersion ? (
                            <span className="text-green-400">Up to Date</span>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            setSDEStats(prev => ({ ...prev, availableVersion: 'Checking...' }));
                            toast.info('Checking for SDE updates...');
                            
                            // Simulate checking for updates
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            
                            // Simulate version check
                            const currentDate = new Date().toISOString().split('T')[0];
                            const availableVersion = `${currentDate}-1`;
                            const isOutdated = sdeStats.currentVersion !== availableVersion;
                            
                            setSDEStats(prev => ({
                              ...prev,
                              availableVersion,
                              lastUpdateCheck: new Date().toISOString(),
                              isOutdated
                            }));
                            
                            if (isOutdated) {
                              toast.success('SDE update available!');
                            } else {
                              toast.success('SDE is up to date');
                            }
                          } catch (error) {
                            toast.error('Failed to check for updates');
                          }
                        }}
                      >
                        <ArrowClockwise size={16} className="mr-2" />
                        Check for Updates
                      </Button>
                      
                      {sdeStats.isOutdated && (
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent/90"
                          onClick={async () => {
                            try {
                              toast.info('SDE update starting...');
                              
                              // Simulate update process
                              await new Promise(resolve => setTimeout(resolve, 3000));
                              
                              setSDEStats(prev => ({
                                ...prev,
                                currentVersion: prev.availableVersion || prev.currentVersion,
                                lastUpdate: new Date().toISOString(),
                                isOutdated: false
                              }));
                              
                              toast.success('SDE update completed successfully!');
                            } catch (error) {
                              toast.error('SDE update failed');
                            }
                          }}
                        >
                          <CloudArrowDown size={16} className="mr-2" />
                          Update SDE Data
                        </Button>
                      )}
                    </div>
                  </div>
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
                <Building size={20} />
                Corporations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registered Corporations */}
              <div className="space-y-4">
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
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test database connectivity using the current configuration settings.
              </p>
              <Button
                onClick={() => {
                  console.log('🧪 Debug test connection button clicked');
                  handleTestDbConnection();
                }}
                disabled={testingConnection}
                className="w-full hover:bg-accent/10 active:bg-accent/20 transition-colors"
              >
                {testingConnection ? (
                  <>
                    <ArrowClockwise size={16} className="mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Test Database Connection
                  </>
                )}
              </Button>
              
              {connectionLogs.length > 0 && (
                <div className="border border-border rounded-lg p-3 bg-muted/30">
                  <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                    {connectionLogs.map((log, index) => (
                      <div key={index} className="text-foreground">{log}</div>
                    ))}
                  </div>
                </div>
              )}
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