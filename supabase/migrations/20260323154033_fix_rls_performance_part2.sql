/*
  # Fix RLS Performance Issues - Part 2

  Optimizes RLS policies for:
  - support_tickets, ticket_comments
  - market_signals, market_opportunities, scored_opportunities
  - proposals, stripe_subscriptions, stripe_invoices
  
  Wraps auth.uid() in SELECT subqueries for per-query caching.
*/

-- ============================================================================
-- SUPPORT TICKETS & COMMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can view all tickets" ON public.support_tickets;
CREATE POLICY "Internal staff can view all tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Clients can view org tickets" ON public.support_tickets;
CREATE POLICY "Clients can view org tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = support_tickets.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = support_tickets.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can update all tickets" ON public.support_tickets;
CREATE POLICY "Internal staff can update all tickets"
  ON public.support_tickets FOR UPDATE TO authenticated
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

DROP POLICY IF EXISTS "Clients can update org tickets" ON public.support_tickets;
CREATE POLICY "Clients can update org tickets"
  ON public.support_tickets FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = support_tickets.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = support_tickets.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can delete tickets" ON public.support_tickets;
CREATE POLICY "Internal staff can delete tickets"
  ON public.support_tickets FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can view all comments" ON public.ticket_comments;
CREATE POLICY "Internal staff can view all comments"
  ON public.ticket_comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Clients can view public comments" ON public.ticket_comments;
CREATE POLICY "Clients can view public comments"
  ON public.ticket_comments FOR SELECT TO authenticated
  USING (
    is_internal = false
    AND EXISTS (
      SELECT 1 FROM public.support_tickets
      JOIN public.organization_memberships ON organization_memberships.organization_id = support_tickets.organization_id
      WHERE support_tickets.id = ticket_comments.ticket_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create comments" ON public.ticket_comments;
CREATE POLICY "Users can create comments"
  ON public.ticket_comments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      JOIN public.organization_memberships ON organization_memberships.organization_id = support_tickets.organization_id
      WHERE support_tickets.id = ticket_comments.ticket_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can update all comments" ON public.ticket_comments;
CREATE POLICY "Internal staff can update all comments"
  ON public.ticket_comments FOR UPDATE TO authenticated
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

DROP POLICY IF EXISTS "Users can update own comments" ON public.ticket_comments;
CREATE POLICY "Users can update own comments"
  ON public.ticket_comments FOR UPDATE TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Internal staff can delete comments" ON public.ticket_comments;
CREATE POLICY "Internal staff can delete comments"
  ON public.ticket_comments FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- ============================================================================
-- MARKET SIGNALS & OPPORTUNITIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view market signals in their organization" ON public.market_signals;
CREATE POLICY "Users can view market signals in their organization"
  ON public.market_signals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = market_signals.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can insert market signals" ON public.market_signals;
CREATE POLICY "Admins can insert market signals"
  ON public.market_signals FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Admins can update market signals" ON public.market_signals;
CREATE POLICY "Admins can update market signals"
  ON public.market_signals FOR UPDATE TO authenticated
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

DROP POLICY IF EXISTS "Admins can delete market signals" ON public.market_signals;
CREATE POLICY "Admins can delete market signals"
  ON public.market_signals FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Users can view signal scores in their organization" ON public.market_signal_scores;
CREATE POLICY "Users can view signal scores in their organization"
  ON public.market_signal_scores FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = market_signal_scores.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view opportunities in their organization" ON public.market_opportunities;
CREATE POLICY "Users can view opportunities in their organization"
  ON public.market_opportunities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = market_opportunities.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can insert opportunities" ON public.market_opportunities;
CREATE POLICY "Members can insert opportunities"
  ON public.market_opportunities FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = market_opportunities.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can update opportunities" ON public.market_opportunities;
CREATE POLICY "Members can update opportunities"
  ON public.market_opportunities FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = market_opportunities.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = market_opportunities.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete opportunities" ON public.market_opportunities;
CREATE POLICY "Admins can delete opportunities"
  ON public.market_opportunities FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Users can view opportunities in their organization" ON public.scored_opportunities;
CREATE POLICY "Users can view opportunities in their organization"
  ON public.scored_opportunities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = scored_opportunities.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can insert opportunities" ON public.scored_opportunities;
CREATE POLICY "Internal staff can insert opportunities"
  ON public.scored_opportunities FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can update opportunities" ON public.scored_opportunities;
CREATE POLICY "Internal staff can update opportunities"
  ON public.scored_opportunities FOR UPDATE TO authenticated
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

DROP POLICY IF EXISTS "Internal staff can delete opportunities" ON public.scored_opportunities;
CREATE POLICY "Internal staff can delete opportunities"
  ON public.scored_opportunities FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- ============================================================================
-- PROPOSALS
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can view all proposals" ON public.proposals;
CREATE POLICY "Internal staff can view all proposals"
  ON public.proposals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Client admins can view org proposals" ON public.proposals;
CREATE POLICY "Client admins can view org proposals"
  ON public.proposals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = proposals.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can create proposals" ON public.proposals;
CREATE POLICY "Internal staff can create proposals"
  ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can update all proposals" ON public.proposals;
CREATE POLICY "Internal staff can update all proposals"
  ON public.proposals FOR UPDATE TO authenticated
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

DROP POLICY IF EXISTS "Internal staff can delete proposals" ON public.proposals;
CREATE POLICY "Internal staff can delete proposals"
  ON public.proposals FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- ============================================================================
-- STRIPE SUBSCRIPTIONS & INVOICES
-- ============================================================================

DROP POLICY IF EXISTS "Organization members can view stripe subscription" ON public.stripe_subscriptions;
CREATE POLICY "Organization members can view stripe subscription"
  ON public.stripe_subscriptions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = stripe_subscriptions.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage stripe subscriptions" ON public.stripe_subscriptions;
CREATE POLICY "Internal staff can manage stripe subscriptions"
  ON public.stripe_subscriptions FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Organization members can view stripe invoices" ON public.stripe_invoices;
CREATE POLICY "Organization members can view stripe invoices"
  ON public.stripe_invoices FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = stripe_invoices.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage stripe invoices" ON public.stripe_invoices;
CREATE POLICY "Internal staff can manage stripe invoices"
  ON public.stripe_invoices FOR ALL TO authenticated
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
