export type ConnectorType =
  | "crm"
  | "accounting"
  | "spreadsheet"
  | "helpdesk"
  | "database"
  | "payment"
  | "invoice"
  | "subscription"
  | "email"
  | "calendar"
  | "messaging"
  | "market_data"
  | "trend_source"
  | "public_dataset"
  | "demand_signal"
  | "industry_signal";

export type ConnectorCategory =
  | "business_systems"
  | "commerce_financial"
  | "communication"
  | "market_data";

export type ConnectorStatus =
  | "not_connected"
  | "connected"
  | "syncing"
  | "error"
  | "paused";

export type SyncFrequency =
  | "realtime"
  | "hourly"
  | "daily"
  | "weekly"
  | "manual";

export interface ConnectorMetadata {
  version?: string;
  apiUrl?: string;
  webhookUrl?: string;
  features?: string[];
  capabilities?: string[];
  limits?: {
    rateLimit?: number;
    recordLimit?: number;
    apiCalls?: number;
  };
  [key: string]: any;
}

export interface ConnectorConfig {
  autoSync?: boolean;
  syncFrequency?: SyncFrequency;
  fields?: string[];
  filters?: Record<string, any>;
  mappings?: Record<string, string>;
  options?: Record<string, any>;
  credentials?: Record<string, any>;
  mapping_config?: Record<string, any>;
  storeData?: boolean;
}

export interface ConnectorAuth {
  type: "oauth2" | "api_key" | "basic" | "bearer" | "none";
  isAuthenticated: boolean;
  expiresAt?: string;
  scopes?: string[];
}

export interface Connector {
  id: string;
  organizationId: string;
  providerId: string;
  providerName: string;
  type: ConnectorType;
  category: ConnectorCategory;
  status: ConnectorStatus;
  auth: ConnectorAuth;
  config: ConnectorConfig;
  metadata: ConnectorMetadata;
  lastSyncAt?: string;
  lastSyncStatus?: "success" | "error" | "partial";
  lastSyncError?: string;
  nextSyncAt?: string;
  syncCount?: number;
  recordCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorProvider {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: ConnectorType;
  category: ConnectorCategory;
  logo?: string;
  website?: string;
  documentationUrl?: string;
  icon_url?: string;
  config_schema?: Record<string, any>;
  authType: ConnectorAuth["type"];
  requiredScopes?: string[];
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
  status: "available" | "beta" | "coming_soon" | "import_only";
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped?: number;
  recordsFailed: number;
  errors?: Array<{
    record?: any;
    error: string;
  }>;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
  nextSyncAt?: string;
}

export interface ConnectorHealth {
  connectorId: string;
  status: ConnectorStatus;
  isHealthy: boolean;
  uptime: number;
  successRate: number;
  averageSyncDuration: number;
  lastError?: string;
  lastErrorAt?: string;
  warnings: string[];
  recommendations: string[];
}

export interface ExternalData {
  sourceId: string;
  sourceType: string;
  rawData: any;
  normalizedData?: any;
  metadata?: Record<string, any>;
  fetchedAt: string;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
  required?: boolean;
  defaultValue?: any;
}

export interface ConnectorCapability {
  id: string;
  name: string;
  description: string;
  requiredAuth?: string[];
  supportedOperations: Array<"read" | "write" | "update" | "delete">;
}

export interface ConnectorEvent {
  id: string;
  connectorId: string;
  type:
    | "connected"
    | "disconnected"
    | "sync_started"
    | "sync_completed"
    | "sync_failed"
    | "error"
    | "warning";
  message: string;
  data?: any;
  createdAt: string;
}

export interface ConnectorStats {
  totalConnectors: number;
  activeConnectors: number;
  syncingConnectors: number;
  errorConnectors: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalRecordsProcessed: number;
  averageSyncDuration: number;
  lastSyncAt?: string;
}

export interface NormalizedRecord {
  externalId: string;
  type: string;
  data: Record<string, any>;
  metadata: {
    source: string;
    connectorId: string;
    syncedAt: string;
    version?: string;
  };
}

export interface ConnectorWebhook {
  id: string;
  connectorId: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
}
