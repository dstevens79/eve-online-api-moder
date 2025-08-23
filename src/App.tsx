import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { 
  House, 
  Users, 
  Package, 
  Factory, 
  HardHat, 
  Truck, 
  Crosshair, 
  TrendUp, 
  Gear,
  SignOut,
  Rocket
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { TabType } from '@/lib/types';

// Tab Components (will be implemented)
import { Dashboard } from '@/components/tabs/Dashboard';
import { Members } from '@/components/tabs/Members';
import { Assets } from '@/components/tabs/Assets';
import { Manufacturing } from '@/components/tabs/Manufacturing';
import { Mining } from '@/components/tabs/Mining';
import { Logistics } from '@/components/tabs/Logistics';
import { Killmails } from '@/components/tabs/Killmails';
import { Market } from '@/components/tabs/Market';
import { Settings } from '@/components/tabs/Settings';

function App() {
  const [activeTab, setActiveTab] = useKV<TabType>('active-tab', 'dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: Dashboard },
    { id: 'members', label: 'Members', icon: Users, component: Members, badge: '42' },
    { id: 'assets', label: 'Assets', icon: Package, component: Assets },
    { id: 'manufacturing', label: 'Manufacturing', icon: Factory, component: Manufacturing, badge: '3' },
    { id: 'mining', label: 'Mining', icon: HardHat, component: Mining },
    { id: 'logistics', label: 'Logistics', icon: Truck, component: Logistics },
    { id: 'killmails', label: 'Killmails', icon: Crosshair, component: Killmails },
    { id: 'market', label: 'Market', icon: TrendUp, component: Market },
    { id: 'settings', label: 'Settings', icon: Gear, component: Settings },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Rocket size={28} className="text-accent" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">LMeve</h1>
                  <p className="text-sm text-muted-foreground">Corporation Management</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs bg-accent/20 text-accent border-accent/30">
                Test Alliance Please Ignore
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">CEO Firstname Lastname</p>
                <p className="text-xs text-muted-foreground">Director</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-border hover:bg-muted"
              >
                <SignOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-border">
            <TabsList className="grid grid-cols-9 w-full bg-transparent h-auto p-0 space-x-0">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-2 px-4 py-3 border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-accent/5 data-[state=active]:text-accent hover:bg-muted/50 rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent size={18} />
                      <span className="text-sm font-medium">{tab.label}</span>
                      {'badge' in tab && tab.badge && (
                        <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-accent/20 text-accent">
                          {tab.badge}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                <Component />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}

export default App;