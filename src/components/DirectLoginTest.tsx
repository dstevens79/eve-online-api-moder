import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Button } from '@/components/ui/button';

  const [testResults, setTestResult
  const { loginWithCredentials, user, isAuthenticated, authTrigger } = useCorporationAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const addResult = (message: string) => {
      addResult('🧪 Starting direct auth service test');
  };

  const handleDirectLogin = async () => {
      set
      addResult('🧪 Starting direct auth service test');
      
      await loginWithCredentials('admin', '12345');
      addResult('✅ Login with credentials completed');
      
      addResult('🧪 Starting direct state test
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error('🧪 Direct test failed:', error);
      addResult(`❌ Direct login failed: ${error}`);
    }
    

  const handleDirectStateTest = async () => {
    try {
        tokenExpiry: Date.now() + (24 * 60 * 60 *
    
      // Create a test user object directly
      const testUser = {

        characterName: 'Direct Test User',
        addResult(`After 100m
        corporationName: 'Test Corporation',
        isAdmin: true,
        isCeo: false,

        authMethod: 'test' as const,
      console.error('🧪 Dir
        accessToken: 'direct-test-token',
        refreshToken: 'direct-test-refresh',
        tokenExpiry: Date.now() + (24 * 60 * 60 * 1000),
    <div
    
      // Use the spark KV API directly
      await spark.kv.set('corp-auth-user', testUser);
      addResult('✅ Direct KV set completed');

      // Check if the useKV hook picks up the change
      setTimeout(() => {
        addResult(`After 100ms: user=${user?.characterName || 'null'}, auth=${isAuthenticated}`);
      }, 100);

      setTimeout(() => {
        addResult(`After 500ms: user=${user?.characterName || 'null'}, auth=${isAuthenticated}`);
      }, 500);

      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error('🧪 Direct state test failed:', error);
      addResult(`❌ Direct state test failed: ${error}`);
    }
    

        
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Direct Login Test (Update: {forceUpdate})</h3>
      





































