import { supabase } from '../supabase';
import { EntityType } from './entityLinks';

export interface SearchResult {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  url: string;
}

export const globalSearchService = {
  async search(tenantId: string, query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];
    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    // Parallel search across core tables utilizing correct isolation columns
    const [clientsRes, projectsRes, tasksRes, docsRes] = await Promise.all([
      // Organizations don't have a parent tenant; RLS controls membership.
      supabase.from('organizations').select('id, name, type').ilike('name', searchTerm).limit(5),
      supabase.from('projects').select('id, name, status').eq('organization_id', tenantId).ilike('name', searchTerm).limit(5),
      supabase.from('global_tasks').select('id, title, status').eq('tenant_id', tenantId).ilike('title', searchTerm).limit(5),
      supabase.from('documents').select('id, file_name, document_type').eq('organization_id', tenantId).ilike('file_name', searchTerm).limit(5)
    ]);

    if (clientsRes.data) {
      clientsRes.data.forEach(client => {
        results.push({
          id: client.id,
          type: 'organization',
          title: client.name,
          subtitle: `Client • ${client.type || 'Standard'}`,
          url: `/app/clients/${client.id}`
        });
      });
    }

    if (projectsRes.data) {
      projectsRes.data.forEach(project => {
        results.push({
          id: project.id,
          type: 'project',
          title: project.name,
          subtitle: `Project • ${project.status}`,
          url: `/app/projects/${project.id}`
        });
      });
    }

    if (tasksRes.data) {
      tasksRes.data.forEach(task => {
        results.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: `Task • ${task.status.replace('_', ' ')}`,
          url: `/app/tasks/${task.id}`
        });
      });
    }

    if (docsRes.data) {
      docsRes.data.forEach(doc => {
        results.push({
          id: doc.id,
          type: 'document',
          title: doc.file_name,
          subtitle: `Document • ${doc.document_type || 'File'}`,
          url: `/app/documents/${doc.id}`
        });
      });
    }

    return results;
  }
};
