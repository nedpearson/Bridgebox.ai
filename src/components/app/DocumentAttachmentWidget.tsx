import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  File,
  Upload,
  Trash2,
  FileText,
  Download,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { entityLinkService, type EntityType } from "../../lib/db/entityLinks";
import { documentService } from "../../lib/db/documents";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../Card";
import Button from "../Button";

interface DocumentAttachmentWidgetProps {
  entityType: EntityType;
  entityId: string;
}

export default function DocumentAttachmentWidget({
  entityType,
  entityId,
}: DocumentAttachmentWidgetProps) {
  const { currentOrganization } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entityId) loadAttachedDocuments();
  }, [entityId]);

  const loadAttachedDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getLinkedDocuments(
        entityType,
        entityId,
      );
      setDocuments(docs || []);
    } catch (err) {
      console.error("Failed to load attached documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentOrganization) return;

    try {
      setUploading(true);

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = `${currentOrganization.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document already in 'completed' state since we know the destination
      const { data: newDoc, error: dbError } = await supabase
        .from("bb_documents")
        .insert({
          organization_id: currentOrganization.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: filePath,
          document_type: "other",
          status: "completed",
          is_processed: true,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Map immediately (100% confidence)
      await entityLinkService.linkEntities({
        tenant_id: currentOrganization.id,
        source_type: "document",
        source_id: newDoc.id,
        target_type: entityType,
        target_id: entityId,
        relationship_type: "attached_to",
      });

      await loadAttachedDocuments();
    } catch (err) {
      console.error("Direct attachment upload failed:", err);
      alert("Failed to upload document.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const unlinkDocument = async (docId: string) => {
    try {
      await entityLinkService.unlinkEntities({
        source_type: "document",
        source_id: docId,
        target_type: entityType,
        target_id: entityId,
        relationship_type: "attached_to",
      });
      setDocuments((docs) => docs.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("Failed to unlink document:", err);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-400" />
            Attached Documents
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Files related to this record
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? "Uploading..." : "Attach File"}
        </Button>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
          <File className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No documents attached yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-slate-700/50 rounded-lg text-indigo-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium text-white truncate"
                    title={doc.file_name}
                  >
                    {doc.file_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(doc.created_at).toLocaleDateString()} •{" "}
                    {Math.round(doc.file_size / 1024)} KB
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 shrink-0">
                <button
                  onClick={() => unlinkDocument(doc.id)}
                  title="Remove from record"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
