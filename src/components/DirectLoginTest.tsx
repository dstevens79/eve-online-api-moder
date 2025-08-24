import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCorporationAuth } from '@/lib/corp-auth';

export function DirectLoginTest() {
  const { loginWithCredentials, logout, user, authTrigger } = useCorporationAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDirectLogin = async () => {
    try {
      addResult('🧪 Starting direct login test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      addResult(`Auth trigger: ${authTrigger}`);
      
      await loginWithCredentials('admin', '12345');

      addResult('✅ Direct login completed');
      
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
      }, 100);
    } catch (error) {
      console.error('🧪 Direct login test failed:', error);
      addResult(`❌ Direct login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDirectStateTest = async () => {
    try {
      addResult('🧪 Starting direct state test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      addResult(`Auth trigger: ${authTrigger}`);
      addResult(`Force update: ${forceUpdate}`);
      
      // Force a state update
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
      }, 100);
      
    } catch (error) {
      console.error('🧪 Direct state test failed:', error);
      addResult(`❌ Direct state test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLogout = () => {
    logout();
    addResult('✅ Logout completed');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Direct Login Test (Update: {forceUpdate})</h3>
      
      <div className="space-y-2 mb-4">
        <Button onClick={handleDirectLogin} className="mr-2">
          Test Direct Login
        </Button>
        <Button onClick={handleDirectStateTest} variant="outline" className="mr-2">
          Test State Update
        </Button>
        <Button onClick={handleLogout} variant="destructive" className="mr-2">
          Test Logout
        </Button>
        <Button onClick={clearResults} variant="ghost">
          Clear Results
        </Button>
      </div>

      <div className="space-y-1">
        <h4 className="font-medium">Test Results:</h4>
        <div className="bg-muted p-3 rounded text-sm font-mono max-h-40 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-muted-foreground">No test results yet...</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-xs">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted rounded text-sm">
        <h4 className="font-medium mb-2">Current State:</h4>
        <div className="space-y-1 text-xs font-mono">
          <div>User: {user?.characterName || 'null'}</div>
          <div>Corporation: {user?.corporationName || 'null'}</div>
          <div>Is Admin: {user?.isAdmin ? 'true' : 'false'}</div>
          <div>Auth Trigger: {authTrigger}</div>
          <div>Force Update: {forceUpdate}</div>
        </div>
      </div>
    </div>
  );
}