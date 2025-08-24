import React, { useState } from 'react';
import { useCorporationAuth } from '@/lib/corp-a
export function DirectLoginTest() {


    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString

    try {

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDirectLogin = async () => {
    try {
      addResult('🧪 Starting direct login test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      
      await loginWithCredentials('admin', '12345');
      addResult('✅ Direct login successful');
      
    } catch (error) {
      addResult(`❌ Direct login failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDirectLogout = async () => {
    try {
      addResult('🧪 Starting direct logout test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      
      logout();
        <Button onClick={handleDirectLogin} va
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      addResult(`❌ Direct logout failed: ${error instanceof Error ? error.message : String(error)}`);
     
  };

  const handleClearResults = () => {






















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