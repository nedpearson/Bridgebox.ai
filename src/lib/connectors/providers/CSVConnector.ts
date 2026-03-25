// @ts-nocheck
import { BaseConnector } from '../core/BaseConnector';
import type { ConnectorConfig, SyncResult, ConnectorCapability } from '../types';

interface CSVConfig {
  delimiter: string;
  hasHeader: boolean;
  encoding: string;
}

interface CSVMapping {
  idColumn: string | number;
  dataType: 'event' | 'metric' | 'entity';
  columnMappings: Record<string, string | number>;
  timestampColumn?: string | number;
  timestampFormat?: string;
}

export class CSVConnector extends BaseConnector {
  private config: CSVConfig;
  private mapping: CSVMapping;

  constructor(config: ConnectorConfig) {
    super(config);

    const credentials = this.parseCredentials<CSVConfig>(config.credentials);
    this.config = {
      delimiter: credentials.delimiter || ',',
      hasHeader: credentials.hasHeader !== false,
      encoding: credentials.encoding || 'utf-8'
    };

    const mappingConfig = config.mapping_config as CSVMapping;
    this.mapping = {
      idColumn: mappingConfig?.idColumn || 0,
      dataType: mappingConfig?.dataType || 'entity',
      columnMappings: mappingConfig?.columnMappings || {},
      timestampColumn: mappingConfig?.timestampColumn,
      timestampFormat: mappingConfig?.timestampFormat
    };
  }

  async connect(): Promise<boolean> {
    return true;
  }

  async sync(): Promise<SyncResult> {
    const results: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: ['CSV connector requires manual import via importCSV method']
    };

    return results;
  }

  async disconnect(): Promise<boolean> {
    return true;
  }

  async test(): Promise<boolean> {
    return true;
  }

  getCapabilities(): ConnectorCapability[] {
    return ['read'];
  }

  async importCSV(file: File): Promise<SyncResult> {
    const startTime = Date.now();
    const results: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: []
    };

    try {
      const content = await this.readFile(file);
      const rows = await this.parseCSV(content);

      if (rows.length === 0) {
        results.errors.push('No data found in CSV file');
        results.success = false;
        return results;
      }

      let headers: string[] = [];
      let dataRows = rows;

      if (this.config.hasHeader) {
        headers = rows[0];
        dataRows = rows.slice(1);
      } else {
        headers = Array.from({ length: rows[0].length }, (_, i) => `column_${i}`);
      }

      for (const row of dataRows) {
        try {
          const rowData = await this.processRow(row, headers);
          results.recordsProcessed++;
          results.recordsCreated++;
        } catch (error) {
          results.recordsFailed++;
          results.errors.push(`Failed to process row: ${error}`);
        }
      }

      results.duration = Date.now() - startTime;
      return results;
    } catch (error) {
      results.success = false;
      results.errors.push(error instanceof Error ? error.message : 'Unknown error');
      results.duration = Date.now() - startTime;
      return results;
    }
  }

  async importCSVFromText(csvText: string): Promise<SyncResult> {
    const startTime = Date.now();
    const results: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: []
    };

    try {
      const rows = await this.parseCSV(csvText);

      if (rows.length === 0) {
        results.errors.push('No data found in CSV');
        results.success = false;
        return results;
      }

      let headers: string[] = [];
      let dataRows = rows;

      if (this.config.hasHeader) {
        headers = rows[0];
        dataRows = rows.slice(1);
      } else {
        headers = Array.from({ length: rows[0].length }, (_, i) => `column_${i}`);
      }

      for (const row of dataRows) {
        try {
          await this.processRow(row, headers);
          results.recordsProcessed++;
          results.recordsCreated++;
        } catch (error) {
          results.recordsFailed++;
          results.errors.push(`Failed to process row: ${error}`);
        }
      }

      results.duration = Date.now() - startTime;
      return results;
    } catch (error) {
      results.success = false;
      results.errors.push(error instanceof Error ? error.message : 'Unknown error');
      results.duration = Date.now() - startTime;
      return results;
    }
  }

  private async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          resolve(content);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file, this.config.encoding);
    });
  }

  private async parseCSV(content: string): Promise<string[][]> {
    const rows: string[][] = [];
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      if (!line.trim()) continue;

      const row = this.parseLine(line);
      rows.push(row);
    }

    return rows;
  }

  private parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === this.config.delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private async processRow(row: string[], headers: string[]): Promise<void> {
    const sourceId = this.getColumnValue(row, headers, this.mapping.idColumn);

    if (!sourceId) {
      throw new Error('No ID column found in row');
    }

    const normalizedData: Record<string, any> = {};

    for (const [targetField, sourceColumn] of Object.entries(this.mapping.columnMappings)) {
      const value = this.getColumnValue(row, headers, sourceColumn);
      normalizedData[targetField] = this.coerceValue(value);
    }

    let timestamp = new Date();
    if (this.mapping.timestampColumn !== undefined) {
      const timestampValue = this.getColumnValue(row, headers, this.mapping.timestampColumn);
      if (timestampValue) {
        timestamp = this.parseTimestamp(timestampValue);
      }
    }

    const rawData: Record<string, any> = {};
    headers.forEach((header, index) => {
      rawData[header] = row[index];
    });

    await this.storeData({
      connector_id: this.connectorConfig.id,
      source_system: 'csv_import',
      source_id: String(sourceId),
      data_type: this.mapping.dataType,
      raw_data: rawData,
      normalized_data: normalizedData,
      metadata: {
        filename: 'manual_import',
        row_number: row.length
      },
      synced_at: timestamp
    });
  }

  private getColumnValue(row: string[], headers: string[], column: string | number): string {
    if (typeof column === 'number') {
      return row[column] || '';
    }

    const index = headers.indexOf(column);
    if (index === -1) {
      return '';
    }

    return row[index] || '';
  }

  private coerceValue(value: string): any {
    if (!value || value === '') return null;

    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    const num = Number(value);
    if (!isNaN(num) && value === num.toString()) {
      return num;
    }

    const date = new Date(value);
    if (!isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return date.toISOString();
    }

    return value;
  }

  private parseTimestamp(value: string): Date {
    if (this.mapping.timestampFormat) {
      return new Date(value);
    }

    const timestamp = Date.parse(value);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }

    return new Date();
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async fetchExternalData(options?: Record<string, any>): Promise<any[]> {
    return [];
  }

  async syncNow(): Promise<any> { // @ts-ignore
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
      completedAt: new Date().toISOString()
    };
  }

  normalizeData(rawData: any): any[] {
    return rawData;
  }
}
