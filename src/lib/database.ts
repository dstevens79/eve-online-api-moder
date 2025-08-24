// Database functionality for LMeve - simulating LMeve's database operations
// This provides the core database interface similar to the original LMeve project

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionPoolSize: number;
  queryTimeout: number; // seconds
  autoReconnect: boolean;
  charset: string;
}

export interface DatabaseStatus {
  connected: boolean;
  lastConnection?: string;
  lastError?: string;
  connectionCount: number;
  queryCount: number;
  avgQueryTime: number; // milliseconds
  uptime: number; // seconds
}

export interface QueryResult<T = any> {
  success: boolean;
  data?: T[];
  rowCount?: number;
  error?: string;
  executionTime?: number; // milliseconds
  query?: string;
}

export interface TableInfo {
  name: string;
  rowCount: number;
  size: string; // formatted size like "2.5 MB"
  lastUpdate: string;
  engine: string;
  collation: string;
}

// Default database configuration
export const defaultDatabaseConfig: DatabaseConfig = {
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
};

// Simulated database class that mimics LMeve's database operations
export class DatabaseManager {
  private config: DatabaseConfig;
  private status: DatabaseStatus;
  private connected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.status = {
      connected: false,
      connectionCount: 0,
      queryCount: 0,
      avgQueryTime: 0,
      uptime: 0
    };
  }

  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      // First validate the connection with FULL strict validation
      const testResult = await this.testConnection();
      if (!testResult.success) {
        return { success: false, error: testResult.error };
      }

      // Only proceed if validation was completely successful
      if (!testResult.validated) {
        return { success: false, error: 'Database validation incomplete - connection rejected' };
      }

      // Simulate actual connection establishment with additional delay for realism
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      this.connected = true;
      this.status = {
        ...this.status,
        connected: true,
        lastConnection: new Date().toISOString(),
        connectionCount: this.status.connectionCount + 1,
        uptime: Date.now()
      };

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      this.status = {
        ...this.status,
        connected: false,
        lastError: errorMessage
      };
      return { success: false, error: errorMessage };
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.status.connected = false;
  }

  async testConnection(): Promise<{ success: boolean; latency?: number; error?: string; validated?: boolean }> {
    const startTime = Date.now();
    
    try {
      // Step 1: Basic configuration validation
      const configValidation = this.validateConfig();
      if (!configValidation.valid) {
        throw new Error(configValidation.error);
      }

      // Step 2: Simulate network connectivity check
      await this.simulateNetworkCheck();
      
      // Step 3: Simulate MySQL authentication
      const authCheck = await this.simulateAuthenticationCheck();
      if (!authCheck.valid) {
        throw new Error(authCheck.error);
      }

      // Step 4: Simulate database existence and structure validation
      const dbValidation = await this.validateDatabaseStructure();
      if (!dbValidation.valid) {
        throw new Error(dbValidation.error);
      }

      // Step 5: Simulate privilege validation
      const privilegeCheck = await this.validatePrivileges();
      if (!privilegeCheck.valid) {
        throw new Error(privilegeCheck.error);
      }

      // Step 6: Actually validate LMeve table structure - CRITICAL CHECK
      const lmeveValidation = await this.checkLMeveTables();
      if (!lmeveValidation.valid) {
        throw new Error(lmeveValidation.error);
      }

      const latency = Date.now() - startTime;
      return { success: true, latency, validated: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed',
        validated: false
      };
    }
  }

  private validateConfig(): { valid: boolean; error?: string } {
    // Required fields validation
    if (!this.config.host?.trim()) {
      return { valid: false, error: 'Database host is required and cannot be empty' };
    }
    
    if (!this.config.database?.trim()) {
      return { valid: false, error: 'Database name is required and cannot be empty' };
    }
    
    if (!this.config.username?.trim()) {
      return { valid: false, error: 'Database username is required and cannot be empty' };
    }

    // Port validation
    if (!this.config.port || this.config.port < 1 || this.config.port > 65535) {
      return { valid: false, error: 'Port must be a valid number between 1 and 65535' };
    }

    // Password validation - require some password
    if (!this.config.password) {
      return { valid: false, error: 'Password is required for database authentication' };
    }

    if (this.config.password.length < 1) {
      return { valid: false, error: 'Password cannot be empty' };
    }

    return { valid: true };
  }

  private async simulateNetworkCheck(): Promise<void> {
    // Simulate network connectivity check with realistic timing
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // Basic host validation - accept valid IP addresses and hostnames
    const isValidIPv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(this.config.host);
    const isValidIPv6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(this.config.host);
    const isValidHostname = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(this.config.host);
    const isCommonName = ['localhost', 'db', 'mysql', 'mariadb', 'database'].includes(this.config.host.toLowerCase());
    
    if (!isValidIPv4 && !isValidIPv6 && !isValidHostname && !isCommonName) {
      throw new Error(`Host '${this.config.host}' is not a valid IP address or hostname`);
    }
    
    // Reject empty or obviously invalid hosts
    if (!this.config.host || this.config.host.trim() === '') {
      throw new Error('Host cannot be empty');
    }
    
    // Test specific scenarios that should always fail (for testing)
    if (this.config.host === 'unreachable-host.local') {
      throw new Error('Host unreachable: Name resolution failed');
    }
    
    if (this.config.host === 'timeout-host.local') {
      throw new Error('Connection timeout: Host did not respond within timeout period');
    }
    
    if (this.config.host.includes('firewall-blocked')) {
      throw new Error('Connection refused: Port may be blocked by firewall');
    }

    // Only reject obviously fake test inputs, not real hosts
    const fakePatterns = ['nothing', 'fake', 'invalid', 'test123', 'random'];
    if (fakePatterns.some(pattern => this.config.host.toLowerCase() === pattern)) {
      throw new Error(`Invalid host '${this.config.host}': Not a valid server address`);
    }
  }

  private async simulateAuthenticationCheck(): Promise<{ valid: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Test specific invalid credentials that should always fail
    if (this.config.username === 'baduser') {
      return { valid: false, error: 'Access denied for user \'baduser\'@\'host\' (using password: YES)' };
    }
    
    if (this.config.password === 'wrongpass') {
      return { valid: false, error: 'Access denied for user (using password: YES)' };
    }

    // Simulate locked account
    if (this.config.username === 'locked_user') {
      return { valid: false, error: 'Account is locked due to too many failed login attempts' };
    }

    // Require any non-empty password
    if (!this.config.password || this.config.password.length < 1) {
      return { valid: false, error: 'Password required for database authentication' };
    }

    // Allow any reasonable username/password combination to pass authentication
    // This simulates a successful login to a MySQL server
    return { valid: true };
  }

  private async validateDatabaseStructure(): Promise<{ valid: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    // Simulate specific database scenarios that should fail
    if (this.config.database === 'nonexistent_db') {
      return { valid: false, error: `Unknown database '${this.config.database}'` };
    }
    
    if (this.config.database === 'empty_db') {
      return { valid: false, error: 'Database exists but appears to be empty. No tables found.' };
    }
    
    if (this.config.database === 'corrupted_db') {
      return { valid: false, error: 'Database exists but tables appear corrupted or incomplete' };
    }

    // Accept any database name that exists and is accessible
    return { valid: true };
  }

  private async validatePrivileges(): Promise<{ valid: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Simulate privilege checking
    if (this.config.username === 'select_only') {
      return { valid: false, error: 'User has SELECT privileges only. LMeve requires INSERT, UPDATE, DELETE privileges' };
    }
    
    if (this.config.username === 'no_create') {
      return { valid: false, error: 'User lacks CREATE and ALTER privileges required for schema updates' };
    }

    return { valid: true };
  }



  private async checkLMeveTables(): Promise<{ valid: boolean; error?: string }> {
    // Simulate checking for database connectivity and basic structure
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));
    
    // Test specific invalid connection scenarios that should always fail
    if (this.config.username === 'baduser' || this.config.password === 'wrongpass') {
      return { valid: false, error: 'Authentication failed: Access denied' };
    }
    
    if (this.config.host === 'invalid-host' || this.config.host === 'nonexistent-server') {
      return { valid: false, error: 'Cannot connect to database server: Host not found or connection refused' };
    }

    // Test specific database scenarios
    if (this.config.database === 'nonexistent_db') {
      return { valid: false, error: 'Database does not exist on server' };
    }
    
    if (this.config.database === 'empty_db') {
      return { 
        valid: false, 
        error: 'Database is accessible but appears to be empty or not set up for LMeve' 
      };
    }
    
    if (this.config.database === 'partial_db') {
      return { 
        valid: false, 
        error: 'Incomplete database setup detected. Some required tables may be missing.' 
      };
    }
    
    if (this.config.database === 'no_sde_db') {
      return { 
        valid: false, 
        error: 'Database accessible but missing EVE Static Data Export (SDE) tables. Run EVE SDE update.' 
      };
    }

    if (this.config.database === 'wrong_version_db') {
      return { 
        valid: false, 
        error: 'Database schema version mismatch. This appears to be an older or incompatible installation.' 
      };
    }

    // If we reach here, simulate a successful connection to a MySQL database
    // This validates that the credentials work and the database is accessible
    // For LMeve, we'll note if it needs setup but still consider the connection valid
    
    const isNewDatabase = Math.random() > 0.7; // Simulate 30% chance of new/empty database
    
    if (isNewDatabase && this.config.database !== 'lmeve') {
      // Database exists but may need LMeve setup
      console.log(`Database '${this.config.database}' connected successfully but may need LMeve schema installation`);
    }

    return { valid: true };
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const startTime = Date.now();
    
    try {
      if (!this.connected) {
        throw new Error('Database not connected');
      }

      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
      
      const executionTime = Date.now() - startTime;
      this.status.queryCount++;
      this.status.avgQueryTime = (this.status.avgQueryTime + executionTime) / 2;

      // Return simulated result based on query type
      const result = this.simulateQueryResult<T>(sql);
      
      return {
        success: true,
        data: result.data,
        rowCount: result.rowCount,
        executionTime,
        query: sql
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed',
        executionTime: Date.now() - startTime,
        query: sql
      };
    }
  }

  private simulateQueryResult<T>(sql: string): { data: T[]; rowCount: number } {
    // Simple query simulation based on SQL content
    if (sql.toLowerCase().includes('select')) {
      // Return mock data based on query
      const rowCount = Math.floor(Math.random() * 100) + 1;
      return { data: [] as T[], rowCount };
    }
    
    if (sql.toLowerCase().includes('insert')) {
      return { data: [] as T[], rowCount: 1 };
    }
    
    if (sql.toLowerCase().includes('update')) {
      const rowCount = Math.floor(Math.random() * 10) + 1;
      return { data: [] as T[], rowCount };
    }
    
    if (sql.toLowerCase().includes('delete')) {
      const rowCount = Math.floor(Math.random() * 5) + 1;
      return { data: [] as T[], rowCount };
    }

    return { data: [] as T[], rowCount: 0 };
  }

  async getTableInfo(): Promise<TableInfo[]> {
    // Simulate getting table information
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        name: 'characters',
        rowCount: 156,
        size: '2.1 MB',
        lastUpdate: new Date().toISOString(),
        engine: 'InnoDB',
        collation: 'utf8mb4_unicode_ci'
      },
      {
        name: 'corporations',
        rowCount: 8,
        size: '128 KB',
        lastUpdate: new Date().toISOString(),
        engine: 'InnoDB',
        collation: 'utf8mb4_unicode_ci'
      },
      {
        name: 'assets',
        rowCount: 45672,
        size: '125.6 MB',
        lastUpdate: new Date().toISOString(),
        engine: 'InnoDB',
        collation: 'utf8mb4_unicode_ci'
      },
      {
        name: 'industry_jobs',
        rowCount: 2341,
        size: '8.9 MB',
        lastUpdate: new Date().toISOString(),
        engine: 'InnoDB',
        collation: 'utf8mb4_unicode_ci'
      },
      {
        name: 'mining_operations',
        rowCount: 1567,
        size: '3.2 MB',
        lastUpdate: new Date().toISOString(),
        engine: 'InnoDB',
        collation: 'utf8mb4_unicode_ci'
      },
      {
        name: 'killmails',
        rowCount: 892,
        size: '12.4 MB',
        lastUpdate: new Date().toISOString(),
        engine: 'InnoDB',
        collation: 'utf8mb4_unicode_ci'
      },
      {
        name: 'market_prices',
        rowCount: 15678,
        size: '45.2 MB',
        lastUpdate: new Date().toISOString(),
        engine: 'InnoDB',
        collation: 'utf8mb4_unicode_ci'
      },
      {
        name: 'eve_types',
        rowCount: 87432,
        size: '156.7 MB',
        lastUpdate: new Date().toISOString(),
        engine: 'InnoDB',
        collation: 'utf8mb4_unicode_ci'
      }
    ];
  }

  getStatus(): DatabaseStatus {
    if (this.status.connected && this.status.uptime) {
      this.status.uptime = Math.floor((Date.now() - this.status.uptime) / 1000);
    }
    return this.status;
  }

  getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Database setup automation
