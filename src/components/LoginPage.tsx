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
  const { login, loginWithESI, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      await login(credentials);
      onLoginSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleESILogin = () => {
    setError(null);
    try {
      const { url, state } = loginWithESI();
      
      // Store the state for verification when user returns
      sessionStorage.setItem('esi-auth-state', JSON.stringify(state));
      
      // Redirect to ESI OAuth
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ESI login failed');
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({ ...prev, [field]: e.target.value }));
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
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              <SignIn size={18} className="mr-2" />
              Login with EVE Online
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
                  disabled={isLoading}
                  className="bg-input border-border"
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
                    disabled={isLoading}
                    className="bg-input border-border pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
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
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Development Info */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                For testing: Username: <code className="bg-muted px-1 rounded">admin</code>, 
                Password: <code className="bg-muted px-1 rounded">password</code>
              </p>
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