-- Migration: Seed First-Wave High-Impact Agent Packs
-- Description: Injects 8 strategically designed AI Assistants into the global ecosystem catalog for tenant discovery and installation.

-- 1. Ensure the overarching bb_agents table is ready
-- (This should already exist from the Architecture Phase, but we are inserting the specific Core Fleet)

INSERT INTO public.bb_agents (id, name, description, capabilities_json, recommended_autonomy, category, created_at)
VALUES
-- Core Cross-Functional
(
  gen_random_uuid(),
  'The AR Chaser',
  'Automates accounts receivable by monitoring overdue invoices, drafting escalating follow-ups, and alerting owners when debt hits critical aging (30+ days).',
  '{"triggers": ["invoice_overdue_3", "invoice_overdue_14", "invoice_overdue_30"], "actions": ["email_draft", "mobile_push_escalation"]}'::jsonb,
  'level_1'::autonomy_level,
  'finance',
  now()
),
(
  gen_random_uuid(),
  'Lead Response Accelerator',
  'Prevents dropped leads by drafting proactive, personalized SMS/Emails if an inbound inquiry remains unclaimed by staff for more than 15 minutes.',
  '{"triggers": ["lead_created_unclaimed_15m"], "actions": ["sms_draft", "email_draft", "pipeline_update"]}'::jsonb,
  'level_2'::autonomy_level,
  'sales',
  now()
),
(
  gen_random_uuid(),
  'Ghosted Deal Re-Engager',
  'Revives stagnant pipeline revenue by identifying Deals with no activity for 14 days and drafting contextual check-in messages based on prior notes.',
  '{"triggers": ["deal_stagnant_14d"], "actions": ["email_draft", "crm_note_read"]}'::jsonb,
  'level_1'::autonomy_level,
  'sales',
  now()
),
(
  gen_random_uuid(),
  'Ops Bottleneck Detector',
  'Monitors Execution Pipelines and Kanban boards to immediately flag project managers when a task violates SLA timers in specific workflow stages.',
  '{"triggers": ["task_sla_violated"], "actions": ["in_app_notification", "email_draft_to_client"]}'::jsonb,
  'level_2'::autonomy_level,
  'operations',
  now()
),

-- Industry Specific Vertical Agents
(
  gen_random_uuid(),
  'Conflict of Interest Sentinel',
  'Safeguards Legal intake by fuzzy-matching opposing party names against the historical CRM database before consultations are booked.',
  '{"triggers": ["lead_created_legal"], "actions": ["crm_global_search", "lock_lead", "partner_alert"]}'::jsonb,
  'level_3'::autonomy_level,
  'legal',
  now()
),
(
  gen_random_uuid(),
  'Rush Order Expediter',
  'Protects Bridal logistics by calculating transit velocity vs event dates. Automatically flags "CRITICAL RUSH" for dresses arriving with < 14 days margin.',
  '{"triggers": ["inventory_received_bridal"], "actions": ["update_order_status_rush", "sms_seamstress_alert"]}'::jsonb,
  'level_3'::autonomy_level,
  'retail',
  now()
),
(
  gen_random_uuid(),
  'Missing Form Hound',
  'Assists CPAs during tax gridlock by securely requesting missing W-2s or 1099s from clients automatically 14 days prior to filing deadlines.',
  '{"triggers": ["tax_deadline_approaching_14d", "form_missing_w2"], "actions": ["secure_portal_email_draft"]}'::jsonb,
  'level_1'::autonomy_level,
  'accounting',
  now()
),
(
  gen_random_uuid(),
  'Itinerary Watchdog',
  'Proactively shields Travel agencies from unhappy clients by detecting flight API delays > 2hr and drafting luxury lounge or rebooking texts instantly.',
  '{"triggers": ["flight_delayed_2h"], "actions": ["sms_draft_lounge_offer", "sms_draft_rebooking"]}'::jsonb,
  'level_2'::autonomy_level,
  'travel',
  now()
)
ON CONFLICT (id) DO NOTHING;
