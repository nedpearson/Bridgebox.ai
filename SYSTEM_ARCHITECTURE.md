# Bridgebox Platform Architecture

## System Overview

Bridgebox is a comprehensive software company operating system that unifies sales, delivery, client management, billing, and executive intelligence into a cohesive premium platform.

## Core System Components

### 1. Lead & CRM System
**Location:** `/app/leads`, `/app/pipeline`

**Purpose:** Capture, qualify, and convert leads into clients

**Key Features:**
- Lead capture with enriched data
- Pipeline visualization
- Service type categorization
- Lead scoring and qualification
- Conversion to client organizations

**Database Tables:**
- `leads` - Lead records with contact and service information
- Connected to `organizations` via `organization_id`

**Status Flow:**
```
new → contacted → qualified → proposal_sent → converted / lost
```

---

### 2. Proposal System
**Location:** `/app/proposals`, `/proposal/:token`

**Purpose:** Create, send, and approve client proposals

**Key Features:**
- Proposal builder with deliverables, timeline, pricing
- Multiple pricing models (fixed, milestone, retainer, enterprise)
- Client-facing approval interface with e-signature
- Automatic conversion to projects on approval
- Share token for secure external access

**Database Tables:**
- `proposals` - Proposal records
- `proposal_approvals` - Approval tracking with signatory info

**Status Flow:**
```
draft → internal_review → sent → viewed → approved / declined / expired
```

**Automation:**
- On approval: Creates project, applies template, triggers onboarding

---

### 3. Client & Organization System
**Location:** `/app/clients`

**Purpose:** Manage client organizations and relationships

**Key Features:**
- Organization management
- Team member tracking
- Subscription status monitoring
- Onboarding progress
- Client health scoring

**Database Tables:**
- `organizations` - Client and internal organizations
- `organization_members` - Team membership
- `team_invitations` - Invitation system

**Organization Types:**
- `internal` - Bridgebox team
- `client` - Client organizations

**Onboarding Status:**
```
not_started → in_progress → completed
```

---

### 4. Project & Delivery System
**Location:** `/app/projects`, `/app/delivery`

**Purpose:** Track project execution and delivery

**Key Features:**
- Project lifecycle management
- Milestone tracking
- Deliverable management
- Health status monitoring
- Risk level assessment
- Template-based project initialization

**Database Tables:**
- `projects` - Project records
- `project_delivery` - Delivery tracking
- `milestones` - Project milestones
- `deliverables` - Project deliverables

**Project Status:**
```
planning → in_progress → testing → deployed → completed / on_hold / cancelled
```

**Milestone Status:**
```
not_started → in_progress → at_risk → completed / blocked
```

**Deliverable Status:**
```
pending → in_progress → review → approved → delivered
```

**Delivery Phases:**
```
discovery → requirements → design → development → testing → deployment → maintenance
```

**Health Status:**
- `green` - On track
- `yellow` - Needs attention
- `red` - Critical issues

**Risk Levels:**
- `none` - No risk
- `low` - Minor concerns
- `medium` - Moderate risk
- `high` - Significant risk
- `critical` - Severe risk

---

### 5. Support System
**Location:** `/app/support`, `/portal/support`

**Purpose:** Handle client support requests

**Key Features:**
- Ticket creation and management
- Priority and category assignment
- Internal/client visibility
- SLA tracking
- Resolution workflow

**Database Tables:**
- `support_tickets` - Support ticket records

**Ticket Status:**
```
open → in_review / in_progress / waiting_on_client → resolved → closed
```

**Priority Levels:**
- `low` - General questions
- `normal` - Standard requests
- `high` - Important issues
- `urgent` - Critical problems

---

### 6. Billing & Revenue System
**Location:** `/app/billing`, `/portal/billing`

**Purpose:** Manage subscriptions, invoices, and revenue

**Key Features:**
- Stripe integration
- Subscription management
- Invoice tracking
- MRR calculation
- Payment status monitoring
- Billing plan management

**Database Tables:**
- `subscriptions` - Bridgebox platform subscriptions
- `stripe_subscriptions` - Stripe subscription sync
- `invoices` - Invoice records

**Subscription Status:**
- `active` - Currently active
- `trialing` - In trial period
- `past_due` - Payment overdue
- `canceled` - Subscription canceled
- `incomplete` - Setup incomplete
- `unpaid` - Payment failed

