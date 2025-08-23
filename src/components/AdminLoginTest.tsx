import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from '@phosphor-icons/react';

// Import the actual auth service to test
import { authService } from '@/lib/auth';

interface TestResult {
  testName: string;
  success: boolean;
  error?: string;
  user?: any;
}

export function AdminLoginTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: TestResult[] = [];

    // Test 1: Valid admin credentials
    try {
      const user = await authService.loginWithCredentials({ username: 'admin', password: '12345' });
      results.push({
        testName: 'Valid admin credentials (admin/12345)',
        success: true,
        user: user
      });
    } catch (error) {
      results.push({
        testName: 'Valid admin credentials (admin/12345)',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Valid admin credentials with whitespace
    try {
      const user = await authService.loginWithCredentials({ username: '  admin  ', password: '  12345  ' });
      results.push({
        testName: 'Valid admin credentials with whitespace',
        success: true,
        user: user
      });
    } catch (error) {
      results.push({
        testName: 'Valid admin credentials with whitespace',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Invalid credentials
    try {
      const user = await authService.loginWithCredentials({ username: 'admin', password: 'wrong' });
      results.push({
        testName: 'Invalid credentials (should fail)',
        success: false, // This should fail
        user: user
      });
    } catch (error) {
      results.push({
        testName: 'Invalid credentials (should fail)',
        success: true, // Success means it correctly rejected invalid creds
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Empty credentials
    try {
      const user = await authService.loginWithCredentials({ username: '', password: '' });
      results.push({
        testName: 'Empty credentials (should fail)',
        success: false, // This should fail
        user: user
      });
    } catch (error) {
      results.push({
        testName: 'Empty credentials (should fail)',
        success: true, // Success means it correctly rejected empty creds
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Custom admin config
    try {
      const customConfig = { username: 'customadmin', password: 'custompass' };
      const user = await authService.loginWithCredentials({ username: 'customadmin', password: 'custompass' }, customConfig);
      results.push({
        testName: 'Custom admin config',
        success: true,
        user: user
      });
    } catch (error) {
      results.push({
        testName: 'Custom admin config',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Admin Login Functionality Test
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {testResults.length === 0 && !isRunning && (
            <p className="text-muted-foreground">Click "Run Tests" to verify admin login functionality</p>
          )}
          
          {isRunning && (
            <p className="text-muted-foreground">Running authentication tests...</p>
          )}
          
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{result.testName}</h4>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? (
                      <><Check size={14} className="mr-1" /> PASS</>
                    ) : (
                      <><X size={14} className="mr-1" /> FAIL</>
                    )}
                  </Badge>
                </div>
                
                {result.error && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Error: {result.error}
                  </p>
                )}
                
                {result.user && (
                  <div className="text-sm text-muted-foreground">
                    <p>Character: {result.user.characterName}</p>
                    <p>Corporation: {result.user.corporationName}</p>
                    <p>Admin: {result.user.isAdmin ? 'Yes' : 'No'}</p>
                    <p>Director: {result.user.isDirector ? 'Yes' : 'No'}</p>
                    <p>CEO: {result.user.isCeo ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {testResults.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Test Summary</h4>
              <p className="text-sm">
                Passed: {testResults.filter(r => r.success).length} / {testResults.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}