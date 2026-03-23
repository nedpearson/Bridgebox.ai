import type { AIProviderClient, AIRequest, AIResponse, AIError } from '../types';

export class AnthropicProvider implements AIProviderClient {
  provider = 'anthropic' as const;
  private apiKey: string | undefined;
  private baseURL = 'https://api.anthropic.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw this.createError('API key not configured', 'MISSING_API_KEY', true);
    }

    const systemMessage = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role !== 'system');

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model || 'claude-3-5-sonnet-20241022',
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature ?? 0.7,
          system: systemMessage?.content,
          messages: userMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(
          errorData.error?.message || `API error: ${response.status}`,
          errorData.error?.type || 'API_ERROR',
          response.status === 429 || response.status >= 500
        );
      }

      const data = await response.json();

      return {
        content: data.content[0].text,
        model: data.model,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        finishReason: data.stop_reason,
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
