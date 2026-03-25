export type IntegrationConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending';
export type SyncDirection = 'import' | 'export' | 'bidirectional';
export type SyncJobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ExternalObjectType = 
  | 'contact'
  | 'matter'
  | 'event'
  | 'message'
  | 'document'
  | 'expense'
  | 'compliance_record'
  | 'task';

export interface IntegrationProviderMetadata {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  features: string[];
  isPremium?: boolean;
}

export interface IntegrationAccount {
  id: string;
  organization_id: string;
  provider_name: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConnection {
  id: string;
  organization_id: string;
  integration_account_id: string;
  external_account_id?: string;
  auth_state: Record<string, any>;
  status: IntegrationConnectionStatus;
  last_sync_at?: string;
  sync_cursors: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SyncJob {
  id: string;
  organization_id: string;
  connection_id: string;
  sync_direction: SyncDirection;
  status: SyncJobStatus;
  started_at?: string;
  completed_at?: string;
  records_processed: number;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
