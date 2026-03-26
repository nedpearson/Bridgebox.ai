import { supabase } from '../supabase';
import type {
  Connector,
  ConnectorProvider,
  ConnectorStats,
  ConnectorEvent,
  SyncResult,
} from '../connectors/types';

export const connectorsService = {
  async getProviders(): Promise<ConnectorProvider[]> {
    const { data, error } = await supabase
      .from('bb_connector_providers')
      .select('*')
      .order('is_popular', { ascending: false })
      .order('display_name');

    if (error) throw error;

    return data.map(this.mapProviderFromDB);
  },

  async getProviderById(id: string): Promise<ConnectorProvider | null> {
    const { data, error } = await supabase
      .from('bb_connector_providers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapProviderFromDB(data) : null;
  },

  async getProvidersByCategory(category: string): Promise<ConnectorProvider[]> {
    const { data, error } = await supabase
      .from('bb_connector_providers')
      .select('*')
      .eq('category', category)
      .order('is_popular', { ascending: false });

    if (error) throw error;
    return data.map(this.mapProviderFromDB);
  },

  async getConnectorsByOrganization(organizationId: string): Promise<Connector[]> {
    const { data, error } = await supabase
      .from('bb_connectors')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapConnectorFromDB);
  },

  async getConnectorById(id: string): Promise<Connector | null> {
    const { data, error } = await supabase
      .from('bb_connectors')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapConnectorFromDB(data) : null;
  },

  async createConnector(connector: Partial<Connector>): Promise<Connector> {
    const { data, error } = await supabase
      .from('bb_connectors')
      .insert([
        {
          organization_id: connector.organizationId,
          provider_id: connector.providerId,
          provider_name: connector.providerName,
          connector_type: connector.type,
          category: connector.category,
          status: connector.status || 'not_connected',
          auth_type: connector.auth.type,
          is_authenticated: connector.auth.isAuthenticated,
          auth_scopes: connector.auth.scopes,
          config: connector.config || {},
          metadata: connector.metadata || {},
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return this.mapConnectorFromDB(data);
  },

  async updateConnector(
    id: string,
    updates: Partial<Connector>
  ): Promise<Connector> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) updateData.status = updates.status;
    if (updates.config) updateData.config = updates.config;
    if (updates.metadata) updateData.metadata = updates.metadata;
    if (updates.lastSyncAt) updateData.last_sync_at = updates.lastSyncAt;
    if (updates.lastSyncStatus) updateData.last_sync_status = updates.lastSyncStatus;
    if (updates.lastSyncError) updateData.last_sync_error = updates.lastSyncError;
    if (updates.nextSyncAt) updateData.next_sync_at = updates.nextSyncAt;
    if (updates.syncCount !== undefined) updateData.sync_count = updates.syncCount;
    if (updates.recordCount !== undefined) updateData.record_count = updates.recordCount;

    if (updates.auth) {
      updateData.is_authenticated = updates.auth.isAuthenticated;
      if (updates.auth.expiresAt) updateData.auth_expires_at = updates.auth.expiresAt;
      if (updates.auth.scopes) updateData.auth_scopes = updates.auth.scopes;
    }

    const { data, error } = await supabase
      .from('bb_connectors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapConnectorFromDB(data);
  },

  async deleteConnector(id: string): Promise<void> {
    const { error } = await supabase.from('bb_connectors').delete().eq('id', id);
    if (error) throw error;
  },

  async logSyncResult(
    connectorId: string,
    organizationId: string,
    result: SyncResult
  ): Promise<void> {
    const { error } = await supabase.from('bb_connector_sync_logs').insert([
      {
        connector_id: connectorId,
        organization_id: organizationId,
        status: result.success ? 'success' : 'error',
        started_at: result.startedAt,
        completed_at: result.completedAt,
        duration_ms: result.duration,
        records_processed: result.recordsProcessed,
        records_created: result.recordsCreated,
        records_updated: result.recordsUpdated,
        records_skipped: result.recordsSkipped,
        records_failed: result.recordsFailed,
        error_message: result.errors?.[0]?.error,
        error_details: result.errors && result.errors.length > 0 ? result.errors : null,
      },
    ]);

    if (error) throw error;
  },

  async logEvent(
    connectorId: string,
    organizationId: string,
    event: Partial<ConnectorEvent>
  ): Promise<void> {
    const { error } = await supabase.from('bb_connector_events').insert([
      {
        connector_id: connectorId,
        organization_id: organizationId,
        event_type: event.type,
        message: event.message,
        severity: event.data?.severity || 'info',
        data: event.data,
      },
    ]);

    if (error) throw error;
  },

  async getConnectorStats(organizationId: string): Promise<ConnectorStats> {
    const { data: connectors, error } = await supabase
      .from('bb_connectors')
      .select('status, sync_count, last_sync_at')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const stats: ConnectorStats = {
      totalConnectors: connectors.length,
      activeConnectors: connectors.filter((c) => c.status === 'connected').length,
      syncingConnectors: connectors.filter((c) => c.status === 'syncing').length,
      errorConnectors: connectors.filter((c) => c.status === 'error').length,
      totalSyncs: connectors.reduce((sum, c) => sum + (c.sync_count || 0), 0),
      successfulSyncs: 0,
      failedSyncs: 0,
      totalRecordsProcessed: 0,
      averageSyncDuration: 0,
    };

    const lastSync = connectors
      .filter((c) => c.last_sync_at)
      .sort((a, b) => new Date(b.last_sync_at!).getTime() - new Date(a.last_sync_at!).getTime())[0];

    if (lastSync) {
      stats.lastSyncAt = lastSync.last_sync_at;
    }

    return stats;
  },

  mapProviderFromDB(data: any): ConnectorProvider {
    return {
      id: data.id,
      name: data.name,
      displayName: data.display_name,
      description: data.description,
      type: data.connector_type,
      category: data.category,
      logo: data.logo_url,
      website: data.website_url,
      documentationUrl: data.documentation_url,
      authType: data.auth_type,
      requiredScopes: data.required_scopes || [],
      features: data.features || [],
      isPopular: data.is_popular,
      isEnterprise: data.is_enterprise,
      status: data.status,
    };
  },

  mapConnectorFromDB(data: any): Connector {
    return {
      id: data.id,
      organizationId: data.organization_id,
      providerId: data.provider_id,
      providerName: data.provider_name,
      type: data.connector_type,
      category: data.category,
      status: data.status,
      auth: {
        type: data.auth_type,
        isAuthenticated: data.is_authenticated,
        expiresAt: data.auth_expires_at,
        scopes: data.auth_scopes || [],
      },
      config: data.config || {},
      metadata: data.metadata || {},
      lastSyncAt: data.last_sync_at,
      lastSyncStatus: data.last_sync_status,
      lastSyncError: data.last_sync_error,
      nextSyncAt: data.next_sync_at,
      syncCount: data.sync_count || 0,
      recordCount: data.record_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
};
