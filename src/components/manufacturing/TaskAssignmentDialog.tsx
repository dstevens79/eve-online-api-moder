import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Package, 
  Clock, 
  CurrencyDollar, 
  Factory,
  Calendar,
  Tag,
  CheckCircle,
  AlertTriangle,
  Info
} from '@phosphor-icons/react';
import { ManufacturingTask, Blueprint, MaterialRequirement, Member } from '@/lib/types';
import { useAuth } from '@/lib/auth-provider';
import { toast } from 'sonner';

interface TaskAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blueprints: Blueprint[];
  members: Member[];
  onCreateTask: (task: ManufacturingTask) => void;
  editTask?: ManufacturingTask | null;
}

export function TaskAssignmentDialog({ 
  open, 
  onOpenChange, 
  blueprints, 
  members,
  onCreateTask,
  editTask 
}: TaskAssignmentDialogProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<ManufacturingTask>>({
    title: '',
    description: '',
    taskType: 'manufacturing',
    priority: 'normal',
    status: 'pending',
    runs: 1,
    materialEfficiency: 10,
    timeEfficiency: 20,
    reward: {
      type: 'fixed',
      amount: 0,
      paymentStatus: 'pending'
    },
    materials: [],
    estimatedCost: 0,
    estimatedDuration: 0,
    tags: []
  });
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [currentTab, setCurrentTab] = useState('basic');

  // Reset form when dialog opens/closes or edit task changes
  useEffect(() => {
    if (open && editTask) {
      setFormData(editTask);
      const blueprint = blueprints.find(bp => bp.id === editTask.blueprintId?.toString());
      setSelectedBlueprint(blueprint || null);
    } else if (open && !editTask) {
      setFormData({
        title: '',
        description: '',
        taskType: 'manufacturing',
        priority: 'normal',
        status: 'pending',
        runs: 1,
        materialEfficiency: 10,
        timeEfficiency: 20,
        reward: {
          type: 'fixed',
          amount: 0,
          paymentStatus: 'pending'
        },
        materials: [],
        estimatedCost: 0,
        estimatedDuration: 0,
        tags: []
      });
      setSelectedBlueprint(null);
    }
  }, [open, editTask, blueprints]);

  // Update target item and materials when blueprint changes
  useEffect(() => {
    if (selectedBlueprint && formData.runs) {
      const totalMaterials = selectedBlueprint.baseMaterials.map(mat => ({
        ...mat,
        quantity: mat.quantity * formData.runs!,
        totalValue: mat.totalValue * formData.runs!
      }));
      
      setFormData(prev => ({
        ...prev,
        targetItem: {
          typeId: selectedBlueprint.productTypeId,
          typeName: selectedBlueprint.productTypeName,
          quantity: formData.runs!
        },
        blueprintId: selectedBlueprint.typeId,
        blueprintName: selectedBlueprint.typeName,
        materials: totalMaterials,
        estimatedCost: totalMaterials.reduce((sum, mat) => sum + mat.totalValue, 0),
        estimatedDuration: selectedBlueprint.baseTime * formData.runs!,
        title: prev.title || `Manufacture ${selectedBlueprint.productTypeName} x${formData.runs}`
      }));
    }
  }, [selectedBlueprint, formData.runs]);

  const handleSubmit = () => {
    if (!formData.title || !formData.targetItem || !user) {
      toast.error('Please fill in all required fields');
      return;
    }

    const task: ManufacturingTask = {
      id: editTask?.id || `task-${Date.now()}`,
      title: formData.title!,
      description: formData.description || '',
      taskType: formData.taskType!,
      priority: formData.priority!,
      status: formData.status!,
      
      targetItem: formData.targetItem!,
      blueprintId: formData.blueprintId,
      blueprintName: formData.blueprintName,
      runs: formData.runs!,
      materialEfficiency: formData.materialEfficiency,
      timeEfficiency: formData.timeEfficiency,
      
      createdBy: user.characterId?.toString() || user.characterName || 'unknown',
      createdByName: user.characterName || 'Unknown User',
      createdDate: editTask?.createdDate || new Date().toISOString(),
      assignedTo: formData.assignedTo,
      assignedToName: formData.assignedToName,
      assignedDate: formData.assignedDate,
      assignedBy: formData.assignedBy,
      assignedByName: formData.assignedByName,
      
      materials: formData.materials || [],
      estimatedCost: formData.estimatedCost || 0,
      estimatedDuration: formData.estimatedDuration || 0,
      suggestedLocation: formData.suggestedLocation,
      
      reward: formData.reward!,
      deadline: formData.deadline,
      preferredStartTime: formData.preferredStartTime,
      
      corporationId: user.corporationId,
      corporationName: user.corporationName,
      tags: formData.tags || [],
      progressNotes: formData.progressNotes || []
    };

    onCreateTask(task);
    onOpenChange(false);
    toast.success(editTask ? 'Task updated successfully' : 'Manufacturing task created successfully');
  };

  const formatISK = (amount: number): string => {
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(1)}T ISK`;
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}B ISK`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M ISK`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(0)}K ISK`;
    return `${Math.round(amount)} ISK`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory size={20} />
            {editTask ? 'Edit Manufacturing Task' : 'Create Manufacturing Task'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                />
              </div>
              <div>
                <Label htmlFor="taskType">Task Type</Label>
                <Select 
                  value={formData.taskType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, taskType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="invention">Invention</SelectItem>
                    <SelectItem value="copy">Blueprint Copy</SelectItem>
                    <SelectItem value="reaction">Reaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the task requirements and expectations..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline ? new Date(formData.deadline).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Suggested Location</Label>
                <Input
                  id="location"
                  value={formData.suggestedLocation || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggestedLocation: e.target.value }))}
                  placeholder="e.g., Jita IV - Moon 4"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blueprint">Blueprint</Label>
                <Select 
                  value={selectedBlueprint?.id || ''} 
                  onValueChange={(value) => {
                    const blueprint = blueprints.find(bp => bp.id === value);
                    setSelectedBlueprint(blueprint || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a blueprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    {blueprints.map((blueprint) => (
                      <SelectItem key={blueprint.id} value={blueprint.id}>
                        {blueprint.typeName} → {blueprint.productTypeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="runs">Number of Runs *</Label>
                <Input
                  id="runs"
                  type="number"
                  min="1"
                  value={formData.runs}
                  onChange={(e) => setFormData(prev => ({ ...prev, runs: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            {formData.targetItem && (
              <Card className="bg-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Task Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target Product:</span>
                    <span className="font-medium">{formData.targetItem.typeName} x{formData.targetItem.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                    <span className="font-medium text-accent">{formatISK(formData.estimatedCost || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Duration:</span>
                    <span className="font-medium">{formatDuration(formData.estimatedDuration || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <Badge className={getPriorityColor(formData.priority!)}>
                      {formData.priority?.charAt(0).toUpperCase() + formData.priority?.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assignment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select 
                  value={formData.assignedTo || 'unassigned'} 
                  onValueChange={(value) => {
                    const isAssigning = value !== 'unassigned';
                    const member = members.find(m => m.characterId.toString() === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      assignedTo: isAssigning ? value : undefined,
                      assignedToName: isAssigning ? (member?.characterName || member?.name) : undefined,
                      assignedDate: isAssigning ? new Date().toISOString() : undefined,
                      assignedBy: user?.characterId?.toString() || user?.characterName || 'unknown',
                      assignedByName: user?.characterName || 'Unknown User',
                      status: isAssigning ? 'assigned' : 'pending'
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pilot or leave unassigned..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                    {members
                      .filter(member => member.isActive)
                      .map((member) => (
                        <SelectItem key={member.characterId} value={member.characterId.toString()}>
                          {member.characterName || member.name} ({member.corporationName})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="preferredStart">Preferred Start Time</Label>
                <Input
                  id="preferredStart"
                  type="datetime-local"
                  value={formData.preferredStartTime ? new Date(formData.preferredStartTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    preferredStartTime: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                  }))}
                />
              </div>
            </div>

            {formData.assignedToName && (
              <Card className="bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-accent" />
                    <div>
                      <p className="font-medium">Assigned to: {formData.assignedToName}</p>
                      <p className="text-sm text-muted-foreground">
                        Assigned by {formData.assignedByName} on {formData.assignedDate ? new Date(formData.assignedDate).toLocaleDateString() : 'now'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
                placeholder="e.g., urgent, capital-ships, daily-production"
              />
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} />
              <span className="font-medium">Required Materials</span>
              {formData.materials?.length && (
                <Badge variant="outline">
                  {formData.materials.length} items
                </Badge>
              )}
            </div>

            {formData.materials?.length ? (
              <div className="overflow-x-auto">
                <Table className="data-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.materials.map((material, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{material.typeName}</TableCell>
                        <TableCell>{material.quantity.toLocaleString()}</TableCell>
                        <TableCell>{formatISK(material.unitPrice || (material.totalValue / material.quantity))}</TableCell>
                        <TableCell>{formatISK(material.totalValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package size={48} className="mx-auto mb-4" />
                <p>No materials selected</p>
                <p className="text-sm">Select a blueprint in the Basic Info tab to see required materials</p>
              </div>
            )}

            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Estimated Cost:</span>
                  <span className="text-lg font-bold text-accent">
                    {formatISK(formData.estimatedCost || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rewardType">Reward Type</Label>
                <Select 
                  value={formData.reward?.type} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    reward: { 
                      ...prev.reward!, 
                      type: value as any 
                    } 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage of Materials</SelectItem>
                    <SelectItem value="market_rate">Market Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rewardAmount">
                  {formData.reward?.type === 'fixed' ? 'Amount (ISK)' : 
                   formData.reward?.type === 'percentage' ? 'Percentage (%)' : 'Rate Multiplier'}
                </Label>
                <Input
                  id="rewardAmount"
                  type="number"
                  min="0"
                  step={formData.reward?.type === 'percentage' ? '0.1' : '1000'}
                  value={formData.reward?.amount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    reward: { 
                      ...prev.reward!, 
                      amount: parseFloat(e.target.value) || 0 
                    } 
                  }))}
                />
              </div>
            </div>

            <Card className="bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CurrencyDollar size={16} />
                  Reward Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {formData.reward?.type === 'fixed' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fixed Reward:</span>
                    <span className="font-medium text-green-400">
                      {formatISK(formData.reward.amount)}
                    </span>
                  </div>
                )}
                {formData.reward?.type === 'percentage' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Material Cost:</span>
                      <span className="font-medium">{formatISK(formData.estimatedCost || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Percentage ({formData.reward.amount}%):</span>
                      <span className="font-medium text-green-400">
                        {formatISK((formData.estimatedCost || 0) * (formData.reward.amount / 100))}
                      </span>
                    </div>
                  </>
                )}
                {formData.reward?.type === 'market_rate' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Market Rate (estimated):</span>
                    <span className="font-medium text-green-400">
                      {formatISK((formData.estimatedCost || 0) * (formData.reward?.amount || 1))}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-400">Payment Information</p>
                  <p className="text-blue-300/80 mt-1">
                    Rewards will be processed upon successful completion and delivery of the manufactured items. 
                    Payment status can be tracked in the task management interface.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}