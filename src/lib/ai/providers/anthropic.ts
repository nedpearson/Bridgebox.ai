import type {
  AIProviderClient,
  AIRequest,
  AIResponse,
  AIError,
} from "../types";

export class AnthropicProvider implements AIProviderClient {
  provider = "anthropic" as const;
  private apiKey: string | undefined;
  private baseURL = "https://api.anthropic.com/v1";

  constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw this.createError("API key not configured", "MISSING_API_KEY", true);
    }

    const systemMessage = request.messages.find((m) => m.role === "system");
    const userMessages = request.messages.filter((m) => m.role !== "system");

    try {
      let attempt = 0;
      let response: Response | null = null;
      let errorData: any = null;
      const maxRetries = 3;

      while (attempt < maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          response = await fetch(`${this.baseURL}/messages`, {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "x-api-key": this.apiKey!,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: request.model || "claude-3-5-sonnet-20241022",
              max_tokens: request.maxTokens || 4096,
              temperature: request.temperature ?? 0.7,
              system: systemMessage?.content,
              messages: userMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
          });
          clearTimeout(timeoutId);

          if (response.ok) break;

          errorData = await response.json().catch(() => ({}));
          // Only retry on rate limits (429) or server errors (5xx)
          if (response.status !== 429 && response.status < 500) {
            break;
          }
        } catch (e: any) {
          errorData = { error: { message: e.message, type: "NETWORK_ERROR" } };
          if (attempt === maxRetries - 1) break;
        }

        attempt++;
        if (attempt < maxRetries) {
          await new Promise((r) =>
            setTimeout(r, Math.min(1000 * Math.pow(2, attempt), 10000)),
          );
        }
      }

      if (!response || !response.ok) {
        throw this.createError(
          errorData?.error?.message ||
            `API error: ${response?.status || "Unknown"}`,
          errorData?.error?.type || "API_ERROR",
          response?.status === 429 || (response?.status || 500) >= 500,
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
      throw this.createError(
        error.message || "Unknown error",
        "NETWORK_ERROR",
        true,
      );
    }
  }

  private createError(
    message: string,
    code: string,
    retryable: boolean,
  ): AIError {
    return {
      code,
      message,
      provider: this.provider,
      retryable,
    };
  }
}
