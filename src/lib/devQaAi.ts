import { supabase } from './supabase';

export interface InternalBugReport {
  id: string;
  title: string;
  summary: string;
  issue_type: 'backend_fault' | 'ui_fault' | 'logic_error' | 'database_constraint' | 'auth_boundary' | 'performance_degradation';
  product_area?: string;
  workflow_area?: string;
  observed_behavior?: string;
  expected_behavior?: string;
  root_cause_hypothesis?: string;
  reproduction_steps?: string;
  environment_notes?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  business_impact?: string;
  confidence_score?: number;
  status: 'draft_generated' | 'under_review' | 'approved' | 'confirmed' | 'needs_more_evidence' | 'duplicate' | 'archived' | 'rejected';
  source_type: string;
  source_id: string;
  linked_support_ticket_id?: string;
  linked_internal_dev_task_id?: string;
  similar_bug_refs?: string[];
  created_by_user_id?: string;
  reviewed_by_user_id?: string;
  approved_for_build: boolean;
  created_at: string;
  updated_at: string;
}

export interface InternalQaTestCase {
  id: string;
  title: string;
  objective: string;
  product_area?: string;
  workflow_area?: string;
  preconditions?: string;
  setup_notes?: string;
  test_steps?: string;
  expected_results?: string;
  regression_risks?: string;
  edge_cases?: string;
  negative_tests?: string;
  post_fix_validation?: string;
  confidence_score?: number;
  status: 'draft_generated' | 'under_review' | 'approved' | 'archived' | 'rejected';
  source_type: string;
  source_id: string;
  linked_support_ticket_id?: string;
  linked_internal_dev_task_id?: string;
  linked_internal_bug_report_id?: string;
  similar_qa_refs?: string[];
  created_by_user_id?: string;
  reviewed_by_user_id?: string;
  approved_for_build: boolean;
  created_at: string;
  updated_at: string;
}

