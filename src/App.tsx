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
  
  // Debug activeTab changes
  useEffect(() => {
    console.log('🏷️ ACTIVE TAB CHANGED TO:', activeTab);
  }, [activeTab]);
  const [activeSettingsTab, setActiveSettingsTab] = useKV<string>('active-settings-tab', 'general');
  const [settingsExpanded, setSettingsExpanded] = useKV<boolean>('settings-expanded', false);
  const { user, isAuthenticated, logout, refreshUserToken, isTokenExpired, adminConfig, updateAdminConfig } = useAuth();
  const [isESICallback, setIsESICallback] = useState(false);

  // Debug user state changes
  useEffect(() => {
    console.log('App - auth state change detected:', { 
      hasUser: !!user,
      characterName: user?.characterName, 
      isAuthenticated, 
      isAdmin: user?.isAdmin,
      isDirector: user?.isDirector,
      isCeo: user?.isCeo,
      shouldShowApp: isAuthenticated && !!user,
      currentActiveTab: activeTab,
      timestamp: Date.now()
    });
    
    // If user just logged in, ensure we're on dashboard
    if (isAuthenticated && user && activeTab !== 'dashboard') {
      console.log('User authenticated, resetting to dashboard from:', activeTab);
      setActiveTab('dashboard');
      setSettingsExpanded(false);
    }
  }, [user, isAuthenticated, activeTab, setActiveTab, setSettingsExpanded]);

  // Check if this is an ESI callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    // Only consider it an ESI callback if we have both code AND state AND stored ESI state
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
    console.log('App.handleLoginSuccess called - clearing ESI callback state and resetting to dashboard');
    setIsESICallback(false);
    
    // Reset to dashboard on successful login
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

  // Show login page if not authenticated or no user data
  // Simple, clear logic: if we have a user AND are authenticated, show the app
  const shouldShowApp = Boolean(user && isAuthenticated);
  const shouldShowLogin = !shouldShowApp && !isESICallback;
  
  console.log('App render decision:', { 
    hasUser: !!user,
    isAuthenticated, 
    shouldShowApp,
    shouldShowLogin,
    isESICallback,
    userType: typeof user,
    userCharacterName: user?.characterName,
    timestamp: Date.now()
  });
  
  // Simple check: if we don't have a user AND are authenticated, show app
  // If we don't have both, show login page (unless it's an ESI callback)
  if (shouldShowLogin) {
    console.log('Showing login page - missing auth or user data');
    return <LoginPage />;
  }

  if (!shouldShowApp) {
    console.log('Auth state unclear, showing login for safety');
    return <LoginPage />;
  }

  console.log('Showing main app for user:', user?.characterName, 'with admin permissions:', user?.isAdmin);

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
    console.log('=== TAB CHANGE REQUEST ===');
    console.log('Requested tab:', value);
    console.log('Current tab:', activeTab);
    console.log('User state:', {
      hasUser: !!user,
      characterName: user?.characterName,
      isAdmin: user?.isAdmin,
      isDirector: user?.isDirector,
      isCeo: user?.isCeo,
      isAuthenticated
    });
    console.log('========================');
    
    // Check user permissions for navigation
    if (!user) {
      console.log('❌ TAB CHANGE BLOCKED: No user');
      return;
    }

    if (value === 'settings') {
      console.log('🔧 Settings tab logic');
      setSettingsExpanded(!settingsExpanded);
      if (!settingsExpanded) {
        console.log('Expanding settings, setting active tab to settings');
        setActiveTab('settings' as TabType);
      } else {
        console.log('Collapsing settings, returning to dashboard');
        setActiveTab('dashboard');
      }
    } else {
      console.log('✅ Setting active tab to:', value);
      setActiveTab(value as TabType);
      setSettingsExpanded(false);
    }
    
    console.log('Tab change completed. New tab should be:', value === 'settings' && settingsExpanded ? 'dashboard' : value);
  };

  const handleSettingsTabChange = (value: string) => {
    console.log('App.handleSettingsTabChange called with:', value, 'user permissions:', {
      isAdmin: user?.isAdmin,
      isDirector: user?.isDirector,
      isCeo: user?.isCeo,
      hasUser: !!user
    });
    
    if (!user) {
      console.log('No user - preventing settings navigation');
      return;
    }
    
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
            <div>Should Show App: {shouldShowApp ? 'true' : 'false'}</div>
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
                    onClick={() => {
                      console.log('Navigation button clicked:', tab.id, 'User available:', !!user);
                      if (user) {
                        handleTabChange(tab.id);
                      } else {
                        console.log('Blocked - no user');
                      }
                    }}
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
                  onClick={() => {
                    console.log('Settings button clicked, User available:', !!user);
                    if (user) {
                      handleTabChange('settings');
                    } else {
                      console.log('Blocked - no user');
                    }
                  }}
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
                          onClick={() => {
                            console.log('Settings sub-tab clicked:', settingsTab.id);
                            handleSettingsTabChange(settingsTab.id);
                          }}
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