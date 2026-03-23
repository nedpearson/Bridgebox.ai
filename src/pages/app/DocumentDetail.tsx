import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Tag,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  Database,
  Play,
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ProcessingStatus from '../../components/documents/ProcessingStatus';
import ExtractedDataPanel from '../../components/documents/ExtractedDataPanel';
import { documentService } from '../../lib/db/documents';
import { documentProcessor } from '../../lib/documents/DocumentProcessor';
import type { DocumentWithAnalysis } from '../../types/document';
import type { ExtractedData } from '../../lib/documents/DocumentProcessor';

export function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentWithAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocument();
      loadExtractedData();
    }
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await documentService.getDocumentById(id);
      setDocument(data);
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExtractedData = async () => {
    if (!id) return;

    try {
      const data = await documentProcessor.getExtractedData(id);
      setExtractedData(data);
    } catch (err) {
      console.error('Failed to load extracted data:', err);
    }
  };

  const handleReprocess = async () => {
    if (!id) return;

    try {
      setProcessing(true);
      await documentProcessor.processDocument(id);
      await loadDocument();
      await loadExtractedData();
    } catch (err) {
      console.error('Failed to reprocess document:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleValidate = async (dataId: string, isValid: boolean) => {
    try {
      await documentProcessor.validateExtractedData(dataId, isValid);
      await loadExtractedData();
    } catch (err) {
      console.error('Failed to validate data:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-screen flex items-center justify-center">
        <EmptyState
          icon={FileText}
          title="Document not found"
          description="The document you're looking for doesn't exist"
          action={{
            label: 'Back to Documents',
            onClick: () => navigate('/app/documents'),
          }}
        />
      </div>
    );
  }

  const analysis = document.analysis;

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title={document.file_name}
        subtitle="Document details and AI analysis"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/app/documents')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Document Information</h3>
                <Button
                  size="sm"
                  onClick={handleReprocess}
                  disabled={processing}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : 'Reprocess'}
                </Button>
              </div>

              <ProcessingStatus
                status={document.status}
                message={
                  document.status === 'completed'
                    ? 'Document processed successfully'
                    : document.status === 'failed'
                    ? 'Processing failed'
                    : 'Processing in progress'
                }
              />

              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-medium text-white mb-4">Details</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">File Name</div>
                  <div className="text-white">{document.file_name}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-1">Type</div>
                  <Badge color="blue">{document.document_type}</Badge>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-1">Size</div>
                  <div className="text-white">
                    {documentService.formatFileSize(document.file_size)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-1">Status</div>
                  <Badge color={document.status === 'completed' ? 'green' : 'amber'}>
                    {document.status}
                  </Badge>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-1">Uploaded</div>
                  <div className="text-white">
                    {new Date(document.created_at).toLocaleDateString()}
                  </div>
                </div>

                {document.page_count && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Pages</div>
                    <div className="text-white">{document.page_count}</div>
                  </div>
                )}

                {document.language && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Language</div>
                    <div className="text-white">{document.language}</div>
                  </div>
                )}
              </div>

              {document.tags && document.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-sm text-slate-400 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} color="slate">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Extracted Data</h3>
              </div>
              <ExtractedDataPanel data={extractedData} onValidate={handleValidate} />
            </Card>

            {document.extracted_text && (
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4">Extracted Text</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {document.extracted_text.substring(0, 1000)}
                    {document.extracted_text.length > 1000 && '...'}
                  </p>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {analysis && (
              <>
                <Card className="p-6 bg-slate-900/50 border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">AI Summary</h3>
                  </div>

                  {analysis.summary ? (
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {analysis.summary}
                    </p>
                  ) : (
                    <p className="text-slate-500 text-sm italic">
                      No summary available
                    </p>
                  )}

                  {analysis.sentiment && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <div className="text-sm text-slate-400 mb-2">Sentiment</div>
                      <Badge
                        color={
                          analysis.sentiment === 'positive'
                            ? 'green'
                            : analysis.sentiment === 'negative'
                            ? 'red'
                            : 'slate'
                        }
                      >
                        {analysis.sentiment}
                      </Badge>
                    </div>
                  )}

                  {analysis.confidence_score && (
                    <div className="mt-3">
                      <div className="text-sm text-slate-400 mb-2">Confidence</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${analysis.confidence_score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-white">
                          {Math.round(analysis.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </Card>

                {analysis.key_entities && Object.keys(analysis.key_entities).length > 0 && (
                  <Card className="p-6 bg-slate-900/50 border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Entities</h3>

                    <div className="space-y-4">
                      {analysis.key_entities.people && analysis.key_entities.people.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <User className="w-4 h-4" />
                            People
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {analysis.key_entities.people.slice(0, 5).map((person, index) => (
                              <Badge key={index} color="blue">
                                {person}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.key_entities.organizations && analysis.key_entities.organizations.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <Users className="w-4 h-4" />
                            Organizations
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {analysis.key_entities.organizations.slice(0, 5).map((org, index) => (
                              <Badge key={index} color="purple">
                                {org}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.key_entities.dates && analysis.key_entities.dates.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            Dates
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {analysis.key_entities.dates.slice(0, 5).map((date, index) => (
                              <Badge key={index} color="amber">
                                {date}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.key_entities.amounts && analysis.key_entities.amounts.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <DollarSign className="w-4 h-4" />
                            Amounts
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {analysis.key_entities.amounts.slice(0, 5).map((amount, index) => (
                              <Badge key={index} color="green">
                                ${amount.value.toLocaleString()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.key_entities.locations && analysis.key_entities.locations.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <MapPin className="w-4 h-4" />
                            Locations
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {analysis.key_entities.locations.slice(0, 5).map((location, index) => (
                              <Badge key={index} color="slate">
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
