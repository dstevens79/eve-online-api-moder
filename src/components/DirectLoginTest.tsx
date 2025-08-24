import React, { useState } from 'react';
import { useCorporationAuth } from '@/lib/corp-auth';
import { Button } from '@/components/ui/button';

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
      
      setTimeout(() => {
        addResult('✅ Direct login completed');
        setForceUpdate(prev => prev + 1);
      }, 100);
    } catch (error) {
      addResult(`❌ Direct login failed: ${error}`);
    }
  };

  const handleLogout = () => {
    addResult('✅ Logout triggered');
    logout();
    setForceUpdate(prev => prev + 1);
  };

  const handleClearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="font-semibold mb-4">Direct Login Test</h3>
      
      <div className="space-y-2 mb-4">
        <Button onClick={handleDirectLogin} className="w-full">
          Test Direct Login
        </Button>
        <Button onClick={handleLogout} variant="destructive" className="w-full">
          Test Logout
        </Button>
        <Button onClick={handleClearResults} variant="outline" className="w-full">
          Clear Results
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm">
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