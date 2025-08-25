import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';

export function KVStorageTest() {
  const [testData, setTestData] = useKV<any>('kv-test-data', null);
  const [directKVUser, setDirectKVUser] = useKV<any>('auth-user', null);
  const [kvKeys, setKvKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadKVKeys();
  }, []);

  const loadKVKeys = async () => {
    try {
      const keys = await (window as any).spark.kv.keys();
      setKvKeys(keys.filter(key => key.startsWith('auth-') || key.startsWith('kv-test')));
    } catch (error) {
      console.error('Failed to load KV keys:', error);
    }
  };

  const testKVWrite = async () => {
    setIsLoading(true);
    try {
      const testPayload = {
        timestamp: Date.now(),
        testUser: 'Test Admin',
        isTest: true
      };
      
      setTestData(testPayload);
      console.log('✅ KV Write test successful:', testPayload);
      await loadKVKeys();
    } catch (error) {
      console.error('❌ KV Write test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testKVClear = async () => {
    setIsLoading(true);
    try {
      setTestData(null);
      console.log('✅ KV Clear test successful');
      await loadKVKeys();
    } catch (error) {
      console.error('❌ KV Clear test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthUser = async () => {
    setIsLoading(true);
    try {
      setDirectKVUser(null);
      console.log('✅ Auth user cleared from KV');
      await loadKVKeys();
    } catch (error) {
      console.error('❌ Failed to clear auth user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-orange-500">
      <CardHeader>
        <CardTitle className="text-orange-400 flex items-center justify-between">
          💾 KV Storage Test
          <Badge variant="outline" className={testData ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-400'}>
            {testData ? 'HAS DATA' : 'NO DATA'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Data Display */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Test Data:</div>
          <div className="p-2 bg-muted/30 rounded text-xs font-mono">
            {testData ? JSON.stringify(testData, null, 2) : 'null'}
          </div>
          
          <div className="text-sm font-medium">Auth User (Direct):</div>
          <div className="p-2 bg-muted/30 rounded text-xs font-mono max-h-24 overflow-y-auto">
            {directKVUser ? (
              <div>
                <div>Name: {directKVUser.characterName}</div>
                <div>ID: {directKVUser.characterId}</div>
                <div>Admin: {directKVUser.isAdmin ? 'Yes' : 'No'}</div>
              </div>
            ) : (
              'null'
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testKVWrite}
            disabled={isLoading}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            Write Test Data
          </Button>
          <Button 
            onClick={testKVClear}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            Clear Test Data
          </Button>
        </div>

        <Button 
          onClick={clearAuthUser}
          disabled={isLoading}
          size="sm"
          variant="destructive"
          className="w-full"
        >
          Clear Auth User (KV Direct)
        </Button>

        {/* KV Keys Display */}
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center justify-between">
            KV Keys ({kvKeys.length})
            <Button onClick={loadKVKeys} size="sm" variant="ghost" className="h-6 px-2 text-xs">
              Refresh
            </Button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {kvKeys.length === 0 ? (
              <div className="text-xs text-muted-foreground">No auth or test keys found</div>
            ) : (
              kvKeys.map(key => (
                <div key={key} className="text-xs font-mono p-1 bg-muted/20 rounded">
                  {key}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}