import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { documentService } from "../../lib/db/documents";
import { entityLinkService, EntityType } from "../../lib/db/entityLinks";
import type { Document } from "../../types/document";
import { FileText, Plus, Upload, Search, Download } from "lucide-react";
import { Link } from "react-router-dom";
import DocumentUploadModal from "./DocumentUploadModal";

interface RelationalDocumentsBoardProps {
  entityType: EntityType;
  entityId: string;
}

export default function RelationalDocumentsBoard({
  entityType,
  entityId,
}: RelationalDocumentsBoardProps) {
  const { currentOrganization } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    loadDocs();
  }, [entityType, entityId]);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const data = await documentService.getLinkedDocuments(
        entityType,
        entityId,
      );
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load entity docs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Attached Files</h3>
        <button
          onClick={handleUploadClick}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-indigo-500/50"
        >
          <Upload className="w-4 h-4 text-indigo-400" />
          <span>Upload File</span>
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center flex flex-col items-center">
          <FileText className="w-12 h-12 text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium mb-1">
            No operational files mapped.
          </p>
          <p className="text-slate-500 text-sm">
            Any files uploaded here will be pinned strictly to this {entityType}{" "}
            node.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl hover:border-indigo-500/30 transition-colors flex items-start space-x-4"
            >
              <div className="p-3 bg-slate-800 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/app/documents/${doc.id}`} className="block">
                  <h4 className="font-semibold text-white hover:text-indigo-400 truncate mb-1">
                    {doc.file_name}
                  </h4>
                </Link>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="capitalize px-1.5 py-0.5 rounded bg-white/5">
                    {doc.document_type}
                  </span>
                  <span>•</span>
                  <span>{documentService.formatFileSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <div
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border text-center ${
                    doc.status === "completed"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : doc.status === "failed"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  }`}
                >
                  {doc.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        entityType={entityType}
        entityId={entityId}
        onUploadComplete={loadDocs}
      />
    </div>
  );
}
