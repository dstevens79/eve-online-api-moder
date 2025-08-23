// Simple manual test to validate auth flow
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth';

export function SimpleLoginTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runManualTest = async () => {
    setIsRunning(true);
    setTestResult('');
    
    try {
      console.log('🧪 MANUAL TEST: Starting auth service test');
      
      // Test the auth service directly
      const user = await authService.loginWithCredentials(
        { username: 'admin', password: '12345' }
      );
      
      console.log('🧪 MANUAL TEST: Auth service returned:', user);
      
      if (user && user.characterName === 'Local Administrator') {
        setTestResult('✅ Auth service working correctly - returned Local Administrator');
      } else {
        setTestResult('❌ Auth service returned unexpected result');
      }
      
    } catch (error) {
      console.error('🧪 MANUAL TEST: Error:', error);
      setTestResult(`❌ Auth service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Manual Auth Service Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runManualTest} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Testing...' : 'Test Auth Service Directly'}
        </Button>
        
        {testResult && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm">{testResult}</div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>This tests the auth service directly without the useAuth hook.</p>
          <p>Check browser console for detailed logs.</p>
        </div>
      </CardContent>
    </Card>
  );
}