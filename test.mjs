import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const tables = ['bb_project_delivery', 'bb_marketplace_templates', 'bb_organization_settings', 'bb_agent_audit_logs', 'bb_tenant_agents', 'bb_leads', 'bb_client_opportunities', 'bb_client_risks', 'bb_support_tickets', 'bb_subscriptions', 'bb_projects', 'bb_onboarding_progress', 'bb_template_installs', 'bb_entity_links'];
  const results = [];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1);
    results.push(t + ': ' + (error ? (error.code + ' ' + error.message) : 'OK'));
  }
  // Let's test the project_delivery relationship exactly like the frontend does:
  const { error: relError } = await supabase.from('bb_project_delivery').select('*, project:bb_projects!project_delivery_project_id_fkey(id), team_lead:bb_profiles!project_delivery_team_lead_id_fkey(full_name)').limit(1);
  results.push('bb_project_delivery_relation: ' + (relError ? (relError.code + ' ' + relError.message) : 'OK'));
  
  import('fs').then(fs => fs.writeFileSync('table_results.txt', results.join('\n')));
}
test();
