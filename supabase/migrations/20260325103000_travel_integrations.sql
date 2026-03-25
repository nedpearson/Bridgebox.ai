-- TRAMS and ClientBase additive tables

CREATE TABLE IF NOT EXISTS public.external_agencies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  name text NOT NULL,
  iata_number text,
  address jsonb,
  contact_info jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_trips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  traveler_id text,
  agency_id text,
  trip_name text NOT NULL,
  start_date date,
  end_date date,
  total_cost numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  trip_id text,
  supplier_id text,
  confirmation_number text,
  reservation_type text,
  amount numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_supplier_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  supplier_name text NOT NULL,
  balance numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_commissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  reservation_id text,
  expected_amount numeric,
  received_amount numeric DEFAULT 0,
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_sales_opportunities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  client_id text,
  title text NOT NULL,
  value numeric,
  stage text,
  probability integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  client_id text,
  trip_id text,
  amount numeric,
  balance_due numeric,
  issue_date date,
  due_date date,
  status text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_object_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bridgebox_entity_type text NOT NULL,
  bridgebox_entity_id uuid NOT NULL,
  external_provider text NOT NULL,
  external_type text NOT NULL,
  external_id text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bridgebox_entity_type, bridgebox_entity_id, external_provider, external_id)
);

-- RLS Policies
ALTER TABLE public.external_agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_agencies" ON public.external_agencies FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_trips" ON public.external_trips FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_reservations" ON public.external_reservations FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_supplier_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_supplier_accounts" ON public.external_supplier_accounts FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_commissions" ON public.external_commissions FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_sales_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_sales_opportunities" ON public.external_sales_opportunities FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_invoices" ON public.external_invoices FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_object_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_object_links" ON public.external_object_links FOR ALL USING (organization_id IN (SELECT auth.uid()));
