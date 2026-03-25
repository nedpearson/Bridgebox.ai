import { supabase } from '../supabase';

export interface OrganizationBranding {
  id: string;
  organization_id: string;
  logo_url?: string;
  logo_light_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  company_name?: string;
  tagline?: string;
  custom_domain?: string;
  support_email?: string;
  support_phone?: string;
  custom_css?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  organization_id: string;
  feature_key: string;
  enabled: boolean;
  config: Record<string, any>;
  enabled_at?: string;
  enabled_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomRole {
  id: string;
  organization_id: string;
  name: string;
  display_name: string;
  description?: string;
  permissions: Record<string, any>;
  inherits_from?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  included: boolean;
  limit_value?: number;
  limit_type?: string;
  metadata: Record<string, any>;
}

export const whiteLabelService = {
  async getBranding(organizationId: string): Promise<OrganizationBranding | null> {
    const { data, error } = await supabase
      .from('organization_branding')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsertBranding(
    organizationId: string,
    branding: Partial<OrganizationBranding>
  ): Promise<OrganizationBranding> {
    const { data, error } = await supabase
      .from('organization_branding')
      .upsert({
        organization_id: organizationId,
        ...branding,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFeatureFlags(organizationId: string): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('organization_feature_flags')
      .select('*')
      .eq('organization_id', organizationId)
      .order('feature_key');

    if (error) throw error;
    return data || [];
  },

  async getFeatureFlag(
    organizationId: string,
    featureKey: string
  ): Promise<FeatureFlag | null> {
    const { data, error } = await supabase
      .from('organization_feature_flags')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('feature_key', featureKey)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async toggleFeature(
    organizationId: string,
    featureKey: string,
    enabled: boolean,
    userId: string
  ): Promise<FeatureFlag> {
    const { data, error } = await supabase
      .from('organization_feature_flags')
      .upsert({
        organization_id: organizationId,
        feature_key: featureKey,
        enabled,
        enabled_at: enabled ? new Date().toISOString() : null,
        enabled_by: enabled ? userId : null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFeatureConfig(
    organizationId: string,
    featureKey: string,
    config: Record<string, any>
  ): Promise<FeatureFlag> {
    const { data, error } = await supabase
      .from('organization_feature_flags')
      .update({ config })
      .eq('organization_id', organizationId)
      .eq('feature_key', featureKey)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCustomRoles(organizationId: string): Promise<CustomRole[]> {
    const { data, error } = await supabase
      .from('custom_roles')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('display_name');

    if (error) throw error;
    return data || [];
  },

  async createCustomRole(
    organizationId: string,
    role: Omit<CustomRole, 'id' | 'created_at' | 'updated_at' | 'organization_id'>,
    userId: string
  ): Promise<CustomRole> {
    const { data, error } = await supabase
      .from('custom_roles')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        ...role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCustomRole(
    roleId: string,
    updates: Partial<CustomRole>
  ): Promise<CustomRole> {
    const { data, error } = await supabase
      .from('custom_roles')
      .update(updates)
      .eq('id', roleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCustomRole(roleId: string): Promise<void> {
    const { error } = await supabase
      .from('custom_roles')
      .update({ is_active: false })
      .eq('id', roleId);

    if (error) throw error;
  },

  async getPlanFeatures(planId: string): Promise<PlanFeature[]> {
    const { data, error } = await supabase
      .from('plan_features')
      .select('*')
      .eq('plan_id', planId)
      .eq('included', true);

    if (error) throw error;
    return data || [];
  },

  async checkFeatureAccess(
    organizationId: string,
    planId: string,
    featureKey: string
  ): Promise<boolean> {
    const [planFeature, orgFlag] = await Promise.all([
      supabase
        .from('plan_features')
        .select('*')
        .eq('plan_id', planId)
        .eq('feature_key', featureKey)
        .maybeSingle(),
      supabase
        .from('organization_feature_flags')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('feature_key', featureKey)
        .maybeSingle(),
    ]);

    if (planFeature.error || !planFeature.data?.included) {
      return false;
    }

    if (orgFlag.data && !orgFlag.data.enabled) {
      return false;
    }

    return true;
  },
};

export const AVAILABLE_FEATURES = [
  {
    key: 'crm',
    name: 'CRM',
    description: 'Lead management and pipeline tracking',
    category: 'core',
  },
  {
    key: 'analytics',
    name: 'Analytics',
    description: 'Advanced analytics and reporting',
    category: 'core',
  },
  {
    key: 'support',
    name: 'Support',
    description: 'Customer support ticketing system',
    category: 'core',
  },
  {
    key: 'automation',
    name: 'Automation',
    description: 'Workflow automation and rules engine',
    category: 'advanced',
  },
  {
    key: 'ai_copilot',
    name: 'AI Copilot',
    description: 'AI-powered assistance and insights',
    category: 'advanced',
  },
  {
    key: 'custom_branding',
    name: 'Custom Branding',
    description: 'White-label branding customization',
    category: 'enterprise',
  },
  {
    key: 'custom_domain',
    name: 'Custom Domain',
    description: 'Use your own domain name',
    category: 'enterprise',
  },
  {
    key: 'sso',
    name: 'SSO',
    description: 'Single sign-on integration',
    category: 'enterprise',
  },
  {
    key: 'custom_roles',
    name: 'Custom Roles',
    description: 'Define custom user roles and permissions',
    category: 'enterprise',
  },
  {
    key: 'clio',
    name: 'Clio Integration',
    description: 'Sync matters, contacts, and calendar with Clio',
    category: 'integrations',
  },
  {
    key: 'financial_cents',
    name: 'Financial Cents Integration',
    description: 'Sync workflows, tasks, and deadlines',
    category: 'integrations',
  },
  {
    key: 'commander_ne',
    name: 'Commander NE Integration',
    description: 'Import inventory, service orders, and customer records',
    category: 'integrations',
  },
  {
    key: 'ourfamilywizard',
    name: 'OurFamilyWizard Integration',
    description: 'Import evidence, messages, and custody calendar',
    category: 'integrations',
  },
  {
    key: 'soberlink',
    name: 'Soberlink Integration',
    description: 'Import sobriety compliance and incident records',
    category: 'integrations',
  },
  {
    key: 'trams_back_office',
    name: 'TRAMS Back Office Integration',
    description: 'Import travel ops and back-office accounting',
    category: 'integrations',
  },
  {
    key: 'clientbase_us',
    name: 'ClientBase Integration',
    description: 'Import CRM contacts, tasks, and travel opportunities',
    category: 'integrations',
  },
  {
    key: 'helga',
    name: 'HELGA Integration',
    description: 'Logistics operations and courier manifest sync',
    category: 'integrations',
  },
] as const;