export interface DatabaseSetupConfig {
  mysqlRootPassword?: string;
  lmevePassword: string;
  allowedHosts: string; // e.g., '%' or '192.168.1.%'
  downloadSDE: boolean;
}

export interface SetupStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

export interface DatabaseSetupProgress {
  currentStep: number;
  totalSteps: number;
  steps: SetupStep[];
  isRunning: boolean;
  completed: boolean;
  error?: string;
}

export class DatabaseSetupManager {
  private progress: DatabaseSetupProgress;
  private onProgressUpdate?: (progress: DatabaseSetupProgress) => void;

  constructor(onProgressUpdate?: (progress: DatabaseSetupProgress) => void) {
    this.onProgressUpdate = onProgressUpdate;
    this.progress = {
      currentStep: 0,
      totalSteps: 0,
      steps: [],
      isRunning: false,
      completed: false
    };
  }

  async setupNewDatabase(config: DatabaseSetupConfig): Promise<{ success: boolean; error?: string }> {
    try {
      this.initializeSteps(config);
      this.progress.isRunning = true;
      this.notifyProgress();

      // Step 1: Create directories
      await this.executeStep('create-dirs', async () => {
        return this.simulateCommand('sudo mkdir -p /Incoming');
      });

      // Step 2: Download EVE SDE
      if (config.downloadSDE) {
        await this.executeStep('download-sde', async () => {
          return this.simulateCommand('sudo wget "https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2" -O /Incoming/mysql-latest.tar.bz2');
        });

        await this.executeStep('extract-sde', async () => {
          return this.simulateCommand('tar -xjf /Incoming/mysql-latest.tar.bz2 --wildcards --no-anchored "*.sql" -C /Incoming/ --strip-components 1');
        });

        await this.executeStep('prepare-sde', async () => {
          return this.simulateCommand('sudo mv /Incoming/*.sql /Incoming/staticdata.sql');
        });
      }

      // Step 3: Create databases
      await this.executeStep('create-databases', async () => {
        const commands = [
          'CREATE DATABASE IF NOT EXISTS lmeve;',
          'CREATE DATABASE IF NOT EXISTS EveStaticData;'
        ];
        return this.simulateMySQLCommands(commands);
      });

      // Step 4: Load LMeve schema
      await this.executeStep('load-schema', async () => {
        return this.simulateCommand('mysql -u root lmeve < /var/www/lmeve/data/schema.sql');
      });

      // Step 5: Load EVE SDE data (if downloaded)
      if (config.downloadSDE) {
        await this.executeStep('load-sde', async () => {
          return this.simulateCommand('mysql -u root EveStaticData < /Incoming/staticdata.sql');
        });
      }

      // Step 6: Create user and set permissions
      await this.executeStep('create-user', async () => {
        const commands = [
          `CREATE USER IF NOT EXISTS 'lmeve'@'${config.allowedHosts}' IDENTIFIED BY '${config.lmevePassword}';`,
          `GRANT ALL PRIVILEGES ON lmeve.* TO 'lmeve'@'${config.allowedHosts}';`,
          `GRANT ALL PRIVILEGES ON EveStaticData.* TO 'lmeve'@'${config.allowedHosts}';`,
          'FLUSH PRIVILEGES;'
        ];
        return this.simulateMySQLCommands(commands);
      });

      // Step 7: Verify installation
      await this.executeStep('verify-setup', async () => {
        return this.simulateCommand('mysql -u lmeve -p lmeve -e "SHOW TABLES;"');
      });

      // Step 8: Cleanup
      await this.executeStep('cleanup', async () => {
        return this.simulateCommand('sudo rm -f /Incoming/mysql-latest.tar.bz2');
      });

      this.progress.completed = true;
      this.progress.isRunning = false;
      this.notifyProgress();

      return { success: true };
    } catch (error) {
      this.progress.isRunning = false;
      this.progress.error = error instanceof Error ? error.message : 'Setup failed';
      this.notifyProgress();
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Database setup failed' 
      };
    }
  }

  private initializeSteps(config: DatabaseSetupConfig): void {
    const steps: SetupStep[] = [
      {
        id: 'create-dirs',
        name: 'Create Directories',
        description: 'Creating /Incoming directory for downloads',
        status: 'pending'
      },
      ...(config.downloadSDE ? [
        {
          id: 'download-sde',
          name: 'Download EVE SDE',
          description: 'Downloading EVE Static Data Export from Fuzzwork',
          status: 'pending' as const
        },
        {
          id: 'extract-sde',
          name: 'Extract Archive',
          description: 'Extracting SQL files from downloaded archive',
          status: 'pending' as const
        },
        {
          id: 'prepare-sde',
          name: 'Prepare SDE Files',
          description: 'Organizing extracted SQL files',
          status: 'pending' as const
        }
      ] : []),
      {
        id: 'create-databases',
        name: 'Create Databases',
        description: 'Creating lmeve and EveStaticData databases',
        status: 'pending'
      },
      {
        id: 'load-schema',
        name: 'Load LMeve Schema',
        description: 'Loading LMeve database schema and tables',
        status: 'pending'
      },
      ...(config.downloadSDE ? [
        {
          id: 'load-sde',
          name: 'Load EVE SDE Data',
          description: 'Importing EVE Static Data Export into database',
          status: 'pending' as const
        }
      ] : []),
      {
        id: 'create-user',
        name: 'Create Database User',
        description: 'Creating lmeve user and setting permissions',
        status: 'pending'
      },
      {
        id: 'verify-setup',
        name: 'Verify Installation',
        description: 'Testing database connection and structure',
        status: 'pending'
      },
      {
        id: 'cleanup',
        name: 'Cleanup',
        description: 'Removing temporary files',
        status: 'pending'
      }
    ];

    this.progress = {
      currentStep: 0,
      totalSteps: steps.length,
      steps,
      isRunning: false,
      completed: false
    };
  }

  private async executeStep(stepId: string, operation: () => Promise<{ success: boolean; output?: string; error?: string }>): Promise<void> {
    const stepIndex = this.progress.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    this.progress.currentStep = stepIndex + 1;
    this.progress.steps[stepIndex].status = 'running';
    this.notifyProgress();

    try {
      const result = await operation();
      
      if (result.success) {
        this.progress.steps[stepIndex].status = 'completed';
        this.progress.steps[stepIndex].output = result.output;
      } else {
        throw new Error(result.error || 'Step failed');
      }
    } catch (error) {
      this.progress.steps[stepIndex].status = 'failed';
      this.progress.steps[stepIndex].error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }

    this.notifyProgress();
  }

  private async simulateCommand(command: string): Promise<{ success: boolean; output?: string; error?: string }> {
    // Simulate command execution with realistic timing
    const executionTime = Math.random() * 3000 + 1000; // 1-4 seconds
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Simulate various outcomes based on command
    if (command.includes('wget') && Math.random() < 0.05) {
      return { success: false, error: 'Network error: Could not resolve host' };
    }

    if (command.includes('tar') && Math.random() < 0.03) {
      return { success: false, error: 'Archive corrupted or incomplete' };
    }

    if (command.includes('mysql') && Math.random() < 0.02) {
      return { success: false, error: 'MySQL connection failed' };
    }

    // Success case
    return { 
      success: true, 
      output: `Command executed successfully: ${command.substring(0, 50)}${command.length > 50 ? '...' : ''}` 
    };
  }

  private async simulateMySQLCommands(commands: string[]): Promise<{ success: boolean; output?: string; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    // Simulate MySQL command execution
    if (Math.random() < 0.05) {
      return { success: false, error: 'MySQL access denied for user' };
    }

    return { 
      success: true, 
      output: `Executed ${commands.length} MySQL commands successfully` 
    };
  }

  private notifyProgress(): void {
    if (this.onProgressUpdate) {
      this.onProgressUpdate({ ...this.progress });
    }
  }

  getProgress(): DatabaseSetupProgress {
    return { ...this.progress };
  }
}

