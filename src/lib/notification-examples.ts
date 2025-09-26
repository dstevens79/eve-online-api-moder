/**
 * Sample usage of the notification system
 * This demonstrates how other parts of LMeve would integrate notifications
 */

import { notify, notificationManager } from '@/lib/notification-manager';
import { NotificationSettings } from '@/lib/types';

// Example: Manufacturing job completion handler
export async function handleManufacturingJobCompleted(
  jobId: number,
  jobData: {
    installerId: number;
    installerName: string;
    productTypeName: string;
    productQuantity: number;
    location: string;
    corporationName: string;
    corporationId: number;
    allianceId?: number;
    allianceName?: string;
  },
  notificationSettings: NotificationSettings
) {
  console.log(`Manufacturing job ${jobId} completed for ${jobData.installerName}`);
  
  // Send notification
  const result = await notify.manufacturingComplete({
    pilot: jobData.installerName,
    pilotId: jobData.installerId,
    item: jobData.productTypeName,
    itemId: 0, // Would be retrieved from ESI data
    count: jobData.productQuantity,
    location: jobData.location,
    corporation: jobData.corporationName,
    corporationId: jobData.corporationId,
    allianceId: jobData.allianceId,
    alliance: jobData.allianceName,
    jobId: jobId,
    duration: '2 hours 15 minutes' // Would be calculated from job data
  }, notificationSettings);

  if (result.success) {
    console.log('Manufacturing completion notification sent successfully');
  } else {
    console.error('Failed to send manufacturing notification:', result.errors);
  }
}

// Example: Queue monitoring system
export async function monitorProductionQueues(
  corporationData: {
    manufacturingJobs: Array<{ endDate: string; status: string }>;
    corporationName: string;
    corporationId: number;
    allianceId?: number;
  },
  notificationSettings: NotificationSettings
) {
  const activeJobs = corporationData.manufacturingJobs.filter(job => job.status === 'active');
  const jobsEndingSoon = activeJobs.filter(job => {
    const endTime = new Date(job.endDate).getTime();
    const now = Date.now();
    const hoursUntilEnd = (endTime - now) / (1000 * 60 * 60);
    return hoursUntilEnd <= 4; // Jobs ending in next 4 hours
  });

  if (jobsEndingSoon.length <= 2) {
    // Queue running low - send alert
    const result = await notify.queueAlert({
      queueType: 'Manufacturing',
      remainingJobs: jobsEndingSoon.length,
      estimatedDepletion: '4 hours',
      corporation: corporationData.corporationName,
      corporationId: corporationData.corporationId,
      allianceId: corporationData.allianceId,
      urgencyLevel: jobsEndingSoon.length === 0 ? 'critical' : 'high'
    }, notificationSettings);

    if (result.success) {
      console.log('Queue alert sent successfully');
    } else {
      console.error('Failed to send queue alert:', result.errors);
    }
  }
}

// Example: Killmail processing
export async function processKillmail(
  killmailData: {
    killmail_id: number;
    victim: {
      character_id: number;
      character_name: string;
      ship_type_id: number;
      ship_type_name: string;
    };
    solar_system_id: number;
    solar_system_name: string;
    killmail_time: string;
    zkb?: {
      totalValue: number;
    };
  },
  corporationData: {
    corporationName: string;
    corporationId: number;
    allianceId?: number;
  },
  notificationSettings: NotificationSettings
) {
  console.log(`Processing killmail ${killmailData.killmail_id}`);

  const result = await notify.killmail({
    pilot: killmailData.victim.character_name,
    pilotId: killmailData.victim.character_id,
    shipType: killmailData.victim.ship_type_name,
    shipTypeId: killmailData.victim.ship_type_id,
    iskValue: killmailData.zkb?.totalValue ? `${killmailData.zkb.totalValue.toLocaleString()}` : 'Unknown',
    system: killmailData.solar_system_name,
    systemId: killmailData.solar_system_id,
    zkillboardLink: `https://zkillboard.com/kill/${killmailData.killmail_id}/`,
    corporation: corporationData.corporationName,
    corporationId: corporationData.corporationId,
    allianceId: corporationData.allianceId,
    isLoss: true // This would be determined by checking if victim is corp member
  }, notificationSettings);

  if (result.success) {
    console.log('Killmail notification sent successfully');
  } else {
    console.error('Failed to send killmail notification:', result.errors);
  }
}

