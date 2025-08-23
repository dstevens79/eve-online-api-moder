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
  Refresh,
  LinkSimple,
  Eye,
  EyeSlash,
  Copy
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

interface ESIConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes: string[];
  userAgent: string;
  serverIp: string;
  serverPort: number;
  useSSL: boolean;
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
    eveOnlineSync: {
      enabled: true,
      autoSync: false,
      syncInterval: 30,
      lastSync: new Date().toISOString(),
      characterId: 91316135,
      corporationId: 498125261
    }
  });

  const [esiConfig, setESIConfig] = useKV<ESIConfig>('esi-config', {
    clientId: '',
    clientSecret: '',
    callbackUrl: 'http://localhost:3000/callback',
    scopes: [
      'esi-corporations.read_corporation_membership.v1',
      'esi-industry.read_corporation_jobs.v1',
      'esi-assets.read_corporation_assets.v1',
      'esi-universe.read_structures.v1',
      'esi-corporations.read_structures.v1'
    ],
    userAgent: 'LMeve Corporation Management Tool',
    serverIp: '127.0.0.1',
    serverPort: 3000,
    useSSL: false
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

  // Ensure safe access to settings
  const eveOnlineSync = settings?.eveOnlineSync || {
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    characterId: 91316135,
    corporationId: 498125261
  };

  // Generate OAuth authorization URL
  const generateAuthUrl = () => {
    const state = Math.random().toString(36).substring(2, 15);
    const scopes = esiConfig.scopes.join(' ');
    
    const authUrl = `https://login.eveonline.com/v2/oauth/authorize/?` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(esiConfig.callbackUrl)}&` +
      `client_id=${esiConfig.clientId}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state}`;
    
    return authUrl;
  };

  const handleESIOAuth = () => {
    if (!esiConfig.clientId) {
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
    setESIConfig(esiConfig);
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

  // Generate OAuth authorization URL
  const generateAuthUrl = () => {
    const state = Math.random().toString(36).substring(2, 15);
    const scopes = esiConfig.scopes.join(' ');
    
    const authUrl = `https://login.eveonline.com/v2/oauth/authorize/?` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(esiConfig.callbackUrl)}&` +
      `client_id=${esiConfig.clientId}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state}`;
    
    return authUrl;
  };

  const handleESIOAuth = () => {
    if (!esiConfig.clientId) {
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
    setESIConfig(esiConfig);
    toast.success('ESI configuration saved');
  };
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
          <TabsTrigger value="esi" className="flex items-center gap-2">
            <Key size={16} />
            ESI Config
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

        <TabsContent value="esi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={20} />
                ESI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Server Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Server Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serverIp">Server IP Address</Label>
                    <Input
                      id="serverIp"
                      value={esiConfig.serverIp}
                      onChange={(e) => setESIConfig(c => ({ ...c, serverIp: e.target.value }))}
                      placeholder="127.0.0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serverPort">Server Port</Label>
                    <Input
                      id="serverPort"
                      type="number"
                      value={esiConfig.serverPort}
                      onChange={(e) => setESIConfig(c => ({ ...c, serverPort: parseInt(e.target.value) || 3000 }))}
                      placeholder="3000"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Use SSL/HTTPS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable HTTPS for secure connections
                    </p>
                  </div>
                  <Switch
                    checked={esiConfig.useSSL}
                    onCheckedChange={(checked) => setESIConfig(c => ({ ...c, useSSL: checked }))}
                  />
                </div>
              </div>

              {/* ESI Application Settings */}
              <div className="border-t border-border pt-6 space-y-4">
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
                    <li>Set the callback URL to match your server configuration</li>
                    <li>Copy the Client ID and Client Secret below</li>
                    <li>Save configuration and authorize ESI access</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={esiConfig.clientId}
                      onChange={(e) => setESIConfig(c => ({ ...c, clientId: e.target.value }))}
                      placeholder="Your EVE Online application Client ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <div className="relative">
                      <Input
                        id="clientSecret"
                        type={showSecrets ? "text" : "password"}
                        value={esiConfig.clientSecret}
                        onChange={(e) => setESIConfig(c => ({ ...c, clientSecret: e.target.value }))}
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
                  <div className="space-y-2">
                    <Label htmlFor="callbackUrl">Callback URL</Label>
                    <Input
                      id="callbackUrl"
                      value={esiConfig.callbackUrl}
                      onChange={(e) => setESIConfig(c => ({ ...c, callbackUrl: e.target.value }))}
                      placeholder="http://localhost:3000/callback"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userAgent">User Agent</Label>
                    <Input
                      id="userAgent"
                      value={esiConfig.userAgent}
                      onChange={(e) => setESIConfig(c => ({ ...c, userAgent: e.target.value }))}
                      placeholder="Your Application Name"
                    />
                  </div>
                </div>
              </div>

              {/* ESI Scopes */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium">Required ESI Scopes</h4>
                <p className="text-sm text-muted-foreground">
                  These scopes are required for LMeve to access your corporation data through the EVE Online ESI API.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {esiConfig.scopes.map((scope, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="space-y-1">
                        <span className="text-sm font-mono">{scope}</span>
                        <p className="text-xs text-muted-foreground">
                          {getScopeDescription(scope)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newScopes = esiConfig.scopes.filter((_, i) => i !== index);
                          setESIConfig(c => ({ ...c, scopes: newScopes }));
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* OAuth Status */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium">ESI Authorization Status</h4>
                
                {oauthState.isAuthenticated ? (
                  <div className="p-4 border border-green-500/20 bg-green-500/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle size={16} />
                          <span className="font-medium">Authorized</span>
                        </div>
                        {oauthState.characterName && (
                          <p className="text-sm text-muted-foreground">
                            Character: {oauthState.characterName}
                          </p>
                        )}
                        {oauthState.expiresAt && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(oauthState.expiresAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRevokeESI}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-orange-500/20 bg-orange-500/10 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-orange-400">
                        <Warning size={16} />
                        <span className="font-medium">Not Authorized</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Corporation leaders must authorize ESI access to sync EVE Online data.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleESIOAuth}
                          disabled={!esiConfig.clientId}
                          className="bg-accent hover:bg-accent/90"
                        >
                          <LinkSimple size={16} className="mr-2" />
                          Authorize ESI Access
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCopyAuthUrl}
                          disabled={!esiConfig.clientId}
                        >
                          <Copy size={16} className="mr-2" />
                          Copy Auth URL
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-6">
                <Button onClick={handleSaveESIConfig}>Save ESI Configuration</Button>
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