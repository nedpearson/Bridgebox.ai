import { supabase } from '../supabase';

export interface ProjectFilters {
  status?: string;
  type?: string;
  organization_id?: string;
}

export const projectsService = {
  async createProject(project: {
    name: string;
    description?: string;
    type: string;
    status: string;
    organization_id: string;
    start_date?: string;
    target_launch_date?: string;
  }) {
    const { data, error } = await supabase
      .from('bb_projects')
      .insert([project])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllProjects(filters?: ProjectFilters) {
    let query = supabase
      .from('bb_projects')
      .select('*, bb_organizations(name), bb_profiles!projects_project_manager_id_fkey(full_name)');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getProjectById(id: string) {
    const { data, error } = await supabase
      .from('bb_projects')
      .select(`
        *,
        bb_organizations(id, name, type),
        bb_profiles!projects_project_manager_id_fkey(id, full_name, email),
        bb_project_milestones(*),
        bb_deliverables(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getProjectsByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from('bb_projects')
      .select('*, bb_profiles!projects_project_manager_id_fkey(full_name), bb_project_milestones(*), bb_deliverables(*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMyProjects() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: memberships } = await supabase
      .from('bb_organization_memberships')
      .select('organization_id')
      .eq('user_id', user.user.id);

    if (!memberships || memberships.length === 0) {
      return [];
    }

    const orgIds = memberships.map(m => m.organization_id);

    const { data, error } = await supabase
      .from('bb_projects')
      .select('*, bb_organizations(name), bb_profiles!projects_project_manager_id_fkey(full_name), bb_deliverables(status)')
      .in('organization_id', orgIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getProjectMilestones(projectId: string) {
    const { data, error } = await supabase
      .from('bb_project_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index');

    if (error) throw error;
    return data;
  },

  async getProjectDeliverables(projectId: string) {
    const { data, error } = await supabase
      .from('bb_deliverables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateProject(id: string, updates: {
    name?: string;
    description?: string;
    status?: string;
    start_date?: string;
    target_launch_date?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('bb_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMilestone(id: string, updates: {
    status?: string;
    completed_date?: string;
  }) {
    const { data, error } = await supabase
      .from('bb_project_milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async searchProjects(query: string, organizationId?: string) {
    let dbQuery = supabase
      .from('bb_projects')
      .select('*, bb_organizations(name)')
      .ilike('name', `%${query}%`);

    if (organizationId) {
      dbQuery = dbQuery.eq('organization_id', organizationId);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
