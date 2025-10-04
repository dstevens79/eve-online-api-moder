import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/lib/auth-provider';
import { useLMeveData } from '@/lib/LMeveDataContext';
import {
  Planet,
  Factory,
  Package,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Timer,
  User,
  Building,
  Target,
  TrendUp,
  CurrencyDollar,
  Globe,
  Wrench
} from '@phosphor-icons/react';

interface PIAssignment {
  id: string;
  pilotId: string;
  pilotName: string;
  corporationId?: string;
  planetType: string;
  planetName: string;
  systemName: string;
  securityStatus: number;
  products: PIProduct[];
  assignedDate: string;
  dueDate?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  estimatedIncome: number;
  actualIncome?: number;
  deliveryTracking: PIDelivery[];
  lastESICheck?: string;
  requirements?: string;
}

interface PIProduct {
  typeId: number;
  typeName: string;
  quantity: number;
  delivered: number;
  unitPrice?: number;
  totalValue?: number;
  lastDelivery?: string;
}

interface PIDelivery {
  id: string;
  date: string;
  typeId: number;
  typeName: string;
  quantity: number;
  location: string;
  esiTransactionId?: string;
  value?: number;
  verifiedByESI: boolean;
}

interface PlanetaryInteractionProps {
  isMobileView?: boolean;
}

