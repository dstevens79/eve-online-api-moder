import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { Play, Trash2 } from '@phosphor-icons/react';

interface TestUser {
  id: number;
  name: string;
  timestamp: number;
}

export function SimpleKVTest() {
  const [kvUser, setKVUser] = useKV<TestUser | null>('test-user', null);
  const [inputName, setInputName] = useState('Test User');
  const [status, setStatus] = useState<string>('idle');

  const setTestUser = () => {
    setStatus('setting...');
    const newUser: TestUser = {
      id: Math.floor(Math.random() * 1000),
      name: inputName,
      timestamp: Date.now()
    };
    
    console.log('📝 Setting test user:', newUser);
    setKVUser(newUser);
    setStatus('set');
  };

  const clearUser = () => {
    setStatus('clearing...');
    console.log('🗑️ Clearing test user');
    setKVUser(null);
    setStatus('cleared');
  };

  return (
    <Card className="border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🧪 Simple KV Hook Test
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current State */}
        <div className="p-3 bg-muted/30 rounded text-xs">
          <div className="font-medium mb-2">Current KV State:</div>
          {kvUser ? (
            <div className="space-y-1">
              <div>ID: {kvUser.id}</div>
              <div>Name: {kvUser.name}</div>
              <div>Time: {new Date(kvUser.timestamp).toLocaleTimeString()}</div>
            </div>
          ) : (
            <div className="text-muted-foreground">No user set</div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Label className="text-xs w-16">Name:</Label>
            <Input
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="text-xs h-7"
              placeholder="Enter test name"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={setTestUser}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Play size={12} className="mr-1" />
              Set User
            </Button>
            
            <Button
              onClick={clearUser}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Trash2 size={12} className="mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          <div>Has User: {kvUser ? 'true' : 'false'}</div>
          <div>Type: {typeof kvUser}</div>
          <div>Status: {status}</div>
        </div>
      </CardContent>
    </Card>
  );
}