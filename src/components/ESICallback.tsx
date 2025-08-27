import React, { useEffect, useState } from 'react';
import { Rocket, AlertCircle, CheckCircle, Loader2 } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-provider';

interface ESICallbackProps {
  onLoginSuccess: () => void;
  onLoginError: () => void;
}

export function ESICallback({ onLoginSuccess, onLoginError }: ESICallbackProps) {
  const { handleESICallback } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [characterName, setCharacterName] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('🔄 Processing ESI callback');
        setStatus('processing');
        
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        // Handle OAuth error
        if (error) {
          const errorDescription = urlParams.get('error_description') || 'Authentication was denied or cancelled';
          throw new Error(errorDescription);
        }
        
        // Validate required parameters
        if (!code || !state) {
          throw new Error('Missing required authentication parameters');
        }
        
        console.log('🔄 Processing ESI authentication with code and state');
        
        // Process the callback
        const user = await handleESICallback(code, state);
        
        setCharacterName(user.characterName || 'Unknown Character');
        setStatus('success');
        
        console.log('✅ ESI authentication successful');
        
        // Delay to show success message
        setTimeout(() => {
          onLoginSuccess();
        }, 2000);
        
      } catch (error) {
        console.error('❌ ESI callback processing failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        setError(errorMessage);
        setStatus('error');
        
        // Delay to show error message
        setTimeout(() => {
          onLoginError();
        }, 3000);
      }
    };
    
    processCallback();
  }, [handleESICallback, onLoginSuccess, onLoginError]);

  const handleRetry = () => {
    onLoginError();
  };

  return (
    <div className=\"min-h-screen bg-background flex items-center justify-center p-4\">
      <Card className=\"w-full max-w-md mx-auto\">
        <CardHeader className=\"text-center\">
          <div className=\"flex justify-center mb-4\">
            {status === 'processing' && (
              <div className=\"bg-accent/20 p-4 rounded-full\">
                <Loader2 size={32} className=\"text-accent animate-spin\" />
              </div>
            )}
            {status === 'success' && (
              <div className=\"bg-green-500/20 p-4 rounded-full\">
                <CheckCircle size={32} className=\"text-green-500\" />
              </div>
            )}
            {status === 'error' && (
              <div className=\"bg-red-500/20 p-4 rounded-full\">
                <AlertCircle size={32} className=\"text-red-500\" />
              </div>
            )}
          </div>
          
          <CardTitle className=\"text-xl\">
            {status === 'processing' && 'Processing Authentication'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className=\"space-y-4\">
          {status === 'processing' && (
            <div className=\"text-center text-muted-foreground\">
              <p className=\"mb-2\">Authenticating with EVE Online...</p>
              <p className=\"text-sm\">This may take a few moments.</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className=\"text-center space-y-2\">
              <p className=\"text-green-500 font-medium\">
                Welcome, {characterName}!
              </p>
              <p className=\"text-sm text-muted-foreground\">
                Your EVE Online authentication was successful. 
                You will be redirected to the dashboard shortly.
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className=\"space-y-4\">
              <Alert variant=\"destructive\">
                <AlertCircle size={16} />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              
              <div className=\"text-center\">
                <p className=\"text-sm text-muted-foreground mb-4\">
                  Please try signing in again or contact your administrator if the problem persists.
                </p>
                <Button onClick={handleRetry} variant=\"outline\" className=\"w-full\">
                  <Rocket size={16} className=\"mr-2\" />
                  Return to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}