export const devQaAiApi = {

  // ==========================================================
  // READ TRANSACTIONS
  // ==========================================================
  
  async getAllBugReports(): Promise<InternalBugReport[]> {
    const { data, error } = await supabase.from('bb_internal_bug_reports').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAllQaTestCases(): Promise<InternalQaTestCase[]> {
    const { data, error } = await supabase.from('bb_internal_qa_test_cases').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getBugReport(id: string): Promise<InternalBugReport> {
    const { data, error } = await supabase.from('bb_internal_bug_reports').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async getQaTestCase(id: string): Promise<InternalQaTestCase> {
    const { data, error } = await supabase.from('bb_internal_qa_test_cases').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // ==========================================================
  // WRITE & UPDATE VECTORS
  // ==========================================================
  
  async updateBugReport(id: string, updates: Partial<InternalBugReport>): Promise<InternalBugReport> {
    const { data, error } = await supabase.from('bb_internal_bug_reports').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async updateQaTestCase(id: string, updates: Partial<InternalQaTestCase>): Promise<InternalQaTestCase> {
    const { data, error } = await supabase.from('bb_internal_qa_test_cases').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // ==========================================================
  // AI GENERATION ORCHESTRATORS
  // ==========================================================
  
  /**
   * Transforms raw Support Ticket anomalies into a strictly formatted Bug Report capturing expected structural reproduction boundaries.
   */
  async generateBugReportFromSource(source: any, sourceType: 'support_ticket' | 'internal_dev_task'): Promise<InternalBugReport> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized AI Dev Generation.");

    // Explicitly redact PII strings matching Tenant UUID formats escaping DB leaks
    const sanitize = (text: string) => text ? text.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '[REDACTED_TENANT_ID]') : 'N/A';

    // SIMULATED LLM DELAY
    await new Promise(resolve => setTimeout(resolve, 1800));

    const payload: Partial<InternalBugReport> = {
      title: `[Bug Draft] ${sanitize(source.title || 'Unknown Source Escalation')}`,
      summary: `Automated anomaly extraction tracking behavioral deviation against nominal architectural constraints. Origin: ${sanitize(source.description || source.summary || '')}`,
      issue_type: 'logic_error',
      product_area: source.product_area || source.ai_product_area || 'Core Operations',
      workflow_area: 'End User Interactions',
      observed_behavior: `System deviated into a fallback or crash loop given specific tenant actions.`,
      expected_behavior: `The environment should parse identical arrays natively without tripping ErrorBoundary thresholds.`,
      root_cause_hypothesis: `Potentially asynchronous state mutations executing before payload JWT resolution.`,
      reproduction_steps: `1. Authenticate as standard non-admin Token\n2. Navigate directly to ${source.ai_product_area || 'module'}\n3. Execute primary sequence rapidly tracking browser XHR`,
      environment_notes: `Detected on standard Chromium/WebKit engines across production subdomains.`,
      severity: source.severity || source.ai_severity === 'critical' ? 'critical' : 'high',
      priority: source.priority || source.ai_priority === 'critical' ? 'critical' : 'high',
      business_impact: `Elevated friction causing Support Ticket volume inflation tracking local workflow degradation.`,
      confidence_score: 92,
      status: 'draft_generated',
      source_type: sourceType,
      source_id: source.id,
      linked_support_ticket_id: sourceType === 'support_ticket' ? source.id : (source.linked_support_ticket_id || undefined),
      linked_internal_dev_task_id: sourceType === 'internal_dev_task' ? source.id : undefined,
      created_by_user_id: user.id
    };

    // PHASE 5: Deduplication Clustering
    const { data: similarBugs } = await supabase
        .from('bb_internal_bug_reports')
        .select('id')
        .eq('product_area', payload.product_area)
        .limit(3);

    if (similarBugs && similarBugs.length > 0) {
        payload.similar_bug_refs = similarBugs.map(t => t.id);
    }

    const { data, error } = await supabase.from('bb_internal_bug_reports').insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  /**
   * Derives a full engineering QA Test scenario mapping validation requirements recursively over Dev tasks bridging future regression gaps.
   */
  async generateQaTestCaseFromSource(source: any, sourceType: 'support_ticket' | 'internal_dev_task' | 'internal_bug_report'): Promise<InternalQaTestCase> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized AI QA Test Generation.");
    
    // Explicitly redact PII strings matching Tenant UUID formats escaping DB leaks
    const sanitize = (text: string) => text ? text.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '[REDACTED_TENANT_ID]') : 'N/A';

    await new Promise(resolve => setTimeout(resolve, 2000));

    const payload: Partial<InternalQaTestCase> = {
      title: `[QA Pack] Validate ${sanitize(source.title || source.product_area || 'Anomaly')} Isolation`,
      objective: `Secure active application rendering contexts mitigating ${sanitize(source.product_area || 'Global Workspace')} failures natively parsing missing payloads.`,
      product_area: source.product_area || source.ai_product_area || 'Core Layouts',
      workflow_area: 'Tenant Edge Loading',
      preconditions: `- Ensure mock tenant environment is active\n- Confirm no Super Admin scopes exist physically in the context header`,
      setup_notes: `Deploy localized instance configuring specific network speeds mapping slow network resolution boundaries.`,
      test_steps: `1. Initialize the target Component mapping\n2. Intercept API responses returning 404 intentionally\n3. Observe UI fallback skeleton states immediately.`,
      expected_results: `Skeleton renders identically mirroring production schemas without executing white-screen compiler crashes.`,
      regression_risks: `Changes to explicit nested Router blocks risk tearing higher order components. Tests must pass over standard \`<Outlet />\` loops.`,
      edge_cases: `Network timeout parsing simultaneously executing multiple active queries on identical contexts.`,
      negative_tests: `Inputting intentionally malformed query boundaries mapping 400 responses dynamically.`,
      post_fix_validation: `- Code merged natively -> Staging deployed -> Unit tests explicitly parsing fallback UI strings succeed.`,
      confidence_score: 88,
      status: 'draft_generated',
      source_type: sourceType,
      source_id: source.id,
      linked_support_ticket_id: sourceType === 'support_ticket' ? source.id : (source.linked_support_ticket_id || undefined),
      linked_internal_dev_task_id: sourceType === 'internal_dev_task' ? source.id : (source.linked_internal_dev_task_id || undefined),
      linked_internal_bug_report_id: sourceType === 'internal_bug_report' ? source.id : undefined,
      created_by_user_id: user.id
    };

    // PHASE 5: Deduplication Clustering
    const { data: similarQA } = await supabase
        .from('bb_internal_qa_test_cases')
        .select('id')
        .eq('product_area', payload.product_area)
        .limit(3);

    if (similarQA && similarQA.length > 0) {
        payload.similar_qa_refs = similarQA.map(t => t.id);
    }

    const { data, error } = await supabase.from('bb_internal_qa_test_cases').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }
};
