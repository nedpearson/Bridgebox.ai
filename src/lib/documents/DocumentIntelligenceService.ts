import { supabase } from '../supabase';
import { aiService } from '../ai/services/aiService';
import { entityLinkService, type EntityType } from '../db/entityLinks';

export interface IntelligenceClassification {
  document_type: string;
  confidence_score: number;
  extracted_metadata: {
    dates?: string[];
    amounts?: string[];
    invoice_number?: string;
    account_number?: string;
  };
  inferred_targets: {
    organizations?: string[];
    people?: string[];
    projects?: string[];
  };
  ai_summary: string;
}

export class DocumentIntelligenceService {
  /**
   * Main entry point for Document Intelligence AI Pipeline
   */
  async executeIntelligencePipeline(documentId: string, tenantId: string) {
    // 1. Fetch Document
    const { data: document, error } = await supabase
      .from('bb_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !document) throw new Error('Document not found or inaccessible');
    
    const text = document.extracted_text || '';
    if (!text || text.length < 10) {
      console.warn('Document has no extracted text, skipping intelligence pipeline.');
      return null;
    }

    // 2. Ask AI to Classify & Extract
    const classification = await this.askAIForClassification(text, document.file_name);
    if (!classification) return null;

    // 3. Search DB for matching records
    const proposedMatches = await this.findDatabaseMatches(tenantId, classification.inferred_targets);

    // 4. Evaluate Threshold & Attach
    const AUTO_ATTACH_THRESHOLD = 85; 
    // Example logic: if the AI is > 85% confident AND we found exactly 1 strong DB match
    const isHighlyConfident = classification.confidence_score >= AUTO_ATTACH_THRESHOLD;
    const hasSingleStrongMatch = proposedMatches.organizations.length === 1 && proposedMatches.projects.length === 0 && proposedMatches.people.length === 0;

    let finalStatus = 'needs_review';
    
    if (isHighlyConfident && hasSingleStrongMatch) {
      // Auto-Attach logic!
      await entityLinkService.linkEntities({
        tenant_id: tenantId,
        source_type: 'document',
        source_id: documentId,
        target_type: 'organization',
        target_id: proposedMatches.organizations[0].id,
        relationship_type: 'attached_to'
      });
      finalStatus = 'completed';
    }

    // 5. Update Document Record
    const metadataUpdate = {
      ...document.metadata,
      intelligence: {
        raw_classification: classification,
        proposed_matches: proposedMatches,
        system_confidence: classification.confidence_score
      }
    };

    await supabase
      .from('bb_documents')
      .update({
        document_type: classification.document_type,
        status: finalStatus,
        metadata: metadataUpdate,
        is_processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return { status: finalStatus, classification, proposedMatches };
  }

  private async askAIForClassification(text: string, filename: string): Promise<IntelligenceClassification | null> {
    const messages = [
      {
        role: 'system',
        content: `You are an elite Document Classification AI traversing financial, legal, medical, and operational documents.
        Analyze the text and extract specific targets (e.g., Company Names mentioned that are NOT the host platform).
        Assign a confidence_score between 0 and 100 based on how clear the document identity is.
        Return strictly valid JSON matching this schema:
        {
          "document_type": "invoice|contract|receipt|tax|legal|identification|other",
          "confidence_score": 95,
          "extracted_metadata": {
            "dates": ["12/01/2026"],
            "amounts": ["$5,000.00"],
            "invoice_number": "INV-1029",
            "account_number": ""
          },
          "inferred_targets": {
            "organizations": ["Roberts Enterprises", "Acme Corp"],
            "people": ["John Doe"],
            "projects": ["Alpha Migration"]
          },
          "ai_summary": "1 sentence brief describing the document"
        }
        Only Output JSON array without markdown formatting.`
      },
      {
        role: 'user',
        content: `Filename: ${filename}\n\nDocument Text:\n${text.substring(0, 4000)}`
      }
    ];

    const response = await aiService.executeAITask<IntelligenceClassification>(messages, false);
    if (!response.success || !response.data) {
      console.error('AI Classification failed:', response.error);
      return null;
    }
    return response.data;
  }

  private async findDatabaseMatches(tenantId: string, targets: IntelligenceClassification['inferred_targets']) {
    const results = {
      organizations: [] as any[],
      people: [] as any[],
      projects: [] as any[]
    };

    // Very naive exact phrase search logic for Organizations
    // In production we would use pg_trgm or vector similarity. 
    // For now we ILIKE match against bb_organizations.
    if (targets.organizations && targets.organizations.length > 0) {
      for (const orgName of targets.organizations) {
        if (!orgName || orgName.length < 3) continue;
        const { data } = await supabase
          .from('bb_organizations')
          .select('id, name')
          .ilike('name', `%${orgName}%`)
          .limit(1);
        
        if (data && data.length > 0) {
          results.organizations.push({ id: data[0].id, name: data[0].name, matched_term: orgName });
        }
      }
    }

    // Repeat for Projects
    if (targets.projects && targets.projects.length > 0) {
      for (const projName of targets.projects) {
        if (!projName || projName.length < 3) continue;
        const { data } = await supabase
          .from('projects')
          .select('id, name')
          .eq('tenant_id', tenantId)
          .ilike('name', `%${projName}%`)
          .limit(1);
        
        if (data && data.length > 0) {
          results.projects.push({ id: data[0].id, name: data[0].name, matched_term: projName });
        }
      }
    }

    return results;
  }
}

export const documentIntelligenceService = new DocumentIntelligenceService();
