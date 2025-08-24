import React, { useState } from 'react';
import { useCorporationAuth } from '@/lib/corp-auth';
import { Button } from '@/components/ui/button';

export function DirectLoginTest() {
  const { user, loginWithCredentials, logout } = useCorporationAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDirectLogin = async () => {
    try {
      addResult('🧪 Starting direct login test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      
      await loginWithCredentials('admin', '12345');
      addResult('✅ Direct login test completed');
    } catch (error) {
      addResult('❌ Direct login test failed: ' + (error as Error).message);
    }
  };

  const handleDirectLogout = () => {
    addResult('🧪 Starting direct logout test...');
    logout();
    addResult('✅ Direct logout test completed');
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Direct Login Test</h3>
      
      <div className="flex gap-2">
        <Button onClick={handleDirectLogin} variant="outline" size="sm">
          Test Login
        </Button>
        <Button onClick={handleDirectLogout} variant="outline" size="sm">
          Test Logout
        </Button>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Test Results:</p>
        <div className="bg-background border border-border rounded p-3 max-h-48 overflow-y-auto">
          {testResults.length > 0 ? (
            testResults.map((result, index) => (
              <p key={index} className="text-xs font-mono text-muted-foreground">
                {result}
              </p>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">No test results yet</p>
          )}
        </div>
      </div>
    </div>
  );
}