-- Create the enum for supported audit actions
CREATE TYPE audit_action_type AS ENUM ('create', 'read', 'update', 'delete', 'export', 'login');

-- Create the append-only Audit Logs ledger table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type audit_action_type NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    delta_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Core Indexes for massive timeline queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Super Admins can see ALL logs globally natively
CREATE POLICY "Super admins can view all audit logs" ON audit_logs FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'super_admin'
);

-- Tenant admins can only see logs strictly bound to their organization ID
CREATE POLICY "Tenant admins can view org audit logs" ON audit_logs FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') = 'tenant_admin'
);

-- Intentionally, there are NO update or delete policies created.
-- This ensures the ledger is entirely append-only natively at the postgres tier.

-- Create an RPC function to securely log events from Edge/Frontend contexts
CREATE OR REPLACE FUNCTION log_audit_event(
    p_organization_id UUID,
    p_action_type audit_action_type,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_delta_json JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    INSERT INTO audit_logs (
        organization_id, user_id, action_type, resource_type, resource_id, delta_json
    ) VALUES (
        p_organization_id, v_user_id, p_action_type, p_resource_type, p_resource_id, p_delta_json
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
