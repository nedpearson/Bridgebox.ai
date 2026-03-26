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
      .from('projects')
      .insert([project])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllProjects(filters?: ProjectFilters) {
    let query = supabase
      .from('projects')
      .select('*, organizations(name), profiles!projects_project_manager_id_fkey(full_name)');

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
      .from('projects')
      .select(`
        *,
        organizations(id, name, type),
        profiles!projects_project_manager_id_fkey(id, full_name, email),
        project_milestones(*),
        deliverables(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getProjectsByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles!projects_project_manager_id_fkey(full_name), project_milestones(*), deliverables(*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMyProjects() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: memberships } = await supabase
      .from('organization_memberships')
      .select('organization_id')
      .eq('user_id', user.user.id);

    if (!memberships || memberships.length === 0) {
      return [];
    }

    const orgIds = memberships.map(m => m.organization_id);

    const { data, error } = await supabase
      .from('projects')
      .select('*, organizations(name), profiles!projects_project_manager_id_fkey(full_name), deliverables(status)')
      .in('organization_id', orgIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getProjectMilestones(projectId: string) {
    const { data, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index');

    if (error) throw error;
    return data;
  },

  async getProjectDeliverables(projectId: string) {
    const { data, error } = await supabase
      .from('deliverables')
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
      .from('projects')
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
      .from('project_milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async searchProjects(query: string, organizationId?: string) {
    let dbQuery = supabase
      .from('projects')
      .select('*, organizations(name)')
      .ilike('name', `%${query}%`);

    if (organizationId) {
      dbQuery = dbQuery.eq('organization_id', organizationId);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
