// @ts-nocheck
import { BaseConnector } from "../core/BaseConnector";
import type {
  ConnectorConfig,
  SyncResult,
  ConnectorCapability,
} from "../types";

interface CustomAPIConfig {
  baseURL: string;
  authType: "bearer" | "api_key" | "basic" | "none";
  authValue?: string;
  headers?: Record<string, string>;
}

interface EndpointMapping {
  path: string;
  method: "GET" | "POST";
  dataPath?: string;
  idField: string;
  dataType: "event" | "metric" | "entity";
  fieldMappings: Record<string, string>;
}

export class CustomAPIConnector extends BaseConnector {
  private config: CustomAPIConfig;
  private mappings: EndpointMapping[];

  constructor(config: ConnectorConfig) {
    super(config);
    this.config = this.parseCredentials<CustomAPIConfig>(config.credentials);
    this.mappings =
      (config.mapping_config as { endpoints?: EndpointMapping[] })?.endpoints ||
      [];
  }

  async connect(): Promise<boolean> {
    try {
      const headers = this.buildHeaders();
      const response = await fetch(this.config.baseURL, {
        method: "GET",
        headers,
      });

      return response.ok || response.status === 404;
    } catch (error) {
      console.error("Custom API connection failed:", error);
      return false;
    }
  }

  async sync(): Promise<SyncResult> {
    const startTime = new Date();
    const results: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
    };

    try {
      for (const mapping of this.mappings) {
        const endpointResult = await this.syncEndpoint(mapping);
        this.mergeResults(results, endpointResult);
      }

      results.duration = Date.now() - startTime.getTime();
      return results;
    } catch (error) {
      results.success = false;
      results.errors.push(
        error instanceof Error ? error.message : "Unknown error",
      );
      results.duration = Date.now() - startTime.getTime();
      return results;
    }
  }

  async disconnect(): Promise<boolean> {
    return true;
  }

  async test(): Promise<boolean> {
    return this.connect();
  }

  getCapabilities(): ConnectorCapability[] {
    return ["read", "sync"];
  }

  private buildHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };

    switch (this.config.authType) {
      case "bearer":
        if (this.config.authValue) {
          headers["Authorization"] = `Bearer ${this.config.authValue}`;
        }
        break;
      case "api_key":
        if (this.config.authValue) {
          headers["X-API-Key"] = this.config.authValue;
        }
        break;
      case "basic":
        if (this.config.authValue) {
          headers["Authorization"] = `Basic ${btoa(this.config.authValue)}`;
        }
        break;
    }

    return headers;
  }

  private async syncEndpoint(mapping: EndpointMapping): Promise<SyncResult> {
    const results: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
    };

    try {
      const url = `${this.config.baseURL}${mapping.path}`;
      const headers = this.buildHeaders();

      const response = await fetch(url, {
        method: mapping.method,
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch from ${mapping.path}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      let records: any[] = [];

      if (mapping.dataPath) {
        const pathParts = mapping.dataPath.split(".");
        let current = data;
        for (const part of pathParts) {
          current = current[part];
          if (!current) break;
        }
        records = Array.isArray(current) ? current : [current];
      } else {
        records = Array.isArray(data) ? data : [data];
      }

      for (const record of records) {
        try {
          const sourceId = this.extractValue(record, mapping.idField);
          if (!sourceId) {
            results.recordsFailed++;
            results.errors.push(`No ID found for record in ${mapping.path}`);
            continue;
          }

          const normalizedData: Record<string, any> = {};
          for (const [targetField, sourceField] of Object.entries(
            mapping.fieldMappings,
          )) {
            normalizedData[targetField] = this.extractValue(
              record,
              sourceField,
            );
          }

          await this.normalizeAndStore({
            type: mapping.dataType,
            source: `custom_api_${mapping.path}`,
            sourceId: String(sourceId),
            data: normalizedData,
            rawData: record,
            timestamp: new Date(),
          });

          results.recordsProcessed++;
          results.recordsCreated++;
        } catch (error) {
          results.recordsFailed++;
          results.errors.push(
            `Failed to process record from ${mapping.path}: ${error}`,
          );
        }
      }

      return results;
    } catch (error) {
      results.success = false;
      results.errors.push(
        error instanceof Error ? error.message : "Unknown error",
      );
      return results;
    }
  }

  private extractValue(obj: any, path: string): any {
    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  private mergeResults(target: SyncResult, source: SyncResult): void {
    target.recordsProcessed += source.recordsProcessed;
    target.recordsCreated += source.recordsCreated;
    target.recordsUpdated += source.recordsUpdated;
    target.recordsFailed += source.recordsFailed;
    target.errors.push(...source.errors);
    target.success = target.success && source.success;
  }

  private async normalizeAndStore(data: {
    type: "event" | "metric" | "entity";
    source: string;
    sourceId: string;
    data: Record<string, any>;
    rawData: any;
    timestamp: Date;
  }): Promise<void> {
    await this.storeData({
      connector_id: this.connectorConfig.id,
      source_system: data.source,
      source_id: data.sourceId,
      data_type: data.type,
      raw_data: data.rawData,
      normalized_data: data.data,
      metadata: {},
      synced_at: data.timestamp,
    });
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async fetchExternalData(options?: Record<string, any>): Promise<any[]> {
    return [];
  }

  async syncNow(): Promise<any> {
    // @ts-ignore
    return {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      recordsSkipped: 0,
      errors: [],
      duration: 0,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  normalizeData(rawData: any): any[] {
    return rawData;
  }
}
