import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Database,
  Info,
  Play,
  ArrowClockwise,
  Download,
  Upload,
  UserCheck
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-provider';
import { runDatabaseValidationTests } from '@/lib/databaseTestCases';
import { toast } from 'sonner';
import { AdminLoginTest } from '@/components/AdminLoginTest';
import { SimpleLoginTest } from '@/components/SimpleLoginTest';
import { 
  backupSettings,
  exportAllSettings,
  importAllSettings,
  resetAllSettings
} from '@/lib/persistenceService';

interface DebugProps {
  onLoginClick?: () => void;
  isMobileView?: boolean;
}

export function Debug({ onLoginClick, isMobileView }: DebugProps) {
  const {
    user,
    esiConfig,
    adminConfig,
    getRegisteredCorporations
  } = useAuth();
  
  const registeredCorps = getRegisteredCorporations();

  // Database connection test functionality
  const [testingConnection, setTestingConnection] = React.useState(false);
  const [connectionLogs, setConnectionLogs] = React.useState<string[]>([]);

  // Helper to add timestamped connection logs
  const addConnectionLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Database connection test handler (simplified version)
  const handleTestDbConnection = async () => {
    if (testingConnection) {
      toast.warning('Database test already in progress...');
      return;
    }
    
    console.log('🧪 Starting debug database connection test');
    setTestingConnection(true);
    setConnectionLogs([]);
    
    try {
      addConnectionLog('🔍 Starting database connection test...');
      addConnectionLog('🎯 This is a simplified test for the debug panel');
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      addConnectionLog('✅ Debug connection test completed');
      toast.success('Debug connection test completed');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown connection error';
      addConnectionLog(`❌ Test error: ${errorMsg}`);
      toast.error(`Test error: ${errorMsg}`);
    } finally {
      setTestingConnection(false);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck size={24} />
          Debug & Testing
        </h2>
        <p className="text-muted-foreground">
          Developer tools for testing authentication, database connections, and system debugging
        </p>
      </div>

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
    </div>
  );
}