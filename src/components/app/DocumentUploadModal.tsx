import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  File as FileIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Button from "../Button";
import { useAuth } from "../../contexts/AuthContext";
import { documentService } from "../../lib/db/documents";
import { storageService } from "../../lib/storage";
import { entityLinkService, EntityType } from "../../lib/db/entityLinks";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: string;
  onUploadComplete: () => void;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  onUploadComplete,
}: DocumentUploadModalProps) {
  const { currentOrganization } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        setError("File size must be less than 50MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentOrganization?.id) return;

    try {
      setUploading(true);
      setError(null);

      // 1. Upload the physical document to Supabase storage
      const path = storageService.buildClientDocumentPath(
        currentOrganization.id,
        selectedFile.name,
      );
      await storageService.uploadFile("client_documents", path, selectedFile);

      // 2. Create system record
      const doc = await documentService.createDocument({
        organization_id: currentOrganization.id,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        storage_path: path,
        document_type: "operational",
        status: "completed",
        is_processed: false,
      });

      // 3. Bind the document implicitly to the originating node context
      if (doc) {
        await entityLinkService.linkEntities({
          tenant_id: currentOrganization.id,
          source_type: entityType,
          source_id: entityId,
          target_type: "document",
          target_id: doc.id,
          relationship_type: "attached_to",
        });
      }

      onUploadComplete();
      onClose();
      clearSelection();
    } catch (err: any) {
      console.error("Document upload error:", err);
      setError(err.message || "Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Upload Document</h2>
              <p className="text-sm text-slate-400 mt-1 capitalize">
                Binding to {entityType} Record
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {!selectedFile ? (
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv"
                />
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center bg-slate-800/50 hover:bg-slate-800 transition-colors pointer-events-none">
                  <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-slate-400">
                    or click to browse from your computer
                  </p>
                  <p className="text-xs text-slate-500 mt-4">
                    Max file size 50MB. PDF, Word, Excel, Images, CSV.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-900 rounded-lg">
                      <FileIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium truncate max-w-[200px] sm:max-w-[250px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    disabled={uploading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-slate-800 bg-slate-900/50">
            <Button variant="secondary" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="min-w-[120px]"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading
                </>
              ) : (
                "Upload & Bind"
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
