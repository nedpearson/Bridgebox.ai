import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Video, Image as ImageIcon, FileVideo,
  Loader2, CheckCircle2, AlertCircle, Trash2, Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { enhancementRequestsService } from '../../lib/db/enhancementRequests';
import { enhancementMediaService } from '../../lib/db/enhancementMedia';
import { creditsService } from '../../lib/db/credits';

interface UploadRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (requestId: string) => void;
}

interface PendingFile {
  id: string;
  file: File;
  annotation: string;
  preview?: string;
}

const MAX_FILE_SIZE_MB = 6000;
const ALLOWED_VIDEO = ['video/webm', 'video/mp4', 'video/quicktime', 'video/avi', 'video/x-matroska'];
const ALLOWED_IMAGE = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

export default function UploadRecordingModal({ isOpen, onClose, onCreated }: UploadRecordingModalProps) {
  const { user, currentOrganization } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, 'pending' | 'uploading' | 'done' | 'error'>>({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState('');

  const handleClose = useCallback(() => {
    setFiles([]);
    setDescription('');
    setProgress({});
    setError('');
    setDone(false);
    setCreatedId('');
    setIsUploading(false);
    onClose();
  }, [onClose]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const validationErrors: string[] = [];
    const valid: PendingFile[] = [];

    for (const file of selected) {
      const isVideo = ALLOWED_VIDEO.includes(file.type);
      const isImage = ALLOWED_IMAGE.includes(file.type);

      if (!isVideo && !isImage) {
        validationErrors.push(`${file.name}: unsupported type (use MP4, WebM, MOV, PNG, JPG)`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        validationErrors.push(`${file.name}: exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        continue;
      }

      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const preview = isImage ? URL.createObjectURL(file) : undefined;

      valid.push({ id, file, annotation: '', preview });
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
    } else {
      setError('');
    }

    setFiles(prev => [...prev, ...valid]);
    e.target.value = '';
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const handleAnnotationChange = useCallback((id: string, annotation: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, annotation } : f));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!currentOrganization || files.length === 0) return;
    setIsUploading(true);
    setError('');

    try {
      // Create the enhancement request first
      const inputMethod = files.some(f => ALLOWED_VIDEO.includes(f.file.type))
        ? (files.some(f => ALLOWED_IMAGE.includes(f.file.type)) ? 'mixed' : 'recording')
        : 'screenshot';

      const title = description.trim()
        ? description.trim().slice(0, 80)
        : `Recording upload — ${files.length} file(s)`;

      const request = await enhancementRequestsService.create({
        workspaceId: currentOrganization.id,
        title,
        inputMethod,
        originalPrompt: description.trim() || undefined,
      });

      // Upload each file
      for (const pf of files) {
        setProgress(prev => ({ ...prev, [pf.id]: 'uploading' }));
        try {
          // Dynamic pricing based on 200MB chunks
          const isImage = ALLOWED_IMAGE.includes(pf.file.type);
          const baseEventType = isImage ? 'screenshot_analysis' : 'recording_analysis';
          const sizeMultiplier = Math.max(1, Math.ceil(pf.file.size / (200 * 1024 * 1024)));
          const baseCost = isImage ? 3 : 8; // standard cost
          const totalCost = baseCost * sizeMultiplier;

          const creditResult = await creditsService.consumeCredits(
            currentOrganization.id,
            baseEventType,
            (user as any)?.id,
            { fileName: pf.file.name, fileSize: pf.file.size },
            totalCost
          );

          if (!creditResult.success) {
            throw new Error(`Insufficient AI credits. Need ${totalCost} credits for this file size.`);
          }

          await enhancementMediaService.upload({
            file: pf.file,
            workspaceId: currentOrganization.id,
            enhancementRequestId: request.id,
            annotation: pf.annotation || undefined,
          });
          await enhancementRequestsService.incrementMediaCount(request.id, currentOrganization.id);
          setProgress(prev => ({ ...prev, [pf.id]: 'done' }));
        } catch (err: any) {
          setProgress(prev => ({ ...prev, [pf.id]: 'error' }));
          setError(err.message || 'Upload or credit deduction failed.');
          break; // Stop processing further files
        }
      }

      // Update status to submitted
      await enhancementRequestsService.updateStatus(request.id, 'submitted', currentOrganization.id);

      setCreatedId(request.id);
      setDone(true);
      onCreated?.(request.id);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [user, currentOrganization, files, description, onCreated]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Upload Recording</h2>
                <p className="text-slate-400 text-xs">Screen recordings & screenshots → {currentOrganization?.name}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {!done ? (
              <>
                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-violet-500/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-800 group-hover:bg-violet-500/10 border border-slate-700 group-hover:border-violet-500/30 rounded-xl flex items-center justify-center transition-all">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-violet-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Drop files or click to browse</p>
                      <p className="text-slate-400 text-sm mt-1">MP4, WebM, MOV (video) or PNG, JPG, WebP (screenshots)</p>
                      <p className="text-slate-500 text-xs mt-0.5">Max {MAX_FILE_SIZE_MB}MB per file</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><FileVideo className="w-3.5 h-3.5" /> Screen recordings</span>
                      <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Screenshots</span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">{files.length} file{files.length > 1 ? 's' : ''} queued</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add more
                      </button>
                    </div>
                    {files.map(pf => (
                      <div key={pf.id} className="flex gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                        {/* Thumbnail or icon */}
                        <div className="w-16 h-12 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-700">
                          {pf.preview
                            ? <img src={pf.preview} alt="" className="w-full h-full object-cover" />
                            : <FileVideo className="w-6 h-6 text-slate-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{pf.file.name}</p>
                          <p className="text-slate-500 text-xs">{(pf.file.size / 1024 / 1024).toFixed(1)} MB</p>
                          <input
                            type="text"
                            value={pf.annotation}
                            onChange={e => handleAnnotationChange(pf.id, e.target.value)}
                            placeholder="Add annotation (optional)"
                            className="mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
                          />
                        </div>
                        <div className="flex-shrink-0 flex items-center">
                          {progress[pf.id] === 'uploading' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                          {progress[pf.id] === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {progress[pf.id] === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                          {!progress[pf.id] && (
                            <button onClick={() => handleRemoveFile(pf.id)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    What are you showing? <span className="text-slate-600 normal-case font-normal">(recommended)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what's in the recording — what software is shown, what process you want replicated or improved..."
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm resize-none h-24 focus:outline-none focus:border-violet-500 leading-relaxed placeholder:text-slate-600"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-300 text-sm whitespace-pre-line">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isUploading || files.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {files.length} file{files.length > 1 ? 's' : ''}...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Upload & Register</>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Upload Complete</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    {files.length} file{files.length > 1 ? 's' : ''} uploaded and registered under <strong className="text-white">{currentOrganization?.name}</strong>. The enhancement request is ready for review.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={handleClose} className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all">Close</button>
                  <a href={`/app/enhancements/${createdId}`} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all">
                    View Enhancement
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
