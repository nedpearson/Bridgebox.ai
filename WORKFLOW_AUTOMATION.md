# Workflow Automation System

Bridgebox implements intelligent workflow automation to reduce manual work and accelerate the path from lead to active project.

## Overview

The workflow automation system connects:

- **Lead Management** → Track and qualify opportunities
- **Proposals** → Create and send proposals
- **Project Creation** → Automatically generate projects from won proposals
- **Onboarding** → Guide new clients through setup
- **Delivery Management** → Track execution with templates

## Automated Conversion Flow

### 1. Proposal Approved → Project Created

When a proposal status changes to "approved":

**User Action:**

- Click "Convert to Project" button on proposal detail page

**System Actions:**

1. Creates a new project record linked to the proposal
2. Determines project type from service types
3. Applies appropriate project template
4. Creates delivery tracking record
5. Generates suggested milestones
6. Creates default deliverables
7. Sets onboarding status to "in_progress"
8. Marks proposal as converted

**Result:**

- Fully configured project with delivery tracking
- Pre-populated milestones based on project type
- Ready-to-use deliverables list
- Clear next steps for team

### 2. Project Templates

Six pre-configured templates available:

#### **Custom Software Development**

- 6 milestones from discovery to deployment
- Deliverables: Technical specs, UI/UX design, source code, API docs, production app
- Estimated timeline: 3-6 months
- Default phase: Discovery

#### **Dashboard & Analytics**

- 6 milestones from data mapping to launch
- Deliverables: Metrics definition, dashboard UI, live application, training materials
- Estimated timeline: 2-4 months
- Default phase: Planning

#### **Mobile App Development**

- 6 milestones from product definition to app store launch
- Deliverables: Mobile design, iOS app, Android app, store assets, backend API
- Estimated timeline: 3-5 months
- Default phase: Design

#### **AI & Automation**

- 6 milestones from process analysis to production deployment
- Deliverables: Process automation map, AI model config, automation platform, metrics dashboard
- Estimated timeline: 2-4 months
- Default phase: Discovery

#### **Enterprise Integration**

- 5 milestones from integration mapping to production cutover
- Deliverables: Integration architecture, API endpoints, monitoring dashboard, runbook
- Estimated timeline: 1-3 months
- Default phase: Planning

#### **Support & Retainer**

- Recurring monthly milestones
- Deliverables: Monthly status report, bug fixes, feature enhancements
- Estimated timeline: Ongoing
- Default phase: Support

## Data Model Relationships

### Database Schema Additions

```sql
-- Proposals
proposals.converted_to_project (boolean)
proposals.converted_at (timestamp)

-- Projects
projects.proposal_id (uuid) -- Link back to originating proposal
projects.source (text) -- 'proposal_conversion' or 'manual'
projects.template_applied (boolean)

-- Organizations
organizations.onboarding_status (enum: not_started, in_progress, completed, skipped)
organizations.onboarding_completed_at (timestamp)

-- Leads
leads.converted_to_client (boolean)
leads.converted_at (timestamp)
leads.organization_id (uuid) -- Link to created organization
```

### Database Views

**proposal_pipeline**

- Combines proposals, leads, organizations, and projects
- Shows complete proposal context with relationships
- Includes onboarding status

**conversion_tracking**

- Full lifecycle view from lead to project
- Tracks conversion timestamps
- Monitors onboarding progress
- Identifies source attribution

## User Interface Enhancements

### Conversion Status Component

Shows relationship breadcrumbs across the lifecycle:

```
Lead → Proposal → Active Project [Converted]
```

Appears on:

- Proposal detail pages
- Project detail pages
- Lead detail pages (when converted)

### Conversions Dashboard (`/app/conversions`)

**Metrics Displayed:**

- Lead conversion rate (converted/total)
- Proposal success rate (approved/total)
- Projects created (total and from proposals)
- Pending onboarding count

**Conversion Timeline:**

- Chronological list of all conversions
- Links to related records (lead, proposal, project)
- Onboarding status indicators
- Quick navigation between lifecycle stages

### Proposal Detail Page

**New Actions:**

- "Convert to Project" button (appears when status = approved)
- Conversion status badge
- Link to created project (after conversion)
- Relationship breadcrumbs

## Implementation Architecture

