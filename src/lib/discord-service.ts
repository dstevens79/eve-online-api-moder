/**
 * Discord Webhook Notification Service
 * Handles sending notifications to Discord via webhooks with rich formatting
 */

import { NotificationSettings, NotificationTemplate } from './types';

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  thumbnail?: {
    url: string;
  };
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
}

export interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

export class DiscordNotificationService {
  private static instance: DiscordNotificationService;
  private lastNotificationTimes: Map<string, number> = new Map();

  static getInstance(): DiscordNotificationService {
    if (!DiscordNotificationService.instance) {
      DiscordNotificationService.instance = new DiscordNotificationService();
    }
    return DiscordNotificationService.instance;
  }

  /**
   * Send a notification to Discord
   */
  async sendNotification(
    type: 'manufacturing' | 'queues' | 'killmails' | 'markets',
    data: Record<string, any>,
    settings: NotificationSettings
  ): Promise<boolean> {
    try {
      if (!settings.discord?.enabled || !settings.discord?.webhookUrl) {
        console.log('Discord notifications disabled or no webhook URL configured');
        return false;
      }

      // Check throttling
      if (!this.shouldSendNotification(type, settings.discord.throttleMinutes || 5)) {
        console.log(`Discord notification throttled for type: ${type}`);
        return false;
      }

      const template = settings.discord.templates?.[type];
      if (!template?.enabled) {
        console.log(`Discord template disabled for type: ${type}`);
        return false;
      }

      // Build the notification payload
      const payload = this.buildPayload(type, data, template, settings);

      // Send to Discord
      const success = await this.sendWebhook(settings.discord.webhookUrl, payload);
      
      if (success) {
        this.updateLastNotificationTime(type);
      }

      return success;
    } catch (error) {
      console.error('Discord notification error:', error);
      return false;
    }
  }

  /**
   * Test Discord webhook connection
   */
  async testWebhook(webhookUrl: string, botName?: string): Promise<boolean> {
    try {
      const testPayload: DiscordWebhookPayload = {
        content: '🚀 LMeve Discord integration test successful!',
        username: botName || 'LMeve Notifications',
        embeds: [{
          title: 'Connection Test',
          description: 'If you can see this message, Discord notifications are working correctly.',
          color: 0x00ff00, // Green
          timestamp: new Date().toISOString(),
          footer: {
            text: 'LMeve Corporation Management'
          }
        }]
      };

      return await this.sendWebhook(webhookUrl, testPayload);
    } catch (error) {
      console.error('Discord test webhook error:', error);
      return false;
    }
  }

  /**
   * Build Discord payload from template and data
   */
  private buildPayload(
    type: string,
    data: Record<string, any>,
    template: NotificationTemplate,
    settings: NotificationSettings
  ): DiscordWebhookPayload {
    // Replace template variables
    let message = this.replaceTemplateVariables(template.message, data);

    // Add mentions
    if (settings.discord?.roles?.length) {
      const roleMentions = settings.discord.roles.map(role => role.startsWith('@') ? role : `@${role}`).join(' ');
      message = `${roleMentions} ${message}`;
    }

    if (settings.discord?.userMentions?.length) {
      // Note: In a real implementation, you'd need to map EVE character IDs to Discord user IDs
      const userMentions = settings.discord.userMentions.map(charId => `<@${charId}>`).join(' ');
      message = `${userMentions} ${message}`;
    }

    const payload: DiscordWebhookPayload = {
      username: settings.discord?.botName || 'LMeve Notifications',
      avatar_url: settings.discord?.avatarUrl,
    };

    if (settings.discord?.embedFormat) {
      // Use rich embed format
      payload.embeds = [this.buildEmbed(type, data, message, settings)];
    } else {
      // Use simple text format
      payload.content = message;
    }

    return payload;
  }

  /**
   * Build rich embed for Discord
   */
  private buildEmbed(
    type: string,
    data: Record<string, any>,
    message: string,
    settings: NotificationSettings
  ): DiscordEmbed {
    const embed: DiscordEmbed = {
      description: message,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'LMeve Corporation Management'
      }
    };

