-- ============================================================
-- BRIDGEBOX: ADD bb_ PREFIX TO ALL CORE TABLES
-- This migration renames all unprefixed Bridgebox tables.
-- Tables already prefixed (fcpa_, pnx_, stripe_) are untouched.
-- Uses IF EXISTS to be idempotent.
-- ============================================================

DO $$
BEGIN

  -- Core tenant / auth tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='organizations') THEN
    ALTER TABLE public.organizations RENAME TO bb_organizations;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='organization_memberships') THEN
    ALTER TABLE public.organization_memberships RENAME TO bb_organization_memberships;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='organization_branding') THEN
    ALTER TABLE public.organization_branding RENAME TO bb_organization_branding;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='organization_feature_flags') THEN
    ALTER TABLE public.organization_feature_flags RENAME TO bb_organization_feature_flags;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='organization_plugins') THEN
    ALTER TABLE public.organization_plugins RENAME TO bb_organization_plugins;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    ALTER TABLE public.profiles RENAME TO bb_profiles;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='account_owners') THEN
    ALTER TABLE public.account_owners RENAME TO bb_account_owners;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='custom_roles') THEN
    ALTER TABLE public.custom_roles RENAME TO bb_custom_roles;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='role_permissions') THEN
    ALTER TABLE public.role_permissions RENAME TO bb_role_permissions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_permissions') THEN
    ALTER TABLE public.user_permissions RENAME TO bb_user_permissions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='permission_actions') THEN
    ALTER TABLE public.permission_actions RENAME TO bb_permission_actions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='permission_resources') THEN
    ALTER TABLE public.permission_resources RENAME TO bb_permission_resources;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='permission_audit_log') THEN
    ALTER TABLE public.permission_audit_log RENAME TO bb_permission_audit_log;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='invitations') THEN
    ALTER TABLE public.invitations RENAME TO bb_invitations;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_presence') THEN
    ALTER TABLE public.user_presence RENAME TO bb_user_presence;
  END IF;

  -- CRM / Sales
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='leads') THEN
    ALTER TABLE public.leads RENAME TO bb_leads;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='proposals') THEN
    ALTER TABLE public.proposals RENAME TO bb_proposals;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='proposal_pipeline') THEN
    ALTER TABLE public.proposal_pipeline RENAME TO bb_proposal_pipeline;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='conversion_tracking') THEN
    ALTER TABLE public.conversion_tracking RENAME TO bb_conversion_tracking;
  END IF;

  -- Projects / Delivery
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='projects') THEN
    ALTER TABLE public.projects RENAME TO bb_projects;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='project_delivery') THEN
    ALTER TABLE public.project_delivery RENAME TO bb_project_delivery;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='project_implementations') THEN
    ALTER TABLE public.project_implementations RENAME TO bb_project_implementations;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='project_milestones') THEN
    ALTER TABLE public.project_milestones RENAME TO bb_project_milestones;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='deliverables') THEN
    ALTER TABLE public.deliverables RENAME TO bb_deliverables;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='delivery_notes') THEN
    ALTER TABLE public.delivery_notes RENAME TO bb_delivery_notes;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='milestones') THEN
    ALTER TABLE public.milestones RENAME TO bb_milestones;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='risk_flags') THEN
    ALTER TABLE public.risk_flags RENAME TO bb_risk_flags;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='implementation_checklists') THEN
    ALTER TABLE public.implementation_checklists RENAME TO bb_implementation_checklists;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='implementation_environments') THEN
    ALTER TABLE public.implementation_environments RENAME TO bb_implementation_environments;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='implementation_risks') THEN
    ALTER TABLE public.implementation_risks RENAME TO bb_implementation_risks;
  END IF;

  -- Client Success
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='client_health_scores') THEN
    ALTER TABLE public.client_health_scores RENAME TO bb_client_health_scores;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='client_interactions') THEN
    ALTER TABLE public.client_interactions RENAME TO bb_client_interactions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='success_opportunities') THEN
    ALTER TABLE public.success_opportunities RENAME TO bb_success_opportunities;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='scored_opportunities') THEN
    ALTER TABLE public.scored_opportunities RENAME TO bb_scored_opportunities;
  END IF;

  -- Billing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='subscriptions') THEN
    ALTER TABLE public.subscriptions RENAME TO bb_subscriptions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='subscription_plans') THEN
    ALTER TABLE public.subscription_plans RENAME TO bb_subscription_plans;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='invoices') THEN
    ALTER TABLE public.invoices RENAME TO bb_invoices;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='plan_features') THEN
    ALTER TABLE public.plan_features RENAME TO bb_plan_features;
  END IF;

  -- Support
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='support_tickets') THEN
    ALTER TABLE public.support_tickets RENAME TO bb_support_tickets;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ticket_comments') THEN
    ALTER TABLE public.ticket_comments RENAME TO bb_ticket_comments;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications') THEN
    ALTER TABLE public.notifications RENAME TO bb_notifications;
  END IF;

  -- Workflows / Automation
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workflows') THEN
    ALTER TABLE public.workflows RENAME TO bb_workflows;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workflow_steps') THEN
    ALTER TABLE public.workflow_steps RENAME TO bb_workflow_steps;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workflow_executions') THEN
    ALTER TABLE public.workflow_executions RENAME TO bb_workflow_executions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workflow_step_executions') THEN
    ALTER TABLE public.workflow_step_executions RENAME TO bb_workflow_step_executions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workflow_templates') THEN
    ALTER TABLE public.workflow_templates RENAME TO bb_workflow_templates;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='automation_rules') THEN
    ALTER TABLE public.automation_rules RENAME TO bb_automation_rules;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='automation_executions') THEN
    ALTER TABLE public.automation_executions RENAME TO bb_automation_executions;
  END IF;

  -- Documents / Knowledge
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='documents') THEN
    ALTER TABLE public.documents RENAME TO bb_documents;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='document_versions') THEN
    ALTER TABLE public.document_versions RENAME TO bb_document_versions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='document_views') THEN
    ALTER TABLE public.document_views RENAME TO bb_document_views;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='document_analysis') THEN
    ALTER TABLE public.document_analysis RENAME TO bb_document_analysis;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='document_extracted_data') THEN
    ALTER TABLE public.document_extracted_data RENAME TO bb_document_extracted_data;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='document_processing_queue') THEN
    ALTER TABLE public.document_processing_queue RENAME TO bb_document_processing_queue;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='document_processing_history') THEN
    ALTER TABLE public.document_processing_history RENAME TO bb_document_processing_history;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='knowledge_documents') THEN
    ALTER TABLE public.knowledge_documents RENAME TO bb_knowledge_documents;
  END IF;

  -- AI / Copilot
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='copilot_conversations') THEN
    ALTER TABLE public.copilot_conversations RENAME TO bb_copilot_conversations;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='copilot_messages') THEN
    ALTER TABLE public.copilot_messages RENAME TO bb_copilot_messages;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='copilot_suggestions') THEN
    ALTER TABLE public.copilot_suggestions RENAME TO bb_copilot_suggestions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='agent_actions') THEN
    ALTER TABLE public.agent_actions RENAME TO bb_agent_actions;
  END IF;

  -- Analytics / Signals
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='activity_events') THEN
    ALTER TABLE public.activity_events RENAME TO bb_activity_events;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='activity_logs') THEN
    ALTER TABLE public.activity_logs RENAME TO bb_activity_logs;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='aggregated_metrics') THEN
    ALTER TABLE public.aggregated_metrics RENAME TO bb_aggregated_metrics;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='data_signals') THEN
    ALTER TABLE public.data_signals RENAME TO bb_data_signals;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_signals') THEN
    ALTER TABLE public.market_signals RENAME TO bb_market_signals;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_signal_scores') THEN
    ALTER TABLE public.market_signal_scores RENAME TO bb_market_signal_scores;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_opportunities') THEN
    ALTER TABLE public.market_opportunities RENAME TO bb_market_opportunities;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='system_events') THEN
    ALTER TABLE public.system_events RENAME TO bb_system_events;
  END IF;

  -- Integrations / Connectors
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='integrations') THEN
    ALTER TABLE public.integrations RENAME TO bb_integrations;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='connectors') THEN
    ALTER TABLE public.connectors RENAME TO bb_connectors;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='connector_providers') THEN
    ALTER TABLE public.connector_providers RENAME TO bb_connector_providers;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='connector_events') THEN
    ALTER TABLE public.connector_events RENAME TO bb_connector_events;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='connector_sync_logs') THEN
    ALTER TABLE public.connector_sync_logs RENAME TO bb_connector_sync_logs;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='connector_data_mappings') THEN
    ALTER TABLE public.connector_data_mappings RENAME TO bb_connector_data_mappings;
  END IF;

  -- Marketplace / Plugins
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='plugins') THEN
    ALTER TABLE public.plugins RENAME TO bb_plugins;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='plugin_stats') THEN
    ALTER TABLE public.plugin_stats RENAME TO bb_plugin_stats;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='plugin_activity_log') THEN
    ALTER TABLE public.plugin_activity_log RENAME TO bb_plugin_activity_log;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='marketplace_items') THEN
    ALTER TABLE public.marketplace_items RENAME TO bb_marketplace_items;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='marketplace_installs') THEN
    ALTER TABLE public.marketplace_installs RENAME TO bb_marketplace_installs;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='marketplace_reviews') THEN
    ALTER TABLE public.marketplace_reviews RENAME TO bb_marketplace_reviews;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='marketplace_featured') THEN
    ALTER TABLE public.marketplace_featured RENAME TO bb_marketplace_featured;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='marketplace_trending') THEN
    ALTER TABLE public.marketplace_trending RENAME TO bb_marketplace_trending;
  END IF;

  -- Messaging / Threads
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='message_threads') THEN
    ALTER TABLE public.message_threads RENAME TO bb_message_threads;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='thread_messages') THEN
    ALTER TABLE public.thread_messages RENAME TO bb_thread_messages;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='thread_participants') THEN
    ALTER TABLE public.thread_participants RENAME TO bb_thread_participants;
  END IF;

  -- Onboarding
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='onboarding_responses') THEN
    ALTER TABLE public.onboarding_responses RENAME TO bb_onboarding_responses;
  END IF;

  -- Pricing (new tables)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='pricing_models') THEN
    ALTER TABLE public.pricing_models RENAME TO bb_pricing_models;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='pricing_templates') THEN
    ALTER TABLE public.pricing_templates RENAME TO bb_pricing_templates;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='token_usage_logs') THEN
    ALTER TABLE public.token_usage_logs RENAME TO bb_token_usage_logs;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='platform_cost_events') THEN
    ALTER TABLE public.platform_cost_events RENAME TO bb_platform_cost_events;
  END IF;

END $$;
