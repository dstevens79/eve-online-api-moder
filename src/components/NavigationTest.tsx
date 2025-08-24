import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useKV } from '@github/spark/hooks';

export function NavigationTest() {
  const { user, isAuthenticated } = useAuth();
  const [testNav, setTestNav] = useKV<string>('test-nav-tab', 'dashboard');
  const [navLogs, setNavLogs] = useState<string[]>([]);

  const addNavLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setNavLogs(prev => [...prev.slice(-4), logEntry]); // Keep last 5 entries
    console.log('🧪 NAV TEST:', logEntry);
  };

  const testNavigationClick = (tabName: string) => {
    addNavLog(`Attempting navigation to: ${tabName}`);
    
    if (!user) {
      addNavLog(`❌ Navigation blocked - no user object`);
      return;
    }
    
    if (!isAuthenticated) {
      addNavLog(`❌ Navigation blocked - not authenticated`);
      return;
    }
    
    setTestNav(tabName);
    addNavLog(`✅ Navigation successful to: ${tabName}`);
  };

  const tabs = [
    'dashboard',
    'members', 
    'assets',
    'manufacturing',
    'settings'
  ];

  return (
    <Card className="border-cyan-500">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center justify-between">
          🧭 Navigation Test
          <Badge variant="outline" className="text-cyan-400 border-cyan-500">
            Current: {testNav}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Navigation Status */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>User: {user ? '✅' : '❌'}</div>
          <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
        </div>

        {/* Test Navigation Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {tabs.map(tab => (
            <Button
              key={tab}
              onClick={() => testNavigationClick(tab)}
              variant={testNav === tab ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Navigation Logs */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-cyan-400">Navigation Log:</div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {navLogs.length === 0 ? (
              <div className="text-xs text-muted-foreground">No navigation attempts yet</div>
            ) : (
              navLogs.slice().reverse().map((log, index) => (
                <div key={index} className="text-xs font-mono p-1 bg-muted/30 rounded">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}