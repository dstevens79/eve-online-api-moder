// Enhanced data service that integrates authentication, ESI API, and database
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCorporationAuth } from './corp-auth';
import { DatabaseManager } from './database';
import { LMeveDataService } from './dataService';
import { eveApi } from './eveApi';
import { useKV } from '@github/spark/hooks';
import type { 
  Member, 
  Asset, 
  ManufacturingJob, 
  Corporation,
  DashboardStats,
  MarketPrice,
  MiningOperation,
  KillmailSummary,
  IncomeRecord,
  IncomeAnalytics
} from './types';

interface DataSyncStatus {
  isRunning: boolean;
  stage: string;
  progress: number;
  lastSync?: string;
  error?: string;
}

interface LMeveDataContextType {
  // Services
  dataService: LMeveDataService | null;
  dbManager: DatabaseManager | null;
  
  // Data sync
  syncStatus: DataSyncStatus;
  syncData: () => Promise<void>;
  
  // Cached data (with ESI integration)
  members: Member[];
  assets: Asset[];
  manufacturingJobs: ManufacturingJob[];
  miningOperations: MiningOperation[];
  marketPrices: MarketPrice[];
  killmails: KillmailSummary[];
  incomeRecords: IncomeRecord[];
  dashboardStats: DashboardStats | null;
  
  // Data loading states
  loading: {
    members: boolean;
    assets: boolean;
    manufacturing: boolean;
    mining: boolean;
    market: boolean;
    killmails: boolean;
    income: boolean;
  };
  
  // Data refresh functions
  refreshMembers: () => Promise<void>;
  refreshAssets: () => Promise<void>;
  refreshManufacturing: () => Promise<void>;
  refreshMining: () => Promise<void>;
  refreshMarket: () => Promise<void>;
  refreshKillmails: () => Promise<void>;
  refreshIncome: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

const LMeveDataContext = createContext<LMeveDataContextType | null>(null);

export function LMeveDataProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useCorporationAuth();
  const [dbSettings] = useKV('corp-settings', null);
  
  // Services
  const [dbManager, setDbManager] = useState<DatabaseManager | null>(null);
  const [dataService, setDataService] = useState<LMeveDataService | null>(null);
  
  // Sync status
  const [syncStatus, setSyncStatus] = useState<DataSyncStatus>({
    isRunning: false,
    stage: 'Idle',
    progress: 0
  });
  
  // Cached data
  const [members, setMembers] = useState<Member[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [manufacturingJobs, setManufacturingJobs] = useState<ManufacturingJob[]>([]);
  const [miningOperations, setMiningOperations] = useState<MiningOperation[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [killmails, setKillmails] = useState<KillmailSummary[]>([]);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    members: false,
    assets: false,
    manufacturing: false,
    mining: false,
    market: false,
    killmails: false,
    income: false
  });

  // Initialize database manager when settings change
  useEffect(() => {
    if (dbSettings?.database && isAuthenticated) {
      const manager = new DatabaseManager(dbSettings.database);
      setDbManager(manager);
      setDataService(new LMeveDataService(manager));
    } else {
      setDbManager(null);
      setDataService(null);
    }
  }, [dbSettings?.database, isAuthenticated]);

  // Enhanced data fetching with ESI integration
  const fetchMembersWithESI = async (): Promise<Member[]> => {
    if (!user || !dataService) return [];

    try {
      // First try to get from database
      let members = await dataService.getMembers(user.corporationId);
      
      // If we have valid ESI token, try to enhance with real data
      if (user.accessToken && !isTokenExpired()) {
        try {
          // Get corporation info to get member count
          const corpInfo = await eveApi.getCorporation(user.corporationId);
          
          // For a full implementation, we'd fetch the actual member list
          // For now, we'll update the existing mock data with real corp info
          members = members.map(member => ({
            ...member,
            corporationId: user.corporationId,
            // Could enhance with real character info here
          }));
        } catch (esiError) {
          console.warn('ESI member data fetch failed, using database data:', esiError);
        }
      }
      
      return members;
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return [];
    }
  };

