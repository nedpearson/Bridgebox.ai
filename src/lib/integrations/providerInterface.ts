import { IntegrationConnection } from './types';
export type { IntegrationConnection };

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  newCursor?: Record<string, any>;
  error?: string;
}

export interface WebhookPayload {
  headers: Record<string, string>;
  body: any;
}

export interface ValidationResult {
  healthy: boolean;
  message?: string;
}

export interface IntegrationProvider {
  /**
   * Unique identifier for the provider (e.g., 'clio', 'financial_cents')
   */
  readonly id: string;

  /**
   * Initiate the connection to the external provider
   */
  connect(organizationId: string, authData: any): Promise<IntegrationConnection>;

  /**
   * Disconnect and clear credentials
   */
  disconnect(connectionId: string): Promise<boolean>;

  /**
   * Refresh OAuth access tokens if applicable
   */
  refreshToken(connectionId: string): Promise<string | null>;

  /**
   * Perform the initial historical sync of data
   */
  initialSync(connectionId: string): Promise<SyncResult>;

  /**
   * Perform an incremental sync using cursors
   */
  deltaSync(connectionId: string, cursor: Record<string, any>): Promise<SyncResult>;

  /**
   * Process an incoming webhook payload
   */
  ingestWebhook(organizationId: string, payload: WebhookPayload): Promise<boolean>;

  /**
   * Normalize an external generic payload into a Bridgebox external entity
   */
  normalize(externalType: string, rawPayload: any): any;

  /**
   * Checks the health/connectivity of a specific connection
   */
  healthCheck(connectionId: string): Promise<ValidationResult>;
}
