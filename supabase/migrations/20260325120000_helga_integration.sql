-- HELGA (helgasys.com) Integration Tables

CREATE TABLE IF NOT EXISTS public.external_shipments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  tracking_number text,
  status text,
  sender_id text,
  recipient_id text,
  weight numeric,
  dimensions jsonb,
  declared_value numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_tracking_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  shipment_id text,
  event_time timestamptz,
  status_code text,
  location_name text,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_dispatches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  dispatch_date timestamptz,
  vehicle_id text,
  driver_id text,
  route_code text,
  status text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_manifests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  manifest_date date,
  origin text,
  destination text,
  total_packages integer,
  total_weight numeric,
  status text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_consolidations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  consolidation_date date,
  master_tracking_number text,
  carrier text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_inventory_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  sku text,
  name text,
  quantity integer,
  location_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_tariffs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  zone_code text,
  weight_tier numeric,
  rate numeric,
  currency text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_recipients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  address jsonb,
  tax_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_logistics_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  account_name text NOT NULL,
  account_type text,
  credit_limit numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_courier_guides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  guide_number text,
  courier_name text,
  service_type text,
  cost numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

-- RLS Policies
ALTER TABLE public.external_shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_shipments" ON public.external_shipments FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_tracking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_tracking_events" ON public.external_tracking_events FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_dispatches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_dispatches" ON public.external_dispatches FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_manifests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_manifests" ON public.external_manifests FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_consolidations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_consolidations" ON public.external_consolidations FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_inventory_items" ON public.external_inventory_items FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_tariffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_tariffs" ON public.external_tariffs FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_recipients" ON public.external_recipients FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_logistics_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_logistics_accounts" ON public.external_logistics_accounts FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_courier_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_courier_guides" ON public.external_courier_guides FOR ALL USING (organization_id IN (SELECT auth.uid()));
