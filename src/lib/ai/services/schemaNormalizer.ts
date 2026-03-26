import { supabase } from '../../supabase';
import { globalTasksService } from '../../db/globalTasks';
import { projectsService } from '../../db/projects';
import { AIProviderFactory } from '../providers';

export interface WebhookPayload {
  id: string;
  organization_id: string;
  source: 'zapier' | 'make' | 'custom' | 'api';
  event_type?: string;
  raw_payload: any;
  mapped_entity_type?: 'task' | 'project';
  mapped_entity_payload?: any;
  status: 'pending' | 'approved' | 'rejected' | 'failed' | 'processing';
  error_log?: string;
  created_at: string;
}

export const schemaNormalizer = {
  /**
   * Simulates the intake of a pure, unstructured JSON payload from an external Webhook.
   * In a true production Edge Function, this receives the HTTP POST directly.
   */
  async ingestForeignPayload(organizationId: string, source: 'zapier' | 'make' | 'custom' | 'api', payload: any) {
    if (!organizationId) throw new Error('Organization ID is required to map a webhook payload.');
    if (!payload) throw new Error('Webhook payload cannot be empty.');
    
    const { data, error } = await supabase
      .from('bb_integration_webhooks')
      .insert({
        organization_id: organizationId,
        source: source,
        raw_payload: payload,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    
    // Automatically trigger the AI Normalization process in the background
    this.normalizePayload(data.id, payload).catch(console.error);
    
    return data as WebhookPayload;
  },

  /**
   * The AI Normalizer Agent. Analyzes the schema of the raw JSON and uses deterministic 
   * LLM mapping to convert it into Bridgebox-compatible physical schemas.
   */
  async normalizePayload(webhookId: string, rawPayload: any) {
    if (!webhookId) return;
    await supabase.from('bb_integration_webhooks').update({ status: 'processing' }).eq('id', webhookId);

    try {
      const provider = AIProviderFactory.getProvider();
      if (!provider.isConfigured()) {
        throw new Error('AI provider is not actively configured.');
      }

      const prompt = `
You are the Bridgebox Webhook Normalization Agent.
Convert the unstructured JSON payload below into a standard Bridgebox target payload.

Raw Payload:
${JSON.stringify(rawPayload, null, 2)}

Requirements:
Return ONLY a raw JSON object containing these EXACT keys:
- "target_type": strictly either "task" or "project"
- "mapped_data":
   For "task": { "title": string, "description": "...", "priority": "high", "status": "todo" }
   For "project": { "name": string, "description": "...", "start_date": "YYYY-MM-DD", "status": "draft" }
      `;

      const response = await provider.complete({
        messages: [
          { role: 'system', content: 'You are an autonomous schema translation engine mapping integration hooks. Output exclusively valid JSON object formats.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        maxTokens: 1000,
        ...({ responseFormat: "json_object" } as any)
      });

      if (!response.content) throw new Error("Empty AI extraction response.");

      const parsed = JSON.parse(response.content.trim());
      const mappedType = parsed.target_type || 'task';
      const mappedPayload = parsed.mapped_data || {};

      const { error } = await supabase
        .from('bb_integration_webhooks')
        .update({
          mapped_entity_type: mappedType,
          mapped_entity_payload: mappedPayload,
          status: 'pending' // Remains pending until human approval
        })
        .eq('id', webhookId);

      if (error) throw error;
    } catch (e: any) {
      await supabase
        .from('bb_integration_webhooks')
        .update({ status: 'failed', error_log: e.message })
        .eq('id', webhookId);
    }
  },

  /**
   * Physically converts an approved webhook staging row into a literal DB row
   */
  async physicallyCommitPayload(webhook: WebhookPayload, userId: string): Promise<boolean> {
    if (!webhook.mapped_entity_type || !webhook.mapped_entity_payload) {
      throw new Error("Payload has not been normalized by AI.");
    }

    try {
      if (webhook.mapped_entity_type === 'task') {
        await globalTasksService.createTask({
          ...webhook.mapped_entity_payload,
          tenant_id: webhook.organization_id,
          creator_id: userId
        });
      } else if (webhook.mapped_entity_type === 'project') {
        const payload = {
            ...webhook.mapped_entity_payload,
            organization_id: webhook.organization_id
        }
        const { error } = await supabase.from('bb_projects').insert(payload);
        if (error) throw error;
      }

      // Mark the staging row as approved and deployed
      await supabase.from('bb_integration_webhooks').update({ status: 'approved' }).eq('id', webhook.id);
      return true;
    } catch (e: any) {
      await supabase.from('bb_integration_webhooks').update({ status: 'failed', error_log: e.message }).eq('id', webhook.id);
      return false;
    }
  },

  async getPendingWebhooks(organizationId: string) {
    if (!organizationId) return [];
    const { data, error } = await supabase
      .from('bb_integration_webhooks')
      .select('*')
      .eq('organization_id', organizationId)
      .in('status', ['pending', 'processing', 'failed'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WebhookPayload[];
  }
};
