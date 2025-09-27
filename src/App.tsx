import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
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
  Building,
  Clock,
  Bell,
  Shield,
  Archive,
  SignIn,
  UserCheck,
  Eye,
  EyeSlash,
  DeviceMobile,
  Monitor,
  List
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { TabType } from '@/lib/types';
import { DatabaseProvider } from '@/lib/DatabaseContext';
import { LMeveDataProvider } from '@/lib/LMeveDataContext';
import { useAuth, AuthProvider } from '@/lib/auth-provider';
import { ESICallback } from '@/components/ESICallback';
import { canAccessTab, canAccessSettingsTab } from '@/lib/roles';
import { EVELoginButton } from '@/components/EVELoginButton';

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
import { Debug } from '@/components/tabs/Debug';

function AppContent() {
  const [activeTab, setActiveTab] = useKV<TabType>('active-tab', 'dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useKV<string>('active-settings-tab', 'general');
  const [settingsExpanded, setSettingsExpanded] = useKV<boolean>('settings-expanded', false);
  const [isMobileView, setIsMobileView] = useKV<boolean>('mobile-view', false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { 
    user, 
    isAuthenticated, 
    logout, 
    refreshUserToken, 
    isTokenExpired, 
    authTrigger,
    loginWithCredentials,
    loginWithESI,
    handleESICallback,
    esiConfig,
    getRegisteredCorporations
  } = useAuth();
  const [isESICallback, setIsESICallback] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  
  // Simple login form state
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Use corporation auth system
  const currentUser = user;
  const currentAuth = isAuthenticated;
  const currentLogout = logout;
  
  // Get corporation status for EVE login button
  const registeredCorps = getRegisteredCorporations();
  const getValidationStatus = () => {
    if (!esiConfig?.clientId) return 'not-configured';
    if (registeredCorps.length === 0) return 'no-corps';
    return 'configured';
  };

  // Debug ESI config
  React.useEffect(() => {
    console.log('🔧 ESI Config Debug:', {
      hasClientId: !!esiConfig?.clientId,
      clientId: esiConfig?.clientId ? esiConfig.clientId.substring(0, 8) + '...' : 'none',
      hasSecret: !!esiConfig?.clientSecret,
      isConfigured: esiConfig?.isConfigured,
      registeredCorpsCount: registeredCorps.length,
      validationStatus: getValidationStatus()
    });
  }, [esiConfig, registeredCorps]);

  // Force re-render when user changes to ensure UI updates
  React.useEffect(() => {
    console.log('🔄 User state changed:', {
      hasUser: !!currentUser,
      characterName: currentUser?.characterName,
      corporationName: currentUser?.corporationName,
      role: currentUser?.role,
      authMethod: currentUser?.authMethod,
      timestamp: Date.now()
    });
    
    if (currentUser) {
      console.log('✅ User object exists - should show main app');
      console.log('👤 User details:', {
        id: currentUser.characterId,
        name: currentUser.characterName,
        corp: currentUser.corporationName,
        role: currentUser.role,
        authMethod: currentUser.authMethod
      });
      setForceRender(prev => prev + 1);
      
      // Clear test marker since login was successful
      sessionStorage.removeItem('login-test-run');
      
      // Close quick login if open
      setShowQuickLogin(false);
      setLoginUsername('');
      setLoginPassword('');
      setIsLoggingIn(false);
    } else {
      console.log('❌ No user object - should show login');
    }
  }, [currentUser]);

  React.useEffect(() => {
    console.log('🔄 Auth trigger changed:', authTrigger);
    
    // Force component re-render when auth state changes
    if (authTrigger > 0) {
      setForceRender(prev => prev + 1);
    }
  }, [authTrigger]);

  // Simple, clear auth state logging
  React.useEffect(() => {
    console.log('🏠 App render state:', { 
      hasUser: !!currentUser,
      characterName: currentUser?.characterName, 
      corporationName: currentUser?.corporationName,
      isAuthenticated: currentAuth, 
      shouldShowApp: !!currentUser,
      forceRender,
      authTrigger,
      timestamp: Date.now()
    });
    
    // Reset tab to dashboard when user logs out or on any tab that requires auth
    if (!currentUser) {
      if (activeTab !== 'dashboard') {
        console.log('🔄 User not authenticated - resetting to dashboard tab');
        setActiveTab('dashboard');
        setSettingsExpanded(false);
      }
    }
  }, [currentUser, currentAuth, forceRender, authTrigger, activeTab]);

  // Check if this is an ESI callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const esiLoginAttempt = sessionStorage.getItem('esi-login-attempt');
    
    // Only process ESI callback if:
    // 1. We have code and state parameters 
    // 2. We have stored ESI auth state
    // 3. There was an explicit ESI login attempt
    if (code && state && esiLoginAttempt) {
      const storedStateData = sessionStorage.getItem('esi-auth-state');
      if (storedStateData) {
        console.log('🔗 Detected valid ESI callback - showing ESI processor');
        setIsESICallback(true);
      } else {
        console.log('⚠️ ESI callback detected but no stored state - clearing URL');
        // Clear invalid callback state
        sessionStorage.removeItem('esi-login-attempt');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (code || state) {
      // Clear any stray ESI parameters that aren't valid
      console.log('⚠️ Clearing invalid ESI callback parameters');
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('esi-login-attempt');
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
    
    // Clean up ESI-related session storage
    sessionStorage.removeItem('esi-login-attempt');
    sessionStorage.removeItem('esi-auth-state');
    
    // Clear URL parameters after successful auth
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Handle quick login form submission
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginUsername.trim() || !loginPassword.trim()) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      console.log('🔐 Quick login attempt:', loginUsername);
      await loginWithCredentials(loginUsername.trim(), loginPassword.trim());
      console.log('✅ Quick login successful');
      toast.success('Login successful!');
    } catch (error) {
      console.error('❌ Quick login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle ESI SSO login
  const handleESILogin = (scopeType: 'basic' | 'enhanced' | 'corporation' = 'basic') => {
    try {
      if (!esiConfig?.clientId) {
        toast.error('ESI authentication is not configured. Please contact your administrator.');
        return;
      }
      
      console.log('🚀 Starting ESI SSO login with scope type:', scopeType);
      const authUrl = loginWithESI(scopeType);
      
      // Redirect to EVE Online SSO
      window.location.href = authUrl;
    } catch (error) {
      console.error('❌ ESI login error:', error);
      toast.error('Failed to initiate ESI login. Please try again.');
    }
  };

  // Handle failed authentication
  const handleLoginError = () => {
    console.log('❌ Login error - clearing ESI callback state');
    setIsESICallback(false);
    
    // Clean up ESI-related session storage
    sessionStorage.removeItem('esi-login-attempt'); 
    sessionStorage.removeItem('esi-auth-state');
    
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

  // App is always visible - authentication handled via modal
  // No dedicated login page blocking access

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
    { id: 'debug', label: 'Debug', icon: UserCheck, component: Debug },
  ];

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'esi', label: 'Corporations', icon: Building },
    { id: 'sync', label: 'Data Sync', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const handleTabChange = (value: string) => {
    console.log('🔄 Tab change request:', value, 'Current user:', currentUser?.characterName || 'null');
    console.log('🔄 Tab change - Auth state:', { hasUser: !!currentUser, isAuthenticated: currentAuth, authTrigger });
    
    // Restrict navigation when not authenticated - except dashboard
    if (!currentUser && value !== 'dashboard') {
      console.log('❌ Tab change blocked - user not authenticated');
      setShowQuickLogin(true);
      return;
    }
    
    // Check tab access permissions for authenticated users
    if (currentUser && !canAccessTab(currentUser, value)) {
      console.log('❌ Tab change blocked - insufficient permissions');
      toast.error('You do not have permission to access this section');
      return;
    }
    
    console.log('🔄 Allowing tab change to:', value);
    
    if (value === 'settings') {
      // Only allow settings access if authenticated
      if (!currentUser) {
        setShowQuickLogin(true);
        return;
      }
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
    
    console.log('✅ Tab change complete - new active tab:', value);
  };

  const handleSettingsTabChange = (value: string) => {
    // Check settings tab access permissions
    if (currentUser && !canAccessSettingsTab(currentUser, value)) {
      console.log('❌ Settings tab change blocked - insufficient permissions');
      toast.error('You do not have permission to access this section');
      return;
    }
    
    setActiveSettingsTab(value);
  };

  // Show mobile menu or desktop layout
  const visibleTabs = tabs.filter(tab => {
    if (!currentUser && tab.id !== 'dashboard') return false;
    return canAccessTab(currentUser, tab.id);
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
            <div className="flex">
              {/* Sidebar */}
              <div className={`${isMobileView ? 'fixed inset-y-0 left-0 z-50 w-64' : 'w-64'} ${isMobileView && !showMobileMenu ? '-translate-x-full' : ''} transition-transform duration-300 bg-card border-r border-border flex flex-col`}>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xl font-bold">
                    <Rocket className="text-accent" />
                    EVE Corp Hub
                  </div>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                  {visibleTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                          isActive 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {tab.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}

                  {/* Settings Section */}
                  {currentUser && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <button
                        onClick={() => handleTabChange('settings')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                          settingsExpanded 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Gear size={20} />
                          <span>Settings</span>
                        </div>
                        {settingsExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
                      </button>

                      {settingsExpanded && (
                        <div className="mt-1 ml-6 space-y-1">
                          {settingsTabs
                            .filter(tab => canAccessSettingsTab(currentUser, tab.id))
                            .map((tab) => {
                              const Icon = tab.icon;
                              const isActive = activeSettingsTab === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  onClick={() => handleSettingsTabChange(tab.id)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                                    isActive 
                                      ? 'bg-accent/50 text-accent-foreground' 
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  }`}
                                >
                                  <Icon size={16} />
                                  <span>{tab.label}</span>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-border">
                  {currentUser ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm">
                        <div className="font-medium truncate">{currentUser.characterName}</div>
                        <div className="text-muted-foreground text-xs truncate">{currentUser.corporationName}</div>
                        <div className="text-xs text-accent capitalize">{currentUser.role}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={currentLogout} 
                        className="w-full justify-start"
                      >
                        <SignOut size={16} className="mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Not logged in
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowQuickLogin(true)} 
                        className="w-full justify-start"
                      >
                        <SignIn size={16} className="mr-2" />
                        Login
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile menu overlay */}
              {isMobileView && showMobileMenu && (
                <div 
                  className="fixed inset-0 bg-black/50 z-40" 
                  onClick={() => setShowMobileMenu(false)} 
                />
              )}

              {/* Main Content */}
              <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar for mobile */}
                {isMobileView && (
                  <div className="bg-card border-b border-border p-4 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                      <List size={20} />
                    </Button>
                    <div className="font-semibold">
                      {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileView(false)}
                    >
                      <Monitor size={20} />
                    </Button>
                  </div>
                )}

                {/* Content Area */}
                <div className="flex-1 p-6">
                  {activeTab === 'settings' && settingsExpanded ? (
                    <Settings activeTab={activeSettingsTab} />
                  ) : (
                    (() => {
                      const activeTabConfig = tabs.find(tab => tab.id === activeTab);
                      const Component = activeTabConfig?.component || Dashboard;
                      return <Component />;
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Quick Login Modal */}
            {showQuickLogin && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Login Required</h3>
                  
                  <form onSubmit={handleQuickLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Username</label>
                      <Input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Enter username"
                        disabled={isLoggingIn}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter password"
                          disabled={isLoggingIn}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          disabled={isLoggingIn}
                        >
                          {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={isLoggingIn || !loginUsername.trim() || !loginPassword.trim()}
                        className="flex-1"
                      >
                        {isLoggingIn ? 'Logging in...' : 'Login'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowQuickLogin(false);
                          setLoginUsername('');
                          setLoginPassword('');
                          setIsLoggingIn(false);
                        }}
                        disabled={isLoggingIn}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="text-center mb-3">
                      <span className="text-sm text-muted-foreground">Or login with EVE Online</span>
                    </div>
                    <EVELoginButton
                      onLogin={handleESILogin}
                      validationStatus={getValidationStatus()}
                      registeredCorps={registeredCorps}
                    />
                  </div>
                </div>
              </div>
            )}

            <Toaster />
          </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <LMeveDataProvider>
          <AppContent />
        </LMeveDataProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}