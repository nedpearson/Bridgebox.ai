# Bridgebox Connector Framework

## Overview

The Connector Framework provides a modular, secure system for integrating external data sources and business systems into Bridgebox. The framework is designed to be extensible, maintainable, and production-ready.

## Architecture

### Core Components

```
Connector Framework
├── Types & Interfaces (types.ts)
├── Core Architecture
│   ├── BaseConnector (abstract base class)
│   └── ConnectorRegistry (provider registry)
├── Provider Implementations
│   └── MockConnector (example implementation)
├── Services
│   ├── ConnectorService (high-level service)
│   └── Database Service (data layer)
└── UI Components
    ├── ConnectorCard
    ├── ProviderCard
    └── ConnectorStatusBadge
```

## Database Schema

### Tables

1. **connector_providers** - Registry of available integration providers
   - Global table (no RLS)
   - Seeded with 18 popular integrations
   - Categories: business_systems, commerce_financial, communication, market_data

2. **connectors** - Organization-specific connector instances
   - Organization-scoped with RLS
   - Tracks status, auth, and sync state
   - Never stores credentials (env/backend only)

3. **connector_sync_logs** - Historical sync records
   - Performance metrics and error tracking
   - Organization-scoped

4. **connector_events** - Audit trail
   - Connection, sync, and error events
   - Organization-scoped

5. **connector_data_mappings** - Field mapping configurations
   - Transform rules for data normalization
   - Organization-scoped

## Connector States

- `not_connected` - Initial state, not configured
- `connected` - Active and ready to sync
- `syncing` - Currently performing sync operation
- `error` - Failed sync or connection issue
- `paused` - Temporarily disabled by user

## Connector Categories

### Business Systems
- CRM (Salesforce, HubSpot, Pipedrive)
- Accounting (QuickBooks, Xero)
- Spreadsheets (Google Sheets)
- Databases (Airtable)
- Helpdesk (Zendesk)

### Commerce / Financial
- Payments (Stripe, PayPal, Square)
- Invoices
- Subscriptions

### Communication
- Email (Gmail, Outlook)
- Calendar (Google Calendar)
- Messaging (Slack)

### Market Data
- Trend Sources (Google Trends)
- Public Datasets (US Census Data)
- Industry Signals

## Creating a New Connector

### 1. Extend BaseConnector

```typescript
import { BaseConnector } from '../core/BaseConnector';
import type { SyncResult, ExternalData, NormalizedRecord } from '../types';

export class MyConnector extends BaseConnector {
  async connect(credentials?: Record<string, any>): Promise<boolean> {
    // Implement connection logic
    // Verify credentials
    // Store auth state
    await this.logEvent('connected', 'Connected successfully');
    return true;
  }

  async disconnect(): Promise<boolean> {
    // Implement disconnection logic
    await this.logEvent('disconnected', 'Disconnected');
    return true;
  }

  async testConnection(): Promise<boolean> {
    // Test if connection is valid
    return true;
  }

  async fetchExternalData(options?: Record<string, any>): Promise<ExternalData[]> {
    // Fetch data from external API
    // Return raw data with metadata
    return [];
  }

  async syncNow(): Promise<SyncResult> {
    const startedAt = new Date().toISOString();

    try {
      const data = await this.fetchExternalData();
      const normalized = this.normalizeData(data);

      // Process and store normalized data

      return {
        success: true,
        recordsProcessed: normalized.length,
        recordsCreated: normalized.length,
        recordsUpdated: 0,
        recordsSkipped: 0,
        recordsFailed: 0,
        duration: 1000,
        startedAt,
        completedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return this.createSyncResult(false, 0, startedAt, error.message);
    }
  }

  normalizeData(externalData: ExternalData[]): NormalizedRecord[] {
    // Transform external data to internal format
    // Apply field mappings
    // Handle data type conversions
    return externalData.map((data) => ({
      externalId: data.sourceId,
      type: this.provider.type,
      data: data.rawData,
      metadata: {
        source: this.provider.id,
        connectorId: this.connector.id,
        syncedAt: new Date().toISOString(),
      },
    }));
  }
}
```

### 2. Register the Connector

```typescript
import { ConnectorRegistry } from './core/ConnectorRegistry';
import { MyConnector } from './providers/MyConnector';

// In ConnectorService.initialize()
ConnectorRegistry.registerImplementation('my_provider_id', MyConnector);
```

