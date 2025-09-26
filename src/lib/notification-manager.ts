/**
 * Unified Notification Manager
 * Coordinates Discord and EVE mail notifications for various LMeve events
 */

import { NotificationSettings } from './types';
import { discordService } from './discord-service';
import { eveMailService } from './eve-mail-service';

export interface NotificationEvent {
  type: 'manufacturing' | 'queues' | 'killmails' | 'markets';
  data: Record<string, any>;
  timestamp?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationResult {
  success: boolean;
  discordSent: boolean;
  eveMailSent: boolean;
  errors: string[];
}

export class NotificationManager {
  private static instance: NotificationManager;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Send notification via all enabled channels
   */
  async sendNotification(
    event: NotificationEvent, 
    settings: NotificationSettings
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      discordSent: false,
      eveMailSent: false,
      errors: []
    };

    // Check if this event type is enabled
    if (!settings.events[event.type]) {
      result.errors.push(`Notifications disabled for event type: ${event.type}`);
      return result;
    }

    // Prepare common data
    const eventData = {
      ...event.data,
      timestamp: event.timestamp || new Date().toISOString(),
      priority: event.priority || 'normal',
      notificationType: event.type
    };

    // Send Discord notification
    if (settings.discord?.enabled) {
      try {
        const discordSuccess = await discordService.sendNotification(event.type, eventData, settings);
        result.discordSent = discordSuccess;
        if (!discordSuccess) {
          result.errors.push('Discord notification failed');
        }
      } catch (error) {
        result.errors.push(`Discord error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Send EVE mail notification
    if (settings.eveMail?.enabled) {
      try {
        const eveMailSuccess = await eveMailService.sendNotification(event.type, eventData, settings);
        result.eveMailSent = eveMailSuccess;
        if (!eveMailSuccess) {
          result.errors.push('EVE mail notification failed');
        }
      } catch (error) {
        result.errors.push(`EVE mail error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Consider successful if at least one channel worked
    result.success = result.discordSent || result.eveMailSent;

    return result;
  }

  /**
   * Send manufacturing job completion notification
   */
  async notifyManufacturingComplete(
    data: {
      pilot: string;
      pilotId: number;
      item: string;
      itemId: number;
      count: number;
      location: string;
      corporation: string;
      corporationId: number;
      allianceId?: number;
      alliance?: string;
      jobId?: number;
      duration?: string;
    },
    settings: NotificationSettings
  ): Promise<NotificationResult> {
    return this.sendNotification({
      type: 'manufacturing',
      data,
      priority: 'normal'
    }, settings);
  }

  /**
   * Send queue management alert
   */
  async notifyQueueAlert(
    data: {
      queueType: string;
      remainingJobs: number;
      estimatedDepletion: string;
      corporation: string;
      corporationId: number;
      allianceId?: number;
      urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    },
    settings: NotificationSettings
  ): Promise<NotificationResult> {
    return this.sendNotification({
      type: 'queues',
      data: {
        queue_type: data.queueType,
        remaining_jobs: data.remainingJobs,
        estimated_depletion: data.estimatedDepletion,
        corporation: data.corporation,
        corporationId: data.corporationId,
        allianceId: data.allianceId
      },
      priority: data.urgencyLevel === 'critical' ? 'urgent' : data.urgencyLevel === 'high' ? 'high' : 'normal'
    }, settings);
  }

  /**
   * Send killmail notification
   */
  async notifyKillmail(
    data: {
      pilot: string;
      pilotId: number;
      shipType: string;
      shipTypeId: number;
      iskValue: string;
      system: string;
      systemId: number;
      zkillboardLink: string;
      corporation: string;
      corporationId: number;
      allianceId?: number;
      isLoss?: boolean;
    },
    settings: NotificationSettings
  ): Promise<NotificationResult> {
    return this.sendNotification({
      type: 'killmails',
      data: {
        pilot: data.pilot,
        pilot_id: data.pilotId,
        ship_type: data.shipType,
        ship_type_id: data.shipTypeId,
        isk_value: data.iskValue,
        system: data.system,
        system_id: data.systemId,
        zkillboard_link: data.zkillboardLink,
        corporation: data.corporation,
        corporationId: data.corporationId,
        allianceId: data.allianceId,
        is_loss: data.isLoss
      },
      priority: data.isLoss ? 'high' : 'normal'
    }, settings);
  }

  /**
   * Send market alert notification
   */
  async notifyMarketAlert(
    data: {
      item: string;
      itemId: number;
      price: string;
      change: string;
      action: string;
      system: string;
      systemId: number;
      volume?: string;
      corporation: string;
    },
    settings: NotificationSettings
  ): Promise<NotificationResult> {
    return this.sendNotification({
      type: 'markets',
      data: {
        item: data.item,
        item_id: data.itemId,
        price: data.price,
        change: data.change,
        action: data.action,
        system: data.system,
        system_id: data.systemId,
        volume: data.volume,
        corporation: data.corporation
      },
      priority: Math.abs(parseFloat(data.change)) > 20 ? 'high' : 'normal'
    }, settings);
  }

  /**
   * Test all notification channels
   */
  async testNotifications(settings: NotificationSettings): Promise<{
    discord: boolean;
    eveMail: boolean;
    errors: string[];
  }> {
    const result = {
      discord: false,
      eveMail: false,
      errors: [] as string[]
    };

    // Test Discord webhook
    if (settings.discord?.enabled && settings.discord?.webhookUrl) {
      try {
        result.discord = await discordService.testWebhook(
          settings.discord.webhookUrl, 
          settings.discord.botName
        );
        if (!result.discord) {
          result.errors.push('Discord webhook test failed');
        }
      } catch (error) {
        result.errors.push(`Discord test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Test EVE mail
    if (settings.eveMail?.enabled) {
      try {
        result.eveMail = await eveMailService.testMail(settings);
        if (!result.eveMail) {
          result.errors.push('EVE mail test failed');
        }
      } catch (error) {
        result.errors.push(`EVE mail test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  }

  /**
   * Validate notification configuration
   */
  validateConfiguration(settings: NotificationSettings): {
    valid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check if any notifications are enabled
    const hasAnyEvents = Object.values(settings.events).some(enabled => enabled);
    if (!hasAnyEvents) {
      warnings.push('No event types are enabled for notifications');
    }

    // Validate Discord configuration
    if (settings.discord?.enabled) {
      if (!settings.discord.webhookUrl) {
        errors.push('Discord webhook URL is required when Discord notifications are enabled');
      } else if (!settings.discord.webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        warnings.push('Discord webhook URL format may be incorrect');
      }

      // Check if any templates are enabled
      const hasDiscordTemplates = settings.discord.templates && 
        Object.values(settings.discord.templates).some(template => template?.enabled);
      if (!hasDiscordTemplates) {
        warnings.push('No Discord message templates are enabled');
      }

      // Validate throttle setting
      if (settings.discord.throttleMinutes && settings.discord.throttleMinutes < 0) {
        errors.push('Discord throttle minutes cannot be negative');
      }
    }

    // Validate EVE mail configuration
    if (settings.eveMail?.enabled) {
      const eveMailValidation = eveMailService.validateConfiguration(settings);
      errors.push(...eveMailValidation.errors);

      // Check if any templates are enabled
      const hasEveMailTemplates = settings.eveMail.templates && 
        Object.values(settings.eveMail.templates).some(template => template?.enabled);
      if (!hasEveMailTemplates) {
        warnings.push('No EVE mail templates are enabled');
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): {
    discord: Record<string, { lastSent: number | null, nextAllowed: number | null }>;
    eveMail: Record<string, { lastSent: number | null, nextAllowed: number | null }>;
  } {
    return {
      discord: discordService.getNotificationStats(),
      eveMail: eveMailService.getMailStats()
    };
  }

  /**
   * Get sample notification data for testing templates
   */
  getSampleData(type: 'manufacturing' | 'queues' | 'killmails' | 'markets'): Record<string, any> {
    const baseData = {
      time: new Date().toLocaleString(),
      corporation: 'Test Corporation',
      alliance: 'Test Alliance'
    };

    switch (type) {
      case 'manufacturing':
        return {
          ...baseData,
          pilot: 'Test Pilot',
          item: 'Rifter',
          count: '10',
          location: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
          duration: '2 hours 15 minutes'
        };

      case 'queues':
        return {
          ...baseData,
          queue_type: 'Manufacturing',
          remaining_jobs: '3',
          estimated_depletion: '4 hours 20 minutes'
        };

      case 'killmails':
        return {
          ...baseData,
          pilot: 'Test Pilot',
          ship_type: 'Rifter',
          isk_value: '1,250,000',
          system: 'Jita',
          zkillboard_link: 'https://zkillboard.com/kill/123456/'
        };

      case 'markets':
        return {
          ...baseData,
          item: 'Tritanium',
          price: '5.50',
          change: '+15.2',
          action: 'buying',
          system: 'Jita',
          volume: '1,000,000'
        };

      default:
        return baseData;
    }
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Helper functions for common notification scenarios
export const notify = {
  manufacturingComplete: (data: Parameters<typeof notificationManager.notifyManufacturingComplete>[0], settings: NotificationSettings) =>
    notificationManager.notifyManufacturingComplete(data, settings),
    
  queueAlert: (data: Parameters<typeof notificationManager.notifyQueueAlert>[0], settings: NotificationSettings) =>
    notificationManager.notifyQueueAlert(data, settings),
    
  killmail: (data: Parameters<typeof notificationManager.notifyKillmail>[0], settings: NotificationSettings) =>
    notificationManager.notifyKillmail(data, settings),
    
  marketAlert: (data: Parameters<typeof notificationManager.notifyMarketAlert>[0], settings: NotificationSettings) =>
    notificationManager.notifyMarketAlert(data, settings),
    
  test: (settings: NotificationSettings) =>
    notificationManager.testNotifications(settings)
};