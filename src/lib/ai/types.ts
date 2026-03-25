export type AIProvider = 'anthropic' | 'openai' | 'mock';

export type AIModel =
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'mock';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export interface AIRequest {
  messages: AIMessage[];
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  tools?: any[];
  tool_choice?: 'auto' | 'none' | Record<string, any>;
}

export interface AIResponse {
  content: string | null;
  model: string;
  tool_calls?: any[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface AIError {
  code: string;
  message: string;
  provider: AIProvider;
  retryable: boolean;
}

export interface AIProviderClient {
  provider: AIProvider;
  isConfigured: () => boolean;
  complete: (request: AIRequest) => Promise<AIResponse>;
  generateEmbedding?: (text: string) => Promise<number[]>;
  stream?: (request: AIRequest) => AsyncGenerator<string>;
}

export interface AITaskResult<T = any> {
  success: boolean;
  data?: T;
  error?: AIError;
  fromCache?: boolean;
  generatedBy?: string;
}

export type AITaskType =
  | 'summarize_lead'
  | 'summarize_project'
  | 'summarize_ticket'
  | 'classify_request'
  | 'generate_insights'
  | 'recommend_actions'
  | 'draft_proposal'
  | 'detect_priority'
  | 'analyze_sentiment'
  | 'extract_requirements';

export interface AITaskContext {
  type: AITaskType;
  data: Record<string, any>;
  options?: {
    temperature?: number;
    maxTokens?: number;
    useCache?: boolean;
  };
}

export interface LeadSummary {
  overview: string;
  keyNeeds: string[];
  suggestedServices: string[];
  estimatedValue: string;
  nextActions: string[];
  priority: 'urgent' | 'high' | 'medium' | 'low';
  confidence: number;
}

export interface ProjectSummary {
  status: string;
  progress: string;
  keyMilestones: string[];
  risks: string[];
  recommendations: string[];
  healthScore: number;
}

export interface TicketSummary {
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  suggestedResolution: string;
  estimatedTime: string;
  escalationNeeded: boolean;
}

export interface BusinessInsights {
  summary: string;
  opportunities: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
  }>;
  risks: Array<{
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  recommendations: string[];
}

export interface ActionRecommendation {
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  expectedOutcome: string;
  effort: 'quick' | 'medium' | 'complex';
}

export interface ProposalDraft {
  executiveSummary: string;
  scopeHighlights: string[];
  valueProposition: string;
  recommendedApproach: string;
  estimatedTimeline: string;
}
