import { useState } from 'react';
import { remoteDatabaseAPI } from '@/lib/remoteDatabaseAPI';

export interface DatabaseTask {
  id: string;
  type: 'create-databases' | 'import-sde' | 'import-schema';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  logs: string[];
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  sshUser: string;
  sshKeyPath: string;
  mysqlRootPassword?: string;
  lmevePassword: string;
}

export interface RemoteOperationsAPI {
  // Execute a database task on the remote server
  executeTask: (taskType: string, params?: Record<string, any>) => Promise<DatabaseTask>;
  
  // Get status of a running task
  getTaskStatus: (taskId: string) => Promise<DatabaseTask>;
  
  // Get task logs
  getTaskLogs: (taskId: string) => Promise<string[]>;
  
  // Test SSH connection to database server
  testConnection: (config: DatabaseConfig) => Promise<{ success: boolean; message: string }>;
  
  // Upload file to remote server (for SDE imports)
  uploadFile: (file: File, taskId: string) => Promise<{ success: boolean; path: string }>;
}

/**
 * Hook for managing remote database operations
 */
export function useRemoteOperations(): {
  tasks: DatabaseTask[];
  executeTask: (type: string, params?: Record<string, any>) => Promise<DatabaseTask>;
  getTaskStatus: (id: string) => Promise<DatabaseTask>;
  testConnection: (config: DatabaseConfig) => Promise<{ success: boolean; message: string }>;
  uploadFile: (file: File, taskId: string) => Promise<{ success: boolean; path: string }>;
} {
  const [tasks, setTasks] = useState<DatabaseTask[]>([]);

  const executeTask = async (type: string, params: Record<string, any> = {}): Promise<DatabaseTask> => {
    try {
      console.log('🚀 Starting remote database task:', type, params);
      
      // Use the simulated API
      const task = await remoteDatabaseAPI.executeTask(type, params);
      
      setTasks(prev => [...prev, task]);
      
      // Poll for updates every 2 seconds
      const pollInterval = setInterval(async () => {
        const updatedTask = await remoteDatabaseAPI.getTaskStatus(task.id);
        if (updatedTask) {
          setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
          
          // Stop polling when task completes
          if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
            clearInterval(pollInterval);
          }
        }
      }, 2000);
      
      return task;
    } catch (error) {
      console.error('❌ Remote task execution failed:', error);
      
      // Update task with error
      const errorTask: DatabaseTask = {
        id: `task_${Date.now()}`,
        type: type as any,
        status: 'failed',
        progress: 0,
        logs: [
          `Starting ${type} operation...`,
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        ],
        startTime: new Date(),
        endTime: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setTasks(prev => [...prev, errorTask]);
      return errorTask;
    }
  };

  const getTaskStatus = async (id: string): Promise<DatabaseTask> => {
    const task = await remoteDatabaseAPI.getTaskStatus(id);
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Update local task state
    setTasks(prev => prev.map(t => t.id === id ? task : t));
    
    return task;
  };

  const testConnection = async (config: DatabaseConfig): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🔍 Testing remote database connection...');
      
      const result = await remoteDatabaseAPI.testConnection(config);
      console.log('✅ Connection test result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  };

  const uploadFile = async (file: File, taskId: string): Promise<{ success: boolean; path: string }> => {
    try {
      console.log('📁 Uploading file for remote operation:', file.name);
      
      const result = await remoteDatabaseAPI.uploadFile(file, taskId);
      console.log('✅ File upload result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      return {
        success: false,
        path: ''
      };
    }
  };

  return {
    tasks,
    executeTask,
    getTaskStatus,
    testConnection,
    uploadFile
  };
}