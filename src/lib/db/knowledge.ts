import { supabase } from "../supabase";

export type DocumentCategory =
  | "onboarding_guides"
  | "system_documentation"
  | "integration_guides"
  | "client_instructions"
  | "internal_sops";

export type DocumentVisibility = "internal" | "client" | "public";

export interface KnowledgeDocument {
  id: string;
  title: string;
  slug: string;
  category: DocumentCategory;
  content: string;
  excerpt: string | null;
  visibility: DocumentVisibility;
  is_featured: boolean;
  view_count: number;
  tags: string[];
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentView {
  id: string;
  document_id: string;
  user_id: string | null;
  viewed_at: string;
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  onboarding_guides: "Onboarding Guides",
  system_documentation: "System Documentation",
  integration_guides: "Integration Guides",
  client_instructions: "Client Instructions",
  internal_sops: "Internal SOPs",
};

export const CATEGORY_COLORS: Record<
  DocumentCategory,
  { bg: string; text: string; border: string }
> = {
  onboarding_guides: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  system_documentation: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  integration_guides: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
  },
  client_instructions: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  internal_sops: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
};

export const VISIBILITY_LABELS: Record<DocumentVisibility, string> = {
  internal: "Internal Only",
  client: "Client Facing",
  public: "Public",
};

export const VISIBILITY_COLORS: Record<
  DocumentVisibility,
  { bg: string; text: string; border: string }
> = {
  internal: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
  },
  client: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  public: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
  },
};

class KnowledgeService {
  async getAllDocuments(filters?: {
    category?: DocumentCategory;
    visibility?: DocumentVisibility;
    search?: string;
    tags?: string[];
    featured?: boolean;
  }): Promise<KnowledgeDocument[]> {
    let query = supabase
      .from("bb_knowledge_documents")
      .select("*")
      .order("updated_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.visibility) {
      query = query.eq("visibility", filters.visibility);
    }

    if (filters?.featured) {
      query = query.eq("is_featured", true);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`,
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains("tags", filters.tags);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getDocumentById(id: string): Promise<KnowledgeDocument | null> {
    const { data, error } = await supabase
      .from("bb_knowledge_documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getDocumentBySlug(slug: string): Promise<KnowledgeDocument | null> {
    const { data, error } = await supabase
      .from("bb_knowledge_documents")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createDocument(
    document: Omit<
      KnowledgeDocument,
      "id" | "view_count" | "created_at" | "updated_at"
    >,
  ): Promise<KnowledgeDocument> {
    const { data, error } = await supabase
      .from("bb_knowledge_documents")
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDocument(
    id: string,
    updates: Partial<KnowledgeDocument>,
  ): Promise<KnowledgeDocument> {
    const { data, error } = await supabase
      .from("bb_knowledge_documents")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from("bb_knowledge_documents")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async logView(documentId: string, userId: string): Promise<void> {
    const { error } = await supabase.from("bb_document_views").insert({
      document_id: documentId,
      user_id: userId,
    });

    if (error) throw error;
  }

  async getFeaturedDocuments(): Promise<KnowledgeDocument[]> {
    const { data, error } = await supabase
      .from("bb_knowledge_documents")
      .select("*")
      .eq("is_featured", true)
      .order("view_count", { ascending: false })
      .limit(6);

    if (error) throw error;
    return data || [];
  }

  async getPopularDocuments(limit = 10): Promise<KnowledgeDocument[]> {
    const { data, error } = await supabase
      .from("bb_knowledge_documents")
      .select("*")
      .order("view_count", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getRecentDocuments(limit = 10): Promise<KnowledgeDocument[]> {
    const { data, error } = await supabase
      .from("bb_knowledge_documents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getAllTags(): Promise<string[]> {
    const { data, error } = await supabase
      .from("bb_knowledge_documents")
      .select("tags");

    if (error) throw error;

    const allTags = new Set<string>();
    data?.forEach((doc) => {
      doc.tags?.forEach((tag: string) => allTags.add(tag));
    });

    return Array.from(allTags).sort();
  }

  async getStats() {
    const [totalDocs, internalDocs, clientDocs, publicDocs] = await Promise.all(
      [
        supabase
          .from("bb_knowledge_documents")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("bb_knowledge_documents")
          .select("id", { count: "exact", head: true })
          .eq("visibility", "internal"),
        supabase
          .from("bb_knowledge_documents")
          .select("id", { count: "exact", head: true })
          .eq("visibility", "client"),
        supabase
          .from("bb_knowledge_documents")
          .select("id", { count: "exact", head: true })
          .eq("visibility", "public"),
      ],
    );

    return {
      total_documents: totalDocs.count || 0,
      internal_documents: internalDocs.count || 0,
      client_documents: clientDocs.count || 0,
      public_documents: publicDocs.count || 0,
    };
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

export const knowledgeService = new KnowledgeService();
