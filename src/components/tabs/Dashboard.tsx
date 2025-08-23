import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EVEApiStatus } from '@/components/EVEApiStatus';
import { 
  Users, 
  Package, 
  Factory, 
  HardHat, 
  TrendUp, 
  ArrowUp, 
  ArrowDown,
  Clock,
  MapPin
} from '@phosphor-icons/react';

export function Dashboard() {
  // Mock data - in a real app this would come from an API
  const stats = {
    totalMembers: 42,
    activeMembers: 38,
    totalAssets: 1247,
    totalAssetsValue: 15600000000, // 15.6B ISK
    activeJobs: 3,
    completedJobsThisMonth: 28,
    miningOperationsThisMonth: 156,
    miningValueThisMonth: 2100000000, // 2.1B ISK
    corpWalletBalance: 45000000000, // 45B ISK
  };

  const recentActivity = [
    { id: 1, time: '2 hours ago', member: 'John Doe', action: 'Completed manufacturing job', type: 'manufacturing' },
    { id: 2, time: '4 hours ago', member: 'Jane Smith', action: 'Updated asset location', type: 'asset' },
    { id: 3, time: '6 hours ago', member: 'Bob Wilson', action: 'Mining operation in Jita', type: 'mining' },
    { id: 4, time: '8 hours ago', member: 'Alice Brown', action: 'Logged in from Dodixie', type: 'login' },
    { id: 5, time: '12 hours ago', member: 'Charlie Davis', action: 'Started blueprint research', type: 'manufacturing' },
  ];

  const formatISK = (amount: number): string => {
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(1)}T`;
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`;
    return amount.toString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'manufacturing': return <Factory size={16} className="text-blue-400" />;
      case 'mining': return <HardHat size={16} className="text-yellow-400" />;
      case 'asset': return <Package size={16} className="text-green-400" />;
      case 'login': return <Users size={16} className="text-purple-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Corporation Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Corporation Dashboard</h2>
        <p className="text-muted-foreground mb-6">
          Overview of Test Alliance Please Ignore corporation activities and metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-400">
                <ArrowUp size={12} className="mr-1" />
                {stats.activeMembers} active
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {formatISK(stats.totalAssetsValue)} ISK value
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manufacturing</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedJobsThisMonth} completed this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corp Wallet</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatISK(stats.corpWalletBalance)}</div>
            <p className="text-xs text-muted-foreground">
              ISK balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mining Operations Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardHat size={20} />
            Mining Operations This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{stats.miningOperationsThisMonth}</div>
              <p className="text-sm text-muted-foreground">Operations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{formatISK(stats.miningValueThisMonth)}</div>
              <p className="text-sm text-muted-foreground">ISK Value</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{Math.round(stats.miningValueThisMonth / stats.miningOperationsThisMonth / 1e6)}M</div>
              <p className="text-sm text-muted-foreground">Avg per Operation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="text-sm font-medium">{activity.member}</p>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* EVE Online Status */}
        <div>
          <EVEApiStatus />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Users size={20} />
              <span className="text-xs">Recruit Members</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Factory size={20} />
              <span className="text-xs">Start Production</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <HardHat size={20} />
              <span className="text-xs">Plan Mining Op</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Package size={20} />
              <span className="text-xs">Asset Audit</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}