  const fetchAssetsWithESI = async (): Promise<Asset[]> => {
    if (!user || !dataService) return [];

    try {
      // First try to get from database
      let assets = await dataService.getAssets(user.corporationId);
      
      // If we have valid ESI token, try to get real asset data
      if (user.accessToken && !isTokenExpired()) {
        try {
          const esiAssets = await eveApi.getCorporationAssets(user.corporationId, user.accessToken);
          
          // Convert ESI assets to our format
          const enhancedAssets = await Promise.all(
            esiAssets.slice(0, 100).map(async (esiAsset) => { // Limit to first 100 for demo
              try {
                const typeInfo = await eveApi.getType(esiAsset.type_id);
                return {
                  id: `esi_${esiAsset.item_id}`,
                  typeId: esiAsset.type_id,
                  typeName: typeInfo.name,
                  quantity: esiAsset.quantity,
                  location: `Location ${esiAsset.location_id}`, // Would resolve with ESI
                  locationId: esiAsset.location_id,
                  owner: user.characterName,
                  ownerId: user.characterId,
                  category: 'unknown', // Would determine from type info
                  estimatedValue: 0, // Would calculate from market data
                  lastUpdate: new Date().toISOString()
                };
              } catch {
                return null;
              }
            })
          );

          const validAssets = enhancedAssets.filter(Boolean) as Asset[];
          assets = [...assets, ...validAssets];
        } catch (esiError) {
          console.warn('ESI asset data fetch failed, using database data:', esiError);
        }
      }
      
      return assets;
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      return [];
    }
  };

  const fetchManufacturingWithESI = async (): Promise<ManufacturingJob[]> => {
    if (!user || !dataService) return [];

    try {
      // First try to get from database
      let jobs = await dataService.getManufacturingJobs();
      
      // If we have valid ESI token, try to get real industry jobs
      if (user.accessToken && !isTokenExpired()) {
        try {
          const esiJobs = await eveApi.getCorporationIndustryJobs(user.corporationId, user.accessToken);
          
          // Convert ESI jobs to our format
          const enhancedJobs = await Promise.all(
            esiJobs.slice(0, 50).map(async (esiJob) => { // Limit for demo
              try {
                const blueprintInfo = await eveApi.getType(esiJob.blueprint_type_id);
                const productInfo = esiJob.product_type_id ? await eveApi.getType(esiJob.product_type_id) : null;
                
                return {
                  id: `esi_${esiJob.job_id}`,
                  blueprintId: esiJob.blueprint_type_id,
                  blueprintName: blueprintInfo.name,
                  productTypeId: esiJob.product_type_id || 0,
                  productTypeName: productInfo?.name || 'Unknown',
                  runs: esiJob.runs,
                  startDate: esiJob.start_date,
                  endDate: esiJob.end_date,
                  status: esiJob.status,
                  facility: `Station ${esiJob.station_id}`, // Would resolve with ESI
                  facilityId: esiJob.station_id,
                  installerId: esiJob.installer_id,
                  installerName: 'Unknown', // Would resolve with ESI
                  cost: esiJob.cost || 0,
                  productQuantity: esiJob.runs,
                  materialEfficiency: 0, // Not available in industry jobs endpoint
                  timeEfficiency: 0,
                  duration: esiJob.duration,
                  materials: [], // Would need to calculate from blueprints
                  priority: 'normal' as const
                };
              } catch {
                return null;
              }
            })
          );

          const validJobs = enhancedJobs.filter(Boolean) as ManufacturingJob[];
          jobs = [...jobs, ...validJobs];
        } catch (esiError) {
          console.warn('ESI industry job data fetch failed, using database data:', esiError);
        }
      }
      
      return jobs;
    } catch (error) {
      console.error('Failed to fetch manufacturing jobs:', error);
      return [];
    }
  };

  const isTokenExpired = (): boolean => {
    return user ? Date.now() >= user.tokenExpiry - 300000 : true; // 5 min buffer
  };

  // Data refresh functions
  const refreshMembers = async () => {
    setLoading(prev => ({ ...prev, members: true }));
    try {
      const data = await fetchMembersWithESI();
      setMembers(data);
    } finally {
      setLoading(prev => ({ ...prev, members: false }));
    }
  };

  const refreshAssets = async () => {
    setLoading(prev => ({ ...prev, assets: true }));
    try {
      const data = await fetchAssetsWithESI();
      setAssets(data);
    } finally {
      setLoading(prev => ({ ...prev, assets: false }));
    }
  };

