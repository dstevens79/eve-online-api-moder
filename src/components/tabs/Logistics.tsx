import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useKV } from '@github/spark/hooks';
import { TabComponentProps } from '@/lib/types';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  Calculator,
  Plus,
  Eye,
  ArrowRight,
  Warning,
  CheckCircle,
  X,
  Rocket,
  Archive,
  CurrencyDollar,
  Globe,
  Gauge,
  Target,
  CaretDown,
  CaretRight,
  List,
  UserCheck,
  TrendUp
} from '@phosphor-icons/react';

// Logistics types
export interface FreightRequest {
  id: string;
  requesterId: number;
  requesterName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  sourceLocation: string;
  sourceSystem: string;
  destinationLocation: string;
  destinationSystem: string;
  items: FreightItem[];
  totalVolume: number;
  totalValue: number;
  collateral: number;
  reward: number;
  assignedPilot?: string;
  assignedShip?: string;
  createdDate: string;
  dueDate: string;
  assignedDate?: string;
  completedDate?: string;
  notes?: string;
  route?: RouteWaypoint[];
  estimatedJumps?: number;
}

export interface FreightItem {
  typeId: number;
  typeName: string;
  quantity: number;
  volume: number;
  estimatedValue: number;
}

export interface RouteWaypoint {
  systemName: string;
  securityStatus: number;
  jumps: number;
}

export interface LogisticsHub {
  id: string;
  name: string;
  systemName: string;
  stationName: string;
  securityStatus: number;
  isActive: boolean;
  stockLevel: 'critical' | 'low' | 'adequate' | 'good';
  manager: string;
  lastUpdated: string;
}

export interface SupplyRequest {
  id: string;
  requesterId: number;
  requesterName: string;
  hubId: string;
  hubName: string;
  items: SupplyItem[];
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'denied';
  createdDate: string;
  dueDate: string;
  approvedBy?: string;
  notes?: string;
}

export interface SupplyItem {
  typeId: number;
  typeName: string;
  requestedQuantity: number;
  estimatedCost: number;
  justification: string;
}

