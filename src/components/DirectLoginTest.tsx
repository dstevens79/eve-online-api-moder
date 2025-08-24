import React, { useState } from 'react';
import { useCorporationAuth } from '@/lib/corp-a
export const DirectLoginTest: React.FC = () => {

export const DirectLoginTest: React.FC = () => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTim

    try {

        characterId: 99999999,
        corporationId: 12345678,
    

        canManageESI: true,
      
      addResult('✅ Direct login completed');
      
        setForceUpdate(p
      }, 100);
    } catch (error) {
      addResult(`❌ Direct login 
  };
  const handleDirectSt
      addResult('🧪 S
      // Force a state upd
        setForceUpdate(prev => prev +
        canManageESI: true,
      };
      
  };
  const handleLogout = () => {
    lo
  };
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
        addResult('🔄 Force update triggered');
      }, 100);
      
    } catch (error) {
      console.error('🧪 Direct test failed:', error);
      addResult(`❌ Direct login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
     
  };

  const handleDirectStateTest = async () => {
    try {
      addResult('🧪 Starting direct state test...');
      
      // Force a state update
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
        </Button>
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


        <Button onClick={handleDirectStateTest} variant="secondary" className="mr-2">

        </Button>

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

        ))}
      </div>
    </div>

};