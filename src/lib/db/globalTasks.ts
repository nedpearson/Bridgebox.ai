import { supabase } from '../supabase';
import { EntityType, entityLinkService } from './entityLinks';
import { auditService } from './audit';

export type GlobalTaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type GlobalTaskStatus = 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done' | 'cancelled';

export interface GlobalTask {
  id: string;
  tenant_id?: string;
  title: string;
  description?: string;
  status: GlobalTaskStatus;
  priority: GlobalTaskPriority;
  assignee_id?: string;
  creator_id?: string;
  due_date?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const globalTasksService = {
  async getTenantTasks(tenantId: string) {
    const { data, error } = await supabase
      .from('global_tasks')
      .select('*, assignee:profiles!global_tasks_assignee_id_fkey(full_name, avatar_url), creator:profiles!global_tasks_creator_id_fkey(full_name, avatar_url)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createTask(task: Partial<GlobalTask>) {
    const { data, error } = await supabase
      .from('global_tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;

    if (data.tenant_id) {
      auditService.logEvent({
        organizationId: data.tenant_id,
        actionType: 'create',
        resourceType: 'global_task',
        resourceId: data.id,
        deltaJson: task
      }).catch(e => console.warn('Audit Trail failed', e));
    }

    return data;
  },

  async updateTask(id: string, updates: Partial<GlobalTask>) {
    if (updates.status === 'done' && !updates.completed_at) {
       updates.completed_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('global_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data.tenant_id) {
      auditService.logEvent({
        organizationId: data.tenant_id,
        actionType: 'update',
        resourceType: 'global_task',
        resourceId: data.id,
        deltaJson: updates
      }).catch(e => console.warn('Audit Trail failed', e));
    }

    return data;
  },

  async updateTaskStatus(id: string, status: GlobalTaskStatus) {
    const updates: Partial<GlobalTask> = { status };
    if (status === 'done') updates.completed_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('global_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data.tenant_id) {
      auditService.logEvent({
        organizationId: data.tenant_id,
        actionType: 'update',
        resourceType: 'global_task',
        resourceId: data.id,
        deltaJson: { status }
      }).catch(e => console.warn('Audit Trail failed', e));
    }

    return data;
  },

  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from('global_tasks')
      .select('*, assignee:profiles!global_tasks_assignee_id_fkey(full_name, avatar_url), creator:profiles!global_tasks_creator_id_fkey(full_name, avatar_url)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as (GlobalTask & { assignee?: any, creator?: any });
  },

  async getLinkedTasks(entityType: EntityType, entityId: string) {
    const links = await entityLinkService.getLinkedEntities(entityType, entityId, 'task');
    const taskIds = links.map(link => 
      link.source_type === 'task' ? link.source_id : link.target_id
    );

    if (taskIds.length === 0) return [];

    const { data, error } = await supabase
      .from('global_tasks')
      .select('*, assignee:profiles!global_tasks_assignee_id_fkey(full_name, avatar_url), creator:profiles!global_tasks_creator_id_fkey(full_name, avatar_url)')
      .in('id', taskIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (GlobalTask & { assignee?: any, creator?: any })[];
  }
};
