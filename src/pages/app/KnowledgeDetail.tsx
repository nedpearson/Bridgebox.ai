// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Eye,
  User,
  Tag,
  Star,
  BookOpen,
  Share2,
  Bookmark,
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import DocumentCategoryBadge from '../../components/knowledge/DocumentCategoryBadge';
import DocumentVisibilityBadge from '../../components/knowledge/DocumentVisibilityBadge';
import { knowledgeService, type KnowledgeDocument } from '../../lib/db/knowledge';
import { useAuth } from '../../contexts/AuthContext';

export default function KnowledgeDetail() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [relatedDocs, setRelatedDocs] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (docId) {
      loadDocument();
    }
  }, [docId]);

  const loadDocument = async () => {
    if (!docId) return;

    try {
      setLoading(true);
      setError('');

      const doc = await knowledgeService.getDocumentById(docId);

      if (!doc) {
        setError('Document not found');
        return;
      }

      setDocument(doc);

      if (user?.id) {
        await knowledgeService.logView(docId, user.id);
      }

      const related = await knowledgeService.getAllDocuments({
        category: doc.category,
      });
      setRelatedDocs(related.filter((d) => d.id !== doc.id).slice(0, 5));
    } catch (err) {
      console.error('Failed to load document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Loading..." />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (error || !document) {
    return (
      <>
        <AppHeader title="Error" />
        <div className="p-8">
          <ErrorState
            title="Document not found"
            message="The document you're looking for doesn't exist or you don't have access to it."
            action={
              <Button variant="primary" onClick={() => navigate('/app/knowledge')}>
                <ArrowLeft className="w-5 h-5" />
                Back to Knowledge Base
              </Button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title={document.title} />

      <div className="p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={() => navigate('/app/knowledge')}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          <Card>
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {document.is_featured && (
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      )}
                      <h1 className="text-3xl font-bold text-white">{document.title}</h1>
                    </div>
                    {document.excerpt && (
                      <p className="text-lg text-slate-300">{document.excerpt}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap pb-6 border-b border-white/10">
                  <DocumentCategoryBadge category={document.category} />
                  <DocumentVisibilityBadge visibility={document.visibility} />
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Updated {formatDate(document.updated_at)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {document.view_count} views
                  </div>
                </div>
              </div>

              <div className="prose prose-invert prose-slate max-w-none">
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {document.content}
                </div>
              </div>
            </div>
          </Card>

          {relatedDocs.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">Related Documentation</h2>
              <div className="space-y-3">
                {relatedDocs.map((doc) => (
                  <Link key={doc.id} to={`/app/knowledge/${doc.id}`}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{doc.title}</h3>
                          {doc.excerpt && (
                            <p className="text-sm text-slate-400 line-clamp-2">{doc.excerpt}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Eye className="w-3.5 h-3.5" />
                          {doc.view_count}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
