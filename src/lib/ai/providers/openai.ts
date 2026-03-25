import type { AIProviderClient, AIRequest, AIResponse, AIError } from '../types';

export class OpenAIProvider implements AIProviderClient {
  provider = 'openai' as const;
  private apiKey: string | undefined;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw this.createError('API key not configured', 'MISSING_API_KEY', true);
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || 'gpt-4-turbo',
          messages: request.messages.map(m => {
            const msg: any = { role: m.role, content: m.content };
            if (m.name) msg.name = m.name;
            if (m.tool_calls) msg.tool_calls = m.tool_calls;
            if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
            return msg;
          }),
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens || 4096,
          ...(request.tools ? { tools: request.tools } : {}),
          ...(request.tool_choice ? { tool_choice: request.tool_choice } : {})
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(
          errorData.error?.message || `API error: ${response.status}`,
          errorData.error?.code || 'API_ERROR',
          response.status === 429 || response.status >= 500
        );
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        model: data.model,
        tool_calls: choice.message.tool_calls,
        usage: data.usage ? {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        finishReason: choice.finish_reason,
      };
    } catch (error: any) {
      if (error.provider) throw error;
      throw this.createError(error.message || 'Unknown error', 'NETWORK_ERROR', true);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isConfigured()) {
      throw this.createError('API key not configured', 'MISSING_API_KEY', true);
    }

    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
         throw new Error('Failed to generate embedding');
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error: any) {
      throw this.createError(error.message || 'Failed embedding', 'EMBEDDING_ERROR', true);
    }
  }

  private createError(message: string, code: string, retryable: boolean): AIError {
    return {
      code,
      message,
      provider: this.provider,
      retryable,
    };
  }
}
