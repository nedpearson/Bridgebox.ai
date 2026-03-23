import { BaseConnector } from '../core/BaseConnector';
import type { SyncResult, ExternalData, NormalizedRecord } from '../types';

export class MockConnector extends BaseConnector {
  async connect(credentials?: Record<string, any>): Promise<boolean> {
    await this.logEvent('connected', 'Mock connector connected successfully');
    return true;
  }

  async disconnect(): Promise<boolean> {
    await this.logEvent('disconnected', 'Mock connector disconnected');
    return true;
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async fetchExternalData(options?: Record<string, any>): Promise<ExternalData[]> {
    const mockData: ExternalData[] = [
      {
        sourceId: `${this.provider.id}-1`,
        sourceType: this.provider.type,
        rawData: {
          id: '1',
          name: 'Sample Record 1',
          email: 'sample1@example.com',
          createdAt: new Date().toISOString(),
        },
        fetchedAt: new Date().toISOString(),
      },
      {
        sourceId: `${this.provider.id}-2`,
        sourceType: this.provider.type,
        rawData: {
          id: '2',
          name: 'Sample Record 2',
          email: 'sample2@example.com',
          createdAt: new Date().toISOString(),
        },
        fetchedAt: new Date().toISOString(),
      },
    ];

    return mockData;
  }

  async syncNow(): Promise<SyncResult> {
    const startedAt = new Date().toISOString();

    try {
      await this.logEvent('sync_started', 'Starting mock sync');

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const data = await this.fetchExternalData();
      const normalized = this.normalizeData(data);

      await this.logEvent(
        'sync_completed',
        `Synced ${normalized.length} records`,
        'info',
        { count: normalized.length }
      );

      return {
        success: true,
        recordsProcessed: normalized.length,
        recordsCreated: normalized.length,
        recordsUpdated: 0,
        recordsSkipped: 0,
        recordsFailed: 0,
        duration: 1000,
        startedAt,
        completedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      await this.logEvent('sync_failed', error.message, 'error');
      return this.createSyncResult(false, 0, startedAt, error.message);
    }
  }

  normalizeData(externalData: ExternalData[]): NormalizedRecord[] {
    return externalData.map((data) => ({
      externalId: data.sourceId,
      type: this.provider.type,
      data: data.rawData,
      metadata: {
        source: this.provider.id,
        connectorId: this.connector.id,
        syncedAt: new Date().toISOString(),
      },
    }));
  }
}
