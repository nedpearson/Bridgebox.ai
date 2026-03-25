import { IntegrationProvider } from './providerInterface';

class IntegrationRegistry {
  private providers: Map<string, IntegrationProvider> = new Map();

  register(provider: IntegrationProvider) {
    if (this.providers.has(provider.id)) {
      console.warn(`Provider ${provider.id} is already registered. Overwriting.`);
    }
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): IntegrationProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Integration provider '${id}' not found in registry.`);
    }
    return provider;
  }

  getAllProviders(): IntegrationProvider[] {
    return Array.from(this.providers.values());
  }
}

export const integrationRegistry = new IntegrationRegistry();
