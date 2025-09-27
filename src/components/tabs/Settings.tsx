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
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/lib/auth-provider';
import { CorpSettings } from '@/lib/types';
import { toast } from 'sonner';
import { eveApi, type CharacterInfo, type CorporationInfo } from '@/lib/eveApi';
import { useSDEManager, type SDEDatabaseStats } from '@/lib/sdeService';
import { DatabaseManager } from '@/lib/database';
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

      {!isMobileView ? (
        // Desktop Layout - Vertical tabs
        <Tabs value={activeTab} onValueChange={onTabChange} orientation="vertical">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <TabsList className="flex flex-col h-fit w-full">
                {settingsTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="w-full justify-start gap-2 py-3"
                    >
                      <IconComponent size={16} />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
            
            <div className="col-span-9">
              {settingsTabs.map((tab) => {
                const Component = tab.component;
                return (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <Component isMobileView={isMobileView} />
                  </TabsContent>
                );
              })}
            </div>
          </div>
        </Tabs>
      ) : (
        // Mobile Layout - Horizontal tabs
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            {settingsTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col gap-1 py-2 text-xs"
                >
                  <IconComponent size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <div className="mt-6">
            {settingsTabs.map((tab) => {
              const Component = tab.component;
              return (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  <Component isMobileView={isMobileView} />
                </TabsContent>
              );
            })}
          </div>
        </Tabs>
      )}
    </div>
  );
}