    // Set color and title based on notification type
    switch (type) {
      case 'manufacturing':
        embed.title = '🏭 Manufacturing Update';
        embed.color = 0x3498db; // Blue
        if (settings.discord?.includeThumbnails && data.item) {
          embed.thumbnail = {
            url: `https://images.evetech.net/types/${data.itemId || 1}/icon?size=64`
          };
        }
        break;
      case 'queues':
        embed.title = '⚠️ Queue Alert';
        embed.color = 0xff9500; // Orange
        break;
      case 'killmails':
        embed.title = '💥 Killmail Report';
        embed.color = 0xe74c3c; // Red
        if (settings.discord?.includeThumbnails && data.ship_type_id) {
          embed.thumbnail = {
            url: `https://images.evetech.net/types/${data.ship_type_id}/icon?size=64`
          };
        }
        break;
      case 'markets':
        embed.title = '📈 Market Alert';
        embed.color = 0x2ecc71; // Green
        if (settings.discord?.includeThumbnails && data.item_id) {
          embed.thumbnail = {
            url: `https://images.evetech.net/types/${data.item_id}/icon?size=64`
          };
        }
        break;
    }

    // Add fields for structured data
    if (type === 'manufacturing' && data.pilot && data.item) {
      embed.fields = [
        { name: 'Pilot', value: data.pilot, inline: true },
        { name: 'Item', value: `${data.item} x${data.count || 1}`, inline: true },
        { name: 'Location', value: data.location || 'Unknown', inline: true }
      ];
    } else if (type === 'killmails' && data.pilot && data.ship_type) {
      embed.fields = [
        { name: 'Pilot', value: data.pilot, inline: true },
        { name: 'Ship Destroyed', value: data.ship_type, inline: true },
        { name: 'ISK Value', value: `${data.isk_value || 'Unknown'} ISK`, inline: true }
      ];
    }

    return embed;
  }

  /**
   * Replace template variables with actual data
   */
  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    let message = template;
    
    // Replace all {variable} patterns with corresponding data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, 'g'), String(value || 'Unknown'));
    });

    // Replace common time placeholder
    message = message.replace(/{time}/g, new Date().toLocaleString());

    return message;
  }

  /**
   * Send webhook to Discord
   */
  private async sendWebhook(webhookUrl: string, payload: DiscordWebhookPayload): Promise<boolean> {
    try {
      console.log('Sending Discord webhook:', { url: webhookUrl.substring(0, 50) + '...', payload });
      
      // In a real implementation, you'd use fetch or axios here
      // For this demo, we'll simulate the call
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate success (in real implementation, check response status)
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        console.log('Discord webhook sent successfully');
      } else {
        console.error('Discord webhook failed');
      }
      
      return success;
    } catch (error) {
      console.error('Discord webhook error:', error);
      return false;
    }
  }

  /**
   * Check if notification should be sent based on throttling
   */
  private shouldSendNotification(type: string, throttleMinutes: number): boolean {
    const now = Date.now();
    const lastTime = this.lastNotificationTimes.get(type) || 0;
    const timeDiff = now - lastTime;
    const throttleMs = throttleMinutes * 60 * 1000;
    
    return timeDiff >= throttleMs;
  }

  /**
   * Update last notification time for throttling
   */
  private updateLastNotificationTime(type: string): void {
    this.lastNotificationTimes.set(type, Date.now());
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): Record<string, { lastSent: number | null, nextAllowed: number | null }> {
    const stats: Record<string, { lastSent: number | null, nextAllowed: number | null }> = {};
    
    ['manufacturing', 'queues', 'killmails', 'markets'].forEach(type => {
      const lastSent = this.lastNotificationTimes.get(type) || null;
      stats[type] = {
        lastSent,
        nextAllowed: lastSent ? lastSent + (5 * 60 * 1000) : null // Default 5 min throttle
      };
    });
    
    return stats;
  }
}

// Export singleton instance
export const discordService = DiscordNotificationService.getInstance();