import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useKV } from '@github/spark/hooks';
import { useEVEData } from '@/hooks/useEVEData';
import { 
  Factory, 
  Plus, 
  Clock, 
  Package, 
  TrendUp,
  Pause,
  Play,
  Stop,
  Eye,
  Calendar,
  Wrench,
  Flask,
  Copy,
  Star,
  Warning,
  CheckCircle,
  ArrowClockwise,
  Globe
} from '@phosphor-icons/react';
import { ManufacturingJob, Blueprint, ProductionPlan, MaterialRequirement, CorpSettings } from '@/lib/types';
import { JobDetailsDialog } from '@/components/manufacturing/JobDetailsDialog';
import { BlueprintDetailsDialog } from '@/components/manufacturing/BlueprintDetailsDialog';
import { ProductionPlanDialog } from '@/components/manufacturing/ProductionPlanDialog';
import { toast } from 'sonner';

export function Manufacturing() {
  const [activeJobs, setActiveJobs] = useKV<ManufacturingJob[]>('manufacturing-jobs', []);
  const [blueprints, setBlueprints] = useKV<Blueprint[]>('blueprints-library', []);
  const [productionPlans, setProductionPlans] = useKV<ProductionPlan[]>('production-plans', []);
  const [settings] = useKV<CorpSettings>('corp-settings', {
    corpName: 'Test Alliance Please Ignore',
    corpTicker: 'TEST',
    corpId: 498125261,
    timezone: 'UTC',
    language: 'en',
    notifications: {
      manufacturing: true,
      mining: true,
      killmails: false,
      markets: true,
    },
    eveOnlineSync: {
      enabled: true,
      autoSync: false,
      syncInterval: 30,
      lastSync: new Date().toISOString(),
      characterId: 91316135,
      corporationId: 498125261
    },
    dataSyncTimers: {
      members: 60,
      assets: 30,
      manufacturing: 15,
      mining: 45,
      market: 10,
      killmails: 120,
      income: 30
    },
    database: {
      host: 'localhost',
      port: 3306,
      database: 'lmeve',
      username: 'lmeve_user',
      password: '',
      ssl: false,
      connectionPoolSize: 10,
      queryTimeout: 30,
      autoReconnect: true,
      charset: 'utf8mb4'
    }
  });

  const [selectedTab, setSelectedTab] = useState('jobs');
  const [newJobDialogOpen, setNewJobDialogOpen] = useState(false);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [blueprintDetailsOpen, setBlueprintDetailsOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ManufacturingJob | null>(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);

  const eveOnlineSync = settings?.eveOnlineSync || {
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    characterId: 91316135,
    corporationId: 498125261
  };

  const eveDataHook = useEVEData(
    eveOnlineSync.corporationId,
    eveOnlineSync.characterId
  );

  const eveData = eveDataHook?.data;
  const isLoading = eveDataHook?.data?.isLoading || false;
  const refreshIndustryJobs = eveDataHook?.refreshIndustryJobs;

  const safeEveData = eveData || {
    industryJobs: [],
    blueprints: [],
    lastUpdate: null,
    isLoading: false
  };

  // Helper functions
  const formatISK = (amount: number): string => {
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(1)}T ISK`;
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}B ISK`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M ISK`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(0)}K ISK`;
    return `${Math.round(amount)} ISK`;
  };

  const getJobProgress = (job: ManufacturingJob): number => {
    const now = new Date().getTime();
    const start = new Date(job.startDate).getTime();
    const end = new Date(job.endDate).getTime();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const getTimeRemaining = (endDate: string): string => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const remaining = end - now;
    
    if (remaining <= 0) return 'Completed';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string, priority: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400 border-green-500/50',
      paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
      ready: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      delivered: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    };

    const priorityColors: Record<string, string> = {
      low: 'ml-2 bg-gray-500/20 text-gray-400 border-gray-500/50',
      normal: 'ml-2 bg-blue-500/20 text-blue-400 border-blue-500/50',
      high: 'ml-2 bg-orange-500/20 text-orange-400 border-orange-500/50',
      urgent: 'ml-2 bg-red-500/20 text-red-400 border-red-500/50'
    };

    return (
      <div className="flex">
        <Badge variant="outline" className={statusColors[status] || statusColors.active}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        {priority !== 'normal' && (
          <Badge variant="outline" className={priorityColors[priority] || priorityColors.normal}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        )}
      </div>
    );
  };

  // Event handlers
  const handleJobUpdate = (jobId: string, updates: Partial<ManufacturingJob>) => {
    setActiveJobs(currentJobs => 
      (currentJobs || []).map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      )
    );
  };

  const handleJobDetails = (job: ManufacturingJob) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  const handleBlueprintDetails = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setBlueprintDetailsOpen(true);
  };

  const handleStartJobFromBlueprint = (blueprintId: string, runs: number, facility: string) => {
    const blueprint = blueprints?.find(bp => bp.id === blueprintId);
    if (!blueprint) return;

    const newJob: ManufacturingJob = {
      id: `job-${Date.now()}`,
      blueprintId: blueprint.typeId,
      blueprintName: blueprint.typeName,
      productTypeId: blueprint.productTypeId,
      productTypeName: blueprint.productTypeName,
      runs,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (blueprint.baseTime * runs * 1000)).toISOString(),
      status: 'active',
      facility,
      facilityId: 60003760,
      installerId: 12345,
      installerName: 'Current User',
      cost: blueprint.baseMaterials.reduce((sum, mat) => sum + (mat.totalValue * runs), 0),
      productQuantity: runs,
      materialEfficiency: blueprint.materialEfficiency,
      timeEfficiency: blueprint.timeEfficiency,
      duration: blueprint.baseTime * runs,
      materials: blueprint.baseMaterials.map(mat => ({
        ...mat,
        quantity: mat.quantity * runs,
        totalValue: mat.totalValue * runs
      })),
      priority: 'normal'
    };

    setActiveJobs(current => [...(current || []), newJob]);
    toast.success(`Started manufacturing job for ${blueprint.typeName}`);
  };

  const handleSaveProductionPlan = (plan: ProductionPlan) => {
    setProductionPlans(current => [...(current || []), plan]);
    toast.success(`Production plan "${plan.name}" created successfully`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Factory size={24} />
          Manufacturing Operations
        </h2>
        <p className="text-muted-foreground">
          Manage manufacturing jobs, blueprints, and production scheduling
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold text-green-400">
                  {(activeJobs || []).filter(j => j.status === 'active').length}
                </p>
                {safeEveData.industryJobs.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    EVE: {safeEveData.industryJobs.filter((j: any) => j.status === 'active').length}
                  </p>
                )}
              </div>
              <Factory size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blueprints</p>
                <p className="text-2xl font-bold text-blue-400">{(blueprints || []).length}</p>
                {safeEveData.blueprints.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    EVE: {safeEveData.blueprints.length}
                  </p>
                )}
              </div>
              <Package size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold text-accent">
                  {formatISK((activeJobs || []).reduce((sum, job) => sum + job.cost, 0))}
                </p>
              </div>
              <TrendUp size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-green-400">94%</p>
              </div>
              <CheckCircle size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">EVE Data</p>
                {eveOnlineSync.enabled ? (
                  <div>
                    <p className="text-sm font-bold text-green-400">Connected</p>
                    {safeEveData.lastUpdate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(safeEveData.lastUpdate).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-muted-foreground">Offline</p>
                )}
              </div>
              <div className="flex flex-col items-center gap-1">
                <Globe size={20} className={eveOnlineSync.enabled ? 'text-green-400' : 'text-muted-foreground'} />
                {eveOnlineSync.enabled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto p-1"
                    onClick={() => refreshIndustryJobs?.()}
                    disabled={isLoading}
                  >
                    <ArrowClockwise size={12} className={isLoading ? 'animate-spin' : ''} />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 w-fit bg-muted">
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="blueprints">Blueprints</TabsTrigger>
          <TabsTrigger value="schedule">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Manufacturing Jobs</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor ongoing production activities
                </p>
              </div>
              <Button onClick={() => setNewJobDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                Start New Job
              </Button>
            </div>

            {(activeJobs || []).length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Factory size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No Active Jobs</h4>
                    <p className="text-muted-foreground mb-4">
                      Start your first manufacturing job to begin production
                    </p>
                    <Button onClick={() => setNewJobDialogOpen(true)}>
                      <Plus size={16} className="mr-2" />
                      Start Manufacturing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(activeJobs || []).map((job) => (
                  <Card key={job.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <Factory size={18} />
                                {job.productTypeName} 
                                <span className="text-muted-foreground">x{job.productQuantity}</span>
                              </h4>
                              <p className="text-sm text-muted-foreground">{job.blueprintName}</p>
                              <p className="text-xs text-muted-foreground mt-1">{job.facility}</p>
                            </div>
                            {getStatusBadge(job.status, job.priority)}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{Math.round(getJobProgress(job))}%</span>
                            </div>
                            <Progress value={getJobProgress(job)} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Started: {new Date(job.startDate).toLocaleDateString()}</span>
                              <span>Remaining: {getTimeRemaining(job.endDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm">
                            <p className="text-muted-foreground">Efficiency</p>
                            <div className="flex gap-4 mt-1">
                              <span className="text-blue-400">ME: {job.materialEfficiency}%</span>
                              <span className="text-green-400">TE: {job.timeEfficiency}%</span>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">Cost</p>
                            <p className="text-foreground font-medium">{formatISK(job.cost)}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">Installer</p>
                            <p className="text-foreground">{job.installerName}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="justify-start"
                            onClick={() => handleJobDetails(job)}
                          >
                            <Eye size={14} className="mr-2" />
                            Details
                          </Button>
                          {job.status === 'active' && (
                            <Button variant="outline" size="sm" className="justify-start">
                              <Pause size={14} className="mr-2" />
                              Pause
                            </Button>
                          )}
                          {job.status === 'paused' && (
                            <Button variant="outline" size="sm" className="justify-start">
                              <Play size={14} className="mr-2" />
                              Resume
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="justify-start text-red-400 hover:text-red-300">
                            <Stop size={14} className="mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="blueprints">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Blueprint Library</h3>
                <p className="text-sm text-muted-foreground">Manage blueprints and research</p>
              </div>
              <Button variant="outline">
                <Plus size={16} className="mr-2" />
                Add Blueprint
              </Button>
            </div>

            {(blueprints || []).length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No Blueprints</h4>
                    <p className="text-muted-foreground mb-4">
                      Add blueprints to your library to start manufacturing
                    </p>
                    <Button variant="outline">
                      <Plus size={16} className="mr-2" />
                      Add Blueprint
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(blueprints || []).map((blueprint) => (
                  <Card key={blueprint.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Package size={18} />
                            {blueprint.typeName}
                            {blueprint.isOriginal && <Star size={14} className="text-accent" />}
                          </h4>
                          <p className="text-sm text-muted-foreground">Produces: {blueprint.productTypeName}</p>
                          <p className="text-xs text-muted-foreground mt-1">{blueprint.location}</p>
                          
                          <div className="flex gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">
                              {blueprint.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {blueprint.jobType}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm">
                            <p className="text-muted-foreground">Research Levels</p>
                            <div className="flex gap-4 mt-1">
                              <span className="text-blue-400">ME: {blueprint.materialEfficiency}</span>
                              <span className="text-green-400">TE: {blueprint.timeEfficiency}</span>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">Runs</p>
                            <p className="text-foreground">{blueprint.runs === -1 ? 'Original' : `${blueprint.runs}/${blueprint.maxRuns}`}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">Base Time</p>
                            <p className="text-foreground">{Math.round(blueprint.baseTime / 60)} minutes</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="justify-start"
                            onClick={() => handleBlueprintDetails(blueprint)}
                          >
                            <Factory size={14} className="mr-2" />
                            Start Job
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <Wrench size={14} className="mr-2" />
                            Research
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <Copy size={14} className="mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Production Plans</h3>
                <p className="text-sm text-muted-foreground">Plan and schedule manufacturing operations</p>
              </div>
              <Button onClick={() => setPlanDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                New Plan
              </Button>
            </div>

            {(productionPlans || []).length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No Production Plans</h4>
                    <p className="text-muted-foreground mb-4">
                      Create your first production plan to optimize manufacturing operations
                    </p>
                    <Button onClick={() => setPlanDialogOpen(true)}>
                      <Plus size={16} className="mr-2" />
                      Create Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(productionPlans || []).map((plan) => (
                  <Card key={plan.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <Package size={18} />
                                {plan.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Target: {plan.targetProduct.quantity}x {plan.targetProduct.typeName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {plan.blueprints.length} blueprint(s) | Created {new Date(plan.createdDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline" className={`text-xs ${
                              plan.status === 'draft' ? 'border-yellow-500/50 text-yellow-400' :
                              plan.status === 'approved' ? 'border-blue-500/50 text-blue-400' :
                              plan.status === 'in_progress' ? 'border-green-500/50 text-green-400' :
                              'border-gray-500/50 text-gray-400'
                            }`}>
                              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1).replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm">
                            <p className="text-muted-foreground">Estimated Cost</p>
                            <p className="text-foreground font-medium">{formatISK(plan.estimatedCost)}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">Estimated Profit</p>
                            <p className={`font-medium ${plan.estimatedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatISK(plan.estimatedProfit)}
                            </p>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">Duration</p>
                            <p className="text-foreground">{Math.round(plan.estimatedDuration / 3600)}h</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" className="justify-start">
                            <Eye size={14} className="mr-2" />
                            View Details
                          </Button>
                          {plan.status === 'draft' && (
                            <Button variant="outline" size="sm" className="justify-start">
                              <Factory size={14} className="mr-2" />
                              Start Production
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="justify-start">
                            <Copy size={14} className="mr-2" />
                            Duplicate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <JobDetailsDialog
        job={selectedJob}
        open={jobDetailsOpen}
        onOpenChange={setJobDetailsOpen}
        onJobUpdate={handleJobUpdate}
      />

      <BlueprintDetailsDialog
        blueprint={selectedBlueprint}
        open={blueprintDetailsOpen}
        onOpenChange={setBlueprintDetailsOpen}
        onStartJob={handleStartJobFromBlueprint}
      />

      <ProductionPlanDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        blueprints={blueprints || []}
        onSavePlan={handleSaveProductionPlan}
      />
    </div>
  );
}