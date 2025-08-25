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
  EyeSlash
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { TabType } from '@/lib/types';
import { DatabaseProvider } from '@/lib/DatabaseContext';
import { LMeveDataProvider } from '@/lib/LMeveDataContext';
import { useCorporationAuth } from '@/lib/corp-auth';
import { CorporationESICallback } from '@/components/CorporationESICallback';

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
  const { 
    user, 
    isAuthenticated, 
    logout, 
    refreshUserToken, 
    isTokenExpired, 
    authTrigger,
    loginWithCredentials,
    loginWithESI,
    esiConfig
  } = useCorporationAuth();
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

  // Force re-render when user changes to ensure UI updates
  React.useEffect(() => {
    console.log('🔄 User state changed:', {
      hasUser: !!currentUser,
      characterName: currentUser?.characterName,
      corporationName: currentUser?.corporationName,
      isAdmin: currentUser?.isAdmin,
      authMethod: currentUser?.authMethod,
      canManageESI: currentUser?.canManageESI,
      timestamp: Date.now()
    });
    
    if (currentUser) {
      console.log('✅ User object exists - should show main app');
      console.log('👤 User details:', {
        id: currentUser.characterId,
        name: currentUser.characterName,
        corp: currentUser.corporationName,
        isAdmin: currentUser.isAdmin,
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
  const handleESILogin = () => {
    try {
      if (!esiConfig?.clientId) {
        toast.error('ESI authentication is not configured. Please contact your administrator.');
        return;
      }
      
      console.log('🚀 Starting ESI SSO login');
      const authUrl = loginWithESI();
      
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
      <CorporationESICallback 
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
  ];

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'sde', label: 'EVE SDE', icon: Archive },
    { id: 'esi', label: 'Corporations', icon: Building },
    { id: 'sync', label: 'Data Sync', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'debug', label: 'Debug', icon: UserCheck },
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
            <div>User: {currentUser?.characterName || 'null'}</div>
            <div>Corporation: {currentUser?.corporationName || 'null'}</div>
            <div>Has User Object: {currentUser ? 'true' : 'false'}</div>
            <div>Is Admin: {currentUser?.isAdmin ? 'true' : 'false'}</div>
            <div>Auth Method: {currentUser?.authMethod || 'none'}</div>
            <div>Can Manage ESI: {currentUser?.canManageESI ? 'true' : 'false'}</div>
            <div>Is Authenticated: {currentAuth ? 'true' : 'false'}</div>
            <div>Show Quick Login: {showQuickLogin ? 'true' : 'false'}</div>
            <div>Active Tab: {activeTab}</div>
            <div>Auth Trigger: {authTrigger}</div>
            <div>Force Render: {forceRender}</div>
            <div className="mt-2 text-xs">
              {currentUser ? (
                <span className="text-green-400">✅ AUTHENTICATED</span>
              ) : (
                <span className="text-red-400">❌ NOT AUTHENTICATED</span>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs py-1 h-6"
                onClick={async () => {
                  try {
                    await loginWithCredentials('admin', '12345');
                    console.log('🧪 Direct login test completed');
                  } catch (error) {
                    console.error('🧪 Direct login test failed:', error);
                  }
                }}
              >
                Test Login
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs py-1 h-6"
                onClick={() => {
                  console.log('🧪 Force logout test');
                  currentLogout();
                }}
              >
                Force Logout
              </Button>
            </div>
          </div>
        )}
        
        {/* Quick Login Overlay */}
        {showQuickLogin && !currentUser && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
              <div className="text-center mb-6">
                <Rocket size={32} className="mx-auto text-accent mb-3" />
                <h2 className="text-xl font-semibold mb-2">Sign In to LMeve</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to access corporation management
                </p>
              </div>
              
              <form onSubmit={handleQuickLogin} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    disabled={isLoggingIn}
                    className="w-full"
                    autoFocus
                  />
                </div>
                
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoggingIn}
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn}
                  >
                    {showPassword ? (
                      <EyeSlash size={16} className="text-muted-foreground" />
                    ) : (
                      <Eye size={16} className="text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowQuickLogin(false);
                      setLoginUsername('');
                      setLoginPassword('');
                    }}
                    disabled={isLoggingIn}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoggingIn || !loginUsername.trim() || !loginPassword.trim()}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isLoggingIn ? 'Signing In...' : 'Sign In'}
                  </Button>
                </div>
              </form>
              
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              {/* ESI SSO Login */}
              <Button 
                onClick={handleESILogin}
                disabled={isLoggingIn || !esiConfig?.clientId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Rocket size={16} className="mr-2" />
                Sign In with EVE Online
              </Button>
              
              {!esiConfig?.clientId && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  EVE SSO login requires ESI configuration by an administrator
                </p>
              )}
              
              <div className="text-xs text-muted-foreground text-center mt-4">
                Default admin: <strong>admin</strong> / <strong>12345</strong>
              </div>
            </div>
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
                {currentUser && (
                  <Badge variant="secondary" className="text-xs bg-accent/20 text-accent border-accent/30">
                    {currentUser.corporationName || 'Unknown Corporation'}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {currentUser ? (
                  // Authenticated user section
                  <>
                    <div className="text-right">
                      <p className="text-sm font-medium">{currentUser.characterName}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.isAdmin ? 'Local Admin' : 
                         currentUser.isCeo ? 'CEO' : 
                         currentUser.isDirector ? 'Director' : 'Member'}
                        {currentUser.authMethod === 'esi' && ' • ESI'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-border hover:bg-muted"
                      onClick={currentLogout}
                    >
                      <SignOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  // Unauthenticated user section  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setShowQuickLogin(true)}
                      variant="outline"
                      size="sm"
                    >
                      <SignIn size={16} className="mr-2" />
                      Local Sign In
                    </Button>
                    {esiConfig?.clientId && (
                      <Button 
                        onClick={handleESILogin}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Rocket size={16} className="mr-2" />
                        EVE SSO
                      </Button>
                    )}
                  </div>
                )}
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
                // Only dashboard is accessible when not authenticated
                const isDisabled = !currentUser && tab.id !== 'dashboard';
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    disabled={isDisabled}
                    className={`w-full justify-start gap-3 ${
                      isActive 
                        ? "bg-accent text-accent-foreground shadow-sm" 
                        : isDisabled
                        ? "opacity-50 cursor-not-allowed text-muted-foreground"
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

              {/* Settings section with expandable sub-menu */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant={activeTab === 'settings' ? "default" : "ghost"}
                  disabled={!currentUser}
                  className={`w-full justify-start gap-3 ${
                    activeTab === 'settings'
                      ? "bg-accent text-accent-foreground shadow-sm" 
                      : !currentUser
                      ? "opacity-50 cursor-not-allowed text-muted-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
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

                {/* Settings sub-menu - only show when authenticated */}
                {settingsExpanded && currentUser && (
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
                {!currentUser ? (
                  // Always show dashboard with login prompt when not authenticated
                  activeTab === 'dashboard' ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4 max-w-md">
                        <Rocket size={48} className="mx-auto text-accent" />
                        <h2 className="text-2xl font-bold">Welcome to LMeve</h2>
                        <p className="text-muted-foreground">
                          LMeve is a comprehensive corporation management tool for EVE Online. 
                          Sign in to access your corporation's data and management features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            onClick={() => setShowQuickLogin(true)}
                            variant="outline"
                          >
                            <SignIn size={16} className="mr-2" />
                            Local Sign In
                          </Button>
                          {esiConfig?.clientId && (
                            <Button 
                              onClick={handleESILogin}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Rocket size={16} className="mr-2" />
                              Sign In with EVE Online
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4 max-w-md">
                        <Shield size={48} className="mx-auto text-muted-foreground" />
                        <h2 className="text-xl font-semibold">Authentication Required</h2>
                        <p className="text-muted-foreground">
                          You need to sign in to access this section.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            onClick={() => setShowQuickLogin(true)}
                            variant="outline"
                          >
                            <SignIn size={16} className="mr-2" />
                            Local Sign In
                          </Button>
                          {esiConfig?.clientId && (
                            <Button 
                              onClick={handleESILogin}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Rocket size={16} className="mr-2" />
                              Sign In with EVE Online
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ) : activeTab === 'settings' ? (
                  <Settings activeTab={activeSettingsTab || 'general'} onTabChange={handleSettingsTabChange} />
                ) : (
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    {tabs.map((tab) => {
                      const Component = tab.component;
                      return (
                        <TabsContent key={tab.id} value={tab.id} className="mt-0">
                          <Component onLoginClick={() => setShowQuickLogin(true)} />
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