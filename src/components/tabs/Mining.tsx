import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginPrompt } from '@/components/LoginPrompt';
import { HardHat } from '@phosphor-icons/react';
import { useCorporationAuth } from '@/lib/corp-auth';
import { TabComponentProps } from '@/lib/types';

export function Mining({ onLoginClick }: TabComponentProps) {
  const { user } = useCorporationAuth();

  // Show login prompt if not authenticated
  // Show login prompt if not authenticated - TEMPORARILY DISABLED FOR DEBUG
  if (!user && onLoginClick && false) { // Added && false to disable this check
    return (
      <LoginPrompt 
        onLoginClick={onLoginClick}
        title="Mining Operations"
        description="Sign in to view and manage your corporation's mining activities"
      />
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HardHat size={24} />
          Mining Operations
        </h2>
        <p className="text-muted-foreground">
          Track mining activities, ore processing, and resource allocation
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Mining Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Mining operations functionality will be implemented here. This will include:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Mining operation planning and tracking</li>
            <li>• Ore yield analysis and reporting</li>
            <li>• Mining fleet coordination</li>
            <li>• Resource allocation optimization</li>
            <li>• Mining ledger and payouts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}