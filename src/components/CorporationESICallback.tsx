import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Building,
  Crown,
  Shield,
  Warning,
  Info
} from '@phosphor-icons/react';
import { useCorporationAuth } from '@/lib/corp-auth';

interface CorporationESICallbackProps {
  onLoginSuccess: () => void;
  onLoginError: () => void;
}

export function CorporationESICallback({ onLoginSuccess, onLoginError }: CorporationESICallbackProps) {
  const { handleESICallback, registeredCorps, registerCorporation, user } = useCorporationAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'registration'>('processing');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing EVE Online authentication...');
  const [error, setError] = useState<string | null>(null);
  const [characterInfo, setCharacterInfo] = useState<any>(null);
  const [corporationInfo, setCorporationInfo] = useState<any>(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setError(error === 'access_denied' 
          ? 'Authentication was cancelled by user' 
          : `Authentication error: ${error}`);
        onLoginError();
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setError('Missing authentication parameters');
        onLoginError();
        return;
      }

      try {
        // Step 1: Verify callback parameters
        setProgress(20);
        setMessage('Verifying authentication parameters...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 2: Exchange code for tokens
        setProgress(40);
        setMessage('Exchanging authorization code for access tokens...');
        await new Promise(resolve => setTimeout(resolve, 800));

        // Step 3: Verify character identity
        setProgress(60);
        setMessage('Verifying character identity with EVE Online...');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Step 4: Check corporation access
        setProgress(80);
        setMessage('Validating corporation access permissions...');
        await new Promise(resolve => setTimeout(resolve, 700));

        // Step 5: Complete authentication
        setProgress(90);
        setMessage('Completing authentication...');
        
        await handleESICallback(code, state);
        
        // User should be available from the hook after successful callback
        if (user) {
          setCharacterInfo({
            name: user.characterName,
            id: user.characterId,
            isCeo: user.isCeo,
            isDirector: user.isDirector
          });
          
          setCorporationInfo({
            name: user.corporationName,
            id: user.corporationId,
            allianceName: user.allianceName
          });

          setProgress(100);
          setMessage('Authentication successful!');
          setStatus('success');
          
          setTimeout(() => {
            onLoginSuccess();
          }, 1500);
        } else {
          throw new Error('Authentication completed but user data not available');
        }

      } catch (error) {
        console.error('ESI callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        
        // Check if this is a corporation registration scenario
        if (errorMessage.includes('not registered')) {
          setStatus('registration');
          setNeedsRegistration(true);
          setMessage('Corporation ESI access needs to be registered');
          // TODO: Extract character/corp info from error or make additional API calls
        } else {
          setStatus('error');
          setError(errorMessage);
          onLoginError();
        }
      }
    };

    handleCallback();
  }, [handleESICallback, onLoginSuccess, onLoginError]);

  const handleRegisterCorporation = async () => {
    if (!characterInfo || !corporationInfo) return;
    
    try {
      setStatus('processing');
      setMessage('Registering corporation ESI access...');
      
      // In a real implementation, this would save the refresh token and register the corp
      await registerCorporation({
        corporationId: corporationInfo.id,
        corporationName: corporationInfo.name,
        refreshToken: 'refresh-token-placeholder', // This would come from the ESI callback
        registeredBy: characterInfo.id,
        scopes: ['default', 'scopes'] // This would come from the actual scopes granted
      });
      
      setStatus('success');
      setMessage('Corporation registered successfully!');
      
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
      
    } catch (error) {
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Clock size={24} className="text-accent animate-spin" />;
      case 'success':
        return <CheckCircle size={24} className="text-green-500" />;
      case 'error':
        return <XCircle size={24} className="text-red-500" />;
      case 'registration':
        return <Building size={24} className="text-amber-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-accent';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'registration':
        return 'text-amber-500';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Rocket size={32} className="text-accent" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            {getStatusIcon()}
            EVE Online Authentication
          </CardTitle>
          <CardDescription>
            Processing your login request
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'processing' && (
            <>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {message}
              </p>
            </>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle size={16} />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              
              {characterInfo && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span className="text-sm font-medium">Character</span>
                      </div>
                      <span className="text-sm">{characterInfo.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building size={16} />
                        <span className="text-sm font-medium">Corporation</span>
                      </div>
                      <span className="text-sm">{corporationInfo?.name}</span>
                    </div>
                    
                    {corporationInfo?.allianceName && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield size={16} />
                          <span className="text-sm font-medium">Alliance</span>
                        </div>
                        <span className="text-sm">{corporationInfo.allianceName}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    {characterInfo.isCeo && (
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                        <Crown size={12} className="mr-1" />
                        CEO
                      </Badge>
                    )}
                    {characterInfo.isDirector && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                        <Shield size={12} className="mr-1" />
                        Director
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'registration' && (
            <div className="space-y-4">
              <Alert>
                <Info size={16} />
                <AlertDescription>
                  Your corporation needs to register ESI access with LMeve. As a {characterInfo?.isCeo ? 'CEO' : 'Director'}, you can register it now.
                </AlertDescription>
              </Alert>
              
              {characterInfo && corporationInfo && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span className="text-sm font-medium">Character</span>
                      </div>
                      <span className="text-sm">{characterInfo.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building size={16} />
                        <span className="text-sm font-medium">Corporation</span>
                      </div>
                      <span className="text-sm">{corporationInfo.name}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleRegisterCorporation}
                    className="w-full"
                    disabled={false}
                  >
                    Register Corporation ESI Access
                  </Button>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <Warning size={16} />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={onLoginError}
                variant="outline"
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}