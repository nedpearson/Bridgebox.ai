import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Video, Image as ImageIcon, FileVideo,
  Loader2, CheckCircle2, AlertCircle, Trash2, Plus,
  CreditCard, DollarSign, ArrowLeft
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
  const { user, profile, currentOrganization } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [pendingCost, setPendingCost] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<string, string>>({});
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
    setPendingCost(null);
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

  const handlePreSubmit = () => {
    if (files.length === 0) {
      setError('Please add at least one file.');
      return;
    }
    const totalCostRequired = files.reduce((acc, pf) => {
      const isImage = ALLOWED_IMAGE.includes(pf.file.type);
      const baseCost = isImage ? 3 : 8;
      const sizeMultiplier = Math.max(1, Math.ceil(pf.file.size / (200 * 1024 * 1024)));
      return acc + (baseCost * sizeMultiplier);
    }, 0);

    // Bypass explicit approval wizard for platform administrators
    if (isSuperAdmin) {
      handleSubmit();
      return;
    }

    setPendingCost(totalCostRequired);
  };

  const handleSubmit = async () => {
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

      // Upload each file concurrently
      const uploadPromises = files.map(async (pf) => {
        setProgress(prev => ({ ...prev, [pf.id]: '0%' }));
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
            onProgress: (p) => setProgress(prev => ({ ...prev, [pf.id]: `${Math.round(p)}%` }))
          });
          await enhancementRequestsService.incrementMediaCount(request.id, currentOrganization.id);
          setProgress(prev => ({ ...prev, [pf.id]: 'done' }));
        } catch (err: any) {
          setProgress(prev => ({ ...prev, [pf.id]: 'error' }));
          setError(err.message || 'Upload or credit deduction failed.');
          throw err;
        }
      });

      await Promise.all(uploadPromises);

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
  };

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
              pendingCost === null ? (
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
                      <div key={pf.id} className="relative flex gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                        {/* Progress Bar Background */}
                        {progress[pf.id] && progress[pf.id] !== 'error' && (
                          <div
                            className={`absolute bottom-0 left-0 h-1 transition-all duration-300 z-0 ${
                              progress[pf.id] === 'done' ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                            }`}
                            style={{
                              width: progress[pf.id] === 'done' ? '100%' : (progress[pf.id] || '0%')
                            }}
                          />
                        )}
                        
                        {/* Thumbnail or icon */}
                        <div className="relative z-10 w-16 h-12 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-700">
                          {pf.preview
                            ? <img src={pf.preview} alt="" className="w-full h-full object-cover" />
                            : <FileVideo className="w-6 h-6 text-slate-500" />
                          }
                        </div>
                        <div className="relative z-10 flex-1 min-w-0">
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
                        <div className="relative z-10 flex-shrink-0 flex flex-col items-center justify-center min-w-[32px]">
                          {progress[pf.id] && progress[pf.id] !== 'done' && progress[pf.id] !== 'error' && (
                            <>
                              <Loader2 className="w-4 h-4 text-blue-400 animate-spin mb-1" />
                              <span className="text-[10px] text-blue-400 font-mono font-medium">{progress[pf.id]}</span>
                            </>
                          )}
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
                  onClick={handlePreSubmit}
                  disabled={isUploading || files.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {files.length} file{files.length !== 1 ? 's' : ''}...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Next Step</>
                  )}
                </button>
              </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/15 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold text-xl">Approve AI Credit Usage</h3>
                    <p className="text-slate-400 text-sm mt-2">
                      Processing these {files.length} file(s) requires AI ingestion credits.
                    </p>
                  </div>
                  
                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                      <span className="text-slate-400 font-medium">AI Credits Required</span>
                      <span className="text-white font-bold text-lg">{pendingCost} Credits</span>
                    </div>
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-slate-400 font-medium">Equivalent Value Commitment</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {((pendingCost || 0) * 0.50).toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Progress Renderer on Final Screen */}
                  {isUploading && (
                    <div className="pt-4 border-t border-slate-700/50 space-y-3">
                      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Active Upload Stream</p>
                      {files.map((file) => (
                        <div key={file.id} className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-300 truncate pr-4">{file.file.name}</span>
                            <span className="text-xs font-bold text-violet-400 whitespace-nowrap">
                              {progress[file.id] || 'Starting...'}
                            </span>
                          </div>
                          
                          {/* Live Progress Bar */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                              initial={{ width: '0%' }}
                              animate={{ width: progress[file.id] === 'done' ? '100%' : (progress[file.id] !== 'error' ? progress[file.id] || '0%' : '100%') }}
                              transition={{ ease: "linear", duration: 0.3 }}
                              style={{ 
                                backgroundColor: progress[file.id] === 'error' ? '#ef4444' : progress[file.id] === 'done' ? '#10b981' : undefined
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setPendingCost(null)}
                      disabled={isUploading}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isUploading}
                      className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Committing Funds...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Approve & Upload</>
                      )}
                    </button>
                  </div>
                </div>
              )
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