// Example: Market monitoring
export async function checkMarketPrices(
  marketData: Array<{
    type_id: number;
    type_name: string;
    current_price: number;
    previous_price: number;
    system_name: string;
    system_id: number;
    volume: number;
  }>,
  corporationName: string,
  notificationSettings: NotificationSettings
) {
  for (const item of marketData) {
    const priceChange = ((item.current_price - item.previous_price) / item.previous_price) * 100;
    
    // Only notify on significant price changes (>15%)
    if (Math.abs(priceChange) >= 15) {
      const action = priceChange > 0 ? 'selling' : 'buying';
      
      const result = await notify.marketAlert({
        item: item.type_name,
        itemId: item.type_id,
        price: item.current_price.toLocaleString(),
        change: priceChange.toFixed(1),
        action: action,
        system: item.system_name,
        systemId: item.system_id,
        volume: item.volume.toLocaleString(),
        corporation: corporationName
      }, notificationSettings);

      if (result.success) {
        console.log(`Market alert sent for ${item.type_name}`);
      } else {
        console.error(`Failed to send market alert for ${item.type_name}:`, result.errors);
      }
    }
  }
}

// Example: Configuration validation
export function validateNotificationSetup(settings: NotificationSettings): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const validation = notificationManager.validateConfiguration(settings);
  const recommendations: string[] = [];

  // Add specific recommendations based on configuration
  if (settings.discord?.enabled && !settings.discord?.botName) {
    recommendations.push('Consider setting a custom bot name for Discord notifications');
  }

  if (settings.eveMail?.enabled && !settings.eveMail?.subjectPrefix) {
    recommendations.push('Consider setting a subject prefix for EVE mail notifications');
  }

  if (settings.discord?.throttleMinutes && settings.discord.throttleMinutes < 5) {
    recommendations.push('Discord throttle under 5 minutes may cause rate limiting');
  }

  if (settings.eveMail?.throttleMinutes && settings.eveMail.throttleMinutes < 15) {
    recommendations.push('EVE mail throttle under 15 minutes may exceed ESI rate limits');
  }

  return {
    isValid: validation.valid,
    issues: [...validation.errors, ...validation.warnings],
    recommendations
  };
}

// Example: Batch notification testing
export async function testAllNotificationTypes(settings: NotificationSettings): Promise<{
  results: Record<string, boolean>;
  summary: string;
}> {
  const results: Record<string, boolean> = {};

  // Test manufacturing notification
  try {
    const manufacturingResult = await notificationManager.sendNotification({
      type: 'manufacturing',
      data: notificationManager.getSampleData('manufacturing')
    }, settings);
    results.manufacturing = manufacturingResult.success;
  } catch (error) {
    results.manufacturing = false;
  }

  // Test queue notification
  try {
    const queueResult = await notificationManager.sendNotification({
      type: 'queues', 
      data: notificationManager.getSampleData('queues')
    }, settings);
    results.queues = queueResult.success;
  } catch (error) {
    results.queues = false;
  }

  // Test killmail notification
  try {
    const killmailResult = await notificationManager.sendNotification({
      type: 'killmails',
      data: notificationManager.getSampleData('killmails')
    }, settings);
    results.killmails = killmailResult.success;
  } catch (error) {
    results.killmails = false;
  }

  // Test market notification
  try {
    const marketResult = await notificationManager.sendNotification({
      type: 'markets',
      data: notificationManager.getSampleData('markets')
    }, settings);
    results.markets = marketResult.success;
  } catch (error) {
    results.markets = false;
  }

  const successful = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  const summary = `${successful}/${total} notification types tested successfully`;

  return { results, summary };
}