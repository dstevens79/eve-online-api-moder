import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';

export function AdminLoginTest() {
  const { user, isAuthenticated, login, logout, authTrigger, isLoading } = useAuth();
  const [testCredentials, setTestCredentials] = useState({ username: 'admin', password: '12345' });
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const log = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testDirectLogin = async () => {
    setIsRunningTest(true);
    clearResults();
    
    try {
      log('🧪 Starting direct login test with admin/12345');
      log(`🔍 Before login: user=${user?.characterName || 'null'}, authenticated=${isAuthenticated}`);
      
      await login(testCredentials);
      
      log(`🔍 After login: user=${user?.characterName || 'null'}, authenticated=${isAuthenticated}`);
      log('✅ Login completed successfully');
      
      // Wait and check again to see if state propagated
      setTimeout(() => {
        log(`🔍 1 second later: user=${user?.characterName || 'null'}, authenticated=${isAuthenticated}, trigger=${authTrigger}`);
      }, 1000);
      
    } catch (error) {
      log(`❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const testLogout = () => {
    log('🧪 Testing logout');
    logout();
    log('✅ Logout completed');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current State */}
          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                <div><strong>User:</strong> {user?.characterName || 'None'}</div>
                <div><strong>Authenticated:</strong> {isAuthenticated.toString()}</div>
                <div><strong>Is Admin:</strong> {user?.isAdmin?.toString() || 'false'}</div>
                <div><strong>Auth Trigger:</strong> {authTrigger}</div>
                <div><strong>Loading:</strong> {isLoading.toString()}</div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Test Credentials */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Username"
              value={testCredentials.username}
              onChange={(e) => setTestCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Password"
              value={testCredentials.password}
              onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          {/* Test Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={testDirectLogin} 
              disabled={isRunningTest || isLoading}
              className="flex-1"
            >
              {isRunningTest ? 'Testing...' : 'Test Login'}
            </Button>
            
            {user && (
              <Button 
                onClick={testLogout}
                variant="outline"
                className="flex-1"
              >
                Test Logout
              </Button>
            )}
            
            <Button 
              onClick={clearResults}
              variant="ghost"
              size="sm"
            >
              Clear
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-muted p-3 rounded-lg max-h-40 overflow-y-auto">
              <div className="text-sm font-mono space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-xs">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expected Behavior */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Expected Behavior:</strong></p>
            <p>1. Click "Test Login" should authenticate with admin/12345</p>
            <p>2. User state should update to "Local Administrator"</p>
            <p>3. App should redirect to main dashboard</p>
            <p>4. All navigation tabs should become accessible</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}