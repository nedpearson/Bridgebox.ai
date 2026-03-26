import { AIProviderFactory } from '../providers';
import { PromptBuilder } from '../prompts';
import type {
  AITaskResult,
  LeadSummary,
  ProjectSummary,
  TicketSummary,
  BusinessInsights,
  ActionRecommendation,
  ProposalDraft,
} from '../types';

class AIService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000;

  private getCacheKey(type: string, id?: string): string {
    return `${type}:${id || 'global'}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async executeAITask<T>(
    messages: any[],
    useCache: boolean = true,
    cacheKey?: string
  ): Promise<AITaskResult<T>> {
    if (useCache && cacheKey) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          fromCache: true,
        };
      }
    }

    try {
      const provider = AIProviderFactory.getProvider();

      if (!provider.isConfigured()) {
        return {
          success: false,
          error: {
            code: 'NOT_CONFIGURED',
            message: 'AI provider is not configured. Using fallback data.',
            provider: provider.provider,
            retryable: false,
          },
        };
      }

      const response = await provider.complete({
        messages,
        temperature: 0.3,
        maxTokens: 2048,
      });

      let data: T;
      try {
        let clean = response.content.replace(/```(?:json)?\n?/gi, '').replace(/```\n?/g, '').trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          data = JSON.parse(clean);
        }
      } catch (err) {
        console.error('JSON Parse Failure. Raw Payload:', response.content);
        throw new Error('Invalid JSON response from AI');
      }

      if (useCache && cacheKey) {
        this.setCache(cacheKey, data);
      }

      return {
        success: true,
        data,
        generatedBy: provider.provider,
      };
    } catch (error: any) {
      console.error('AI task error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'Failed to complete AI task',
          provider: error.provider || 'unknown',
          retryable: error.retryable ?? true,
        },
      };
    }
  }

  async summarizeLead(leadData: any, useCache = true): Promise<AITaskResult<LeadSummary>> {
    const messages = PromptBuilder.summarizeLead(leadData);
    const cacheKey = this.getCacheKey('lead_summary', leadData.id);
    return this.executeAITask<LeadSummary>(messages, useCache, cacheKey);
  }

  async summarizeProject(
    projectData: any,
    useCache = true
  ): Promise<AITaskResult<ProjectSummary>> {
    const messages = PromptBuilder.summarizeProject(projectData);
    const cacheKey = this.getCacheKey('project_summary', projectData.id);
    return this.executeAITask<ProjectSummary>(messages, useCache, cacheKey);
  }

  async summarizeTicket(
    ticketData: any,
    useCache = true
  ): Promise<AITaskResult<TicketSummary>> {
    const messages = PromptBuilder.summarizeTicket(ticketData);
    const cacheKey = this.getCacheKey('ticket_summary', ticketData.id);
    return this.executeAITask<TicketSummary>(messages, useCache, cacheKey);
  }

  async generateBusinessInsights(
    metricsData: any,
    useCache = true
  ): Promise<AITaskResult<BusinessInsights>> {
    const messages = PromptBuilder.generateBusinessInsights(metricsData);
    const cacheKey = this.getCacheKey('business_insights');
    return this.executeAITask<BusinessInsights>(messages, useCache, cacheKey);
  }

  async recommendActions(
    contextData: any,
    useCache = false
  ): Promise<AITaskResult<ActionRecommendation[]>> {
    const messages = PromptBuilder.recommendActions(contextData);
    return this.executeAITask<ActionRecommendation[]>(messages, useCache);
  }

  async draftProposal(
    proposalData: any,
    useCache = false
  ): Promise<AITaskResult<ProposalDraft>> {
    const messages = PromptBuilder.draftProposal(proposalData);
    return this.executeAITask<ProposalDraft>(messages, useCache);
  }

  async detectPriority(itemData: any): Promise<AITaskResult<any>> {
    const messages = PromptBuilder.detectPriority(itemData);
    return this.executeAITask(messages, false);
  }

  async classifyRequest(requestData: any): Promise<AITaskResult<any>> {
    const messages = PromptBuilder.classifyRequest(requestData);
    return this.executeAITask(messages, false);
  }

  async generateWorkflow(promptText: string): Promise<AITaskResult<any[]>> {
    const messages = [
      {
        role: 'system',
        content: `You are an expert automation engineer configuring Bridgebox DAG macros.
        Convert the natural language workflow prompt into a structured JSON array of workflow steps.
        Output Rules:
        1. Always return a valid JSON array ONLY. Do not include markdown formatting or explanation text.
        2. Each object must represent a distinct chronological step in the workflow graph.
        3. Fields required per step:
           - id (string, generate a secure random 8-character string)
           - step_name (string, concise verb-first title)
           - step_type (enum: 'action', 'condition', 'delay', 'notification')
           - order_index (number, sequential starting at 0)
           - config (object with arbitrary key/values relevant to the step, e.g. { "to": "client", "subject": "Welcome", "template": "onboarding" })`
      },
      {
        role: 'user',
        content: promptText
      }
    ];
    return this.executeAITask<any[]>(messages, false);
  }

  async enrichLeadData(domain: string, websiteContent: string): Promise<AITaskResult<any>> {
    const messages = [
      {
        role: 'system',
        content: `You are an expert lead enrichment AI. Extract business intelligence based on this website text snippet.
        Return exactly a JSON object: { "company_overview": "...", "target_market": "..." }`
      },
      {
        role: 'user',
        content: `Website: ${domain}\nContent Array: ${websiteContent.slice(0, 3000)}`
      }
    ];
    return this.executeAITask<any>(messages, false);
  }

  async processVoiceCommand(transcript: string): Promise<AITaskResult<any>> {
    const messages = [
      {
        role: 'system',
        content: `You are an autonomous CRM voice agent. The user is dictating instructions via a microphone.
        Parse the transcript and extract structured Entities to create.
        Return exactly a JSON object matching this schema:
        {
          "projects": [ { "name": "...", "description": "..." } ],
          "tasks": [ { "title": "...", "description": "...", "priority": "high" } ]
        }
        Only include entities explicitly requested.`
      },
      {
        role: 'user',
        content: transcript
      }
    ];
    return this.executeAITask<any>(messages, false);
  }

  isAvailable(): boolean {
    return AIProviderFactory.isAIAvailable();
  }

  getProviderName(): string {
    return AIProviderFactory.getConfiguredProviderName();
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheForKey(type: string, id?: string): void {
    const key = this.getCacheKey(type, id);
    this.cache.delete(key);
  }
}

export const aiService = new AIService();
