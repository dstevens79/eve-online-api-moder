import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginPrompt } from '@/components/LoginPrompt';
import { Package } from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-provider';
import { TabComponentProps } from '@/lib/types';

export function Assets({ onLoginClick }: TabComponentProps) {
  const { user } = useAuth();

  // Show login prompt if not authenticated
  // Show login prompt if not authenticated - TEMPORARILY DISABLED FOR DEBUG
  if (!user && onLoginClick && false) { // Added && false to disable this check
    return (
      <LoginPrompt 
        onLoginClick={onLoginClick}
        title="Corporation Assets"
        description="Sign in to view and manage your corporation's assets"
      />
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package size={24} />
          Corporation Assets
        </h2>
        <p className="text-muted-foreground">
          Track and manage corporation and member assets across all locations
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Asset Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Asset tracking functionality will be implemented here. This will include:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Asset inventory by location</li>
            <li>• Asset value tracking and estimates</li>
            <li>• Asset movement history</li>
            <li>• Asset search and filtering</li>
            <li>• Export capabilities</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}