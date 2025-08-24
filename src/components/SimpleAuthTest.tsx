import React from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export function SimpleAuthTest() {
  const { user, login, logout, authTrigger } = useAuth();
  
  const handleLogin = async () => {
    console.log('🧪 Simple test: Login starting...');
    try {
      await login({ username: 'admin', password: '12345' });
      console.log('🧪 Simple test: Login completed, user should be set now');
    } catch (error) {
      console.error('🧪 Simple test: Login failed:', error);
    }
  };
  
  React.useEffect(() => {
    console.log('🧪 Simple test: User state changed:', user?.characterName || 'null');
    console.log('🧪 Simple test: Auth trigger:', authTrigger);
  }, [user, authTrigger]);
  
  return (
    <div className="p-4 border border-accent rounded bg-card">
      <h3 className="text-lg font-bold mb-4">Simple Auth Test</h3>
      
      <div className="space-y-2 mb-4">
        <div>User: {user ? user.characterName : 'null'}</div>
        <div>Auth Trigger: {authTrigger}</div>
        <div>Has User: {user ? 'YES' : 'NO'}</div>
      </div>
      
      {!user ? (
        <Button onClick={handleLogin} className="bg-accent hover:bg-accent/90">
          Login as Admin
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="text-green-400">✅ Logged in as {user.characterName}</div>
          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}