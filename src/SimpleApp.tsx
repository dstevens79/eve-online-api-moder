import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { SignIn, SignOut, Rocket } from '@phosphor-icons/react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { SimpleLoginModal } from '@/components/SimpleLoginModal';

function SimpleApp() {
  const { user, isAuthenticated, logout } = useSimpleAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      
      {/* Debug info */}
      <div className="fixed top-4 right-4 z-50 bg-card border border-border rounded p-3 text-xs">
        <div className="font-bold mb-1">DEBUG</div>
        <div>Authenticated: {isAuthenticated ? 'YES' : 'NO'}</div>
        <div>User: {user?.name || 'None'}</div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Rocket size={28} className="text-accent" />
            <div>
              <h1 className="text-xl font-bold">LMeve Test</h1>
              <p className="text-sm text-muted-foreground">Simple Authentication Test</p>
            </div>
          </div>
          
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.corp}</p>
                </div>
                <Button onClick={logout} variant="outline" size="sm">
                  <SignOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowLoginModal(true)} size="sm">
                <SignIn size={16} className="mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {isAuthenticated ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
              <p className="text-muted-foreground">
                You are successfully logged in to the LMeve test application.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Dashboard</h3>
                <p className="text-sm text-muted-foreground">Main overview and statistics</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Manufacturing</h3>
                <p className="text-sm text-muted-foreground">Production jobs and blueprints</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Settings</h3>
                <p className="text-sm text-muted-foreground">Configuration and preferences</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Rocket size={48} className="text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">LMeve Authentication Test</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access the application
            </p>
            <Button onClick={() => setShowLoginModal(true)}>
              <SignIn size={16} className="mr-2" />
              Sign In
            </Button>
          </div>
        )}
      </main>

      {/* Login Modal */}
      <SimpleLoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
      />
    </div>
  );
}

export default SimpleApp;