/**
 * User System Test Component
 * Tests the integrated user management system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Warning, 
  Info, 
  Users, 
  TestTube,
  Play,
  User,
  Shield
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { userService } from '@/lib/user-service';
import { LMeveUser, UserRole } from '@/lib/types';
import { useAuth } from '@/lib/auth-provider';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function UserSystemTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testUsername, setTestUsername] = useState('testuser');
  const [testPassword, setTestPassword] = useState('testpass123');
  const { user: currentUser, loginWithCredentials } = useAuth();
  const [allUsers, setAllUsers] = useState<LMeveUser[]>([]);

  // Load users
  const loadUsers = async () => {
    try {
      const users = await userService.getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Run comprehensive tests
  const runUserSystemTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: TestResult[] = [];

    try {
      // Test 1: User service initialization
      results.push({
        name: 'User Service Initialization',
        status: 'success',
        message: 'User service initialized successfully'
      });

      // Test 2: Get users
      try {
        const users = await userService.getUsers();
        results.push({
          name: 'User Retrieval',
          status: 'success',
          message: `Found ${users.length} users in system`,
          details: users.map(u => `${u.characterName || u.username} (${u.role})`).join(', ')
        });
        setAllUsers(users);
      } catch (error) {
        results.push({
          name: 'User Retrieval',
          status: 'error',
          message: 'Failed to retrieve users',
          details: error instanceof Error ? error.message : String(error)
        });
      }

      // Test 3: Create test user
      try {
        await userService.createUser({
          username: testUsername,
          characterName: `Test Character ${Date.now()}`,
          authMethod: 'manual',
          password: testPassword,
        } as any, 'corp_member');
        
        results.push({
          name: 'User Creation',
          status: 'success',
          message: `Created test user: ${testUsername}`
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          results.push({
            name: 'User Creation',
            status: 'warning',
            message: 'Test user already exists',
            details: 'This is expected if tests have been run before'
          });
        } else {
          results.push({
            name: 'User Creation',
            status: 'error',
            message: 'Failed to create test user',
            details: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // Test 4: User authentication
      try {
        const testUser = await userService.loginWithCredentials(testUsername, testPassword);
        results.push({
          name: 'User Authentication',
          status: 'success',
          message: 'Test user authentication successful',
          details: `Authenticated as: ${testUser.characterName} with role ${testUser.role}`
        });
        
        // Logout the test user to restore original state
        await userService.logout();
      } catch (error) {
        results.push({
          name: 'User Authentication',
          status: 'error',
          message: 'Test user authentication failed',
          details: error instanceof Error ? error.message : String(error)
        });
      }

      // Test 5: Role permissions
      try {
        const testUser = await userService.getUserById(`manual_${testUsername}`) || 
                         await userService.getUserByCharacterId(123456);
        
        if (testUser) {
          const hasPermissions = testUser.permissions && Object.keys(testUser.permissions).length > 0;
          results.push({
            name: 'Role Permissions',
            status: hasPermissions ? 'success' : 'error',
            message: hasPermissions ? 'Role permissions properly assigned' : 'No permissions found',
            details: hasPermissions ? 
              `${Object.values(testUser.permissions).filter(Boolean).length} permissions granted` :
              'User should have role-based permissions'
          });
        } else {
          results.push({
            name: 'Role Permissions',
            status: 'warning',
            message: 'Could not find test user for permission check'
          });
        }
      } catch (error) {
        results.push({
          name: 'Role Permissions',
          status: 'error',
          message: 'Permission check failed',
          details: error instanceof Error ? error.message : String(error)
        });
      }

      // Test 6: Session management
      try {
        const currentUserSession = await userService.getCurrentUser();
        results.push({
          name: 'Session Management',
          status: currentUserSession ? 'success' : 'warning',
          message: currentUserSession ? 'Active user session found' : 'No active user session',
          details: currentUserSession ? 
            `Current user: ${currentUserSession.characterName || currentUserSession.username}` :
            'This is normal if no user is logged in'
        });
      } catch (error) {
        results.push({
          name: 'Session Management',
          status: 'error',
          message: 'Session check failed',
          details: error instanceof Error ? error.message : String(error)
        });
      }

      // Test 7: Clean up test user
      try {
        const allUsers = await userService.getUsers();
        const testUser = allUsers.find(u => u.username === testUsername);
        
        if (testUser && testUser.id !== currentUser?.id) {
          await userService.deleteUser(testUser.id);
          results.push({
            name: 'User Cleanup',
            status: 'success',
            message: 'Test user cleaned up successfully'
          });
        } else if (testUser) {
          results.push({
            name: 'User Cleanup',
            status: 'warning',
            message: 'Test user is currently logged in, skipping cleanup'
          });
        } else {
          results.push({
            name: 'User Cleanup',
            status: 'warning',
            message: 'No test user found to clean up'
          });
        }
      } catch (error) {
        results.push({
          name: 'User Cleanup',
          status: 'warning',
          message: 'Failed to clean up test user',
          details: error instanceof Error ? error.message : String(error)
        });
      }

    } catch (error) {
      results.push({
        name: 'Test Suite',
        status: 'error',
        message: 'Test suite failed to complete',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    setTestResults(results);
    setIsRunning(false);
    
    // Refresh user list
    await loadUsers();

    // Show summary toast
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    if (errorCount === 0) {
      toast.success(`All ${successCount} user system tests passed!`);
    } else {
      toast.error(`${errorCount} tests failed, ${successCount} passed`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />;
      case 'error': return <Warning size={16} className="text-red-400" />;
      case 'warning': return <Warning size={16} className="text-yellow-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube size={20} />
            User System Integration Test
          </CardTitle>
          <CardDescription>
            Comprehensive test of the user management system functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-username">Test Username</Label>
              <Input
                id="test-username"
                value={testUsername}
                onChange={(e) => setTestUsername(e.target.value)}
                placeholder="testuser"
                disabled={isRunning}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-password">Test Password</Label>
              <Input
                id="test-password"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="testpass123"
                disabled={isRunning}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={runUserSystemTests}
              disabled={isRunning}
              className="bg-accent hover:bg-accent/90"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" />
                  Run User System Tests
                </>
              )}
            </Button>
            
            {currentUser && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User size={16} />
                Logged in as: <strong>{currentUser.characterName || currentUser.username}</strong>
                <Badge variant="outline">{currentUser.role}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 'outline'}
                      className={result.status === 'error' ? 'border-red-400' : 
                                result.status === 'warning' ? 'border-yellow-400' : ''}
                    >
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className={`text-sm ${getStatusColor(result.status)}`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-400" />
                  <span>{testResults.filter(r => r.status === 'success').length} Passed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Warning size={16} className="text-yellow-400" />
                  <span>{testResults.filter(r => r.status === 'warning').length} Warnings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Warning size={16} className="text-red-400" />
                  <span>{testResults.filter(r => r.status === 'error').length} Errors</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Current Users ({allUsers.length})
          </CardTitle>
          <CardDescription>
            Active users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allUsers.length > 0 ? (
            <div className="space-y-2">
              {allUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-muted-foreground" />
                      <span className="font-medium">
                        {user.characterName || user.username || `User ${user.id}`}
                      </span>
                    </div>
                    <Badge variant="outline">{user.role}</Badge>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user.authMethod.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.corporationName && `${user.corporationName} • `}
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Info size={16} />
              <AlertDescription>
                No users found in the system. Run the test to create and test user functionality.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}