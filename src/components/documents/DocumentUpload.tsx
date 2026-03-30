import { useState, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  Image,
  FileSpreadsheet,
  File,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../Button";
import type { DocumentType } from "../../types/document";

interface DocumentUploadProps {
  onUpload: (file: File, documentType: DocumentType) => Promise<void>;
  onCancel?: () => void;
}

const FILE_TYPE_ICONS: Record<string, any> = {
  "application/pdf": FileText,
  "image/": Image,
  "application/vnd.": FileSpreadsheet,
  "text/": FileText,
};

const getFileIcon = (fileType: string) => {
  for (const [key, icon] of Object.entries(FILE_TYPE_ICONS)) {
    if (fileType.startsWith(key)) return icon;
  }
  return File;
};

export default function DocumentUpload({
  onUpload,
  onCancel,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("other");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      await onUpload(file, documentType);
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-colors
          ${
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-slate-700 hover:border-slate-600"
          }
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-xl flex items-center justify-center">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="text-lg text-white mb-2">
                  Drop your file here, or{" "}
                  <label
                    htmlFor="file-upload"
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    browse
                  </label>
                </p>
                <p className="text-sm text-slate-400">
                  Supports PDF, DOC, XLS, TXT, PNG, JPG
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file-preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-4 p-4 bg-slate-800/50 rounded-lg">
                {(() => {
                  const Icon = getFileIcon(file.type);
                  return <Icon className="w-8 h-8 text-blue-400" />;
                })()}
                <div className="flex-1 text-left">
                  <p className="text-white font-medium truncate">{file.name}</p>
                  <p className="text-sm text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="financial">Financial</option>
              <option value="legal">Legal</option>
              <option value="operational">Operational</option>
              <option value="contract">Contract</option>
              <option value="report">Report</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