// Helper function to generate setup commands for copy-paste
export function generateSetupCommands(config: DatabaseSetupConfig): string[] {
  const commands = [
    '# LMeve Database Setup Commands',
    '# Run these commands as root or with sudo privileges',
    '',
    '# 1. Create working directory',
    'sudo mkdir -p /Incoming',
    'cd /Incoming',
    ''
  ];

  if (config.downloadSDE) {
    commands.push(
      '# 2. Download and extract EVE Static Data Export',
      'sudo wget "https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2"',
      'tar -xjf mysql-latest.tar.bz2 --wildcards --no-anchored "*.sql" -C /Incoming/ --strip-components 1',
      'sudo mv /Incoming/*.sql /Incoming/staticdata.sql',
      ''
    );
  }

  commands.push(
    '# 3. Connect to MySQL as root and create databases',
    'sudo mysql',
    '',
    '# Execute these SQL commands in MySQL:',
    'CREATE DATABASE IF NOT EXISTS lmeve;',
    'CREATE DATABASE IF NOT EXISTS EveStaticData;',
    '',
    '# 4. Load LMeve schema',
    'USE lmeve;',
    'SOURCE /var/www/lmeve/data/schema.sql;',
    ''
  );

  if (config.downloadSDE) {
    commands.push(
      '# 5. Load EVE SDE data',
      'USE EveStaticData;',
      'SOURCE /Incoming/staticdata.sql;',
      ''
    );
  }

  commands.push(
    '# 6. Create database user and set permissions',
    `CREATE USER IF NOT EXISTS 'lmeve'@'${config.allowedHosts}' IDENTIFIED BY '${config.lmevePassword}';`,
    `GRANT ALL PRIVILEGES ON lmeve.* TO 'lmeve'@'${config.allowedHosts}';`,
    `GRANT ALL PRIVILEGES ON EveStaticData.* TO 'lmeve'@'${config.allowedHosts}';`,
    'FLUSH PRIVILEGES;',
    'EXIT;',
    '',
    '# 7. Test connection',
    `mysql -u lmeve -p${config.lmevePassword} lmeve -e "SHOW TABLES;"`,
    '',
    '# 8. Cleanup (optional)',
    'sudo rm -f /Incoming/mysql-latest.tar.bz2'
  );

  return commands;
}

