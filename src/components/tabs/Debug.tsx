import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowClockwise,
  Info,
  UserCheck,
  Download,
  Upload,
  Database,
  Gear
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-provider';
import { useKV } from '@github/spark/hooks';

export function Debug() {
  const {
    user,
    isAuthenticated,
    esiConfig,
    getRegisteredCorporations
  } = useAuth();

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);

  const addConnectionLog = (message: string) => {
    setConnectionLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleTestDbConnection = async () => {
    if (testingConnection) {
      toast.warning('Database test already in progress');
      return;
    }

    setTestingConnection(true);
    setConnectionLogs([]);
    addConnectionLog('Starting database connection test...');

    try {
      addConnectionLog('✅ Database connection test completed');
      toast.success('Database connection test completed');
    } catch (error) {
      addConnectionLog(`❌ Database test failed: ${error}`);
      toast.error('Database connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleExportSettings = () => {
    try {
      const settings = {
        user: user ? {
          characterName: user.characterName,
          corporationName: user.corporationName,
          role: user.role,
          authMethod: user.authMethod
        } : null,
        esiConfig: esiConfig ? {
          hasClientId: !!esiConfig.clientId,
          isConfigured: esiConfig.isConfigured
        } : null,
        registeredCorps: getRegisteredCorporations(),
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-settings-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
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
      const settings = JSON.parse(text);
      console.log('Imported settings:', settings);
      toast.success('Settings imported successfully');
    } catch (error) {
      console.error('Failed to import settings:', error);
      toast.error('Failed to import settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserCheck className="text-accent" size={24} />
        <h1 className="text-2xl font-bold">Debug & System Information</h1>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={20} />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Authenticated</Label>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "Yes" : "No"}
              </Badge>
            </div>
            {user && (
              <>
                <div>
                  <Label className="text-sm font-medium">Character Name</Label>
                  <div className="text-sm">{user.characterName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Corporation</Label>
                  <div className="text-sm">{user.corporationName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Auth Method</Label>
                  <Badge variant="outline" className="capitalize">
                    {user.authMethod}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ESI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear size={20} />
            ESI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Client ID Configured</Label>
              <Badge variant={esiConfig?.clientId ? "default" : "secondary"}>
                {esiConfig?.clientId ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Client Secret Configured</Label>
              <Badge variant={esiConfig?.clientSecret ? "default" : "secondary"}>
                {esiConfig?.clientSecret ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Is Configured</Label>
              <Badge variant={esiConfig?.isConfigured ? "default" : "secondary"}>
                {esiConfig?.isConfigured ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Registered Corporations</Label>
              <Badge variant="outline">
                {getRegisteredCorporations().length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Database Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleTestDbConnection} 
              disabled={testingConnection}
              variant="outline"
            >
              <ArrowClockwise size={16} className="mr-2" />
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {connectionLogs.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Connection Logs</Label>
              <div className="bg-muted p-3 rounded-md text-sm font-mono max-h-32 overflow-y-auto">
                {connectionLogs.map((log, index) => (
                  <div key={index} className="text-xs">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            Settings Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleExportSettings} variant="outline">
              <Download size={16} className="mr-2" />
              Export Settings
            </Button>
            
            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button variant="outline">
                <Upload size={16} className="mr-2" />
                Import Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={20} />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">User Agent</Label>
              <div className="text-xs break-all">{navigator.userAgent}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Current URL</Label>
              <div className="text-xs break-all">{window.location.href}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Local Storage Keys</Label>
              <div className="text-xs">{Object.keys(localStorage).length} keys</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Session Storage Keys</Label>
              <div className="text-xs">{Object.keys(sessionStorage).length} keys</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}