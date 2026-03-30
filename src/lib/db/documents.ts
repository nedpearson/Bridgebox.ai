// @ts-nocheck
import { supabase } from "../supabase";
import { aiService } from "../ai/services/aiService";
import type {
  Document,
  DocumentAnalysis,
  DocumentVersion,
  DocumentWithAnalysis,
  DocumentStats,
  DocumentType,
  DocumentStatus,
} from "../../types/document";

class DocumentService {
  async getDocuments(organizationId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from("bb_documents")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getLinkedDocuments(
    entityType: string,
    entityId: string,
  ): Promise<Document[]> {
    const { entityLinkService } = await import("./entityLinks");
    const links = await entityLinkService.getLinkedEntities(
      entityType as any,
      entityId,
      "document",
    );

    const docIds = links.map((link) =>
      link.source_type === "document" ? link.source_id : link.target_id,
    );

    if (docIds.length === 0) return [];

    const { data, error } = await supabase
      .from("bb_documents")
      .select("*")
      .in("id", docIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDocumentById(
    documentId: string,
  ): Promise<DocumentWithAnalysis | null> {
    const { data: document, error: docError } = await supabase
      .from("bb_documents")
      .select("*")
      .eq("id", documentId)
      .maybeSingle();

    if (docError) throw docError;
    if (!document) return null;

    const { data: analysis, error: analysisError } = await supabase
      .from("bb_document_analysis")
      .select("*")
      .eq("document_id", documentId)
      .maybeSingle();

    if (analysisError) throw analysisError;

    const { data: versions, error: versionsError } = await supabase
      .from("bb_document_versions")
      .select("*")
      .eq("document_id", documentId)
      .order("version_number", { ascending: false });

    if (versionsError) throw versionsError;

    return {
      ...document,
      analysis: analysis || undefined,
      versions: versions || undefined,
    };
  }

  async createDocument(document: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from("bb_documents")
      .insert({
        ...document,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDocument(
    documentId: string,
    updates: Partial<Document>,
  ): Promise<Document> {
    const { data, error } = await supabase
      .from("bb_documents")
      .update(updates)
      .eq("id", documentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from("bb_documents")
      .delete()
      .eq("id", documentId);

    if (error) throw error;
  }

  async analyzeDocument(
    documentId: string,
    extractedText: string,
  ): Promise<DocumentAnalysis> {
    const startTime = Date.now();

    try {
      const analysisPrompt = `Analyze the following document and provide:
1. A concise summary (2-3 sentences)
2. Key entities (people, organizations, dates, amounts, locations)
3. Key values and important information
4. Overall sentiment

Document text:
${extractedText.substring(0, 4000)}`;

      const analysisResult = await aiService.generateContent(analysisPrompt);

      const summary = this.extractSummary(analysisResult);
      const keyEntities = this.extractEntities(extractedText);
      const sentiment = this.detectSentiment(analysisResult);

      const processingTime = Date.now() - startTime;

      const { data, error } = await supabase
        .from("bb_document_analysis")
        .upsert({
          document_id: documentId,
          summary,
          key_entities: keyEntities,
          key_values: {},
          sentiment,
          confidence_score: 0.8,
          processing_time_ms: processingTime,
          model_used: "mock-ai-model",
          analysis_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Document analysis failed:", error);

      const processingTime = Date.now() - startTime;

      const { data, error: fallbackError } = await supabase
        .from("bb_document_analysis")
        .upsert({
          document_id: documentId,
          summary: "Analysis pending. Document uploaded successfully.",
          key_entities: {},
          key_values: {},
          processing_time_ms: processingTime,
          model_used: "fallback",
          analysis_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (fallbackError) throw fallbackError;
      return data;
    }
  }

  private extractSummary(aiResponse: string): string {
    const lines = aiResponse.split("\n");
    const summaryLines = lines.filter(
      (line) =>
        !line.toLowerCase().includes("summary:") && line.trim().length > 20,
    );
    return summaryLines.slice(0, 3).join(" ").substring(0, 500);
  }

  private extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {
      people: [],
      organizations: [],
      dates: [],
      amounts: [],
      locations: [],
    };

    const amountRegex = /\$\s*[\d,]+(?:\.\d{2})?/g;
    const amounts = text.match(amountRegex);
    if (amounts) {
      entities.amounts = amounts.slice(0, 10).map((amount) => ({
        value: parseFloat(amount.replace(/[$,]/g, "")),
        currency: "USD",
      }));
    }

    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
    const dates = text.match(dateRegex);
    if (dates) {
      entities.dates = dates.slice(0, 10);
    }

    return entities;
  }

  private detectSentiment(
    text: string,
  ): "positive" | "negative" | "neutral" | "mixed" {
    const lowerText = text.toLowerCase();
    const positiveWords = [
      "excellent",
      "great",
      "good",
      "success",
      "approved",
      "profitable",
    ];
    const negativeWords = ["poor", "bad", "fail", "loss", "denied", "rejected"];

    const positiveCount = positiveWords.filter((word) =>
      lowerText.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowerText.includes(word),
    ).length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    if (positiveCount > 0 && negativeCount > 0) return "mixed";
    return "neutral";
  }

  async getDocumentStats(organizationId: string): Promise<DocumentStats> {
    const { data: documents, error } = await supabase
      .from("bb_documents")
      .select("document_type, status, file_size, is_processed")
      .eq("organization_id", organizationId);

    if (error) throw error;

    const stats: DocumentStats = {
      total: documents?.length || 0,
      by_type: {
        financial: 0,
        legal: 0,
        operational: 0,
        contract: 0,
        report: 0,
        other: 0,
      },
      by_status: {
        uploading: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      },
      total_size: 0,
      processed: 0,
      unprocessed: 0,
    };

    documents?.forEach((doc) => {
      stats.by_type[doc.document_type as DocumentType]++;
      stats.by_status[doc.status as DocumentStatus]++;
      stats.total_size += doc.file_size;
      if (doc.is_processed) {
        stats.processed++;
      } else {
        stats.unprocessed++;
      }
    });

    return stats;
  }

  async searchDocuments(
    organizationId: string,
    query: string,
  ): Promise<Document[]> {
    const { data, error } = await supabase
      .from("bb_documents")
      .select("*")
      .eq("organization_id", organizationId)
      .or(`file_name.ilike.%${query}%,extracted_text.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  async addDocumentVersion(
    documentId: string,
    versionData: Partial<DocumentVersion>,
  ): Promise<DocumentVersion> {
    const { data: existingVersions, error: countError } = await supabase
      .from("bb_document_versions")
      .select("version_number")
      .eq("document_id", documentId)
      .order("version_number", { ascending: false })
      .limit(1);

    if (countError) throw countError;

    const nextVersion =
      existingVersions && existingVersions.length > 0
        ? existingVersions[0].version_number + 1
        : 1;

    const { data, error } = await supabase
      .from("bb_document_versions")
      .insert({
        ...versionData,
        document_id: documentId,
        version_number: nextVersion,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}

export const documentService = new DocumentService();
