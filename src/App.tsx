import React, { useState, useEffect } from 'react';
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
  CurrencyDollar,
  CaretDown,
  CaretRight,
  Globe,
  Database,
  Key,
  Clock,
  Bell,
  Shield,
  Archive
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { TabType } from '@/lib/types';
import { DatabaseProvider } from '@/lib/DatabaseContext';
import { LMeveDataProvider } from '@/lib/LMeveDataContext';
import { useAuth, ESIAuthState } from '@/lib/auth';
import { LoginPage } from '@/components/LoginPage';
import { ESICallback } from '@/components/ESICallback';

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
  const [activeSettingsTab, setActiveSettingsTab] = useKV<string>('active-settings-tab', 'general');
  const [settingsExpanded, setSettingsExpanded] = useKV<boolean>('settings-expanded', false);
  const { user, isAuthenticated, logout, refreshUserToken, isTokenExpired, adminConfig, updateAdminConfig } = useAuth();
  const [isESICallback, setIsESICallback] = useState(false);

  // Simple, clear auth state logging
  React.useEffect(() => {
    console.log('🏠 App render state:', { 
      hasUser: !!user,
      characterName: user?.characterName, 
      isAuthenticated, 
      shouldShowApp: isAuthenticated && !!user
    });
  }, [user, isAuthenticated]);

  // Check if this is an ESI callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      const storedStateData = sessionStorage.getItem('esi-auth-state');
      if (storedStateData) {
        setIsESICallback(true);
      }
    }
  }, []);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (isAuthenticated && isTokenExpired()) {
      refreshUserToken();
    }
  }, [isAuthenticated, isTokenExpired, refreshUserToken]);

  // Handle successful authentication
  const handleLoginSuccess = () => {
    console.log('🎉 Login success - clearing ESI callback state');
    setIsESICallback(false);
    setActiveTab('dashboard');
    setSettingsExpanded(false);
    
    // Clear URL parameters after successful auth
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleLoginError = () => {
    setIsESICallback(false);
    // Clear URL parameters after failed auth
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Show ESI callback handler if this is a callback
  if (isESICallback) {
    return (
      <ESICallback 
        onLoginSuccess={handleLoginSuccess}
        onLoginError={handleLoginError}
      />
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🔐 No auth or user - showing login page. Auth:', isAuthenticated, 'User:', !!user);
    return <LoginPage />;
  }

  console.log('🏠 Authenticated user:', user.characterName, '- showing main app');

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
  ];

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'eve', label: 'EVE Online', icon: Rocket },
    { id: 'sde', label: 'EVE SDE', icon: Archive },
    { id: 'esi', label: 'ESI Config', icon: Key },
    { id: 'sync', label: 'Data Sync', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleTabChange = (value: string) => {
    console.log('🔄 Tab change request:', value);
    
    if (!user) {
      console.log('❌ No user - blocking navigation');
      return;
    }

    if (value === 'settings') {
      setSettingsExpanded(!settingsExpanded);
      if (!settingsExpanded) {
        setActiveTab('settings' as TabType);
      } else {
        setActiveTab('dashboard');
      }
    } else {
      setActiveTab(value as TabType);
      setSettingsExpanded(false);
    }
  };

  const handleSettingsTabChange = (value: string) => {
    if (!user) return;
    setActiveSettingsTab(value);
  };

  return (
    <DatabaseProvider>
      <LMeveDataProvider>
        <div className="min-h-screen bg-background text-foreground">
        <Toaster />
        
        {/* Debug overlay */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 right-4 z-50 bg-card border border-border rounded p-3 text-xs font-mono max-w-sm">
            <div className="text-accent font-bold mb-2">DEBUG AUTH STATE</div>
            <div>User: {user?.characterName || 'null'}</div>
            <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
            <div>IsAdmin: {user?.isAdmin ? 'true' : 'false'}</div>
            <div>IsDirector: {user?.isDirector ? 'true' : 'false'}</div>
            <div>IsCEO: {user?.isCeo ? 'true' : 'false'}</div>
            <div>Active Tab: {activeTab}</div>
            <div>Settings Expanded: {settingsExpanded ? 'true' : 'false'}</div>
            <div>Should Show App: {(isAuthenticated && !!user) ? 'true' : 'false'}</div>
          </div>
        )}
        
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
                  {user?.allianceName || user?.corporationName || 'Unknown Corporation'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.characterName || 'Unknown User'}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.isAdmin ? 'Local Admin' : user?.isCeo ? 'CEO' : user?.isDirector ? 'Director' : 'Member'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-border hover:bg-muted"
                  onClick={logout}
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
            <div className="p-4 space-y-2 flex-1 overflow-y-auto">
              {/* Main navigation tabs */}
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                console.log(`Rendering tab button: ${tab.id}, isActive: ${isActive}, hasUser: ${!!user}`);
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      isActive 
                        ? "bg-accent text-accent-foreground shadow-sm" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={!user}
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

              {/* Settings section with expandable sub-menu */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant={activeTab === 'settings' ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    activeTab === 'settings'
                      ? "bg-accent text-accent-foreground shadow-sm" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!user}
                  onClick={() => handleTabChange('settings')}
                >
                  <Gear size={18} />
                  <span className="text-sm font-medium">Settings</span>
                  {settingsExpanded ? (
                    <CaretDown size={16} className="ml-auto" />
                  ) : (
                    <CaretRight size={16} className="ml-auto" />
                  )}
                </Button>

                {/* Settings sub-menu */}
                {settingsExpanded && (
                  <div className="mt-2 ml-6 space-y-1">
                    {settingsTabs.map((settingsTab) => {
                      const IconComponent = settingsTab.icon;
                      const isActiveSettings = activeSettingsTab === settingsTab.id;
                      return (
                        <Button
                          key={settingsTab.id}
                          variant={isActiveSettings ? "secondary" : "ghost"}
                          size="sm"
                          className={`w-full justify-start gap-2 text-xs ${
                            isActiveSettings 
                              ? "bg-secondary text-secondary-foreground" 
                              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => handleSettingsTabChange(settingsTab.id)}
                        >
                          <IconComponent size={14} />
                          <span>{settingsTab.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <div className="container mx-auto px-6 py-6">
                {activeTab === 'settings' ? (
                  <Settings activeTab={activeSettingsTab} onTabChange={handleSettingsTabChange} />
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </LMeveDataProvider>
    </DatabaseProvider>
  );
}

export default App;