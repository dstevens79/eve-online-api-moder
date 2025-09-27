import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Database,
  CheckCircle,
  Warning,
  X,
  ArrowClockwise,
  Terminal,
  Network,
  Question,
  Wrench,
  Archive,
  CloudArrowDown,
  Play,
  Stop,
  RefreshCw,
  Globe,
  Info,
  Eye,
  EyeSlash,
  Copy,
  Gear
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useDatabaseSettings, useSDESettings } from '@/lib/persistenceService';
import { DatabaseManager, DatabaseSetupManager, DatabaseSetupProgress, generateSetupCommands } from '@/lib/database';
import { useSDEManager, type SDEDatabaseStats } from '@/lib/sdeService';
import { DatabaseSchemaManager } from '@/components/DatabaseSchemaManager';
import { useAuth } from '@/lib/auth-provider';

interface DatabaseSettingsProps {
  isMobileView?: boolean;
}

// Simplified setup state types
interface SimpleSetupConfig {
  lmevePassword: string;
  allowedHosts: string;
  downloadSDE: boolean;
}

export function DatabaseSettings({ isMobileView = false }: DatabaseSettingsProps) {
  const [databaseSettings, setDatabaseSettings] = useDatabaseSettings();
  const [sdeSettings, setSDESettings] = useSDESettings();
  
  // Auth provider for ESI configuration
  const { esiConfig, updateESIConfig } = useAuth();

  // Update functions
  const updateDatabaseSetting = (key: keyof typeof databaseSettings, value: any) => {
    setDatabaseSettings(prev => ({ ...prev, [key]: value }));
  };

  const { sdeStatus, checkForUpdates, downloadSDE, updateDatabase, getDatabaseStats } = useSDEManager();

  // Database connection state
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [showSudoPassword, setShowSudoPassword] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  
  // SDE Management
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
  
  // Database connection status
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    connectionCount: 0,
    queryCount: 0,
    avgQueryTime: 0,
    uptime: 0,
    lastConnection: null as string | null,
    lastError: null as string | null
  });

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

  // UI state
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showSetupCommands, setShowSetupCommands] = useState(false);
  const [tableInfo, setTableInfo] = useState<any[]>([]);

  // Load SDE stats when component mounts
  useEffect(() => {
    loadSDEStats();
  }, [databaseSettings]);

  // Load SDE database stats
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

  // Helper to add timestamped connection logs
  const addConnectionLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Clear connection logs
  const clearConnectionLogs = () => {
    setConnectionLogs([]);
  };

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
        
        setDbStatus(prev => ({
          ...prev,
          connected: true,
          connectionCount: 1,
          lastConnection: new Date().toISOString(),
          lastError: null
        }));
      } else if (testResult.success && !testResult.validated) {
        addConnectionLog(`⚠️ Partial connection success but validation incomplete`);
        addConnectionLog(`⚡ Connection latency: ${testResult.latency}ms`);
        addConnectionLog(`❌ Database validation failed - connection rejected`);
        toast.warning(`⚠️ Partial success - validation incomplete`);
      } else {
        addConnectionLog(`❌ Connection test FAILED: ${testResult.error}`);
        addConnectionLog(`🚫 This configuration cannot establish a valid MySQL connection`);
        toast.error(`❌ Connection failed: ${testResult.error}`);
        
        setDbStatus(prev => ({
          ...prev,
          connected: false,
          lastError: testResult.error || 'Connection failed'
        }));
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown connection error';
      addConnectionLog(`💥 Test error: ${errorMsg}`);
      addConnectionLog(`🚫 Connection test could not complete`);
      toast.error(`Test error: ${errorMsg}`);
      
      setDbStatus(prev => ({
        ...prev,
        connected: false,
        lastError: errorMsg
      }));
    } finally {
      addConnectionLog('🏁 Database connection test completed');
      setTestingConnection(false);
    }
  };

  // Database setup handlers
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
        updateDatabaseSetting('password', setupConfig.lmevePassword);
        updateDatabaseSetting('database', 'lmeve');
        if (!databaseSettings?.username) {
          updateDatabaseSetting('username', 'lmeve');
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

  // Generate setup commands
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

  // Save database settings
  const saveDatabaseSettings = async () => {
    try {
      setDatabaseSettings({ ...databaseSettings });
      toast.success('Database settings saved successfully');
    } catch (error) {
      console.error('Failed to save database settings:', error);
      toast.error('Failed to save database settings');
    }
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

      {/* Setup Requirements indicator */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Database size={20} />
          Database Configuration
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="text-accent border-accent/30"
        >
          <Gear size={16} className="mr-2" />
          Setup Requirements
        </Button>
      </div>

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
          <h4 className="font-medium text-accent flex items-center gap-2">
            • ESI Application Credentials
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://developers.eveonline.com/applications', '_blank')}
            className="text-accent border-accent/30"
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
                value={esiConfig.clientId || ''}
                onChange={(e) => updateESIConfig(e.target.value, esiConfig.clientSecret)}
                placeholder="Your EVE Online application Client ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSecret">EVE Online Client Secret</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecrets ? "text" : "password"}
                  value={esiConfig.clientSecret || ''}
                  onChange={(e) => updateESIConfig(esiConfig.clientId, e.target.value)}
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
            Create an application at developers.eveonline.com with callback URL: <code className="bg-background px-1 rounded">{window.location.origin}/</code>
          </p>
        </div>
      </div>

      {/* Two Column Layout: Left = Connection Settings, Right = Controls & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Connection Configuration */}
        <div className="space-y-4">
          
          {/* Database Connection Settings */}
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium mb-4 text-accent flex items-center gap-2">• Database Connection</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dbHost">Host</Label>
                  <Input
                    id="dbHost"
                    value={databaseSettings.host || ''}
                    onChange={(e) => {
                      updateDatabaseSetting('host', e.target.value);
                      updateDatabaseSetting('sudoHost', e.target.value);
                    }}
                    placeholder="localhost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbPort">Port</Label>
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
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbName">Database Name</Label>
                <Input
                  id="dbName"
                  value={databaseSettings.database || ''}
                  onChange={(e) => updateDatabaseSetting('database', e.target.value)}
                  placeholder="lmeve"
                />
              </div>
            </div>
          </div>

          {/* Database Users Section */}
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium mb-4 text-accent flex items-center gap-2">• Database Users</h4>
            
            <div className="space-y-4">
              {/* Sudo User */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Sudo User</Label>
                  <Badge variant="outline" className="text-xs">Admin</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sudoUsername">Username</Label>
                    <Input
                      id="sudoUsername"
                      value={databaseSettings.sudoUsername || ''}
                      onChange={(e) => updateDatabaseSetting('sudoUsername', e.target.value)}
                      placeholder="root"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sudoPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="sudoPassword"
                        type={showSudoPassword ? "text" : "password"}
                        value={databaseSettings.sudoPassword || ''}
                        onChange={(e) => updateDatabaseSetting('sudoPassword', e.target.value)}
                        placeholder="••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowSudoPassword(!showSudoPassword)}
                      >
                        {showSudoPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* LMeve User */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">LMeve User</Label>
                  <Badge variant="outline" className="text-xs">Application</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbUsername">Username</Label>
                    <Input
                      id="dbUsername"
                      value={databaseSettings.username || ''}
                      onChange={(e) => updateDatabaseSetting('username', e.target.value)}
                      placeholder="lmeve"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="dbPassword"
                        type={showDbPassword ? "text" : "password"}
                        value={databaseSettings.password || ''}
                        onChange={(e) => updateDatabaseSetting('password', e.target.value)}
                        placeholder="••••••"
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
            </div>
          </div>
        </div>

        {/* Right Column: Configuration and Status */}
        <div className="space-y-4">
          
          {/* Configuration Section */}
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium mb-4 text-accent flex items-center gap-2">• Configuration</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Schema Source</p>
                  <p className="font-medium">SDE Source</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Default Schema</p>
                  <p className="font-medium">Latest SDE</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Control Pad */}
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium mb-4">Control Pad</h4>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🧪 Setup SSH Connection');
                  toast.info('SSH connection setup not implemented yet');
                }}
                className="w-full justify-start"
              >
                <Terminal size={16} className="mr-2" />
                Setup SSH Connection
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🧪 Deploy Scripts');  
                  toast.info('Deploy scripts not implemented yet');
                }}
                className="w-full justify-start"
              >
                <Archive size={16} className="mr-2" />
                Deploy Scripts
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🧪 Run Remote Setup');
                  toast.info('Remote setup not implemented yet');
                }}
                className="w-full justify-start"
              >
                <CloudArrowDown size={16} className="mr-2" />
                Run Remote Setup
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status and Connection Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System Status */}
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium flex items-center gap-2">
              <Database size={16} />
              System Status
            </h4>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw size={16} className="mr-2" />
                Refresh Status
              </Button>
              <Button variant="outline" size="sm">
                <Question size={16} className="mr-2" />
                Check SDE
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Status indicators */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-red-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">{dbStatus.connected ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">SSI Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm">Offline</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Scripts Deployed</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="text-sm">Unknown</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Remote Setup</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm">Offline</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">ESI Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="text-sm">Unknown</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">EVE Online API</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="text-sm">Unknown</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">SDE Latest</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="text-sm">2025-08-28</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">SDE Current</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="text-sm">Unknown</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Uptime</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="text-sm">Unknown</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm">Offline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Controls and Logs */}
        <div className="space-y-4">
          
          {/* Connection Controls */}
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium mb-4">Connection Controls</h4>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🧪 Test connection button clicked');
                    handleTestDbConnection();
                  }}
                  disabled={testingConnection}
                  className="flex-1"
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
                
                <Button
                  variant="default"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                  onClick={() => {
                    console.log('🧪 Connect button clicked');
                    toast.info('Connect functionality not fully implemented yet');
                  }}
                >
                  Connect
                </Button>
              </div>
              
              <div className="flex gap-2">
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
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // Reset form
                    window.location.reload();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Connection Logs */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Connection Logs</h4>
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
          </div>
        </div>
      </div>

      {/* Complete Database Setup Section */}
      <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Warning size={20} className="text-yellow-400" />
            <h4 className="font-medium">Complete Database Setup</h4>
          </div>
          <Badge variant="destructive" className="text-xs">
            Not Ready
          </Badge>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            • Database connection not established<br />
            • Remote access not configured
          </p>
          
          <div className="text-sm">
            <p className="font-medium mb-2">Issues to resolve:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Configure database connection settings above</li>
              <li>• Test connection to verify credentials</li>
              <li>• Set up remote access if needed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Database Schema Manager moved to bottom */}
      <div className="border-t border-border pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <Archive size={16} />
            Database Schema Manager
          </h4>
          <Badge variant="outline" className="text-xs">24 tables</Badge>
        </div>
        <DatabaseSchemaManager />
      </div>


    </div>
  );
}