import { supabase } from '../supabase';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_review' | 'waiting_on_client' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory =
  | 'bug'
  | 'feature_request'
  | 'dashboard_change'
  | 'mobile_app_request'
  | 'integration_issue'
  | 'billing_issue'
  | 'general_support';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  organization_id: string;
  requester_id?: string;
  assigned_to?: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  attachments: any[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
}

export interface TicketWithDetails extends SupportTicket {
  organization?: { id: string; name: string };
  requester?: { full_name?: string; email: string };
  assigned_user?: { full_name?: string; email: string };
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id?: string;
  content: string;
  is_internal: boolean;
  attachments: any[];
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends TicketComment {
  author?: { full_name?: string; email: string };
}

export interface CreateTicketData {
  title: string;
  description: string;
  organization_id: string;
  priority?: TicketPriority;
  category?: TicketCategory;
  attachments?: any[];
}

export interface CreateCommentData {
  ticket_id: string;
  content: string;
  is_internal?: boolean;
  attachments?: any[];
}

export const supportService = {
  async getAllTickets(filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    organization_id?: string;
    assigned_to?: string;
  }) {
    let query = supabase
      .from('bb_support_tickets')
      .select(`
        *,
        organization:bb_organizations!support_tickets_organization_id_fkey(id, name),
        requester:bb_profiles!created_by_id(full_name, email),
        assigned_user:bb_profiles!assigned_to_id(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as TicketWithDetails[];
  },

  async getOrganizationTickets(organizationId: string) {
    const { data, error } = await supabase
      .from('bb_support_tickets')
      .select(`
        *,
        organization:bb_organizations!support_tickets_organization_id_fkey(id, name),
        requester:bb_profiles!created_by_id(full_name, email),
        assigned_user:bb_profiles!assigned_to_id(full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as TicketWithDetails[];
  },

  async getTicketById(id: string) {
    const { data, error } = await supabase
      .from('bb_support_tickets')
      .select(`
        *,
        organization:bb_organizations!support_tickets_organization_id_fkey(id, name),
        requester:bb_profiles!created_by_id(full_name, email),
        assigned_user:bb_profiles!assigned_to_id(full_name, email)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as TicketWithDetails | null;
  },

  async createTicket(ticketData: CreateTicketData) {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('bb_support_tickets')
      .insert([
        {
          ...ticketData,
          requester_id: user?.user?.id,
          priority: ticketData.priority || 'medium',
          category: ticketData.category || 'general_support',
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as SupportTicket;
  },

  async updateTicket(id: string, updates: Partial<SupportTicket>) {
    const { data, error } = await supabase
      .from('bb_support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as SupportTicket;
  },

  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const { data, error } = await supabase
      .from('bb_support_tickets')
      .update({ status })
      .eq('id', ticketId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as SupportTicket;
  },

  async assignTicket(ticketId: string, userId?: string) {
    const { data, error } = await supabase
      .from('bb_support_tickets')
      .update({ assigned_to: userId })
      .eq('id', ticketId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as SupportTicket;
  },

  async deleteTicket(id: string) {
    const { error } = await supabase
      .from('bb_support_tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTicketComments(ticketId: string) {
    const { data, error } = await supabase
      .from('bb_ticket_comments')
      .select(`
        *,
        author:bb_profiles!ticket_comments_author_id_fkey(full_name, email)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as CommentWithAuthor[];
  },

  async createComment(commentData: CreateCommentData) {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('bb_ticket_comments')
      .insert([
        {
          ...commentData,
          author_id: user?.user?.id,
          is_internal: commentData.is_internal || false,
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as TicketComment;
  },

  async updateComment(id: string, content: string) {
    const { data, error } = await supabase
      .from('bb_ticket_comments')
      .update({ content })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as TicketComment;
  },

  async deleteComment(id: string) {
    const { error } = await supabase
      .from('bb_ticket_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTicketStats(organizationId?: string) {
    let query = supabase
      .from('bb_support_tickets')
      .select('status, priority');

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data.length,
      open: data.filter((t) => t.status === 'open').length,
      in_progress: data.filter((t) => t.status === 'in_progress').length,
      waiting_on_client: data.filter((t) => t.status === 'waiting_on_client').length,
      resolved: data.filter((t) => t.status === 'resolved').length,
      closed: data.filter((t) => t.status === 'closed').length,
      urgent: data.filter((t) => t.priority === 'urgent').length,
      high: data.filter((t) => t.priority === 'high').length,
    };

    return stats;
  },
};
