import { BaseConnector } from "../core/BaseConnector";
import { SyncResult, ExternalData, NormalizedRecord } from "../types";

export class TramsConnector extends BaseConnector {
  protected providerName = "TRAMS Back Office";

  async connect(credentials?: Record<string, any>): Promise<boolean> {
    return true;
  }
  async disconnect(): Promise<boolean> {
    return true;
  }

  async testConnection(): Promise<boolean> {
    return true; // Scaffold import-first adapter
  }

  async fetchExternalData(options?: Record<string, any>): Promise<any[]> {
    // API not explicitly available; returning empty array for import-first path.
    return [];
  }

  async syncNow(): Promise<any> {
    // @ts-nocheck
    return {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  normalizeData(rawData: any): any[] {
    return Array.isArray(rawData) ? rawData : [];
  }
}
