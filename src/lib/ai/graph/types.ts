export type NodeType = 
  | 'module'
  | 'page'
  | 'entity'
  | 'field'
  | 'action'
  | 'workflow'
  | 'status'
  | 'report'
  | 'setting'
  | 'integration'
  | 'permission';

export interface GraphNodeVisibility {
  roles?: ('super_admin' | 'tenant_admin' | 'manager' | 'agent' | 'client_admin' | 'client_user')[];
  requiresSubscription?: boolean;
  featureFlag?: string;
}

export interface NodeAction {
  id: string;
  name: string;
  description: string;
  type: 'navigation' | 'mutation' | 'modal' | 'workflow';
  targetRoute?: string;
  requiresConfirmation?: boolean;
  visibility?: GraphNodeVisibility;
}

export interface GraphNode {
  id: string;                 // Canonical ID (e.g. 'module:crm', 'page:leads_list')
  name: string;               // Human readable
  type: NodeType;
  description: string;        // Detailed explanation for the AI
  route?: string;             // Associated URL if applicable
  relatedNodes: string[];     // IDs of dependencies or related entities
  visibility: GraphNodeVisibility;
  actions: NodeAction[];
  metadata?: Record<string, any>;
  sourceOfTruth: 'static' | 'dynamic_scan' | 'admin_override';
  updatedAt: string;
}

export interface IntelligenceState {
  nodes: Record<string, GraphNode>;
  lastScanTimestamp: number;
  scanErrors: string[];
}
