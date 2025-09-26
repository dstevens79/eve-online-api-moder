/**
 * EVE Online In-Game Mail Notification Service
 * Handles sending notifications via EVE Online's mail system using ESI
 */

import { NotificationSettings, NotificationTemplate } from './types';

export interface EveMailRecipient {
  recipient_id: number;
  recipient_type: 'character' | 'corporation' | 'alliance' | 'mailing_list';
}

export interface EveMailPayload {
  subject: string;
  body: string;
  recipients: EveMailRecipient[];
  approved_cost?: number;
}

export interface EveMailResponse {
  mail_id?: number;
  error?: string;
  error_code?: number;
}

export class EveMailNotificationService {
  private static instance: EveMailNotificationService;
  private lastNotificationTimes: Map<string, number> = new Map();
  private cspaChargeCache: Map<number, number> = new Map();

  static getInstance(): EveMailNotificationService {
    if (!EveMailNotificationService.instance) {
      EveMailNotificationService.instance = new EveMailNotificationService();
    }
    return EveMailNotificationService.instance;
  }

  /**
   * Send a notification via EVE in-game mail
   */
  async sendNotification(
    type: 'manufacturing' | 'queues' | 'killmails' | 'markets',
    data: Record<string, any>,
    settings: NotificationSettings
  ): Promise<boolean> {
    try {
      if (!settings.eveMail?.enabled || !settings.eveMail?.senderCharacterId) {
        console.log('EVE mail notifications disabled or no sender configured');
        return false;
      }

      // Check throttling
      if (!this.shouldSendNotification(type, settings.eveMail.throttleMinutes || 15)) {
        console.log(`EVE mail notification throttled for type: ${type}`);
        return false;
      }

      const template = settings.eveMail.templates?.[type];
      if (!template?.enabled) {
        console.log(`EVE mail template disabled for type: ${type}`);
        return false;
      }

      // Build recipients list
      const recipients = await this.buildRecipientsList(data, settings);
      if (recipients.length === 0) {
        console.log('No valid recipients for EVE mail');
        return false;
      }

      // Build mail content
      const mailPayload = this.buildMailPayload(type, data, template, settings);
      mailPayload.recipients = recipients;

      // Send mail via ESI
      const success = await this.sendMail(settings.eveMail.senderCharacterId, mailPayload);
      
      if (success) {
        this.updateLastNotificationTime(type);
      }

      return success;
    } catch (error) {
      console.error('EVE mail notification error:', error);
      return false;
    }
  }

  /**
   * Test EVE mail configuration
   */
  async testMail(settings: NotificationSettings): Promise<boolean> {
    try {
      if (!settings.eveMail?.enabled || !settings.eveMail?.senderCharacterId) {
        throw new Error('EVE mail not configured');
      }

      const testPayload: EveMailPayload = {
        subject: `${settings.eveMail.subjectPrefix || '[LMeve]'} Test Message`,
        body: `This is a test message from LMeve Corporation Management system.\n\nIf you received this, EVE mail notifications are working correctly.\n\nSent at: ${new Date().toLocaleString()}\n\nFly safe!\nLMeve System`,
        recipients: []
      };

      // Add test recipients (only individual characters for testing)
      if (settings.eveMail.recipientIds?.length) {
        const testRecipients = settings.eveMail.recipientIds.slice(0, 1); // Only send to first recipient for testing
        testPayload.recipients = testRecipients.map(id => ({
          recipient_id: id,
          recipient_type: 'character' as const
        }));
      } else {
        throw new Error('No test recipients configured');
      }

      return await this.sendMail(settings.eveMail.senderCharacterId, testPayload);
    } catch (error) {
      console.error('EVE mail test error:', error);
      return false;
    }
  }

  /**
   * Build list of mail recipients based on settings and context
   */
  private async buildRecipientsList(
    data: Record<string, any>,
    settings: NotificationSettings
  ): Promise<EveMailRecipient[]> {
    const recipients: EveMailRecipient[] = [];

    if (!settings.eveMail) return recipients;

    // Add individual character recipients
    if (settings.eveMail.recipientIds?.length) {
      for (const charId of settings.eveMail.recipientIds) {
        // Check CSPA charge if enabled
        if (settings.eveMail.cspaChargeCheck && await this.hasHighCSPACharge(charId)) {
          console.log(`Skipping character ${charId} due to high CSPA charge`);
          continue;
        }

        // Check online status if required
        if (settings.eveMail.onlyToOnlineCharacters && !await this.isCharacterOnline(charId)) {
          console.log(`Skipping offline character ${charId}`);
          continue;
        }

        recipients.push({
          recipient_id: charId,
          recipient_type: 'character'
        });
      }
    }

    // Add mailing list recipients
    if (settings.eveMail.mailingLists?.length) {
      settings.eveMail.mailingLists.forEach(mailingList => {
        recipients.push({
          recipient_id: mailingList.id,
          recipient_type: 'mailing_list'
        });
      });
    }

    // Add corporation-wide mailing
    if (settings.eveMail.sendToCorporation && data.corporationId) {
      recipients.push({
        recipient_id: data.corporationId,
        recipient_type: 'corporation'
      });
    }

    // Add alliance-wide mailing
    if (settings.eveMail.sendToAlliance && data.allianceId) {
      recipients.push({
        recipient_id: data.allianceId,
        recipient_type: 'alliance'
      });
    }

    // For individual notifications (like manufacturing completion), only send to the relevant pilot
    if (data.pilot_id && ['manufacturing'].includes(data.notificationType)) {
      // Replace corporation/alliance recipients with individual pilot for personal notifications
      const personalRecipients = recipients.filter(r => r.recipient_type === 'character' || r.recipient_type === 'mailing_list');
      personalRecipients.push({
        recipient_id: data.pilot_id,
        recipient_type: 'character'
      });
      return personalRecipients;
    }

    return recipients;
  }

