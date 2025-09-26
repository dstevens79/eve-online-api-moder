import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LoginPrompt } from '@/components/LoginPrompt';
import { useKV } from '@github/spark/hooks';
import { useEVEData } from '@/hooks/useEVEData';
import { useAuth } from '@/lib/auth-provider';
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
  Copy,
  Star,
  CheckCircle,
  ArrowClockwise,
  Globe,
  Users
} from '@phosphor-icons/react';
import { ManufacturingJob, Blueprint, ProductionPlan, CorpSettings, ManufacturingTask, Member } from '@/lib/types';
import { JobDetailsDialog } from '@/components/manufacturing/JobDetailsDialog';
import { BlueprintDetailsDialog } from '@/components/manufacturing/BlueprintDetailsDialog';
import { ProductionPlanDialog } from '@/components/manufacturing/ProductionPlanDialog';
import { TaskAssignmentDialog } from '@/components/manufacturing/TaskAssignmentDialog';
import { TaskManagementView } from '@/components/manufacturing/TaskManagementView';
import { PointsManagement } from '@/components/manufacturing/PointsManagement';
import { toast } from 'sonner';

interface ManufacturingProps {
  onLoginClick?: () => void;
  isMobileView?: boolean;
}

export function Manufacturing({ onLoginClick, isMobileView }: ManufacturingProps) {
  const { user } = useAuth();
  const [activeJobs, setActiveJobs] = useKV<ManufacturingJob[]>('manufacturing-jobs', []);
  const [blueprints, setBlueprints] = useKV<Blueprint[]>('blueprints-library', []);
  const [productionPlans, setProductionPlans] = useKV<ProductionPlan[]>('production-plans', []);
  const [manufacturingTasks, setManufacturingTasks] = useKV<ManufacturingTask[]>('manufacturing-tasks', []);
  const [members] = useKV<Member[]>('corp-members', []);
  const [settings] = useKV<CorpSettings>('corp-settings', {
    corpName: 'Test Alliance Please Ignore',
    corpTicker: 'TEST',
    corpId: 498125261,
    timezone: 'UTC',
    language: 'en',
    sessionTimeout: true,
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
    },
    sudoDatabase: {
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      ssl: false
    }
  });

  const [selectedTab, setSelectedTab] = useState('administration'); // Start with administration tab
  const [newJobDialogOpen, setNewJobDialogOpen] = useState(false);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [blueprintDetailsOpen, setBlueprintDetailsOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [taskAssignmentOpen, setTaskAssignmentOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ManufacturingJob | null>(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [editingTask, setEditingTask] = useState<ManufacturingTask | null>(null);

  // Initialize sample data if empty
  React.useEffect(() => {
    // Sample members for task assignment
    if ((members || []).length === 0) {
      const sampleMembers: Member[] = [
        {
          id: 1,
          characterId: 91316135,
          characterName: 'Director Smith',
          name: 'Director Smith',
          corporationId: 498125261,
          corporationName: 'Test Alliance Please Ignore',
          roles: ['Director', 'Manager'],
          titles: ['Fleet Commander', 'Manufacturing Director'],
          title: 'Manufacturing Director',
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          location: 'Jita IV - Moon 4',
          ship: 'Buzzard',
          isActive: true,
          accessLevel: 'director',
          joinedDate: '2023-01-15',
          totalSkillPoints: 85000000,
          securityStatus: 5.0
        },
        {
          id: 2,
          characterId: 456789123,
          characterName: 'Pilot Johnson',
          name: 'Pilot Johnson',
          corporationId: 498125261,
          corporationName: 'Test Alliance Please Ignore',
          roles: ['Member'],
          titles: ['Industrialist'],
          title: 'Industrialist',
          lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          location: 'Dodixie IX - Moon 20',
          ship: 'Retriever',
          isActive: true,
          accessLevel: 'member',
          joinedDate: '2023-03-22',
          totalSkillPoints: 45000000,
          securityStatus: 2.1
        },
        {
          id: 3,
          characterId: 789456321,
          characterName: 'Pilot Anderson',
          name: 'Pilot Anderson',
          corporationId: 498125261,
          corporationName: 'Test Alliance Please Ignore',
          roles: ['Member'],
          titles: ['Manufacturer'],
          title: 'Manufacturer',
          lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          location: 'Rens VI - Moon 8',
          ship: 'Hulk',
          isActive: true,
          accessLevel: 'member',
          joinedDate: '2023-05-10',
          totalSkillPoints: 52000000,
          securityStatus: 1.8
        },
        {
          id: 4,
          characterId: 321654987,
          characterName: 'Captain Rodriguez',
          name: 'Captain Rodriguez',
          corporationId: 498125261,
          corporationName: 'Test Alliance Please Ignore',
          roles: ['Member'],
          titles: ['PvP Specialist'],
          title: 'PvP Specialist',
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          location: 'Unknown',
          ship: 'Interceptor',
          isActive: true,
          accessLevel: 'member',
          joinedDate: '2023-02-28',
          totalSkillPoints: 68000000,
          securityStatus: -2.5
        }
      ];
      
      // Save sample members to KV storage for other components to use
      spark.kv.set('corp-members', sampleMembers);
    }
    // Sample blueprints
    if ((blueprints || []).length === 0) {
      const sampleBlueprints: Blueprint[] = [
        {
          id: 'bp-1',
          typeId: 644,
          typeName: 'Caracal Blueprint',
          location: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
          materialEfficiency: 10,
          timeEfficiency: 20,
          runs: -1,
          isOriginal: true,
          category: 'Ship',
          estimatedValue: 15000000,
          productTypeId: 621,
          productTypeName: 'Caracal',
          baseTime: 3600,
          jobType: 'manufacturing',
          baseMaterials: [
            { typeId: 34, typeName: 'Tritanium', quantity: 2800000, totalValue: 8400000, unitPrice: 3 },
            { typeId: 35, typeName: 'Pyerite', quantity: 700000, totalValue: 2100000, unitPrice: 3 },
            { typeId: 36, typeName: 'Mexallon', quantity: 175000, totalValue: 1750000, unitPrice: 10 },
            { typeId: 37, typeName: 'Isogen', quantity: 43750, totalValue: 875000, unitPrice: 20 },
            { typeId: 38, typeName: 'Nocxium', quantity: 8750, totalValue: 525000, unitPrice: 60 },
            { typeId: 39, typeName: 'Zydrine', quantity: 2200, totalValue: 396000, unitPrice: 180 },
            { typeId: 40, typeName: 'Megacyte', quantity: 550, totalValue: 143000, unitPrice: 260 }
          ]
        },
        {
          id: 'bp-2',
          typeId: 1034,
          typeName: 'Vexor Blueprint',
          location: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
          materialEfficiency: 8,
          timeEfficiency: 16,
          runs: -1,
          isOriginal: true,
          category: 'Ship',
          estimatedValue: 22000000,
          productTypeId: 1031,
          productTypeName: 'Vexor',
          baseTime: 5400,
          jobType: 'manufacturing',
          baseMaterials: [
            { typeId: 34, typeName: 'Tritanium', quantity: 3200000, totalValue: 9600000, unitPrice: 3 },
            { typeId: 35, typeName: 'Pyerite', quantity: 800000, totalValue: 2400000, unitPrice: 3 },
            { typeId: 36, typeName: 'Mexallon', quantity: 200000, totalValue: 2000000, unitPrice: 10 },
            { typeId: 37, typeName: 'Isogen', quantity: 50000, totalValue: 1000000, unitPrice: 20 },
            { typeId: 38, typeName: 'Nocxium', quantity: 10000, totalValue: 600000, unitPrice: 60 }
          ]
        },
        {
          id: 'bp-3',
          typeId: 12745,
          typeName: 'Hammerhead II Blueprint',
          location: 'Rens VI - Moon 8 - Brutor Tribe Treasury',
          materialEfficiency: 10,
          timeEfficiency: 20,
          runs: 10,
          maxRuns: 10,
          isOriginal: false,
          category: 'Drone',
          estimatedValue: 5000000,
          productTypeId: 12742,
          productTypeName: 'Hammerhead II',
          baseTime: 1800,
          jobType: 'manufacturing',
          baseMaterials: [
            { typeId: 12744, typeName: 'Hammerhead I', quantity: 1, totalValue: 50000, unitPrice: 50000 },
            { typeId: 34, typeName: 'Tritanium', quantity: 500000, totalValue: 1500000, unitPrice: 3 },
            { typeId: 36, typeName: 'Mexallon', quantity: 25000, totalValue: 250000, unitPrice: 10 }
          ]
        }
      ];
      setBlueprints(sampleBlueprints);
    }

    // Sample manufacturing tasks
    if ((manufacturingTasks || []).length === 0) {
      const sampleTasks: ManufacturingTask[] = [
        {
          id: 'task-1',
          title: 'Produce Caracal Cruisers for Fleet Op',
          description: 'We need 5 Caracal cruisers for next week\'s fleet operation. Standard fit with T2 modules. Deadline is Friday.',
          taskType: 'manufacturing',
          priority: 'high',
          status: 'assigned',
          targetItem: {
            typeId: 621,
            typeName: 'Caracal',
            quantity: 5
          },
          blueprintId: 644,
          blueprintName: 'Caracal Blueprint',
          runs: 5,
          materialEfficiency: 10,
          timeEfficiency: 20,
          
          createdBy: 'corp-director-123',
          createdByName: 'Director Smith',
          createdDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'pilot-456',
          assignedToName: 'Pilot Johnson',
          assignedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          assignedBy: 'corp-director-123',
          assignedByName: 'Director Smith',
          
          materials: [
            { typeId: 34, typeName: 'Tritanium', quantity: 14000000, totalValue: 42000000, unitPrice: 3 },
            { typeId: 35, typeName: 'Pyerite', quantity: 3500000, totalValue: 10500000, unitPrice: 3 },
            { typeId: 36, typeName: 'Mexallon', quantity: 875000, totalValue: 8750000, unitPrice: 10 }
          ],
          estimatedCost: 61250000,
          estimatedDuration: 18000,
          suggestedLocation: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
          
          reward: {
            type: 'fixed',
            amount: 75000000,
            paymentStatus: 'pending'
          },
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          
          corporationId: 498125261,
          corporationName: 'Test Alliance Please Ignore',
          tags: ['fleet-op', 'urgent', 'pvp'],
          progressNotes: [
            '[' + new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString() + '] Pilot Johnson: Started gathering materials. Have 80% of required minerals.',
            '[' + new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleString() + '] Pilot Johnson: All materials acquired. Starting production runs tomorrow.'
          ]
        },
        {
          id: 'task-2',
          title: 'Research Vexor Blueprint ME/TE',
          description: 'Research the Vexor blueprint to ME 10 and TE 20 for more efficient production.',
          taskType: 'research',
          priority: 'normal',
          status: 'pending',
          targetItem: {
            typeId: 1034,
            typeName: 'Vexor Blueprint',
            quantity: 1
          },
          blueprintId: 1034,
          blueprintName: 'Vexor Blueprint',
          runs: 1,
          
          createdBy: 'corp-director-123',
          createdByName: 'Director Smith',
          createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          
          materials: [],
          estimatedCost: 5000000,
          estimatedDuration: 172800, // 48 hours
          suggestedLocation: 'Any Research Facility',
          
          reward: {
            type: 'fixed',
            amount: 25000000,
            paymentStatus: 'pending'
          },
          
          corporationId: 498125261,
          corporationName: 'Test Alliance Please Ignore',
          tags: ['research', 'blueprint-optimization']
        },
        {
          id: 'task-3',
          title: 'T2 Drone Production Run',
          description: 'Produce 50 Hammerhead II drones for corp hangar. We have the BPC ready.',
          taskType: 'manufacturing',
          priority: 'urgent',
          status: 'in_progress',
          targetItem: {
            typeId: 12742,
            typeName: 'Hammerhead II',
            quantity: 50
          },
          blueprintId: 12745,
          blueprintName: 'Hammerhead II Blueprint',
          runs: 50,
          materialEfficiency: 10,
          timeEfficiency: 20,
          
          createdBy: 'corp-director-123',
          createdByName: 'Director Smith',
          createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'pilot-789',
          assignedToName: 'Pilot Anderson',
          assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignedBy: 'corp-director-123',
          assignedByName: 'Director Smith',
          startedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          
          materials: [
            { typeId: 12744, typeName: 'Hammerhead I', quantity: 50, totalValue: 2500000, unitPrice: 50000 },
            { typeId: 34, typeName: 'Tritanium', quantity: 25000000, totalValue: 75000000, unitPrice: 3 },
            { typeId: 36, typeName: 'Mexallon', quantity: 1250000, totalValue: 12500000, unitPrice: 10 }
          ],
          estimatedCost: 90000000,
          estimatedDuration: 90000, // 25 hours
          suggestedLocation: 'Any Manufacturing Station',
          
          reward: {
            type: 'percentage',
            amount: 15,
            paymentStatus: 'pending'
          },
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          
          corporationId: 498125261,
          corporationName: 'Test Alliance Please Ignore',
          tags: ['drones', 't2-production', 'urgent'],
          progressNotes: [
            '[' + new Date(Date.now() - 18 * 60 * 60 * 1000).toLocaleString() + '] Pilot Anderson: Production started. Running 10 parallel jobs.',
            '[' + new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString() + '] Pilot Anderson: 20 drones completed, 30 remaining.',
            '[' + new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString() + '] Pilot Anderson: 35 drones done. Should finish by tomorrow.'
          ]
        }
      ];
      setManufacturingTasks(sampleTasks);
    }
  }, [blueprints, manufacturingTasks, setBlueprints, setManufacturingTasks]);

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

  const handleCreateTask = (task: ManufacturingTask) => {
    if (editingTask) {
      // Update existing task
      setManufacturingTasks(current => 
        (current || []).map(t => t.id === task.id ? task : t)
      );
    } else {
      // Create new task
      setManufacturingTasks(current => [...(current || []), task]);
    }
    setEditingTask(null);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<ManufacturingTask>) => {
    setManufacturingTasks(current => 
      (current || []).map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleEditTask = (task: ManufacturingTask) => {
    setEditingTask(task);
    setTaskAssignmentOpen(true);
  };

  const openNewTaskDialog = () => {
    setEditingTask(null);
    setTaskAssignmentOpen(true);
  };

  // Show login prompt if not authenticated - TEMPORARILY DISABLED FOR DEBUG
  if (!user && onLoginClick && false) { // Added && false to disable this check
    return (
      <LoginPrompt 
        onLoginClick={onLoginClick || (() => {})}
        title="Manufacturing Operations"
        description="Sign in to manage your corporation's manufacturing jobs and blueprints"
      />
    );
  }

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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                <p className="text-sm text-muted-foreground">Assigned Tasks</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(manufacturingTasks || []).filter(t => t.status === 'assigned' || t.status === 'in_progress').length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total: {(manufacturingTasks || []).length}
                </p>
              </div>
              <Users size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blueprints</p>
                <p className="text-2xl font-bold text-purple-400">{(blueprints || []).length}</p>
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
        <TabsList className="grid grid-cols-2 w-fit bg-muted">
          <TabsTrigger value="administration">Administration</TabsTrigger>
          <TabsTrigger value="jobs">Job Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="administration">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Manufacturing Administration</h3>
                <p className="text-sm text-muted-foreground">
                  Create and assign manufacturing tasks to corporation members
                </p>
              </div>
              <Button onClick={openNewTaskDialog}>
                <Plus size={16} className="mr-2" />
                Assign New Task
              </Button>
            </div>

            {/* Task Management Subtabs */}
            <Tabs defaultValue="tasks" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-fit bg-muted/50">
                <TabsTrigger value="tasks">Task Assignment</TabsTrigger>
                <TabsTrigger value="blueprints">Blueprints</TabsTrigger>
                <TabsTrigger value="plans">Production Plans</TabsTrigger>
                <TabsTrigger value="points">Points System</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks">
                <TaskManagementView
                  tasks={manufacturingTasks || []}
                  members={members || []}
                  onUpdateTask={handleUpdateTask}
                  onEditTask={handleEditTask}
                  isMobileView={isMobileView}
                />
              </TabsContent>

              <TabsContent value="blueprints">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Blueprint Library</h4>
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

              <TabsContent value="plans">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Production Plans</h4>
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

              <TabsContent value="points">
                <PointsManagement 
                  members={members || []}
                  isMobileView={isMobileView}
                />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="jobs">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Manufacturing Job Activity</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor ongoing production activities and assigned tasks
                </p>
              </div>
              <Button onClick={() => setNewJobDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                Start New Job
              </Button>
            </div>

            {/* Job Activity Tabs with Filters */}
            <Tabs defaultValue="my-tasks" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-fit bg-muted/50">
                <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
                <TabsTrigger value="all-tasks">All Corp Tasks</TabsTrigger>
                <TabsTrigger value="manufacturing-jobs">Active Jobs</TabsTrigger>
              </TabsList>

              {/* My assigned tasks */}
              <TabsContent value="my-tasks">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-green-400 border-green-500/50">
                      Tasks assigned to {user?.characterName || 'me'}
                    </Badge>
                  </div>
                  
                  {(() => {
                    const myTasks = (manufacturingTasks || []).filter(task => 
                      task.assignedTo && (task.assignedTo === user?.characterId?.toString() || task.assignedToName === user?.characterName)
                    );
                    
                    if (myTasks.length === 0) {
                      return (
                        <Card className="bg-card border-border">
                          <CardContent className="p-6">
                            <div className="text-center py-12">
                              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                              <h4 className="text-lg font-semibold mb-2">No Tasks Assigned</h4>
                              <p className="text-muted-foreground">
                                You don't have any manufacturing tasks assigned to you yet.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    return (
                      <div className="grid gap-4">
                        {myTasks.map((task) => (
                          <Card key={task.id} className="bg-card border-border">
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-2">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <Factory size={18} />
                                        {task.title}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">{task.description}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Target: {task.targetItem.quantity}x {task.targetItem.typeName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Assigned by {task.assignedByName} on {new Date(task.assignedDate || '').toLocaleDateString()}
                                      </p>
                                    </div>
                                    {getStatusBadge(task.status, task.priority)}
                                  </div>
                                  
                                  {task.deadline && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Deadline: </span>
                                      <span className={new Date(task.deadline) < new Date() ? 'text-red-400' : 'text-foreground'}>
                                        {new Date(task.deadline).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  <div className="text-sm">
                                    <p className="text-muted-foreground">Estimated Cost</p>
                                    <p className="text-foreground font-medium">{formatISK(task.estimatedCost)}</p>
                                  </div>
                                  <div className="text-sm">
                                    <p className="text-muted-foreground">Reward</p>
                                    <p className="text-green-400 font-medium">
                                      {task.reward.type === 'fixed' 
                                        ? formatISK(task.reward.amount) 
                                        : `${task.reward.amount}%`
                                      }
                                    </p>
                                  </div>
                                  <div className="text-sm">
                                    <p className="text-muted-foreground">Duration</p>
                                    <p className="text-foreground">{Math.round(task.estimatedDuration / 3600)}h</p>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="justify-start"
                                    onClick={() => handleEditTask(task)}
                                  >
                                    <Eye size={14} className="mr-2" />
                                    View Details
                                  </Button>
                                  {task.status === 'assigned' && (
                                    <Button variant="outline" size="sm" className="justify-start text-green-400">
                                      <Play size={14} className="mr-2" />
                                      Start Task
                                    </Button>
                                  )}
                                  {task.status === 'in_progress' && (
                                    <Button variant="outline" size="sm" className="justify-start text-blue-400">
                                      <Clock size={14} className="mr-2" />
                                      Update Progress
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              {task.progressNotes && task.progressNotes.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Progress Notes:</p>
                                  <div className="space-y-1">
                                    {task.progressNotes.slice(-2).map((note, index) => (
                                      <p key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                        {note}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>

              {/* All corporation tasks */}
              <TabsContent value="all-tasks">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                      All corporation manufacturing tasks
                    </Badge>
                  </div>
                  
                  {(manufacturingTasks || []).length === 0 ? (
                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="text-center py-12">
                          <Factory size={48} className="mx-auto text-muted-foreground mb-4" />
                          <h4 className="text-lg font-semibold mb-2">No Manufacturing Tasks</h4>
                          <p className="text-muted-foreground">
                            No manufacturing tasks have been created yet.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {(manufacturingTasks || []).map((task) => (
                        <Card key={task.id} className="bg-card border-border">
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                              <div className="lg:col-span-2">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                      <Factory size={18} />
                                      {task.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Target: {task.targetItem.quantity}x {task.targetItem.typeName}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                      <span>Created by {task.createdByName}</span>
                                      {task.assignedToName && (
                                        <span>Assigned to {task.assignedToName}</span>
                                      )}
                                    </div>
                                  </div>
                                  {getStatusBadge(task.status, task.priority)}
                                </div>
                                
                                {task.deadline && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Deadline: </span>
                                    <span className={new Date(task.deadline) < new Date() ? 'text-red-400' : 'text-foreground'}>
                                      {new Date(task.deadline).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <div className="text-sm">
                                  <p className="text-muted-foreground">Estimated Cost</p>
                                  <p className="text-foreground font-medium">{formatISK(task.estimatedCost)}</p>
                                </div>
                                <div className="text-sm">
                                  <p className="text-muted-foreground">Reward</p>
                                  <p className="text-green-400 font-medium">
                                    {task.reward.type === 'fixed' 
                                      ? formatISK(task.reward.amount) 
                                      : `${task.reward.amount}%`
                                    }
                                  </p>
                                </div>
                                <div className="text-sm">
                                  <p className="text-muted-foreground">Duration</p>
                                  <p className="text-foreground">{Math.round(task.estimatedDuration / 3600)}h</p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="justify-start"
                                  onClick={() => handleEditTask(task)}
                                >
                                  <Eye size={14} className="mr-2" />
                                  View Details
                                </Button>
                                {/* Show admin actions for directors/managers */}
                                {user && ['director', 'manager'].includes(user.role || '') && (
                                  <>
                                    {!task.assignedTo && (
                                      <Button variant="outline" size="sm" className="justify-start text-blue-400">
                                        <Users size={14} className="mr-2" />
                                        Assign Task
                                      </Button>
                                    )}
                                    <Button variant="outline" size="sm" className="justify-start">
                                      <Wrench size={14} className="mr-2" />
                                      Edit Task
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {task.progressNotes && task.progressNotes.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Latest Updates:</p>
                                <div className="space-y-1">
                                  {task.progressNotes.slice(-1).map((note, index) => (
                                    <p key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                      {note}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Active manufacturing jobs */}
              <TabsContent value="manufacturing-jobs">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-purple-400 border-purple-500/50">
                      Active manufacturing jobs
                    </Badge>
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
                                    <p className="text-xs text-muted-foreground">Installer: {job.installerName}</p>
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
                                  <p className="text-muted-foreground">Duration</p>
                                  <p className="text-foreground">{Math.round(job.duration / 3600)}h</p>
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
            </Tabs>
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

      <TaskAssignmentDialog
        open={taskAssignmentOpen}
        onOpenChange={setTaskAssignmentOpen}
        blueprints={blueprints || []}
        members={members || []}
        onCreateTask={handleCreateTask}
        editTask={editingTask}
      />
    </div>
  );
}