import { supabase } from './supabase';
import { SupportTicket } from './supportTickets';

/**
 * supportAi.ts
 * 
 * Orchestrates LLM pipeline execution for Support Issues.
 * Capable of extracting severity, categories, and concise summaries 
 * from long-form Tenant issue descriptions.
 */

export interface AITriageResult {
  ai_summary: string;
  ai_category: string;
  ai_severity: 'low' | 'medium' | 'high' | 'critical';
  ai_urgency: 'low' | 'medium' | 'high' | 'critical';
  ai_confidence: number;
  ai_product_area: string;
  ai_recommended_action: string;
  ai_status: 'completed' | 'failed';
}

export const supportAiApi = {
  /**
   * Invokes an LLM orchestration (stubbed for demonstration) 
   * over a specific Support Ticket to map unstructured Tenant text
   * into highly structured Super Admin Metadata.
   */
  async triggerTriage(ticket: SupportTicket): Promise<AITriageResult> {
    try {
      // Mark as processing
      await supabase
        .from('bb_support_tickets')
        .update({ ai_status: 'processing' })
        .eq('id', ticket.id);

      // TODO: Replace with fetch to OpenAI / Edge Function endpoint
      // Mocking AI response latency and deduction logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      const isUrgent = ticket.title.toLowerCase().includes('broken') || 
                       ticket.title.toLowerCase().includes('crash') ||
                       ticket.category === 'billing_issue';

      const mockResult: AITriageResult = {
        ai_summary: `Tenant reported an issue regarding ${ticket.title} within the ${ticket.category} scope.`,
        ai_category: ticket.category || 'general_support',
        ai_severity: isUrgent ? 'high' : 'medium',
        ai_urgency: isUrgent ? 'critical' : 'medium',
        ai_confidence: 0.92,
        ai_product_area: ticket.category === 'billing' ? 'Payments' : 'Dashboard Core',
        ai_recommended_action: isUrgent ? 'Immediate Engineering review required' : 'Review recorded evidence to isolate reproduction steps',
        ai_status: 'completed'
      };

      // Push final result to Supabase
      const { error } = await supabase
        .from('bb_support_tickets')
        .update({
          ...mockResult,
          ai_processed_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) throw error;
      
      return mockResult;

    } catch (err: any) {
      console.error('AI Triage Pipeline Error:', err);
      await supabase
        .from('bb_support_tickets')
        .update({ ai_status: 'failed', ai_error: err.message })
        .eq('id', ticket.id);
      throw err;
    }
  }
};
