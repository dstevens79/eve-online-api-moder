// Authentication state debug and status component
import React from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthStatusDisplay() {
  const { user, isAuthenticated, authTrigger } = useAuth();
  
  // Log every render for debugging
  console.log('🎭 AUTH STATUS DISPLAY - Render:', {
    hasUser: !!user,
    userName: user?.characterName,
    isAuthenticated,
    authTrigger,
    timestamp: Date.now()
  });
  
  return (
    <Card className="border-blue-500">
      <CardHeader>
        <CardTitle className="text-blue-400">Authentication Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm font-mono">
        <div>User Exists: {user ? '✅ YES' : '❌ NO'}</div>
        <div>User Name: {user?.characterName || 'null'}</div>
        <div>Is Authenticated: {isAuthenticated ? '✅ YES' : '❌ NO'}</div>
        <div>Is Admin: {user?.isAdmin ? '✅ YES' : '❌ NO'}</div>
        <div>Auth Trigger: {authTrigger}</div>
        <div>Should Show Main App: {user ? '✅ YES' : '❌ NO'}</div>
      </CardContent>
    </Card>
  );
}