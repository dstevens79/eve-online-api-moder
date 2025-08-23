// Hooks for using LMeve data service throughout the application
import { useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';
import { createDataService, LMeveDataService } from './dataService';
import { 
  Member, 
  Asset, 
  ManufacturingJob, 
  MiningOperation, 
  Corporation,
  DashboardStats,
  MarketPrice,
  KillmailSummary,
  IncomeRecord,
  IncomeAnalytics
} from './types';

// Hook to get the data service instance
export function useDataService(): LMeveDataService | null {
  const { manager } = useDatabase();
  
  if (!manager) {
    return null;
  }
  
  return createDataService(manager);
}

// Hook for loading members data
export function useMembers(corporationId?: number) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const loadMembers = async () => {
    if (!dataService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.getMembers(corporationId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [dataService, corporationId]);

  return { members, loading, error, reload: loadMembers };
}

// Hook for loading assets data
export function useAssets(ownerId?: number) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const loadAssets = async () => {
    if (!dataService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.getAssets(ownerId);
      setAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [dataService, ownerId]);

  return { assets, loading, error, reload: loadAssets };
}

// Hook for loading manufacturing jobs
export function useManufacturingJobs(status?: string) {
  const [jobs, setJobs] = useState<ManufacturingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const loadJobs = async () => {
    if (!dataService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.getManufacturingJobs(status);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load manufacturing jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [dataService, status]);

  return { jobs, loading, error, reload: loadJobs };
}

// Hook for loading mining operations
export function useMiningOperations(dateFrom?: string, dateTo?: string) {
  const [operations, setOperations] = useState<MiningOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const loadOperations = async () => {
    if (!dataService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.getMiningOperations(dateFrom, dateTo);
      setOperations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mining operations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperations();
  }, [dataService, dateFrom, dateTo]);

  return { operations, loading, error, reload: loadOperations };
}

// Hook for loading market prices
export function useMarketPrices(regionId?: number) {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const loadPrices = async () => {
    if (!dataService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.getMarketPrices(regionId);
      setPrices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [dataService, regionId]);

  return { prices, loading, error, reload: loadPrices };
}

// Hook for loading killmails
export function useKillmails(corporationId?: number) {
  const [killmails, setKillmails] = useState<KillmailSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const loadKillmails = async () => {
    if (!dataService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.getKillmails(corporationId);
      setKillmails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load killmails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKillmails();
  }, [dataService, corporationId]);

  return { killmails, loading, error, reload: loadKillmails };
}

// Hook for loading income data
export function useIncomeRecords(pilotId?: number, dateFrom?: string, dateTo?: string) {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const loadRecords = async () => {
    if (!dataService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.getIncomeRecords(pilotId, dateFrom, dateTo);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load income records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [dataService, pilotId, dateFrom, dateTo]);

  return { records, loading, error, reload: loadRecords };
}

// Hook for loading income analytics
export function useIncomeAnalytics(dateFrom?: string, dateTo?: string) {
  const [analytics, setAnalytics] = useState<IncomeAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const loadAnalytics = async () => {
    if (!dataService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.getIncomeAnalytics(dateFrom, dateTo);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load income analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dataService, dateFrom, dateTo]);

  return { analytics, loading, error, reload: loadAnalytics };
}

// Hook for loading dashboard statistics
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const loadStats = async () => {
    if (!dataService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [dataService]);

  return { stats, loading, error, reload: loadStats };
}

// Hook for executing custom queries
export function useQuery<T = any>() {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataService = useDataService();

  const executeQuery = async (sql: string, params: any[] = []) => {
    if (!dataService) {
      setError('Database service not available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await dataService.executeQuery<T>(sql, params);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Query failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, executeQuery };
}