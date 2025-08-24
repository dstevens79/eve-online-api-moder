import React, { useState } from 'react';
import { useCorporationAuth } from '@/lib/corp-auth';



    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString

    try {

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDirectLogin = async () => {
    try {
      addResult('🧪 Starting direct login test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      
    setTestResults([]);

    <div className="p-4 
      
        <Button onClick={handleDirectLogi
        </Butt
          Test Logout
        <Button onClick={handleClearResults} varian
     
    

          <p className="text-m
          <p className="text-muted-f
        
          {testResults.length === 0 ?
    

          )}
    setTestResults([]);
  );










          Test Logout




      </div>
      
      <div className="space-y-2">
        <div className="text-sm">
          <p className="text-muted-foreground">Current User: {user?.characterName || 'none'}</p>
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