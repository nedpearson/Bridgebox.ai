# Stripe Billing & Subscription Sync

Bridgebox implements a robust, production-ready Stripe billing integration with reliable customer and subscription sync at the organization level.

## Architecture Overview

### Design Principles

1. **Organization-Level Billing** - All billing is tied to organizations, not individual users
2. **Reliable Sync** - Database triggers keep organization state in sync with Stripe data
3. **Webhook-Ready** - Architecture prepared for real-time webhook updates
4. **No Duplicate Customers** - Prevents creating multiple Stripe customers for one organization
5. **Enterprise Path** - Clear distinction between self-serve and enterprise clients

### Data Flow

```
Stripe Customer
    ↓
Organization (stripe_customer_id)
    ↓
Stripe Subscription
    ↓
stripe_subscriptions table
    ↓ (trigger sync)
Organization fields updated
    ↓
UI reflects current state
```

## Database Schema

### Organization-Level Fields

```sql
-- Core Stripe identifiers
stripe_customer_id TEXT UNIQUE
stripe_subscription_id TEXT

-- Billing plan and status
billing_plan TEXT DEFAULT 'free'
subscription_status TEXT
billing_email TEXT

-- Subscription period tracking
subscription_current_period_start TIMESTAMPTZ
subscription_current_period_end TIMESTAMPTZ
subscription_cancel_at_period_end BOOLEAN DEFAULT false

-- Enterprise flag
is_enterprise_client BOOLEAN DEFAULT false

-- Sync metadata
billing_synced_at TIMESTAMPTZ
```

### stripe_subscriptions Table

Tracks complete Stripe subscription lifecycle:

