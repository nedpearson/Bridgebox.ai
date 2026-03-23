import { createClient } from '@supabase/supabase-js';
import { config, validateConfig } from './config';

validateConfig();

export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export interface Lead {
  id?: string;
  name: string;
  email: string;
  company?: string;
  project_description: string;
  budget_range?: string;
  lead_type: 'custom_software' | 'automation' | 'dashboards' | 'mobile_app';
  form_type: 'demo' | 'custom_build';
  created_at?: string;
  updated_at?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'converted';
}

export async function submitLead(lead: Lead) {
  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
