-- Bridgebox AI Performance Optimization Pass: Phase 3
-- Global Indexing Strategy
-- Explicitly enforcing B-Tree index structures upon the most heavily utilized 
-- multi-tenant constraint columns eliminating sequential table scan bottlenecks natively.

-- Organization Boundary B-Tree Indices (Multi-Tenant Scale Optimization)
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_org_id ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_org_id ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_global_tasks_org_id ON global_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_global_communications_org_id ON global_communications(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_org_id ON workflow_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_analyses_org_id ON document_analyses(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org_id ON user_roles(organization_id);

-- Secondary Relational Indices (Dashboard N+1 Mitigation Lookups)
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_lead_id ON proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_global_tasks_project_id ON global_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_global_tasks_client_id ON global_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_global_tasks_lead_id ON global_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_global_communications_client_id ON global_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_global_communications_lead_id ON global_communications(lead_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_document_analyses_document_id ON document_analyses(document_id);

-- Temporal Traversal Indices (Chronological Order Scans)
CREATE INDEX IF NOT EXISTS idx_global_tasks_created_at ON global_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_communications_timestamp ON global_communications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at DESC);
