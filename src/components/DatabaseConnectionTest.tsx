import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseManager, DatabaseConfig } from '@/lib/database';
import { toast } from 'sonner';
import { Play, ArrowClockwise } from '@phosphor-icons/react';

export function DatabaseConnectionTest() {
  const [config, setConfig] = useState<DatabaseConfig>({
    host: '',
    port: 3306,
    database: '',
    username: '',
    password: '',
    ssl: false,
    connectionPoolSize: 10,
    queryTimeout: 30,
    autoReconnect: true,
    charset: 'utf8mb4'
  });
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const testConnection = async () => {
    if (!config.host || !config.database || !config.username || !config.password) {
      toast.error('Please fill in all connection fields');
      return;
    }

    setTesting(true);
    setLogs([]);
    addLog('🔍 Starting database connection test...');
    
    try {
      const manager = new DatabaseManager(config);
      
      // Intercept console.log calls
      const originalConsoleLog = console.log;
      console.log = (...args: any[]) => {
        const message = args.join(' ');
        if (message.includes('🔍') || message.includes('🌐') || message.includes('🔌') || 
            message.includes('🔐') || message.includes('🗄️') || message.includes('🔑') || 
            message.includes('✅') || message.includes('❌')) {
          addLog(message);
        }
        originalConsoleLog(...args);
      };
      
      const result = await manager.testConnection();
      
      // Restore original console.log
      console.log = originalConsoleLog;
      
      if (result.success && result.validated) {
        toast.success(`✅ Connection validated! Latency: ${result.latency}ms`);
        addLog(`✅ Test completed successfully - Latency: ${result.latency}ms`);
      } else if (result.success && !result.validated) {
        toast.warning(`⚠️ Partial success - Latency: ${result.latency}ms`);
        addLog(`⚠️ Test partially successful - Latency: ${result.latency}ms`);
      } else {
        toast.error(`❌ Test failed: ${result.error}`);
        addLog(`❌ Test failed: ${result.error}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`❌ Test error: ${errorMsg}`);
      addLog(`❌ Test error: ${errorMsg}`);
    } finally {
      setTesting(false);
      addLog('🏁 Test completed');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => setConfig(prev => ({ ...prev, host: e.target.value }))}
              placeholder="localhost or IP address"
            />
          </div>
          <div>
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              value={config.port}
              onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 3306 }))}
              placeholder="3306"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="database">Database</Label>
            <Input
              id="database"
              value={config.database}
              onChange={(e) => setConfig(prev => ({ ...prev, database: e.target.value }))}
              placeholder="lmeve"
            />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={config.username}
              onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
              placeholder="lmeve_user"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={config.password}
            onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Enter password"
          />
        </div>
        
        <Button
          onClick={testConnection}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <ArrowClockwise size={16} className="mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Play size={16} className="mr-2" />
              Test Database Connection
            </>
          )}
        </Button>
        
        {logs.length > 0 && (
          <div className="space-y-2">
            <Label>Connection Logs</Label>
            <div className="bg-muted/30 border border-border rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs">
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`${
                      log.includes('❌') ? 'text-red-300' :
                      log.includes('⚠️') ? 'text-yellow-300' :
                      log.includes('✅') ? 'text-green-300' :
                      log.includes('🔍') || log.includes('🌐') || log.includes('🔌') || 
                      log.includes('🔐') || log.includes('🗄️') || log.includes('🔑') ? 'text-blue-300' :
                      'text-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}