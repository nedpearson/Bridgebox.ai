// Enhancement status lifecycle
export type EnhancementStatus =
  | "draft"
  | "submitted"
  | "analyzing"
  | "ready_for_review"
  | "approved"
  | "rejected"
  | "ready_to_apply"
  | "applied"
  | "failed";

export type EnhancementRequestType =
  | "new_feature"
  | "feature_modification"
  | "ui_enhancement"
  | "workflow_enhancement"
  | "integration_enhancement"
  | "reusable_transplant"
  | "workspace_merge"
  | "full_software_blueprint";

export type InputMethod =
  | "voice"
  | "text"
  | "recording"
  | "screenshot"
  | "mixed";

export type MediaProcessingStatus =
  | "pending"
  | "processing"
  | "analyzed"
  | "failed"
  | "needs_correction";

export type TransferBatchStatus =
  | "draft"
  | "previewed"
  | "conflict_detected"
  | "approved"
  | "applying"
  | "applied"
  | "rolled_back"
  | "failed";

export type TransferItemStatus =
  | "pending"
  | "applied"
  | "skipped"
  | "conflict"
  | "failed";

export type TransferConflictResolution =
  | "skip"
  | "rename"
  | "overwrite"
  | "unresolved";

export type VoiceContextMode =
  | "describe_current_software"
  | "describe_feature"
  | "describe_workflow"
  | "describe_final_vision"
  | "describe_changes"
  | "describe_pain_points"
  | "free_form";

export interface EnhancementRequest {
  id: string;
  workspace_id: string;
  project_id?: string;
  created_by: string;
  updated_by?: string;
  status: EnhancementStatus;
  request_type?: EnhancementRequestType;
  input_method: InputMethod;
  title: string;
  original_prompt?: string;
  normalized_prompt?: string;
  transcript?: string;
  media_count: number;
  analysis_summary?: string;
  recommendations_json?: EnhancementRecommendations;
  dependency_summary?: string;
  conflict_summary?: string;
  approval_status?: "pending" | "approved" | "rejected";
  applied_at?: string;
  created_at: string;
  updated_at: string;
  // joined
  bb_enhancement_media?: EnhancementMedia[];
  bb_voice_sessions?: VoiceSession[];
}

export interface SideBySideComparison {
  competitor_name: string;
  competitor_url?: string;
  features: Array<{
    feature_name: string;
    competitor_implementation: string;
    bridgebox_implementation: string;
    advantage: string;
  }>;
}

export interface EnhancementRecommendations {
  business_summary: string;
  feature_list: FeatureItem[];
  workflow_breakdown: WorkflowItem[];
  ui_structure: UIStructureItem[];
  side_by_side_comparison?: SideBySideComparison;
  brand_context?: {
    target_url: string;
    primary_color: string;
    theme?: "light" | "dark";
  };
  data_model_hypothesis: DataEntityItem[];
  integration_map: IntegrationItem[];
  automation_opportunities: AutomationItem[];
  risks_and_gaps: RiskItem[];
  implementation_plan: ImplementationStep[];
  confidence_score: number;
  request_classification: EnhancementRequestType;
}

export interface FeatureItem {
  id: string;
  name: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  source: "voice" | "recording" | "screenshot" | "inferred" | "profile";
  confidence: number;
}

export interface WorkflowItem {
  id: string;
  name: string;
  steps: string[];
  trigger: string;
  outcome: string;
  automation_potential: boolean;
}

export interface UIStructureItem {
  screen_name: string;
  layout_type?: "dashboard" | "kanban" | "detail" | "table" | "generic";
  components: string[];
  interactions: string[];
  data_displayed: string[];
}

export interface DataEntityItem {
  entity: string;
  fields: string[];
  relationships: string[];
}

export interface IntegrationItem {
  system: string;
  type: string;
  data_flow: string;
  priority: "required" | "recommended" | "optional";
}

export interface AutomationItem {
  trigger: string;
  action: string;
  benefit: string;
}

export interface RiskItem {
  area: string;
  description: string;
  severity: "high" | "medium" | "low";
  mitigation: string;
}

export interface ImplementationStep {
  phase: number;
  title: string;
  description: string;
  estimated_effort: string;
  dependencies: string[];
}

