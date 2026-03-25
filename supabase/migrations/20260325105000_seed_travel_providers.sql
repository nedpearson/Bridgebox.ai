-- Seed data for Travel Integrations (TRAMS & ClientBase)
INSERT INTO connector_providers (
  id, 
  name, 
  display_name, 
  description, 
  connector_type, 
  category, 
  auth_type, 
  features, 
  is_popular, 
  status
) VALUES 
(
  'trams_back_office', 
  'TRAMS Back Office', 
  'TRAMS Back Office', 
  'Import travel ops, accounting, and supplier balances', 
  'database', 
  'business_systems', 
  'none', 
  ARRAY['import_csv', 'read_sync'], 
  false, 
  'beta'
),
(
  'clientbase_us', 
  'ClientBase.us', 
  'ClientBase.us', 
  'CRM sync for travel clients, opportunities, and tasks', 
  'api', 
  'business_systems', 
  'api_key', 
  ARRAY['read_sync', 'write_sync'], 
  false, 
  'beta'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  status = EXCLUDED.status;
