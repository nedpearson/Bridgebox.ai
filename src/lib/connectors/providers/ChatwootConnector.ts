import { BaseConnector } from '../core/BaseConnector';

export class ChatwootConnector extends BaseConnector {
  protected providerName = 'Chatwoot Integration';

  async connect(credentials?: Record<string, any>): Promise<boolean> {
    const accountUrl = credentials?.accountUrl;
    const apiToken = credentials?.apiToken;
    const accountId = credentials?.accountId;

    if (!accountUrl || !apiToken || !accountId) {
      throw new Error('Chatwoot URL, API Token, and Account ID are required.');
    }

    try {
      const response = await fetch(`${accountUrl.replace(/\/$/, '')}/api/v1/accounts/${accountId}/agents`, {
        headers: {
          'api_access_token': apiToken,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  async disconnect(): Promise<boolean> { 
    return true; 
  }

  async testConnection(): Promise<boolean> {
    const config = this.connector?.config as any;
    if (!config?.apiToken || !config?.accountUrl || !config?.accountId) return false;
    return this.connect(config);
  }

  async fetchExternalData(options?: Record<string, any>): Promise<any[]> {
    const config = this.connector?.config as any;
    if (!config?.apiToken || !config?.accountUrl || !config?.accountId) return [];
    
    const accountUrl = config.accountUrl.replace(/\/$/, '');
    const apiToken = config.apiToken;
    const accountId = config.accountId;
    
    // In a real implementation this would fetch all paginated conversations/contacts
    try {
      const response = await fetch(`${accountUrl}/api/v1/accounts/${accountId}/conversations`, {
        headers: { 'api_access_token': apiToken }
      });
      if (response.ok) {
        const json = await response.json();
        return json.payload || [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  async syncNow(): Promise<any> {
    const startedAt = new Date().toISOString();
    try {
      const rawData = await this.fetchExternalData();
      const recordsProcessed = rawData.length;
      return {
        success: true,
        recordsProcessed,
        recordsCreated: recordsProcessed,
        recordsUpdated: 0,
        recordsSkipped: 0,
        recordsFailed: 0,
        errors: [],
        duration: Date.now() - new Date(startedAt).getTime(),
        startedAt,
        completedAt: new Date().toISOString()
      };
    } catch (e: any) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsSkipped: 0,
        recordsFailed: 0,
        errors: [{ error: e.message }],
        duration: Date.now() - new Date(startedAt).getTime(),
        startedAt,
        completedAt: new Date().toISOString()
      };
    }
  }

  normalizeData(rawData: any): any[] {
    return Array.isArray(rawData) ? rawData : [];
  }
}
