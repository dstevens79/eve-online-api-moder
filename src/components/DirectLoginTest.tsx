import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Button } from '@/components/ui/button';

  const [forceUpdate, setForceUpdat
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { directLogin, logout } = useCorporationAuth();

      addResult('🧪 Starting direct login 
      const testUser = {
        characterName: 'Direct Test User',
        corporationName: 'Test 
        isCeo: false,
    

        tokenExpiry: Date.now() + (24 * 6

      await directLogin(testUser);
      
        setForceUpdate(p
      
      console.error('🧪 Direct test failed
    }

    try {
      
      setTimeout(() => {
        addResult('🔄 Force update tri
      
      console.error('🧪 Direct sta
    }

    addR


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

        <Button onClick={handleDirectStateTest} variant="secondary" className="mr-2">
          Test Direct State
        </Button>
        <Button onClick={handleLogout} variant="outline" className="mr-2">
          Test Logout
        </Button>


















