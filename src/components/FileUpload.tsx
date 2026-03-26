import { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { storageService } from '../lib/storage';
import Button from './Button';

interface FileUploadProps {
  onUploadComplete: (file: { path: string; url: string; name: string; size: number; type: string }) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

export default function FileUpload({
  onUploadComplete,
  onError,
  accept = '*/*',
  maxSizeMB = 50,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess(false);

    const validation = storageService.validateFile(file, maxSizeMB);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      onError?.(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError('');
    setSuccess(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileInfo = () => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.name,
      size: storageService.formatFileSize(selectedFile.size),
      icon: storageService.getFileIcon(selectedFile.type),
    };
  };

  const fileInfo = getFileInfo();

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
        id="file-upload-input"
      />

      {!selectedFile ? (
        <label
          htmlFor="file-upload-input"
          className={`
            flex flex-col items-center justify-center w-full h-40 px-4
            border-2 border-dashed rounded-lg cursor-pointer
            transition-all duration-300
            ${disabled || uploading
              ? 'border-slate-700 bg-slate-800/30 cursor-not-allowed'
              : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500'
            }
          `}
        >
          <Upload className={`w-10 h-10 mb-3 ${disabled ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className="mb-2 text-sm text-slate-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500">
            Max file size: {maxSizeMB}MB
          </p>
        </label>
      ) : (
        <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <span className="text-2xl">{fileInfo?.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {fileInfo?.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {fileInfo?.size}
                </p>

                {uploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Uploading...</span>
                      <span className="text-xs text-slate-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs text-[#10B981]">Upload successful</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center space-x-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-500">{error}</span>
                  </div>
                )}
              </div>
            </div>

            {!uploading && !success && (
              <button
                onClick={handleRemoveFile}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function FileList({ files, onDelete }: { files: any[]; onDelete?: (path: string) => void }) {
  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <span className="text-xl">{storageService.getFileIcon(file.type || file.file_type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {file.name || file.file_name}
              </p>
              <p className="text-xs text-slate-500">
                {storageService.formatFileSize(file.size || file.file_size || 0)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors"
              >
                View
              </a>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(file.path || file.file_path)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
