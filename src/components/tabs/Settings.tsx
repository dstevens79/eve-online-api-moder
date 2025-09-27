import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe,
  Database,
  Building,
  Clock,
  Bell,
  Users,
  UserCheck
} from '@phosphor-icons/react';

// Import the new modular settings components
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { DatabaseSettings } from '@/components/settings/DatabaseSettings';
import { ESISettings } from '@/components/settings/ESISettings';
import { DataSyncSettings } from '@/components/settings/DataSyncSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { UserSettings } from '@/components/settings/UserSettings';
import { DebugSettings } from '@/components/settings/DebugSettings';

interface SettingsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileView?: boolean;
}

export function Settings({ activeTab, onTabChange, isMobileView = false }: SettingsProps) {
  const settingsTabs = [
    { id: 'general', label: 'General', icon: Globe, component: GeneralSettings },
    { id: 'database', label: 'Database', icon: Database, component: DatabaseSettings },
    { id: 'esi', label: 'Corporations', icon: Building, component: ESISettings },
    { id: 'sync', label: 'Data Sync', icon: Clock, component: DataSyncSettings },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
    { id: 'users', label: 'Users', icon: Users, component: UserSettings },
    { id: 'debug', label: 'Debug', icon: UserCheck, component: DebugSettings },
  ];

  // Find the current component based on activeTab
  const currentTab = settingsTabs.find(tab => tab.id === activeTab);
  const Component = currentTab?.component || GeneralSettings;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isMobileView ? 'bg-accent/10' : 'bg-accent/20'}`}>
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
              <span className="text-accent-foreground text-sm font-bold">S</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure your LMeve installation
            </p>
          </div>
        </div>
      </div>

}    </div>
  );
}