### Core Files

**Project Templates** (`src/lib/projectTemplates.ts`)

- Defines 6 template types
- Milestone configurations
- Deliverable defaults
- Onboarding questions per template

**Workflow Automation** (`src/lib/workflowAutomation.ts`)

- `convertProposalToProject()` - Main conversion logic
- `convertLeadToClient()` - Lead conversion helper
- `completeOnboarding()` - Marks onboarding complete
- `applyProjectTemplate()` - Scaffolds project structure

**Database Service Updates**

- `onboarding.ts` - Updates organization onboarding_status
- `proposals.ts` - Tracks conversion flags
- `projects.ts` - Links to proposals

### UI Components

**ConversionStatus Component** (`src/components/ConversionStatus.tsx`)

- Shows lifecycle breadcrumbs
- Displays conversion badges
- Links between related records
- Highlights onboarding status

**Conversions Dashboard** (`src/pages/app/ConversionsDashboard.tsx`)

- Metrics overview cards
- Conversion timeline
- Quick links to records
- Analytics and insights

## Benefits

### For Internal Team

- **Reduced Manual Work:** One click to create fully configured projects
- **Consistency:** Every project follows best practices from templates
- **Visibility:** Track entire pipeline from lead to delivery
- **Traceability:** Know which projects came from which proposals/leads
- **Efficiency:** Pre-configured milestones and deliverables save hours

### For Clients

- **Faster Start:** Projects begin immediately after proposal approval
- **Transparency:** See project structure and timeline from day one
- **Guided Onboarding:** Clear onboarding flow for new clients
- **Professional Experience:** Demonstrates operational maturity

### For Business

- **Scalability:** Handle more projects without more administrative overhead
- **Data-Driven:** Track conversion rates and optimize sales process
- **Quality Control:** Templates ensure nothing is missed
- **Competitive Advantage:** Faster project kickoff than competitors

## Onboarding Integration

When a project is created from a proposal:

1. Organization `onboarding_status` is set to `in_progress`
2. Client sees onboarding banner in portal
3. Onboarding flow collects:
   - Company details
   - Services needed
   - Business goals
   - Current systems
   - Timeline expectations
4. Completion marks organization as `onboarding_status: completed`
5. Project delivery can begin with enriched context

## Future Enhancements

Potential additions to the automation system:

1. **Email Notifications**
   - Notify team when proposal converts
   - Alert client when project is ready
   - Remind about pending onboarding

2. **Slack/Teams Integration**
   - Post to channel on conversion
   - Share project kickoff details
   - Track milestone completions

3. **AI-Powered Template Selection**
   - Analyze proposal text
   - Suggest best template automatically
   - Predict timeline and budget

4. **Custom Template Builder**
   - Allow teams to create custom templates
   - Template marketplace
   - Version control for templates

5. **Advanced Analytics**
   - Conversion funnel visualization
   - Revenue attribution by source
   - Time-to-close metrics
   - Template success rates

## Technical Notes

### Transaction Safety

All conversion operations use proper database transactions to ensure data consistency. If any step fails, the entire conversion is rolled back.

### Permissions

Only `super_admin` and `internal_staff` roles can trigger proposal conversions. Clients cannot convert their own proposals.

### Idempotency

Conversion checks prevent duplicate projects. If a proposal is already converted, the system shows the existing project instead of creating a new one.

### Template Flexibility

Templates are suggestions, not requirements. Teams can modify milestones, deliverables, and phases after project creation.

## Success Metrics

Track these KPIs to measure automation success:

- **Time to Project Start:** Measure from proposal approval to first milestone
- **Template Adoption Rate:** % of projects using templates vs. manual setup
- **Onboarding Completion Rate:** % of clients completing onboarding
- **Conversion Rate:** Proposals → Projects
- **Manual Data Entry Time:** Before vs. after automation

## Strategic Impact

The workflow automation system positions Bridgebox as:

- **Operationally Mature:** Professional, scalable processes
- **Client-Focused:** Fast time-to-value
- **Data-Driven:** Full pipeline visibility
- **Efficient:** More projects with same team size
- **Competitive:** Faster than manual competitors

This automation transforms Bridgebox from a collection of tools into an intelligent operating system that guides work from opportunity to delivery.
