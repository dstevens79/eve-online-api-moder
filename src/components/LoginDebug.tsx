import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

export function LoginDebug() {
  const { user, login, logout } = useAuth();

  const handleDirectLogin = async () => {
    console.log('🧪 DEBUG: Attempting direct admin login...');
    try {
      await login({ username: 'admin', password: '12345' });
      console.log('✅ DEBUG: Direct login completed');
    } catch (error) {
      console.error('❌ DEBUG: Direct login failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p><strong>User Status:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
          {user && (
            <>
              <p><strong>Character:</strong> {user.characterName}</p>
              <p><strong>Corporation:</strong> {user.corporationName}</p>
              <p><strong>Is Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleDirectLogin} disabled={!!user}>
            Direct Admin Login
          </Button>
          {user && (
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}