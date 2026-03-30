import { IntelligenceState, GraphNode, NodeType } from "./types";
import { bridgeboxOntology } from "./ontology";

class IntelligenceGraph {
  private state: IntelligenceState = {
    nodes: {},
    lastScanTimestamp: Date.now(),
    scanErrors: [],
  };

  private listeners: Set<(state: IntelligenceState) => void> = new Set();

  constructor() {
    this.initializeCoreOntology();
  }

  /**
   * Seed the graph with static foundational modules that exist structurally
   */
  private initializeCoreOntology() {
    this.batchUpsertNodes(bridgeboxOntology);
  }

  public upsertNode(node: GraphNode) {
    this.state.nodes[node.id] = node;
    this.notifyListeners();
  }

  public batchUpsertNodes(nodes: GraphNode[]) {
    nodes.forEach((n) => {
      this.state.nodes[n.id] = n;
    });
    this.state.lastScanTimestamp = Date.now();
    this.notifyListeners();
  }

  public getNode(id: string): GraphNode | null {
    return this.state.nodes[id] || null;
  }

  public getNodesByType(type: NodeType): GraphNode[] {
    return Object.values(this.state.nodes).filter((n) => n.type === type);
  }

  public getNodesByRoleScope(role: string): GraphNode[] {
    return Object.values(this.state.nodes).filter((n) => {
      if (!n.visibility.roles) return true; // public / unrestricted
      return n.visibility.roles.includes(role as any);
    });
  }

  public getAllNodes(): GraphNode[] {
    return Object.values(this.state.nodes);
  }

  public exportGraphJSON(): string {
    return JSON.stringify(this.state.nodes, null, 2);
  }

  // Reactive subscription model for the UI
  public subscribe(listener: (state: IntelligenceState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.state));
  }
}

// Global Singleton Instance
export const intelligenceGraph = new IntelligenceGraph();
