import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Eye,
  Clock,
  Tag,
  FileText,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import DocumentCategoryBadge from "../../components/knowledge/DocumentCategoryBadge";
import DocumentVisibilityBadge from "../../components/knowledge/DocumentVisibilityBadge";
import {
  knowledgeService,
  CATEGORY_LABELS,
  type KnowledgeDocument,
  type DocumentCategory,
  type DocumentVisibility,
} from "../../lib/db/knowledge";

export default function Knowledge() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [featuredDocs, setFeaturedDocs] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    DocumentCategory | ""
  >("");
  const [selectedVisibility, setSelectedVisibility] = useState<
    DocumentVisibility | ""
  >("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedVisibility, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsData, featuredData] = await Promise.all([
        knowledgeService.getAllDocuments({
          category: selectedCategory || undefined,
          visibility: selectedVisibility || undefined,
          search: searchQuery || undefined,
        }),
        knowledgeService.getFeaturedDocuments(),
      ]);
      setDocuments(docsData);
      setFeaturedDocs(featuredData);
    } catch (error) {
      console.error("Failed to load knowledge base:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Knowledge Base" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Knowledge Base" />

      <div className="p-8 space-y-8">
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search documentation..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "ring-2 ring-blue-500" : ""}
            >
              <Filter className="w-5 h-5" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-white/10 mb-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as DocumentCategory | "")
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Visibility
                </label>
                <select
                  value={selectedVisibility}
                  onChange={(e) =>
                    setSelectedVisibility(
                      e.target.value as DocumentVisibility | "",
                    )
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Visibility</option>
                  <option value="internal">Internal Only</option>
                  <option value="client">Client Facing</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </motion.div>
          )}
        </Card>

        {featuredDocs.length > 0 &&
          !searchQuery &&
          !selectedCategory &&
          !selectedVisibility && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">
                  Featured Documentation
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDocs.map((doc) => (
                  <Link key={doc.id} to={`/app/knowledge/${doc.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="h-full"
                    >
                      <Card className="h-full hover:border-blue-500/50 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Star className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1 line-clamp-2">
                              {doc.title}
                            </h3>
                          </div>
                        </div>

                        {doc.excerpt && (
                          <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                            {doc.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <DocumentCategoryBadge category={doc.category} />
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Eye className="w-3.5 h-3.5" />
                            {doc.view_count}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {searchQuery || selectedCategory || selectedVisibility
                ? "Search Results"
                : "All Documentation"}
            </h2>
            <span className="text-sm text-slate-400">
              {documents.length} documents
            </span>
          </div>

          {documents.length === 0 ? (
            <Card>
              <EmptyState
                icon={BookOpen}
                title="No documents found"
                description={
                  searchQuery || selectedCategory || selectedVisibility
                    ? "Try adjusting your search or filters"
                    : "Knowledge base is empty"
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <Link key={doc.id} to={`/app/knowledge/${doc.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <Card className="hover:border-blue-500/50 transition-colors">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-white">
                                  {doc.title}
                                </h3>
                                {doc.is_featured && (
                                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                )}
                              </div>
                              {doc.excerpt && (
                                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                                  {doc.excerpt}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <DocumentCategoryBadge category={doc.category} />
                            <DocumentVisibilityBadge
                              visibility={doc.visibility}
                            />
                            {(doc.tags || []).length > 0 && (
                              <div className="flex items-center gap-1.5">
                                {(doc.tags || []).slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-slate-400"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-sm text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            {doc.view_count}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {formatDate(doc.updated_at)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
