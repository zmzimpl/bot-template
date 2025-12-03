/**
 * Bark Push Notification Utility
 * Send push notifications to iOS devices via Bark
 * https://github.com/Finb/Bark
 */

import { chalk } from './chalk.js';
import { retry } from './retry.js';
import { getDefaultClient } from '../http/index.js';
import type { BarkConfig, BarkOptions } from '../types/index.js';

export class BarkNotifier {
  private enabled: boolean;
  private serverUrl: string;
  private deviceKey: string;
  private sound: string;
  private defaultLevel: 'active' | 'timeSensitive' | 'passive';
  private group: string;
  private icon: string;

  constructor(config?: BarkConfig) {
    this.enabled = config?.enabled || false;
    this.serverUrl = config?.serverUrl || 'https://api.day.app';
    this.deviceKey = config?.deviceKey || '';
    this.sound = config?.sound || 'bell';
    this.defaultLevel = config?.level || 'active';
    this.group = config?.group || 'Notifications';
    this.icon = config?.icon || '';

    if (this.enabled && !this.deviceKey) {
      console.log(
        chalk.yellow('[Bark] Warning: Bark enabled but deviceKey not configured, disabling')
      );
      this.enabled = false;
    }

    if (this.enabled) {
      console.log(chalk.green('[Bark] Push notifications enabled'));
    }
  }

  /**
   * Create BarkNotifier from environment variables
   */
  static fromEnv(): BarkNotifier {
    return new BarkNotifier({
      enabled: process.env.BARK_ENABLED === 'true',
      serverUrl: process.env.BARK_SERVER_URL || 'https://api.day.app',
      deviceKey: process.env.BARK_DEVICE_KEY || '',
      sound: process.env.BARK_SOUND || 'bell',
      level: (process.env.BARK_LEVEL as 'active' | 'timeSensitive' | 'passive') || 'active',
      group: process.env.BARK_GROUP || 'Notifications',
      icon: process.env.BARK_ICON || '',
    });
  }

  /**
   * Send a push notification
   * @param title - Notification title
   * @param body - Notification body
   * @param options - Additional options
   */
  async send(title: string, body: string, options: BarkOptions = {}): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const params = new URLSearchParams({
        call: '1',
        sound: options.sound || this.sound,
        group: options.group || this.group,
        level: options.level || this.defaultLevel,
        ...(options.url && { url: options.url }),
        ...(options.icon && { icon: options.icon }),
        ...(this.icon && !options.icon && { icon: this.icon }),
        ...(options.badge !== undefined && { badge: String(options.badge) }),
      });

      const encodedTitle = encodeURIComponent(title);
      const encodedBody = encodeURIComponent(body);

      const url = `${this.serverUrl}/${this.deviceKey}/${encodedTitle}/${encodedBody}?${params.toString()}`;

      const client = getDefaultClient();

      const response = await retry(
        () => client.get<{ code: number; message?: string }>(url),
        3,
        2000
      );

      if (response.data.code === 200) {
        console.log(chalk.green(`[Bark] Push sent: ${title}`));
        return true;
      } else {
        console.log(
          chalk.yellow(`[Bark] Push failed: ${response.data.message || 'Unknown error'}`)
        );
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(chalk.red(`[Bark] Push error (after 3 retries): ${errorMessage}`));
      return false;
    }
  }

  /**
   * Send a success notification
   */
  async success(title: string, body: string, options: BarkOptions = {}): Promise<boolean> {
    return this.send(`${title}`, body, {
      level: 'active',
      sound: 'multiwayinvitation',
      ...options,
    });
  }

  /**
   * Send an error notification
   */
  async error(title: string, body: string, options: BarkOptions = {}): Promise<boolean> {
    return this.send(`${title}`, body, {
      level: 'timeSensitive',
      sound: 'alarm',
      ...options,
    });
  }

  /**
   * Send a warning notification
   */
  async warning(title: string, body: string, options: BarkOptions = {}): Promise<boolean> {
    return this.send(`${title}`, body, {
      level: 'active',
      sound: 'alarm',
      ...options,
    });
  }

  /**
   * Send an info notification
   */
  async info(title: string, body: string, options: BarkOptions = {}): Promise<boolean> {
    return this.send(`${title}`, body, {
      level: 'passive',
      ...options,
    });
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable or disable notifications
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled && !!this.deviceKey;
  }
}
