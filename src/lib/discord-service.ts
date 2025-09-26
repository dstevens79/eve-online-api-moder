/**
 * Discord Webhook Notification Service
 * Handles sending notifications to Discord via webhooks with rich formatting
 */

  color?: number;

    inline?: boolean;
  thumbnail?: {
  };
  color?: number;
    icon_url?: str
}
export interface D
    inline?: boolean;
  emb
  thumbnail?: {
  private static
  };
    if (!DiscordNotif
  footer?: {
  }
  /**
   *
}

    try {
        console.log
  username?: string;
      // Check throttl
        console.log(`Disco
 

        console.log(`Discord template dis
      }
      // Build the notification payload

      const success = await this.sendWebhook(setting
      if (success) {
      }
    }
    return DiscordNotificationService.instance;
  }

  /**
   * Send a notification to Discord
   */
  async sendNotification(
    type: 'manufacturing' | 'queues' | 'killmails' | 'markets',
    data: Record<string, any>,
          footer: {
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
  /**
        }]
  privat

    message: string,
    } catch (error) {
    const embed: DiscordEmbed = {
      return false;
     
  }

  /**
   * Build Discord payload from template and data
   */
        embed.color = 0
    type: string,
            url: `https://imag
    template: NotificationTemplate,
        break;
  ): DiscordWebhookPayload {
    // Replace template variables
    let message = this.replaceTemplateVariables(template.message, data);

    // Add mentions
    if (settings.discord?.roles?.length) {
      const roleMentions = settings.discord.roles.map(role => role.startsWith('@') ? role : `@${role}`).join(' ');
        }
    }

    if (settings.discord?.userMentions?.length) {
      // Note: In a real implementation, you'd need to map EVE character IDs to Discord user IDs
      const userMentions = settings.discord.userMentions.map(charId => `<@${charId}>`).join(' ');
      message = `${userMentions} ${message}`;
    }

    const payload: DiscordWebhookPayload = {
      username: settings.discord?.botName || 'LMeve Notifications',
      avatar_url: settings.discord?.avatarUrl,
      

      embed.fields = [
      // Use rich embed format
      payload.embeds = [this.buildEmbed(type, data, message, settings)];
    } else {
      // Use simple text format
      payload.content = message;


    return payload;
  }

  /**
      const placeholder = `{${key
   */
  private buildEmbed(
    type: string,
    data: Record<string, any>,
    message: string,
    settings: NotificationSettings



















































































































































