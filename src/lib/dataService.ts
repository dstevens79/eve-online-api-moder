// Database service for LMeve application data operations
// This provides higher-level data access functions that use the database manager

import { DatabaseManager, LMeveQueries } from './database';
import { 
  Member, 
  Asset, 
  ManufacturingJob, 
  Blueprint, 
  MiningOperation, 
  Corporation,
  DashboardStats,
  ActivityLog,
  MarketPrice,
  KillmailSummary,
  IncomeRecord,
  IncomeAnalytics
} from './types';

export class LMeveDataService {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // Character and Corporation operations
  async getMembers(corporationId?: number): Promise<Member[]> {
    const result = await this.dbManager.query<Member>(
      LMeveQueries.getCharacters(corporationId)
    );
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch members');
    }

    // Return mock data for demonstration
    return [
      {
        id: 1,
        name: 'John Doe',
        corporationId: 498125261,
        characterId: 91316135,
        joinDate: '2024-01-15T10:30:00Z',
        lastLogin: '2024-12-28T14:22:00Z',
        title: 'CEO',
        roles: ['Director', 'Station Manager', 'Accountant'],
        isActive: true,
        securityStatus: 5.0,
        location: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
        ship: 'Raven'
      },
      {
        id: 2,
        name: 'Jane Smith',
        corporationId: 498125261,
        characterId: 91316136,
        joinDate: '2024-02-20T16:45:00Z',
        lastLogin: '2024-12-28T12:15:00Z',
        title: 'Director',
        roles: ['Junior Accountant', 'Hangar Can Take 1'],
        isActive: true,
        securityStatus: 2.1,
        location: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
        ship: 'Retriever'
      },
      {
        id: 3,
        name: 'Bob Wilson',
        corporationId: 498125261,
        characterId: 91316137,
        joinDate: '2024-03-10T09:20:00Z',
        lastLogin: '2024-12-27T20:30:00Z',
        title: 'Member',
        roles: ['Hangar Can Take 2'],
        isActive: true,
        securityStatus: -0.5,
        location: 'Amarr VIII (Oris) - Emperor Family Academy',
        ship: 'Procurer'
      }
    ];
  }

  async getCorporations(): Promise<Corporation[]> {
    const result = await this.dbManager.query<Corporation>(
      LMeveQueries.getCorporations()
    );
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch corporations');
    }

    // Return mock data
    return [
      {
        id: 498125261,
        name: 'Test Alliance Please Ignore',
        ticker: 'TEST',
        memberCount: 42,
        taxRate: 0.1,
        ceoId: 91316135,
        ceoName: 'John Doe',
        allianceId: 99000006,
        allianceName: 'Test Alliance Please Ignore',
        founded: '2015-03-15T12:00:00Z',
        description: 'A test corporation for demonstration purposes',
        headquarters: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
        netWorth: 15750000000,
        walletBalance: 2500000000
      }
    ];
  }

  // Asset operations
  async getAssets(ownerId?: number): Promise<Asset[]> {
    const result = await this.dbManager.query<Asset>(
      LMeveQueries.getAssets(ownerId)
    );
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch assets');
    }

    // Return mock data
    return [
      {
        id: 'asset_1',
        typeId: 648,
        typeName: 'Raven',
        quantity: 1,
        location: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
        locationId: 60003760,
        owner: 'John Doe',
        ownerId: 91316135,
        category: 'ship',
        estimatedValue: 120000000,
        lastUpdate: '2024-12-28T14:22:00Z'
      },
      {
        id: 'asset_2',
        typeId: 17922,
        typeName: 'Retriever',
        quantity: 2,
        location: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
        locationId: 60011866,
        owner: 'Jane Smith',
        ownerId: 91316136,
        category: 'ship',
        estimatedValue: 25000000,
        lastUpdate: '2024-12-28T12:15:00Z'
      }
    ];
  }

  // Manufacturing operations
  async getManufacturingJobs(status?: string): Promise<ManufacturingJob[]> {
    const result = await this.dbManager.query<ManufacturingJob>(
      LMeveQueries.getIndustryJobs(status)
    );
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch manufacturing jobs');
    }

    // Return mock data
    return [
      {
        id: 'job_1',
        blueprintId: 648,
        blueprintName: 'Raven Blueprint',
        productTypeId: 648,
        productTypeName: 'Raven',
        runs: 1,
        startDate: '2024-12-25T10:00:00Z',
        endDate: '2024-12-29T18:00:00Z',
        status: 'active',
        facility: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
        facilityId: 60003760,
        installerId: 91316135,
        installerName: 'John Doe',
        cost: 85000000,
        productQuantity: 1,
        materialEfficiency: 10,
        timeEfficiency: 20,
        duration: 388800,
        materials: [
          {
            typeId: 34,
            typeName: 'Tritanium',
            quantity: 5000000,
            available: 5000000,
            category: 'mineral',
            unitPrice: 5.2,
            totalValue: 26000000
          }
        ],
        priority: 'high'
      }
    ];
  }

  // Mining operations
  async getMiningOperations(dateFrom?: string, dateTo?: string): Promise<MiningOperation[]> {
    const result = await this.dbManager.query<MiningOperation>(
      LMeveQueries.getMiningOperations(dateFrom, dateTo)
    );
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch mining operations');
    }

    // Return mock data
    return [
      {
        id: 'mining_1',
        date: '2024-12-28T10:00:00Z',
        system: 'Jita',
        systemId: 30000142,
        ore: 'Veldspar',
        oreTypeId: 1230,
        quantity: 15000,
        minerId: 91316136,
        minerName: 'Jane Smith',
        estimatedValue: 780000,
        refined: true,
        minerals: [
          {
            typeId: 34,
            typeName: 'Tritanium',
            quantity: 11250,
            value: 58500
          }
        ]
      }
    ];
  }

  // Market operations
  async getMarketPrices(regionId?: number): Promise<MarketPrice[]> {
    const result = await this.dbManager.query<MarketPrice>(
      LMeveQueries.getMarketPrices(regionId)
    );
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch market prices');
    }

    // Return mock data
    return [
      {
        typeId: 34,
        typeName: 'Tritanium',
        buyPrice: 5.2,
        sellPrice: 5.4,
        lastUpdate: '2024-12-28T14:22:00Z',
        volume: 1500000,
        region: 'The Forge',
        regionId: 10000002
      },
      {
        typeId: 648,
        typeName: 'Raven',
        buyPrice: 115000000,
        sellPrice: 125000000,
        lastUpdate: '2024-12-28T14:20:00Z',
        volume: 45,
        region: 'The Forge',
        regionId: 10000002
      }
    ];
  }

  // Killmails
  async getKillmails(corporationId?: number): Promise<KillmailSummary[]> {
    const result = await this.dbManager.query<KillmailSummary>(
      LMeveQueries.getKillmails(corporationId)
    );
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch killmails');
    }

    // Return mock data
    return [
      {
        id: 'km_1',
        timestamp: '2024-12-27T15:30:00Z',
        victim: {
          characterId: 91316137,
          characterName: 'Bob Wilson',
          corporationId: 498125261,
          corporationName: 'Test Alliance Please Ignore',
          shipTypeId: 17922,
          shipTypeName: 'Retriever',
          damageTaken: 15420
        },
        attackers: [
          {
            characterId: 99999999,
            characterName: 'Enemy Pilot',
            corporationId: 88888888,
            corporationName: 'Hostile Corp',
            shipTypeId: 17841,
            shipTypeName: 'Rupture',
            finalBlow: true
          }
        ],
        system: 'Jita',
        systemId: 30000142,
        totalValue: 25000000
      }
    ];
  }

  // Income tracking
  async getIncomeRecords(pilotId?: number, dateFrom?: string, dateTo?: string): Promise<IncomeRecord[]> {
    // Mock data
    return [
      {
        id: 'income_1',
        pilotId: 91316135,
        pilotName: 'John Doe',
        jobId: 'job_1',
        jobType: 'manufacturing',
        productTypeId: 648,
        productTypeName: 'Raven',
        completedDate: '2024-12-27T18:00:00Z',
        runs: 1,
        productQuantity: 1,
        materialCost: 75000000,
        laborCost: 5000000,
        facilityCost: 5000000,
        totalCost: 85000000,
        marketValue: 120000000,
        profit: 35000000,
        profitMargin: 0.291,
        efficiency: {
          material: 10,
          time: 20
        },
        location: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
        locationId: 60003760
      }
    ];
  }

  async getIncomeAnalytics(dateFrom?: string, dateTo?: string): Promise<IncomeAnalytics> {
    // Mock data
    return {
      totalRevenue: 120000000,
      totalProfit: 35000000,
      averageProfitMargin: 0.291,
      jobsCompleted: 1,
      topPilots: [
        {
          pilotId: 91316135,
          pilotName: 'John Doe',
          totalProfit: 35000000,
          jobsCompleted: 1,
          averageProfit: 35000000
        }
      ],
      topProducts: [
        {
          typeId: 648,
          typeName: 'Raven',
          totalProfit: 35000000,
          unitsProduced: 1,
          averageProfit: 35000000
        }
      ],
      monthlyTrends: [
        {
          month: '2024-12',
          revenue: 120000000,
          profit: 35000000,
          jobs: 1
        }
      ]
    };
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    // Simulate fetching multiple data sources
    const [members, assets, jobs, mining] = await Promise.all([
      this.getMembers(),
      this.getAssets(),
      this.getManufacturingJobs(),
      this.getMiningOperations()
    ]);

    const activeMembers = members.filter(m => m.isActive).length;
    const totalAssetsValue = assets.reduce((sum, asset) => sum + asset.estimatedValue, 0);
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;

    return {
      totalMembers: members.length,
      activeMembers,
      totalAssets: assets.length,
      totalAssetsValue,
      activeJobs,
      completedJobsThisMonth: completedJobs,
      miningOperationsThisMonth: mining.length,
      miningValueThisMonth: mining.reduce((sum, op) => sum + op.estimatedValue, 0),
      corpWalletBalance: 2500000000,
      recentActivity: [
        {
          id: 'activity_1',
          timestamp: '2024-12-28T14:22:00Z',
          type: 'login',
          memberId: 91316135,
          memberName: 'John Doe',
          description: 'Logged in to system'
        },
        {
          id: 'activity_2',
          timestamp: '2024-12-28T12:15:00Z',
          type: 'asset_update',
          memberId: 91316136,
          memberName: 'Jane Smith',
          description: 'Updated asset locations'
        }
      ]
    };
  }

  // Generic query execution
  async executeQuery<T = any>(sql: string, params: any[] = []) {
    return await this.dbManager.query<T>(sql, params);
  }
}

// Factory function to create data service
export function createDataService(dbManager: DatabaseManager): LMeveDataService {
  return new LMeveDataService(dbManager);
}