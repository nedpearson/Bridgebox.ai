import { supabase } from '../../supabase';

export interface ImportConfig {
  provider: 'trams_back_office' | 'clientbase_us' | 'helga';
  organization_id: string;
  sourceType: string;
  dedupeKeys: string[];
}

export interface StagingRecord {
  external_id: string;
  data: Record<string, any>;
  metadata: Record<string, any>;
}

export class ImportOrchestrator {
  
  async batchValidate(records: StagingRecord[]): Promise<{
    valid: StagingRecord[];
    invalid: { record: StagingRecord, errors: string[] }[];
  }> {
    const valid: StagingRecord[] = [];
    const invalid: { record: StagingRecord, errors: string[] }[] = [];

    // Generic schema validation pass for staging
    for (const record of records) {
      if (!record.external_id) {
        invalid.push({ record, errors: ['Missing external_id'] });
      } else {
        valid.push(record);
      }
    }

    return { valid, invalid };
  }

  async runDedupeAndMerge(
    config: ImportConfig,
    records: StagingRecord[]
  ): Promise<StagingRecord[]> {
    if (records.length === 0) return [];
    
    const externalIds = records.map(r => r.external_id);
    
    // Check external_data_cache for existing matches
    const { data: existingData } = await supabase
      .from('bb_external_data_cache')
      .select('source_id')
      .eq('organization_id', config.organization_id)
      .eq('source_system', config.provider)
      .in('source_id', externalIds);
      
    const existingIds = new Set(existingData?.map(d => d.source_id) || []);
    
    // Merge rules: Overwrite if it exists, insert otherwise (simplified for scaffold)
    return records.map(r => ({
      ...r,
      metadata: {
        ...r.metadata,
        isUpdate: existingIds.has(r.external_id)
      }
    }));
  }

  async logErrorQueue(
    config: ImportConfig,
    invalid: { record: StagingRecord, errors: string[] }[]
  ): Promise<void> {
    if (invalid.length === 0) return;
    
    // Send to integration audit log table (integration_sync_runs)
    await supabase.from('bb_integration_sync_runs').insert({
      organization_id: config.organization_id,
      connector_id: config.provider,
      status: 'error',
      records_processed: 0,
      records_failed: invalid.length,
      errors: invalid.map(inv => ({
        external_id: inv.record.external_id,
        messages: inv.errors
      }))
    });
  }

  /**
   * Main retry-safe pipeline entry point.
   */
  async processImport(
    config: ImportConfig,
    rawRecords: StagingRecord[]
  ): Promise<{ processed: number; failed: number }> {
    const { valid, invalid } = await this.batchValidate(rawRecords);
    await this.logErrorQueue(config, invalid);
    
    const preparedRecords = await this.runDedupeAndMerge(config, valid);

    // Scaffold persistence mapping
    for (const record of preparedRecords) {
      await supabase.from('bb_external_data_cache').upsert({
        organization_id: config.organization_id,
        source_system: config.provider,
        data_type: config.sourceType,
        source_id: record.external_id,
        raw_data: record.data,
        metadata: record.metadata
      }, { onConflict: 'organization_id,source_system,data_type,source_id' });
    }

    return {
      processed: preparedRecords.length,
      failed: invalid.length
    };
  }
}

export const importOrchestrator = new ImportOrchestrator();
