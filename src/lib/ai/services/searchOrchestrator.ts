import { supabase } from '../../supabase';

export interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'document' | 'client' | 'integration' | 'lead';
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  matchScore?: number;
}

export const searchOrchestrator = {
  /**
   * Executes a highly optimized parallel search across the isolated relational schemas.
   * Supabase automatically applies `tenant_id` / `organization_id` RLS logic seamlessly.
   */
  async searchAll(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    
    const term = `%${query.trim()}%`;
    const results: SearchResult[] = [];

    try {
      const [
        projectsRes,
        tasksRes,
        docsRes,
        leadsRes
      ] = await Promise.all([
        supabase.from('bb_projects').select('id, name, description').ilike('name', term).limit(5),
        supabase.from('global_tasks').select('id, title, description').ilike('title', term).limit(5),
        supabase.from('bb_documents').select('id, title, excerpt').ilike('title', term).limit(5),
        supabase.from('bb_leads').select('id, company_name, contact_name').or(`company_name.ilike.${term},contact_name.ilike.${term}`).limit(5)
      ]);

      if (projectsRes.data) {
        projectsRes.data.forEach((p: any) => {
          results.push({ id: p.id, type: 'project', title: p.name, subtitle: p.description?.substring(0, 60), url: `/app/projects/${p.id}` });
        });
      }

      if (tasksRes.data) {
        tasksRes.data.forEach((t: any) => {
          results.push({ id: t.id, type: 'task', title: t.title, subtitle: t.description?.substring(0, 60), url: `/app/tasks/${t.id}` });
        });
      }

      if (docsRes.data) {
        docsRes.data.forEach((d: any) => {
          results.push({ id: d.id, type: 'document', title: d.title, subtitle: d.excerpt?.substring(0, 60), url: `/app/documents/${d.id}` });
        });
      }

      if (leadsRes.data) {
        leadsRes.data.forEach((l: any) => {
          results.push({ id: l.id, type: 'lead', title: l.company_name || l.contact_name, subtitle: l.contact_name, url: `/app/sales/${l.id}` });
        });
      }

      return results;

    } catch (e) {
       console.error("Omni-Search Fetch Error:", e);
       return [];
    }
  }
};
