import { supabase } from '../supabase';
import { aiService } from '../ai/services/aiService';
import type { Document, DocumentType } from '../../types/document';

export type ProcessingTaskType = 'extract_text' | 'classify' | 'extract_data' | 'analyze' | 'full_process';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
export type ExtractedDataType = 'invoice' | 'contract' | 'receipt' | 'form' | 'table' | 'other';
export type ValidationStatus = 'pending' | 'valid' | 'invalid' | 'needs_review';

export interface QueueItem {
  id: string;
  document_id: string;
  organization_id: string;
  priority: number;
  status: ProcessingStatus;
  task_type: ProcessingTaskType;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  processing_data: Record<string, any>;
}

export interface ProcessingHistory {
  id: string;
  queue_id?: string;
  document_id: string;
  task_type: string;
  status: 'success' | 'failed' | 'cancelled';
  duration_ms?: number;
  error_message?: string;
  result_data: Record<string, any>;
  created_at: string;
}

export interface ExtractedData {
  id: string;
  document_id: string;
  data_type: ExtractedDataType;
  confidence?: number;
  extracted_fields: Record<string, any>;
  validation_status: ValidationStatus;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

class DocumentProcessor {
  async extractText(documentId: string, fileContent: string): Promise<string> {
    const startTime = Date.now();

    try {
      let extractedText = fileContent;

      if (fileContent.includes('%PDF')) {
        extractedText = this.extractPDFText(fileContent);
      } else if (fileContent.startsWith('data:image/')) {
        extractedText = await this.performOCR(fileContent);
      }

      const duration = Date.now() - startTime;

      await this.recordHistory(documentId, 'extract_text', 'success', duration, {
        text_length: extractedText.length,
      });

      await supabase
        .from('documents')
        .update({
          extracted_text: extractedText,
          page_count: this.estimatePageCount(extractedText),
          language: this.detectLanguage(extractedText),
        })
        .eq('id', documentId);

      return extractedText;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.recordHistory(documentId, 'extract_text', 'failed', duration, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async classifyDocument(documentId: string, text: string): Promise<DocumentType> {
    const startTime = Date.now();

    try {
      const prompt = `Classify this document into one of these categories: financial, legal, operational, contract, report, other.

Document text: ${text.substring(0, 1000)}

Respond with only the category name.`;

      const result = await aiService.generateContent(prompt);
      const classification = this.parseClassification(result);

      const duration = Date.now() - startTime;

      await this.recordHistory(documentId, 'classify', 'success', duration, {
        classification,
      });

      await supabase
        .from('documents')
        .update({ document_type: classification })
        .eq('id', documentId);

      return classification;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.recordHistory(documentId, 'classify', 'failed', duration, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return 'other';
    }
  }

  async extractStructuredData(documentId: string, text: string, documentType: DocumentType): Promise<ExtractedData | null> {
    const startTime = Date.now();

    try {
      const extractedFields = this.extractFieldsByType(text, documentType);

      if (Object.keys(extractedFields).length === 0) {
        await this.recordHistory(documentId, 'extract_data', 'success', Date.now() - startTime, {
          message: 'No structured data found',
        });
        return null;
      }

      const dataType = this.determineDataType(documentType, extractedFields);
      const confidence = this.calculateConfidence(extractedFields);

      const { data, error } = await supabase
        .from('document_extracted_data')
        .insert({
          document_id: documentId,
          data_type: dataType,
          confidence,
          extracted_fields: extractedFields,
          validation_status: confidence > 0.8 ? 'valid' : 'needs_review',
        })
        .select()
        .single();

      if (error) throw error;

      await this.recordHistory(documentId, 'extract_data', 'success', Date.now() - startTime, {
        field_count: Object.keys(extractedFields).length,
        confidence,
      });

      return data;
    } catch (error) {
      await this.recordHistory(documentId, 'extract_data', 'failed', Date.now() - startTime, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async processDocument(documentId: string): Promise<void> {
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !document) throw new Error('Document not found');

    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    try {
      let text = document.extracted_text || '';

      if (!text) {
        text = `Sample text content for ${document.file_name}`;
        await this.extractText(documentId, text);
      }

      if (document.document_type === 'other') {
        await this.classifyDocument(documentId, text);
      }

      const { data: updatedDoc } = await supabase
        .from('documents')
        .select('document_type')
        .eq('id', documentId)
        .single();

      if (updatedDoc) {
        await this.extractStructuredData(documentId, text, updatedDoc.document_type);
      }

      await supabase
        .from('documents')
        .update({
          status: 'completed',
          is_processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', documentId);
    } catch (error) {
      await supabase
        .from('documents')
        .update({ status: 'failed' })
        .eq('id', documentId);
      throw error;
    }
  }

  async getQueueStats(organizationId: string) {
    const { data: stats } = await supabase
      .from('document_processing_queue')
      .select('status')
      .eq('organization_id', organizationId);

    const pending = stats?.filter(s => s.status === 'pending').length || 0;
    const processing = stats?.filter(s => s.status === 'processing').length || 0;
    const completed = stats?.filter(s => s.status === 'completed').length || 0;
    const failed = stats?.filter(s => s.status === 'failed').length || 0;

    return { pending, processing, completed, failed, total: stats?.length || 0 };
  }

  async getProcessingHistory(documentId: string): Promise<ProcessingHistory[]> {
    const { data, error } = await supabase
      .from('document_processing_history')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getExtractedData(documentId: string): Promise<ExtractedData[]> {
    const { data, error } = await supabase
      .from('document_extracted_data')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async validateExtractedData(dataId: string, isValid: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('document_extracted_data')
      .update({
        validation_status: isValid ? 'valid' : 'invalid',
        validated_by: user?.id,
        validated_at: new Date().toISOString(),
      })
      .eq('id', dataId);
  }

  private async recordHistory(
    documentId: string,
    taskType: string,
    status: 'success' | 'failed',
    durationMs: number,
    resultData: Record<string, any>
  ): Promise<void> {
    await supabase
      .from('document_processing_history')
      .insert({
        document_id: documentId,
        task_type: taskType,
        status,
        duration_ms: durationMs,
        result_data: resultData,
        error_message: status === 'failed' ? resultData.error : undefined,
      });
  }

  private extractPDFText(pdfContent: string): string {
    return 'Extracted PDF text content would appear here in production.';
  }

  private async performOCR(imageData: string): Promise<string> {
    return 'OCR extracted text would appear here in production.';
  }

  private estimatePageCount(text: string): number {
    const avgCharsPerPage = 3000;
    return Math.max(1, Math.ceil(text.length / avgCharsPerPage));
  }

  private detectLanguage(text: string): string {
    const commonWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a'];
    const matches = commonWords.filter(word =>
      text.toLowerCase().includes(` ${word} `)
    ).length;

    return matches > 2 ? 'en' : 'unknown';
  }

  private parseClassification(aiResponse: string): DocumentType {
    const response = aiResponse.toLowerCase().trim();

    if (response.includes('financial')) return 'financial';
    if (response.includes('legal')) return 'legal';
    if (response.includes('operational')) return 'operational';
    if (response.includes('contract')) return 'contract';
    if (response.includes('report')) return 'report';

    return 'other';
  }

  private extractFieldsByType(text: string, docType: DocumentType): Record<string, any> {
    const fields: Record<string, any> = {};

    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailRegex);
    if (emails) fields.emails = emails;

    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const phones = text.match(phoneRegex);
    if (phones) fields.phones = phones;

    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g;
    const dates = text.match(dateRegex);
    if (dates) fields.dates = dates;

    const amountRegex = /\$\s*[\d,]+(?:\.\d{2})?/g;
    const amounts = text.match(amountRegex);
    if (amounts) fields.amounts = amounts;

    if (docType === 'financial') {
      fields.document_type = 'financial';
      if (text.toLowerCase().includes('invoice')) {
        fields.invoice_detected = true;
      }
      if (text.toLowerCase().includes('receipt')) {
        fields.receipt_detected = true;
      }
    }

    if (docType === 'contract') {
      fields.document_type = 'contract';
      if (text.toLowerCase().includes('agreement')) {
        fields.agreement_detected = true;
      }
    }

    return fields;
  }

  private determineDataType(docType: DocumentType, fields: Record<string, any>): ExtractedDataType {
    if (fields.invoice_detected) return 'invoice';
    if (fields.receipt_detected) return 'receipt';
    if (fields.agreement_detected || docType === 'contract') return 'contract';
    if (fields.amounts && fields.amounts.length > 0) return 'invoice';

    return 'other';
  }

  private calculateConfidence(fields: Record<string, any>): number {
    const fieldCount = Object.keys(fields).length;

    if (fieldCount === 0) return 0;
    if (fieldCount >= 5) return 0.9;
    if (fieldCount >= 3) return 0.75;
    if (fieldCount >= 2) return 0.6;

    return 0.5;
  }
}

export const documentProcessor = new DocumentProcessor();