**Invoice Status:**
- `draft` - Not yet sent
- `sent` - Sent to client
- `paid` - Payment received
- `overdue` - Past due date
- `cancelled` - Invoice cancelled

---

### 7. Analytics System
**Location:** `/app/analytics`

**Purpose:** Detailed performance analytics

**Key Features:**
- Sales analytics (pipeline, conversion, win rate)
- Delivery analytics (project health, milestones)
- Billing analytics (revenue, MRR, ARR)
- Support analytics (response time, resolution)
- Client health analytics (retention, churn)
- Time-series data visualization

**Data Sources:**
- Aggregates from all system components
- Historical trend analysis
- Comparative metrics

---

### 8. Executive Command Center
**Location:** `/app/executive`

**Purpose:** Strategic leadership dashboard

**Key Features:**
- High-level KPI overview
- Sales snapshot
- Delivery snapshot
- Client health snapshot
- Billing snapshot
- Operational alerts
- Recent activity feed
- Drill-down navigation

**Access Control:**
- Restricted to internal staff (super_admin, internal_staff)
- Premium positioning in navigation

---

### 9. Onboarding System
**Location:** `/onboarding`, Internal Context

**Purpose:** Guide new clients through setup

**Key Features:**
- Multi-step onboarding flow
- Company details collection
- Service needs assessment
- Business goals capture
- Current systems inventory
- Timeline planning
- Progress tracking

**Database Tables:**
- `onboarding_responses` - Client onboarding data

---

### 10. Team & Permissions System
**Location:** `/app/team`, Context Layer

**Purpose:** Manage users and access control

**Key Features:**
- User management
- Role-based access control (RBAC)
- Team invitations
- Organization membership
- Permission validation

**User Roles:**
- `super_admin` - Full platform access
- `internal_staff` - Internal team member
- `client_admin` - Client organization admin
- `client_member` - Client team member

**Key Permissions:**
- Internal staff: Full admin panel access
- Client users: Portal access only
- Scoped access based on organization membership

---

## System Connectivity & Data Flow

### Lead to Client Journey
```
Lead Created
  ↓
Lead Qualified
  ↓
Proposal Created & Sent
  ↓
Proposal Viewed by Client
  ↓
Proposal Approved
  ↓
[AUTOMATION]
  - Organization Created/Updated
  - Project Created
  - Template Applied
  - Milestones Created
  - Deliverables Created
  - Onboarding Triggered
```

### Project Delivery Workflow
```
Project Created
  ↓
Delivery Tracking Initialized
  ↓
Milestones Scheduled
  ↓
Deliverables Defined
  ↓
Progress Updates
  ↓
Health Monitoring
  ↓
Risk Assessment
  ↓
Completion
```

### Support Workflow
```
Ticket Created (Internal/Client)
  ↓
Category & Priority Assigned
  ↓
Internal Review
  ↓
In Progress
  ↓
Resolution
  ↓
Client Confirmation
  ↓
Closed
```

### Billing Workflow
```
Subscription Created (Manual/Stripe)
  ↓
Invoice Generated
  ↓
Invoice Sent to Client
  ↓
Payment Processed
  ↓
Revenue Recorded
  ↓
MRR Updated
```

---

## Database Relationships

### Core Entity Relationships

```
organizations (1) ← (N) organization_members → (1) users
organizations (1) ← (N) leads
organizations (1) ← (N) proposals
organizations (1) ← (N) projects
organizations (1) ← (N) support_tickets
organizations (1) ← (N) subscriptions
organizations (1) ← (N) stripe_subscriptions
organizations (1) ← (N) invoices
organizations (1) ← (1) onboarding_responses

leads (1) ← (N) proposals
proposals (1) ← (N) proposal_approvals
proposals (1) ← (1) projects [converted]

projects (1) ← (1) project_delivery
projects (1) ← (N) milestones
projects (1) ← (N) deliverables
projects (1) ← (N) support_tickets

milestones (1) ← (N) deliverables [optional link]
```

---

## UI/UX Design System

### Status Badge Consistency

All status badges follow a unified design pattern:
- Rounded-full border style
- Semi-transparent background with 10% opacity
- Border with 30% opacity
- Consistent sizing (sm: xs text + 2px padding, md: sm text + 3px padding)

