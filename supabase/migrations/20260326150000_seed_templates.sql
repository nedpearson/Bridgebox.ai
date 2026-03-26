-- Phase 6: Seed Default Bridgebox Templates

INSERT INTO public.bb_templates (
    name, 
    description, 
    category, 
    industry, 
    status,
    version,
    configuration_payload,
    billing_rules
) VALUES 
(
    'Family Law Practice Management',
    'A comprehensive blueprint for family law attorneys. Features secure document vaulting, billable hour tracking workflows, court deadline automation, and an AI Paralegal agent.',
    'industry_pack',
    'Legal',
    'published',
    '1.0.0',
    '{
        "entities": [
            { "name": "Case Files", "fields": ["case_number", "jurisdiction", "status"] },
            { "name": "Billable Hours", "fields": ["amount", "rate", "attorney_id"] },
            { "name": "Court Deadlines", "fields": ["date", "description", "severity"] }
        ],
        "workflows": [
            { "name": "Client Intake Sequence", "trigger_type": "webhook", "steps": [] },
            { "name": "Invoice Generation", "trigger_type": "schedule", "steps": [] }
        ],
        "forms": [
            { "name": "New Client Questionnaire" },
            { "name": "Secure File Upload Portal" }
        ],
        "ai_agents": [
            { "name": "Legal Draft Copilot", "role": "Document Assembly Pipeline" }
        ]
    }'::jsonb,
    '{"base_plan_requirement": "Growth"}'::jsonb
),
(
    'Bridal & Formal Wear Logistics',
    'Optimized inventory management for bridal boutiques. Features multi-location transfer requests, lead-time intelligence, and reservation calendaring.',
    'industry_pack',
    'Retail',
    'published',
    '1.2.0',
    '{
        "entities": [
            { "name": "Inventory Ledger", "fields": ["sku", "size", "color", "location"] },
            { "name": "Fittings", "fields": ["client_id", "stylist_id", "date"] },
            { "name": "Vendor Orders", "fields": ["lead_time_days", "status", "rush_flags"] }
        ],
        "workflows": [
            { "name": "Rush Order Escalation", "trigger_type": "data_change", "steps": [] },
            { "name": "Inter-store Transfer Approval", "trigger_type": "manual", "steps": [] }
        ],
        "forms": [
            { "name": "Bridal Profile Intake" }
        ],
        "ai_agents": [
            { "name": "Lead Time Forecaster", "role": "Inventory Intelligence Analyst" }
        ]
    }'::jsonb,
    '{"base_plan_requirement": "Starter"}'::jsonb
),
(
    'Med Spa Clinical Operations',
    'HIPAA-compliant system designed for medical spas and aestheticians. Includes patient treatment charting, inventory for injectables, and membership billing.',
    'industry_pack',
    'Healthcare',
    'published',
    '1.0.0',
    '{
        "entities": [
            { "name": "Patient Charts", "fields": ["medical_history", "treatment_notes"] },
            { "name": "Injectable Inventory", "fields": ["lot_number", "expiration", "units_remaining"] },
            { "name": "Memberships", "fields": ["tier", "monthly_bank", "status"] }
        ],
        "workflows": [
            { "name": "Post-Care Followup Automation", "trigger_type": "event", "steps": [] }
        ],
        "forms": [
            { "name": "Consent & Treatment Authorization" }
        ],
        "ai_agents": []
    }'::jsonb,
    '{"base_plan_requirement": "Enterprise"}'::jsonb
),
(
    'Travel Agency Back-Office',
    'Extends Bridgebox with direct integrations for TRAMS and ClientBase. Architected to ingest GDS segments and map them to unified client itineraries.',
    'business_overlay',
    'Travel & Hospitality',
    'published',
    '1.0.0',
    '{
        "entities": [
            { "name": "Itineraries", "fields": ["trip_name", "start_date", "end_date", "pnr"] },
            { "name": "Commissions", "fields": ["amount", "vendor", "expected_date"] }
        ],
        "workflows": [
            { "name": "TRAMS Sync Webhook", "trigger_type": "webhook", "steps": [] }
        ],
        "forms": [],
        "ai_agents": [
            { "name": "Itinerary Parsing Agent", "role": "Data Extractor" }
        ]
    }'::jsonb,
    '{"base_plan_requirement": "Growth"}'::jsonb
);
