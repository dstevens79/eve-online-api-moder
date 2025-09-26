import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Star, Clock, Factory, TrendUp, Save } from '@phosphor-icons/react';
import { Member } from '@/lib/types';
import { toast } from 'sonner';

interface AdministrationViewProps {
  members: Member[];
  onAssignTask: () => void;
  payModifiers: Record<string, number>;
  payRatesPerHour: Record<string, number>;
  onUpdatePayModifiers: (modifiers: Record<string, number>) => void;
  onUpdatePayRates: (rates: Record<string, number>) => void;
  isMobileView?: boolean;
}

export function AdministrationView({ 
  members, 
  onAssignTask, 
  payModifiers, 
  payRatesPerHour,
  onUpdatePayModifiers,
  onUpdatePayRates,
  isMobileView 
}: AdministrationViewProps) {
  const [editingPayModifiers, setEditingPayModifiers] = useState(false);
  const [editingPayRates, setEditingPayRates] = useState(false);
  const [tempModifiers, setTempModifiers] = useState(payModifiers);
  const [tempRates, setTempRates] = useState(payRatesPerHour);

  const handleSaveModifiers = () => {
    onUpdatePayModifiers(tempModifiers);
    setEditingPayModifiers(false);
    toast.success('Pay multipliers updated');
  };

  const handleSaveRates = () => {
    onUpdatePayRates(tempRates);
    setEditingPayRates(false);
    toast.success('Pay rates updated');
  };

  const cancelEditModifiers = () => {
    setTempModifiers(payModifiers);
    setEditingPayModifiers(false);
  };

  const cancelEditRates = () => {
    setTempRates(payRatesPerHour);
    setEditingPayRates(false);
  };

  const formatISK = (amount: number): string => {
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M ISK`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(0)}K ISK`;
    return `${Math.round(amount)} ISK`;
  };

  return (
    <div className="space-y-6">
      {/* Manufacturing Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory size={20} />
            Manufacturing Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Active Members</span>
                </div>
                <span className="text-lg font-bold text-green-400">
                  {members.filter(m => m.isActive).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Directors</span>
                </div>
                <span className="text-lg font-bold text-purple-400">
                  {members.filter(m => m.accessLevel === 'director').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Recent Activity</span>
                </div>
                <span className="text-lg font-bold text-blue-400">
                  {members.filter(m => 
                    new Date(m.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                  ).length}
                </span>
              </div>
            </div>
            
            {/* Task Assignment */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Actions</h4>
              <Button onClick={onAssignTask} className="w-full">
                <Plus size={16} className="mr-2" />
                Assign New Task
              </Button>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Recent Activity:</p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Tasks This Week:</span>
                    <span className="text-accent">8 completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Time:</span>
                    <span className="text-accent">2.3h per task</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Production Summary */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Production Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Month:</span>
                  <span className="text-foreground font-medium">127 items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="text-green-400 font-medium">2.4B ISK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Efficiency:</span>
                  <span className="text-blue-400 font-medium">94.2%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pay Multipliers Settings */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Star size={18} />
              Pay Multipliers
            </h4>
            <div className="flex gap-2">
              {!editingPayModifiers ? (
                <Button variant="outline" size="sm" onClick={() => setEditingPayModifiers(true)}>
                  Edit Values
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={cancelEditModifiers}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveModifiers}>
                    <Save size={14} className="mr-1" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">RUSH</span>
                {editingPayModifiers ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={tempModifiers.rush}
                    onChange={(e) => setTempModifiers(prev => ({
                      ...prev,
                      rush: parseFloat(e.target.value) || 1
                    }))}
                    className="w-20 h-8 text-xs text-center bg-input border-border text-foreground"
                  />
                ) : (
                  <Badge variant="outline" className="text-orange-400 border-orange-500/50 bg-orange-500/10">
                    +{Math.round((tempModifiers.rush - 1) * 100)}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                For urgent priority manufacturing tasks
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Special Delivery</span>
                {editingPayModifiers ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={tempModifiers.specialDelivery}
                    onChange={(e) => setTempModifiers(prev => ({
                      ...prev,
                      specialDelivery: parseFloat(e.target.value) || 1
                    }))}
                    className="w-20 h-8 text-xs text-center bg-input border-border text-foreground"
                  />
                ) : (
                  <Badge variant="outline" className="text-blue-400 border-blue-500/50 bg-blue-500/10">
                    +{Math.round((tempModifiers.specialDelivery - 1) * 100)}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                For special delivery requirements
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Excess Work</span>
                {editingPayModifiers ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={tempModifiers.excessWork}
                    onChange={(e) => setTempModifiers(prev => ({
                      ...prev,
                      excessWork: parseFloat(e.target.value) || 1
                    }))}
                    className="w-20 h-8 text-xs text-center bg-input border-border text-foreground"
                  />
                ) : (
                  <Badge variant="outline" className="text-green-400 border-green-500/50 bg-green-500/10">
                    +{Math.round((tempModifiers.excessWork - 1) * 100)}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                For high volume or overtime work
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pay Rates Per Hour */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendUp size={18} />
              Pay Rates Per Hour by Job Type
            </h4>
            <div className="flex gap-2">
              {!editingPayRates ? (
                <Button variant="outline" size="sm" onClick={() => setEditingPayRates(true)}>
                  Edit Rates
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={cancelEditRates}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveRates}>
                    <Save size={14} className="mr-1" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(tempRates).map(([jobType, rate]) => (
              <div key={jobType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">
                    {jobType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {editingPayRates ? (
                    <Input
                      type="number"
                      step="1000"
                      value={rate}
                      onChange={(e) => setTempRates(prev => ({
                        ...prev,
                        [jobType]: parseInt(e.target.value) || 0
                      }))}
                      className="w-24 h-8 text-xs text-center bg-input border-border text-foreground"
                    />
                  ) : (
                    <Badge variant="outline" className="text-accent border-accent/50 bg-accent/10">
                      {formatISK(rate)}/h
                    </Badge>
                  )}
                </div>
              </div>
            ))}
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