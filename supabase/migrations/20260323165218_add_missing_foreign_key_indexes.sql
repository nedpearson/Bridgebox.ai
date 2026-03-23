/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add indexes on all unindexed foreign keys
    - Improves query performance for joins and lookups
    
  2. Indexes Added
    - custom_roles: created_by
    - document_extracted_data: validated_by
    - document_versions: uploaded_by
    - organization_feature_flags: enabled_by
    - workflow_executions: current_step_id
    - workflow_steps: next_step_id, on_false_step_id, on_true_step_id
    - workflows: created_by, last_modified_by
*/

-- Custom roles
CREATE INDEX IF NOT EXISTS idx_custom_roles_created_by ON public.custom_roles(created_by);

-- Document extracted data
CREATE INDEX IF NOT EXISTS idx_document_extracted_data_validated_by ON public.document_extracted_data(validated_by);

-- Document versions
CREATE INDEX IF NOT EXISTS idx_document_versions_uploaded_by ON public.document_versions(uploaded_by);

-- Organization feature flags
CREATE INDEX IF NOT EXISTS idx_organization_feature_flags_enabled_by ON public.organization_feature_flags(enabled_by);

-- Workflow executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_current_step_id ON public.workflow_executions(current_step_id);

-- Workflow steps
CREATE INDEX IF NOT EXISTS idx_workflow_steps_next_step_id ON public.workflow_steps(next_step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_on_false_step_id ON public.workflow_steps(on_false_step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_on_true_step_id ON public.workflow_steps(on_true_step_id);

-- Workflows
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON public.workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_last_modified_by ON public.workflows(last_modified_by);
