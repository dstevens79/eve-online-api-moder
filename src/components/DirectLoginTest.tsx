import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCorporationAuth } from '@/lib/corp-auth';

export function DirectLoginTest() {
  const { loginWithCredentials, user, isAuthenticated, authTrigger, logout } = useCorporationAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const resultMessage = `${timestamp}: ${message}`;
    console.log(resultMessage);
    setTestResults(prev => [...prev, resultMessage]);
  };

  const handleDirectLogin = async () => {
    try {
      addResult('🧪 Starting direct login test with admin/12345');
      addResult(`🔍 Before login: user=${user?.characterName || 'null'}, authenticated=${isAuthenticated}`);
      
      await loginWithCredentials('admin', '12345');
      
      // Check state immediately after
      addResult(`🔍 Immediately after login: user=${user?.characterName || 'null'}, authenticated=${isAuthenticated}`);
      addResult('✅ Login completed successfully');
      
      // Check state after delays to see when useKV updates
      setTimeout(() => {
        addResult(`🔍 100ms later: user=${user?.characterName || 'null'}, authenticated=${isAuthenticated}, trigger=${authTrigger}`);
      }, 100);
      
      setTimeout(() => {
        addResult(`🔍 500ms later: user=${user?.characterName || 'null'}, authenticated=${isAuthenticated}, trigger=${authTrigger}`);
      }, 500);
      
      setTimeout(() => {
        addResult(`🔍 1 second later: user=${user?.characterName || 'null'}, authenticated=${isAuthenticated}, trigger=${authTrigger}`);
      }, 1000);
      
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
        characterId: 999999999,
        characterName: 'Direct Test User',
        corporationId: 123456789,
        corporationName: 'Test Corporation',
        isAdmin: true,
        isCeo: false,
        isDirector: false,
        canManageESI: true,
        authMethod: 'test' as const,
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

      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error('🧪 Direct state test failed:', error);
      addResult(`❌ Direct state test failed: ${error}`);
    }
  };

  const handleLogout = () => {
    addResult('🚪 Logging out user');
    logout();
    addResult('✅ Logout completed');
    setForceUpdate(prev => prev + 1);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Direct Login Test (Update: {forceUpdate})</h3>
      
      <div className="space-y-2 mb-4">
        <Button onClick={handleDirectLogin} className="mr-2">
          Test Login
        </Button>
        <Button onClick={handleDirectStateTest} variant="secondary" className="mr-2">
          Test Direct State
        </Button>
        <Button onClick={handleLogout} variant="destructive" className="mr-2">
          Logout
        </Button>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>
      
      <div className="space-y-1 font-mono text-xs max-h-60 overflow-y-auto bg-muted p-3 rounded">
        {testResults.length === 0 ? (
          <div className="text-muted-foreground">No test results yet...</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="text-foreground">
              {result}
            </div>
          ))
        )}
      </div>
    </div>
  );
}