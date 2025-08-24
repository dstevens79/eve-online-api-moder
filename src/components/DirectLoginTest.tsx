import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Button } from '@/components/ui/button';

  const [testResults, setTestResults] = useState
  const { loginWithCredentials, logout, user, authTrigger } = useCorporationAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDirectLogin = async () => {
      add
      addResult('🧪 Starting direct login test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      addResult(`Auth trigger: ${authTrigger}`);
      
      await loginWithCredentials('admin', '12345');

      addResult('✅ Direct login completed');
      
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
      }, 100);
      }, 100);
      addResult(`❌ Direct login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
     
  };

  const handleDirectStateTest = async () => {
    addRe
      addResult('🧪 Starting direct state test...');
  };
      // Force a state update
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
  return (
      }, 100);
      
    } catch (error) {
      console.error('🧪 Direct state test failed:', error);
      addResult(`❌ Direct state test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
     
  };

  const handleLogout = () => {
        </Button>
    logout();
    addResult('✅ Logout completed');
  };

  const clearResults = () => {
          <div key={ind
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Direct Login Test (Update: {forceUpdate})</h3>
      
      <div className="space-y-2 mb-4">
        <Button onClick={handleDirectLogin} className="mr-2">
          Test Direct Login
























