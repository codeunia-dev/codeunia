import { HealthCheckResponse } from './health-checks';

export interface AlertConfig {
  enabled: boolean;
  webhook_url?: string;
  email_recipients?: string[];
  slack_webhook?: string;
  discord_webhook?: string;
  alert_thresholds: {
    response_time_ms: number;
    error_rate_percent: number;
    consecutive_failures: number;
  };
}

export interface Alert {
  id: string;
  type: 'health_check_failure' | 'performance_degradation' | 'security_incident' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  service?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  resolved_at?: string;
  status: 'active' | 'resolved' | 'acknowledged';
}

export interface AlertChannel {
  type: 'webhook' | 'email' | 'slack' | 'discord';
  config: Record<string, unknown>;
  enabled: boolean;
}

/**
 * Enhanced Monitoring and Alerting System
 */
export class MonitoringAlerting {
  private alertConfig: AlertConfig;
  private alertChannels: AlertChannel[] = [];
  private alertHistory: Alert[] = [];
  private consecutiveFailures: Map<string, number> = new Map();

  constructor() {
    this.alertConfig = this.loadAlertConfig();
    this.initializeAlertChannels();
  }

  /**
   * Load alert configuration from environment variables
   */
  private loadAlertConfig(): AlertConfig {
    return {
      enabled: process.env.ALERTING_ENABLED === 'true',
      webhook_url: process.env.ALERT_WEBHOOK_URL,
      email_recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',').map(e => e.trim()),
      slack_webhook: process.env.SLACK_WEBHOOK_URL,
      discord_webhook: process.env.DISCORD_WEBHOOK_URL,
      alert_thresholds: {
        response_time_ms: parseInt(process.env.ALERT_RESPONSE_TIME_THRESHOLD || '5000'),
        error_rate_percent: parseInt(process.env.ALERT_ERROR_RATE_THRESHOLD || '10'),
        consecutive_failures: parseInt(process.env.ALERT_CONSECUTIVE_FAILURES || '3')
      }
    };
  }

  /**
   * Initialize alert channels based on configuration
   */
  private initializeAlertChannels(): void {
    // Only use email alerts for now - disable Slack and Discord
    // if (this.alertConfig.slack_webhook) {
    //   this.alertChannels.push({
    //     type: 'slack',
    //     config: { webhook_url: this.alertConfig.slack_webhook },
    //     enabled: false // Disabled as requested
    //   });
    // }

    // if (this.alertConfig.discord_webhook) {
    //   this.alertChannels.push({
    //     type: 'discord',
    //     config: { webhook_url: this.alertConfig.discord_webhook },
    //     enabled: false // Disabled as requested
    //   });
    // }

    if (this.alertConfig.webhook_url) {
      this.alertChannels.push({
        type: 'webhook',
        config: { webhook_url: this.alertConfig.webhook_url },
        enabled: true
      });
    }

    // Always enable email alerts with the default recipient
    const emailRecipients = this.alertConfig.email_recipients && this.alertConfig.email_recipients.length > 0 
      ? this.alertConfig.email_recipients 
      : ['connect@codeunia.com'];
      
    this.alertChannels.push({
      type: 'email',
      config: { recipients: emailRecipients },
      enabled: true
    });
  }

  /**
   * Process health check results and trigger alerts if necessary
   */
  async processHealthCheckResults(results: HealthCheckResponse): Promise<void> {
    if (!this.alertConfig.enabled) {
      return;
    }

    const alerts: Alert[] = [];

    // Check for unhealthy services
    const unhealthyServices = results.checks.filter(check => check.status === 'unhealthy');
    for (const service of unhealthyServices) {
      const alert = await this.createAlert(
        'health_check_failure',
        'critical',
        `Service ${service.service} is unhealthy`,
        `Service ${service.service} failed health check: ${service.message}`,
        service.service,
        {
          service: service.service,
          status: service.status,
          message: service.message,
          response_time: service.responseTime,
          details: service.details,
          timestamp: service.timestamp
        }
      );
      alerts.push(alert);
    }

    // Check for degraded services
    const degradedServices = results.checks.filter(check => check.status === 'degraded');
    for (const service of degradedServices) {
      const alert = await this.createAlert(
        'performance_degradation',
        'medium',
        `Service ${service.service} is degraded`,
        `Service ${service.service} is experiencing performance issues: ${service.message}`,
        service.service,
        {
          service: service.service,
          status: service.status,
          message: service.message,
          response_time: service.responseTime,
          details: service.details,
          timestamp: service.timestamp
        }
      );
      alerts.push(alert);
    }

    // Check for high response times
    const slowServices = results.checks.filter(check => 
      check.responseTime > this.alertConfig.alert_thresholds.response_time_ms
    );
    for (const service of slowServices) {
      const alert = await this.createAlert(
        'performance_degradation',
        'low',
        `Service ${service.service} is slow`,
        `Service ${service.service} response time (${service.responseTime}ms) exceeds threshold (${this.alertConfig.alert_thresholds.response_time_ms}ms)`,
        service.service,
        {
          service: service.service,
          response_time: service.responseTime,
          threshold: this.alertConfig.alert_thresholds.response_time_ms,
          timestamp: service.timestamp
        }
      );
      alerts.push(alert);
    }

    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }

    // Log system event for audit (commented out to avoid circular dependency)
    // This should be handled by the calling service
    if (alerts.length > 0) {
      console.log(`Generated ${alerts.length} alerts for monitoring system`);
    }
  }

  /**
   * Create a new alert
   */
  private async createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    message: string,
    service?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<Alert> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      message,
      service,
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      status: 'active'
    };

    this.alertHistory.push(alert);
    return alert;
  }

  /**
   * Send alert through configured channels with enhanced error handling
   */
  private async sendAlert(alert: Alert): Promise<void> {
    const promises = this.alertChannels
      .filter(channel => channel.enabled)
      .map(channel => this.sendToChannelWithLogging(alert, channel));

    await Promise.allSettled(promises);
  }

  /**
   * Send alert to a specific channel with structured logging
   */
  private async sendToChannelWithLogging(alert: Alert, channel: AlertChannel): Promise<void> {
    try {
      await this.sendToChannel(alert, channel);
      this.logAlertDelivery(alert, channel.type, true);
    } catch (error) {
      this.logAlertDelivery(alert, channel.type, false, error as Error);
      // Don't throw - implement graceful degradation
      console.error(`Failed to send alert via ${channel.type}:`, error);
    }
  }

  /**
   * Log alert delivery attempts with structured logging
   */
  private logAlertDelivery(alert: Alert, channelType: string, success: boolean, error?: Error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: success ? 'info' : 'error',
      service: 'alerting',
      event: 'alert_delivery',
      alert: {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title
      },
      channel: channelType,
      success,
      environment: process.env.NODE_ENV,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ALERTING] ${success ? 'SUCCESS' : 'FAILED'} - ${channelType}:`, logEntry)
    } else {
      // In production, use structured JSON logging
      console.log(JSON.stringify(logEntry))
    }
  }

  /**
   * Send alert to a specific channel
   */
  private async sendToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    try {
      switch (channel.type) {
        case 'slack':
          await this.sendSlackAlert(alert, channel.config);
          break;
        case 'discord':
          await this.sendDiscordAlert(alert, channel.config);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert, channel.config);
          break;
        case 'email':
          await this.sendEmailAlert(alert, channel.config);
          break;
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel.type}:`, error);
    }
  }

  /**
   * Send alert to Slack
   */
  private async sendSlackAlert(alert: Alert, config: Record<string, unknown>): Promise<void> {
    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    const payload = {
      text: `${emoji} ${alert.title}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Alert Type',
              value: alert.type.replace(/_/g, ' ').toUpperCase(),
              short: true
            },
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Service',
              value: alert.service || 'System',
              short: true
            },
            {
              title: 'Environment',
              value: process.env.NODE_ENV || 'development',
              short: true
            },
            {
              title: 'Message',
              value: alert.message,
              short: false
            },
            {
              title: 'Timestamp',
              value: new Date(alert.created_at).toLocaleString(),
              short: true
            }
          ],
          footer: 'Codeunia Monitoring System',
          ts: Math.floor(new Date(alert.created_at).getTime() / 1000)
        }
      ]
    };

    const response = await fetch(config.webhook_url as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  }

  /**
   * Send alert to Discord
   */
  private async sendDiscordAlert(alert: Alert, config: Record<string, unknown>): Promise<void> {
    const color = this.getSeverityColorHex(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    const payload = {
      embeds: [
        {
          title: `${emoji} ${alert.title}`,
          description: alert.message,
          color,
          fields: [
            {
              name: 'Alert Type',
              value: alert.type.replace(/_/g, ' ').toUpperCase(),
              inline: true
            },
            {
              name: 'Severity',
              value: alert.severity.toUpperCase(),
              inline: true
            },
            {
              name: 'Service',
              value: alert.service || 'System',
              inline: true
            },
            {
              name: 'Environment',
              value: process.env.NODE_ENV || 'development',
              inline: true
            },
            {
              name: 'Timestamp',
              value: new Date(alert.created_at).toLocaleString(),
              inline: true
            }
          ],
          footer: {
            text: 'Codeunia Monitoring System'
          },
          timestamp: alert.created_at
        }
      ]
    };

    const response = await fetch(config.webhook_url as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }
  }

  /**
   * Send alert via webhook
   */
  private async sendWebhookAlert(alert: Alert, config: Record<string, unknown>): Promise<void> {
    const payload = {
      alert,
      system_info: {
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString()
      }
    };

    const response = await fetch(config.webhook_url as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Codeunia-Monitoring/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }
  }

  /**
   * Send alert via email (using existing email system)
   */
  private async sendEmailAlert(alert: Alert, config: Record<string, unknown>): Promise<void> {
    const emailRecipients = (config.emailRecipients as string) || process.env.ALERT_EMAIL_RECIPIENTS || 'connect@codeunia.com';
    
    const emailContent = {
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${this.getSeverityColorHex(alert.severity)}; color: white; padding: 20px; text-align: center;">
            <h1>${this.getSeverityEmoji(alert.severity)} ${alert.title}</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Alert Details</h2>
            <p><strong>Type:</strong> ${alert.type.replace(/_/g, ' ').toUpperCase()}</p>
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Service:</strong> ${alert.service || 'System'}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>Timestamp:</strong> ${new Date(alert.created_at).toLocaleString()}</p>
            <hr>
            <h3>Message</h3>
            <p>${alert.message}</p>
            ${Object.keys(alert.metadata).length > 0 ? `
              <h3>Additional Information</h3>
              <pre style="background-color: #eee; padding: 10px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(alert.metadata, null, 2)}
              </pre>
            ` : ''}
          </div>
          <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
            Codeunia Monitoring System
          </div>
        </div>
      `,
      text: `
${alert.title}

Alert Details:
- Type: ${alert.type.replace(/_/g, ' ').toUpperCase()}
- Severity: ${alert.severity.toUpperCase()}
- Service: ${alert.service || 'System'}
- Environment: ${process.env.NODE_ENV || 'development'}
- Timestamp: ${new Date(alert.created_at).toLocaleString()}

Message:
${alert.message}

${Object.keys(alert.metadata).length > 0 ? `
Additional Information:
${JSON.stringify(alert.metadata, null, 2)}
` : ''}

---
Codeunia Monitoring System
      `
    };

    try {
      // Use Resend for email alerts
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'alerts@codeunia.com',
          to: emailRecipients,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });
        
        console.log(`📧 Email alert sent to ${emailRecipients}: ${alert.title}`);
      } else {
        // Fallback to console log if Resend is not configured
        console.log('📧 EMAIL ALERT (Resend not configured):', {
          to: emailRecipients,
          subject: emailContent.subject,
          body: emailContent.text
        });
      }
    } catch (error) {
      console.error('Failed to send email alert:', error);
      // Fallback to console log
      console.log('📧 EMAIL ALERT (Fallback):', {
        to: emailRecipients,
        subject: emailContent.subject,
        body: emailContent.text
      });
    }
  }

  /**
   * Get severity color for Slack
   */
  private getSeverityColor(severity: Alert['severity']): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'good';
      case 'low': return '#36a64f';
      default: return 'good';
    }
  }

  /**
   * Get severity color hex for Discord/Email
   */
  private getSeverityColorHex(severity: Alert['severity']): number {
    switch (severity) {
      case 'critical': return 0xff0000; // Red
      case 'high': return 0xff8c00; // Orange
      case 'medium': return 0xffd700; // Yellow
      case 'low': return 0x00ff00; // Green
      default: return 0x00ff00;
    }
  }

  /**
   * Get severity emoji
   */
  private getSeverityEmoji(severity: Alert['severity']): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return 'ℹ️';
    }
  }

  /**
   * Get alert history
   */
  getAlertHistory(): Alert[] {
    return this.alertHistory;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alertHistory.filter(alert => alert.status === 'active');
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert && alert.status === 'active') {
      alert.status = 'acknowledged';
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert && (alert.status === 'active' || alert.status === 'acknowledged')) {
      alert.status = 'resolved';
      alert.resolved_at = new Date().toISOString();
      return true;
    }
    return false;
  }
}

// Global monitoring and alerting instance
export const monitoringAlerting = new MonitoringAlerting();
