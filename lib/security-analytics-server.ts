/**
 * Security Analytics Service - Server Side
 * 
 * Tracks security events, threat patterns, and system security health
 */

interface SecurityEvent {
  id: string
  timestamp: number
  type: 'auth_attempt' | 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'csrf_attack' | 'sql_injection_attempt' | 'xss_attempt' | 'admin_access' | 'password_change' | 'account_lockout'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ip: string
  userAgent?: string
  route?: string
  description: string
  details?: Record<string, unknown>
  resolved: boolean
}

interface SecurityStats {
  totalEvents: number
  criticalEvents: number
  failedLogins: number
  blockedIPs: number
  suspiciousActivities: number
  rateLimitViolations: number
  csrfAttempts: number
  sqlInjectionAttempts: number
  xssAttempts: number
  lastUpdated: Date
}

interface ThreatAnalysis {
  topThreats: Array<{
    type: string
    count: number
    severity: string
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  geographicDistribution: Array<{
    country: string
    region: string
    threatCount: number
    suspiciousIPs: number
  }>
  timePatterns: Array<{
    hour: number
    eventCount: number
    threatLevel: 'low' | 'medium' | 'high'
  }>
}

interface SecurityHealth {
  score: number
  status: 'secure' | 'warning' | 'critical'
  vulnerabilities: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
    discovered: number
  }>
  compliance: {
    gdpr: boolean
    ccpa: boolean
    sox: boolean
    pci: boolean
  }
}

interface DetailedSecurityAnalytics {
  stats: SecurityStats
  events: SecurityEvent[]
  threatAnalysis: ThreatAnalysis
  securityHealth: SecurityHealth
}

class SecurityAnalytics {
  private events: SecurityEvent[] = []
  private blockedIPs: Set<string> = new Set()
  private readonly MAX_EVENTS = 10000 // Keep last 10k events in memory

