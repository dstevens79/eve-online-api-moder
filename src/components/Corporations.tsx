import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Users, Globe, Shield, UserCheck, X, Key, Rocket, Warning } from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-provider';
import { toast } from 'sonner';

interface CorporationsProps {
  isMobileView?: boolean;
}

export function Corporations({ isMobileView = false }: CorporationsProps) {
  const { 
    user, 
    esiConfig, 
    getRegisteredCorporations, 
    updateCorporation, 
    deleteCorporation,
    loginWithESI 
  } = useAuth();
  
  const registeredCorps = getRegisteredCorporations();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building size={20} />
            Corporation ESI Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage corporation-level ESI authentication and user access validation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User's ESI Status */}
          {user && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {user.characterId && (
                    <img 
                      src={`https://images.evetech.net/characters/${user.characterId}/portrait?size=64`}
                      alt={user.characterName || 'Character'}
                      className="w-10 h-10 rounded-full border-2 border-accent/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzMzMiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTAgMTIuNUM4LjYyNSAxMi41IDcuNSAxMS4zNzUgNy41IDEwQzcuNSA4LjYyNSA4LjYyNSA3LjUgMTAgNy41QzExLjM3NSA3LjUgMTIuNSA4LjYyNSAxMi41IDEwQzEyLjUgMTEuMzc1IDExLjM3NSAxMi41IDEwIDEyLjVaIiBmaWxsPSIjOTk5Ii8+CjxwYXRoIGQ9Ik0xMCAxNUM3LjI1IDE1IDUgMTIuMjUgNSAxMEM1IDcuNzUgNy4yNSA1IDEwIDVDMTIuMjUgNSAxMCA3Ljc1IDEwIDEwQzEwIDEyLjI1IDEyLjI1IDE1IDEwIDE1WiIgZmlsbD0iIzk5OSIvPgo8L3N2Zz4KPC9zdmc+'
                      }}
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{user.characterName || 'Unknown Character'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.corporationName || 'Unknown Corporation'} • {user.authMethod?.toUpperCase()} Auth
                    </p>
                  </div>
                </div>
                <Badge variant={user.authMethod === 'esi' ? "default" : "secondary"}>
                  {user.authMethod === 'esi' ? 'ESI Authenticated' : 'Local Account'}
                </Badge>
              </div>
              
              {user.authMethod === 'esi' ? (
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    <p>Character ID: {user.characterId}</p>
                    <p>Corporation ID: {user.corporationId}</p>
                    {user.role && <p>Role: {user.role.replace('_', ' ').toUpperCase()}</p>}
                  </div>
                  
                  {/* Corporation Director/CEO Actions */}
                  {user.role && ['director', 'ceo'].includes(user.role.toLowerCase()) && (
                    <div className="p-3 bg-accent/10 border border-accent/30 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={16} className="text-accent" />
                        <span className="text-sm font-medium">Corporation Management Available</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        As a {user.role}, you can register your corporation for LMeve data access
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={async () => {
                          try {
                            // Start corporation ESI registration process
                            const corpAuth = loginWithESI('corporation');
                            window.location.href = corpAuth;
                          } catch (error) {
                            console.error('Failed to start corp ESI auth:', error);
                            toast.error('Failed to start corporation authentication');
                          }
                        }}
                        disabled={!esiConfig?.clientId}
                      >
                        <Key size={16} className="mr-2" />
                        Register Corporation ESI Access
                      </Button>
                    </div>
                  )}
                  
                  {/* Enhanced ESI Scope Management */}
                  <div className="p-3 bg-muted/30 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck size={16} />
                      <span className="text-sm font-medium">ESI Scope Management</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Your current authentication level allows basic site access. Additional scopes are required for manufacturing assignments and advanced features.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        try {
                          // Request expanded scopes for manufacturing and corporation access
                          const enhancedAuth = loginWithESI('enhanced');
                          window.location.href = enhancedAuth;
                        } catch (error) {
                          console.error('Failed to start enhanced ESI auth:', error);
                          toast.error('Failed to start enhanced authentication');
                        }
                      }}
                      disabled={!esiConfig?.clientId}
                    >
                      <Rocket size={16} className="mr-2" />
                      Request Enhanced Access
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    You are using a local account. To access ESI features and register corporations, please authenticate with EVE Online SSO.
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        const authUrl = loginWithESI();
                        window.location.href = authUrl;
                      } catch (error) {
                        console.error('Failed to start ESI auth:', error);
                        toast.error('Failed to start ESI authentication');
                      }
                    }}
                    disabled={!esiConfig?.clientId}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Rocket size={16} className="mr-2" />
                    Authenticate with EVE Online
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Registered Corporations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Registered Corporations</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {registeredCorps.filter(corp => corp.isActive).length} Active
                </Badge>
                <Badge variant={esiConfig?.clientId ? "default" : "secondary"}>
                  ESI {esiConfig?.clientId ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
            </div>
            
            {registeredCorps.length > 0 ? (
              <div className="space-y-3">
                {registeredCorps.map((corp) => (
                  <div key={corp.corporationId} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {corp.corporationId && (
                          <img 
                            src={`https://images.evetech.net/corporations/${corp.corporationId}/logo?size=64`}
                            alt={corp.corporationName}
                            className="w-10 h-10 rounded border border-accent/30"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMjIyIi8+CjxwYXRoIGQ9Ik0yMCAxMEwzMCAyMEwyMCAzMEwxMCAyMEwyMCAxMFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+'
                            }}
                          />
                        )}
                        <div>
                          <h5 className="font-medium">{corp.corporationName}</h5>
                          <p className="text-sm text-muted-foreground">
                            Corp ID: {corp.corporationId} • Registered: {new Date(corp.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={corp.isActive ? "default" : "secondary"}>
                          {corp.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {corp.lastTokenRefresh && (
                          <Badge variant="outline" className="text-xs">
                            Updated: {new Date(corp.lastTokenRefresh).toLocaleDateString()}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCorporation(corp.corporationId, { isActive: !corp.isActive })}
                        >
                          {corp.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${corp.corporationName}?`)) {
                              deleteCorporation(corp.corporationId);
                              toast.success('Corporation removed');
                            }
                          }}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-muted/30 rounded text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium mb-1">ESI Scopes:</p>
                          <p className="text-muted-foreground">{corp.registeredScopes.join(', ')}</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Configuration:</p>
                          <p className="text-muted-foreground">
                            ESI Client: {corp.esiClientId ? 'Custom' : 'Global'}<br />
                            Members: {corp.memberCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-border rounded-lg text-center">
                <Building size={32} className="mx-auto mb-3 text-muted-foreground" />
                <h5 className="font-medium mb-2">No Corporations Registered</h5>
                <p className="text-sm text-muted-foreground mb-4">
                  Corporation Directors and CEOs can register their corporations for LMeve data access by authenticating with EVE Online SSO.
                </p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p><strong>Basic Access:</strong> Login with any EVE character for site navigation</p>
                  <p><strong>Enhanced Access:</strong> Additional scopes for manufacturing job assignments</p>
                  <p><strong>Corporation Access:</strong> Directors/CEOs can register corporations for full data sync</p>
                </div>
              </div>
            )}
          </div>

          {/* ESI Configuration Status */}
          {!esiConfig?.clientId && (
            <Alert>
              <Warning size={16} />
              <AlertDescription>
                ESI authentication is not configured. Contact your system administrator to configure ESI Client ID and Secret in the Database settings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}