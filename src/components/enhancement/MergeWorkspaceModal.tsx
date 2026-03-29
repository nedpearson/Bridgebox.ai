import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, GitMerge, ChevronRight, Loader2, CheckCircle2, AlertCircle,
  Building2, Package, AlertTriangle, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { workspaceTransferService } from '../../lib/db/workspaceTransfer';
import type { TransferBatch, TransferPreviewItem } from '../../types/enhancement';

interface MergeWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type Step = 'source' | 'assets' | 'preview' | 'apply' | 'done';

interface AvailableAsset {
  id: string;
  asset_type: string;
  name: string;
  description: string;
  created_at: string;
}

export default function MergeWorkspaceModal({ isOpen, onClose, onComplete }: MergeWorkspaceModalProps) {
  const { currentOrganization, organizations } = useAuth();
  const [step, setStep] = useState<Step>('source');
  const [sourceWorkspaceId, setSourceWorkspaceId] = useState('');
  const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [batch, setBatch] = useState<TransferBatch | null>(null);
  const [preview, setPreview] = useState<{ items: TransferPreviewItem[]; warnings: string[] } | null>(null);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [applyResult, setApplyResult] = useState<{ applied: number; failed: number } | null>(null);

  const otherOrgs = organizations.filter(o => o.id !== currentOrganization?.id);

  const handleClose = useCallback(() => {
    setStep('source');
    setSourceWorkspaceId('');
    setAvailableAssets([]);
    setSelectedAssetIds(new Set());
    setBatch(null);
    setPreview(null);
    setError('');
    setApplyResult(null);
    setApplying(false);
    onClose();
  }, [onClose]);

  const handleLoadAssets = useCallback(async () => {
    if (!sourceWorkspaceId) return;
    setLoadingAssets(true);
    setError('');
    try {
      const assets = await workspaceTransferService.getAvailableAssets(sourceWorkspaceId);
      setAvailableAssets(assets);
      setStep('assets');
    } catch (err: any) {
      setError(err.message || 'Failed to load assets from source workspace.');
    } finally {
      setLoadingAssets(false);
    }
  }, [sourceWorkspaceId]);

  const handleToggleAsset = useCallback((id: string) => {
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const handleCreateAndPreview = useCallback(async () => {
    if (!currentOrganization || selectedAssetIds.size === 0) return;
    setError('');
    try {
      // Create the batch
      const newBatch = await workspaceTransferService.createBatch({
        sourceWorkspaceId,
        targetWorkspaceId: currentOrganization.id,
        assetTypes: ['enhancement_recommendation'],
      });

      // Add selected items to the batch
      const selectedAssets = availableAssets.filter(a => selectedAssetIds.has(a.id));
      for (const asset of selectedAssets) {
        await workspaceTransferService.addItem({
          batchId: newBatch.id,
          assetType: asset.asset_type,
          sourceAssetId: asset.id,
          sourceWorkspaceId,
          targetWorkspaceId: currentOrganization.id,
          assetName: asset.name,
          assetPayload: { description: asset.description },
        });
      }

      // Preview
      const previewData = await workspaceTransferService.previewBatch(newBatch.id);
      setBatch(newBatch);
      setPreview(previewData);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to create transfer batch.');
    }
  }, [currentOrganization, sourceWorkspaceId, selectedAssetIds, availableAssets]);

  const handleApply = useCallback(async () => {
    if (!batch || !currentOrganization) return;
    setApplying(true);
    setError('');
    try {
      const result = await workspaceTransferService.applyBatch(batch.id, currentOrganization.id);
      setApplyResult(result);
      setStep('done');
      onComplete?.();
    } catch (err: any) {
      setError(err.message || 'Failed to apply batch.');
    } finally {
      setApplying(false);
    }
  }, [batch, currentOrganization, onComplete]);

  if (!isOpen) return null;

  const sourceOrg = organizations.find(o => o.id === sourceWorkspaceId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <GitMerge className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Merge from Workspace</h2>
                <p className="text-slate-400 text-xs">Transfer approved assets → {currentOrganization?.name}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* STEP: source */}
            {step === 'source' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-1">Select source workspace</h3>
                  <p className="text-slate-400 text-sm">Choose which workspace to pull approved enhancements from. Only non-sensitive assets will be available.</p>
                </div>

                {otherOrgs.length === 0 ? (
                  <div className="p-6 text-center bg-slate-800/40 border border-slate-700 rounded-xl">
                    <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No other workspaces available.</p>
                    <p className="text-slate-500 text-xs mt-1">You need access to at least two workspaces to use this feature.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {otherOrgs.map(org => (
                      <button
                        key={org.id}
                        onClick={() => setSourceWorkspaceId(org.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          sourceWorkspaceId === org.id
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${sourceWorkspaceId === org.id ? 'bg-amber-500/20' : 'bg-slate-700'}`}>
                          <Building2 className={`w-4 h-4 ${sourceWorkspaceId === org.id ? 'text-amber-400' : 'text-slate-400'}`} />
                        </div>
                        <span className="font-medium">{org.name}</span>
                        {sourceWorkspaceId === org.id && <Check className="w-4 h-4 text-amber-400 ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-300 text-xs font-semibold">Safe Transfer Only</p>
                      <p className="text-slate-400 text-xs mt-0.5">Only approved enhancement recommendations are transferable. No client records, documents, or sensitive data will be listed.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLoadAssets}
                  disabled={!sourceWorkspaceId || loadingAssets}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500/20 hover:bg-amber-500/30 disabled:bg-slate-800 disabled:text-slate-500 border border-amber-500/30 disabled:border-slate-700 text-amber-300 disabled:text-slate-500 rounded-xl font-semibold transition-all"
                >
                  {loadingAssets ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading Assets...</> : <>Load Available Assets <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}

            {/* STEP: assets */}
            {step === 'assets' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold">Select assets to transfer</h3>
                  <p className="text-slate-400 text-sm mt-1">From <span className="text-white">{sourceOrg?.name}</span> → <span className="text-white">{currentOrganization?.name}</span></p>
                </div>

                {availableAssets.length === 0 ? (
                  <div className="p-6 text-center bg-slate-800/40 border border-slate-700 rounded-xl">
                    <Package className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No transferable assets found.</p>
                    <p className="text-slate-500 text-xs mt-1">Approved enhancements from that workspace will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">{selectedAssetIds.size} of {availableAssets.length} selected</p>
                    {availableAssets.map(asset => (
                      <button
                        key={asset.id}
                        onClick={() => handleToggleAsset(asset.id)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border transition-all text-left ${
                          selectedAssetIds.has(asset.id) ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 transition-all ${selectedAssetIds.has(asset.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                          {selectedAssetIds.has(asset.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{asset.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{asset.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep('source')} className="px-4 py-2.5 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all">← Back</button>
                  <button
                    onClick={handleCreateAndPreview}
                    disabled={selectedAssetIds.size === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 disabled:bg-slate-800 disabled:text-slate-500 border border-amber-500/30 disabled:border-slate-700 text-amber-300 disabled:text-slate-500 rounded-xl font-semibold transition-all"
                  >
                    Preview Merge ({selectedAssetIds.size}) <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP: preview */}
            {step === 'preview' && preview && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Review before applying</h3>

                {preview.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-1">
                    {preview.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-yellow-300 text-sm">{w}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  {preview.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                      <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-slate-500 text-xs">{item.asset_type}</p>
                      </div>
                      {item.has_conflict && <span className="text-xs bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full">Conflict</span>}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl text-xs text-slate-400">
                  <p>This action will clone the selected assets into <strong className="text-white">{currentOrganization?.name}</strong>. Original data in the source workspace is not affected. This action is audited and traceable.</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('assets')} className="px-4 py-2.5 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all">← Back</button>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all"
                  >
                    {applying ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying...</> : <><GitMerge className="w-4 h-4" /> Apply Merge</>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP: done */}
            {step === 'done' && applyResult && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Merge Complete</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    <strong className="text-emerald-400">{applyResult.applied}</strong> asset{applyResult.applied !== 1 ? 's' : ''} transferred successfully.
                    {applyResult.failed > 0 && <span className="text-red-400"> {applyResult.failed} failed.</span>}
                  </p>
                </div>
                <button onClick={handleClose} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm font-medium transition-all">
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
