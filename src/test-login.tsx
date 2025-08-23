import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simple test login component to verify auth works
export function TestLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const testDirectAuth = async () => {
    setStatus('Testing auth...');
    
    try {
      // Check admin credentials
      if (username === 'admin' && password === '12345') {
        console.log('✅ Credentials match');
        
        // Set user directly in KV
        const testUser = {
          characterId: 999999999,
          characterName: 'Test Admin',
          corporationId: 1000000000,
          corporationName: 'Test Corp',
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          tokenExpiry: Date.now() + 86400000,
          scopes: [],
          isDirector: true,
          isCeo: true,
          isAdmin: true
        };
        
        console.log('Setting auth-user in KV...');
        await spark.kv.set('auth-user', testUser);
        
        // Verify it was set
        const storedUser = await spark.kv.get('auth-user');
        console.log('Stored user:', storedUser);
        
        setStatus('✅ Auth test successful! User should be logged in.');
        
        // Force page reload to trigger auth check
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } else {
        setStatus('❌ Invalid credentials');
      }
    } catch (error) {
      console.error('Auth test failed:', error);
      setStatus('❌ Auth test failed: ' + (error as Error).message);
    }
  };

  const checkAuthState = async () => {
    try {
      const authUser = await spark.kv.get('auth-user');
      const allKeys = await spark.kv.keys();
      
      console.log('Current auth user:', authUser);
      console.log('All KV keys:', allKeys);
      
      setStatus(`Auth user: ${authUser?.characterName || 'none'}, Keys: ${allKeys.length}`);
    } catch (error) {
      setStatus('Error checking auth: ' + (error as Error).message);
    }
  };

  const clearAuth = async () => {
    try {
      await spark.kv.delete('auth-user');
      setStatus('Auth cleared');
    } catch (error) {
      setStatus('Error clearing auth: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Auth Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <Input 
              type="password"
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <Button onClick={testDirectAuth} className="w-full">
            Test Direct Auth
          </Button>
          
          <Button onClick={checkAuthState} variant="outline" className="w-full">
            Check Auth State
          </Button>
          
          <Button onClick={clearAuth} variant="destructive" className="w-full">
            Clear Auth
          </Button>
          
          {status && (
            <div className="text-sm p-2 bg-muted rounded">
              {status}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}