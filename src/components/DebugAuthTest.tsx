import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

export function DebugAuthTest() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState({ username: 'admin', password: '12345' });
  const [isLogging, setIsLogging] = useState(false);

  const handleLogin = async () => {
    setIsLogging(true);
    console.log('🧪 DEBUG: Starting login test...');
    
    try {
      await login(credentials);
      console.log('✅ DEBUG: Login completed successfully');
    } catch (error) {
      console.error('❌ DEBUG: Login failed:', error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="p-6 bg-card border border-border rounded-lg space-y-4">
      <h2 className="text-xl font-bold">Debug Authentication Test</h2>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Current Auth State:</h3>
        <div className="bg-muted p-3 rounded text-sm font-mono">
          <div>User: {user ? user.characterName : 'null'}</div>
          <div>Is Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
          <div>Has User Object: {user ? 'true' : 'false'}</div>
          <div>Is Admin: {user?.isAdmin ? 'true' : 'false'}</div>
        </div>
      </div>

      {!user ? (
        <div className="space-y-4">
          <h3 className="font-semibold">Login Test:</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
            <Button 
              onClick={handleLogin}
              disabled={isLogging}
              className="bg-accent hover:bg-accent/90"
            >
              {isLogging ? 'Logging in...' : 'Test Login'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold">Logged in as: {user.characterName}</h3>
          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}