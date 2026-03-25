import { supabase } from './supabase';

export interface SupportTicket {
  id: string;
  organization_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: 'open' | 'in_review' | 'waiting_on_client' | 'in_progress' | 'resolved' | 'closed' | 'new' | 'triage_pending' | 'ai_processed' | 'escalated_to_build' | 'monitoring';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  recording_path?: string;
  recording_size?: number;
  session_code?: string;
  session_expires_at?: string;
  
  // AI Metadata fields
  ai_summary?: string;
  ai_category?: string;
  ai_severity?: string;
  ai_urgency?: string;
  ai_confidence?: number;
  ai_product_area?: string;
  ai_recommended_action?: string;
  ai_possible_duplicate_refs?: any[];
  ai_status?: 'pending' | 'processing' | 'completed' | 'failed';
  ai_processed_at?: string;
  ai_error?: string;

  // Escalation flags
  escalation_type?: string;
  feature_gap_flag?: boolean;
  recurring_issue_flag?: boolean;
  onboarding_gap_flag?: boolean;
  build_candidate_flag?: boolean;
  proposed_solution?: string;
  internal_priority?: string;
  linked_internal_recording_id?: string;
  linked_internal_note_id?: string;

  created_by_id: string;
  assigned_to_id?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export type CreateSupportTicketParams = Pick<
  SupportTicket, 
  'organization_id' | 'title' | 'description' | 'category' | 'priority' | 'recording_path' | 'recording_size'
> & { project_id?: string };

export const supportTicketsApi = {
  /**
   * Generates a secure, 6-character ephemeral session code for WebRTC
   */
  generateSessionCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  /**
   * Submit a new support ticket (Tenant Context)
   */
  async createTicket(params: CreateSupportTicketParams): Promise<SupportTicket> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{
        ...params,
        created_by_id: user.user.id,
        status: 'open'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all tickets mapped to the logged-in user's organization context
   */
  async getMyTickets(organizationId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Automatically revoke expired sessions from active view
    const now = new Date();
    return (data || []).map(ticket => {
      if (ticket.session_expires_at && new Date(ticket.session_expires_at) < now) {
        return { ...ticket, session_code: undefined, session_expires_at: undefined };
      }
      return ticket;
    });
  },

  /**
   * Super Admin Intake: Fetch all active global tickets
   */
  async getAllTickets(): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, profiles!support_tickets_created_by_id_fkey(full_name, email), organizations(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Automatically revoke expired sessions from active view
    const now = new Date();
    return (data || []).map(ticket => {
      if (ticket.session_expires_at && new Date(ticket.session_expires_at) < now) {
        return { ...ticket, session_code: undefined, session_expires_at: undefined };
      }
      return ticket;
    });
  },

  /**
   * Start a Live Session: Generates a code and updates the ticket
   */
  async requestLiveSession(ticketId: string): Promise<{ session_code: string; expires_at: string }> {
    const code = this.generateSessionCode();
    // Expire explicitly inside 15 minutes bounds to brutally enforce short durations
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

    const { error } = await supabase
      .from('support_tickets')
      .update({
        session_code: code,
        session_expires_at: expiresAt
      })
      .eq('id', ticketId);

    if (error) throw error;
    return { session_code: code, expires_at: expiresAt };
  },

  /**
   * Revoke an active live session connection string
   */
  async revokeSession(ticketId: string): Promise<void> {
    const { error } = await supabase
      .from('support_tickets')
      .update({
        session_code: null,
        session_expires_at: null
      })
      .eq('id', ticketId);

    if (error) throw error;
  },

  /**
   * Get transient Signed URL to view Support Evidence uploads
   */
  async getRecordingUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('support_recordings')
      .createSignedUrl(path, 3600);
      
    if (error) throw error;
    return data.signedUrl;
  }
};
