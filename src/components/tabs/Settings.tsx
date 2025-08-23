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
  Refresh
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { CorpSettings } from '@/lib/types';
import { toast } from 'sonner';
import { eveApi, type CharacterInfo, type CorporationInfo } from '@/lib/eveApi';

interface SyncStatus {
  isRunning: boolean;
  progress: number;
  stage: string;
  error?: string;
}

export function Settings() {
  const [settings, setSettings] = useKV<CorpSettings>('corp-settings', {
    corpName: 'Test Alliance Please Ignore',
    corpTicker: 'TEST',
    corpId: 498125261,
    timezone: 'UTC',
    language: 'en',
    notifications: {
      manufacturing: true,
      mining: true,
      killmails: false,
      markets: true,
    },
    apiKeys: [
      {
        id: '1',
        name: 'Corporation Management Key',
        keyId: '12345678',
        status: 'active',
        permissions: ['corp_details', 'corp_members', 'corp_assets'],
        lastUsed: new Date().toISOString()
      },
      {
        id: '2', 
        name: 'Manufacturing API Key',
        keyId: '87654321',
        status: 'expired',
        permissions: ['industry_jobs', 'blueprints']
      }
    ],
    eveOnlineSync: {
      enabled: true,
      autoSync: false,
      syncInterval: 30,
      lastSync: new Date().toISOString(),
      characterId: 91316135,
      corporationId: 498125261
    }
  });

  const [newApiKey, setNewApiKey] = useState({ name: '', keyId: '', vCode: '' });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    progress: 0,
    stage: 'Idle'
  });
  const [corpInfo, setCorporationInfo] = useState<CorporationInfo | null>(null);
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo | null>(null);

  // Ensure safe access to settings
  const eveOnlineSync = settings?.eveOnlineSync || {
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    characterId: 91316135,
    corporationId: 498125261
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

  const handleNotificationToggle = (type: keyof typeof settings.notifications) => {
    setSettings(current => ({
      ...current,
      notifications: {
        ...current.notifications,
        [type]: !current.notifications[type]
      }
    }));
  };

  const handleAddApiKey = () => {
    if (!newApiKey.name || !newApiKey.keyId || !newApiKey.vCode) {
      toast.error('Please fill in all API key fields');
      return;
    }

    const newKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      keyId: newApiKey.keyId,
      status: 'active' as const,
      permissions: ['corp_details'] // Default permission
    };

    setSettings(current => ({
      ...current,
      apiKeys: [...current.apiKeys, newKey]
    }));

    setNewApiKey({ name: '', keyId: '', vCode: '' });
    toast.success('API key added successfully');
  };

  const handleRemoveApiKey = (keyId: string) => {
    setSettings(current => ({
      ...current,
      apiKeys: current.apiKeys.filter(key => key.id !== keyId)
    }));
    toast.success('API key removed');
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe size={16} />
            General
          </TabsTrigger>
          <TabsTrigger value="eve" className="flex items-center gap-2">
            <Rocket size={16} />
            EVE Online
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key size={16} />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            Security
          </TabsTrigger>
        </TabsList>

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
                            <Refresh size={16} className="mr-2 animate-spin" />
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

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EVE Online API Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Current API Keys</h4>
                {settings.apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{key.name}</span>
                        <Badge 
                          variant={key.status === 'active' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Key ID: {key.keyId}</p>
                      <div className="flex gap-1 flex-wrap">
                        {key.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemoveApiKey(key.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium">Add New API Key</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiName">Key Name</Label>
                    <Input
                      id="apiName"
                      placeholder="e.g., Main Corp Key"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey(k => ({ ...k, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyId">Key ID</Label>
                    <Input
                      id="keyId"
                      placeholder="12345678"
                      value={newApiKey.keyId}
                      onChange={(e) => setNewApiKey(k => ({ ...k, keyId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vCode">Verification Code</Label>
                    <Input
                      id="vCode"
                      placeholder="vCode"
                      type="password"
                      value={newApiKey.vCode}
                      onChange={(e) => setNewApiKey(k => ({ ...k, vCode: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleAddApiKey}>Add API Key</Button>
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
      </Tabs>
    </div>
  );
}