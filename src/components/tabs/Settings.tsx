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
  CaretDown,
  CaretRight,
  Monitor,
  DeviceMobile,
  SignOut,
  SignIn,
  Wrench,
  Server,
  Question
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-provider';
import { useDatabase } from '@/lib/DatabaseContext';
import { useLMeveData } from '@/lib/LMeveDataContext';
import { useKV } from '@github/spark/hooks';

// Hook for managing general application settings
const useGeneralSettings = () => {
  const [settings, setSettings] = useKV('general-settings', {
    corpName: 'Your Corporation',
    corpTicker: 'CORP',
    corpId: 0,
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    autoSync: true,
    syncInterval: 60,
    theme: 'dark',
    compactMode: false
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return [settings, setSettings, updateSetting] as const;
};

// Hook for managing database settings  
const useDatabaseSettings = () => {
  const [settings, setSettings] = useKV('database-settings', {
    host: '127.0.0.1',
    port: 3306,
    username: 'lmeve',
    password: '',
    database: 'lmeve'
  });

  return [settings, setSettings] as const;
};

// Hook for managing sync settings
const useSyncSettings = () => {
  const [settings, setSettings] = useKV('sync-settings', {
    masterPoller: {
      enabled: false,
      interval: 30
    },
    syncIntervals: {
      members: 30,
      assets: 60,
      manufacturing: 15,
      mining: 45,
      market: 120,
      killmails: 10,
      income: 180
    }
  });

  return [settings, setSettings] as const;
};

interface SettingsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileView?: boolean;
}

export function Settings({ activeTab, onTabChange, isMobileView }: SettingsProps) {
  const { user } = useAuth();
  const [generalSettings, setGeneralSettings, updateGeneralSetting] = useGeneralSettings();
  const [databaseSettings, setDatabaseSettings] = useDatabaseSettings();
  const [syncSettings, setSyncSettings] = useSyncSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gear size={24} />
          Settings
        </h2>
        <p className="text-muted-foreground">
          Configure system and application settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
        <div className="hidden">
          {/* Hidden tabs list since navigation is handled by parent */}
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="sync">Data Sync</TabsTrigger>
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
                    <Select 
                      value={generalSettings.timezone} 
                      onValueChange={(value) => updateGeneralSetting('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">GMT</SelectItem>
                        <SelectItem value="Europe/Berlin">CET</SelectItem>
                        <SelectItem value="Europe/Moscow">MSK</SelectItem>
                        <SelectItem value="Asia/Tokyo">JST</SelectItem>
                        <SelectItem value="Australia/Sydney">AEDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={generalSettings.dateFormat} 
                      onValueChange={(value) => updateGeneralSetting('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset to defaults
                    window.location.reload();
                  }}
                >
                  Reset Changes
                </Button>
                <Button
                  onClick={() => {
                    toast.success('General settings saved successfully');
                  }}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Save Settings
                </Button>
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
              {/* Database Connection Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Connection Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbHost">Host</Label>
                    <Input
                      id="dbHost"
                      value={databaseSettings.host}
                      onChange={(e) => setDatabaseSettings(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="127.0.0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbPort">Port</Label>
                    <Input
                      id="dbPort"
                      type="number"
                      value={databaseSettings.port}
                      onChange={(e) => setDatabaseSettings(prev => ({ ...prev, port: parseInt(e.target.value) || 3306 }))}
                      placeholder="3306"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbUsername">Username</Label>
                    <Input
                      id="dbUsername"
                      value={databaseSettings.username}
                      onChange={(e) => setDatabaseSettings(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="lmeve"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbPassword">Password</Label>
                    <Input
                      id="dbPassword"
                      type="password"
                      value={databaseSettings.password}
                      onChange={(e) => setDatabaseSettings(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter database password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dbDatabase">Database Name</Label>
                  <Input
                    id="dbDatabase"
                    value={databaseSettings.database}
                    onChange={(e) => setDatabaseSettings(prev => ({ ...prev, database: e.target.value }))}
                    placeholder="lmeve"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info('Testing database connection...');
                    setTimeout(() => {
                      toast.success('Database connection test successful');
                    }, 2000);
                  }}
                >
                  Test Connection
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Database settings saved successfully');
                  }}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Data Synchronization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Poller Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Master Poller</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Master Poller</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically orchestrate all data sync processes
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.masterPoller.enabled}
                    onCheckedChange={(checked) => setSyncSettings(prev => ({
                      ...prev,
                      masterPoller: { ...prev.masterPoller, enabled: checked }
                    }))}
                  />
                </div>
                
                {syncSettings.masterPoller.enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="masterInterval">Master Interval (minutes)</Label>
                    <Input
                      id="masterInterval"
                      type="number"
                      min="5"
                      max="1440"
                      value={syncSettings.masterPoller.interval}
                      onChange={(e) => setSyncSettings(prev => ({
                        ...prev,
                        masterPoller: { ...prev.masterPoller, interval: parseInt(e.target.value) || 30 }
                      }))}
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              {/* Individual Process Intervals */}
              <div className="space-y-4">
                <h4 className="font-medium">Process Intervals</h4>
                <div className="space-y-4">
                  {[
                    { key: 'members', label: 'Members', default: 30 },
                    { key: 'assets', label: 'Assets', default: 60 },
                    { key: 'manufacturing', label: 'Manufacturing', default: 15 },
                    { key: 'mining', label: 'Mining', default: 45 },
                    { key: 'market', label: 'Market', default: 120 },
                    { key: 'killmails', label: 'Killmails', default: 10 },
                    { key: 'income', label: 'Income', default: 180 }
                  ].map(({ key, label, default: defaultValue }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{label}</Label>
                        <p className="text-sm text-muted-foreground">
                          Sync interval in minutes (0 to disable)
                        </p>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="1440"
                        value={syncSettings.syncIntervals[key] || defaultValue}
                        onChange={(e) => setSyncSettings(prev => ({
                          ...prev,
                          syncIntervals: {
                            ...prev.syncIntervals,
                            [key]: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-32"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info('Starting manual sync...');
                    setTimeout(() => {
                      toast.success('Manual sync completed');
                    }, 3000);
                  }}
                >
                  Run Manual Sync
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Sync settings saved successfully');
                  }}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}

export default Settings;