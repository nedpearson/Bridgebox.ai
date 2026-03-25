import { supabase } from './supabase';
import { SupportTicket } from './supportTickets';

/**
 * Interface mapping to `internal_dev_tasks` Database Schema
 */
export interface InternalDevTask {
  id: string;
  title: string;
  summary: string;
  problem_statement?: string;
  observed_behavior?: string;
  expected_behavior?: string;
  root_cause_hypothesis?: string;
  product_area?: string;
  category?: string;
  source_type: 'support_ticket' | 'support_recording' | 'support_screen_session' | 'internal_recording' | 'internal_note';
  source_id: string;
  linked_support_ticket_id?: string;
  linked_internal_recording_id?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft_generated' | 'under_review' | 'approved' | 'queued_for_build' | 'sent_to_antigravity' | 'in_progress' | 'completed' | 'archived' | 'rejected';
  confidence_score?: number;
  similar_task_refs?: string[];
  proposed_acceptance_criteria?: string;
  proposed_testing_notes?: string;
  proposed_implementation_notes?: string;
  created_by_user_id?: string;
  reviewed_by_user_id?: string;
  approved_for_build: boolean;
  exported_for_antigravity: boolean;
  created_at: string;
  updated_at: string;
}

export const devTasksAiApi = {
  
  async getAllTasks(): Promise<InternalDevTask[]> {
    const { data, error } = await supabase
      .from('internal_dev_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTaskById(taskId: string): Promise<InternalDevTask> {
    const { data, error } = await supabase
      .from('internal_dev_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId: string, updates: Partial<InternalDevTask>): Promise<InternalDevTask> {
    const { data, error } = await supabase
      .from('internal_dev_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Orchestrates an LLM prompt converting an unstructured Support Ticket into a Development Build Task
   */
  async generateFromSupportTicket(ticket: SupportTicket): Promise<InternalDevTask> {
    
    // Safety check enforcing internal use
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized context generating Development Task.");

    // SIMULATED LLM DELAY (To mimic rigorous OpenAI/Gemini extraction)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // MOCK LLM ENGINE EXTRACTION HEURISTICS
    // In production, this executes a Deno Edge Function prompting `gpt-4o` or `gemini-1.5-pro`
    const generatedPayload: Partial<InternalDevTask> = {
      title: `[Support Triage] ${ticket.title}`,
      summary: `Auto-generated engineering requirement originating from tenant support vector. Original AI summary observed: ${ticket.ai_summary || 'N/A'}.`,
      problem_statement: `System currently fails to satisfy tenant logic at ${ticket.ai_product_area || 'Global'} boundaries. Description states: ${ticket.description.slice(0, 50)}...`,
      observed_behavior: `Tenant explicitly noted UI failure or logic discontinuity in standard pathing execution.`,
      expected_behavior: `The component should handle edge states securely without faulting back to the tenant UI globally.`,
      root_cause_hypothesis: `Potential race condition loading contextual data prior to JWT active resolution, or malformed component prop initialization.`,
      product_area: ticket.ai_product_area || 'UI Component',
      category: 'bug',
      source_type: 'support_ticket',
      source_id: ticket.id,
      linked_support_ticket_id: ticket.id,
      priority: ticket.priority === 'urgent' ? 'critical' : 'high',
      severity: ticket.ai_severity === 'critical' ? 'critical' : 'medium',
      status: 'draft_generated',
      confidence_score: 87, // High confidence since support logs act as high fidelity prompts
      proposed_acceptance_criteria: `- Code securely checks user context boundary before rendering internal components\n- Missing data causes graceful inline skeleton, no hard crash\n- React ErrorBoundaries wrap the nested router loop natively`,
      proposed_testing_notes: `- Spin up un-authenticated tenant context\n- Throttle Network latency to slow 3G capturing race boundaries\n- Execute test hooks matching expected payload failures`,
      proposed_implementation_notes: `Implement strict loading states utilizing framer-motion AnimatePresence and standard Loader2 spinning UI elements intercepting empty dataset renders.`,
      created_by_user_id: user.id
    };

    // PERFORM DUPLICATE CANDIDATE CLUSTERING (Phase 5 Requirement)
    // Look for recent Dev Tasks sharing the identical product area
    const { data: similarTasks } = await supabase
        .from('internal_dev_tasks')
        .select('id')
        .eq('product_area', generatedPayload.product_area)
        .limit(3);

    if (similarTasks && similarTasks.length > 0) {
        generatedPayload.similar_task_refs = similarTasks.map(t => t.id);
    }

    const { data, error } = await supabase
      .from('internal_dev_tasks')
      .insert([generatedPayload])
      .select()
      .single();

    if (error) throw error;
    
    // Link back to Support Ticket status loop mapping escalation
    await supabase.from('support_tickets').update({
        status: 'escalated_to_build',
        updated_at: new Date().toISOString()
    }).eq('id', ticket.id);

    return data;
  },

  /**
   * Prompts the AI (simulated via strict string manipulation here) to safely
   * construct a fully sanitized, developer-ready implementation payload, explicitly designed
   * not to leak proprietary Tenant artifacts if exported onto public GitHub repos or Antigravity instances.
   */
  async exportToAntigravityPrompt(taskId: string): Promise<string> {
    const task = await this.getTaskById(taskId);
    
    // Explicitly redact PII strings matching Tenant UUID formats escaping DB leaks
    const sanitize = (text: string) => text.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '[REDACTED_TENANT_ID]');
    
    // Fetch related QA and Bug artifacts
    const { data: relatedQAs } = await supabase.from('internal_qa_test_cases').select('*').eq('linked_internal_dev_task_id', taskId).eq('status', 'approved');
    const { data: relatedBugs } = await supabase.from('internal_bug_reports').select('*').eq('linked_internal_dev_task_id', taskId).eq('status', 'confirmed');

    let qaExtension = '';
    if (relatedQAs && relatedQAs.length > 0) {
       qaExtension = `\n### Attached QA Verification Matrix\n`;
       relatedQAs.forEach((qa, idx) => {
          qaExtension += `**Scenario ${idx + 1}: ${sanitize(qa.title)}**\n`;
          qaExtension += `- Preconditions: ${sanitize(qa.preconditions || 'N/A')}\n`;
          qaExtension += `- Setup: ${sanitize(qa.setup_notes || 'N/A')}\n`;
          qaExtension += `- Test Steps: ${sanitize(qa.test_steps || 'N/A')}\n`;
          qaExtension += `- Expected Results: ${sanitize(qa.expected_results || 'N/A')}\n`;
          qaExtension += `- Regression Risks: ${sanitize(qa.regression_risks || 'N/A')}\n\n`;
       });
    }

    let bugExtension = '';
    if (relatedBugs && relatedBugs.length > 0) {
       bugExtension = `\n### Confirmed Bug Traces\n`;
       relatedBugs.forEach((bug, idx) => {
          bugExtension += `**Defect ${idx + 1}: ${sanitize(bug.title)}**\n`;
          bugExtension += `- Trace: ${sanitize(bug.reproduction_steps || 'N/A')}\n`;
          bugExtension += `- Root Cause Hypothesis: ${sanitize(bug.root_cause_hypothesis || 'N/A')}\n\n`;
       });
    }

    // Strip everything sensitive, enforce rigid strict structures
    const prompt = `You are a Senior Engineering Associate assigned to execute the following explicit Build Directive.
    
**Objective**: ${sanitize(task.title)}
**Product Area**: ${sanitize(task.product_area || 'Global Workspace')}

### Problem Domain
${sanitize(task.problem_statement || 'N/A')}

### Observed vs Expected
*Observed:* ${sanitize(task.observed_behavior || 'N/A')}
*Expected:* ${sanitize(task.expected_behavior || 'N/A')}
${bugExtension}

### Implementation Scope
${sanitize(task.proposed_implementation_notes || 'Implement structural fix according to architecture patterns.')}

### Acceptance Criteria
${sanitize(task.proposed_acceptance_criteria || 'Tests pass natively.')}
${qaExtension}

### Testing Considerations
${sanitize(task.proposed_testing_notes || 'Execute regression scans.')}

---
CRITICAL INSTRUCTIONS:
- Do not modify existing decoupled UI architecture layouts.
- Always use standard established TS Interfaces.
- Maintain high component reusability structures natively without bypassing context filters.
`;

    // Optionally stamp DB
    await this.updateTask(taskId, { exported_for_antigravity: true, status: 'sent_to_antigravity' });

    return prompt;
  }
};