export function PlanetaryInteraction({ isMobileView = false }: PlanetaryInteractionProps) {
  const { user } = useAuth();
  const { members } = useLMeveData();
  
  // PI data storage
  const [piAssignments, setPiAssignments] = useKV<PIAssignment[]>('pi-assignments', []);
  const [piDeliveries, setPiDeliveries] = useKV<PIDelivery[]>('pi-deliveries', []);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'management'>('overview');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<PIAssignment | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<PIAssignment | null>(null);
  
  // Form state
  const [newAssignment, setNewAssignment] = useState<Partial<PIAssignment>>({
    pilotId: '',
    planetType: '',
    planetName: '',
    systemName: '',
    securityStatus: 0,
    products: [],
    priority: 'normal',
    estimatedIncome: 0,
    notes: ''
  });
  
  const [newProduct, setNewProduct] = useState({
    typeName: '',
    quantity: 0,
    unitPrice: 0
  });

  // Initialize with sample data if empty
  useEffect(() => {
    if (piAssignments.length === 0) {
      const sampleAssignments: PIAssignment[] = [
        {
          id: 'pi-001',
          pilotId: 'pilot-001',
          pilotName: 'John Doe',
          corporationId: 'corp-001',
          planetType: 'Temperate',
          planetName: 'Temperate Planet VII',
          systemName: 'Jita',
          securityStatus: 0.9,
          products: [
            {
              typeId: 2317,
              typeName: 'Robotics',
              quantity: 1000,
              delivered: 750,
              unitPrice: 45000,
              totalValue: 45000000,
              lastDelivery: new Date(Date.now() - 86400000).toISOString()
            },
            {
              typeId: 44,
              typeName: 'Enriched Uranium',
              quantity: 500,
              delivered: 200,
              unitPrice: 8500,
              totalValue: 4250000
            }
          ],
          assignedDate: new Date(Date.now() - 7 * 86400000).toISOString(),
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          status: 'in_progress',
          priority: 'high',
          notes: 'High priority for upcoming manufacturing run',
          estimatedIncome: 49250000,
          actualIncome: 33750000,
          deliveryTracking: [
            {
              id: 'del-001',
              date: new Date(Date.now() - 86400000).toISOString(),
              typeId: 2317,
              typeName: 'Robotics',
              quantity: 750,
              location: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
              value: 33750000,
              verifiedByESI: true,
              esiTransactionId: 'txn-12345'
            }
          ],
          lastESICheck: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'pi-002',
          pilotId: 'pilot-002',
          pilotName: 'Jane Smith',
          planetType: 'Barren',
          planetName: 'Barren Planet III',
          systemName: 'Amarr',
          securityStatus: 1.0,
          products: [
            {
              typeId: 3779,
              typeName: 'Mechanical Parts',
              quantity: 2000,
              delivered: 2000,
              unitPrice: 1200,
              totalValue: 2400000,
              lastDelivery: new Date(Date.now() - 2 * 86400000).toISOString()
            }
          ],
          assignedDate: new Date(Date.now() - 14 * 86400000).toISOString(),
          dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          status: 'completed',
          priority: 'normal',
          estimatedIncome: 2400000,
          actualIncome: 2400000,
          deliveryTracking: [
            {
              id: 'del-002',
              date: new Date(Date.now() - 2 * 86400000).toISOString(),
              typeId: 3779,
              typeName: 'Mechanical Parts',
              quantity: 2000,
              location: 'Amarr VIII (Oris) - Emperor Family Academy',
              value: 2400000,
              verifiedByESI: true,
              esiTransactionId: 'txn-12346'
            }
          ],
          lastESICheck: new Date(Date.now() - 1800000).toISOString()
        }
      ];
      
      setPiAssignments(sampleAssignments);
    }
  }, [piAssignments, setPiAssignments]);

  // Get user's assignments
  const userAssignments = piAssignments.filter(assignment => 
    assignment.pilotName === user?.characterName
  );

  // Get all assignments for management view
  const allAssignments = piAssignments;

  // Calculate statistics
  const getStatistics = () => {
    const total = piAssignments.length;
    const completed = piAssignments.filter(a => a.status === 'completed').length;
    const inProgress = piAssignments.filter(a => a.status === 'in_progress').length;
    const overdue = piAssignments.filter(a => a.status === 'overdue').length;
    const totalEstimatedValue = piAssignments.reduce((sum, a) => sum + a.estimatedIncome, 0);
    const totalActualValue = piAssignments.reduce((sum, a) => sum + (a.actualIncome || 0), 0);
    
    return {
      total,
      completed,
      inProgress,
      overdue,
      totalEstimatedValue,
      totalActualValue,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  };

  const stats = getStatistics();

  const getStatusColor = (status: PIAssignment['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'in_progress':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'overdue':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getPriorityColor = (priority: PIAssignment['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'high':
        return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'normal':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'low':
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const formatISK = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B ISK`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ISK`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K ISK`;
    }
    return `${amount.toLocaleString()} ISK`;
  };

  const getProductProgress = (product: PIProduct) => {
    return product.quantity > 0 ? (product.delivered / product.quantity) * 100 : 0;
  };

  const handleAssignPI = () => {
    if (!newAssignment.pilotId || !newAssignment.planetName || newAssignment.products?.length === 0) {
      toast.error('Please fill in all required fields and add at least one product');
      return;
    }

    const assignment: PIAssignment = {
      id: `pi-${Date.now()}`,
      pilotId: newAssignment.pilotId!,
      pilotName: members?.find(m => m.characterId === newAssignment.pilotId)?.characterName || 'Unknown',
      corporationId: newAssignment.corporationId,
      planetType: newAssignment.planetType!,
      planetName: newAssignment.planetName!,
      systemName: newAssignment.systemName!,
      securityStatus: newAssignment.securityStatus!,
      products: newAssignment.products!,
      assignedDate: new Date().toISOString(),
      dueDate: newAssignment.dueDate,
      status: 'assigned',
      priority: newAssignment.priority!,
      notes: newAssignment.notes,
      estimatedIncome: newAssignment.estimatedIncome!,
      deliveryTracking: [],
      requirements: newAssignment.requirements
    };

    setPiAssignments(prev => [...prev, assignment]);
    
    // Reset form
    setNewAssignment({
      pilotId: '',
      planetType: '',
      planetName: '',
      systemName: '',
      securityStatus: 0,
      products: [],
      priority: 'normal',
      estimatedIncome: 0,
      notes: ''
    });
    
    setShowAssignDialog(false);
    toast.success('Planetary Interaction assignment created successfully');
  };

  const handleAddProduct = () => {
    if (!newProduct.typeName || newProduct.quantity <= 0) {
      toast.error('Please enter valid product details');
      return;
    }

    const product: PIProduct = {
      typeId: Math.floor(Math.random() * 10000), // In real implementation, this would come from EVE API
      typeName: newProduct.typeName,
      quantity: newProduct.quantity,
      delivered: 0,
      unitPrice: newProduct.unitPrice,
      totalValue: newProduct.quantity * newProduct.unitPrice
    };

    setNewAssignment(prev => ({
      ...prev,
      products: [...(prev.products || []), product],
      estimatedIncome: (prev.estimatedIncome || 0) + product.totalValue!
    }));

    setNewProduct({ typeName: '', quantity: 0, unitPrice: 0 });
    toast.success('Product added to assignment');
  };

  const handleESISync = async (assignmentId: string) => {
    toast.info('Syncing with ESI... (simulated)');
    
    // Simulate ESI sync delay
    setTimeout(() => {
      setPiAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId
          ? { ...assignment, lastESICheck: new Date().toISOString() }
          : assignment
      ));
      toast.success('ESI sync completed');
    }, 2000);
  };

  const canManage = user?.role === 'ceo' || user?.role === 'director' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Planet size={32} className="text-accent" />
            Planetary Interaction
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage planetary interaction assignments and track deliveries
          </p>
        </div>
        
        {canManage && (
          <Button onClick={() => setShowAssignDialog(true)} className="bg-accent hover:bg-accent/90">
            <Plus size={16} className="mr-2" />
            Assign PI
          </Button>
        )}
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Factory size={24} className="text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</p>
              </div>
              <Target size={24} className="text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Value</p>
                <p className="text-lg font-bold">{formatISK(stats.totalEstimatedValue)}</p>
              </div>
              <TrendUp size={24} className="text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actual Value</p>
                <p className="text-lg font-bold">{formatISK(stats.totalActualValue)}</p>
              </div>
              <CurrencyDollar size={24} className="text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">My Assignments</TabsTrigger>
          {canManage && <TabsTrigger value="management">Management</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {/* Active Assignments Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe size={20} />
                  Active Assignments Overview
                </CardTitle>
                <CardDescription>
                  Current planetary interaction assignments across the corporation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {piAssignments.filter(a => a.status !== 'completed').slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                        <div>
                          <p className="font-medium">{assignment.pilotName}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.planetName} - {assignment.systemName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatISK(assignment.estimatedIncome)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Deliveries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck size={20} />
                  Recent Deliveries
                </CardTitle>
                <CardDescription>
                  Latest planetary interaction deliveries verified by ESI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {piDeliveries.slice(0, 5).map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={16} className="text-green-400" />
                        <div>
                          <p className="font-medium">{delivery.typeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {delivery.quantity.toLocaleString()} units - {delivery.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatISK(delivery.value || 0)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(delivery.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="grid gap-6">
            {userAssignments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Planet size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No PI Assignments</h3>
                  <p className="text-muted-foreground">
                    You don't have any planetary interaction assignments yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              userAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Planet size={20} />
                          {assignment.planetName}
                        </CardTitle>
                        <CardDescription>
                          {assignment.systemName} ({assignment.securityStatus.toFixed(1)}) - {assignment.planetType}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(assignment.priority)}>
                          {assignment.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Assignment Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Assigned</p>
                        <p className="font-medium">
                          {new Date(assignment.assignedDate).toLocaleDateString()}
                        </p>
                      </div>
                      {assignment.dueDate && (
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p className="font-medium">
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Estimated Value</p>
                        <p className="font-medium">{formatISK(assignment.estimatedIncome)}</p>
                      </div>
                      {assignment.actualIncome && (
                        <div>
                          <p className="text-muted-foreground">Actual Value</p>
                          <p className="font-medium">{formatISK(assignment.actualIncome)}</p>
                        </div>
                      )}
                    </div>

                    {/* Products Progress */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Products</h4>
                      {assignment.products.map((product, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{product.typeName}</span>
                            <span className="text-sm text-muted-foreground">
                              {product.delivered.toLocaleString()} / {product.quantity.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={getProductProgress(product)} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{getProductProgress(product).toFixed(1)}% complete</span>
                            {product.lastDelivery && (
                              <span>Last delivery: {new Date(product.lastDelivery).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {assignment.notes && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Notes</h4>
                        <p className="text-sm">{assignment.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleESISync(assignment.id)}>
                        <Wrench size={14} className="mr-1" />
                        Sync ESI
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAssignment(assignment)}>
                        <Eye size={14} className="mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Management Tab */}
        {canManage && (
          <TabsContent value="management" className="space-y-6">
            <div className="grid gap-6">
              {/* Management Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-bold">{stats.inProgress}</p>
                      </div>
                      <Clock size={24} className="text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Overdue</p>
                        <p className="text-2xl font-bold">{stats.overdue}</p>
                      </div>
                      <AlertTriangle size={24} className="text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold">{stats.completed}</p>
                      </div>
                      <CheckCircle size={24} className="text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* All Assignments Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All PI Assignments</CardTitle>
                  <CardDescription>
                    Manage all planetary interaction assignments across the corporation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{assignment.pilotName}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.planetName} - {assignment.systemName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(assignment.status)}>
                              {assignment.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={getPriorityColor(assignment.priority)}>
                              {assignment.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{formatISK(assignment.estimatedIncome)}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.products.length} products
                            </p>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => setSelectedAssignment(assignment)}>
                              <Eye size={14} />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingAssignment(assignment)}>
                              <Edit size={14} />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleESISync(assignment.id)}>
                              <Wrench size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Planetary Interaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pilot">Pilot</Label>
                <Select value={newAssignment.pilotId} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, pilotId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pilot" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member) => (
                      <SelectItem key={member.characterId} value={member.characterId}>
                        {member.characterName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newAssignment.priority} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
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

            {/* Planet Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="planetType">Planet Type</Label>
                <Select value={newAssignment.planetType} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, planetType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select planet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Temperate">Temperate</SelectItem>
                    <SelectItem value="Barren">Barren</SelectItem>
                    <SelectItem value="Oceanic">Oceanic</SelectItem>
                    <SelectItem value="Ice">Ice</SelectItem>
                    <SelectItem value="Gas">Gas</SelectItem>
                    <SelectItem value="Lava">Lava</SelectItem>
                    <SelectItem value="Storm">Storm</SelectItem>
                    <SelectItem value="Plasma">Plasma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="planetName">Planet Name</Label>
                <Input
                  id="planetName"
                  value={newAssignment.planetName}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, planetName: e.target.value }))}
                  placeholder="e.g., Temperate Planet VII"
                />
              </div>
              
              <div>
                <Label htmlFor="systemName">System</Label>
                <Input
                  id="systemName"
                  value={newAssignment.systemName}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, systemName: e.target.value }))}
                  placeholder="e.g., Jita"
                />
              </div>
            </div>

            {/* Product Management */}
            <div>
              <Label>Products</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Product name"
                    value={newProduct.typeName}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, typeName: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  />
                  <Input
                    type="number"
                    placeholder="Unit Price"
                    value={newProduct.unitPrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, unitPrice: parseInt(e.target.value) || 0 }))}
                  />
                  <Button onClick={handleAddProduct}>Add</Button>
                </div>
                
                {newAssignment.products && newAssignment.products.length > 0 && (
                  <div className="border rounded-lg">
                    {newAssignment.products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                        <span>{product.typeName}</span>
                        <span>{product.quantity.toLocaleString()} @ {formatISK(product.unitPrice || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newAssignment.notes}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or requirements..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignPI}>
                Assign PI
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}