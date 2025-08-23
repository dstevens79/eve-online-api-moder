import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth';

export function AuthServiceTest() {
  const [result, setResult] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const testAuthService = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('🧪 Testing auth service directly...');
      const user = await authService.loginWithCredentials(
        { username: 'admin', password: '12345' },
        { username: 'admin', password: '12345' }
      );
      
      console.log('✅ Auth service test successful:', user);
      setResult(`SUCCESS: ${user.characterName} (${user.isAdmin ? 'Admin' : 'User'})`);
    } catch (error) {
      console.error('❌ Auth service test failed:', error);
      setResult(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Auth Service Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p><strong>Result:</strong> {result || 'Not tested yet'}</p>
        </div>
        
        <Button onClick={testAuthService} disabled={loading}>
          {loading ? 'Testing...' : 'Test Auth Service'}
        </Button>
      </CardContent>
    </Card>
  );
}