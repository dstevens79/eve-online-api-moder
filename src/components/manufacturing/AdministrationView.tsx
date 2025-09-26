import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Star, Clock } from '@phosphor-icons/react';
import { Member } from '@/lib/types';

interface AdministrationViewProps {
  members: Member[];
  onAssignTask: () => void;
  payModifiers: Record<string, number>;
  isMobileView?: boolean;
}

export function AdministrationView({ 
  members, 
  onAssignTask, 
  payModifiers, 
  isMobileView 
}: AdministrationViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Manufacturing Administration</h3>
          <p className="text-sm text-muted-foreground">
            Create and assign manufacturing tasks to corporation members
          </p>
        </div>
        <Button onClick={onAssignTask}>
          <Plus size={16} className="mr-2" />
          Assign New Task
        </Button>
      </div>

      {/* Pay Modifiers Settings */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Star size={18} />
            Pay Multipliers
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quality Bonus</span>
                <Badge variant="outline" className="text-green-400 border-green-500/50">
                  +{Math.round((payModifiers.qualityBonus - 1) * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                For high-quality work and attention to detail
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Speed Bonus</span>
                <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                  +{Math.round((payModifiers.speedBonus - 1) * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                For completing tasks ahead of schedule
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Difficulty Bonus</span>
                <Badge variant="outline" className="text-orange-400 border-orange-500/50">
                  +{Math.round((payModifiers.difficultyBonus - 1) * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                For complex or challenging manufacturing jobs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Members */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Users size={18} />
            Available Members
          </h4>
          
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Members Available</h4>
              <p className="text-muted-foreground">
                No corporation members are available for task assignment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={`https://images.evetech.net/characters/${member.characterId}/portrait?size=64`}
                      alt={member.characterName}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzMzMiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTAgMTJDOC45IDEyIDggMTEuMSA4IDEwQzggOC45IDguOSA4IDEwIDhDMTEuMSA4IDEyIDguOSAxMiAxMEMxMiAxMS4xIDExLjEgMTIgMTAgMTJaIiBmaWxsPSIjOTk5Ii8+CjxwYXRoIGQ9Ik0xMCAxNEM3LjggMTQgNiAxMi4yIDYgMTBDNiA3LjggNy44IDYgMTAgNkMxMi4yIDYgMTQgNy44IDE0IDEwQzE0IDEyLjIgMTIuMiAxNCAxMCAxNFoiIGZpbGw9IiM5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                      }}
                    />
                    <div>
                      <p className="font-medium text-foreground">{member.characterName}</p>
                      <p className="text-xs text-muted-foreground">{member.title}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span className={`${
                        new Date(member.lastLogin).getTime() > Date.now() - 24 * 60 * 60 * 1000
                          ? 'text-green-400' : 'text-muted-foreground'
                      }`}>
                        {new Date(member.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-foreground">{member.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Access:</span>
                      <Badge variant="outline" className={`text-xs ${
                        member.accessLevel === 'director' ? 'text-purple-400 border-purple-500/50' :
                        member.accessLevel === 'manager' ? 'text-blue-400 border-blue-500/50' :
                        'text-muted-foreground border-muted'
                      }`}>
                        {member.accessLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-xl font-bold text-green-400">
                  {members.filter(m => m.isActive).length}
                </p>
              </div>
              <Users size={20} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Directors</p>
                <p className="text-xl font-bold text-purple-400">
                  {members.filter(m => m.accessLevel === 'director').length}
                </p>
              </div>
              <Star size={20} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Activity</p>
                <p className="text-xl font-bold text-blue-400">
                  {members.filter(m => 
                    new Date(m.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                  ).length}
                </p>
              </div>
              <Clock size={20} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}