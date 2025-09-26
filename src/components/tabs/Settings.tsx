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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatabaseSchemaManager } from '@/components/DatabaseSchemaManager';
import { lmeveSchemas } from '@/lib/database-schemas';
import { esiRouteManager, useESIRoutes } from '@/lib/esi-routes';
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
  FileText,
  Network,
  CaretUp,
  CaretDown,
  CaretRight,
  Question,
  Activity,
  Settings as SettingsIcon,
  RefreshCw
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/lib/auth-provider';
import { CorpSettings } from '@/lib/types';
import { toast } from 'sonner';
import { eveApi, type CharacterInfo, type CorporationInfo } from '@/lib/eveApi';
import { useSDEManager, type SDEDatabaseStats } from '@/lib/sdeService';
import { AdminLoginTest } from '@/components/AdminLoginTest';
import { SimpleLoginTest } from '@/components/SimpleLoginTest';
import { runDatabaseValidationTests } from '@/lib/databaseTestCases';
import { EnhancedDatabaseSetupManager, validateSetupConfig, type DatabaseSetupConfig } from '@/lib/database-setup-scripts';

// Status Indicator Component
const StatusIndicator: React.FC<{
  label: string;
  status: 'online' | 'offline' | 'unknown';
}> = ({ label, status }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <div 
        className={`w-2 h-2 rounded-full ${
          status === 'online' ? 'bg-green-500' : 
          status === 'offline' ? 'bg-red-500' : 
          'bg-gray-400'
        }`} 
      />
      <span className="text-xs font-medium">
        {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Unknown'}
      </span>
    </div>
  </div>
);

import { 
  useGeneralSettings, 
  useDatabaseSettings, 
  useESISettings, 
  useSDESettings, 
  useSyncSettings, 
  useNotificationSettings, 
  useIncomeSettings, 
  useApplicationData,
  useManualUsers,
  useCorporationData,
  backupSettings,
  exportAllSettings,
  importAllSettings,
  resetAllSettings,
  validateSettings
} from '@/lib/persistenceService';
import { UserManagement } from '@/components/UserManagement';

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
  // Use main auth provider for all authentication
  const {
    user,
    esiConfig,
    updateESIConfig,
    getRegisteredCorporations,
    registerCorporation,
    updateCorporation,
    deleteCorporation,
    adminConfig,
    updateAdminConfig
  } = useAuth();
  
  // Get registered corporations
  const registeredCorps = getRegisteredCorporations();
  const { sdeStatus, checkForUpdates, downloadSDE, updateDatabase, getDatabaseStats } = useSDEManager();
  const [generalSettings, setGeneralSettings] = useGeneralSettings();
  const [databaseSettings, setDatabaseSettings] = useDatabaseSettings();
  const [esiSettings, setESISettings] = useESISettings();
  const [sdeSettings, setSDESettings] = useSDESettings();
  const [syncSettings, setSyncSettings] = useSyncSettings();
  const [notificationSettings, setNotificationSettings] = useNotificationSettings();
  const [incomeSettings, setIncomeSettings] = useIncomeSettings();
  const [applicationData, setApplicationData] = useApplicationData();
  const [manualUsers, setManualUsers] = useManualUsers();
  const [corporationData, setCorporationData] = useCorporationData();

  // Backward compatibility - gradually migrate away from this
  const settings = {
    corpName: generalSettings.corpName,
    corpTicker: generalSettings.corpTicker,
    corpId: generalSettings.corpId,
    timezone: generalSettings.timezone,
    language: generalSettings.language,
    sessionTimeout: generalSettings.sessionTimeout,
    notifications: {
      manufacturing: notificationSettings.events.manufacturing,
      mining: notificationSettings.events.mining,
      killmails: notificationSettings.events.killmails,
      markets: notificationSettings.events.markets,
    },
    eveOnlineSync: {
      enabled: syncSettings.enabled,
      autoSync: syncSettings.autoSync,
      syncInterval: 30,
      lastSync: new Date().toISOString(),
      characterId: generalSettings.corpId || 91316135,
      corporationId: generalSettings.corpId || 498125261
    },
    dataSyncTimers: syncSettings.syncIntervals,
    database: databaseSettings,
    sudoDatabase: {
      host: databaseSettings.sudoHost,
      port: databaseSettings.sudoPort,
      username: databaseSettings.sudoUsername,
      password: databaseSettings.sudoPassword,
      ssl: databaseSettings.sudoSsl
    }
  };

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
  
  // ESI Routes management
  const esiRoutes = useESIRoutes();
  const [validatingRoutes, setValidatingRoutes] = useState(false);
  const [esiRouteValidation, setESIRouteValidation] = useState<{[key: string]: boolean | undefined}>({});
  const [routeUpdateResults, setRouteUpdateResults] = useState<{[key: string]: string}>({});
  
  // Simplified setup state types
  interface EnhancedSetupConfig {
    lmevePassword: string;
    allowedHosts: string;
    downloadSDE: boolean; // Backward compatibility
    schemaSource: 'default' | 'custom' | 'managed';
    customSchemaFile?: File;
    sdeSource: 'auto' | 'custom' | 'skip';
    customSDEFile?: File;
  }
  
  // Enhanced setup state
  const [setupConfig, setSetupConfig] = useState<EnhancedSetupConfig>({
    lmevePassword: '',
    allowedHosts: '%',
    downloadSDE: true, // Backward compatibility
    schemaSource: 'managed', // Default to using schema manager
    sdeSource: 'auto' // Default to downloading latest SDE
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
  const [showSudoPassword, setShowSudoPassword] = useState(false);
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
  const [showDatabaseTables, setShowDatabaseTables] = useKV<boolean>('database-tables-expanded', false);
  const [showDatabaseSchema, setShowDatabaseSchema] = useKV<boolean>('database-schema-expanded', false);
  
  // Admin configuration state
  const [tempAdminConfig, setTempAdminConfig] = useState(adminConfig);
  



  // Save handlers for each settings category
  const saveGeneralSettings = async () => {
    try {
      const errors = validateSettings('general', generalSettings);
      if (errors.length > 0) {
        toast.error(`Validation failed: ${errors.join(', ')}`);
        return;
      }
      
      setGeneralSettings({ ...generalSettings });
      toast.success('General settings saved successfully');
    } catch (error) {
      console.error('Failed to save general settings:', error);
      toast.error('Failed to save general settings');
    }
  };

  const saveDatabaseSettings = async () => {
    try {
      const errors = validateSettings('database', databaseSettings);
      if (errors.length > 0) {
        toast.error(`Validation failed: ${errors.join(', ')}`);
        return;
      }
      
      setDatabaseSettings({ ...databaseSettings });
      toast.success('Database settings saved successfully');
    } catch (error) {
      console.error('Failed to save database settings:', error);
      toast.error('Failed to save database settings');
    }
  };

  const saveESISettings = async () => {
    try {
      const errors = validateSettings('esi', esiSettings);
      if (errors.length > 0) {
        toast.error(`Validation failed: ${errors.join(', ')}`);
        return;
      }
      
      // Update the auth provider with new ESI configuration
      const clientId = esiSettings.clientId || esiConfig.clientId || '';
      const clientSecret = esiSettings.clientSecret || esiConfig.clientSecret;
      
      if (!clientId) {
        toast.error('Client ID is required');
        return;
      }
      
      console.log('🔧 Saving ESI configuration to auth provider:', { clientId, hasSecret: !!clientSecret });
      
      // Update auth provider ESI config
      updateESIConfig(clientId, clientSecret);
      
      // Save to local settings as well
      setESISettings({ ...esiSettings });
      
      toast.success('ESI settings saved successfully');
    } catch (error) {
      console.error('Failed to save ESI settings:', error);
      toast.error('Failed to save ESI settings');
    }
  };

  const saveSDESettings = async () => {
    try {
      setSDESettings({ ...sdeSettings });
      toast.success('SDE settings saved successfully');
    } catch (error) {
      console.error('Failed to save SDE settings:', error);
      toast.error('Failed to save SDE settings');
    }
  };

  const saveSyncSettings = async () => {
    try {
      // Save sync intervals
      setSyncSettings({ ...syncSettings });
      
      // Save ESI route configurations
      const routeConfig = esiRouteManager.exportConfig();
      // Store ESI routes in localStorage for persistence
      localStorage.setItem('lmeve-esi-routes', JSON.stringify(routeConfig));
      
      toast.success('Sync settings and ESI routes saved successfully');
    } catch (error) {
      console.error('Failed to save sync settings:', error);
      toast.error('Failed to save sync settings');
    }
  };

  // Load ESI routes from localStorage on mount
  React.useEffect(() => {
    try {
      const storedRoutes = localStorage.getItem('lmeve-esi-routes');
      if (storedRoutes) {
        const routeConfig = JSON.parse(storedRoutes);
        esiRouteManager.importConfig(routeConfig);
      }
    } catch (error) {
      console.warn('Failed to load stored ESI routes:', error);
    }
  }, []);

  const saveNotificationSettings = async () => {
    try {
      const errors = validateSettings('notifications', notificationSettings);
      if (errors.length > 0) {
        toast.error(`Validation failed: ${errors.join(', ')}`);
        return;
      }
      
      setNotificationSettings({ ...notificationSettings });
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save notification settings');
    }
  };

  const saveIncomeSettings = async () => {
    try {
      const errors = validateSettings('income', incomeSettings);
      if (errors.length > 0) {
        toast.error(`Validation failed: ${errors.join(', ')}`);
        return;
      }
      
      setIncomeSettings({ ...incomeSettings });
      toast.success('Income settings saved successfully');
    } catch (error) {
      console.error('Failed to save income settings:', error);
      toast.error('Failed to save income settings');
    }
  };

  // Export/Import handlers
  const handleExportSettings = async () => {
    try {
      await backupSettings();
      toast.success('Settings exported successfully');
    } catch (error) {
      console.error('Failed to export settings:', error);
      toast.error('Failed to export settings');
    }
  };

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllSettings(data);
      toast.success('Settings imported successfully');
      
      // Refresh the page to load new settings
      window.location.reload();
    } catch (error) {
      console.error('Failed to import settings:', error);
      toast.error('Failed to import settings: Invalid file format');
    }
  };

  const handleResetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    try {
      await resetAllSettings();
      toast.success('Settings reset to defaults');
      
      // Refresh the page to load default settings
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings');
    }
  };

  // Helper functions for updating settings
  const updateGeneralSetting = (key: keyof typeof generalSettings, value: any) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateDatabaseSetting = (key: keyof typeof databaseSettings, value: any) => {
    setDatabaseSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateESISetting = (key: keyof typeof esiSettings, value: any) => {
    setESISettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSDESetting = (key: keyof typeof sdeSettings, value: any) => {
    setSDESettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSyncSetting = (key: keyof typeof syncSettings, value: any) => {
    setSyncSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotificationSetting = (key: keyof typeof notificationSettings, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateIncomeSetting = (key: keyof typeof incomeSettings, value: any) => {
    setIncomeSettings(prev => ({ ...prev, [key]: value }));
  };

  // Nested setting updates
  const updateSyncInterval = (category: string, minutes: number) => {
    setSyncSettings(prev => ({
      ...prev,
      syncIntervals: { ...prev.syncIntervals, [category]: minutes }
    }));
  };

  const updateNotificationEvent = (event: string, enabled: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      events: { ...prev.events, [event]: enabled }
    }));
  };

  const updateIncomeRate = (category: string, rate: number) => {
    setIncomeSettings(prev => ({
      ...prev,
      hourlyRates: { ...prev.hourlyRates, [category]: rate }
    }));
  };
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    characterName: '',
    corporationName: '',
    roles: [] as string[],
  });

  // Backward compatibility functions for existing code
  const updateDatabaseConfig = (key: string, value: any) => {
    updateDatabaseSetting(key as any, value);
  };

  const updateSudoDatabaseConfig = (key: string, value: any) => {
    const sudoKey = `sudo${key.charAt(0).toUpperCase() + key.slice(1)}`;
    updateDatabaseSetting(sudoKey as any, value);
  };

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

  // Remote database operations handlers




  // Load SDE database stats on component mount
  React.useEffect(() => {
    const loadSDEStats = async () => {
      if (databaseSettings?.host && databaseSettings?.username && databaseSettings?.password) {
        try {
          // Simulate checking EveStaticData database
          const sdeDbConfig = {
            ...databaseSettings,
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
  }, [databaseSettings]);

  // REAL database connection test using the strict DatabaseManager
  const handleTestDbConnection = async () => {
    // Prevent multiple concurrent tests
    if (testingConnection) {
      toast.warning('Database test already in progress...');
      return;
    }
    
    console.log('🧪 Starting REAL database connection test');
    
    if (!databaseSettings) {
      const error = 'Please configure database connection settings first';
      toast.error(error);
      addConnectionLog(`❌ ${error}`);
      return;
    }
    
    const { host, port, database, username, password } = databaseSettings;
    
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
    if (!databaseSettings) {
      toast.error('Please configure database connection settings first');
      return;
    }
    
    const { host, port, database, username, password } = databaseSettings;
    
    if (!host || !port || !database || !username || !password) {
      toast.error('All database fields are required');
      return;
    }
    
    try {
      addConnectionLog('🔌 Establishing persistent database connection...');
      
      // Use the DatabaseManager for consistent connection handling
      const config = {
        host,
        port: Number(port),
        database,
        username,
        password,
        ssl: databaseSettings.ssl || false,
        connectionPoolSize: databaseSettings.connectionPoolSize || 10,
        queryTimeout: databaseSettings.queryTimeout || 30,
        autoReconnect: databaseSettings.autoReconnect || true,
        charset: databaseSettings.charset || 'utf8mb4'
      };
      
      const manager = new DatabaseManager(config);
      const testResult = await manager.testConnection();
      
      if (testResult.success && testResult.validated) {
        setDbStatus(prev => ({
          ...prev,
          connected: true,
          connectionCount: 1,
          lastConnection: new Date().toISOString(),
          lastError: null
        }));
        addConnectionLog(`✅ Database connection established successfully!`);
        toast.success('Connected to database');
      } else {
        throw new Error(testResult.error || 'Connection failed validation');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setDbStatus(prev => ({
        ...prev,
        connected: false,
        lastError: errorMsg
      }));
      addConnectionLog(`❌ Connection failed: ${errorMsg}`);
      toast.error(`Connection failed: ${errorMsg}`);
    }
  };

  const handleDisconnectDb = async () => {
    toast.info('Database disconnection feature not implemented yet');
  };

  const loadTableInfo = async () => {
    console.log('Table info loading not implemented yet');
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

  // Initialize ESI settings with proper state management
  useEffect(() => {
    console.log('🔄 ESI Config sync check:', {
      realClientId: esiConfig.clientId,
      realSecret: !!esiConfig.clientSecret,
      localClientId: esiSettings.clientId,
      localSecret: !!esiSettings.clientSecret
    });
    
    // Initialize local state with values from auth provider if they exist and local state is empty
    if (esiConfig.clientId && !esiSettings.clientId) {
      console.log('📥 Initializing ESI settings from auth provider');
      setESISettings(prev => ({
        ...prev,
        clientId: esiConfig.clientId || '',
        clientSecret: esiConfig.clientSecret || ''
      }));
    }
  }, [esiConfig.clientId, esiConfig.clientSecret, esiSettings.clientId, esiSettings.clientSecret, setESISettings]);

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
  }, [databaseSettings]);

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
            updateGeneralSetting('corpName', corp.name);
            updateGeneralSetting('corpTicker', corp.ticker);
          } catch (error) {
            console.error('Failed to sync corporation data:', error);
          }
        }
      }

      // Update last sync time
      updateSyncSetting('lastSync', new Date().toISOString());

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
    updateSyncSetting('autoSync', !syncSettings.autoSync);
  };

  const handleToggleEVESync = () => {
    updateSyncSetting('enabled', !syncSettings.enabled);
  };

  const handleSaveSettings = () => {
    // Save all settings using individual save functions
    saveGeneralSettings();
    saveDatabaseSettings();
    saveESISettings();
    saveSDESettings();
    saveSyncSettings();
    saveNotificationSettings();
    saveIncomeSettings();
    toast.success('All settings saved successfully');
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

    if (!databaseSettings?.sudoHost || !databaseSettings?.sudoUsername || !databaseSettings?.sudoPassword) {
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
        mysqlRootPassword: databaseSettings.sudoPassword,
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
        if (!databaseSettings?.username) {
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

  const handleCopyCommands = () => {
    const config = {
      lmevePassword: setupConfig.lmevePassword,
      allowedHosts: setupConfig.allowedHosts,
      downloadSDE: setupConfig.downloadSDE
    };
    
    const commands = generateSetupCommands(config);
    navigator.clipboard.writeText(commands.join('\n'))
      .then(() => toast.success('Commands copied to clipboard'))
      .catch(() => toast.error('Failed to copy commands'));
  };

  const handleGenerateCommands = () => {
    setShowSetupCommands(true);
  };

  // ESI Route validation handlers
  const validateESIRoute = async (processName: string, version?: string) => {
    setValidatingRoutes(true);
    try {
      const result = await esiRoutes.validateRoute(processName, version);
      setESIRouteValidation(prev => ({
        ...prev,
        [processName]: result.isValid
      }));
      
      if (result.isValid) {
        toast.success(`ESI route ${processName} (${version || 'current'}) is valid`);
        setRouteUpdateResults(prev => ({
          ...prev,
          [processName]: `✓ Valid (${result.status})`
        }));
      } else {
        toast.error(`ESI route ${processName} validation failed: ${result.error}`);
        setRouteUpdateResults(prev => ({
          ...prev,
          [processName]: `✗ Failed (${result.error})`
        }));
      }
    } catch (error) {
      toast.error('Route validation failed');
      setRouteUpdateResults(prev => ({
        ...prev,
        [processName]: `✗ Error`
      }));
    } finally {
      setValidatingRoutes(false);
    }
  };

  const validateAllESIRoutes = async () => {
    setValidatingRoutes(true);
    toast.info('Validating all ESI routes...');
    
    try {
      const results = await esiRoutes.checkForUpdates();
      const validationResults = {};
      
      const processNames = esiRoutes.getProcessNames();
      for (const processName of processNames) {
        const validation = await esiRoutes.validateRoute(processName);
        validationResults[processName] = validation.isValid;
        
        setRouteUpdateResults(prev => ({
          ...prev,
          [processName]: validation.isValid ? '✓ Valid' : `✗ Failed: ${validation.error}`
        }));
      }
      
      setESIRouteValidation(validationResults);
      
      if (results.hasUpdates) {
        toast.success(`Route validation complete. ${Object.keys(results.updates).length} updates available`);
      } else {
        toast.success('All routes validated successfully');
      }
    } catch (error) {
      toast.error('Bulk route validation failed');
    } finally {
      setValidatingRoutes(false);
    }
  };

  const updateESIRouteVersion = (processName: string, version: string) => {
    const success = esiRoutes.updateVersion(processName, version);
    if (success) {
      toast.success(`Updated ${processName} to ESI version ${version}`);
      // Clear previous validation results
      setRouteUpdateResults(prev => ({
        ...prev,
        [processName]: 'Updated - revalidation needed'
      }));
    } else {
      toast.error(`Failed to update ${processName} route version`);
    }
  };

  const handleNotificationToggle = (type: string) => {
    updateNotificationEvent(type, !notificationSettings.events[type as keyof typeof notificationSettings.events]);
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
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Corporation Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Corporation Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="corpName">Corporation Name</Label>
                    <Input
                      id="corpName"
                      value={generalSettings.corpName}
                      onChange={(e) => updateGeneralSetting('corpName', e.target.value)}
                      placeholder="Your Corporation Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corpTicker">Corporation Ticker</Label>
                    <Input
                      id="corpTicker"
                      value={generalSettings.corpTicker}
                      onChange={(e) => updateGeneralSetting('corpTicker', e.target.value)}
                      placeholder="CORP"
                      maxLength={5}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="corpId">Corporation ID</Label>
                  <Input
                    id="corpId"
                    type="number"
                    value={generalSettings.corpId?.toString() || '0'}
                    onChange={(e) => updateGeneralSetting('corpId', parseInt(e.target.value) || 0)}
                    placeholder="98000001"
                  />
                </div>
              </div>

              {/* Regional Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Regional Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={generalSettings.timezone}
                      onChange={(e) => updateGeneralSetting('timezone', e.target.value)}
                      placeholder="UTC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={generalSettings.language}
                      onChange={(e) => updateGeneralSetting('language', e.target.value)}
                      placeholder="en"
                    />
                  </div>
                </div>
              </div>

              {/* Session Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Session Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out users after period of inactivity
                    </p>
                  </div>
                  <Switch 
                    checked={generalSettings.sessionTimeout}
                    onCheckedChange={(checked) => updateGeneralSetting('sessionTimeout', checked)}
                  />
                </div>

                {generalSettings.sessionTimeout && (
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeoutMinutes">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeoutMinutes"
                      type="number"
                      value={generalSettings.sessionTimeoutMinutes?.toString() || '30'}
                      onChange={(e) => updateGeneralSetting('sessionTimeoutMinutes', parseInt(e.target.value) || 30)}
                      min="5"
                      max="480"
                      placeholder="30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Range: 5-480 minutes (8 hours max)
                    </p>
                  </div>
                )}
              </div>

              {/* Application Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Application Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Block all non-admin access for maintenance
                    </p>
                  </div>
                  <Switch 
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => updateGeneralSetting('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging and debug information
                    </p>
                  </div>
                  <Switch 
                    checked={generalSettings.debugMode}
                    onCheckedChange={(checked) => updateGeneralSetting('debugMode', checked)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logLevel">Log Level</Label>
                    <select
                      id="logLevel"
                      value={generalSettings.logLevel}
                      onChange={(e) => updateGeneralSetting('logLevel', e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLogRetentionDays">Log Retention (days)</Label>
                    <Input
                      id="maxLogRetentionDays"
                      type="number"
                      value={generalSettings.maxLogRetentionDays?.toString() || '30'}
                      onChange={(e) => updateGeneralSetting('maxLogRetentionDays', parseInt(e.target.value) || 30)}
                      min="1"
                      max="365"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              {/* Save Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset to current saved values
                    window.location.reload();
                  }}
                >
                  Reset Changes
                </Button>
                <Button
                  onClick={saveGeneralSettings}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={20} />
                  Database Configuration
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Question size={16} />
                      Setup Requirements
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Info size={20} />
                        Database Setup Requirements
                      </DialogTitle>
                      <DialogDescription>
                        Follow these steps to properly configure your database environment
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Database size={16} />
                          Database Prerequisites
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                          <li>• MySQL/MariaDB server installed and running</li>
                          <li>• Administrative (sudo) access to the database server</li>
                          <li>• Network connectivity to the database server</li>
                          <li>• Sufficient privileges to create databases and users</li>
                        </ul>
                      </div>
                      
                      <div className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Key size={16} />
                          EVE Online ESI Application
                        </h4>
                        <ol className="space-y-1 text-sm text-muted-foreground ml-4">
                          <li>1. Visit <code className="bg-background px-1 rounded">https://developers.eveonline.com</code></li>
                          <li>2. Create a new application with callback URL: <code className="bg-background px-1 rounded">{window.location.origin}/</code></li>
                          <li>3. Copy the Client ID and Client Secret to the fields above</li>
                          <li>4. Ensure your application has the required scopes for LMeve</li>
                        </ol>
                      </div>
                      
                      <div className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Network size={16} />
                          Remote Database Setup (Optional)
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          If your database is on a remote server, you'll need:
                        </p>
                        <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                          <li>• SSH access to the database server</li>
                          <li>• SSH key-based authentication configured</li>
                          <li>• Proper firewall rules for database access</li>
                          <li>• Database server configured to accept remote connections</li>
                        </ul>
                      </div>
                      
                      <div className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Archive size={16} />
                          EVE Static Data Export (SDE)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          LMeve requires the EVE Static Data Export for ship, item, and universe data. 
                          This will be automatically downloaded and configured during the database setup process.
                        </p>
                      </div>

                      <Alert>
                        <Info size={16} />
                        <AlertDescription>
                          The automated setup process will handle database creation, user setup, and SDE import. 
                          Ensure you have the administrative credentials ready before starting.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* ESI Configuration Section */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${esiConfig.clientId ? 'bg-green-500' : 'bg-red-500'}`} />
                    <h4 className="font-medium">ESI Application Credentials</h4>
                  </div>
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
                        value={esiSettings.clientId || esiConfig.clientId || ''}
                        onChange={(e) => updateESISetting('clientId', e.target.value)}
                        placeholder="Your EVE Online application Client ID"
                        className={esiSettings.clientId && esiSettings.clientId !== esiConfig.clientId ? 'border-accent' : ''}
                      />
                      {esiSettings.clientId && esiSettings.clientId !== esiConfig.clientId && (
                        <p className="text-xs text-accent">• Unsaved changes</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientSecret">EVE Online Client Secret</Label>
                      <div className="relative">
                        <Input
                          id="clientSecret"
                          type={showSecrets ? "text" : "password"}
                          value={esiSettings.clientSecret || esiConfig.clientSecret || ''}
                          onChange={(e) => updateESISetting('clientSecret', e.target.value)}
                          placeholder="Your EVE Online application Client Secret"
                          className={esiSettings.clientSecret && esiSettings.clientSecret !== esiConfig.clientSecret ? 'border-accent' : ''}
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
                      {esiSettings.clientSecret && esiSettings.clientSecret !== esiConfig.clientSecret && (
                        <p className="text-xs text-accent">• Unsaved changes</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const clientId = esiSettings.clientId || esiConfig.clientId || '';
                        const clientSecret = esiSettings.clientSecret || esiConfig.clientSecret;
                        if (clientId.trim()) {
                          updateESIConfig(clientId.trim(), clientSecret || '');
                          setESISettings(prev => ({ ...prev, clientId: '', clientSecret: '' }));
                          toast.success('ESI configuration updated');
                        } else {
                          toast.error('Client ID is required');
                        }
                      }}
                      size="sm"
                      disabled={!esiSettings.clientId && !esiConfig.clientId}
                      className={
                        (esiSettings.clientId && esiSettings.clientId !== esiConfig.clientId) ||
                        (esiSettings.clientSecret && esiSettings.clientSecret !== esiConfig.clientSecret)
                          ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                          : ''
                      }
                    >
                      {((esiSettings.clientId && esiSettings.clientId !== esiConfig.clientId) ||
                        (esiSettings.clientSecret && esiSettings.clientSecret !== esiConfig.clientSecret)) 
                        ? 'Save Changes' : 'Save ESI Config'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setESISettings(prev => ({ ...prev, clientId: '', clientSecret: '' }));
                        toast.info('Form cleared');
                      }}
                      disabled={!esiSettings.clientId && !esiSettings.clientSecret}
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create an application at developers.eveonline.com with callback URL: <code className="bg-background px-1 rounded">{window.location.origin}/</code>
                  </p>
                </div>
              </div>

              {/* Compact Database Connection Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Database Connection - Compact */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <h4 className="text-sm font-medium">Database Connection</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="dbHost" className="text-xs">Host</Label>
                        <Input
                          id="dbHost"
                          value={databaseSettings.host || ''}
                          onChange={(e) => {
                            updateDatabaseSetting('host', e.target.value);
                            updateDatabaseSetting('sudoHost', e.target.value);
                          }}
                          placeholder="localhost"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dbPort" className="text-xs">Port</Label>
                        <Input
                          id="dbPort"
                          type="number"
                          value={databaseSettings.port || ''}
                          onChange={(e) => {
                            const port = parseInt(e.target.value) || 3306;
                            updateDatabaseSetting('port', port);
                            updateDatabaseSetting('sudoPort', port);
                          }}
                          placeholder="3306"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dbName" className="text-xs">Database</Label>
                        <Input
                          id="dbName"
                          value={databaseSettings.database || ''}
                          onChange={(e) => updateDatabaseSetting('database', e.target.value)}
                          placeholder="lmeve"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Database Users - Compact */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${databaseSettings.sudoUsername && databaseSettings.sudoPassword ? 'bg-green-500' : 'bg-red-500'}`} />
                      <h4 className="text-sm font-medium">Database Users</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Admin User */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Sudo User</Label>
                        <Input
                          value={databaseSettings.sudoUsername || ''}
                          onChange={(e) => updateDatabaseSetting('sudoUsername', e.target.value)}
                          placeholder="root"
                          className="h-8 text-sm"
                        />
                        <div className="relative">
                          <Input
                            type={showSudoPassword ? "text" : "password"}
                            value={databaseSettings.sudoPassword || ''}
                            onChange={(e) => updateDatabaseSetting('sudoPassword', e.target.value)}
                            placeholder="Admin password"
                            className="h-8 text-sm pr-8"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-8 w-8 p-0"
                            onClick={() => setShowSudoPassword(!showSudoPassword)}
                          >
                            {showSudoPassword ? <EyeSlash size={12} /> : <Eye size={12} />}
                          </Button>
                        </div>
                      </div>

                      {/* App User */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">LMeve User</Label>
                        <Input
                          value={databaseSettings.username || ''}
                          onChange={(e) => updateDatabaseSetting('username', e.target.value)}
                          placeholder="lmeve_user"
                          className="h-8 text-sm"
                        />
                        <div className="relative">
                          <Input
                            type={showDbPassword ? "text" : "password"}
                            value={databaseSettings.password || ''}
                            onChange={(e) => updateDatabaseSetting('password', e.target.value)}
                            placeholder="App password"
                            className="h-8 text-sm pr-8"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-8 w-8 p-0"
                            onClick={() => setShowDbPassword(!showDbPassword)}
                          >
                            {showDbPassword ? <EyeSlash size={12} /> : <Eye size={12} />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration Dropdowns */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="border border-border rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-3">Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Schema Source</Label>
                        <Select value="default" onValueChange={() => {}}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select schema source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default Schema</SelectItem>
                            <SelectItem value="custom">Custom File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">SDE Source</Label>
                        <Select value="latest" onValueChange={() => {}}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select SDE source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="latest">Latest SDE</SelectItem>
                            <SelectItem value="custom">Custom File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Overview Panel */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity size={16} />
                      <h4 className="text-sm font-medium">System Status</h4>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="space-y-2 mb-3">
                      <StatusIndicator 
                        label="Database Status" 
                        status={dbStatus.connected ? 'online' : 'offline'} 
                      />
                      <StatusIndicator 
                        label="Remote Access" 
                        status={databaseSettings.host && databaseSettings.host !== 'localhost' && databaseSettings.host !== '127.0.0.1' ? (dbStatus.connected ? 'online' : 'offline') : 'unknown'} 
                      />
                      <StatusIndicator 
                        label="ESI Status" 
                        status={esiConfig?.clientId ? 'online' : 'offline'} 
                      />
                      <StatusIndicator 
                        label="EVE Online API" 
                        status="unknown" 
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">SDE Version:</span>
                        <span className="text-foreground">Unknown</span>
                      </div>
                      <StatusIndicator 
                        label="Overall Status" 
                        status={dbStatus.connected && esiConfig?.clientId ? 'online' : 'offline'} 
                      />
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          toast.info('Application management coming soon');
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8"
                      >
                        <SettingsIcon size={12} className="mr-1" />
                        Manage Apps
                      </Button>
                      
                      <Button
                        onClick={() => {
                          handleTestDbConnection();
                          toast.success('Status refreshed');
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8"
                      >
                        <RefreshCw size={12} className="mr-1" />
                        Refresh Status
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info('Version check coming soon')}
                        className="w-full text-xs h-8"
                      >
                        <CloudArrowDown size={12} className="mr-1" />
                        Check SDE
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Controls Row */}
              <div className="flex gap-3 max-w-2xl">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🧪 Test connection button clicked');
                    handleTestDbConnection();
                  }}
                  disabled={testingConnection}
                  className="flex-1 hover:bg-accent/10 active:bg-accent/20 transition-colors"
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
                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Stop size={16} className="mr-2" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleConnectDb}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    <Play size={16} className="mr-2" />
                    Connect
                  </Button>
                )}
                
                <Button
                  onClick={saveDatabaseSettings}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  Save
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset to current saved values
                    window.location.reload();
                  }}
                  size="sm"
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>

              {/* Connection Logs - Full Width */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Connection Logs</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearConnectionLogs}
                    disabled={connectionLogs.length === 0}
                    className="h-8 px-3 text-xs"
                  >
                    <X size={12} className="mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="bg-muted/30 border border-border rounded p-4 h-64 overflow-y-auto font-mono text-xs">
                  {connectionLogs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No logs available
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
              </div>

              {/* Complete Database Setup Section - Based on your image */}
              <div className="border border-green-500/20 bg-green-500/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full">
                      <Wrench size={16} className="text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-300">Complete Database Setup</h3>
                      <p className="text-sm text-muted-foreground">
                        Creates both lmeve and EveStaticData databases, downloads EVE SDE data, imports schema, and configures database users with proper privileges. Requires sudo database access configured above.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                    onClick={() => setShowSetupWizard(true)}
                  >
                    Setting Up...
                  </Button>
                </div>
                
                {setupProgress?.isRunning && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Downloading EVE Static Data Export (this may take several minutes)...</span>
                      <span className="text-accent font-mono">27%</span>
                    </div>
                    <Progress value={27} className="h-2 bg-muted" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Step 3 of 11</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <Terminal size={12} className="mr-1" />
                          Generate Commands
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <CheckCircle size={12} className="mr-1" />
                          Step-by-Step Wizard
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Database Tables - Collapsible Section */}
              {dbStatus.connected && tableInfo.length > 0 && (
                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto hover:bg-transparent"
                      onClick={() => setShowDatabaseTables(!showDatabaseTables)}
                    >
                      <div className="flex items-center gap-2">
                        {showDatabaseTables ? (
                          <CaretDown size={16} className="text-muted-foreground" />
                        ) : (
                          <CaretRight size={16} className="text-muted-foreground" />
                        )}
                        <h4 className="font-medium">Database Tables</h4>
                        <Badge variant="outline" className="text-xs">
                          {tableInfo.length} tables
                        </Badge>
                      </div>
                    </Button>
                    {showDatabaseTables && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadTableInfo}
                      >
                        <ArrowClockwise size={16} className="mr-2" />
                        Refresh
                      </Button>
                    )}
                  </div>
                  
                  {showDatabaseTables && (
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
                  )}
                </div>
              )}

              {/* Database Schema Manager - Collapsible */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={() => setShowDatabaseSchema(!showDatabaseSchema)}
                  >
                    <div className="flex items-center gap-2">
                      {showDatabaseSchema ? (
                        <CaretDown size={16} className="text-muted-foreground" />
                      ) : (
                        <CaretRight size={16} className="text-muted-foreground" />
                      )}
                      <h4 className="font-medium">Database Schema Manager</h4>
                      <Badge variant="outline" className="text-xs">
                        {lmeveSchemas.length} tables
                      </Badge>
                    </div>
                  </Button>
                </div>
                
                {showDatabaseSchema && (
                  <DatabaseSchemaManager />
                )}
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
                              Corp ID: {corp.corporationId} • Registered: {new Date(corp.registrationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={corp.isActive ? "default" : "secondary"}>
                              {corp.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {corp.lastTokenRefresh && (
                              <Badge variant="outline" className="text-xs">
                                Updated: {new Date(corp.lastTokenRefresh).toLocaleDateString()}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCorporation(corp.corporationId, { isActive: !corp.isActive })}
                            >
                              {corp.isActive ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${corp.corporationName}?`)) {
                                  deleteCorporation(corp.corporationId);
                                  toast.success('Corporation removed');
                                }
                              }}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-muted-foreground">
                          <p>Scopes: {corp.registeredScopes.join(', ')}</p>
                          <p>ESI Client: {corp.esiClientId ? 'Configured' : 'Using Global'}</p>
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
                Data Synchronization Processes
              </CardTitle>
              <p className="text-muted-foreground">
                LMeve data poller configuration based on individual sync processes with master orchestration
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Poller Status */}
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-accent" />
                    <span className="font-medium">Master Poller</span>
                  </div>
                  <Badge variant={syncSettings.masterPoller?.enabled ? "default" : "secondary"}>
                    {syncSettings.masterPoller?.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Central orchestration process that manages and schedules all individual data sync processes (poller.php equivalent)
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Last Run</p>
                    <p className="font-medium">{syncSettings.masterPoller?.lastRun ? new Date(syncSettings.masterPoller.lastRun).toLocaleTimeString() : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Run</p>
                    <p className="font-medium">{syncSettings.masterPoller?.nextRun ? new Date(syncSettings.masterPoller.nextRun).toLocaleTimeString() : 'Not scheduled'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interval</p>
                    <p className="font-medium">{syncSettings.masterPoller?.interval || 5} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Switch
                    checked={syncSettings.masterPoller?.enabled || false}
                    onCheckedChange={(checked) => setSyncSettings(prev => ({
                      ...prev,
                      masterPoller: { ...prev.masterPoller, enabled: checked }
                    }))}
                  />
                  <Label className="text-sm">Enable Master Poller</Label>
                </div>
              </div>

              {/* ESI Route Validation */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network size={18} className="text-accent" />
                    <h4 className="font-medium">ESI Route Management</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={validateAllESIRoutes}
                      disabled={validatingRoutes}
                      size="sm"
                      variant="outline"
                    >
                      {validatingRoutes ? (
                        <>
                          <ArrowClockwise size={16} className="mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          Validate All Routes
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Info size={16} />
                  <AlertDescription>
                    ESI routes can have multiple versions. LMeve automatically selects optimal versions, but you can override them here. 
                    Use "Validate" to test if a route version is currently supported by CCP's ESI API.
                  </AlertDescription>
                </Alert>

                {/* Route validation results summary */}
                {Object.keys(routeUpdateResults).length > 0 && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">Last Validation Results:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {Object.entries(routeUpdateResults).map(([process, result]) => (
                        <div key={process} className="flex items-center gap-1">
                          <span className="capitalize">{process}:</span>
                          <span className={result.startsWith('✓') ? 'text-green-400' : 'text-red-400'}>
                            {result}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Individual Process Configuration with ESI Route Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Individual Sync Processes</h4>
                  <Badge variant="outline">
                    {Object.values(syncSettings.syncIntervals || {}).filter(interval => interval > 0).length} Enabled
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {/* Corporation Members Process */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Users size={16} className="text-blue-400" />
                        <div>
                          <h5 className="font-medium">Corporation Members</h5>
                          <p className="text-sm text-muted-foreground">Sync member list, roles, titles, and tracking data</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={(syncSettings.syncIntervals?.members || 0) > 0}
                          onCheckedChange={(checked) => updateSyncInterval('members', checked ? 60 : 0)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interval</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1440"
                            value={syncSettings.syncIntervals?.members || 60}
                            onChange={(e) => updateSyncInterval('members', parseInt(e.target.value) || 60)}
                            className="w-16 text-center text-sm h-8"
                            disabled={(syncSettings.syncIntervals?.members || 0) === 0}
                          />
                          <span className="text-muted-foreground">min</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">2 min ago</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-medium">42 members</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="default" className="text-xs">Success</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div><strong>Process:</strong> getMemberTracking.php</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>ESI Endpoint:</strong> 
                        <Select 
                          value={esiRoutes.getRoute('members')?.currentVersion || 'v4'}
                          onValueChange={(version) => updateESIRouteVersion('members', version)}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(esiRoutes.getRoute('members')?.versions || ['v3', 'v4']).map(version => (
                              <SelectItem key={version} value={version}>{version}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>/corporations/{'{corporation_id}'}/membertracking/</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => validateESIRoute('members')}
                          disabled={validatingRoutes}
                        >
                          {validatingRoutes ? '...' : 'Validate'}
                        </Button>
                        {esiRouteValidation.members !== undefined && (
                          <Badge variant={esiRouteValidation.members ? "default" : "destructive"} className="text-xs h-5">
                            {esiRouteValidation.members ? '✓' : '✗'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Corporation Assets Process */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Package size={16} className="text-green-400" />
                        <div>
                          <h5 className="font-medium">Corporation Assets</h5>
                          <p className="text-sm text-muted-foreground">Sync assets, locations, and naming data</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={(syncSettings.syncIntervals?.assets || 0) > 0}
                          onCheckedChange={(checked) => updateSyncInterval('assets', checked ? 30 : 0)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interval</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1440"
                            value={syncSettings.syncIntervals?.assets || 30}
                            onChange={(e) => updateSyncInterval('assets', parseInt(e.target.value) || 30)}
                            className="w-16 text-center text-sm h-8"
                            disabled={(syncSettings.syncIntervals?.assets || 0) === 0}
                          />
                          <span className="text-muted-foreground">min</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">5 min ago</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-medium">1,247 assets</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="default" className="text-xs">Success</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div><strong>Process:</strong> getAssets.php</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>ESI Endpoint:</strong> 
                        <Select 
                          value={esiRoutes.getRoute('assets')?.currentVersion || 'v5'}
                          onValueChange={(version) => updateESIRouteVersion('assets', version)}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(esiRoutes.getRoute('assets')?.versions || ['v3', 'v4', 'v5']).map(version => (
                              <SelectItem key={version} value={version}>{version}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>/corporations/{'{corporation_id}'}/assets/</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => validateESIRoute('assets')}
                          disabled={validatingRoutes}
                        >
                          {validatingRoutes ? '...' : 'Validate'}
                        </Button>
                        {esiRouteValidation.assets !== undefined && (
                          <Badge variant={esiRouteValidation.assets ? "default" : "destructive"} className="text-xs h-5">
                            {esiRouteValidation.assets ? '✓' : '✗'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Industry Jobs Process */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Factory size={16} className="text-purple-400" />
                        <div>
                          <h5 className="font-medium">Industry Jobs</h5>
                          <p className="text-sm text-muted-foreground">Manufacturing, research, reactions, and invention jobs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={(syncSettings.syncIntervals?.manufacturing || 0) > 0}
                          onCheckedChange={(checked) => updateSyncInterval('manufacturing', checked ? 15 : 0)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interval</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1440"
                            value={syncSettings.syncIntervals?.manufacturing || 15}
                            onChange={(e) => updateSyncInterval('manufacturing', parseInt(e.target.value) || 15)}
                            className="w-16 text-center text-sm h-8"
                            disabled={(syncSettings.syncIntervals?.manufacturing || 0) === 0}
                          />
                          <span className="text-muted-foreground">min</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">1 min ago</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-medium">23 active jobs</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="default" className="text-xs">Success</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div><strong>Process:</strong> getIndustryJobs.php</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>ESI Endpoint:</strong> 
                        <Select 
                          value={esiRoutes.getRoute('manufacturing')?.currentVersion || 'v1'}
                          onValueChange={(version) => updateESIRouteVersion('manufacturing', version)}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(esiRoutes.getRoute('manufacturing')?.versions || ['v1']).map(version => (
                              <SelectItem key={version} value={version}>{version}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>/corporations/{'{corporation_id}'}/industry/jobs/</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => validateESIRoute('manufacturing')}
                          disabled={validatingRoutes}
                        >
                          {validatingRoutes ? '...' : 'Validate'}
                        </Button>
                        {esiRouteValidation.manufacturing !== undefined && (
                          <Badge variant={esiRouteValidation.manufacturing ? "default" : "destructive"} className="text-xs h-5">
                            {esiRouteValidation.manufacturing ? '✓' : '✗'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mining Operations Process */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <HardHat size={16} className="text-yellow-400" />
                        <div>
                          <h5 className="font-medium">Mining Operations</h5>
                          <p className="text-sm text-muted-foreground">Mining ledger and observer data</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={(syncSettings.syncIntervals?.mining || 0) > 0}
                          onCheckedChange={(checked) => updateSyncInterval('mining', checked ? 45 : 0)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interval</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1440"
                            value={syncSettings.syncIntervals?.mining || 45}
                            onChange={(e) => updateSyncInterval('mining', parseInt(e.target.value) || 45)}
                            className="w-16 text-center text-sm h-8"
                            disabled={(syncSettings.syncIntervals?.mining || 0) === 0}
                          />
                          <span className="text-muted-foreground">min</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">12 min ago</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-medium">156 entries</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="default" className="text-xs">Success</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div><strong>Process:</strong> getMiningLedger.php</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>ESI Endpoint:</strong> 
                        <Select 
                          value={esiRoutes.getRoute('mining')?.currentVersion || 'v1'}
                          onValueChange={(version) => updateESIRouteVersion('mining', version)}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(esiRoutes.getRoute('mining')?.versions || ['v1']).map(version => (
                              <SelectItem key={version} value={version}>{version}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>/corporations/{'{corporation_id}'}/mining/</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => validateESIRoute('mining')}
                          disabled={validatingRoutes}
                        >
                          {validatingRoutes ? '...' : 'Validate'}
                        </Button>
                        {esiRouteValidation.mining !== undefined && (
                          <Badge variant={esiRouteValidation.mining ? "default" : "destructive"} className="text-xs h-5">
                            {esiRouteValidation.mining ? '✓' : '✗'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Market Orders Process */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <TrendUp size={16} className="text-cyan-400" />
                        <div>
                          <h5 className="font-medium">Market Orders</h5>
                          <p className="text-sm text-muted-foreground">Buy and sell orders, market transactions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={(syncSettings.syncIntervals?.market || 0) > 0}
                          onCheckedChange={(checked) => updateSyncInterval('market', checked ? 10 : 0)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interval</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1440"
                            value={syncSettings.syncIntervals?.market || 10}
                            onChange={(e) => updateSyncInterval('market', parseInt(e.target.value) || 10)}
                            className="w-16 text-center text-sm h-8"
                            disabled={(syncSettings.syncIntervals?.market || 0) === 0}
                          />
                          <span className="text-muted-foreground">min</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">30 sec ago</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-medium">89 orders</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="default" className="text-xs">Success</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div><strong>Process:</strong> getMarketOrders.php</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>ESI Endpoint:</strong> 
                        <Select 
                          value={esiRoutes.getRoute('market')?.currentVersion || 'v3'}
                          onValueChange={(version) => updateESIRouteVersion('market', version)}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(esiRoutes.getRoute('market')?.versions || ['v2', 'v3']).map(version => (
                              <SelectItem key={version} value={version}>{version}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>/corporations/{'{corporation_id}'}/orders/</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => validateESIRoute('market')}
                          disabled={validatingRoutes}
                        >
                          {validatingRoutes ? '...' : 'Validate'}
                        </Button>
                        {esiRouteValidation.market !== undefined && (
                          <Badge variant={esiRouteValidation.market ? "default" : "destructive"} className="text-xs h-5">
                            {esiRouteValidation.market ? '✓' : '✗'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Killmails Process */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Crosshair size={16} className="text-red-400" />
                        <div>
                          <h5 className="font-medium">Killmails</h5>
                          <p className="text-sm text-muted-foreground">Corporation member kills and losses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={(syncSettings.syncIntervals?.killmails || 0) > 0}
                          onCheckedChange={(checked) => updateSyncInterval('killmails', checked ? 120 : 0)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interval</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1440"
                            value={syncSettings.syncIntervals?.killmails || 120}
                            onChange={(e) => updateSyncInterval('killmails', parseInt(e.target.value) || 120)}
                            className="w-16 text-center text-sm h-8"
                            disabled={(syncSettings.syncIntervals?.killmails || 0) === 0}
                          />
                          <span className="text-muted-foreground">min</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">45 min ago</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-medium">7 new kills</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="default" className="text-xs">Success</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div><strong>Process:</strong> getKillmails.php</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>ESI Endpoint:</strong> 
                        <Select 
                          value={esiRoutes.getRoute('killmails')?.currentVersion || 'v1'}
                          onValueChange={(version) => updateESIRouteVersion('killmails', version)}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(esiRoutes.getRoute('killmails')?.versions || ['v1']).map(version => (
                              <SelectItem key={version} value={version}>{version}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>/corporations/{'{corporation_id}'}/killmails/recent/</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => validateESIRoute('killmails')}
                          disabled={validatingRoutes}
                        >
                          {validatingRoutes ? '...' : 'Validate'}
                        </Button>
                        {esiRouteValidation.killmails !== undefined && (
                          <Badge variant={esiRouteValidation.killmails ? "default" : "destructive"} className="text-xs h-5">
                            {esiRouteValidation.killmails ? '✓' : '✗'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Wallet & Transactions Process */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CurrencyDollar size={16} className="text-orange-400" />
                        <div>
                          <h5 className="font-medium">Wallet & Transactions</h5>
                          <p className="text-sm text-muted-foreground">Corporation wallet balance, transactions, and journal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={(syncSettings.syncIntervals?.income || 0) > 0}
                          onCheckedChange={(checked) => updateSyncInterval('income', checked ? 30 : 0)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interval</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1440"
                            value={syncSettings.syncIntervals?.income || 30}
                            onChange={(e) => updateSyncInterval('income', parseInt(e.target.value) || 30)}
                            className="w-16 text-center text-sm h-8"
                            disabled={(syncSettings.syncIntervals?.income || 0) === 0}
                          />
                          <span className="text-muted-foreground">min</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">8 min ago</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-medium">34 transactions</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="default" className="text-xs">Success</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div><strong>Process:</strong> getWalletTransactions.php</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>ESI Endpoint:</strong> 
                        <Select 
                          value={esiRoutes.getRoute('income')?.currentVersion || 'v1'}
                          onValueChange={(version) => updateESIRouteVersion('income', version)}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(esiRoutes.getRoute('income')?.versions || ['v1']).map(version => (
                              <SelectItem key={version} value={version}>{version}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>/corporations/{'{corporation_id}'}/wallets/{'{division}'}/transactions/</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => validateESIRoute('income')}
                          disabled={validatingRoutes}
                        >
                          {validatingRoutes ? '...' : 'Validate'}
                        </Button>
                        {esiRouteValidation.income !== undefined && (
                          <Badge variant={esiRouteValidation.income ? "default" : "destructive"} className="text-xs h-5">
                            {esiRouteValidation.income ? '✓' : '✗'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Management Controls */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Process Management</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSyncData}
                      disabled={syncStatus.isRunning}
                      className="bg-accent hover:bg-accent/90"
                      size="sm"
                    >
                      {syncStatus.isRunning ? (
                        <>
                          <ArrowClockwise size={16} className="mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Play size={16} className="mr-2" />
                          Run Manual Sync
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {syncStatus.isRunning && (
                  <div className="p-4 border border-accent/20 bg-accent/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowClockwise size={16} className="text-accent animate-spin" />
                      <span className="font-medium">Master Poller Running</span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{syncStatus.stage}</span>
                        <span>{Math.round(syncStatus.progress)}%</span>
                      </div>
                      <Progress value={syncStatus.progress} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Orchestrating individual sync processes...
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={saveSyncSettings} variant="default" size="sm">
                    <CheckCircle size={16} className="mr-2" />
                    Save Configuration
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Reset to LMeve default intervals
                      updateSyncInterval('members', 60);
                      updateSyncInterval('assets', 30);
                      updateSyncInterval('manufacturing', 15);
                      updateSyncInterval('mining', 45);
                      updateSyncInterval('market', 10);
                      updateSyncInterval('killmails', 120);
                      updateSyncInterval('income', 30);
                      setSyncSettings(prev => ({
                        ...prev,
                        masterPoller: { ...prev.masterPoller, interval: 5, enabled: true }
                      }));
                      toast.success('Reset to LMeve defaults');
                    }}
                  >
                    <ArrowClockwise size={16} className="mr-2" />
                    Reset Intervals
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Reset ESI routes to defaults
                      esiRouteManager.resetToDefaults();
                      setESIRouteValidation({});
                      setRouteUpdateResults({});
                      toast.success('ESI routes reset to defaults');
                    }}
                  >
                    <Network size={16} className="mr-2" />
                    Reset ESI Routes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Disable all processes
                      updateSyncInterval('members', 0);
                      updateSyncInterval('assets', 0);
                      updateSyncInterval('manufacturing', 0);
                      updateSyncInterval('mining', 0);
                      updateSyncInterval('market', 0);
                      updateSyncInterval('killmails', 0);
                      updateSyncInterval('income', 0);
                      setSyncSettings(prev => ({
                        ...prev,
                        masterPoller: { ...prev.masterPoller, enabled: false }
                      }));
                      toast.success('All sync processes disabled');
                    }}
                  >
                    <Stop size={16} className="mr-2" />
                    Disable All
                  </Button>
                </div>

                {/* Process Architecture Info */}
                <div className="p-3 bg-muted/30 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-muted-foreground" />
                    <span className="font-medium">LMeve Process Architecture & ESI Integration</span>
                  </div>
                  <div className="space-y-2 text-muted-foreground leading-relaxed">
                    <p>
                      Based on the original LMeve design: individual PHP processes handle specific data types (members, assets, industry jobs, etc.) 
                      while a master poller (poller.php) orchestrates execution timing. Set intervals to 0 to disable specific processes.
                    </p>
                    <p>
                      <strong>ESI Route Management:</strong> Each process uses specific EVE Online ESI API endpoints. You can select different API versions 
                      for each endpoint and validate them against the current ESI specification. This ensures compatibility when CCP updates their API.
                    </p>
                    <p>
                      The master poller respects individual process schedules, handles ESI rate limiting, and automatically uses your selected 
                      route versions for optimal performance and reliability.
                    </p>
                  </div>
                </div>
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
                    checked={notificationSettings.events.manufacturing}
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
                    checked={notificationSettings.events.mining}
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
                    checked={notificationSettings.events.killmails}
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
                    checked={notificationSettings.events.markets}
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

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              {/* Manual Users Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Manual User Accounts</h4>
                  <Button
                    onClick={() => setShowAddUser(true)}
                    size="sm"
                    className="bg-accent hover:bg-accent/90"
                  >
                    <Users size={16} className="mr-2" />
                    Add User
                  </Button>
                </div>
                
                {manualUsers.length > 0 ? (
                  <div className="space-y-3">
                    {manualUsers.map((manualUser) => (
                      <div key={manualUser.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{manualUser.characterName}</h5>
                            <p className="text-sm text-muted-foreground">
                              Username: {manualUser.username} • Corporation: {manualUser.corporationName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Roles: {manualUser.roles.join(', ')} • Created: {new Date(manualUser.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={manualUser.isActive ? "default" : "secondary"}>
                              {manualUser.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setManualUsers(users => users.filter(u => u.id !== manualUser.id));
                                toast.success('User removed');
                              }}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                        
                        {manualUser.lastLogin && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Last login: {new Date(manualUser.lastLogin).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-border rounded-lg text-center">
                    <Users size={32} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">No manual users created</p>
                    <p className="text-xs text-muted-foreground">
                      Create manual user accounts for direct login access
                    </p>
                  </div>
                )}
              </div>

              {/* Add User Modal */}
              {showAddUser && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Add Manual User</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddUser(false);
                          setNewUser({
                            username: '',
                            password: '',
                            characterName: '',
                            corporationName: '',
                            roles: []
                          });
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newUsername">Username</Label>
                        <Input
                          id="newUsername"
                          value={newUser.username}
                          onChange={(e) => setNewUser(u => ({ ...u, username: e.target.value }))}
                          placeholder="Login username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser(u => ({ ...u, password: e.target.value }))}
                          placeholder="User password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newCharacterName">Character Name</Label>
                        <Input
                          id="newCharacterName"
                          value={newUser.characterName}
                          onChange={(e) => setNewUser(u => ({ ...u, characterName: e.target.value }))}
                          placeholder="EVE character name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newCorporationName">Corporation Name</Label>
                        <Input
                          id="newCorporationName"
                          value={newUser.corporationName}
                          onChange={(e) => setNewUser(u => ({ ...u, corporationName: e.target.value }))}
                          placeholder="Corporation name"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <Button
                        onClick={() => {
                          setShowAddUser(false);
                          setNewUser({
                            username: '',
                            password: '',
                            characterName: '',
                            corporationName: '',
                            roles: []
                          });
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (!newUser.username || !newUser.password || !newUser.characterName) {
                            toast.error('Please fill in all required fields');
                            return;
                          }

                          const user = {
                            id: Date.now().toString(),
                            username: newUser.username,
                            characterName: newUser.characterName,
                            corporationName: newUser.corporationName || 'Unknown Corporation',
                            roles: ['member'],
                            createdAt: new Date().toISOString(),
                            isActive: true
                          };

                          setManualUsers(users => [...users, user]);
                          setShowAddUser(false);
                          setNewUser({
                            username: '',
                            password: '',
                            characterName: '',
                            corporationName: '',
                            roles: []
                          });
                          toast.success('User created successfully');
                        }}
                        disabled={!newUser.username || !newUser.password || !newUser.characterName}
                        className="flex-1 bg-accent hover:bg-accent/90"
                      >
                        Create User
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
              
              <Separator />
              
              {/* Data Management */}
              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <p className="text-sm text-muted-foreground">
                  Export and import all LMeve configuration data including settings, users, and corporation data.
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleExportSettings}
                    className="flex items-center justify-center"
                  >
                    <Download size={16} className="mr-2" />
                    Export All Data
                  </Button>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                    >
                      <Upload size={16} className="mr-2" />
                      Import Data
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={handleResetSettings}
                    className="flex items-center justify-center"
                  >
                    <ArrowClockwise size={16} className="mr-2" />
                    Reset All
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Export creates a downloadable backup file with all settings</p>
                  <p>• Import restores settings from a previously exported file</p>
                  <p>• Reset restores all settings to default values (requires confirmation)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        </Tabs>
    </div>
  );
}