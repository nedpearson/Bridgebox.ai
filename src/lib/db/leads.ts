import { supabase } from '../supabase';
import type { LeadRecord } from '../../types/database';

export interface LeadSubmission {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  project_description?: string;
  budget_range?: string;
  lead_type:
    | 'platform_subscription'
    | 'custom_software'
    | 'dashboard_analytics'
    | 'mobile_app'
    | 'ai_automation'
    | 'enterprise_integration'
    | 'support_retainer'
    | 'consultation';
  form_type: 'demo' | 'custom_build' | 'contact' | 'cta';
  requested_service?: string;
  source?: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateLeadSubmission = (submission: LeadSubmission): string[] => {
  const errors: string[] = [];

  if (!submission.name || submission.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!submission.email || !validateEmail(submission.email)) {
    errors.push('Valid email address is required');
  }

  if (!submission.lead_type) {
    errors.push('Lead type is required');
  }

  if (!submission.form_type) {
    errors.push('Form type is required');
  }

  if (submission.form_type === 'custom_build' && !submission.project_description) {
    errors.push('Project description is required for custom build requests');
  }

  return errors;
};

export const leadsService = {
  async submitLead(submission: LeadSubmission) {
    const errors = validateLeadSubmission(submission);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const leadData = {
      name: submission.name.trim(),
      email: submission.email.trim().toLowerCase(),
      company: submission.company?.trim() || null,
      phone: submission.phone?.trim() || null,
      message: submission.message?.trim() || null,
      project_description: submission.project_description?.trim() || submission.message?.trim() || '',
      budget_range: submission.budget_range || null,
      lead_type: submission.lead_type,
      form_type: submission.form_type,
      requested_service: submission.requested_service || null,
      source: submission.source || 'website',
      status: 'new',
      priority: 'medium',
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as LeadRecord;
  },

  async getAllLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LeadRecord[];
  },

  async getLeadById(id: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as LeadRecord | null;
  },

  async updateLead(id: string, updates: Partial<LeadRecord>) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as LeadRecord;
  },

  async updateLeadStatus(id: string, status: LeadRecord['status']) {
    const updates: any = { status };

    if (status === 'qualified') {
      updates.qualified_at = new Date().toISOString();
    } else if (status === 'converted') {
      updates.converted_at = new Date().toISOString();
    }

    return this.updateLead(id, updates);
  },

  async assignLead(id: string, userId: string) {
    return this.updateLead(id, { assigned_to: userId });
  },

  async addNotes(id: string, notes: string) {
    const lead = await this.getLeadById(id);
    if (!lead) throw new Error('Lead not found');

    const existingNotes = lead.notes || '';
    const timestamp = new Date().toISOString();
    const newNotes = existingNotes
      ? `${existingNotes}\n\n[${timestamp}]\n${notes}`
      : `[${timestamp}]\n${notes}`;

    return this.updateLead(id, { notes: newNotes });
  },

  async searchLeads(query: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LeadRecord[];
  },

  async getLeadsByStatus(status: LeadRecord['status']) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LeadRecord[];
  },

  async getLeadsByPriority(priority: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('priority', priority)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LeadRecord[];
  },

  async getLeadsByAssignee(userId: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LeadRecord[];
  },

  async filterLeads(filters: {
    status?: string;
    priority?: string;
    lead_type?: string;
    assigned_to?: string;
    source?: string;
  }) {
    let query = supabase.from('leads').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.lead_type) {
      query = query.eq('lead_type', filters.lead_type);
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data as LeadRecord[];
  },
};
