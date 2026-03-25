import { useEffect } from 'react';
import { intelligenceGraph } from '../lib/ai/graph/IntelligenceGraph';
import type { GraphNode } from '../lib/ai/graph/types';

/**
 * usePlatformIntelligence
 * Automatically registers the current component's feature and capability metadata
 * into the global Bridgebox Intelligence Graph upon mount.
 * 
 * This enables the AI Copilot to answer questions with 100% accurate,
 * grounded facts regarding what the user can currently access and do.
 */
export function usePlatformIntelligence(nodeData: Omit<GraphNode, 'updatedAt' | 'sourceOfTruth'>) {
  useEffect(() => {
    // Register the node to the graph
    intelligenceGraph.upsertNode({
      ...nodeData,
      relatedNodes: nodeData.relatedNodes || [],
      actions: nodeData.actions || [],
      sourceOfTruth: 'dynamic_scan',
      updatedAt: new Date().toISOString()
    });

    // We do NOT remove it on unmount because the intelligence graph 
    // represents the platform capability map, not just active memory.
    // Over time, as users navigate, the graph becomes perfectly mapped.
  }, [nodeData.id]);
}
