import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCorporationAuth } from '@/lib/corp-auth';
import { Shield, UserCheck, Building, Key } from '@phosphor-icons/react';

export function SimpleAuthStatus() {
  const { user, isAuthenticated, logout } = useCorporationAuth();

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <Card className="border-green-500/20 bg-green-500/5">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center gap-2">
          <Shield size={20} />
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
          
          {user && (
            <>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {user.authMethod.toUpperCase()}
              </Badge>
              
              {user.isAdmin && (
                <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                  Admin
                </Badge>
              )}
              
              {user.isCeo && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  CEO
                </Badge>
              )}
              
              {user.isDirector && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Director
                </Badge>
              )}
            </>
          )}
        </div>

        {/* User Information */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-green-400" />
                <span className="font-medium">Character:</span>
                <span>{user.characterName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Building size={16} className="text-blue-400" />
                <span className="font-medium">Corporation:</span>
                <span>{user.corporationName}</span>
              </div>
              
              {user.allianceName && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Alliance:</span>
                  <span>{user.allianceName}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-yellow-400" />
                <span className="font-medium">Auth Method:</span>
                <span className="capitalize">{user.authMethod}</span>
              </div>
              
              <div>
                <span className="font-medium">Permissions:</span>
                <div className="text-xs text-muted-foreground mt-1">
                  Admin: {user.isAdmin ? 'Yes' : 'No'} |{' '}
                  CEO: {user.isCeo ? 'Yes' : 'No'} |{' '}
                  Director: {user.isDirector ? 'Yes' : 'No'}
                </div>
              </div>
              
              {user.authMethod === 'esi' && (
                <div>
                  <span className="font-medium">Token Status:</span>
                  <div className="text-xs text-muted-foreground">
                    Expires: {new Date(user.tokenExpiry).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {user && (
          <div className="pt-4 border-t border-border">
            <Button 
              onClick={logout}
              variant="outline"
              size="sm"
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              Logout (Debug)
            </Button>
          </div>
        )}

        {!user && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Not authenticated</p>
            <p className="text-xs">Use the Sign In button in the header to authenticate</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}