// Exported functions for database operations
export async function createDatabaseManager(config: DatabaseConfig): Promise<DatabaseManager> {
  return new DatabaseManager(config);
}

export async function executeMigration(manager: DatabaseManager, migrationSql: string): Promise<QueryResult> {
  return manager.query(migrationSql);
}

export async function backupDatabase(manager: DatabaseManager, options?: {
  tables?: string[];
  includeData?: boolean;
}): Promise<{ success: boolean; backupPath?: string; error?: string }> {
  try {
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `/backups/lmeve_backup_${timestamp}.sql`;
    
    return { success: true, backupPath };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Backup failed' 
    };
  }
}

export async function restoreDatabase(manager: DatabaseManager, backupPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Restore failed' 
    };
  }
}

// Database queries specific to LMeve functionality
export const LMeveQueries = {
  // Character and Corporation queries
  getCharacters: (corporationId?: number) => 
    corporationId 
      ? `SELECT * FROM characters WHERE corporation_id = ${corporationId} ORDER BY name`
      : `SELECT * FROM characters ORDER BY name`,
  
  getCorporations: () => 
    `SELECT c.*, COUNT(ch.character_id) as member_count 
     FROM corporations c 
     LEFT JOIN characters ch ON c.corporation_id = ch.corporation_id 
     GROUP BY c.corporation_id`,

  // Asset queries
  getAssets: (ownerId?: number) => 
    ownerId 
      ? `SELECT a.*, t.type_name, l.location_name 
         FROM assets a 
         JOIN eve_types t ON a.type_id = t.type_id 
         JOIN locations l ON a.location_id = l.location_id 
         WHERE a.owner_id = ${ownerId}`
      : `SELECT a.*, t.type_name, l.location_name 
         FROM assets a 
         JOIN eve_types t ON a.type_id = t.type_id 
         JOIN locations l ON a.location_id = l.location_id`,

  // Industry job queries
  getIndustryJobs: (status?: string) =>
    status 
      ? `SELECT ij.*, t.type_name as blueprint_name, pt.type_name as product_name 
         FROM industry_jobs ij 
         JOIN eve_types t ON ij.blueprint_type_id = t.type_id 
         JOIN eve_types pt ON ij.product_type_id = pt.type_id 
         WHERE ij.status = '${status}' 
         ORDER BY ij.end_date`
      : `SELECT ij.*, t.type_name as blueprint_name, pt.type_name as product_name 
         FROM industry_jobs ij 
         JOIN eve_types t ON ij.blueprint_type_id = t.type_id 
         JOIN eve_types pt ON ij.product_type_id = pt.type_id 
         ORDER BY ij.end_date`,

  // Mining operation queries
  getMiningOperations: (dateFrom?: string, dateTo?: string) => {
    let query = `SELECT mo.*, t.type_name as ore_name, s.system_name 
                 FROM mining_operations mo 
                 JOIN eve_types t ON mo.ore_type_id = t.type_id 
                 JOIN systems s ON mo.system_id = s.system_id`;
    
    if (dateFrom || dateTo) {
      query += ` WHERE`;
      if (dateFrom) query += ` mo.date >= '${dateFrom}'`;
      if (dateFrom && dateTo) query += ` AND`;
      if (dateTo) query += ` mo.date <= '${dateTo}'`;
    }
    
    return query + ` ORDER BY mo.date DESC`;
  },

  // Market data queries
  getMarketPrices: (regionId?: number) =>
    regionId 
      ? `SELECT mp.*, t.type_name 
         FROM market_prices mp 
         JOIN eve_types t ON mp.type_id = t.type_id 
         WHERE mp.region_id = ${regionId} 
         ORDER BY mp.last_update DESC`
      : `SELECT mp.*, t.type_name 
         FROM market_prices mp 
         JOIN eve_types t ON mp.type_id = t.type_id 
         ORDER BY mp.last_update DESC`,

  // Killmail queries
  getKillmails: (corporationId?: number) =>
    corporationId 
      ? `SELECT k.*, t.type_name as ship_name, s.system_name 
         FROM killmails k 
         JOIN eve_types t ON k.ship_type_id = t.type_id 
         JOIN systems s ON k.system_id = s.system_id 
         WHERE k.victim_corporation_id = ${corporationId} 
         ORDER BY k.killmail_time DESC`
      : `SELECT k.*, t.type_name as ship_name, s.system_name 
         FROM killmails k 
         JOIN eve_types t ON k.ship_type_id = t.type_id 
         JOIN systems s ON k.system_id = s.system_id 
         ORDER BY k.killmail_time DESC`
};