/*
  # Fix RLS Performance Issues - Part 4

  Optimizes RLS policies for:
  - knowledge_documents, document_views
  - copilot_conversations, copilot_messages, copilot_suggestions
  - system_events, activity_logs, aggregated_metrics
  - data_signals, notifications
  - connector_sync_logs, connector_events, connector_data_mappings
  
  Wraps auth.uid() in SELECT subqueries for per-query caching.
*/

-- ============================================================================
-- KNOWLEDGE BASE
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can view all documents" ON public.knowledge_documents;
CREATE POLICY "Internal staff can view all documents"
  ON public.knowledge_documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Clients can view client and public documents" ON public.knowledge_documents;
CREATE POLICY "Clients can view client and public documents"
  ON public.knowledge_documents FOR SELECT TO authenticated
  USING (visibility IN ('public', 'client'));

DROP POLICY IF EXISTS "Internal staff can manage documents" ON public.knowledge_documents;
CREATE POLICY "Internal staff can manage documents"
  ON public.knowledge_documents FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Users can view their own document views" ON public.document_views;
CREATE POLICY "Users can view their own document views"
  ON public.document_views FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can log document views" ON public.document_views;
CREATE POLICY "Users can log document views"
  ON public.document_views FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Internal staff can view all document views" ON public.document_views;
CREATE POLICY "Internal staff can view all document views"
  ON public.document_views FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- ============================================================================
-- COPILOT
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own conversations" ON public.copilot_conversations;
CREATE POLICY "Users can view own conversations"
  ON public.copilot_conversations FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create conversations" ON public.copilot_conversations;
CREATE POLICY "Users can create conversations"
  ON public.copilot_conversations FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own conversations" ON public.copilot_conversations;
CREATE POLICY "Users can update own conversations"
  ON public.copilot_conversations FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.copilot_conversations;
CREATE POLICY "Users can delete own conversations"
  ON public.copilot_conversations FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.copilot_messages;
CREATE POLICY "Users can view messages in their conversations"
  ON public.copilot_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.copilot_conversations
      WHERE copilot_conversations.id = copilot_messages.conversation_id
      AND copilot_conversations.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.copilot_messages;
CREATE POLICY "Users can create messages in their conversations"
  ON public.copilot_messages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.copilot_conversations
      WHERE copilot_conversations.id = copilot_messages.conversation_id
      AND copilot_conversations.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view suggestions for their organization" ON public.copilot_suggestions;
CREATE POLICY "Users can view suggestions for their organization"
  ON public.copilot_suggestions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = copilot_suggestions.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create suggestions" ON public.copilot_suggestions;
CREATE POLICY "Users can create suggestions"
  ON public.copilot_suggestions FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own suggestions" ON public.copilot_suggestions;
CREATE POLICY "Users can update own suggestions"
  ON public.copilot_suggestions FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own suggestions" ON public.copilot_suggestions;
CREATE POLICY "Users can delete own suggestions"
  ON public.copilot_suggestions FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- SYSTEM EVENTS & LOGS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own organization events" ON public.system_events;
CREATE POLICY "Users can view own organization events"
  ON public.system_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = system_events.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view own activity logs"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = activity_logs.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;
CREATE POLICY "Users can insert own activity logs"
  ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own organization metrics" ON public.aggregated_metrics;
CREATE POLICY "Users can view own organization metrics"
  ON public.aggregated_metrics FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = aggregated_metrics.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own organization signals" ON public.data_signals;
CREATE POLICY "Users can view own organization signals"
  ON public.data_signals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = data_signals.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own organization signals" ON public.data_signals;
CREATE POLICY "Users can update own organization signals"
  ON public.data_signals FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = data_signals.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = data_signals.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- CONNECTORS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view sync logs in their organization" ON public.connector_sync_logs;
CREATE POLICY "Users can view sync logs in their organization"
  ON public.connector_sync_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.connectors
      JOIN public.organization_memberships ON organization_memberships.organization_id = connectors.organization_id
      WHERE connectors.id = connector_sync_logs.connector_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can create sync logs" ON public.connector_sync_logs;
CREATE POLICY "System can create sync logs"
  ON public.connector_sync_logs FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view events in their organization" ON public.connector_events;
CREATE POLICY "Users can view events in their organization"
  ON public.connector_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.connectors
      JOIN public.organization_memberships ON organization_memberships.organization_id = connectors.organization_id
      WHERE connectors.id = connector_events.connector_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can create events" ON public.connector_events;
CREATE POLICY "System can create events"
  ON public.connector_events FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view mappings in their organization" ON public.connector_data_mappings;
CREATE POLICY "Users can view mappings in their organization"
  ON public.connector_data_mappings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.connectors
      JOIN public.organization_memberships ON organization_memberships.organization_id = connectors.organization_id
      WHERE connectors.id = connector_data_mappings.connector_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage mappings" ON public.connector_data_mappings;
CREATE POLICY "Admins can manage mappings"
  ON public.connector_data_mappings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );
