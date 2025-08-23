import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gear } from '@phosphor-icons/react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gear size={24} />
          Corporation Settings
        </h2>
        <p className="text-muted-foreground">
          Configure corporation management preferences and system settings
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings and configuration functionality will be implemented here. This will include:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Corporation profile management</li>
            <li>• User roles and permissions</li>
            <li>• API key configuration</li>
            <li>• Notification preferences</li>
            <li>• Data export and backup settings</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}