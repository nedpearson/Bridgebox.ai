import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, XCircle, ChevronRight, File, Link as LinkIcon, AlertTriangle, Building2, User, FolderKanban } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { documentIntelligenceService } from '../../lib/documents/DocumentIntelligenceService';
import { entityLinkService } from '../../lib/db/entityLinks';

export default function DocumentCenter() {
  const { currentOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState<'review' | 'cabinet'>('review');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentOrganization) loadDocuments();
  }, [currentOrganization]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bb_documents')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentOrganization) return;

    try {
      setUploading(true);
      
      // 1. Upload file to Supabase Storage
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${currentOrganization.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create raw bb_document record
      const { data: newDoc, error: dbError } = await supabase
        .from('bb_documents')
        .insert({
          organization_id: currentOrganization.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: filePath,
          document_type: 'other',
          status: 'processing',
          extracted_text: `Simulated extracted text from ${file.name}. Invoice from Roberts Enterprises for $5,000.00.` // Mock extraction until PyPDF microservice triggers
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Immediately trigger intelligence engine natively!
      await documentIntelligenceService.executeIntelligencePipeline(newDoc.id, currentOrganization.id);
      
      // Reload the screen
      await loadDocuments();

    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload and process document.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApproveIntelligence = async (doc: any, proposedOrg: any) => {
    try {
      // 1. Write the Entity Link manually because user approved it
      await entityLinkService.linkEntities({
        tenant_id: currentOrganization?.id!,
        source_type: 'document',
        source_id: doc.id,
        target_type: 'organization',
        target_id: proposedOrg.id,
        relationship_type: 'attached_to'
      });

      // 2. Update doc status
      await supabase
        .from('bb_documents')
        .update({ status: 'completed' })
        .eq('id', doc.id);

      // 3. Reload
      setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, status: 'completed' } : d));
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const reviewQueue = documents.filter(d => d.status === 'needs_review');
  const cabinetDocs = documents.filter(d => d.status === 'completed');

  return (
    <>
      <AppHeader title="Document AI Center" subtitle="Intelligent ingestion, classification, and routing" />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Ribbon */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'review' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Review Queue 
              {reviewQueue.length > 0 && (
                <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {reviewQueue.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cabinet')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'cabinet' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cabinet ({cabinetDocs.length})
            </button>
          </div>

          <div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="w-4 h-4 mr-2" />
              Upload & Analyze
            </Button>
          </div>
        </div>

        {loading && <div className="py-20 flex justify-center"><LoadingSpinner /></div>}

        {!loading && activeTab === 'review' && (
          <div className="space-y-4">
            {reviewQueue.length === 0 ? (
              <Card className="p-12 text-center bg-slate-800/30 border-dashed">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Queue is Empty</h3>
                <p className="text-slate-400">All intake documents have been successfully classified and routed.</p>
              </Card>
            ) : (
              reviewQueue.map(doc => {
                const ai = doc.metadata?.intelligence;
                const orgMatch = ai?.proposed_matches?.organizations?.[0];

                return (
                  <Card key={doc.id} className="p-0 overflow-hidden border-amber-500/30">
                    <div className="flex border-b border-slate-700 bg-slate-800/50 p-4 items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                           <FileText className="w-6 h-6" />
                         </div>
                         <div>
                           <h4 className="text-white font-medium">{doc.file_name}</h4>
                           <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                             <span className="uppercase tracking-wider font-semibold text-indigo-400">{ai?.raw_classification?.document_type || doc.document_type}</span>
                             <span>•</span>
                             <span>AI Confidence: <span className={ai?.system_confidence < 85 ? 'text-amber-400' : 'text-emerald-400'}>{ai?.system_confidence || 0}%</span></span>
                           </div>
                         </div>
                       </div>
                       <div><StatusBadge status="needs_review" /></div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                         <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Extracted Intelligence</h5>
                         <p className="text-slate-300 text-sm italic mb-4 border-l-2 border-indigo-500 pl-4 py-1 bg-slate-800/30">
                           "{ai?.raw_classification?.ai_summary || 'No summary generated.'}"
                         </p>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                             <p className="text-xs text-slate-500 mb-1">Detected Amounts</p>
                             <p className="text-white font-medium">{ai?.raw_classification?.extracted_metadata?.amounts?.join(', ') || 'None'}</p>
                           </div>
                           <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                             <p className="text-xs text-slate-500 mb-1">Invoice Number</p>
                             <p className="text-white font-medium">{ai?.raw_classification?.extracted_metadata?.invoice_number || 'None'}</p>
                           </div>
                         </div>
                       </div>

                       <div>
                         <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Proposed Routing Destination</h5>
                         {orgMatch ? (
                            <div className="border border-indigo-500/30 bg-indigo-500/10 rounded-xl p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                  <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm text-indigo-200">Suggested Client</p>
                                  <p className="text-white font-medium">{orgMatch.name}</p>
                                  <p className="text-xs text-slate-400">Matched via literal text inclusion.</p>
                                </div>
                              </div>
                              <Button size="sm" onClick={() => handleApproveIntelligence(doc, orgMatch)}>Approve Connection</Button>
                            </div>
                         ) : (
                            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-4 flex items-center justify-center text-slate-400 text-sm">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              No strong database matches found. Map manually.
                            </div>
                         )}
                       </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {!loading && activeTab === 'cabinet' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cabinetDocs.map(doc => (
               <Card key={doc.id} className="p-5 flex flex-col items-center text-center hover:border-indigo-500/50 transition-colors">
                 <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-indigo-400">
                   <File className="w-8 h-8" />
                 </div>
                 <h4 className="text-white font-medium text-sm line-clamp-1 mb-1" title={doc.file_name}>{doc.file_name}</h4>
                 <div className="flex justify-center space-x-2">
                   <span className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</span>
                   <span className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">{doc.document_type}</span>
                 </div>
               </Card>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
