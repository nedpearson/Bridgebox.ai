import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Loader2,
  Box,
  CheckCircle2,
  Plus,
  Zap,
  Link as LinkIcon,
  FileText,
  Command,
  ChevronRight,
  Sparkles,
  Building2,
  Folder,
  CheckSquare,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { globalSearchService, SearchResult } from "../../lib/db/search";
import EntityLinkModal from "./EntityLinkModal";
import InteractionLogModal from "./InteractionLogModal";
import { EntityType } from "../../lib/db/entityLinks";

export default function CommandPalette() {
  const { currentOrganization } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [bindModalOpen, setBindModalOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);

  const getContextEntityInfo = (): {
    type: EntityType;
    id: string;
    label: string;
  } | null => {
    const parts = location.pathname.split("/");
    if (parts.length >= 4 && parts[1] === "app" && parts[3] !== "new") {
      const collection = parts[2];
      const id = parts[3];
      const typeMap: Record<string, { type: EntityType; label: string }> = {
        clients: { type: "organization", label: "Client" },
        projects: { type: "project", label: "Project" },
        tasks: { type: "task", label: "Task" },
        documents: { type: "document", label: "Document" },
        communications: { type: "communication", label: "Communication" },
        workflows: { type: "workflow", label: "Workflow" },
        onboarding: { type: "onboarding", label: "Onboarding Session" },
      };
      if (typeMap[collection]) {
        return { ...typeMap[collection], id };
      }
    }
    return null;
  };

  const currentContext = getContextEntityInfo();

  let quickActions = [
    {
      id: "create-task",
      title: "Create Global Task",
      subtitle: "Add a new task to the system",
      icon: <Plus className="w-5 h-5 text-emerald-400" />,
      action: () => navigate("/app/tasks?new=true"),
    },
    {
      id: "create-project",
      title: "Create Project",
      subtitle: "Spin up a new client project",
      icon: <Plus className="w-5 h-5 text-blue-400" />,
      action: () => navigate("/app/projects?new=true"),
    },
    {
      id: "stack-discovery",
      title: "Map Tech Stack",
      subtitle: "Visually architect external tool integrations using AI.",
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      action: () => navigate("/app/stack-discovery"),
    },
    {
      id: "create-client",
      title: "Add Client Context",
      subtitle: "Register a new organization",
      icon: <Plus className="w-5 h-5 text-purple-400" />,
      action: () => navigate("/app/clients?new=true"),
    },
    {
      id: "log-interaction",
      title: "Log Activity",
      subtitle: "Record an email, call, or meeting",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      action: () => navigate("/app/communications?new=true"),
    },
  ];

  if (currentContext) {
    quickActions = [
      {
        id: "context-bind",
        title: `Link Node to this ${currentContext.label}`,
        subtitle: `Search and bind an existing entity natively`,
        icon: <LinkIcon className="w-5 h-5 text-indigo-400" />,
        action: () => {
          setIsOpen(false);
          setQuery("");
          setBindModalOpen(true);
        },
      },
      {
        id: "context-log",
        title: `Log Interaction`,
        subtitle: `Record a note or call for this ${currentContext.label}`,
        icon: <Zap className="w-5 h-5 text-amber-400" />,
        action: () => {
          setIsOpen(false);
          setQuery("");
          setLogModalOpen(true);
        },
      },
      ...quickActions,
    ];
  }

  // Reset selection index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results, query, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle modal on Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (!isOpen) return;

      const activeList = query.length >= 2 ? results : quickActions;

      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < activeList.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeList[selectedIndex]) {
          if (query.length >= 2) {
            handleSelect((activeList[selectedIndex] as SearchResult).url);
          } else {
            (activeList[selectedIndex] as any).action();
            setIsOpen(false);
            setQuery("");
          }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, query, results, quickActions, selectedIndex]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length >= 2 && currentOrganization?.id) {
        setLoading(true);
        try {
          const data = await globalSearchService.search(
            currentOrganization.id,
            query,
          );
          setResults(data);
        } catch (error) {
          console.error("Command search failed", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, currentOrganization?.id]);

  const handleSelect = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery("");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "organization":
        return <Building2 className="w-5 h-5 text-indigo-400" />;
      case "project":
        return <Folder className="w-5 h-5 text-emerald-400" />;
      case "task":
        return <CheckSquare className="w-5 h-5 text-amber-400" />;
      case "document":
        return <FileText className="w-5 h-5 text-rose-400" />;
      case "onboarding":
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
      default:
        return <Search className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <>
      {/* TopNav Trigger */}
      <div
        className="hidden md:flex relative items-center bg-slate-800/50 border border-slate-700 rounded-lg transition-colors hover:border-indigo-500/50 hover:bg-slate-800 w-48 lg:w-64 cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <Search className="absolute left-3 w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        <div className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
          Search...
        </div>
        <div className="absolute right-2 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-400 font-medium">
          ⌘K
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Input */}
            <div className="flex items-center px-4 py-4 border-b border-slate-800">
              <Search className="w-5 h-5 text-indigo-400 mr-3 animate-pulse" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-slate-500"
                placeholder="Search tasks, clients, workspaces, or type a command..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-medium border border-slate-700">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>

            {/* AI Orchestrator Hint */}
            {query.length > 5 && results.length === 0 && !loading && (
              <div className="px-4 py-8 text-center text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-indigo-500 opacity-50" />
                <p className="text-sm">
                  Cannot find exact relational match in your stack.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/app/tasks?new=true");
                  }}
                  className="mt-3 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-lg transition-colors border border-indigo-500/20"
                >
                  Create a Manual Task
                </button>
              </div>
            )}

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto w-full pb-2">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : query.length >= 2 ? (
                results.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <div className="px-3 pb-2 pt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Relational Matches
                    </div>
                    {results.map((result, idx) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result.url)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors group text-left ${
                          idx === selectedIndex
                            ? "bg-indigo-500/10 border border-indigo-500/30"
                            : "hover:bg-slate-800 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-lg transition-colors border ${idx === selectedIndex ? "bg-indigo-500/20 border-indigo-500/30" : "bg-slate-950 border-slate-800"}`}
                          >
                            {getIcon(result.type)}
                          </div>
                          <div>
                            <h4
                              className={`font-medium text-sm transition-colors ${idx === selectedIndex ? "text-indigo-400" : "text-white"}`}
                            >
                              {result.title}
                            </h4>
                            {result.subtitle && (
                              <p className="text-xs text-slate-400">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-colors ${idx === selectedIndex ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}`}
                        />
                      </button>
                    ))}
                  </div>
                ) : null // Fallback to the AI Hint above
              ) : (
                <div className="p-2 space-y-1 mt-1">
                  <div className="px-3 pb-2 pt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quick Actions
                  </div>
                  {quickActions.map((action, idx) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.action();
                        setIsOpen(false);
                        setQuery("");
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors group text-left ${
                        idx === selectedIndex
                          ? "bg-indigo-500/10 border border-indigo-500/30"
                          : "hover:bg-slate-800 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg transition-colors border ${idx === selectedIndex ? "bg-indigo-500/20 border-indigo-500/30" : "bg-slate-950 border-slate-800"}`}
                        >
                          {action.icon}
                        </div>
                        <div>
                          <h4
                            className={`font-medium text-sm transition-colors ${idx === selectedIndex ? "text-indigo-400" : "text-white"}`}
                          >
                            {action.title}
                          </h4>
                          {action.subtitle && (
                            <p className="text-xs text-slate-400">
                              {action.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 px-2 py-0.5 border border-slate-800 rounded bg-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center font-medium">
                  <Command className="w-3 h-3 mr-1" /> Navigate
                </span>
                <span className="flex items-center font-medium">↵ Execute</span>
                <span className="flex items-center font-medium">
                  esc Dismiss
                </span>
              </div>
              <span className="flex items-center font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-400" /> AI
                Operating System Base
              </span>
            </div>
          </div>
        </div>
      )}

      {currentContext && (
        <>
          <EntityLinkModal
            isOpen={bindModalOpen}
            onClose={() => setBindModalOpen(false)}
            entityType={currentContext.type}
            entityId={currentContext.id}
            onLinkComplete={() => {
              window.location.reload();
            }}
          />
          <InteractionLogModal
            isOpen={logModalOpen}
            onClose={() => setLogModalOpen(false)}
            entityType={currentContext.type}
            entityId={currentContext.id}
            onLogComplete={() => {
              window.location.reload();
            }}
          />
        </>
      )}
    </>
  );
}
