import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useKV } from '@github/spark/hooks';

interface LogEntry {
  timestamp: number;
  level: 'info' | 'success' | 'error' | 'debug';
  message: string;
}

export function AuthFlowTest() {
  const { user, login, logout, authTrigger, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('12345');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testState, setTestState] = useKV<any>('auth-test-state', null);

  const addLog = (level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message
    };
    setLogs(prev => [...prev.slice(-9), entry]); // Keep last 10 entries
    console.log(`🧪 AUTH TEST [${level.toUpperCase()}]:`, message);
  };

  useEffect(() => {
    addLog('debug', `Component mounted - User: ${user?.characterName || 'null'}`);
  }, []);

  useEffect(() => {
    addLog('debug', `User state changed - Has user: ${!!user}, Auth: ${isAuthenticated}, Trigger: ${authTrigger}`);
    if (user) {
      setTestState({
        loginSuccessful: true,
        userName: user.characterName,
        timestamp: Date.now()
      });
    } else {
      setTestState(null);
    }
  }, [user, isAuthenticated, authTrigger, setTestState]);

  const handleDirectLogin = async () => {
    setIsSubmitting(true);
    addLog('info', 'Starting direct login test...');
    
    try {
      addLog('debug', `Attempting login with username: "${username}" password: "${password}"`);
      
      await login({ username, password }, () => {
        addLog('success', 'Login success callback executed');
      });
      
      addLog('success', 'Login completed successfully');
      
      // Give React time to update state
      setTimeout(() => {
        addLog('debug', `Post-login state check - User: ${user?.characterName || 'still null'}`);
      }, 100);
      
    } catch (error) {
      addLog('error', `Login failed: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    addLog('info', 'Logging out...');
    logout();
    setTestState(null);
    addLog('success', 'Logout completed');
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs cleared');
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'debug': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Test Controls */}
      <Card className="border-purple-500">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center justify-between">
            🧪 Authentication Flow Test
            <Badge variant="outline" className={user ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}>
              {user ? 'LOGGED IN' : 'LOGGED OUT'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  disabled={isSubmitting}
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                onClick={handleDirectLogin}
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? 'Testing Login...' : 'Test Login Flow'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                <div className="text-sm">
                  <div><strong>User:</strong> {user.characterName}</div>
                  <div><strong>Corp:</strong> {user.corporationName}</div>
                  <div><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</div>
                  <div><strong>Auth Trigger:</strong> {authTrigger}</div>
                </div>
              </div>
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                Test Logout
              </Button>
            </div>
          )}
          
          {/* State Display */}
          <div className="space-y-2 text-xs font-mono">
            <div><strong>Auth State:</strong> {isAuthenticated ? '✅' : '❌'}</div>
            <div><strong>User Object:</strong> {user ? '✅' : '❌'}</div>
            <div><strong>Test State:</strong> {testState ? '✅' : '❌'}</div>
            <div><strong>Auth Trigger:</strong> {authTrigger}</div>
          </div>
        </CardContent>
      </Card>

      {/* Event Log */}
      <Card className="border-amber-500">
        <CardHeader>
          <CardTitle className="text-amber-400 flex items-center justify-between">
            📋 Event Log
            <Button onClick={clearLogs} size="sm" variant="outline">
              Clear
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">
                No events logged yet
              </div>
            ) : (
              logs.slice().reverse().map((log, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded text-xs border ${getLevelColor(log.level)}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium">
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-xs opacity-70">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1 font-mono">{log.message}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}