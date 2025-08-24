import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCorporationAuth } from '@/lib/corp-auth';

export function DirectLoginTest() {
  const { user, loginWithCredentials, logout } = useCorporationAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testDirectLogin = async () => {
    addResult('✅ Direct login test component loaded');
    try {
      addResult('🧪 Starting direct login test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      
      await loginWithCredentials('admin', '12345');
      addResult('✅ Direct login successful');
    } catch (error) {
      addResult(`❌ Direct login failed: ${error}`);
    }
  };

  const testLogout = () => {
    addResult('🧪 Testing logout...');
    logout();
    addResult('✅ Logout completed');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={testDirectLogin}>
          Test Login
        </Button>
        <Button onClick={testLogout} variant="outline">
          Test Logout
        </Button>
      </div>
      
      <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        {testResults.length > 0 ? (
          testResults.map((result, index) => (
            <p key={index} className="text-sm font-mono text-muted-foreground">
              {result}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No test results yet...</p>
        )}
      </div>
    </div>
  );
}