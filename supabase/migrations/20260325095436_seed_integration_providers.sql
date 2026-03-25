-- Seed 新 providers requested in the prompt
INSERT INTO connector_providers (id, name, display_name, description, connector_type, category, auth_type, features, is_popular, status) VALUES
  ('clio', 'clio', 'Clio', 'Sync matters, contacts, and calendar with Clio', 'legal_crm', 'business_systems', 'oauth2', ARRAY['matters', 'contacts', 'calendar', 'tasks', 'documents', 'notes'], true, 'available'),
  ('financial_cents', 'financial_cents', 'Financial Cents', 'Sync workflows, tasks, and deadlines', 'accounting_crm', 'business_systems', 'api_key', ARRAY['workflows', 'tasks', 'dates', 'statuses'], false, 'available'),
  ('commander_ne', 'commander_ne', 'Commander NE', 'Import inventory, service orders, and customer records', 'inventory', 'business_systems', 'none', ARRAY['inventory', 'service_orders', 'customers'], false, 'import_only'),
  ('ourfamilywizard', 'ourfamilywizard', 'OurFamilyWizard', 'Import evidence, messages, and custody calendar', 'family_law', 'business_systems', 'none', ARRAY['messages', 'calendar', 'expenses', 'evidence'], false, 'import_only'),
  ('soberlink', 'soberlink', 'Soberlink', 'Import sobriety compliance and incident records', 'compliance', 'business_systems', 'none', ARRAY['compliance', 'test_results', 'alerts'], false, 'import_only')
ON CONFLICT (id) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  status = EXCLUDED.status;