  const refreshManufacturing = async () => {
    setLoading(prev => ({ ...prev, manufacturing: true }));
    try {
      const data = await fetchManufacturingWithESI();
      setManufacturingJobs(data);
    } finally {
      setLoading(prev => ({ ...prev, manufacturing: false }));
    }
  };

  const refreshMining = async () => {
    setLoading(prev => ({ ...prev, mining: true }));
    try {
      if (dataService) {
        const data = await dataService.getMiningOperations();
        setMiningOperations(data);
      }
    } finally {
      setLoading(prev => ({ ...prev, mining: false }));
    }
  };

  const refreshMarket = async () => {
    setLoading(prev => ({ ...prev, market: true }));
    try {
      if (dataService) {
        const data = await dataService.getMarketPrices();
        setMarketPrices(data);
      }
    } finally {
      setLoading(prev => ({ ...prev, market: false }));
    }
  };

  const refreshKillmails = async () => {
    setLoading(prev => ({ ...prev, killmails: true }));
    try {
      if (dataService) {
        const data = await dataService.getKillmails(user?.corporationId);
        setKillmails(data);
      }
    } finally {
      setLoading(prev => ({ ...prev, killmails: false }));
    }
  };

  const refreshIncome = async () => {
    setLoading(prev => ({ ...prev, income: true }));
    try {
      if (dataService) {
        const data = await dataService.getIncomeRecords();
        setIncomeRecords(data);
      }
    } finally {
      setLoading(prev => ({ ...prev, income: false }));
    }
  };

  const refreshDashboard = async () => {
    try {
      if (dataService) {
        const stats = await dataService.getDashboardStats();
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('Failed to refresh dashboard stats:', error);
    }
  };

  // Comprehensive data sync function
  const syncData = async () => {
    if (syncStatus.isRunning || !dataService || !user) return;

    setSyncStatus({
      isRunning: true,
      stage: 'Initializing...',
      progress: 0
    });

    try {
      const stages = [
        { name: 'Syncing corporation members...', action: refreshMembers },
        { name: 'Updating asset locations...', action: refreshAssets },
        { name: 'Fetching industry jobs...', action: refreshManufacturing },
        { name: 'Collecting mining data...', action: refreshMining },
        { name: 'Updating market prices...', action: refreshMarket },
        { name: 'Processing killmails...', action: refreshKillmails },
        { name: 'Calculating income...', action: refreshIncome },
        { name: 'Finalizing dashboard...', action: refreshDashboard }
      ];

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        setSyncStatus({
          isRunning: true,
          stage: stage.name,
          progress: (i / stages.length) * 100
        });

        await stage.action();
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setSyncStatus({
        isRunning: false,
        stage: 'Sync completed',
        progress: 100,
        lastSync: new Date().toISOString()
      });

      // Reset status after a short delay
      setTimeout(() => {
        setSyncStatus({
          isRunning: false,
          stage: 'Idle',
          progress: 0,
          lastSync: new Date().toISOString()
        });
      }, 3000);

    } catch (error) {
      setSyncStatus({
        isRunning: false,
        stage: 'Sync failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Initial data load when authenticated
  useEffect(() => {
    if (isAuthenticated && dataService) {
      // Load initial data without full sync
      refreshDashboard();
    }
  }, [isAuthenticated, dataService]);

  const contextValue: LMeveDataContextType = {
    dataService,
    dbManager,
    syncStatus,
    syncData,
    members,
    assets,
    manufacturingJobs,
    miningOperations,
    marketPrices,
    killmails,
    incomeRecords,
    dashboardStats,
    loading,
    refreshMembers,
    refreshAssets,
    refreshManufacturing,
    refreshMining,
    refreshMarket,
    refreshKillmails,
    refreshIncome,
    refreshDashboard
  };

  return (
    <LMeveDataContext.Provider value={contextValue}>
      {children}
    </LMeveDataContext.Provider>
  );
}

export function useLMeveData() {
  const context = useContext(LMeveDataContext);
  if (!context) {
    throw new Error('useLMeveData must be used within a LMeveDataProvider');
  }
  return context;
}