```sql
CREATE TABLE stripe_subscriptions (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**

- `stripe_subscription_id` (unique)
- `organization_id`
- `stripe_customer_id`

### stripe_invoices Table

Stores complete invoice history:

```sql
CREATE TABLE stripe_invoices (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  amount_due INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  invoice_number TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**

- `stripe_invoice_id` (unique)
- `organization_id`
- `stripe_customer_id`

### Automatic Sync Trigger

```sql
CREATE TRIGGER trigger_sync_stripe_subscription_to_org
  AFTER INSERT OR UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_stripe_subscription_to_organization();
```

This trigger automatically updates organization fields whenever a subscription is created or updated, ensuring consistency.

## Customer Sync

### Linking Customers to Organizations

```typescript
import { linkCustomerToOrganization } from "./lib/stripe/customerSync";

await linkCustomerToOrganization(organizationId, {
  stripeCustomerId: "cus_xxx",
  email: "billing@company.com",
  metadata: {
    /* optional */
  },
});
```

**Features:**

- Prevents duplicate customer creation
- Checks if customer already linked to another org
- Updates billing email
- Records sync timestamp

### Getting Customer Info

```typescript
import { getOrganizationStripeCustomer } from "./lib/stripe/customerSync";

const { customerId } = await getOrganizationStripeCustomer(organizationId);
```

## Subscription Management

### Subscription Status

Supported statuses (matches Stripe):

- `active` - Subscription is active and current
- `trialing` - In trial period
- `past_due` - Payment failed, retrying
- `canceled` - Subscription canceled
- `incomplete` - Awaiting payment confirmation
- `incomplete_expired` - Payment not completed in time
- `unpaid` - Payment failed after retries
- `paused` - Temporarily paused

### Syncing Subscriptions

```typescript
import { syncSubscription } from "./lib/stripe/customerSync";

await syncSubscription(organizationId, {
  stripeSubscriptionId: "sub_xxx",
  stripeCustomerId: "cus_xxx",
  status: "active",
  plan: "professional",
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(),
  cancelAtPeriodEnd: false,
  metadata: {},
});
```

**What Happens:**

1. Upserts to `stripe_subscriptions` table
2. Trigger automatically syncs to `organizations` table
3. Updates: status, plan, period dates, cancellation flag
4. Sets `billing_synced_at` timestamp

### Getting Subscription Data

```typescript
import { getOrganizationSubscription } from "./lib/stripe/customerSync";

const { subscription, error } =
  await getOrganizationSubscription(organizationId);

if (subscription) {
  console.log("Plan:", subscription.plan);
  console.log("Status:", subscription.status);
  console.log("Renews:", subscription.current_period_end);
}
```

### Checking Active Status

```typescript
import { hasActiveSubscription } from "./lib/stripe/customerSync";

const isActive = await hasActiveSubscription(organizationId);

// Enterprise clients always return true
// Self-serve checks for 'active' or 'trialing' status
```

## Invoice Management

### Syncing Invoices

```typescript
import { syncInvoice } from "./lib/stripe/customerSync";

await syncInvoice(organizationId, {
  stripeInvoiceId: "in_xxx",
  stripeCustomerId: "cus_xxx",
  stripeSubscriptionId: "sub_xxx",
  status: "paid",
  amountDue: 4900, // cents
  amountPaid: 4900,
  currency: "usd",
  invoicePdf: "https://...",
  hostedInvoiceUrl: "https://...",
  invoiceNumber: "ABC-001",
  periodStart: new Date(),
  periodEnd: new Date(),
  paidAt: new Date(),
});
```

### Getting Invoice History

```typescript
import { getOrganizationInvoices } from "./lib/stripe/customerSync";

const { invoices, error } = await getOrganizationInvoices(organizationId);

invoices.forEach((invoice) => {
  console.log(`${invoice.invoice_number}: $${invoice.amount_due / 100}`);
});
```

## UI Components

### Subscription Status Badge

```typescript
import SubscriptionStatusBadge from './components/billing/SubscriptionStatusBadge';

<SubscriptionStatusBadge
  status="active"
  size="md"
  showDescription={false}
/>
```

**Features:**

- Color-coded by status (green, blue, yellow, red, gray)
- Responsive sizing (sm, md, lg)
- Optional description tooltip
- Consistent with design system

### Billing Plan Badge

```typescript
import BillingPlanBadge from './components/billing/BillingPlanBadge';

<BillingPlanBadge
  plan="professional"
  size="md"
  isEnterprise={false}
/>
```

**Features:**

- Displays plan name (Free, Starter, Professional, Enterprise, Custom)
- Special handling for enterprise clients
- Color-coded by tier
- Responsive sizing

## Billing UI

### BillingOverview Page

Location: `/app/billing`

**Displays:**

1. **Current Subscription Card**
   - Plan badge
   - Status badge
   - Current billing period
   - Renewal status (auto-renew or canceling)
   - Enterprise client indicator

2. **Subscription Details** (if active)
   - Next billing date
   - Renewal date
   - Started date

3. **Recent Invoices**
   - Invoice number
   - Status badge
   - Period covered
   - Due date / paid date
   - Amount
   - Download links (PDF + hosted URL)

4. **Upgrade Options** (if applicable)
   - Available plan upgrades
   - Custom quote CTA for enterprise

5. **Empty States**
   - No subscription: show plan options
   - No invoices: friendly empty state

### Data Loading

```typescript
const { subscription, error } = await getOrganizationSubscription(orgId);
const { invoices } = await getOrganizationInvoices(orgId);
```

All data flows from:

1. Organization fields (fast, always available)
2. Stripe subscription table (detailed history)
3. Stripe invoices table (complete billing history)

## Webhook Integration

### Webhook Handler Scaffold

Location: `src/lib/stripe/webhookHandlers.ts`

**Supported Events:**

1. `checkout.session.completed`
   - Links new customer to organization
   - Captures initial subscription

2. `customer.subscription.created`
   - Creates subscription record
   - Syncs to organization

3. `customer.subscription.updated`
   - Updates subscription status
   - Handles plan changes
   - Tracks cancellations

4. `customer.subscription.deleted`
   - Marks subscription as canceled
   - Preserves history

5. `invoice.paid`
   - Records successful payment
   - Stores invoice PDF links

6. `invoice.payment_failed`
   - Tracks failed payments
   - Enables retry notifications

### Implementing Webhooks

To implement as a Supabase Edge Function:

**1. Create Edge Function:**

```bash
# File: supabase/functions/stripe-webhooks/index.ts
```

**2. Verify Signature:**

```typescript
import Stripe from "https://esm.sh/stripe@12.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const signature = req.headers.get("stripe-signature");
const body = await req.text();

const event = stripe.webhooks.constructEvent(
  body,
  signature,
  Deno.env.get("STRIPE_WEBHOOK_SECRET"),
);
```

**3. Route to Handler:**

```typescript
import { handleStripeWebhook } from "./webhookHandlers";

const result = await handleStripeWebhook(event);
```

**4. Deploy:**

```bash
# Deploy function (handled by system)
```

**5. Configure Stripe:**

- Add webhook endpoint in Stripe Dashboard
- Select events to listen for
- Copy webhook signing secret to environment

### Metadata Requirements

**CRITICAL:** Always include `organization_id` in metadata:

```typescript
// When creating checkout session
const session = await stripe.checkout.sessions.create({
  customer: "cus_xxx",
  metadata: {
    organization_id: "uuid-here",
  },
  // ...
});

// When creating subscription
const subscription = await stripe.subscriptions.create({
  customer: "cus_xxx",
  metadata: {
    organization_id: "uuid-here",
  },
  // ...
});
```

Without `organization_id`, webhooks cannot sync data correctly.

## Self-Serve vs Enterprise

### Self-Serve Path

**Characteristics:**

- `is_enterprise_client = false`
- Standard pricing plans
- Stripe subscription management
- Automated billing
- Portal access via Stripe

**Flow:**

1. Choose plan on pricing page
2. Checkout via Stripe
3. Subscription created automatically
4. Access granted immediately
5. Manage via customer portal

### Enterprise Path

**Characteristics:**

- `is_enterprise_client = true`
- Custom pricing/proposals
- Manual billing (invoices)
- Dedicated support
- Custom contract terms

**Flow:**

1. Request custom quote
2. Sales process / proposal approval
3. Admin marks as enterprise client
4. Full platform access granted
5. Invoices managed separately (not Stripe subscriptions)

### Checking Client Type

```typescript
if (organization.is_enterprise_client) {
  // Enterprise client
  // - Always has access
  // - No subscription checks
  // - Custom billing handled separately
} else {
  // Self-serve client
  // - Check subscription status
  // - Enforce plan limits
  // - Stripe billing applies
}
```

## Security & RLS

### Row Level Security

**stripe_subscriptions:**

- ✓ Organization members can view their subscription
- ✓ Only internal staff can insert/update
- ✗ Public cannot access

**stripe_invoices:**

- ✓ Organization members can view their invoices
- ✓ Only internal staff can insert/update
- ✗ Public cannot access

**organizations (billing fields):**

- ✓ Organization members can view billing info
- ✓ Owners can update billing email
- ✓ Only internal staff can modify Stripe IDs
- ✗ Cannot view other org's billing data

### API Security

All sync functions require:

- Valid organization ID
- Authenticated user (for UI calls)
- Internal staff role (for modifications)

Webhook handler uses:

- Stripe signature verification
- Service role access (bypasses RLS)
- Event validation

## Error Handling

### Missing Customer

```typescript
const { customerId, error } = await getOrganizationStripeCustomer(orgId);

if (!customerId) {
  // Organization not linked to Stripe customer yet
  // Show "Subscribe" or "Link Account" flow
}
```

### Failed Sync

```typescript
const { success, error } = await syncSubscription(orgId, data);

if (!success) {
  console.error("Sync failed:", error);
  // Log to error tracking
  // Retry mechanism
  // Alert admin
}
```

### Stale Data

Use `billing_synced_at` timestamp to detect stale data:

```typescript
const org = await getOrganization(orgId);

const lastSync = new Date(org.billing_synced_at);
const hoursSinceSync = (Date.now() - lastSync.getTime()) / 1000 / 60 / 60;

if (hoursSinceSync > 24) {
  // Data might be stale
  // Trigger manual sync from Stripe API
}
```

### Invoice Not Found

```typescript
const { invoices } = await getOrganizationInvoices(orgId);

if (invoices.length === 0) {
  // No invoices yet
  // Show empty state
  // Normal for new subscriptions
}
```

## Helper Functions

### Display Helpers

```typescript
import {
  getBillingPlanDisplay,
  getSubscriptionStatusInfo,
} from "./lib/stripe/customerSync";

// Plan name for UI
const planName = getBillingPlanDisplay("professional");
// => "Professional"

// Status with color and description
const statusInfo = getSubscriptionStatusInfo("active");
// => { label: 'Active', color: 'green', description: '...' }
```

### Status Checks

```typescript
// Check if subscription is active
const isActive = status === "active" || status === "trialing";

// Check if payment issue
const hasPaymentIssue = status === "past_due" || status === "unpaid";

// Check if canceled
const isCanceled = status === "canceled" || cancelAtPeriodEnd;
```

## Best Practices

### 1. Always Use Organization ID

Never tie billing to individual users:

```typescript
// ✓ Good
const subscription = await getOrganizationSubscription(orgId);

// ✗ Bad
const subscription = await getUserSubscription(userId);
```

### 2. Handle Missing Data Gracefully

```typescript
const { subscription } = await getOrganizationSubscription(orgId);

// ✓ Good - handle null
if (!subscription) {
  return <NoSubscriptionState />;
}

// ✗ Bad - will crash
return <div>{subscription.plan}</div>;
```

### 3. Sync After Stripe Operations

```typescript
// ✓ Good
const subscription = await stripe.subscriptions.create({...});
await syncSubscription(orgId, mapStripeToInternal(subscription));

// ✗ Bad - data inconsistency
const subscription = await stripe.subscriptions.create({...});
// Missing sync!
```

### 4. Use Metadata for Organization Linking

```typescript
// ✓ Good
metadata: {
  organization_id: org.id,
  organization_name: org.name
}

// ✗ Bad - no way to link back
metadata: {}
```

### 5. Distinguish Self-Serve from Enterprise

```typescript
// ✓ Good
if (org.is_enterprise_client) {
  // Custom billing logic
} else {
  // Stripe subscription logic
}

// ✗ Bad - applies subscription logic to enterprise
const hasAccess = subscription?.status === "active";
```

## Testing

### Manual Testing Checklist

- [ ] Create new organization
- [ ] Link to Stripe customer
- [ ] Create subscription (via Stripe dashboard)
- [ ] Sync subscription data
- [ ] Verify organization fields updated
- [ ] View billing page - correct plan/status shown
- [ ] Create invoice (via Stripe)
- [ ] Sync invoice data
- [ ] View billing page - invoice appears
- [ ] Update subscription status
- [ ] Verify UI reflects change
- [ ] Cancel subscription
- [ ] Verify cancellation shown correctly
- [ ] Test enterprise client flag
- [ ] Verify enterprise shows as "always active"

### Webhook Testing

Use Stripe CLI to forward events:

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhooks
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.paid
```

Verify:

- Webhook handler processes event
- Data syncs to database
- Organization fields update
- UI reflects changes

## Monitoring

### Key Metrics

1. **Sync Success Rate**
   - % of webhook events successfully processed
   - Target: >99.9%

2. **Sync Latency**
   - Time from Stripe event to database update
   - Target: <5 seconds

3. **Data Consistency**
   - % of orgs with consistent Stripe/DB state
   - Target: 100%

4. **Failed Payment Rate**
   - % of subscriptions with payment issues
   - Monitor for trends

### Logging

Log these events:

- Customer creation/linking
- Subscription sync (create/update/delete)
- Invoice sync
- Webhook processing
- Sync failures
- Data inconsistencies

## Troubleshooting

### Organization has no stripe_customer_id

**Symptom:** Cannot create subscription, no billing info

**Fix:**

```typescript
await linkCustomerToOrganization(orgId, {
  stripeCustomerId: "cus_xxx",
  email: "billing@company.com",
});
```

### Subscription status not updating

**Symptom:** UI shows old status after Stripe change

**Check:**

1. Webhook configured correctly?
2. Webhook firing? (Check Stripe dashboard)
3. Webhook handler processing? (Check logs)
4. Database trigger working? (Check directly)

**Manual Fix:**

```typescript
// Re-sync from Stripe API
const subscription = await stripe.subscriptions.retrieve("sub_xxx");
await syncSubscription(orgId, mapStripeToInternal(subscription));
```

### Invoice not appearing

**Symptom:** Invoice paid in Stripe but not shown

**Check:**

1. `invoice.paid` webhook fired?
2. organization_id in metadata?
3. Webhook handler processed event?

**Manual Fix:**

```typescript
const invoice = await stripe.invoices.retrieve("in_xxx");
await syncInvoice(orgId, mapStripeToInternal(invoice));
```

### Duplicate customer created

**Symptom:** Organization linked to wrong customer

**Prevention:**

- Always check `linkCustomerToOrganization` response
- Function prevents duplicates automatically

**Fix:**

```sql
-- Unlink incorrect customer
UPDATE organizations
SET stripe_customer_id = NULL
WHERE id = 'org-uuid';

-- Link correct customer
-- Use linkCustomerToOrganization function
```

## Summary

The Stripe billing sync system provides:

✓ Reliable organization-level billing
✓ Automatic sync via database triggers
✓ Complete subscription lifecycle tracking
✓ Full invoice history
✓ Webhook-ready architecture
✓ Enterprise client support
✓ Consistent UI state
✓ Error handling and recovery
✓ Production-ready security

This creates an enterprise-grade billing foundation that scales with Bridgebox's growth while maintaining data integrity and user experience quality.