export function Logistics({ isMobileView = false }: TabComponentProps) {
  // State management
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedRequest, setSelectedRequest] = useState<FreightRequest | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showNewSupply, setShowNewSupply] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [expandedCards, setExpandedCards] = useKV<string[]>('logistics-expanded-cards', []);

  // Data storage
  const [freightRequests, setFreightRequests] = useKV<FreightRequest[]>('freight-requests', []);
  const [supplyRequests, setSupplyRequests] = useKV<SupplyRequest[]>('supply-requests', []);
  const [logisticsHubs, setLogisticsHubs] = useKV<LogisticsHub[]>('logistics-hubs', [
    {
      id: '1',
      name: 'Jita Trade Hub',
      systemName: 'Jita',
      stationName: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      securityStatus: 1.0,
      isActive: true,
      stockLevel: 'good',
      manager: 'Trade Manager Alpha',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Amarr Regional Hub',
      systemName: 'Amarr',
      stationName: 'Amarr VIII (Oris) - Emperor Family Academy',
      securityStatus: 1.0,
      isActive: true,
      stockLevel: 'adequate',
      manager: 'Trade Manager Beta',
      lastUpdated: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  // Form state
  const [newRequestForm, setNewRequestForm] = useState({
    priority: 'medium' as const,
    sourceLocation: '',
    sourceSystem: '',
    destinationLocation: '',
    destinationSystem: '',
    dueDate: '',
    collateral: '',
    reward: '',
    notes: ''
  });

  const [newSupplyForm, setNewSupplyForm] = useState({
    hubId: '',
    priority: 'medium' as const,
    dueDate: '',
    notes: ''
  });

  // Initialize sample data if empty
  React.useEffect(() => {
    if (freightRequests.length === 0) {
      const sampleRequests: FreightRequest[] = [
        {
          id: '1',
          requesterId: 12345,
          requesterName: 'Industrial Pilot Alpha',
          priority: 'high',
          status: 'pending',
          sourceLocation: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
          sourceSystem: 'Jita',
          destinationLocation: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
          destinationSystem: 'Dodixie',
          items: [
            {
              typeId: 34,
              typeName: 'Tritanium',
              quantity: 50000,
              volume: 2500,
              estimatedValue: 25000000
            },
            {
              typeId: 35,
              typeName: 'Pyerite',
              quantity: 25000,
              volume: 1250,
              estimatedValue: 15000000
            }
          ],
          totalVolume: 3750,
          totalValue: 40000000,
          collateral: 45000000,
          reward: 8000000,
          createdDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          notes: 'Urgent delivery required for manufacturing contract',
          estimatedJumps: 24
        },
        {
          id: '2',
          requesterId: 67890,
          requesterName: 'Trader Beta',
          priority: 'medium',
          status: 'in_transit',
          sourceLocation: 'Amarr VIII (Oris) - Emperor Family Academy',
          sourceSystem: 'Amarr',
          destinationLocation: 'Rens VI - Moon 8 - Brutor Tribe Treasury',
          destinationSystem: 'Rens',
          items: [
            {
              typeId: 11399,
              typeName: 'Expanded Cargohold II',
              quantity: 10,
              volume: 50,
              estimatedValue: 120000000
            }
          ],
          totalVolume: 50,
          totalValue: 120000000,
          collateral: 130000000,
          reward: 5000000,
          assignedPilot: 'Freighter Captain Delta',
          assignedShip: 'Charon',
          createdDate: new Date(Date.now() - 86400000).toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          assignedDate: new Date(Date.now() - 3600000).toISOString(),
          estimatedJumps: 15
        }
      ];
      setFreightRequests(sampleRequests);
    }

    if (supplyRequests.length === 0) {
      const sampleSupply: SupplyRequest[] = [
        {
          id: '1',
          requesterId: 11111,
          requesterName: 'Station Manager Alpha',
          hubId: '1',
          hubName: 'Jita Trade Hub',
          priority: 'medium',
          status: 'pending',
          items: [
            {
              typeId: 31,
              typeName: 'Oxygen',
              requestedQuantity: 10000,
              estimatedCost: 500000,
              justification: 'Low stock for station operations'
            },
            {
              typeId: 33,
              typeName: 'Mechanical Parts',
              requestedQuantity: 5000,
              estimatedCost: 2500000,
              justification: 'Required for manufacturing operations'
            }
          ],
          createdDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          notes: 'Regular supply restocking'
        }
      ];
      setSupplyRequests(sampleSupply);
    }
  }, [freightRequests.length, supplyRequests.length, setFreightRequests, setSupplyRequests]);

  // Toggle card expansion
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline' as const, color: 'text-yellow-400 border-yellow-400/50' },
      assigned: { variant: 'outline' as const, color: 'text-blue-400 border-blue-400/50' },
      in_transit: { variant: 'default' as const, color: 'bg-blue-500/20 text-blue-400' },
      delivered: { variant: 'default' as const, color: 'bg-green-500/20 text-green-400' },
      completed: { variant: 'default' as const, color: 'bg-green-500/20 text-green-400' },
      cancelled: { variant: 'outline' as const, color: 'text-red-400 border-red-400/50' },
      approved: { variant: 'default' as const, color: 'bg-blue-500/20 text-blue-400' },
      in_progress: { variant: 'default' as const, color: 'bg-yellow-500/20 text-yellow-400' },
      denied: { variant: 'outline' as const, color: 'text-red-400 border-red-400/50' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'text-gray-400 border-gray-400/50' },
      medium: { color: 'text-yellow-400 border-yellow-400/50' },
      high: { color: 'text-orange-400 border-orange-400/50' },
      urgent: { color: 'text-red-400 border-red-400/50' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <Badge variant="outline" className={config.color}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  // Format ISK values
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

  // Format volume
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M m³`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K m³`;
    }
    return `${volume.toLocaleString()} m³`;
  };

  // Create new freight request
  const createFreightRequest = () => {
    const newRequest: FreightRequest = {
      id: Date.now().toString(),
      requesterId: 12345, // Would come from auth
      requesterName: 'Current User', // Would come from auth
      priority: newRequestForm.priority,
      status: 'pending',
      sourceLocation: newRequestForm.sourceLocation,
      sourceSystem: newRequestForm.sourceSystem,
      destinationLocation: newRequestForm.destinationLocation,
      destinationSystem: newRequestForm.destinationSystem,
      items: [], // Would be populated by item selector
      totalVolume: 0,
      totalValue: 0,
      collateral: parseInt(newRequestForm.collateral) || 0,
      reward: parseInt(newRequestForm.reward) || 0,
      createdDate: new Date().toISOString(),
      dueDate: newRequestForm.dueDate,
      notes: newRequestForm.notes
    };

    setFreightRequests(prev => [newRequest, ...prev]);
    setShowNewRequest(false);
    setNewRequestForm({
      priority: 'medium',
      sourceLocation: '',
      sourceSystem: '',
      destinationLocation: '',
      destinationSystem: '',
      dueDate: '',
      collateral: '',
      reward: '',
      notes: ''
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const totalRequests = freightRequests.length;
    const activeRequests = freightRequests.filter(r => ['pending', 'assigned', 'in_transit'].includes(r.status)).length;
    const completedRequests = freightRequests.filter(r => r.status === 'delivered').length;
    const totalValue = freightRequests.reduce((sum, r) => sum + r.totalValue, 0);
    const totalRewards = freightRequests.reduce((sum, r) => sum + r.reward, 0);

    const supplyPending = supplyRequests.filter(r => r.status === 'pending').length;
    const supplyInProgress = supplyRequests.filter(r => r.status === 'in_progress').length;

    return {
      totalRequests,
      activeRequests,
      completedRequests,
      totalValue,
      totalRewards,
      supplyPending,
      supplyInProgress,
      completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0
    };
  }, [freightRequests, supplyRequests]);

  if (isMobileView) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold flex items-center justify-center gap-2">
            <Truck size={20} />
            Logistics
          </h2>
          <p className="text-sm text-muted-foreground">
            Transportation & Supply Chain
          </p>
        </div>

        {/* Mobile Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-accent">{stats.activeRequests}</div>
              <div className="text-xs text-muted-foreground">Active Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-green-400">{stats.completedRequests}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-sm font-bold text-yellow-400">{stats.supplyPending}</div>
              <div className="text-xs text-muted-foreground">Supply Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-sm font-bold text-blue-400">{formatISK(stats.totalRewards)}</div>
              <div className="text-xs text-muted-foreground">Total Rewards</div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="requests" className="text-xs">Freight</TabsTrigger>
            <TabsTrigger value="supplies" className="text-xs">Supply</TabsTrigger>
            <TabsTrigger value="hubs" className="text-xs">Hubs</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Freight Requests</h3>
              <Button size="sm" onClick={() => setShowNewRequest(true)}>
                <Plus size={14} className="mr-1" />
                New
              </Button>
            </div>

            <div className="space-y-3">
              {freightRequests.map((request) => (
                <Card key={request.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <div className="flex items-center gap-2">
                      <Truck size={16} />
                      <span className="font-medium text-sm truncate">
                        {request.sourceSystem} → {request.destinationSystem}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {getPriorityBadge(request.priority)}
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  <div className="mobile-card-content">
                    <div className="flex justify-between text-xs">
                      <span>Volume: {formatVolume(request.totalVolume)}</span>
                      <span>Reward: {formatISK(request.reward)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>By: {request.requesterName}</span>
                      <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                    </div>
                    {request.assignedPilot && (
                      <div className="text-xs text-blue-400">
                        Assigned to: {request.assignedPilot}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="supplies" className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Supply Requests</h3>
              <Button size="sm" onClick={() => setShowNewSupply(true)}>
                <Plus size={14} className="mr-1" />
                New
              </Button>
            </div>

            <div className="space-y-3">
              {supplyRequests.map((request) => (
                <Card key={request.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <div className="flex items-center gap-2">
                      <Package size={16} />
                      <span className="font-medium text-sm">{request.hubName}</span>
                    </div>
                    <div className="flex gap-2">
                      {getPriorityBadge(request.priority)}
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  <div className="mobile-card-content">
                    <div className="text-xs">
                      {request.items.length} item{request.items.length !== 1 ? 's' : ''} requested
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>By: {request.requesterName}</span>
                      <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hubs" className="space-y-3 mt-4">
            <h3 className="font-semibold">Logistics Hubs</h3>
            <div className="space-y-3">
              {logisticsHubs.map((hub) => (
                <Card key={hub.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span className="font-medium text-sm">{hub.name}</span>
                    </div>
                    <Badge variant="outline" className={
                      hub.stockLevel === 'critical' ? 'text-red-400 border-red-400/50' :
                      hub.stockLevel === 'low' ? 'text-orange-400 border-orange-400/50' :
                      hub.stockLevel === 'adequate' ? 'text-yellow-400 border-yellow-400/50' :
                      'text-green-400 border-green-400/50'
                    }>
                      {hub.stockLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="mobile-card-content">
                    <div className="text-xs text-muted-foreground">
                      {hub.systemName} • Sec {hub.securityStatus.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Manager: {hub.manager}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Truck size={24} />
          Logistics Management
        </h2>
        <p className="text-muted-foreground">
          Coordinate transportation, distribution, and supply chain operations across New Eden
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Requests</p>
                <p className="text-2xl font-bold text-accent">{stats.activeRequests}</p>
              </div>
              <Truck size={24} className="text-accent" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats.totalRequests} total requests
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-green-400">{stats.completionRate.toFixed(1)}%</p>
              </div>
              <CheckCircle size={24} className="text-green-400" />
            </div>
            <div className="mt-2">
              <Progress value={stats.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cargo Value</p>
                <p className="text-2xl font-bold text-blue-400">{formatISK(stats.totalValue)}</p>
              </div>
              <Package size={24} className="text-blue-400" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Rewards: {formatISK(stats.totalRewards)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supply Requests</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.supplyPending}</p>
              </div>
              <Archive size={24} className="text-yellow-400" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats.supplyInProgress} in progress
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">Freight Requests</TabsTrigger>
          <TabsTrigger value="supplies">Supply Management</TabsTrigger>
          <TabsTrigger value="hubs">Logistics Hubs</TabsTrigger>
          <TabsTrigger value="routes">Route Planning</TabsTrigger>
        </TabsList>

        {/* Freight Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Freight Requests</h3>
              <p className="text-sm text-muted-foreground">
                Manage transportation requests and assignments
              </p>
            </div>
            <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Freight Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Source System</Label>
                      <Input
                        value={newRequestForm.sourceSystem}
                        onChange={(e) => setNewRequestForm(prev => ({...prev, sourceSystem: e.target.value}))}
                        placeholder="e.g., Jita"
                      />
                    </div>
                    <div>
                      <Label>Source Location</Label>
                      <Input
                        value={newRequestForm.sourceLocation}
                        onChange={(e) => setNewRequestForm(prev => ({...prev, sourceLocation: e.target.value}))}
                        placeholder="Station or structure name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Destination System</Label>
                      <Input
                        value={newRequestForm.destinationSystem}
                        onChange={(e) => setNewRequestForm(prev => ({...prev, destinationSystem: e.target.value}))}
                        placeholder="e.g., Dodixie"
                      />
                    </div>
                    <div>
                      <Label>Destination Location</Label>
                      <Input
                        value={newRequestForm.destinationLocation}
                        onChange={(e) => setNewRequestForm(prev => ({...prev, destinationLocation: e.target.value}))}
                        placeholder="Station or structure name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Priority</Label>
                      <Select 
                        value={newRequestForm.priority} 
                        onValueChange={(value) => setNewRequestForm(prev => ({...prev, priority: value as any}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Collateral (ISK)</Label>
                      <Input
                        type="number"
                        value={newRequestForm.collateral}
                        onChange={(e) => setNewRequestForm(prev => ({...prev, collateral: e.target.value}))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Reward (ISK)</Label>
                      <Input
                        type="number"
                        value={newRequestForm.reward}
                        onChange={(e) => setNewRequestForm(prev => ({...prev, reward: e.target.value}))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="datetime-local"
                      value={newRequestForm.dueDate}
                      onChange={(e) => setNewRequestForm(prev => ({...prev, dueDate: e.target.value}))}
                    />
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={newRequestForm.notes}
                      onChange={(e) => setNewRequestForm(prev => ({...prev, notes: e.target.value}))}
                      placeholder="Additional instructions or requirements..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createFreightRequest}>
                      Create Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {freightRequests.map((request) => {
              const isExpanded = expandedCards.includes(request.id);
              
              return (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <MapPin size={16} />
                              {request.sourceSystem} → {request.destinationSystem}
                            </h4>
                            <ArrowRight size={16} className="text-muted-foreground" />
                            <div className="flex gap-2">
                              {getPriorityBadge(request.priority)}
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-muted-foreground" />
                              <span>Volume: {formatVolume(request.totalVolume)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CurrencyDollar size={14} className="text-muted-foreground" />
                              <span>Reward: {formatISK(request.reward)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-muted-foreground" />
                              <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {request.assignedPilot && (
                            <div className="mt-2 text-sm text-blue-400">
                              <UserCheck size={14} className="inline mr-1" />
                              Assigned to: {request.assignedPilot} ({request.assignedShip})
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardExpansion(request.id)}
                          >
                            {isExpanded ? (
                              <CaretDown size={16} />
                            ) : (
                              <CaretRight size={16} />
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <>
                          <Separator />
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-medium mb-2">Route Details</h5>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Source:</p>
                                  <p>{request.sourceLocation}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Destination:</p>
                                  <p>{request.destinationLocation}</p>
                                </div>
                              </div>
                              {request.estimatedJumps && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  Estimated jumps: {request.estimatedJumps}
                                </div>
                              )}
                            </div>

                            <div>
                              <h5 className="font-medium mb-2">Cargo Items</h5>
                              <div className="space-y-2">
                                {request.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                    <div>
                                      <span className="font-medium">{item.typeName}</span>
                                      <span className="text-muted-foreground ml-2">
                                        x{item.quantity.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatVolume(item.volume)} • {formatISK(item.estimatedValue)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium mb-2">Financial Details</h5>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Cargo Value:</p>
                                  <p className="font-medium">{formatISK(request.totalValue)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Collateral:</p>
                                  <p className="font-medium">{formatISK(request.collateral)}</p>
                                </div>
                              </div>
                            </div>

                            {request.notes && (
                              <div>
                                <h5 className="font-medium mb-2">Notes</h5>
                                <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded">
                                  {request.notes}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              {request.status === 'pending' && (
                                <Button size="sm" variant="outline">
                                  Assign Pilot
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                Edit Request
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-400 hover:text-red-400">
                                Cancel Request
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Supply Management Tab */}
        <TabsContent value="supplies" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Supply Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage inventory and supply requests for logistics hubs
              </p>
            </div>
            <Button onClick={() => setShowNewSupply(true)}>
              <Plus size={16} className="mr-2" />
              New Supply Request
            </Button>
          </div>

          <div className="space-y-4">
            {supplyRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{request.hubName}</h4>
                        <div className="flex gap-2">
                          {getPriorityBadge(request.priority)}
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-4">
                          <span>
                            <Archive size={14} className="inline mr-1" />
                            {request.items.length} item{request.items.length !== 1 ? 's' : ''} requested
                          </span>
                          <span>
                            <Clock size={14} className="inline mr-1" />
                            Due: {new Date(request.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="text-muted-foreground">
                          Requested by: {request.requesterName}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {request.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                            <div>
                              <span className="font-medium">{item.typeName}</span>
                              <span className="text-muted-foreground ml-2">
                                x{item.requestedQuantity.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm">
                              {formatISK(item.estimatedCost)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {request.notes && (
                        <div className="mt-3 p-3 bg-muted/20 rounded text-sm">
                          <strong>Notes:</strong> {request.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" className="text-green-400">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-400">
                            Deny
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Logistics Hubs Tab */}
        <TabsContent value="hubs" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Logistics Hubs</h3>
            <p className="text-sm text-muted-foreground">
              Monitor and manage your logistics network across New Eden
            </p>
          </div>

          <div className="grid gap-6">
            {logisticsHubs.map((hub) => (
              <Card key={hub.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MapPin size={16} />
                          {hub.name}
                        </h4>
                        <Badge 
                          variant={hub.isActive ? "default" : "outline"}
                          className={hub.isActive ? "bg-green-500/20 text-green-400" : ""}
                        >
                          {hub.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                        <Badge variant="outline" className={
                          hub.stockLevel === 'critical' ? 'text-red-400 border-red-400/50' :
                          hub.stockLevel === 'low' ? 'text-orange-400 border-orange-400/50' :
                          hub.stockLevel === 'adequate' ? 'text-yellow-400 border-yellow-400/50' :
                          'text-green-400 border-green-400/50'
                        }>
                          Stock: {hub.stockLevel.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground">System:</p>
                            <p>{hub.systemName} (Sec {hub.securityStatus.toFixed(1)})</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Station:</p>
                            <p className="truncate">{hub.stationName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Manager:</p>
                            <p>{hub.manager}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Updated:</p>
                            <p>{new Date(hub.lastUpdated).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye size={14} className="mr-1" />
                        Manage
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendUp size={14} className="mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Route Planning Tab */}
        <TabsContent value="routes" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Route Planning</h3>
            <p className="text-sm text-muted-foreground">
              Plan and optimize transportation routes across New Eden
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Globe size={48} className="mx-auto text-muted-foreground" />
                <div>
                  <h4 className="font-semibold mb-2">Route Planning Tools</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced route planning and optimization tools are coming soon. 
                    This will include jump calculations, security analysis, and fuel cost optimization.
                  </p>
                  <Button variant="outline" disabled>
                    <Calculator size={16} className="mr-2" />
                    Launch Route Planner
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}