import { IntegrationProvider, IntegrationConnection, SyncResult, WebhookPayload, ValidationResult } from '../providerInterface';

/**
 * Phase 5: Financial Cents Connector Shell
 * Open API pattern
 * Mappings:
 * - client workflows -> workflow records
 * - tasks -> task system
 * - due dates -> calendar / deadlines
 * - statuses -> operations dashboard
 */
export class FinancialCentsProvider implements IntegrationProvider {
  readonly id = 'financial_cents';

  async connect(organizationId: string, authData: any): Promise<IntegrationConnection> {
    return {
      id: 'fc-conn-' + Date.now(),
      organization_id: organizationId,
      integration_account_id: 'fc-acc',
      auth_state: authData,
      status: 'connected',
      sync_cursors: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async disconnect(_connectionId: string): Promise<boolean> {
    return true;
  }

  async refreshToken(_connectionId: string): Promise<string | null> {
    return null; // typically API keys don't refresh this way
  }

  async initialSync(_connectionId: string): Promise<SyncResult> {
    return { success: true, recordsProcessed: 0, newCursor: {} };
  }

  async deltaSync(_connectionId: string, _cursor: Record<string, any>): Promise<SyncResult> {
    return { success: true, recordsProcessed: 0, newCursor: {} };
  }

  async ingestWebhook(_organizationId: string, _payload: WebhookPayload): Promise<boolean> { return true; }

  normalize(_externalType: string, rawPayload: any): any { return rawPayload; }

  async healthCheck(_connectionId: string): Promise<ValidationResult> {
    return { healthy: true };
  }
}
