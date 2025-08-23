import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Star, 
  Wrench, 
  Flask,
  Copy,
  Calculator,
  TrendUp,
  Clock,
  Factory,
  Plus
} from '@phosphor-icons/react';
import { Blueprint, MaterialRequirement } from '@/lib/types';

interface BlueprintDetailsDialogProps {
  blueprint: Blueprint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartJob?: (blueprintId: string, runs: number, facility: string) => void;
}

export function BlueprintDetailsDialog({ blueprint, open, onOpenChange, onStartJob }: BlueprintDetailsDialogProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [jobRuns, setJobRuns] = useState(1);
  const [selectedFacility, setSelectedFacility] = useState('');

  if (!blueprint) return null;

  const formatISK = (amount: number) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B ISK`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M ISK`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(0)}K ISK`;
    return `${Math.round(amount)} ISK`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateJobCost = () => {
    const materialCost = blueprint.baseMaterials.reduce((sum, mat) => sum + (mat.totalValue * jobRuns), 0);
    const facilityTax = materialCost * 0.02; // 2% facility tax
    return materialCost + facilityTax;
  };

  const calculateJobTime = () => {
    const baseTime = blueprint.baseTime;
    const teBonus = blueprint.timeEfficiency / 100;
    const adjustedTime = baseTime * (1 - teBonus) * jobRuns;
    return adjustedTime;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 10) return 'text-green-400';
    if (efficiency >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleStartJob = () => {
    if (onStartJob && selectedFacility) {
      onStartJob(blueprint.id, jobRuns, selectedFacility);
      onOpenChange(false);
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Blueprint Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{blueprint.typeName}</h3>
                {blueprint.isOriginal && <Star size={16} className="text-accent" />}
              </div>
              <p className="text-sm text-muted-foreground">Produces: {blueprint.productTypeName}</p>
            </div>

            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {blueprint.category}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {blueprint.jobType}
              </Badge>
              {blueprint.isOriginal && (
                <Badge className="text-xs bg-accent/20 text-accent border-accent/30">
                  Original
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Material Efficiency</p>
                <p className={`text-lg font-bold ${getEfficiencyColor(blueprint.materialEfficiency)}`}>
                  {blueprint.materialEfficiency}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Efficiency</p>
                <p className={`text-lg font-bold ${getEfficiencyColor(blueprint.timeEfficiency)}`}>
                  {blueprint.timeEfficiency}%
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Base Production Time</p>
              <p className="text-lg font-medium">{formatTime(blueprint.baseTime)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Estimated Value</p>
              <p className="text-xl font-bold text-accent">{formatISK(blueprint.estimatedValue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Location & Ownership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{blueprint.location}</p>
              <p className="text-xs text-muted-foreground">ID: {blueprint.locationId}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">{blueprint.ownerName}</p>
              <p className="text-xs text-muted-foreground">ID: {blueprint.ownerId}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Runs Available</p>
              <p className="font-medium">
                {blueprint.runs === -1 ? 'Unlimited (Original)' : `${blueprint.runs}/${blueprint.maxRuns}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const MaterialsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Base Material Requirements</h3>
        <p className="text-sm text-muted-foreground">Per unit with {blueprint.materialEfficiency}% ME</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table className="data-table">
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blueprint.baseMaterials.map((material, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{material.typeName}</TableCell>
                <TableCell>{material.quantity.toLocaleString()}</TableCell>
                <TableCell className={material.available >= material.quantity ? 'text-green-400' : 'text-red-400'}>
                  {material.available.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">
                    {material.category}
                  </Badge>
                </TableCell>
                <TableCell>{formatISK(material.unitPrice)}</TableCell>
                <TableCell>{formatISK(material.totalValue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {blueprint.baseMaterials.reduce((sum, mat) => sum + mat.quantity, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Materials</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {formatISK(blueprint.baseMaterials.reduce((sum, mat) => sum + mat.totalValue, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Material Cost</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {Math.round((blueprint.baseMaterials.filter(mat => mat.available >= mat.quantity).length / blueprint.baseMaterials.length) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ProductionTab = () => (
    <div className="space-y-6">
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator size={20} />
            Production Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="runs">Number of Runs</Label>
              <Input
                id="runs"
                type="number"
                value={jobRuns}
                onChange={(e) => setJobRuns(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={blueprint.runs === -1 ? 1000 : blueprint.runs}
              />
            </div>
            <div>
              <Label htmlFor="facility">Production Facility</Label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jita">Jita IV - Moon 4 - Caldari Navy Assembly Plant</SelectItem>
                  <SelectItem value="amarr">Amarr VIII (Oris) - Emperor Family Academy</SelectItem>
                  <SelectItem value="dodixie">Dodixie IX - Moon 20 - Federation Navy Assembly Plant</SelectItem>
                  <SelectItem value="rens">Rens VI - Moon 8 - Brutor Tribe Treasury</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{jobRuns}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{formatISK(calculateJobCost())}</p>
              <p className="text-sm text-muted-foreground">Total Cost</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{formatTime(calculateJobTime())}</p>
              <p className="text-sm text-muted-foreground">Production Time</p>
            </div>
          </div>

          <Button 
            onClick={handleStartJob} 
            disabled={!selectedFacility}
            className="w-full"
          >
            <Factory size={16} className="mr-2" />
            Start Manufacturing Job
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={20} />
            Blueprint Details: {blueprint.typeName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 w-fit bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsTab />
          </TabsContent>

          <TabsContent value="production">
            <ProductionTab />
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline">
            <Wrench size={16} className="mr-2" />
            Research
          </Button>
          <Button variant="outline">
            <Copy size={16} className="mr-2" />
            Copy Blueprint
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}