// @ts-nocheck
import { ConnectorRegistry } from '../core/ConnectorRegistry';
import { GoogleConnector } from '../providers/GoogleConnector';
import { StripeConnector } from '../providers/StripeConnector';
import { CustomAPIConnector } from '../providers/CustomAPIConnector';
import { CSVConnector } from '../providers/CSVConnector';
import { MockConnector } from '../providers/MockConnector';
import { TramsConnector } from '../providers/TramsConnector';
import { ClientBaseConnector } from '../providers/ClientBaseConnector';
import { HelgaConnector } from '../providers/HelgaConnector';
import type { ConnectorProvider } from '../types';

const PROVIDERS: ConnectorProvider[] = [
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Connect Google Drive, Calendar, and Sheets',
    category: 'productivity',
    icon_url: 'https://www.google.com/favicon.ico',
    auth_type: 'oauth2',
    status: 'available',
    capabilities: ['read', 'sync'],
    isPopular: true,
    config_schema: {
      scopes: {
        type: 'array',
        label: 'Scopes',
        description: 'Google API scopes to request',
        required: true,
        options: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly'
        ]
      }
    }
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Sync customers, invoices, and subscriptions',
    category: 'payment',
    icon_url: 'https://stripe.com/favicon.ico',
    auth_type: 'api_key',
    status: 'available',
    capabilities: ['read', 'sync', 'webhook'],
    isPopular: true,
    config_schema: {
      apiKey: {
        type: 'password',
        label: 'API Key',
        description: 'Stripe secret key',
        required: true
      },
      webhookSecret: {
        type: 'password',
        label: 'Webhook Secret',
        description: 'Stripe webhook signing secret',
        required: false
      }
    }
  },
  {
    id: 'custom_api',
    name: 'Custom API',
    description: 'Connect any REST API with custom mappings',
    category: 'custom',
    icon_url: '/api-icon.svg',
    auth_type: 'custom',
    status: 'available',
    capabilities: ['read', 'sync'],
    isPopular: false,
    config_schema: {
      baseURL: {
        type: 'text',
        label: 'Base URL',
        description: 'API base URL',
        required: true
      },
      authType: {
        type: 'select',
        label: 'Authentication Type',
        required: true,
        options: ['bearer', 'api_key', 'basic', 'none']
      },
      authValue: {
        type: 'password',
        label: 'Authentication Value',
        description: 'API key, bearer token, or basic auth credentials',
        required: false
      }
    }
  },
  {
    id: 'csv_import',
    name: 'CSV Import',
    description: 'Import data from CSV files',
    category: 'file',
    icon_url: '/csv-icon.svg',
    auth_type: 'none',
    status: 'available',
    capabilities: ['read'],
    isPopular: true,
    config_schema: {
      delimiter: {
        type: 'text',
        label: 'Delimiter',
        description: 'CSV delimiter character',
        required: false,
        defaultValue: ','
      },
      hasHeader: {
        type: 'boolean',
        label: 'Has Header Row',
        description: 'First row contains column names',
        required: false,
        defaultValue: true
      }
    }
  },
  {
    id: 'mock',
    name: 'Mock Connector',
    description: 'Testing connector with sample data',
    category: 'development',
    icon_url: '/mock-icon.svg',
    auth_type: 'none',
    status: 'available',
    capabilities: ['read', 'write', 'sync'],
    isPopular: false,
    config_schema: {}
  },
  {
    id: 'trams_back_office',
    name: 'TRAMS Back Office',
    description: 'Import travel ops, accounting, and supplier balances',
    category: 'business_systems',
    icon_url: '/database-icon.svg',
    auth_type: 'none',
    status: 'import_only',
    capabilities: ['read'],
    isPopular: false,
    config_schema: {
      importMode: {
        type: 'select',
        label: 'Import Mode',
        required: true,
        options: ['csv', 'api_beta'],
        defaultValue: 'csv'
      }
    }
  },
  {
    id: 'clientbase_us',
    name: 'ClientBase.us',
    description: 'CRM sync for travel clients, opportunities, and tasks',
    category: 'business_systems',
    icon_url: '/crm-icon.svg',
    auth_type: 'api_key',
    status: 'beta',
    capabilities: ['read', 'sync'],
    isPopular: false,
    config_schema: {
      apiKey: {
        type: 'password',
        label: 'API Key',
        description: 'ClientBase API Token',
        required: true
      }
    }
  },
  {
    id: 'helga',
    name: 'HELGA',
    description: 'Logistics ops, courier manifests, and tariffs import',
    category: 'business_systems',
    icon_url: '/database-icon.svg',
    auth_type: 'none',
    status: 'import_only',
    capabilities: ['read'],
    isPopular: false,
    config_schema: {
      importMode: {
        type: 'select',
        label: 'Import Mode',
        required: true,
        options: ['csv', 'api_beta'],
        defaultValue: 'csv'
      }
    }
  }
];

export function initializeConnectors(): void {
  PROVIDERS.forEach(provider => {
    ConnectorRegistry.registerProvider(provider);
  });

  ConnectorRegistry.registerImplementation('google', GoogleConnector as any);
  ConnectorRegistry.registerImplementation('stripe', StripeConnector as any);
  ConnectorRegistry.registerImplementation('custom_api', CustomAPIConnector as any);
  ConnectorRegistry.registerImplementation('csv_import', CSVConnector as any);
  ConnectorRegistry.registerImplementation('mock', MockConnector as any);
  ConnectorRegistry.registerImplementation('trams_back_office', TramsConnector as any);
  ConnectorRegistry.registerImplementation('clientbase_us', ClientBaseConnector as any);
  ConnectorRegistry.registerImplementation('helga', HelgaConnector as any);
}

export function getConnectorProviders(): ConnectorProvider[] {
  return PROVIDERS;
}
