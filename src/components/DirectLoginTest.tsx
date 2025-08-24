import React, { useState } from 'react';
import { useCorporationAuth } from '@/lib/corp-a
export function DirectLoginTest() {


    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${messag

    try {

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDirectLogin = async () => {
    try {
      addResult('🧪 Starting direct login test...');
      addResult(`Current user: ${user?.characterName || 'none'}`);
      addResult('🧪 Starting direct state test..
      
      

      }, 100);
    } 
      addResult(`❌ Direc
  };
  const handle
    addResult('✅ Logo

    setTestResults([]);

  };

        <Button onClick={handleDirectLogin} c
        <
          Test State Update
        <Button onClick={handleLogout} variant="destructive" class
        </Button>
          Clear Results
      
      <div className="space-y
        <div className="
            <p className="text-muted-fore
            te
      
            ))
        </div>

     
    

          <div>Force Update: {
      </div>
  );




















































