import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  Plus,
  Search,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Trash2,
  Eye,
  Filter,
  MoreVertical,
  FileArchive,
  Download,
  ShieldAlert,
  Sparkles,
  Folder,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import DocumentUpload from "../../components/documents/DocumentUpload";
import BatchProcessor from "../../components/documents/BatchProcessor";
import { documentService } from "../../lib/db/documents";
import { entityLinkService, EntityType } from "../../lib/db/entityLinks";
import type {
  Document,
  DocumentType,
  DocumentStatus,
} from "../../types/document";
import { useAuth } from "../../contexts/AuthContext";
import { usePlatformIntelligence } from "../../hooks/usePlatformIntelligence";

const FILE_TYPE_ICONS: Record<string, any> = {
  "application/pdf": FileText,
  "image/": Image,
  "application/vnd.": FileSpreadsheet,
  "text/": FileText,
};

const TYPE_VARIANTS: Record<
  DocumentType,
  "primary" | "secondary" | "success" | "outline"
> = {
  financial: "success",
  legal: "primary",
  operational: "secondary",
  contract: "outline",
  report: "primary",
  other: "secondary",
};

const STATUS_VARIANTS: Record<
  DocumentStatus,
  "primary" | "secondary" | "success" | "outline"
> = {
  uploading: "primary",
  processing: "outline",
  completed: "success",
  failed: "secondary",
};

const getFileIcon = (fileType: string) => {
  if (!fileType) return File;
  for (const [key, icon] of Object.entries(FILE_TYPE_ICONS)) {
    if (fileType.startsWith(key)) return icon;
  }
  return File;
};

export function Documents() {
  const { currentOrganization } = useAuth();
  const [searchParams] = useSearchParams();
  const contextId = searchParams.get("context");
  const contextType = searchParams.get("contextType") as EntityType | null;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [filterType, setFilterType] = useState<DocumentType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  usePlatformIntelligence({
    id: "page:documents_list",
    name: "Document Intelligence Core",
    type: "page",
    description:
      "Centralized repository of all parsed, uploaded, and indexed artifacts mapped across Bridgebox OS.",
    relatedNodes: ["module:documents", "entity:document"],
    visibility: {
      roles: [
        "super_admin",
        "tenant_admin",
        "manager",
        "agent",
        "client_admin",
        "client_user",
      ],
    },
    actions: [],
  });

  useEffect(() => {
    loadDocuments();
  }, [currentOrganization?.id, contextId, contextType]);

  const loadDocuments = async () => {
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);
      const data = await documentService.getDocuments(currentOrganization.id);

      if (contextId && contextType) {
        const links = await entityLinkService.getLinkedEntities(
          contextType,
          contextId,
          "document",
        );
        const validDocIds = new Set(
          links.map((link) =>
            link.target_id === contextId ? link.source_id : link.target_id,
          ),
        );
        setDocuments(data?.filter((d) => validDocIds.has(d.id)) || []);
      } else {
        setDocuments(data || []);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, documentType: DocumentType) => {
    if (!currentOrganization?.id) return;

    const document = await documentService.createDocument({
      organization_id: currentOrganization.id,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: `/documents/${currentOrganization.id}/${Date.now()}_${file.name}`,
      document_type: documentType,
      status: "processing",
      tags: [],
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      await documentService.analyzeDocument(
        document.id,
        text.substring(0, 5000),
      );
    };
    reader.readAsText(file);

    setShowUpload(false);
    loadDocuments();
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await documentService.deleteDocument(documentId);
      loadDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filterType !== "all" && doc.document_type !== filterType) return false;
    if (
      searchQuery &&
      !doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title="Document Intelligence"
        subtitle="Upload, analyze, and organize business documents"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentOrganization?.id && (
          <BatchProcessor organizationId={currentOrganization.id} />
        )}

        {showUpload ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4">
                Upload Document
              </h3>
              <DocumentUpload
                onUpload={handleUpload}
                onCancel={() => setShowUpload(false)}
              />
            </Card>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="financial">Financial</option>
                <option value="legal">Legal</option>
                <option value="operational">Operational</option>
                <option value="contract">Contract</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>

              <Button onClick={() => setShowUpload(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {filteredDocuments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents found"
                description={
                  documents.length === 0
                    ? "Upload your first document to get started"
                    : "No documents match your search criteria"
                }
                action={
                  documents.length === 0 ? (
                    <Button onClick={() => setShowUpload(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredDocuments.map((document, index) => {
                  const Icon = getFileIcon(document.file_type);

                  return (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-800/50 rounded-lg">
                            <Icon className="w-6 h-6 text-blue-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white truncate">
                                {document.file_name}
                              </h3>
                              <Badge
                                variant={TYPE_VARIANTS[document.document_type]}
                                size="sm"
                              >
                                {document.document_type}
                              </Badge>
                              <Badge
                                variant={STATUS_VARIANTS[document.status]}
                                size="sm"
                              >
                                {document.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-slate-400">
                              <span>
                                {documentService.formatFileSize(
                                  document.file_size,
                                )}
                              </span>
                              <span>
                                {new Date(
                                  document.created_at,
                                ).toLocaleDateString()}
                              </span>
                              {document.page_count && (
                                <span>{document.page_count} pages</span>
                              )}
                              {document.is_processed && (
                                <Badge
                                  variant="success"
                                  size="sm"
                                  className="text-xs"
                                >
                                  AI Analyzed
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/app/documents/${document.id}`}
                              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4 text-blue-400" />
                            </Link>

                            <button
                              onClick={() => handleDelete(document.id)}
                              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