### 3. Add Provider to Database

```sql
INSERT INTO connector_providers (
  id, name, display_name, description,
  connector_type, category, auth_type,
  features, is_popular, status
) VALUES (
  'my_provider',
  'my_provider',
  'My Provider',
  'Connect to My Provider for data sync',
  'crm',
  'business_systems',
  'oauth2',
  ARRAY['contacts', 'deals'],
  true,
  'available'
);
```

## Using the Connector Service

### Get All Providers

```typescript
import { connectorService } from './lib/connectors';

const providers = await connectorService.getAllProviders();
```

### Create a Connector

```typescript
const connector = await connectorService.createConnector(
  organizationId,
  providerId
);
```

### Connect a Connector

```typescript
await connectorService.connectConnector(connectorId, credentials);
```

### Sync Data

```typescript
const result = await connectorService.syncConnector(connectorId);
console.log(`Synced ${result.recordsProcessed} records`);
```

### Get Connector Health

```typescript
const health = await connectorService.getConnectorHealth(connectorId);
console.log(`Health: ${health.isHealthy}, Success Rate: ${health.successRate}%`);
```

### Get Stats

```typescript
const stats = await connectorService.getStats(organizationId);
console.log(`${stats.activeConnectors} active connectors`);
```

## Security

### Credential Storage

- Never store credentials in the database
- Use environment variables for API keys
- Implement OAuth flow for user tokens
- Store only auth status and metadata

### Row Level Security

All connector tables enforce organization-scoped RLS:
- Users can only see connectors in their organization
- Only admins can create/update/delete connectors
- Sync logs and events are organization-scoped

### Audit Trail

All connector activities are logged:
- Connection/disconnection events
- Sync start/complete/fail events
- Error events with details
- Configuration changes

## UI Components

### ConnectorCard

Displays a connected integration with:
- Provider name and status
- Last sync time
- Record count
- Actions: Sync Now, Disconnect, Delete

### ProviderCard

Displays an available integration with:
- Provider info and description
- Features list
- Connect button
- Documentation link

### ConnectorStatusBadge

Visual status indicator:
- Not Connected (gray)
- Connected (green)
- Syncing (blue)
- Error (red)
- Paused (yellow)

## Integration Page

Located at `/app/integrations`:
- Two views: Connected and Available
- Category filtering
- Search functionality
- Real-time sync status
- Connect/disconnect actions

## Future Enhancements

### Planned Features

1. **Real Connectors**
   - Implement real API integrations
   - OAuth flows for Salesforce, HubSpot, etc.
   - Webhook support for real-time sync

2. **Advanced Sync**
   - Incremental sync
   - Field-level sync control
   - Bi-directional sync
   - Conflict resolution

3. **Data Transformation**
   - Visual mapping interface
   - Custom transform functions
   - Data validation rules
   - Type conversion

4. **Monitoring**
   - Sync success/failure rates
   - Performance metrics
   - Error alerting
   - Health dashboards

5. **Automation**
   - Scheduled syncs
   - Trigger-based sync
   - Auto-retry on failure
   - Smart sync optimization

## Best Practices

1. **Error Handling**
   - Always wrap API calls in try/catch
   - Log errors with context
   - Return meaningful error messages
   - Implement retry logic for transient failures

2. **Performance**
   - Batch API requests
   - Implement rate limiting
   - Cache frequently accessed data
   - Use incremental sync when possible

3. **Data Integrity**
   - Validate data before processing
   - Handle missing/null values
   - Maintain referential integrity
   - Log all data transformations

4. **Testing**
   - Test connection logic
   - Mock external APIs
   - Test error scenarios
   - Verify data normalization

## Troubleshooting

### Connector Won't Connect

1. Check provider status in database
2. Verify credentials are valid
3. Check network connectivity
4. Review error logs in connector_events

### Sync Failures

1. Check connector status
2. Review last_sync_error field
3. Check connector_sync_logs for details
4. Verify API rate limits not exceeded

### Missing Data

1. Verify connector is connected
2. Check last sync time
3. Review field mappings
4. Check data transformation logic

## API Reference

See type definitions in `src/lib/connectors/types.ts` for complete API documentation.

## Support

For issues or questions about the connector framework:
1. Check this documentation
2. Review existing connector implementations
3. Check database schema and RLS policies
4. Review error logs and audit trail
