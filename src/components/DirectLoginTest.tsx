import React, { useState } from 'react';
import { useCorporationAuth } from '@/lib/corp-a
export function DirectLoginTest() {


    const timestamp = new Date().toLocaleTimeString();
    console.log(resultMessage);
  };

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const resultMessage = `${timestamp}: ${message}`;
    console.log(resultMessage);
    setTestResults(prev => [...prev, resultMessage]);
    

  const handleDirectLogin = async () => {
    try {
      setTimeout(() => {
      }, 1000);
      
      console.error('🧪 Direct test failed:', error
    }

    tr
      
      const testUser = {
        characterName: 'Direct Test User',
        corpora
      
        canManageESI: true,
        accessToken: 
        tokenExpiry: Date.now() + (24 * 60 * 60 * 100
      
    }
  };

      }, 100);
      set
      }, 500);
      
      console.error('🧪 Direct state test f
    }

    addResult('🚪 Logging out user');
    addResult('✅ Logout completed
  };
  const clearResults =
  };
  return (
      <h3 className="text-l
      <div className="space-y-2 mb-4
          Test Login
        <Button onClick={handleDirectStateTe
        </Button>
        
      
        </Button>
      
        {testResults.length === 0 ? (

            <div key={index} className="text-foregro
            </div>
        )}
    </div>












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
