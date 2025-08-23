import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gear, 
  Key, 
  Bell, 
  Shield, 
  Database,
  Globe,
  Users,
  Clock
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface CorpSettings {
  corpName: string;
  corpTicker: string;
  timezone: string;
  language: string;
  notifications: {
    manufacturing: boolean;
    mining: boolean;
    killmails: boolean;
    markets: boolean;
  };
  apiKeys: Array<{
    id: string;
    name: string;
    keyId: string;
    status: 'active' | 'expired' | 'invalid';
    permissions: string[];
  }>;
}

export function Settings() {
  const [settings, setSettings] = useKV<CorpSettings>('corp-settings', {
    corpName: 'Test Alliance Please Ignore',
    corpTicker: 'TEST',
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
        permissions: ['corp_details', 'corp_members', 'corp_assets']
      },
      {
        id: '2', 
        name: 'Manufacturing API Key',
        keyId: '87654321',
        status: 'expired',
        permissions: ['industry_jobs', 'blueprints']
      }
    ]
  });

  const [newApiKey, setNewApiKey] = useState({ name: '', keyId: '', vCode: '' });

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe size={16} />
            General
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