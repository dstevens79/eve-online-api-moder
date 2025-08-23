import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Rocket, SignIn, Eye, EyeSlash } from '@phosphor-icons/react';
import { useAuth, LoginCredentials } from '@/lib/auth';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login, loginWithESI, isLoading: authIsLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocalLoginLoading, setIsLocalLoginLoading] = useState(false);

  console.log('LoginPage render - loading states:', { authIsLoading, isLocalLoginLoading });

  const handleCredentialLogin = async (e?: React.FormEvent) => {
    console.log('handleCredentialLogin called, e:', e?.type);
    e?.preventDefault();
    setError(null);
    
    // Force the loading state to be visible immediately
    setIsLocalLoginLoading(true);
    
    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 10));

    console.log('LoginPage.handleCredentialLogin called with:', {
      username: credentials.username,
      passwordLength: credentials.password?.length,
      usernameLength: credentials.username?.length,
      trimmedUsername: credentials.username?.trim(),
      trimmedPasswordLength: credentials.password?.trim()?.length
    });

    if (!credentials.username?.trim() || !credentials.password?.trim()) {
      console.log('Validation failed - missing credentials');
      setError('Please enter both username and password');
      setIsLocalLoginLoading(false);
      return;
    }

    try {
      console.log('LoginPage: Calling auth.login...');
      await login(credentials);
      console.log('LoginPage: Login successful, calling onLoginSuccess');
      onLoginSuccess?.();
    } catch (err) {
      console.error('LoginPage: Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      console.log('LoginPage: Setting isLocalLoginLoading to false');
      setIsLocalLoginLoading(false);
    }
  };

  const handleESILogin = () => {
    setError(null);
    setError('ESI authentication is not available in this demo environment. ESI login requires a production deployment with proper OAuth callback handling. Use the username/password login for testing.');
  };

  const handleInputChange = (field: keyof LoginCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCredentials(prev => ({ ...prev, [field]: value }));
    console.log(`Input changed - ${field}:`, value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCredentialLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
      
      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket size={32} className="text-accent" />
            <h1 className="text-3xl font-bold text-foreground">LMeve</h1>
          </div>
          <p className="text-muted-foreground">
            EVE Online Corporation Management
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your corporation's industry, assets, and operations
          </p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Login with your EVE Online character or use credentials
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* ESI Login Button */}
            <Button
              onClick={handleESILogin}
              disabled={authIsLoading}
              className="w-full bg-accent hover:bg-accent/90 active:bg-accent/80 text-accent-foreground transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98]"
              size="lg"
            >
              <SignIn size={18} className="mr-2" />
              {authIsLoading ? 'Connecting...' : 'Login with EVE Online'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Traditional Login Form */}
            <form onSubmit={handleCredentialLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  onKeyDown={handleKeyDown}
                  disabled={authIsLoading || isLocalLoginLoading}
                  className="bg-input border-border"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleInputChange('password')}
                    onKeyDown={handleKeyDown}
                    disabled={authIsLoading || isLocalLoginLoading}
                    className="bg-input border-border pr-10"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeSlash size={16} className="text-muted-foreground" />
                    ) : (
                      <Eye size={16} className="text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={authIsLoading || isLocalLoginLoading}
                className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground border-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                variant="default"
              >
                {isLocalLoginLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Development Info */}
            <div className="pt-4 border-t border-border">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  For testing: Username: <code className="bg-muted px-1 rounded">admin</code>, 
                  Password: <code className="bg-muted px-1 rounded">12345</code>
                </p>
                
                {/* Debug button for testing */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      console.log('Debug login button clicked');
                      setCredentials({ username: 'admin', password: '12345' });
                      setError(null);
                      setIsLocalLoginLoading(true);
                      try {
                        await login({ username: 'admin', password: '12345' });
                        onLoginSuccess?.();
                      } catch (err) {
                        console.error('Debug login error:', err);
                        setError(err instanceof Error ? err.message : 'Login failed');
                      } finally {
                        setIsLocalLoginLoading(false);
                      }
                    }}
                    className="text-xs"
                    disabled={authIsLoading || isLocalLoginLoading}
                  >
                    {isLocalLoginLoading ? 'Logging in...' : 'Debug: Auto Login'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>LMeve is not affiliated with CCP Games or EVE Online</p>
          <p className="mt-1">EVE Online and the EVE logo are trademarks of CCP hf.</p>
        </div>
      </div>
    </div>
  );
}