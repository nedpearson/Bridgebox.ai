import React, { useState, useEffect } from 'react';
import { Brain, LayoutGrid, BookOpen, Save, RefreshCw } from 'lucide-react';
import AppHeader from '../../../components/app/AppHeader';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { intelligenceGraph } from '../../../lib/ai/graph/IntelligenceGraph';
import type { GraphNode } from '../../../lib/ai/graph/types';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return ( 
        <div className="p-8 bg-red-950 min-h-screen text-white rounded-lg border border-red-500 w-full z-[9999] absolute top-0 left-0">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><LayoutGrid/> AiKnowledgeBase Crashed!</h2>
          <p className="font-mono bg-black/50 p-4 rounded text-red-400">{this.state.error?.message}</p>
          <pre className="mt-4 text-xs font-mono text-slate-300 overflow-auto max-h-[60vh] bg-black/50 p-4 rounded">
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AiKnowledgeBaseContent() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [descriptionOverride, setDescriptionOverride] = useState('');

  useEffect(() => {
    // Initial load
    setNodes(intelligenceGraph.getAllNodes());

    const unsubscribe = intelligenceGraph.subscribe((state) => {
      setNodes(Object.values(state.nodes));
    });

    return () => { unsubscribe(); };
  }, []);

  const handleSelectNode = (node: GraphNode) => {
    setSelectedNode(node);
    setDescriptionOverride(node.description || '');
  };

  const handleSaveOverride = () => {
    if (!selectedNode) return;

    // We overwrite the memory node with admin_override
    intelligenceGraph.upsertNode({
      ...selectedNode,
      description: descriptionOverride,
      sourceOfTruth: 'admin_override',
      updatedAt: new Date().toISOString()
    });

    // Deselect to trigger UX reset
    setSelectedNode(null);
  };

  return (
    <>
      <AppHeader title="Super AI Knowledge Editor" />
      
      <div className="p-4 max-w-7xl mx-auto flex gap-6 mt-4 h-[calc(100vh-18rem)] min-h-[600px]">
        {/* Node Explorer */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Live Intelligence Graph</h3>
            </div>
            <span className="text-xs text-slate-400 bg-white/5 py-1 px-2 rounded">
              {nodes.length} Configured Nodes
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {nodes.map(node => (
              <button
                key={node.id}
                onClick={() => handleSelectNode(node)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedNode?.id === node.id 
                    ? 'bg-purple-500/20 border-purple-500/50' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-white">{node.name}</span>
                  <span className="text-xs text-purple-400 font-mono tracking-tight bg-purple-500/10 px-2 py-0.5 rounded">
                    {node.type}
                  </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{node.description}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    node.sourceOfTruth === 'static' ? 'bg-blue-500/20 text-blue-400' :
                    node.sourceOfTruth === 'dynamic_scan' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {node.sourceOfTruth?.replace('_', ' ') || 'Unknown'}
                  </span>
                  {(node.visibility?.roles || []).slice(0, 2).map(r => (
                    <span key={r} className="text-[10px] bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded-full">
                      {r?.replace('_', ' ') || 'All'}
                    </span>
                  ))}
                  {(node.visibility?.roles?.length || 0) > 2 && (
                    <span className="text-[10px] bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded-full">
                      +{(node.visibility?.roles?.length || 0) - 2} more
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Node Editor */}
        <Card className="flex-1 flex flex-col">
          {!selectedNode ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <LayoutGrid className="w-12 h-12 mb-4 text-slate-400" />
              <h4 className="text-lg font-medium text-white">Select a Graph Node</h4>
              <p className="text-sm text-slate-400 max-w-sm mt-2">
                Select a capability node from the left to edit its description. This updates exactly what the Copilot understands about this feature.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <BookOpen className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-lg text-white">{selectedNode.name}</h3>
                  <p className="text-xs font-mono text-slate-400">{selectedNode.id}</p>
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    AI Capability Instruction Override
                  </label>
                  <textarea
                    value={descriptionOverride}
                    onChange={(e) => setDescriptionOverride(e.target.value)}
                    className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Describe exactly what this feature does, when to use it, and what data it contains so the LLM understands it perfectly."
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    This text is fed directly into the system prompt when the Copilot parses intents related to this node. Be specific.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    Live Route Context
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Attached Route:</span>
                      <span className="text-white font-mono">{selectedNode.route || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Related Dependencies:</span>
                      <span className="text-white font-mono">{selectedNode.relatedNodes?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Interactive Actions:</span>
                      <span className="text-white font-mono">{selectedNode.actions?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setSelectedNode(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveOverride}>
                  <Save className="w-4 h-4 mr-2" />
                  Save AI Context
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

export default function AiKnowledgeBase() {
  return (
    <ErrorBoundary>
      <AiKnowledgeBaseContent />
    </ErrorBoundary>
  );
}
