import { supabase } from './supabase';

export interface InternalLog {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  type: string;
  module: string | null;
  message: string;
  metadata: Record<string, any>;
  correlation_id: string | null;
  created_at: string;
}

export interface InternalJob {
  id: string;
  job_type: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'retrying' | 'cancelled';
  payload: Record<string, any>;
  failure_reason: string | null;
  retry_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface InternalAiRun {
  id: string;
  job_type: string;
  provider: string;
  input_source_type: string | null;
  output_status: 'pending' | 'processing' | 'completed' | 'failed';
  duration_ms: number | null;
  error: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface InternalIntegrationEvent {
  id: string;
  provider: string;
  status: 'healthy' | 'degraded' | 'failing' | 'disconnected' | 'unknown';
  last_sync_at: string | null;
  failure_summary: string | null;
  environment_source: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface InternalNote {
  id: string;
  created_by: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface InternalAuditEvent {
  id: string;
  actor_user_id: string;
  event_type: string;
  module: string;
  target_type: string | null;
  target_id: string | null;
  metadata_summary: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export const commandCenterApi = {
  // --- AUDIT TRAIL ---
  async logAuditEvent(event: Omit<InternalAuditEvent, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase.from('internal_audit_events').insert([event]);
    if (error) console.error('Failed to log internal audit event:', error);
  },

  async listAuditEvents(limit = 100): Promise<InternalAuditEvent[]> {
    const { data, error } = await supabase.from('internal_audit_events').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  },

  // --- LOGS VIEWER ---
  async listLogs(limit = 100, filters?: { severity?: string, type?: string }): Promise<InternalLog[]> {
    let query = supabase.from('internal_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (filters?.severity) query = query.eq('severity', filters.severity);
    if (filters?.type) query = query.eq('type', filters.type);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // --- JOBS MONITOR ---
  async listJobs(limit = 50): Promise<InternalJob[]> {
    const { data, error } = await supabase.from('internal_jobs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  },

  // --- AI PIPELINE ---
  async listAiRuns(limit = 50): Promise<InternalAiRun[]> {
    const { data, error } = await supabase.from('internal_ai_runs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  },

  // --- INTEGRATION HEALTH ---
  async listIntegrationEvents(): Promise<InternalIntegrationEvent[]> {
    const { data, error } = await supabase.from('internal_integration_events').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // --- INTERNAL NOTES ---
  async listNotes(archived = false): Promise<InternalNote[]> {
    const { data, error } = await supabase.from('internal_notes').select('*').eq('is_archived', archived).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createNote(note: Partial<InternalNote>): Promise<InternalNote> {
    const { data, error } = await supabase.from('internal_notes').insert([note]).select().single();
    if (error) throw error;
    return data;
  },

  async updateNote(id: string, updates: Partial<InternalNote>): Promise<InternalNote> {
    const { data, error } = await supabase.from('internal_notes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase.from('internal_notes').delete().eq('id', id);
    if (error) throw error;
  },

  // --- SAFE CONFIG INSPECTOR ---
  // Returns safe boolean representations of critical config maps to ensure no raw passwords leak via UI memory
  getSafeConfig() {
    return {
      HAS_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
      HAS_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      HAS_STRIPE_KEY: !!import.meta.env.VITE_STRIPE_PUBLIC_KEY,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      SSR: import.meta.env.SSR,
      // Provide partial safe strings
      SUPABASE_URL_PREFIX: import.meta.env.VITE_SUPABASE_URL?.substring(0, 15) + '...',
    };
  }
};
