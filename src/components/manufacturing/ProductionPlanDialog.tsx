import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon,
  Calculator,
  Plus,
  FloppyDisk,
  X
} from '@phosphor-icons/react';
import { ProductionPlan, Blueprint } from '@/lib/types';

interface ProductionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blueprints: Blueprint[];
  onSavePlan?: (plan: ProductionPlan) => void;
}

export function ProductionPlanDialog({ 
  open, 
  onOpenChange, 
  blueprints, 
  onSavePlan 
}: ProductionPlanDialogProps) {
  const [planName, setPlanName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [targetQuantity, setTargetQuantity] = useState(1);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [selectedBlueprints, setSelectedBlueprints] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState<Date>();

  const resetForm = () => {
    setPlanName('');
    setSelectedProduct('');
    setTargetQuantity(1);
    setPriority('normal');
    setSelectedBlueprints([]);
    setTargetDate(undefined);
  };

  const formatISK = (amount: number) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B ISK`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M ISK`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(0)}K ISK`;
    return `${Math.round(amount)} ISK`;
  };

  const calculatePlanCosts = () => {
    const selectedBps = blueprints.filter(bp => selectedBlueprints.includes(bp.id));
    const totalCost = selectedBps.reduce((sum, bp) => {
      const materialCost = bp.baseMaterials.reduce((matSum, mat) => matSum + mat.totalValue, 0);
      return sum + (materialCost * targetQuantity);
    }, 0);
    
    const estimatedProfit = selectedBps.reduce((sum, bp) => {
      return sum + (bp.estimatedValue * targetQuantity);
    }, 0) - totalCost;

    const totalDuration = selectedBps.reduce((sum, bp) => {
      const adjustedTime = bp.baseTime * (1 - bp.timeEfficiency / 100);
      return sum + (adjustedTime * targetQuantity);
    }, 0);

    return { totalCost, estimatedProfit, totalDuration };
  };

  const handleSavePlan = () => {
    if (!planName.trim()) return;

    const { totalCost, estimatedProfit, totalDuration } = calculatePlanCosts();
    const selectedBps = blueprints.filter(bp => selectedBlueprints.includes(bp.id));

    const newPlan: ProductionPlan = {
      id: `plan-${Date.now()}`,
      name: planName.trim(),
      targetProduct: {
        typeId: parseInt(selectedProduct) || 0,
        typeName: selectedBps[0]?.productTypeName || 'Unknown Product',
        quantity: targetQuantity
      },
      blueprints: selectedBps,
      materials: selectedBps.flatMap(bp => 
        bp.baseMaterials.map(mat => ({
          ...mat,
          quantity: mat.quantity * targetQuantity,
          totalValue: mat.totalValue * targetQuantity
        }))
      ),
      estimatedCost: totalCost,
      estimatedProfit: estimatedProfit,
      estimatedDuration: totalDuration,
      status: 'draft',
      createdBy: 'Current User',
      createdDate: new Date().toISOString(),
      priority
    };

    if (onSavePlan) {
      onSavePlan(newPlan);
    }

    resetForm();
    onOpenChange(false);
  };

  const handleBlueprintToggle = (blueprintId: string) => {
    setSelectedBlueprints(current => 
      current.includes(blueprintId)
        ? current.filter(id => id !== blueprintId)
        : [...current, blueprintId]
    );
  };

  const { totalCost, estimatedProfit, totalDuration } = calculatePlanCosts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator size={20} />
            Create Production Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetQuantity">Target Quantity</Label>
              <Input
                id="targetQuantity"
                type="number"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
            </div>
            <div>
              <Label>Target Completion Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon size={16} className="mr-2" />
                    {targetDate ? format(targetDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Blueprint Selection */}
          <div>
            <Label className="text-base font-semibold">Select Blueprints</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose the blueprints to include in this production plan
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded p-4">
              {blueprints.map((blueprint) => (
                <div
                  key={blueprint.id}
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                    selectedBlueprints.includes(blueprint.id)
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:bg-muted/20'
                  }`}
                  onClick={() => handleBlueprintToggle(blueprint.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedBlueprints.includes(blueprint.id)
                        ? 'border-accent bg-accent'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedBlueprints.includes(blueprint.id) && (
                        <div className="w-2 h-2 bg-accent-foreground rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{blueprint.typeName}</p>
                      <p className="text-sm text-muted-foreground">
                        Produces: {blueprint.productTypeName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatISK(blueprint.estimatedValue)}</p>
                    <p className="text-xs text-muted-foreground">
                      ME: {blueprint.materialEfficiency}% | TE: {blueprint.timeEfficiency}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          {selectedBlueprints.length > 0 && (
            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Production Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{formatISK(totalCost)}</p>
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${estimatedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatISK(estimatedProfit)}
                    </p>
                    <p className="text-sm text-muted-foreground">Estimated Profit</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {Math.round(totalDuration / 3600)}h
                    </p>
                    <p className="text-sm text-muted-foreground">Production Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleSavePlan} disabled={!planName.trim() || selectedBlueprints.length === 0}>
              <FloppyDisk size={16} className="mr-2" />
              Save Plan
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}