  /**
   * Record a security event
   */
  recordEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now(),
      resolved: false
    }
    
    this.events.push(fullEvent)
    
    // Keep memory usage in check
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS)
    }

    // Auto-block IPs with too many critical events
    if (event.severity === 'critical') {
      this.evaluateIPBlocking(event.ip)
    }

    // Send to security monitoring services
    this.sendToSecurityServices(fullEvent)
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Evaluate if an IP should be blocked
   */
  private evaluateIPBlocking(ip: string) {
    const recentEvents = this.events.filter(e => 
      e.ip === ip && 
      Date.now() - e.timestamp < 60 * 60 * 1000 && // Last hour
      ['critical', 'high'].includes(e.severity)
    )

    if (recentEvents.length >= 5) {
      this.blockedIPs.add(ip)
      console.log(`🚫 Blocked IP ${ip} due to ${recentEvents.length} high-severity events`)
    }
  }

  /**
   * Get security statistics for a time period
   */
  getStats(periodMs: number = 24 * 60 * 60 * 1000): SecurityStats {
    const cutoff = Date.now() - periodMs
    const recentEvents = this.events.filter(e => e.timestamp > cutoff)
    
    const totalEvents = recentEvents.length
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length
    const failedLogins = recentEvents.filter(e => e.type === 'failed_login').length
    const suspiciousActivities = recentEvents.filter(e => e.type === 'suspicious_activity').length
    const rateLimitViolations = recentEvents.filter(e => e.type === 'rate_limit_exceeded').length
    const csrfAttempts = recentEvents.filter(e => e.type === 'csrf_attack').length
    const sqlInjectionAttempts = recentEvents.filter(e => e.type === 'sql_injection_attempt').length
    const xssAttempts = recentEvents.filter(e => e.type === 'xss_attempt').length

    return {
      totalEvents,
      criticalEvents,
      failedLogins,
      blockedIPs: this.blockedIPs.size,
      suspiciousActivities,
      rateLimitViolations,
      csrfAttempts,
      sqlInjectionAttempts,
      xssAttempts,
      lastUpdated: new Date()
    }
  }

  /**
   * Get detailed security analytics for admin dashboard
   */
  getDetailedAnalytics(periodMs: number = 24 * 60 * 60 * 1000, severityFilter: string = 'all'): DetailedSecurityAnalytics {
    const cutoff = Date.now() - periodMs
    let recentEvents = this.events.filter(e => e.timestamp > cutoff)
    
    // Apply severity filter
    if (severityFilter !== 'all') {
      recentEvents = recentEvents.filter(e => e.severity === severityFilter)
    }

    const threatAnalysis = this.analyzeThreatPatterns(recentEvents)
    const securityHealth = this.assessSecurityHealth(recentEvents)

    return {
      stats: this.getStats(periodMs),
      events: recentEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100), // Latest 100 events
      threatAnalysis,
      securityHealth
    }
  }

  /**
   * Analyze threat patterns
   */
  private analyzeThreatPatterns(events: SecurityEvent[]): ThreatAnalysis {
    // Count threat types
    const threatCounts = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topThreats = Object.entries(threatCounts)
      .map(([type, count]) => ({
        type,
        count,
        severity: this.getThreatSeverity(type, count),
        trend: this.calculateTrend(type, events) as 'increasing' | 'decreasing' | 'stable'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Geographic distribution (mock data for now)
    const geographicDistribution = [
      { country: 'United States', region: 'North America', threatCount: 45, suspiciousIPs: 12 },
      { country: 'China', region: 'Asia', threatCount: 38, suspiciousIPs: 15 },
      { country: 'Russia', region: 'Europe', threatCount: 25, suspiciousIPs: 8 },
      { country: 'Germany', region: 'Europe', threatCount: 18, suspiciousIPs: 5 },
      { country: 'Brazil', region: 'South America', threatCount: 12, suspiciousIPs: 4 }
    ]

    // Time patterns - events by hour
    const timePatterns = Array.from({ length: 24 }, (_, hour) => {
      const hourEvents = events.filter(e => new Date(e.timestamp).getHours() === hour)
      const eventCount = hourEvents.length
      const criticalCount = hourEvents.filter(e => e.severity === 'critical').length
      
      return {
        hour,
        eventCount,
        threatLevel: criticalCount > 5 ? 'high' : eventCount > 10 ? 'medium' : 'low' as 'low' | 'medium' | 'high'
      }
    })

    return {
      topThreats,
      geographicDistribution,
      timePatterns
    }
  }

  /**
   * Get threat severity based on type and count
   */
  private getThreatSeverity(type: string, count: number): string {
    const criticalTypes = ['sql_injection_attempt', 'xss_attempt', 'csrf_attack']
    const highTypes = ['failed_login', 'suspicious_activity']
    
    if (criticalTypes.includes(type) || count > 50) return 'critical'
    if (highTypes.includes(type) || count > 20) return 'high'
    if (count > 10) return 'medium'
    return 'low'
  }

  /**
   * Calculate threat trend
   */
  private calculateTrend(type: string, events: SecurityEvent[]): string {
    const now = Date.now()
    const halfPeriod = 12 * 60 * 60 * 1000 // 12 hours
    
    const recentCount = events.filter(e => 
      e.type === type && (now - e.timestamp) < halfPeriod
    ).length
    
    const olderCount = events.filter(e => 
      e.type === type && 
      (now - e.timestamp) >= halfPeriod && 
      (now - e.timestamp) < 24 * 60 * 60 * 1000
    ).length

    if (recentCount > olderCount * 1.2) return 'increasing'
    if (recentCount < olderCount * 0.8) return 'decreasing'
    return 'stable'
  }

  /**
   * Assess overall security health
   */
  private assessSecurityHealth(events: SecurityEvent[]): SecurityHealth {
    let score = 100
    const vulnerabilities: SecurityHealth['vulnerabilities'] = []

    // Check for critical events
    const criticalEvents = events.filter(e => e.severity === 'critical')
    if (criticalEvents.length > 10) {
      score -= 30
      vulnerabilities.push({
        type: 'High Critical Event Volume',
        severity: 'critical',
        description: `${criticalEvents.length} critical security events detected`,
        recommendation: 'Immediate investigation and threat mitigation required',
        discovered: Date.now()
      })
    }

    // Check for SQL injection attempts
    const sqlAttempts = events.filter(e => e.type === 'sql_injection_attempt')
    if (sqlAttempts.length > 0) {
      score -= 25
      vulnerabilities.push({
        type: 'SQL Injection Attempts',
        severity: 'high',
        description: `${sqlAttempts.length} SQL injection attempts detected`,
        recommendation: 'Review input validation and implement parameterized queries',
        discovered: Date.now()
      })
    }

    // Check for XSS attempts
    const xssAttempts = events.filter(e => e.type === 'xss_attempt')
    if (xssAttempts.length > 0) {
      score -= 20
      vulnerabilities.push({
        type: 'XSS Attempts',
        severity: 'high',
        description: `${xssAttempts.length} XSS attempts detected`,
        recommendation: 'Implement proper output encoding and Content Security Policy',
        discovered: Date.now()
      })
    }

    // Check for excessive failed logins
    const failedLogins = events.filter(e => e.type === 'failed_login')
    if (failedLogins.length > 50) {
      score -= 15
      vulnerabilities.push({
        type: 'Brute Force Attacks',
        severity: 'medium',
        description: `${failedLogins.length} failed login attempts detected`,
        recommendation: 'Implement account lockout and CAPTCHA mechanisms',
        discovered: Date.now()
      })
    }

    const status = score >= 80 ? 'secure' : score >= 60 ? 'warning' : 'critical'

    return {
      score: Math.max(0, score),
      status,
      vulnerabilities,
      compliance: {
        gdpr: score >= 80, // Simplified compliance check
        ccpa: score >= 75,
        sox: score >= 85,
        pci: score >= 90
      }
    }
  }

  /**
   * Resolve a security event
   */
  resolveEvent(eventId: string): boolean {
    const eventIndex = this.events.findIndex(e => e.id === eventId)
    if (eventIndex !== -1) {
      this.events[eventIndex].resolved = true
      return true
    }
    return false
  }

  /**
   * Send event to security monitoring services
   */
  private async sendToSecurityServices(event: SecurityEvent) {
    try {
      // In production, send to services like Datadog Security, Splunk, etc.
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔒 Security event: ${event.type} - ${event.severity} - ${event.ip}`)
      }
    } catch (error) {
      console.error('Error sending security event to monitoring services:', error)
    }
  }

  /**
   * Generate test security data
   */
  generateTestData(count: number = 50) {
    const eventTypes: SecurityEvent['type'][] = [
      'auth_attempt', 'failed_login', 'suspicious_activity', 'rate_limit_exceeded',
      'csrf_attack', 'sql_injection_attempt', 'xss_attempt', 'admin_access',
      'password_change', 'account_lockout'
    ]

    const severities: SecurityEvent['severity'][] = ['low', 'medium', 'high', 'critical']
    const ips = [
      '192.168.1.100', '10.0.0.50', '203.0.113.10', '198.51.100.25',
      '172.16.0.100', '192.0.2.15', '203.0.113.200', '198.51.100.150'
    ]

    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'curl/7.68.0',
      'python-requests/2.25.1',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'Postman/7.36.0'
    ]

    const routes = [
      '/api/auth/signin', '/admin/users', '/api/users', '/api/posts',
      '/api/payments', '/admin/dashboard', '/api/auth/reset-password'
    ]

    for (let i = 0; i < count; i++) {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const ip = ips[Math.floor(Math.random() * ips.length)]
      
      // Generate realistic severity distribution
      let severity: SecurityEvent['severity']
      if (type.includes('injection') || type.includes('xss') || type.includes('csrf')) {
        severity = Math.random() < 0.7 ? 'critical' : 'high'
      } else if (type === 'failed_login' || type === 'suspicious_activity') {
        severity = Math.random() < 0.3 ? 'high' : 'medium'
      } else {
        severity = severities[Math.floor(Math.random() * severities.length)]
      }

      const descriptions = {
        'auth_attempt': 'User authentication attempt',
        'failed_login': 'Failed login attempt with invalid credentials',
        'suspicious_activity': 'Unusual user behavior pattern detected',
        'rate_limit_exceeded': 'Request rate limit exceeded',
        'csrf_attack': 'Potential CSRF attack detected',
        'sql_injection_attempt': 'SQL injection attempt in user input',
        'xss_attempt': 'Cross-site scripting attempt detected',
        'admin_access': 'Administrative access granted',
        'password_change': 'User password changed',
        'account_lockout': 'Account locked due to multiple failed attempts'
      }

      this.recordEvent({
        type,
        severity,
        ip,
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        route: routes[Math.floor(Math.random() * routes.length)],
        description: descriptions[type],
        userId: Math.random() < 0.6 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
        details: {
          timestamp_iso: new Date().toISOString(),
          source: 'test_data_generator'
        }
      })
    }

    console.log(`Generated ${count} security events`)
  }

  /**
   * Export events in different formats
   */
  exportEvents(format: 'json' | 'csv', periodMs: number = 24 * 60 * 60 * 1000, severityFilter: string = 'all'): string {
    const cutoff = Date.now() - periodMs
    let recentEvents = this.events.filter(e => e.timestamp > cutoff)
    
    if (severityFilter !== 'all') {
      recentEvents = recentEvents.filter(e => e.severity === severityFilter)
    }
    
    if (format === 'csv') {
      const headers = [
        'id', 'timestamp', 'type', 'severity', 'ip', 'route', 
        'description', 'userId', 'resolved'
      ]
      const rows = recentEvents.map(e => [
        e.id,
        new Date(e.timestamp).toISOString(),
        e.type,
        e.severity,
        e.ip,
        e.route || '',
        e.description,
        e.userId || '',
        e.resolved
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(recentEvents, null, 2)
  }
}

// Global instance
const analytics = new SecurityAnalytics()

export { analytics as securityAnalytics }
export type { SecurityEvent, SecurityStats, DetailedSecurityAnalytics }
