import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { authService } from '@/lib/auth';
import { useKV } from '@github/spark/hooks';

export function ComprehensiveAuthTest() {
  const auth = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('12345');
  const [isRunning, setIsRunning] = useState(false);
  
  // Direct KV access for testing
  const [kvUser, setKvUser] = useKV<any>('auth-user', null);
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-19), logEntry]);
    console.log('🔬 COMPREHENSIVE TEST:', logEntry);
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setLogs([]);
    
    try {
      addLog('🚀 Starting comprehensive authentication test...');
      
      // Test 1: Direct auth service call
      addLog('📋 Test 1: Direct AuthService login');
      try {
        const directResult = await authService.loginWithCredentials({ username, password });
        addLog(`✅ AuthService returned: ${directResult.characterName}`);
      } catch (error) {
        addLog(`❌ AuthService failed: ${error}`);
        return;
      }
      
      // Test 2: useAuth hook login
      addLog('📋 Test 2: useAuth hook login');
      try {
        await auth.login({ username, password });
        addLog('✅ useAuth login completed');
      } catch (error) {
        addLog(`❌ useAuth login failed: ${error}`);
        return;
      }
      
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Test 3: Check all state sources
      addLog('📋 Test 3: Checking all state sources');
      addLog(`🔍 auth.user: ${auth.user?.characterName || 'null'}`);
      addLog(`🔍 auth.isAuthenticated: ${auth.isAuthenticated}`);
      addLog(`🔍 auth.authTrigger: ${auth.authTrigger}`);
      addLog(`🔍 kvUser: ${kvUser?.characterName || 'null'}`);
      
      // Test 4: KV Storage verification
      addLog('📋 Test 4: Direct KV verification');
      try {
        const directKVRead = await (window as any).spark.kv.get('corp-auth-user');
        addLog(`🔍 Direct KV read: ${JSON.stringify(directKVRead) || 'null'}`);
      } catch (error) {
        addLog(`❌ Direct KV read failed: ${error}`);
      }
      
      // Test 5: State consistency check
      addLog('📋 Test 5: State consistency check');
      const hasUser = !!auth.user;
      const isAuth = auth.isAuthenticated;
      const hasKVUser = !!kvUser;
      
      if (hasUser && isAuth && hasKVUser) {
        addLog('✅ All state sources are consistent - user is logged in');
      } else {
        addLog(`❌ State inconsistency detected:`);
        addLog(`   - hasUser: ${hasUser}`);
        addLog(`   - isAuthenticated: ${isAuth}`);
        addLog(`   - hasKVUser: ${hasKVUser}`);
      }
      
      // Test 6: Navigation simulation
      if (auth.user) {
        addLog('📋 Test 6: Navigation readiness check');
        addLog('✅ User authenticated - navigation should work');
        addLog(`✅ Permissions: Admin=${auth.user.isAdmin}, CEO=${auth.user.isCeo}, Director=${auth.user.isDirector}`);
      } else {
        addLog('❌ Test 6: No user object - navigation will be blocked');
      }
      
    } catch (error) {
      addLog(`💥 Test failed with error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearAuth = () => {
    addLog('🧹 Clearing all authentication state...');
    auth.logout();
    setKvUser(null);
    addLog('✅ Authentication cleared');
  };

  useEffect(() => {
    addLog(`🔄 Auth state changed - User: ${auth.user?.characterName || 'null'}, Trigger: ${auth.authTrigger}`);
  }, [auth.user, auth.authTrigger]);

  return (
    <Card className="border-indigo-500">
      <CardHeader>
        <CardTitle className="text-indigo-400 flex items-center justify-between">
          🔬 Comprehensive Auth Test
          <div className="flex gap-2">
            <Badge variant="outline" className={auth.user ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}>
              {auth.user ? 'LOGGED IN' : 'LOGGED OUT'}
            </Badge>
            <Badge variant="outline" className={kvUser ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}>
              KV: {kvUser ? 'YES' : 'NO'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            disabled={isRunning}
            className="text-sm"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={isRunning}
            className="text-sm"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={runComprehensiveTest}
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-700"
            size="sm"
          >
            {isRunning ? 'Running Tests...' : 'Run Full Test'}
          </Button>
          <Button 
            onClick={clearAuth}
            disabled={isRunning}
            variant="destructive"
            size="sm"
          >
            Clear Auth
          </Button>
        </div>

        {/* Current State Summary */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-medium text-indigo-400 mb-1">Hook State:</div>
            <div>User: {auth.user ? '✅' : '❌'}</div>
            <div>Auth: {auth.isAuthenticated ? '✅' : '❌'}</div>
            <div>Trigger: {auth.authTrigger}</div>
          </div>
          <div>
            <div className="font-medium text-indigo-400 mb-1">KV State:</div>
            <div>KV User: {kvUser ? '✅' : '❌'}</div>
            <div>Name: {kvUser?.characterName || 'null'}</div>
            <div>Admin: {kvUser?.isAdmin ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Test Log */}
        <div className="space-y-2">
          <div className="font-medium text-indigo-400 flex items-center justify-between">
            Test Log
            <Button onClick={() => setLogs([])} size="sm" variant="ghost" className="h-6 px-2 text-xs">
              Clear
            </Button>
          </div>
          <div className="bg-black/20 rounded p-2 max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-xs text-muted-foreground">No tests run yet</div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-gray-300">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}