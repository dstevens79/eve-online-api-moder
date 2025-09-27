import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle,
  Rocket
} from '@phosphor-icons/react';
import { 
  useNotificationSettings
} from '@/lib/persistenceService';
import { toast } from 'sonner';

interface NotificationsProps {
  isMobileView?: boolean;
}

export function Notifications({ isMobileView }: NotificationsProps) {
  const [notificationSettings, setNotificationSettings] = useNotificationSettings();

  // Helper function to update notification events
  const updateNotificationEvent = (event: string, enabled: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      events: { ...prev.events, [event]: enabled }
    }));
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    try {
      const errors: string[] = [];
      
      // Basic validation
      if (notificationSettings.discord?.enabled && !notificationSettings.discord?.webhookUrl) {
        errors.push('Discord webhook URL is required when Discord notifications are enabled');
      }
      
      if (notificationSettings.eveMail?.enabled && !notificationSettings.eveMail?.senderCharacterId) {
        errors.push('EVE mail sender character is required when EVE mail notifications are enabled');
      }
      
      if (errors.length > 0) {
        toast.error(`Validation failed: ${errors.join(', ')}`);
        return;
      }
      
      // Save settings (this would normally persist to storage)
      setNotificationSettings({ ...notificationSettings });
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save notification settings');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell size={24} />
          Notification Preferences
        </h2>
        <p className="text-muted-foreground">
          Configure notification delivery methods and message templates for LMeve events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Notifications */}
          <div className="space-y-4">
            <h4 className="font-medium">Event Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Manufacturing Jobs</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about manufacturing job completions and issues
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.events.manufacturing}
                  onCheckedChange={(checked) => updateNotificationEvent('manufacturing', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mining Operations</Label>
                  <p className="text-sm text-muted-foreground">
                    Updates on mining fleet activities and yields
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.events.mining}
                  onCheckedChange={(checked) => updateNotificationEvent('mining', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Killmails</Label>
                  <p className="text-sm text-muted-foreground">
                    Corporation member kills and losses
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.events.killmails}
                  onCheckedChange={(checked) => updateNotificationEvent('killmails', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Market Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Price alerts and market order notifications
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.events.markets}
                  onCheckedChange={(checked) => updateNotificationEvent('markets', checked)}
                />
              </div>
            </div>
          </div>

          {/* Discord Integration */}
          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#5865F2] rounded flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <h4 className="font-medium">Discord Integration</h4>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Discord Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Forward notifications to Discord channels via webhooks
                </p>
              </div>
              <Switch
                checked={notificationSettings.discord?.enabled || false}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({
                  ...prev,
                  discord: { ...prev.discord, enabled: checked }
                }))}
              />
            </div>

            {notificationSettings.discord?.enabled && (
              <div className="space-y-6 pl-6 border-l-2 border-[#5865F2]/20">
                {/* Primary Webhook Configuration */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm">Webhook Configuration</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discordWebhookUrl">Webhook URL</Label>
                      <Input
                        id="discordWebhookUrl"
                        type="url"
                        value={notificationSettings.discord?.webhookUrl || ''}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          discord: { ...prev.discord, webhookUrl: e.target.value }
                        }))}
                        placeholder="https://discord.com/api/webhooks/..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Create a webhook in your Discord server settings
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discordBotName">Bot Display Name</Label>
                      <Input
                        id="discordBotName"
                        value={notificationSettings.discord?.botName || ''}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          discord: { ...prev.discord, botName: e.target.value }
                        }))}
                        placeholder="LMeve Notifications"
                      />
                      <p className="text-xs text-muted-foreground">
                        Name shown for the notification bot
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discordAvatarUrl">Bot Avatar URL (Optional)</Label>
                    <Input
                      id="discordAvatarUrl"
                      type="url"
                      value={notificationSettings.discord?.avatarUrl || ''}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        discord: { ...prev.discord, avatarUrl: e.target.value }
                      }))}
                      placeholder="https://images.evetech.net/corporations/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Custom avatar for the notification bot (corp logo recommended)
                    </p>
                  </div>
                </div>

                {/* Channel and Role Configuration */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm">Target Configuration</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discordChannels">Channel Mentions</Label>
                      <Textarea
                        id="discordChannels"
                        rows={3}
                        value={notificationSettings.discord?.channels?.join('\n') || ''}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          discord: {
                            ...prev.discord,
                            channels: e.target.value.split('\n').map(c => c.trim()).filter(c => c)
                          }
                        }))}
                        placeholder="#general&#10;#industry&#10;#alerts"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Channels to mention in notifications (one per line)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discordRoles">Role Mentions</Label>
                      <Textarea
                        id="discordRoles"
                        rows={3}
                        value={notificationSettings.discord?.roles?.join('\n') || ''}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          discord: {
                            ...prev.discord,
                            roles: e.target.value.split('\n').map(r => r.trim()).filter(r => r)
                          }
                        }))}
                        placeholder="@lmeve_admin&#10;@industry_team&#10;@pilots"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Roles to ping in notifications (one per line, with @)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discordUserMentions">User Mentions (Character IDs)</Label>
                    <Textarea
                      id="discordUserMentions"
                      rows={2}
                      value={notificationSettings.discord?.userMentions?.join('\n') || ''}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        discord: {
                          ...prev.discord,
                          userMentions: e.target.value.split('\n').map(u => u.trim()).filter(u => u)
                        }
                      }))}
                      placeholder="91316135&#10;498125261"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      EVE character IDs to mention in notifications (one per line)
                    </p>
                  </div>
                </div>

                {/* Message Templates */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm">Message Templates</h5>
                  <div className="space-y-4">
                    {/* Manufacturing Template */}
                    <div className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">Manufacturing Completion</Label>
                        <Switch
                          checked={notificationSettings.discord?.templates?.manufacturing?.enabled || false}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            discord: {
                              ...prev.discord,
                              templates: {
                                ...prev.discord?.templates,
                                manufacturing: {
                                  ...prev.discord?.templates?.manufacturing,
                                  enabled: checked
                                }
                              }
                            }
                          }))}
                        />
                      </div>
                      {notificationSettings.discord?.templates?.manufacturing?.enabled && (
                        <div className="space-y-2">
                          <Textarea
                            rows={3}
                            value={notificationSettings.discord?.templates?.manufacturing?.message || 'Hey {pilot} - your LMeve industry task of {item} x{count} is complete at {time}!'}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              discord: {
                                ...prev.discord,
                                templates: {
                                  ...prev.discord?.templates,
                                  manufacturing: {
                                    ...prev.discord?.templates?.manufacturing,
                                    message: e.target.value
                                  }
                                }
                              }
                            }))}
                            placeholder="Enter custom message template..."
                            className="text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Variables: {'{pilot}'}, {'{item}'}, {'{count}'}, {'{time}'}, {'{location}'}, {'{corporation}'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Queue Alert Template */}
                    <div className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">Queue Alerts</Label>
                        <Switch
                          checked={notificationSettings.discord?.templates?.queues?.enabled || false}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            discord: {
                              ...prev.discord,
                              templates: {
                                ...prev.discord?.templates,
                                queues: {
                                  ...prev.discord?.templates?.queues,
                                  enabled: checked
                                }
                              }
                            }
                          }))}
                        />
                      </div>
                      {notificationSettings.discord?.templates?.queues?.enabled && (
                        <div className="space-y-2">
                          <Textarea
                            rows={3}
                            value={notificationSettings.discord?.templates?.queues?.message || 'Hey @lmeve_admin_role - queues are running low! You need to setup additional industry tasking!!'}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              discord: {
                                ...prev.discord,
                                templates: {
                                  ...prev.discord?.templates,
                                  queues: {
                                    ...prev.discord?.templates?.queues,
                                    message: e.target.value
                                  }
                                }
                              }
                            }))}
                            placeholder="Enter custom message template..."
                            className="text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Variables: {'{role}'}, {'{queue_type}'}, {'{remaining_jobs}'}, {'{time}'}, {'{corporation}'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Killmail Template */}
                    <div className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">Killmail Notifications</Label>
                        <Switch
                          checked={notificationSettings.discord?.templates?.killmails?.enabled || false}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            discord: {
                              ...prev.discord,
                              templates: {
                                ...prev.discord?.templates,
                                killmails: {
                                  ...prev.discord?.templates?.killmails,
                                  enabled: checked
                                }
                              }
                            }
                          }))}
                        />
                      </div>
                      {notificationSettings.discord?.templates?.killmails?.enabled && (
                        <div className="space-y-2">
                          <Textarea
                            rows={3}
                            value={notificationSettings.discord?.templates?.killmails?.message || '{pilot} just scored a {ship_type} kill worth {isk_value} ISK! o7'}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              discord: {
                                ...prev.discord,
                                templates: {
                                  ...prev.discord?.templates,
                                  killmails: {
                                    ...prev.discord?.templates?.killmails,
                                    message: e.target.value
                                  }
                                }
                              }
                            }))}
                            placeholder="Enter custom message template..."
                            className="text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Variables: {'{pilot}'}, {'{ship_type}'}, {'{isk_value}'}, {'{system}'}, {'{time}'}, {'{zkillboard_link}'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Market Alert Template */}
                    <div className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">Market Alerts</Label>
                        <Switch
                          checked={notificationSettings.discord?.templates?.markets?.enabled || false}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            discord: {
                              ...prev.discord,
                              templates: {
                                ...prev.discord?.templates,
                                markets: {
                                  ...prev.discord?.templates?.markets,
                                  enabled: checked
                                }
                              }
                            }
                          }))}
                        />
                      </div>
                      {notificationSettings.discord?.templates?.markets?.enabled && (
                        <div className="space-y-2">
                          <Textarea
                            rows={3}
                            value={notificationSettings.discord?.templates?.markets?.message || 'Market Alert: {item} price reached {price} ISK ({change}% change) - consider {action}!'}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              discord: {
                                ...prev.discord,
                                templates: {
                                  ...prev.discord?.templates,
                                  markets: {
                                    ...prev.discord?.templates?.markets,
                                    message: e.target.value
                                  }
                                }
                              }
                            }))}
                            placeholder="Enter custom message template..."
                            className="text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Variables: {'{item}'}, {'{price}'}, {'{change}'}, {'{action}'}, {'{system}'}, {'{time}'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm">Advanced Settings</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.discord?.embedFormat || false}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({
                          ...prev,
                          discord: { ...prev.discord, embedFormat: checked }
                        }))}
                      />
                      <Label className="text-sm">Use rich embeds</Label>
                      <p className="text-xs text-muted-foreground">(Prettier formatting)</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.discord?.includeThumbnails || false}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({
                          ...prev,
                          discord: { ...prev.discord, includeThumbnails: checked }
                        }))}
                      />
                      <Label className="text-sm">Include EVE thumbnails</Label>
                      <p className="text-xs text-muted-foreground">(Ship/item images)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discordThrottleMinutes">Throttle Minutes</Label>
                    <Input
                      id="discordThrottleMinutes"
                      type="number"
                      min="0"
                      max="1440"
                      value={notificationSettings.discord?.throttleMinutes || 5}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        discord: { ...prev.discord, throttleMinutes: parseInt(e.target.value) || 5 }
                      }))}
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum minutes between similar notifications (prevents spam)
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (notificationSettings.discord?.webhookUrl) {
                      toast.info('Sending test message to Discord...');
                      
                      try {
                        // Import notification services
                        const { notificationManager } = await import('@/lib/notification-manager');
                        
                        // Test Discord integration
                        const result = await notificationManager.testNotifications({
                          ...notificationSettings,
                          events: { manufacturing: true, mining: true, killmails: true, markets: true }
                        });
                        
                        if (result.discord) {
                          toast.success('Test message sent to Discord successfully!');
                        } else {
                          toast.error('Discord test failed: ' + (result.errors.find(e => e.includes('Discord')) || 'Unknown error'));
                        }
                      } catch (error) {
                        console.error('Discord test error:', error);
                        toast.error('Failed to test Discord integration');
                      }
                    } else {
                      toast.error('Please enter a webhook URL first');
                    }
                  }}
                  disabled={!notificationSettings.discord?.webhookUrl}
                >
                  <Bell size={16} className="mr-2" />
                  Test Discord Integration
                </Button>
              </div>
            )}
          </div>

          {/* EVE Online Email */}
          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
                <Rocket size={12} className="text-white" />
              </div>
              <h4 className="font-medium">EVE Online In-Game Mail</h4>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable In-Game Mail Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications via EVE Online in-game mail system
                </p>
              </div>
              <Switch
                checked={notificationSettings.eveMail?.enabled || false}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({
                  ...prev,
                  eveMail: { ...prev.eveMail, enabled: checked }
                }))}
              />
            </div>

            {notificationSettings.eveMail?.enabled && (
              <div className="space-y-6 pl-6 border-l-2 border-orange-500/20">
                {/* Sender Configuration */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm">Sender Configuration</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eveMailSenderCharacter">Sender Character ID</Label>
                      <Input
                        id="eveMailSenderCharacter"
                        type="number"
                        value={notificationSettings.eveMail?.senderCharacterId || ''}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          eveMail: { ...prev.eveMail, senderCharacterId: parseInt(e.target.value) || 0 }
                        }))}
                        placeholder="Character ID with mail sending permissions"
                      />
                      <p className="text-xs text-muted-foreground">
                        Character that will send notifications (requires ESI mail scope)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="eveMailSubjectPrefix">Subject Prefix</Label>
                      <Input
                        id="eveMailSubjectPrefix"
                        value={notificationSettings.eveMail?.subjectPrefix || ''}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          eveMail: { ...prev.eveMail, subjectPrefix: e.target.value }
                        }))}
                        placeholder="[LMeve Alert]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Prefix for notification mail subjects
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recipients Configuration */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm">Recipients</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eveMailRecipients">Pilot Character IDs</Label>
                      <Textarea
                        id="eveMailRecipients"
                        rows={4}
                        value={notificationSettings.eveMail?.recipientIds?.join('\n') || ''}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          eveMail: {
                            ...prev.eveMail,
                            recipientIds: e.target.value.split('\n').map(id => parseInt(id.trim())).filter(id => id > 0)
                          }
                        }))}
                        placeholder="Enter character IDs, one per line&#10;91316135&#10;498125261&#10;12345678"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Individual pilots to receive notifications
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eveMailingLists">Mailing Lists</Label>
                      <Textarea
                        id="eveMailingLists"
                        rows={4}
                        value={notificationSettings.eveMail?.mailingLists?.map(ml => `${ml.name}:${ml.id}`).join('\n') || ''}
                        onChange={(e) => {
                          const lists = e.target.value.split('\n')
                            .map(line => line.trim())
                            .filter(line => line && line.includes(':'))
                            .map(line => {
                              const [name, id] = line.split(':');
                              return {
                                name: name.trim(),
                                id: parseInt(id.trim())
                              };
                            })
                            .filter(ml => ml.id > 0);
                          
                          setNotificationSettings(prev => ({
                            ...prev,
                            eveMail: {
                              ...prev.eveMail,
                              mailingLists: lists
                            }
                          }));
                        }}
                        placeholder="name:id format, one per line&#10;Corp Leadership:123456&#10;Industry Team:789012&#10;All Members:345678"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: ListName:MailingListID (one per line)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.eveMail?.sendToCorporation || false}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({
                          ...prev,
                          eveMail: { ...prev.eveMail, sendToCorporation: checked }
                        }))}
                      />
                      <Label className="text-sm">Send to entire corporation</Label>
                      <p className="text-xs text-muted-foreground">
                        (Broadcasts to all corp members)
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.eveMail?.sendToAlliance || false}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({
                          ...prev,
                          eveMail: { ...prev.eveMail, sendToAlliance: checked }
                        }))}
                      />
                      <Label className="text-sm">Send to alliance</Label>
                      <p className="text-xs text-muted-foreground">
                        (Requires alliance membership)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm">Delivery Options</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.eveMail?.onlyToOnlineCharacters || false}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({
                          ...prev,
                          eveMail: { ...prev.eveMail, onlyToOnlineCharacters: checked }
                        }))}
                      />
                      <Label className="text-sm">Only send to online characters</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.eveMail?.cspaChargeCheck || true}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({
                          ...prev,
                          eveMail: { ...prev.eveMail, cspaChargeCheck: checked }
                        }))}
                      />
                      <Label className="text-sm">Skip high CSPA charge recipients</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eveMailThrottleMinutes">Throttle Minutes</Label>
                    <Input
                      id="eveMailThrottleMinutes"
                      type="number"
                      min="1"
                      max="1440"
                      value={notificationSettings.eveMail?.throttleMinutes || 15}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        eveMail: { ...prev.eveMail, throttleMinutes: parseInt(e.target.value) || 15 }
                      }))}
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum minutes between EVE mail notifications (EVE has strict rate limits)
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (notificationSettings.eveMail?.senderCharacterId && 
                        (notificationSettings.eveMail?.recipientIds?.length > 0 || 
                         notificationSettings.eveMail?.mailingLists?.length > 0 ||
                         notificationSettings.eveMail?.sendToCorporation ||
                         notificationSettings.eveMail?.sendToAlliance)) {
                      toast.info('Sending test EVE mail...');
                      
                      try {
                        // Import notification services
                        const { notificationManager } = await import('@/lib/notification-manager');
                        
                        // Test EVE mail integration
                        const result = await notificationManager.testNotifications({
                          ...notificationSettings,
                          events: { manufacturing: true, mining: true, killmails: true, markets: true }
                        });
                        
                        if (result.eveMail) {
                          toast.success('Test EVE mail sent successfully!');
                        } else {
                          toast.error('EVE mail test failed: ' + (result.errors.find(e => e.includes('EVE')) || 'Unknown error'));
                        }
                      } catch (error) {
                        console.error('EVE mail test error:', error);
                        toast.error('Failed to test EVE mail integration');
                      }
                    } else {
                      toast.error('Please configure sender and at least one recipient first');
                    }
                  }}
                  disabled={!notificationSettings.eveMail?.senderCharacterId || 
                    (!notificationSettings.eveMail?.recipientIds?.length && 
                     !notificationSettings.eveMail?.mailingLists?.length &&
                     !notificationSettings.eveMail?.sendToCorporation &&
                     !notificationSettings.eveMail?.sendToAlliance)}
                >
                  <Rocket size={16} className="mr-2" />
                  Test EVE Mail Integration
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                // Reset to defaults
                window.location.reload();
              }}
            >
              Reset Changes
            </Button>
            <Button
              onClick={saveNotificationSettings}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <CheckCircle size={16} className="mr-2" />
              Save Notification Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}