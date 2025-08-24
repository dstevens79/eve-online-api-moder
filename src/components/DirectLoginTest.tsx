import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCorporationAuth } from '@/lib/corp-auth';

export function DirectLoginTest() {
  const { user, loginWithCredentials, logout } = useCorporationAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDirectLogin = async () => {
    try {
      addResult('🧪 Starting direct login test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      
      await loginWithCredentials('admin', '12345');
      addResult('✅ Direct login successful');
      
    } catch (error) {
      addResult(`❌ Direct login failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDirectLogout = async () => {
    try {
      addResult('🧪 Starting direct logout test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      
      logout();
      addResult('✅ Direct logout successful');
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      addResult(`❌ Direct logout failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleClearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Direct Login Test</h3>
      
      <div className="flex gap-2">
        <Button onClick={handleDirectLogin} variant="outline" size="sm">
          Test Login (admin/12345)
        </Button>
        <Button onClick={handleDirectLogout} variant="outline" size="sm">
          Test Logout
        </Button>
        <Button onClick={handleClearResults} variant="outline" size="sm">
          Clear Results
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">Current User: {user?.characterName || 'none'}</p>
          <p className="text-muted-foreground">Corporation: {user?.corporationName || 'none'}</p>
          <p className="text-muted-foreground">Is Admin: {user?.isAdmin ? 'true' : 'false'}</p>
          <p className="text-muted-foreground">Force Update: {forceUpdate}</p>
        </div>
        
        <div className="max-h-40 overflow-y-auto bg-muted/20 p-2 rounded text-xs font-mono">
          {testResults.length === 0 ? (
            <p className="text-muted-foreground italic">No test results yet</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}