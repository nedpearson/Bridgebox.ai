import type {
  Connector,
  ConnectorProvider,
  SyncResult,
  ExternalData,
  NormalizedRecord,
  ConnectorHealth,
} from '../types';

export abstract class BaseConnector {
  protected connector: Connector;
  protected provider: ConnectorProvider;

  constructor(connector: Connector, provider: ConnectorProvider) {
    this.connector = connector;
    this.provider = provider;
  }

  abstract connect(credentials?: Record<string, any>): Promise<boolean>;

  abstract disconnect(): Promise<boolean>;

  abstract testConnection(): Promise<boolean>;

  abstract fetchExternalData(options?: Record<string, any>): Promise<ExternalData[]>;

  abstract syncNow(): Promise<SyncResult>;

  abstract normalizeData(rawData: any): NormalizedRecord[];

  getConnectorId(): string {
    return this.connector.id;
  }

  getProviderId(): string {
    return this.provider.id;
  }

  getStatus() {
    return this.connector.status;
  }

  isConnected(): boolean {
    return this.connector.status === 'connected' && this.connector.auth.isAuthenticated;
  }

  getLastSyncTime(): string | undefined {
    return this.connector.lastSyncAt;
  }

  protected async logEvent(
    eventType: string,
    message: string,
    severity: string = 'info',
    data?: any
  ): Promise<void> {
    console.log(`[${this.provider.displayName}] ${eventType}: ${message}`, data);
  }

  protected createSyncResult(
    success: boolean,
    recordsProcessed: number = 0,
    startedAt: string,
    error?: string
  ): SyncResult {
    const completedAt = new Date().toISOString();
    const duration =
      new Date(completedAt).getTime() - new Date(startedAt).getTime();

    return {
      success,
      recordsProcessed,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      recordsFailed: success ? 0 : recordsProcessed,
      errors: error ? [{ error }] : [],
      duration,
      startedAt,
      completedAt,
    };
  }

  async getHealth(): Promise<ConnectorHealth> {
    return {
      connectorId: this.connector.id,
      status: this.connector.status,
      isHealthy: this.isConnected() && !this.connector.lastSyncError,
      uptime: 0,
      successRate: this.calculateSuccessRate(),
      averageSyncDuration: 0,
      lastError: this.connector.lastSyncError,
      warnings: [],
      recommendations: [],
    };
  }

  private calculateSuccessRate(): number {
    if (!this.connector.syncCount || this.connector.syncCount === 0) {
      return 100;
    }
    return 100;
  }
}