**Color Palette:**
- Green (#10B981): Success, completed, active, healthy
- Blue (#3B82F6): In progress, sent, neutral
- Yellow (#F59E0B): Warning, at risk, attention needed
- Red (#EF4444): Critical, blocked, urgent, declined
- Orange (#F97316): Waiting, past due
- Slate: Draft, not started, inactive
- Cyan: Viewed, in review

### Card System
- Glass morphism effect
- Consistent padding (p-6)
- Hover states with border transitions
- Clickable cards link to detail views

### Navigation Structure
- Internal Staff: Sidebar with Executive, Sales, Delivery, Management sections
- Client Users: Portal navigation with limited views
- Role-based menu item visibility

---

## Security & Access Control

### Row Level Security (RLS)
All tables have RLS enabled with restrictive policies:
- Internal staff can access all records
- Clients can only access their organization's data
- Authentication required for all operations

### Permission Scoping
- Organization-based data isolation
- Role-based feature access
- Route-level protection with guards
- API-level permission checks

### Proposal Security
- Share tokens for external access
- Time-limited validity
- View tracking
- Approval authentication

---

## Workflow Automation

### Automated Conversions
**convertProposalToProject:**
- Creates project from approved proposal
- Applies appropriate template
- Generates milestones and deliverables
- Updates onboarding status
- Prevents duplicate conversions

**convertLeadToClient:**
- Creates organization from lead
- Prevents duplicates
- Links lead to organization
- Initializes onboarding

### Project Templates
Template types:
- `custom_software` - Full custom development
- `dashboard` - Analytics/BI dashboards
- `mobile_app` - Mobile applications
- `ai_automation` - AI/automation projects
- `integration` - System integrations
- `retainer` - Ongoing support

Each template includes:
- Default delivery phase
- Suggested milestones
- Default deliverables
- Timeline estimates

---

## Analytics & Reporting

### Executive Metrics
- MRR (Monthly Recurring Revenue)
- Active clients count
- Open opportunities
- Active projects
- Support health (open tickets, urgent count, avg resolution time)
- Onboarding completion percentage

### Sales Metrics
- Pipeline value
- Proposals pending
- Win rate
- Conversion rate
- Top service types
- Lead velocity

### Delivery Metrics
- Projects by phase
- Projects at risk
- Upcoming milestones
- Delivery workload distribution
- Health status distribution

### Client Health Metrics
- Active accounts
- Retention rate
- Incomplete onboarding count
- Support escalations
- Risk accounts

### Billing Metrics
- Total revenue
- Platform revenue (subscriptions)
- Custom revenue (projects)
- Invoices due
- Outstanding issues
- Subscription mix

---

## Responsive Design

### Breakpoints
- Mobile: Default single column
- Tablet (md): 2-3 column grids
- Desktop (lg): 3-6 column grids
- Adaptive padding and spacing

### Mobile Optimizations
- Reduced padding on small screens
- Stacked layouts for complex dashboards
- Touch-friendly interaction targets
- Scrollable content areas

---

## Future Extensibility

### Designed for Growth
- Modular component architecture
- Separated data layer
- Type-safe interfaces
- Scalable database schema
- API-ready structure

### Integration Points
- Stripe for payments
- External CRMs (future)
- Project management tools (future)
- Communication platforms (future)

---

## Operational Maturity

Bridgebox demonstrates enterprise-grade operational maturity through:

1. **Complete Sales Cycle:** Lead capture → Qualification → Proposal → Approval → Project
2. **Automated Workflows:** Proposal approval triggers project creation and onboarding
3. **Client Self-Service:** Portal for project tracking, deliverables, support, billing
4. **Executive Intelligence:** Strategic visibility across all business functions
5. **Financial Integration:** Stripe sync, MRR tracking, invoice management
6. **Delivery Accountability:** Health tracking, risk assessment, milestone monitoring
7. **Support Infrastructure:** Prioritized ticket system with SLA awareness
8. **Security First:** RLS, role-based access, data isolation
9. **Premium UX:** Consistent design language, smooth interactions, professional polish

---

## Conclusion

Bridgebox is a production-ready, investor-grade software company operating system that provides:
- **Complete visibility** across sales, delivery, and operations
- **Automated workflows** that reduce manual overhead
- **Client empowerment** through self-service portal
- **Executive intelligence** for strategic decision-making
- **Scalable architecture** ready for growth
- **Security and compliance** built-in from the ground up

The platform is cohesive, consistent, and demonstrates the operational maturity expected of a professional software services company.
