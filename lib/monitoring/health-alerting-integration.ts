import { HealthChecker, HealthCheckResponse } from './health-checks';
import { monitoringAlerting } from './alerting';

/**
 * Integration service to handle health checks with alerting
 * This avoids circular dependencies between health-checks and alerting modules
 */
export class HealthAlertingIntegration {
  private healthChecker = new HealthChecker();

  /**
   * Run health checks and process alerts
   */
  async runHealthChecksWithAlerting(quick = false): Promise<HealthCheckResponse> {
    // Run health checks
    const results = quick 
      ? await this.healthChecker.runQuickCheck()
      : await this.healthChecker.runAllChecks();

    // Process results for alerting
    await monitoringAlerting.processHealthCheckResults(results);

    return results;
  }

  /**
   * Get health checker instance
   */
  getHealthChecker(): HealthChecker {
    return this.healthChecker;
  }
}

// Global instance
export const healthAlertingIntegration = new HealthAlertingIntegration();
