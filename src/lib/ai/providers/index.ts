import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';
import { MockProvider } from './mock';
import type { AIProvider, AIProviderClient } from '../types';

export class AIProviderFactory {
  private static providers: Map<AIProvider, AIProviderClient> = new Map();

  static getProvider(preferredProvider?: AIProvider): AIProviderClient {
    const provider = preferredProvider || this.detectProvider();

    if (!this.providers.has(provider)) {
      this.providers.set(provider, this.createProvider(provider));
    }

    return this.providers.get(provider)!;
  }

  private static detectProvider(): AIProvider {
    const envProvider = import.meta.env.VITE_AI_PROVIDER as AIProvider;

    if (envProvider && ['anthropic', 'openai', 'mock'].includes(envProvider)) {
      return envProvider;
    }

    const anthropic = new AnthropicProvider();
    if (anthropic.isConfigured()) {
      return 'anthropic';
    }

    const openai = new OpenAIProvider();
    if (openai.isConfigured()) {
      return 'openai';
    }

    console.warn('No AI provider configured. Using mock provider. Set VITE_ANTHROPIC_API_KEY or VITE_OPENAI_API_KEY.');
    return 'mock';
  }

  private static createProvider(provider: AIProvider): AIProviderClient {
    switch (provider) {
      case 'anthropic':
        return new AnthropicProvider();
      case 'openai':
        return new OpenAIProvider();
      case 'mock':
        return new MockProvider();
      default:
        console.warn(`Unknown provider: ${provider}. Falling back to mock.`);
        return new MockProvider();
    }
  }

  static isAIAvailable(): boolean {
    const provider = this.getProvider();
    return provider.isConfigured();
  }

  static getConfiguredProviderName(): string {
    const provider = this.getProvider();
    return provider.provider;
  }
}

export { AnthropicProvider, OpenAIProvider, MockProvider };
