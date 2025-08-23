import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendUp, 
  TrendDown,
  DollarSign,
  Factory,
  Users,
  Package,
  Calendar,
  Filter,
  Download,
  Eye,
  ArrowUp,
  ArrowDown,
  Clock
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { IncomeRecord, IncomeAnalytics } from '@/lib/types';

export function Income() {
  const [incomeRecords] = useKV<IncomeRecord[]>('income-records', []);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedPilot, setSelectedPilot] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in a real app this would come from ESI API and industry calculations
  const mockIncomeRecords: IncomeRecord[] = [
    {
      id: '1',
      pilotId: 91316135,
      pilotName: 'John Industrialist',
      jobId: 'job_12345',
      jobType: 'manufacturing',
      productTypeId: 587,
      productTypeName: 'Rifter',
      completedDate: '2024-01-15T14:30:00Z',
      runs: 10,
      productQuantity: 10,
      materialCost: 25000000,
      laborCost: 1500000,
      facilityCost: 500000,
      totalCost: 27000000,
      marketValue: 35000000,
      profit: 8000000,
      profitMargin: 0.229,
      efficiency: {
        material: 10,
        time: 20
      },
      location: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      locationId: 60003760
    },
    {
      id: '2',
      pilotId: 91316136,
      pilotName: 'Jane Manufacturer',
      jobId: 'job_12346',
      jobType: 'manufacturing',
      productTypeId: 12058,
      productTypeName: 'Hobgoblin I',
      completedDate: '2024-01-14T16:45:00Z',
      runs: 50,
      productQuantity: 50,
      materialCost: 8000000,
      laborCost: 800000,
      facilityCost: 200000,
      totalCost: 9000000,
      marketValue: 12500000,
      profit: 3500000,
      profitMargin: 0.28,
      efficiency: {
        material: 10,
        time: 18
      },
      location: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
      locationId: 60011866
    },
    {
      id: '3',
      pilotId: 91316135,
      pilotName: 'John Industrialist',
      jobId: 'job_12347',
      jobType: 'research',
      productTypeId: 0,
      productTypeName: 'Blueprint Research',
      completedDate: '2024-01-13T09:15:00Z',
      runs: 1,
      productQuantity: 1,
      materialCost: 0,
      laborCost: 2000000,
      facilityCost: 300000,
      totalCost: 2300000,
      marketValue: 5000000,
      profit: 2700000,
      profitMargin: 0.54,
      efficiency: {
        material: 0,
        time: 15
      },
      location: 'Amarr VIII (Oris) - Emperor Family Academy',
      locationId: 60008494
    }
  ];

  // Use mock data if no real data is available
  const records = incomeRecords.length > 0 ? incomeRecords : mockIncomeRecords;

  // Filter records based on selected criteria
  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Filter by period
    const now = new Date();
    let cutoffDate: Date;
    switch (selectedPeriod) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }

    filtered = filtered.filter(record => new Date(record.completedDate) >= cutoffDate);

    // Filter by pilot
    if (selectedPilot !== 'all') {
      filtered = filtered.filter(record => record.pilotId.toString() === selectedPilot);
    }

    // Filter by job type
    if (selectedJobType !== 'all') {
      filtered = filtered.filter(record => record.jobType === selectedJobType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.pilotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.productTypeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [records, selectedPeriod, selectedPilot, selectedJobType, searchTerm]);

  // Calculate analytics
  const analytics: IncomeAnalytics = useMemo(() => {
    const totalRevenue = filteredRecords.reduce((sum, record) => sum + record.marketValue, 0);
    const totalProfit = filteredRecords.reduce((sum, record) => sum + record.profit, 0);
    const totalCost = filteredRecords.reduce((sum, record) => sum + record.totalCost, 0);
    const averageProfitMargin = totalCost > 0 ? totalProfit / totalCost : 0;

    // Top pilots by profit
    const pilotStats = new Map<number, { name: string; profit: number; jobs: number }>();
    filteredRecords.forEach(record => {
      const existing = pilotStats.get(record.pilotId) || { name: record.pilotName, profit: 0, jobs: 0 };
      existing.profit += record.profit;
      existing.jobs += 1;
      pilotStats.set(record.pilotId, existing);
    });

    const topPilots = Array.from(pilotStats.entries())
      .map(([pilotId, stats]) => ({
        pilotId,
        pilotName: stats.name,
        totalProfit: stats.profit,
        jobsCompleted: stats.jobs,
        averageProfit: stats.profit / stats.jobs
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);

    // Top products by profit
    const productStats = new Map<number, { name: string; profit: number; units: number }>();
    filteredRecords.forEach(record => {
      const existing = productStats.get(record.productTypeId) || { name: record.productTypeName, profit: 0, units: 0 };
      existing.profit += record.profit;
      existing.units += record.productQuantity;
      productStats.set(record.productTypeId, existing);
    });

    const topProducts = Array.from(productStats.entries())
      .map(([typeId, stats]) => ({
        typeId,
        typeName: stats.name,
        totalProfit: stats.profit,
        unitsProduced: stats.units,
        averageProfit: stats.profit / stats.units
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);

    return {
      totalRevenue,
      totalProfit,
      averageProfitMargin,
      jobsCompleted: filteredRecords.length,
      topPilots,
      topProducts,
      monthlyTrends: [] // Would be calculated from historical data
    };
  }, [filteredRecords]);

  const formatISK = (amount: number): string => {
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(1)}T`;
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`;
    return amount.toFixed(0);
  };

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'research': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'copying': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'invention': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const uniquePilots = Array.from(new Set(records.map(r => r.pilotId)))
    .map(id => records.find(r => r.pilotId === id)!)
    .map(r => ({ id: r.pilotId, name: r.pilotName }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign size={24} />
          Income Analytics
        </h2>
        <p className="text-muted-foreground">
          Track pilot income generated from completed industry jobs and operations
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pilot</label>
              <Select value={selectedPilot} onValueChange={setSelectedPilot}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All pilots</SelectItem>
                  {uniquePilots.map(pilot => (
                    <SelectItem key={pilot.id} value={pilot.id.toString()}>
                      {pilot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type</label>
              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="copying">Copying</SelectItem>
                  <SelectItem value="invention">Invention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search pilots or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatISK(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              ISK from {analytics.jobsCompleted} completed jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatISK(analytics.totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(analytics.averageProfitMargin)} profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.jobsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Avg {formatISK(analytics.totalProfit / Math.max(analytics.jobsCompleted, 1))} per job
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pilots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topPilots.length}</div>
            <p className="text-xs text-muted-foreground">
              Contributing to corporation income
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pilots">Top Pilots</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="details">Job Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Pilots by Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPilots.map((pilot, index) => (
                    <div key={pilot.pilotId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{pilot.pilotName}</p>
                          <p className="text-xs text-muted-foreground">
                            {pilot.jobsCompleted} jobs completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-400">{formatISK(pilot.totalProfit)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatISK(pilot.averageProfit)} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products by Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.typeId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.typeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.unitsProduced.toLocaleString()} units
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-400">{formatISK(product.totalProfit)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatISK(product.averageProfit)} per unit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pilots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pilot Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPilots.map((pilot) => (
                  <div key={pilot.pilotId} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{pilot.pilotName}</h4>
                      <Badge variant="outline" className="text-green-400 border-green-500/50">
                        {formatISK(pilot.totalProfit)} profit
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Jobs Completed</p>
                        <p className="font-medium">{pilot.jobsCompleted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Average Profit</p>
                        <p className="font-medium">{formatISK(pilot.averageProfit)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contribution</p>
                        <p className="font-medium">
                          {formatPercent(pilot.totalProfit / analytics.totalProfit)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((product) => (
                  <div key={product.typeId} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{product.typeName}</h4>
                      <Badge variant="outline" className="text-green-400 border-green-500/50">
                        {formatISK(product.totalProfit)} profit
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Units Produced</p>
                        <p className="font-medium">{product.unitsProduced.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Profit per Unit</p>
                        <p className="font-medium">{formatISK(product.averageProfit)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Market Share</p>
                        <p className="font-medium">
                          {formatPercent(product.totalProfit / analytics.totalProfit)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Detailed Job Records</CardTitle>
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Pilot</th>
                      <th className="text-left p-3">Product</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-right p-3">Quantity</th>
                      <th className="text-right p-3">Cost</th>
                      <th className="text-right p-3">Revenue</th>
                      <th className="text-right p-3">Profit</th>
                      <th className="text-right p-3">Margin</th>
                      <th className="text-center p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="p-3">
                          {new Date(record.completedDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">{record.pilotName}</td>
                        <td className="p-3">{record.productTypeName}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={getJobTypeColor(record.jobType)}>
                            {record.jobType}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-mono">
                          {record.productQuantity.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatISK(record.totalCost)}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatISK(record.marketValue)}
                        </td>
                        <td className="p-3 text-right font-mono text-green-400">
                          {formatISK(record.profit)}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatPercent(record.profitMargin)}
                        </td>
                        <td className="p-3 text-center">
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}