  /**
   * Build mail payload from template and data
   */
  private buildMailPayload(
    type: string,
    data: Record<string, any>,
    template: NotificationTemplate,
    settings: NotificationSettings
  ): EveMailPayload {
    const subject = this.replaceTemplateVariables(
      template.subject || `${settings.eveMail?.subjectPrefix || '[LMeve]'} Notification`,
      data
    );

    const body = this.replaceTemplateVariables(template.message, data);

    return {
      subject: subject.substring(0, 255), // EVE mail subject limit
      body: body.substring(0, 10000), // EVE mail body limit
      recipients: [] // Will be populated by caller
    };
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
   * Send mail via EVE ESI API
   */
  private async sendMail(senderCharacterId: number, payload: EveMailPayload): Promise<boolean> {
    try {
      console.log('Sending EVE mail:', { sender: senderCharacterId, recipients: payload.recipients.length, subject: payload.subject });
      
      // In a real implementation, you'd make an authenticated ESI call here:
      // POST /characters/{character_id}/mail/
      // With proper OAuth2 bearer token for the sender character
      
      // Simulate ESI call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate response based on recipient types and count
      const hasCorpOrAlliance = payload.recipients.some(r => r.recipient_type === 'corporation' || r.recipient_type === 'alliance');
      const recipientCount = payload.recipients.length;
      
      // Simulate higher failure rate for mass mailings
      const failureRate = hasCorpOrAlliance ? 0.3 : recipientCount > 10 ? 0.2 : 0.05;
      const success = Math.random() > failureRate;
      
      if (success) {
        console.log('EVE mail sent successfully');
        // In real implementation, you'd get mail_id from response
        const mailId = Math.floor(Math.random() * 1000000000);
        console.log(`EVE mail ID: ${mailId}`);
      } else {
        console.error('EVE mail failed - possible ESI error or rate limit');
      }
      
      return success;
    } catch (error) {
      console.error('EVE mail API error:', error);
      return false;
    }
  }

  /**
   * Check if character has high CSPA charge
   */
  private async hasHighCSPACharge(characterId: number): Promise<boolean> {
    // Check cache first
    const cachedCharge = this.cspaChargeCache.get(characterId);
    if (cachedCharge !== undefined) {
      return cachedCharge > 1000000; // 1M ISK threshold
    }

    try {
      // In real implementation, query ESI for character's CSPA charge
      // GET /characters/{character_id}/
      
      // Simulate CSPA charge check
      const charge = Math.floor(Math.random() * 10000000); // Random charge up to 10M ISK
      this.cspaChargeCache.set(characterId, charge);
      
      // Cache expires after 1 hour
      setTimeout(() => this.cspaChargeCache.delete(characterId), 3600000);
      
      return charge > 1000000; // High threshold
    } catch (error) {
      console.error(`Failed to check CSPA charge for character ${characterId}:`, error);
      return false; // Assume low charge if check fails
    }
  }

  /**
   * Check if character is currently online
   */
  private async isCharacterOnline(characterId: number): Promise<boolean> {
    try {
      // In real implementation, you might check:
      // 1. Character location API (if they have location sharing enabled)
      // 2. Corporation member tracking
      // 3. Alliance member tracking
      // 4. Recent activity indicators
      
      // Simulate online check (60% online rate)
      return Math.random() > 0.4;
    } catch (error) {
      console.error(`Failed to check online status for character ${characterId}:`, error);
      return true; // Assume online if check fails
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
   * Get mail sending statistics
   */
  getMailStats(): Record<string, { lastSent: number | null, nextAllowed: number | null }> {
    const stats: Record<string, { lastSent: number | null, nextAllowed: number | null }> = {};
    
    ['manufacturing', 'queues', 'killmails', 'markets'].forEach(type => {
      const lastSent = this.lastNotificationTimes.get(type) || null;
      stats[type] = {
        lastSent,
        nextAllowed: lastSent ? lastSent + (15 * 60 * 1000) : null // Default 15 min throttle
      };
    });
    
    return stats;
  }

  /**
   * Get CSPA charge information for recipients
   */
  getCSPAChargeInfo(): Record<number, number> {
    return Object.fromEntries(this.cspaChargeCache.entries());
  }

  /**
   * Clear CSPA charge cache
   */
  clearCSPACache(): void {
    this.cspaChargeCache.clear();
  }

  /**
   * Validate mail configuration
   */
  validateConfiguration(settings: NotificationSettings): { valid: boolean, errors: string[] } {
    const errors: string[] = [];

    if (!settings.eveMail?.enabled) {
      return { valid: true, errors: [] }; // Not enabled is valid
    }

    if (!settings.eveMail.senderCharacterId) {
      errors.push('Sender character ID is required');
    }

    const hasRecipients = 
      (settings.eveMail.recipientIds?.length || 0) > 0 ||
      (settings.eveMail.mailingLists?.length || 0) > 0 ||
      settings.eveMail.sendToCorporation ||
      settings.eveMail.sendToAlliance;

    if (!hasRecipients) {
      errors.push('At least one recipient type must be configured');
    }

    if (settings.eveMail.throttleMinutes && settings.eveMail.throttleMinutes < 1) {
      errors.push('Throttle minutes must be at least 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const eveMailService = EveMailNotificationService.getInstance();