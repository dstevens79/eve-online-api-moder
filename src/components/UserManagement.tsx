import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Trash2, 
  Edit3, 
  Shield, 
  Users, 
  Key,
  AlertTriangle,
  CheckCircle,
  Clock
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-provider';
import { LMeveUser, UserRole } from '@/lib/types';
import { hasPermission } from '@/lib/roles';

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  corp_admin: 'Corporation Admin',
  corp_director: 'Corporation Director', 
  corp_manager: 'Corporation Manager',
  corp_member: 'Corporation Member',
  guest: 'Guest'
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full system access, can manage all corporations',
  corp_admin: 'Corporation administrator, can manage corp settings and users',
  corp_director: 'Corporation director, can view/manage corp operations',
  corp_manager: 'Corporation manager, can manage specific areas',
  corp_member: 'Basic corporation member, read-only access',
  guest: 'Limited guest access'
};

export function UserManagement() {
  const { user: currentUser, getAllUsers, createManualUser, updateUserRole, deleteUser } = useAuth();
  const [users, setUsers] = useState<LMeveUser[]>(getAllUsers());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LMeveUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Create user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('corp_member');
  const [isCreating, setIsCreating] = useState(false);
  
  // Edit user form
  const [editRole, setEditRole] = useState<UserRole>('corp_member');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Delete confirmation
  const [isDeleting, setIsDeleting] = useState(false);

  // Check permissions
  const canManageUsers = hasPermission(currentUser, 'canManageUsers');
  const canManageSystem = hasPermission(currentUser, 'canManageSystem');

  if (!canManageUsers) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Shield size={48} className="mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">Access Denied</h3>
            <p className="text-sm text-muted-foreground">
              You don't have permission to manage users.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Refresh users list
  const refreshUsers = () => {
    setUsers(getAllUsers());
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    try {
      await createManualUser(newUsername.trim(), newPassword, newRole);
      toast.success('User created successfully');
      setNewUsername('');
      setNewPassword('');
      setNewRole('corp_member');
      setIsCreateDialogOpen(false);
      refreshUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle edit user
  const handleEditUser = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      await updateUserRole(selectedUser.id, editRole);
      toast.success('User role updated successfully');
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      refreshUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      await deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      refreshUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (user: LMeveUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user: LMeveUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'corp_admin':
        return 'default';
      case 'corp_director':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Format last login
  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions for your corporation
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus size={16} className="mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={newRole} 
                  onValueChange={(value) => setNewRole(value as UserRole)}
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([role, label]) => {
                      // Only super admin can create other super admins
                      if (role === 'super_admin' && !canManageSystem) return null;
                      
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex flex-col">
                            <span>{label}</span>
                            <span className="text-xs text-muted-foreground">
                              {ROLE_DESCRIPTIONS[role as UserRole]}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            System Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Authentication</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Corporation</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.characterName || user.username || 'Unknown'}
                      </span>
                      {user.username && user.characterName && (
                        <span className="text-xs text-muted-foreground">
                          @{user.username}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.authMethod === 'esi' ? (
                        <Badge variant="secondary" className="text-xs">
                          <Key size={12} className="mr-1" />
                          ESI
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Shield size={12} className="mr-1" />
                          Manual
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {user.corporationName || 'No Corporation'}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-muted-foreground" />
                      {formatLastLogin(user.lastLogin)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {user.isActive ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={14} />
                        <span className="text-xs">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={14} />
                        <span className="text-xs">Inactive</span>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* Can't edit current user or super admin (unless current user is super admin) */}
                      {user.id !== currentUser?.id && (user.role !== 'super_admin' || canManageSystem) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit3 size={14} />
                        </Button>
                      )}
                      
                      {/* Can't delete current user or super admin (unless current user is super admin) */}
                      {user.id !== currentUser?.id && (user.role !== 'super_admin' || canManageSystem) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <Alert>
                <Shield size={16} />
                <AlertDescription>
                  Editing role for: <strong>{selectedUser.characterName || selectedUser.username}</strong>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editRole} 
                  onValueChange={(value) => setEditRole(value as UserRole)}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([role, label]) => {
                      // Only super admin can assign super admin role
                      if (role === 'super_admin' && !canManageSystem) return null;
                      
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex flex-col">
                            <span>{label}</span>
                            <span className="text-xs text-muted-foreground">
                              {ROLE_DESCRIPTIONS[role as UserRole]}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditUser}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? 'Updating...' : 'Update Role'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <Alert variant="destructive">
                <AlertTriangle size={16} />
                <AlertDescription>
                  This action cannot be undone. This will permanently delete the user account for:{' '}
                  <strong>{selectedUser.characterName || selectedUser.username}</strong>
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}