import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCorporationAuth } from '@/lib/corp-auth';

export function DirectLoginTest() {
  const { loginWithCredentials, user, isAuthenticated, authTrigger } = useCorporationAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleDirectLogin = async () => {
    try {
      console.log('🧪 Direct test starting...');
      addResult('🧪 Starting direct login test');
      
      await loginWithCredentials('admin', '12345');
      addResult('✅ Login with credentials completed');
      
      console.log('🧪 Direct test completed');
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error('🧪 Direct test failed:', error);
      addResult(`❌ Direct login failed: ${error}`);
    }
  };

  const handleDirectStateTest = async () => {
    try {
      addResult('🧪 Starting direct state test');
      
      // Create a test user object directly
      const testUser = {
        characterId: 12345,
        characterName: 'Direct Test Admin',
        corporationId: 67890,
        corporationName: 'Direct Test Corp',
        isAdmin: true,
        isCeo: false,
        isDirector: false,
        authMethod: 'local' as const,
        canManageESI: true,
        accessToken: 'direct-test-token',
        refreshToken: 'direct-test-refresh',
        tokenExpiry: Date.now() + (24 * 60 * 60 * 1000),
      };
    
      // Use the spark KV API directly
      await spark.kv.set('corp-auth-user', testUser);
      addResult('✅ Direct KV set completed');

      // Check if the useKV hook picks up the change
      setTimeout(() => {
        addResult(`After 100ms: user=${user?.characterName || 'null'}, auth=${isAuthenticated}`);
      }, 100);

      setTimeout(() => {
        addResult(`After 500ms: user=${user?.characterName || 'null'}, auth=${isAuthenticated}`);
      }, 500);

    } catch (error) {
      addResult(`❌ Direct state test failed: ${error}`);
    }
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Direct Login Test (Update: {forceUpdate})</h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>User: {user?.characterName || 'null'}</div>
          <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
          <div>Auth Trigger: {authTrigger}</div>
          <div>User Object: {user ? 'exists' : 'null'}</div>
        </div>

        <div className="space-y-2">
          <Button onClick={handleDirectLogin} className="w-full">
            Test Auth Service Login (admin/12345)
          </Button>
          
          <Button onClick={handleDirectStateTest} variant="outline" className="w-full">
            Test Direct State Manipulation
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg max-h-40 overflow-y-auto">
            <h4 className="text-sm font-semibold mb-2">Test Results:</h4>
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-xs font-mono text-muted-foreground">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          This tests both the auth service and direct state manipulation
        </div>
      </div>
    </div>
  );
}