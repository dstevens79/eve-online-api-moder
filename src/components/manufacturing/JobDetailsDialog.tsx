import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock, 
  Package, 
  MapPin, 
  User, 
  TrendUp,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  Stop,
  Eye
} from '@phosphor-icons/react';
import { ManufacturingJob, MaterialRequirement } from '@/lib/types';

interface JobDetailsDialogProps {
  job: ManufacturingJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobUpdate?: (jobId: string, updates: Partial<ManufacturingJob>) => void;
}

export function JobDetailsDialog({ job, open, onOpenChange, onJobUpdate }: JobDetailsDialogProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!job) return null;

  const getJobProgress = () => {
    const start = new Date(job.startDate).getTime();
    const end = new Date(job.endDate).getTime();
    const now = Date.now();
    const progress = Math.min(Math.max(((now - start) / (end - start)) * 100, 0), 100);
    return progress;
  };

  const getTimeRemaining = () => {
    const end = new Date(job.endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    
    if (diff <= 0) return 'Completed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const formatISK = (amount: number) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B ISK`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M ISK`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(0)}K ISK`;
    return `${Math.round(amount)} ISK`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const handleJobAction = async (action: string) => {
    setActionLoading(action);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let newStatus = job.status;
    switch (action) {
      case 'pause':
        newStatus = 'paused';
        break;
      case 'resume':
        newStatus = 'active';
        break;
      case 'cancel':
        newStatus = 'cancelled';
        break;
    }
    
    if (onJobUpdate) {
      onJobUpdate(job.id, { status: newStatus });
    }
    
    setActionLoading(null);
  };

  const getMaterialStatus = (material: MaterialRequirement) => {
    const percentage = (material.available / material.quantity) * 100;
    if (percentage >= 100) return { color: 'text-green-400', icon: CheckCircle };
    if (percentage >= 50) return { color: 'text-yellow-400', icon: AlertTriangle };
    return { color: 'text-red-400', icon: AlertTriangle };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={20} />
            Manufacturing Job Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Job Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{job.productTypeName}</h3>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{job.blueprintName}</p>
                  <p className="text-sm font-medium mt-1">Quantity: {job.productQuantity}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Material Efficiency</p>
                    <p className="text-lg font-bold text-blue-400">{job.materialEfficiency}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Efficiency</p>
                    <p className="text-lg font-bold text-green-400">{job.timeEfficiency}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-bold text-accent">{formatISK(job.cost)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progress & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{Math.round(getJobProgress())}%</span>
                  </div>
                  <Progress value={getJobProgress()} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium">{new Date(job.startDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ends</p>
                    <p className="font-medium">{new Date(job.endDate).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Time Remaining</p>
                  <p className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Clock size={16} />
                    {getTimeRemaining()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location & Installer */}
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Location & Personnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Manufacturing Facility</p>
                    <p className="text-sm text-muted-foreground">{job.facility}</p>
                    <p className="text-xs text-muted-foreground">ID: {job.facilityId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User size={20} className="text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Installer</p>
                    <p className="text-sm text-muted-foreground">{job.installerName}</p>
                    <p className="text-xs text-muted-foreground">ID: {job.installerId}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials */}
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Material Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="data-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {job.materials.map((material, index) => {
                      const status = getMaterialStatus(material);
                      const StatusIcon = status.icon;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{material.typeName}</TableCell>
                          <TableCell>{material.quantity.toLocaleString()}</TableCell>
                          <TableCell>{material.available.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-2 ${status.color}`}>
                              <StatusIcon size={16} />
                              {material.available >= material.quantity ? 'Available' : 'Shortage'}
                            </div>
                          </TableCell>
                          <TableCell>{formatISK(material.unitPrice)}</TableCell>
                          <TableCell>{formatISK(material.totalValue)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {job.status === 'active' && (
              <Button 
                variant="outline" 
                onClick={() => handleJobAction('pause')}
                disabled={actionLoading === 'pause'}
              >
                <Pause size={16} className="mr-2" />
                {actionLoading === 'pause' ? 'Pausing...' : 'Pause Job'}
              </Button>
            )}
            {job.status === 'paused' && (
              <Button 
                variant="outline" 
                onClick={() => handleJobAction('resume')}
                disabled={actionLoading === 'resume'}
              >
                <Play size={16} className="mr-2" />
                {actionLoading === 'resume' ? 'Resuming...' : 'Resume Job'}
              </Button>
            )}
            {(job.status === 'active' || job.status === 'paused') && (
              <Button 
                variant="destructive" 
                onClick={() => handleJobAction('cancel')}
                disabled={actionLoading === 'cancel'}
              >
                <Stop size={16} className="mr-2" />
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Job'}
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}