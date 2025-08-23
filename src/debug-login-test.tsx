// Debug component to test admin login flow
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

export function DebugLoginTest() {
  const { user, isAuthenticated, login, logout, authTrigger } = useAuth();
  const [credentials, setCredentials] = useState({ username: 'admin', password: '12345' });
  const [testResult, setTestResult] = useState<string>('');
  const [isTestingLogin, setIsTestingLogin] = useState(false);

  const runLoginTest = async () => {
    setIsTestingLogin(true);
    setTestResult('');
    
    try {
      console.log('🧪 DEBUG: Starting login test...');
      console.log('🧪 DEBUG: Before login - User:', user?.characterName || 'null');
      console.log('🧪 DEBUG: Before login - isAuthenticated:', isAuthenticated);
      
      await login(credentials);
      
      console.log('🧪 DEBUG: After login - User:', user?.characterName || 'null');
      console.log('🧪 DEBUG: After login - isAuthenticated:', isAuthenticated);
      
      setTestResult('✅ Login successful! Check console for details.');
      
      // Wait a moment and check again
      setTimeout(() => {
        console.log('🧪 DEBUG: 1 second after login - User:', user?.characterName || 'null');
        console.log('🧪 DEBUG: 1 second after login - isAuthenticated:', isAuthenticated);
      }, 1000);
      
    } catch (error) {
      console.error('🧪 DEBUG: Login error:', error);
      setTestResult(`❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingLogin(false);
    }
  };

  const runLogoutTest = () => {
    console.log('🧪 DEBUG: Running logout test...');
    logout();
    setTestResult('✅ Logout successful!');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Debug Login Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Auth State */}
        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-medium mb-2">Current Auth State</h4>
          <div className="text-sm space-y-1">
            <div>User: {user?.characterName || 'null'}</div>
            <div>Authenticated: {isAuthenticated.toString()}</div>
            <div>Is Admin: {user?.isAdmin?.toString() || 'false'}</div>
            <div>Auth Trigger: {authTrigger}</div>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="space-y-2">
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
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={runLoginTest} 
            disabled={isTestingLogin}
            className="w-full"
          >
            {isTestingLogin ? 'Testing Login...' : 'Test Login'}
          </Button>
          
          {user && (
            <Button 
              onClick={runLogoutTest}
              variant="outline"
              className="w-full"
            >
              Test Logout
            </Button>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm">{testResult}</div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground">
          <p>This component tests the login flow in isolation.</p>
          <p>Check browser console for detailed logs.</p>
        </div>
      </CardContent>
    </Card>
  );
}