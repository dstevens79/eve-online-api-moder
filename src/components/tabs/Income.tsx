import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, Se
import { 
  TrendDown,
  Factory,
  Package
  Filter,
  Eye,
  ArrowDown,
  Gear,
} from '
import { I

  Filter,
  Download,
  Eye,
  ArrowUp,
  ArrowDown,
  Clock,
  Gear,
  Save
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { IncomeRecord, IncomeAnalytics } from '@/lib/types';
import { toast } from 'sonner';

export function Income() {
  const [incomeRecords] = useKV<IncomeRecord[]>('income-records', []);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedPilot, setSelectedPilot] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in a real app this would come from ESI API and industry calculations
  const mockIncomeRecords: IncomeRecord[] = [
    {
      id: '1',
      pilotId: 91316135,
      pilotName: 'John Industrialist',
      jobId: 'job_12345',
      jobType: 'manufacturing',
      productTypeId: 587,
      productTypeName: 'Rifter',
      completedDate: '2024-01-15T14:30:00Z',
      runs: 10,
      productQuantity: 10,
      materialCost: 25000000,
      laborCost: 1500000,
      facilityCost: 500000,
      totalCost: 27000000,
      marketValue: 35000000,
      profit: 8000000,
      profitMargin: 0.229,
      efficiency: {
        material: 10,
        time: 20
      },
      location: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      locationId: 60003760
    },
    {
      id: '2',
      pilotId: 91316136,
      pilotName: 'Jane Manufacturer',
      jobId: 'job_12346',
      jobType: 'manufacturing',
      productTypeId: 12058,
      productTypeName: 'Hobgoblin I',
      completedDate: '2024-01-14T16:45:00Z',
      runs: 50,
      productQuantity: 50,
      materialCost: 8000000,
      laborCost: 800000,
      facilityCost: 200000,
      totalCost: 9000000,
      marketValue: 12500000,
      profit: 3500000,
      profitMargin: 0.28,
      efficiency: {
        material: 10,
        time: 18
      },
      location: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
      locationId: 60011866
    },
    {
      id: '3',
      pilotId: 91316135,
      pilotName: 'John Industrialist',
      jobId: 'job_12347',
      jobType: 'research',
      productTypeId: 0,
      productTypeName: 'Blueprint Research',
      completedDate: '2024-01-13T09:15:00Z',
      runs: 1,
      productQuantity: 1,
      materialCost: 0,
      laborCost: 2000000,
      facilityCost: 300000,
      totalCost: 2300000,
      marketValue: 5000000,
      profit: 2700000,
      profitMargin: 0.54,
      efficiency: {
        material: 0,
        time: 15
      },
      location: 'Amarr VIII (Oris) - Emperor Family Academy',
      locationId: 60008494
    }
  ];

  // Use mock data if no real data is available
  const records = incomeRecords.length > 0 ? incomeRecords : mockIncomeRecords;

  // Filter records based on selected criteria
  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Filter by period
    const now = new Date();
    let cutoffDate: Date;
    filtered = filtered.filte
    // Filter by
      filtered = filtered.filter(record => record.pilotId.toString() ==

    if (selectedJ
    }
    // Filter 
      filtered = 
        record.productTypeName.toLowerCase().includes(searchTerm.toLower
    }
    return fil

  con

    const averageProfitMargin = totalCost > 0 ? totalProfit / totalCost : 0;

    filteredRecords.fo
      existing.profit += record.pr
      pilotStats.set(record.pilotId, existing);


        pilotName: stats.
        jobsCompleted: stats.jobs,
      }))
     

    filteredRecords.forEach(
      existing.profit
      productStats.set(record.productTypeId

      .map(([typeId, stats]) => ({
        
     

      .slice(0, 5);
    return {

      jobsCompleted: fil
      topProducts,
    };

    if (amount >= 1e12) return `${(amount / 1e12).toFixed(1)}T`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;


    return `${(value * 100).toFixed(1)}%`;

    switch (type) {
      case 'research': return 'bg-purpl
      case 'invention': r
    }



    <div className="space-y-6">
        <h2 clas
          Income Analytics
        <p className="text-muted-f
        </p>

      <Ca
          <CardTitle className="flex items-center ga
            Filters

          <div className="gri
              <label className="text-sm font-medium">Time Period</label>
                <SelectTrigger>
                </SelectTrigger>
                  <SelectItem value="7d
                  <SelectItem value="90d">Last 
                </SelectContent>
       

              <Select value={selectedPilot} onValueChange=
                  <SelectValue />
               
                  {uniquePilo
                      {pilot.name}
                  ))}
              </Select>

              <label className="text-sm font-medium"
                <Se

            
                  <
                  
              </Select>

              <l
                pl
                onChange={(e) => setSearchTerm(e.target.value)}
      
        </CardContent>

      <div className="grid grid-cols-1 md:grid-co
          <CardHeader className="flex flex-row items-center just
            <TrendUp className="h-4 w-4 text-muted-foreground"
          <CardContent>
            <p className="text-xs text-muted-foreground">
            </p>
    

            <CardTitle className="text-sm font-mediu
          </CardHeader>
    

          </CardContent>

          <CardHeader className="flex flex-row items-center justify-between space-y-0
            <Factory className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <p className="text-xs text-muted-foreground">
            </p>
     
    

          </CardHeader>
            <div className="text-2xl font-bold">{ana
              Contributing to corporation income

      </di
      <Tabs defaultValue="overv
          <
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>
        <TabsContent value
            <
                <CardTitle>Top Pilots by Prof
              <CardContent>
            
            

                     
            
                    
                      </div>
                        <p class
                   
                      
                  ))}
              </CardC

              <CardHeader>
              </CardHeader>
                <div className="space-y-4">
                    <div key={p
                        <div clas
                        </div>
                          <p cl
                            {product.unitsProduced.toLocaleString
                        </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foregr
                        </p>
                    </d
                </

        </TabsContent>
        <TabsContent value="pilots" className="space-y-6">
            <CardHeader>
            </CardHeader>
              <div className="spa
                  <div key={pilo
                      <h4 class
                        {formatISK(pilot.totalProfit)} profit
                    </div>
                      <div>
                        <p classNa
                      <div>
                     
                      <div>
                       
                  

                ))}
            </CardContent>
        </TabsContent>
        <TabsContent value="pro
            <CardHeader>
            </CardHeader>
              <div className="s
                  <div key={product.typeId} className="p-4 borde
                      <h4 className="font-medium">{product.typeName}</h4>
                        {formatISK(product.totalProfit)} profit
                    </div>
                      <div>
                        <p class
                      <
                  

                        <p className="f
                        </p>
                    
                ))}
            </CardContent>
        </TabsContent>
        <TabsCon
            <CardH
              <B
                Export
            <

                  <thead>
                      <th className="text-left p-3">Date</th>
              
                      <th className="text-right p-3">Quantity</th>
                      <th className="text-right p-3">Revenue</th>
                      <th className="text-right p-3">Margin</th>
                    </t
                  <tbod
                      <tr key={record.id}>
                          {new Date(record.completedDate)
                        <td className="p-3">{record.pilotName}<
                
                        
               

              
                        </td>
                          {formatISK(record.marketValue)}
                        <td className="p-3 text-right font-mono text
                       
                       
                        <td className="p-3 text-center">
                            <Eye size={16} />
                        </td>
                
                </table>
            </C

    </div>
}





















































































































































































































































