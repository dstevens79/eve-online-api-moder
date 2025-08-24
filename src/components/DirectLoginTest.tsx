import React from 'react';
import { Button } from '@/components/ui/button';
import { useCorporationAuth } from '@/lib/corp-auth';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useCorporationAuth } from '@/lib/corp-auth';
import { AuthenticatedUser } from '@/lib/corp-auth';

export function DirectLoginTest() {
  const { loginWithCredentials, user, isAuthenticated, authTrigger } = useCorporationAuth();
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = React.useState(0);
  
  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Listen for auth state changes
  React.useEffect(() => {
    addResult(`🔄 Effect triggered - user: ${user?.characterName || 'null'}, auth: ${isAuthenticated}, trigger: ${authTrigger}`);
  }, [user, isAuthenticated, authTrigger]);

  const handleDirectLogin = async () => {
    try {
      setTestResults([]);
      addResult('🧪 Direct test starting...');
      addResult(`Before: user=${user?.characterName || 'null'}, auth=${isAuthenticated}`);
      
      await loginWithCredentials('admin', '12345');
      
      addResult('🧪 Direct test completed - login call finished');
      
      // Force a re-render to check if state updated
      setForceUpdate(prev => prev + 1);
      
      // Check state immediately after
      setTimeout(() => {
        addResult(`After 100ms: user=${user?.characterName || 'null'}, auth=${isAuthenticated}`);
        setForceUpdate(prev => prev + 1);
      }, 100);
      
      setTimeout(() => {
        addResult(`After 500ms: user=${user?.characterName || 'null'}, auth=${isAuthenticated}`);
        setForceUpdate(prev => prev + 1);
      }, 500);
      
    } catch (error) {
      addResult(`🧪 Direct test failed: ${error}`);
    }
  };

  // Test direct state manipulation to see if useKV works at all
  const handleDirectStateTest = async () => {
    try {
      setTestResults([]);
      addResult('🧪 Direct state test starting...');
      
      // Direct test: manually set user data to KV store
      const testUser: AuthenticatedUser = {
        characterId: 999999999,
        characterName: 'Test User Direct',
        corporationId: 1000000000,
        corporationName: 'Test Corporation',
        allianceId: undefined,
        allianceName: undefined,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        tokenExpiry: Date.now() + (24 * 60 * 60 * 1000),
        scopes: [],
        isDirector: true,
        isCeo: true,
        isAdmin: true,
        canManageESI: true,
        loginTime: Date.now(),
        authMethod: 'local'
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