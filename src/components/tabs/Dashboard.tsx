import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EVEApiStatus } from '@/components/EVEApiStatus';
import { useLMeveData } from '@/lib/LMeveDataContext';
import { useAuth } from '@/lib/auth';
import { 
  Users, 
  Package, 
  Factory, 
  HardHat, 
  TrendUp, 
  ArrowUp, 
  ArrowDown,
  Clock,
  MapPin,
  ArrowClockwise,
  Download
} from '@phosphor-icons/react';

export function Dashboard() {
  const { user } = useAuth();
  const { 
    dashboardStats, 
    syncStatus, 
    syncData, 
    refreshDashboard,
    loading 
  } = useLMeveData();

  // Load dashboard data on component mount
  useEffect(() => {
    if (!dashboardStats) {
      refreshDashboard();
    }
  }, [dashboardStats, refreshDashboard]);

  // Use real data if available, fall back to mock data
  const stats = dashboardStats || {
    totalMembers: 42,
    activeMembers: 38,
    totalAssets: 1247,
    totalAssetsValue: 15600000000,
    activeJobs: 3,
    completedJobsThisMonth: 28,
    miningOperationsThisMonth: 156,
    miningValueThisMonth: 2100000000,
    corpWalletBalance: 45000000000,
    recentActivity: []
  };

  const formatISK = (amount: number): string => {
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(1)}T ISK`;
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}B ISK`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M ISK`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K ISK`;
    return `${amount} ISK`;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Corporation Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of {user?.corporationName || 'your corporation'} activities and metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {syncStatus.lastSync && (
            <p className="text-xs text-muted-foreground">
              Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </p>
          )}
          
          <Button
            onClick={refreshDashboard}
            variant="outline"
            size="sm"
            disabled={loading.members || loading.assets}
          >
            <ArrowClockwise size={16} className={`mr-2 ${loading.members || loading.assets ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={syncData}
            disabled={syncStatus.isRunning}
            size="sm"
            className="bg-accent hover:bg-accent/90"
          >
            {syncStatus.isRunning ? (
              <ArrowClockwise size={16} className="mr-2 animate-spin" />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            {syncStatus.isRunning ? 'Syncing...' : 'Sync All Data'}
          </Button>
        </div>
      </div>

      {/* Sync Progress */}
      {syncStatus.isRunning && (
        <Card className="border-accent/50 bg-accent/10">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{syncStatus.stage}</span>
                <span>{Math.round(syncStatus.progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${syncStatus.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Error */}
      {syncStatus.error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Sync failed: {syncStatus.error}
            </p>
          </CardContent>
        </Card>
      )}

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
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="text-sm font-medium">{activity.memberName}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Activity will appear here as members interact with the system</p>
                  </div>
                )}
              </div>
              {stats.recentActivity && stats.recentActivity.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </div>
              )}
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