import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCorporationAuth } from '@/lib/corp-auth';

export const DirectLoginTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { directLogin, logout } = useCorporationAuth();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDirectLogin = async () => {
    try {
      addResult('🧪 Starting direct login test...');
      
      const testUser = {
        characterId: 99999999,
        characterName: 'admin',
        corporationId: 12345678,
        corporationName: 'Test Corporation',
        isAdmin: true,
        isCeo: false,
        isDirector: false,
        authMethod: 'local' as const,
        canManageESI: true,
      };
      
      directLogin(testUser);
      addResult('✅ Direct login completed');
      
      // Force a re-render to see the effect
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
        addResult('🔄 Force update triggered');
      }, 100);
      
    } catch (error) {
      console.error('🧪 Direct test failed:', error);
      addResult(`❌ Direct login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDirectStateTest = async () => {
    try {
      addResult('🧪 Starting direct state test...');
      
      // Force a state update
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
        addResult('🔄 Force update triggered');
      }, 500);
      
    } catch (error) {
      console.error('🧪 Direct state test failed:', error);
      addResult(`❌ Direct state test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLogout = () => {
    addResult('🚪 Logging out user');
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
          Test Login
        </Button>
        <Button onClick={handleDirectStateTest} variant="secondary" className="mr-2">
          Test State
        </Button>
        <Button onClick={handleLogout} variant="outline" className="mr-2">
          Test Logout
        </Button>
        <Button onClick={clearResults} variant="destructive" size="sm">
          Clear Results
        </Button>
      </div>

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {testResults.map((result, index) => (
          <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
            {result}
          </div>
        ))}
      </div>
    </div>
  );
};