/*
  # Create Leads Management System

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `company` (text, optional)
      - `project_description` (text, required)
      - `budget_range` (text, optional)
      - `lead_type` (text, required) - segments: custom_software, automation, dashboards, mobile_app
      - `form_type` (text, required) - demo or custom_build
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
      - `status` (text) - new, contacted, qualified, converted
      
  2. Security
    - Enable RLS on `leads` table
    - Add policy for inserting leads (public access for form submissions)
    - Add policy for authenticated users to read all leads (admin access)

  3. Indexes
    - Index on email for quick lookup
    - Index on created_at for sorting
    - Index on lead_type for filtering
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  project_description text NOT NULL,
  budget_range text,
  lead_type text NOT NULL CHECK (lead_type IN ('custom_software', 'automation', 'dashboards', 'mobile_app')),
  form_type text NOT NULL CHECK (form_type IN ('demo', 'custom_build')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted'))
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit leads"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