export interface VoiceSession {
  id: string;
  workspace_id: string;
  enhancement_request_id?: string;
  created_by: string;
  context_mode: VoiceContextMode;
  raw_transcript: string;
  cleaned_transcript?: string;
  duration_seconds: number;
  word_count: number;
  language: string;
  status: "recording" | "draft" | "submitted" | "processed";
  created_at: string;
  updated_at: string;
}

export interface EnhancementMedia {
  id: string;
  enhancement_request_id: string;
  workspace_id: string;
  uploaded_by: string;
  file_name: string;
  file_type: "video" | "screenshot" | "audio" | "document";
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  storage_url?: string;
  annotation?: string;
  processing_status: MediaProcessingStatus;
  scene_count?: number;
  artifact_count?: number;
  confidence_score?: number;
  analysis_json?: MediaAnalysis;
  created_at: string;
}

export interface MediaAnalysis {
  scenes: SceneSegment[];
  ui_elements: ExtractedUIElement[];
  workflow_steps: ExtractedWorkflowStep[];
  ocr_text: string[];
  detected_software?: string;
  interaction_patterns: string[];
}

export interface SceneSegment {
  id: string;
  timestamp_start?: number;
  timestamp_end?: number;
  description: string;
  screenshot_path?: string;
  ui_elements: string[];
}

export interface ExtractedUIElement {
  type:
    | "button"
    | "form"
    | "table"
    | "modal"
    | "nav"
    | "filter"
    | "chart"
    | "list"
    | "card"
    | "other";
  label?: string;
  context: string;
  confidence: number;
}

export interface ExtractedWorkflowStep {
  order: number;
  action: string;
  element?: string;
  outcome: string;
}

export interface WorkspaceProfile {
  id: string;
  workspace_id: string;
  current_software_stack: string[];
  must_keep_features: string[];
  must_remove_features: string[];
  required_integrations: string[];
  preferred_ux_style: string;
  workflow_rules: string[];
  approval_processes: string[];
  industry_context?: string;
  enhancement_count: number;
  last_updated_at: string;
  created_at: string;
}

export interface TransferBatch {
  id: string;
  source_workspace_id: string;
  target_workspace_id: string;
  created_by: string;
  status: TransferBatchStatus;
  asset_types: string[];
  item_count: number;
  conflict_count: number;
  preview_json?: TransferPreview;
  applied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TransferPreview {
  items: TransferPreviewItem[];
  conflicts: TransferConflict[];
  dependencies: string[];
  warnings: string[];
}

export interface TransferPreviewItem {
  asset_type: string;
  source_id: string;
  name: string;
  description?: string;
  depends_on: string[];
  has_conflict: boolean;
}

export interface TransferConflict {
  item_id?: string;
  asset_type: string;
  source_name: string;
  target_name: string;
  conflict_type: "name_collision" | "dependency" | "incompatible";
  resolution: TransferConflictResolution;
  rename_to?: string;
}

export interface TransferItem {
  id: string;
  batch_id: string;
  asset_type: string;
  source_asset_id: string;
  source_workspace_id: string;
  target_workspace_id: string;
  asset_name: string;
  asset_payload?: any;
  status: TransferItemStatus;
  conflict_resolution?: TransferConflictResolution;
  rename_to?: string;
  imported_asset_id?: string;
  imported_at?: string;
  import_note?: string;
}

// Status display helpers
export const ENHANCEMENT_STATUS_LABELS: Record<EnhancementStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  analyzing: "In Analysis",
  ready_for_review: "Needs Review",
  approved: "Approved",
  rejected: "Not Approved",
  ready_to_apply: "Blueprint Ready",
  applied: "Added to Build Plan",
  failed: "Processing Failed",
};

export const VOICE_CONTEXT_LABELS: Record<VoiceContextMode, string> = {
  describe_current_software: "Describe Current Software",
  describe_feature: "Describe a Feature",
  describe_workflow: "Describe a Workflow",
  describe_final_vision: "Describe Final Product Vision",
  describe_changes: "Describe Changes",
  describe_pain_points: "Describe Pain Points",
  free_form: "Free Form",
};

export const REQUEST_TYPE_LABELS: Record<EnhancementRequestType, string> = {
  new_feature: "New Feature",
  feature_modification: "Feature Modification",
  ui_enhancement: "UI Enhancement",
  workflow_enhancement: "Workflow Enhancement",
  integration_enhancement: "Integration",
  reusable_transplant: "Reusable Transplant",
  workspace_merge: "Workspace Merge",
  full_software_blueprint: "Full Blueprint",
};
