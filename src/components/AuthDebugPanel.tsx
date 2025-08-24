import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCorporationAuth } from '@/lib/corp-auth';
import { useKV } from '@github/spark/hooks';
import { UserCheck, RefreshCw, Trash2 } from '@phosphor-icons/react';

export function AuthDebugPanel() {
  const { user, loginWithCredentials, logout, authTrigger, isAuthenticated } = useCorporationAuth();
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [kvUser, setKVUser] = useKV('corp-auth-user', null);
  const [directTest, setDirectTest] = useState<string>('idle');

  // Force refresh every 2 seconds to see live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCounter(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const testLogin = async () => {
    setDirectTest('running');
    console.log('🔧 AUTH DEBUG - Starting login test');
    
    try {
      await loginWithCredentials('admin', '12345');
      setDirectTest('success');
      console.log('🔧 AUTH DEBUG - Login completed successfully');
    } catch (error) {
      setDirectTest('error');
      console.error('🔧 AUTH DEBUG - Login failed:', error);
    }
  };

  const clearAuth = () => {
    logout();
    setDirectTest('idle');
  };

  return (
    <Card className="border-accent/30 bg-card/50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <UserCheck size={16} />
          Authentication Debug Panel
          <Badge variant="outline" className="text-xs">
            Refresh #{refreshCounter}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Auth State */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-medium text-muted-foreground">Hook State</div>
            <div>User: {user?.characterName || 'null'}</div>
            <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
            <div>Auth Trigger: {authTrigger}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Raw KV State</div>
            <div>KV User: {kvUser?.characterName || 'null'}</div>
            <div>KV Type: {typeof kvUser}</div>
            <div>KV Auth: {kvUser ? 'true' : 'false'}</div>
          </div>
        </div>

        {/* User Details */}
        {user && (
          <div className="p-3 bg-muted/30 rounded text-xs space-y-1">
            <div className="font-medium">User Object Details:</div>
            <div>ID: {user.characterId}</div>
            <div>Name: {user.characterName}</div>
            <div>Corp: {user.corporationName}</div>
            <div>Is Admin: {user.isAdmin ? 'true' : 'false'}</div>
            <div>Auth Method: {user.authMethod}</div>
            <div>Login Time: {new Date(user.loginTime).toLocaleTimeString()}</div>
          </div>
        )}

        {/* Test Actions */}
        <div className="flex gap-2">
          <Button
            onClick={testLogin}
            size="sm"
            variant="outline"
            disabled={directTest === 'running'}
            className="text-xs"
          >
            {directTest === 'running' ? (
              <RefreshCw size={12} className="animate-spin mr-1" />
            ) : (
              <UserCheck size={12} className="mr-1" />
            )}
            Test Login
          </Button>
          
          <Button
            onClick={clearAuth}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            <Trash2 size={12} className="mr-1" />
            Clear Auth
          </Button>
        </div>

        {/* Test Status */}
        <div className="text-xs">
          <span className="font-medium">Test Status: </span>
          <Badge 
            variant={directTest === 'success' ? 'default' : directTest === 'error' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {directTest}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}