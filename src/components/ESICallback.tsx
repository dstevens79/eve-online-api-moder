import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Rocket, CheckCircle, XCircle, Spinner } from '@phosphor-icons/react';
import { useAuth, ESIAuthState } from '@/lib/auth';

interface ESICallbackProps {
  onLoginSuccess?: () => void;
  onLoginError?: () => void;
}

export function ESICallback({ onLoginSuccess, onLoginError }: ESICallbackProps) {
  const { handleESICallback } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setError(`ESI authentication error: ${error}`);
        onLoginError?.();
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setError('Missing authorization code or state parameter');
        onLoginError?.();
        return;
      }

      try {
        // Retrieve stored state
        const storedStateData = sessionStorage.getItem('esi-auth-state');
        if (!storedStateData) {
          throw new Error('No stored authentication state found');
        }

        const storedState: ESIAuthState = JSON.parse(storedStateData);
        
        // Handle the callback
        await handleESICallback(code, state, storedState);
        
        // Clean up stored state
        sessionStorage.removeItem('esi-auth-state');
        
        setStatus('success');
        
        // Redirect after successful login
        setTimeout(() => {
          onLoginSuccess?.();
        }, 2000);
        
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Authentication failed');
        onLoginError?.();
      }
    };

    handleCallback();
  }, [handleESICallback, onLoginSuccess, onLoginError]);

  const handleRetry = () => {
    // Clean up and redirect back to login
    sessionStorage.removeItem('esi-auth-state');
    onLoginError?.();
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
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              {status === 'loading' && (
                <>
                  <Spinner size={20} className="animate-spin text-accent" />
                  Authenticating...
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle size={20} className="text-green-500" />
                  Authentication Successful
                </>
              )}
              {status === 'error' && (
                <>
                  <XCircle size={20} className="text-destructive" />
                  Authentication Failed
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' && 'Processing your EVE Online authentication...'}
              {status === 'success' && 'You will be redirected to the application shortly.'}
              {status === 'error' && 'There was a problem with your authentication.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'loading' && (
              <div className="text-center py-8">
                <div className="space-y-2">
                  <Spinner size={32} className="animate-spin text-accent mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Verifying your character information...
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-4">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Welcome to LMeve! Redirecting you to the application...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <XCircle size={16} />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="text-center">
                  <Button onClick={handleRetry} variant="outline" className="w-full">
                    Return to Login
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Make sure you have the required corporation roles and try again.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}