// @ts-nocheck
import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  File,
  X,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import MobileLayout from "../../layouts/MobileLayout";
import Button from "../../components/Button";
import { useAuth } from "../../contexts/AuthContext";
import { documentService } from "../../lib/db/documents";
import { storageService } from "../../lib/storage";

type UploadMode = "select" | "camera" | "file";

export default function MobileUpload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrganization } = useAuth();
  const [mode, setMode] = useState<UploadMode>(
    searchParams.get("camera") === "true" ? "camera" : "select",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentOrganization) return;

    try {
      setUploading(true);

      const path = storageService.buildClientDocumentPath(
        currentOrganization.id,
        selectedFile.name,
      );
      await storageService.uploadFile("client_documents", path, selectedFile);

      await documentService.createDocument({
        organization_id: currentOrganization.id,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        storage_path: path,
        document_type: "operational",
        status: "completed",
        is_processed: false,
      });

      navigate("/app/documents", {
        state: { message: "Document uploaded successfully" },
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setMode("select");
  };

  if (mode === "select" && !selectedFile) {
    return (
      <MobileLayout title="Upload">
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className="w-full max-w-sm space-y-4">
            {/* Camera Option */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMode("camera");
                cameraInputRef.current?.click();
              }}
              className="w-full p-6 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-center hover:border-blue-500 transition-colors"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Take Photo
              </h3>
              <p className="text-sm text-slate-400">
                Use your camera to capture a document
              </p>
            </motion.button>

            {/* File Upload Option */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMode("file");
                fileInputRef.current?.click();
              }}
              className="w-full p-6 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-center hover:border-blue-500 transition-colors"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Choose File
              </h3>
              <p className="text-sm text-slate-400">
                Select a document from your device
              </p>
            </motion.button>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Upload Document" showBack onBack={handleCancel}>
      <div className="flex flex-col h-full">
        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {preview ? (
            <div className="rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
              <img src={preview} alt="Preview" className="w-full h-auto" />
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg">
              <File className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-white font-medium mb-1">{selectedFile.name}</p>
              <p className="text-sm text-slate-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : null}

          {/* File Info */}
          {selectedFile && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-sm font-medium text-white mb-3">
                Document Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white">{selectedFile.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Size:</span>
                  <span className="text-white">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white">
                    {selectedFile.type || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full py-4 text-base"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Upload Document
              </>
            )}
          </Button>

          <button
            onClick={handleCancel}
            className="w-full py-4 text-base bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
