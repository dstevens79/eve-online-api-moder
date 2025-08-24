import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

export function FixedLoginTest() {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('12345');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('🔧 FIXED TEST: Login starting...');
    console.log('🔧 FIXED TEST: Credentials:', { username, password });
    
    try {
      await login({ username, password });
      console.log('🔧 FIXED TEST: Login call completed');
    } catch (error) {
      console.error('🔧 FIXED TEST: Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return (
      <Card className="border-green-500 bg-green-50/10">
        <CardHeader>
          <CardTitle className="text-green-400">✅ Login Successful</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>User: {user.characterName}</div>
            <div>Is Admin: {user.isAdmin ? 'Yes' : 'No'}</div>
            <Button onClick={logout} variant="destructive" size="sm">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed Login Test</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isSubmitting}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}