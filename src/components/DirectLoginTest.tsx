import React, { useState } from 'react';
import { useCorporationAuth } from '@/lib/corp-auth';
import { Button } from '@/components/ui/button';

export function DirectLoginTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { directLogin, logout } = useCorporationAuth();

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const resultMessage = `${timestamp}: ${message}`;
    console.log(resultMessage);
    setTestResults(prev => [...prev, resultMessage]);
  };

  const handleDirectLogin = async () => {
    try {
      addResult('🧪 Starting direct login test...');
      
      const testUser = {
        characterId: 'test-123',
        characterName: 'Direct Test User',
        corporationId: 'corp-456',
        corporationName: 'Test Corporation',
        isAdmin: false,
        isCeo: false,
        isDirector: false,
        authMethod: 'direct' as const,
        canManageESI: true,
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        tokenExpiry: Date.now() + (24 * 60 * 60 * 1000)
      };

      addResult('🚪 Attempting direct login...');
      await directLogin(testUser);
      addResult('✅ Direct login completed');
      
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
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
          Test Direct State
        </Button>
        <Button onClick={handleLogout} variant="outline" className="mr-2">
          Test Logout
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