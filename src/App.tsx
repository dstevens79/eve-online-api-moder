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
  Rocket,
  CurrencyDollar
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
import { Income } from '@/components/tabs/Income';
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
    { id: 'income', label: 'Income', icon: CurrencyDollar, component: Income },
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
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-card border-r border-border flex flex-col">
          <div className="p-4 space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive 
                      ? "bg-accent text-accent-foreground shadow-sm" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <IconComponent size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {'badge' in tab && tab.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`ml-auto text-xs h-5 px-1.5 ${
                        isActive 
                          ? "bg-accent-foreground/20 text-accent-foreground" 
                          : "bg-accent/20 text-accent"
                      }`}
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-6 py-6">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                {tabs.map((tab) => {
                  const Component = tab.component;
                  return (
                    <TabsContent key={tab.id} value={tab.id} className="mt-0">
                      <Component />
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;