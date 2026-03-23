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
          messages: request.messages.map(m => ({
            role: m.role === 'system' ? 'system' : m.role,
            content: m.content,
          })),
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens || 4096,
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

  private createError(message: string, code: string, retryable: boolean): AIError {
    return {
      code,
      message,
      provider: this.provider,
      retryable,
    };
  }
}
