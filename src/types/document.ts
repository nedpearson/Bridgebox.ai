export type DocumentType = 'financial' | 'legal' | 'operational' | 'contract' | 'report' | 'other';
export type DocumentStatus = 'uploading' | 'processing' | 'completed' | 'failed';
export type DocumentSentiment = 'positive' | 'negative' | 'neutral' | 'mixed';

export interface Document {
  id: string;
  organization_id: string;
  uploaded_by?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  document_type: DocumentType;
  category?: string;
  status: DocumentStatus;
  is_processed: boolean;
  project_id?: string;
  client_id?: string;
  extracted_text?: string;
  page_count?: number;
  language?: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface DocumentAnalysis {
  id: string;
  document_id: string;
  summary?: string;
  key_entities: {
    people?: string[];
    organizations?: string[];
    dates?: string[];
    amounts?: Array<{ value: number; currency?: string }>;
    locations?: string[];
  };
  key_values: Record<string, any>;
  sentiment?: DocumentSentiment;
  confidence_score?: number;
  processing_time_ms?: number;
  model_used?: string;
  analysis_date: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_name: string;
  storage_path: string;
  file_size: number;
  uploaded_by?: string;
  change_description?: string;
  created_at: string;
}

export interface DocumentWithAnalysis extends Document {
  analysis?: DocumentAnalysis;
  versions?: DocumentVersion[];
}

export interface DocumentStats {
  total: number;
  by_type: Record<DocumentType, number>;
  by_status: Record<DocumentStatus, number>;
  total_size: number;
  processed: number;
  unprocessed: number;
}

export interface DocumentUploadResult {
  document: Document;
  uploadUrl: string;
}
