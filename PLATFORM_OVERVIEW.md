# Bridgebox Platform Overview

Bridgebox is a premium software company operating system that manages the full lifecycle from lead to delivery.

## Complete Lifecycle

```
Lead → Proposal → Project → Delivery → Support → Billing
```

**Automated Workflow:** Bridgebox automatically converts approved proposals into projects with pre-configured templates, milestones, and deliverables based on service types.

## System Architecture

### 1. Sales & Marketing

- **Pipeline Management** (`/app/pipeline`)
  - Visual Kanban board for lead stages
  - Lead qualification and tracking
  - Conversion metrics

- **Lead Management** (`/app/leads`)
  - Lead capture from website forms
  - Service type categorization
  - Budget and timeline tracking
  - Lead detail views with file uploads

- **Proposals** (`/app/proposals`)
  - Create professional proposals
  - Multiple pricing models (fixed, hourly, milestone, retainer)
  - Service type selection
  - Line item management
  - Status tracking (draft, sent, accepted, rejected)
  - **One-click conversion** to active projects with templates

- **Conversions Dashboard** (`/app/conversions`)
  - Track lead-to-client conversion rates
  - Monitor proposal-to-project success
  - View complete lifecycle for each opportunity
  - Identify pending onboarding clients
  - Full traceability from lead to delivery

### 2. Client Management

- **Client Organizations** (`/app/clients`)
  - Organization profiles
  - Industry tracking
  - Multi-user team management
  - Client detail dashboards

- **Team & Invitations** (`/app/team`)
  - Role-based access control (super_admin, internal_staff, client_admin, client_member)
  - Email invitations system
  - Organization membership management
  - Invitation status tracking

### 3. Project & Delivery

- **Projects** (`/app/projects`)
  - Project creation and management
  - Progress tracking
  - Budget and contract value
  - Timeline management
  - Status tracking (planning, in_progress, on_hold, completed, cancelled)

- **Delivery OS** (`/app/delivery`)
  - Executive delivery dashboard
  - 8-phase delivery lifecycle:
    1. Discovery
    2. Planning
    3. Design
    4. Build
    5. Integration
    6. QA
    7. Deployment
    8. Support
  - Health status indicators (green, yellow, red)
  - Risk level tracking (none, low, medium, high, critical)
  - Milestone management
  - Deliverables tracking
  - Delivery notes and updates
  - Team lead assignments

### 4. Support & Service

- **Support Queue** (`/app/support`)
  - Ticket management system
  - Priority levels (low, medium, high, critical)
  - Status tracking (new, assigned, in_progress, waiting_on_client, resolved, closed)
  - Category organization
  - Internal staff view

- **Client Portal Support** (`/portal/support`)
  - Client ticket submission
  - Status updates
  - Communication thread

### 5. Financial Management

- **Billing Overview** (`/app/billing`)
  - Invoice tracking
  - Payment status
  - Revenue metrics
  - Outstanding balances

- **Client Portal Billing** (`/portal/billing`)
  - Invoice viewing
  - Payment history
  - Account balance

### 6. Integration & Operations

- **Integrations** (`/app/integrations`)
  - Third-party service connections
  - API management
  - Integration monitoring

- **Settings** (`/app/settings`)
  - User profile management
  - Organization settings
  - System preferences

## Client Portal

Dedicated portal for clients to access their projects and services:

- **Dashboard** (`/portal`) - Overview of active projects and metrics
- **Projects** (`/portal/projects`) - View project status and progress
- **Deliverables** (`/portal/deliverables`) - Access completed deliverables
- **Support** (`/portal/support`) - Submit and track support tickets
- **Billing** (`/portal/billing`) - View invoices and payment history
- **Settings** (`/portal/settings`) - Manage account preferences

## Onboarding Flow

New client onboarding process:

1. Welcome & Account Setup
2. Company Details
3. Services Needed
4. Business Goals
5. Current Systems Assessment
6. Timeline Planning
7. Review & Submit

## Authentication & Security

- Supabase email/password authentication
- Row Level Security (RLS) on all tables
- Role-based permissions system
- Organization-based data isolation
- Secure invitation system with expiration

## Database Schema

### Core Tables

- `profiles` - User profiles and roles
- `organizations` - Client organizations
- `organization_members` - Team memberships
- `invitations` - Email invitation system
- `leads` - Sales leads
- `proposals` - Client proposals
- `proposal_line_items` - Proposal details
- `projects` - Active projects
- `project_delivery` - Delivery management
- `milestones` - Project milestones
- `deliverables` - Project deliverables
- `delivery_notes` - Delivery updates
- `support_tickets` - Support system
- `ticket_messages` - Support communication
- `onboarding_data` - Client onboarding

### Enums

- `user_role` - super_admin, internal_staff, client_admin, client_member
- `project_type` - web_app, mobile_app, dashboard, api, integration
- `project_status` - planning, in_progress, on_hold, completed, cancelled
- `service_type` - platform_subscription, custom_software, dashboard_analytics, mobile_app, ai_automation, enterprise_integration, support_retainer
- `pricing_model` - fixed_price, hourly_rate, milestone_based, retainer

## Design System

### Colors

- Primary: #3B82F6 (Blue)
- Success: #10B981 (Green)
- Warning: Yellow
- Danger: Red
- Neutral: Slate grays

### Components

- Glass morphism cards
- Status badges with variants
- Phase indicators
- Health status visualizations
- Risk level badges
- Progress bars
- Premium animations with Framer Motion

## Navigation Structure

### Internal Portal (Staff)

```
Sales
├── Pipeline
├── Leads
└── Proposals

Delivery
├── Projects
├── Delivery OS
└── Support

Management
├── Overview
├── Clients
├── Integrations
├── Billing
├── Conversions
└── Team
```

### Client Portal

```
├── Home
├── Projects
├── Deliverables
├── Support
├── Billing
└── Settings
```

## Key Features

### Operational Excellence

- Complete lead-to-delivery lifecycle management
- **Automated proposal-to-project conversion**
- **Project templates with pre-configured milestones**
- Executive dashboards with KPIs
- Real-time status tracking
- Risk and health monitoring
- Team collaboration tools
- **Full conversion tracking and analytics**

### Client Experience

- Dedicated client portal
- Self-service support ticketing
- Project visibility
- Transparent billing
- Streamlined onboarding

### Scalability

- Multi-tenant architecture
- Organization-based isolation
- Role-based access control
- Invitation-based team growth
- Flexible project types

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Backend**: Supabase
- **Database**: PostgreSQL with RLS
- **Authentication**: Supabase Auth

## Strategic Positioning

Bridgebox demonstrates operational maturity and professional service delivery capabilities. The platform reinforces that the company doesn't just sell software—it has the systems and processes to deliver and support it professionally at scale.
