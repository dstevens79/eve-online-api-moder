import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  MagnifyingGlass, 
  Download,
  UserPlus,
  Eye,
  Clock,
  MapPin,
  Refresh
} from '@phosphor-icons/react';
import { Member } from '@/lib/types';
import { useLMeveData } from '@/lib/LMeveDataContext';
import { useAuth } from '@/lib/auth';

export function Members() {
  const { user } = useAuth();
  const { members, loading, refreshMembers } = useLMeveData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load members data on component mount
  useEffect(() => {
    if (members.length === 0 && !loading.members) {
      refreshMembers();
    }
  }, [members.length, loading.members, refreshMembers]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.roles.some(role => 
      role.toLowerCase().includes(roleFilter.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.isActive) ||
                         (statusFilter === 'inactive' && !member.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSecurityStatusColor = (status: number) => {
    if (status >= 5) return 'text-blue-400';
    if (status >= 0) return 'text-green-400';
    return 'text-red-400';
  };

  const getRolesBadgeVariant = (roles: string[]) => {
    if (roles.includes('Director')) return 'default';
    if (roles.some(role => role.includes('Manager') || role.includes('Foreman'))) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} />
            {user?.corporationName} Members
          </h2>
          <p className="text-muted-foreground">
            Manage and monitor corporation member activities and roles
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshMembers}
            disabled={loading.members}
          >
            <Refresh size={16} className={`mr-2 ${loading.members ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-accent hover:bg-accent/90">
            <UserPlus size={16} className="mr-2" />
            Recruit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {members.filter(m => m.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Active Members</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">
              {members.filter(m => m.roles.some(r => r.includes('Director') || r.includes('Manager'))).length}
            </div>
            <p className="text-sm text-muted-foreground">Leadership</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {members.filter(m => {
                const lastLogin = new Date(m.lastLogin);
                const daysSince = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
                return daysSince <= 7;
              }).length}
            </div>
            <p className="text-sm text-muted-foreground">Active This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="director">Directors</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="foreman">Foremen</SelectItem>
                <SelectItem value="member">Members</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Member Directory ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Title & Roles</TableHead>
                <TableHead>Security Status</TableHead>
                <TableHead>Location & Ship</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {member.characterId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{member.title}</div>
                      <div className="flex flex-wrap gap-1">
                        {member.roles.map((role, index) => (
                          <Badge 
                            key={index} 
                            variant={getRolesBadgeVariant(member.roles)}
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono text-sm ${getSecurityStatusColor(member.securityStatus)}`}>
                      {member.securityStatus.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-muted-foreground" />
                        {member.location || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.ship || 'Unknown Ship'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock size={12} className="text-muted-foreground" />
                      {formatLastLogin(member.lastLogin)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(member.joinDate)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={member.isActive ? "default" : "secondary"}
                      className={member.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}