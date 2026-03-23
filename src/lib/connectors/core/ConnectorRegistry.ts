import type { ConnectorProvider } from '../types';
import { BaseConnector } from './BaseConnector';

type ConnectorConstructor = new (connector: any, provider: ConnectorProvider) => BaseConnector;

export class ConnectorRegistry {
  private static providers: Map<string, ConnectorProvider> = new Map();
  private static implementations: Map<string, ConnectorConstructor> = new Map();

  static registerProvider(provider: ConnectorProvider): void {
    this.providers.set(provider.id, provider);
  }

  static registerImplementation(
    providerId: string,
    implementation: ConnectorConstructor
  ): void {
    this.implementations.set(providerId, implementation);
  }

  static getProvider(providerId: string): ConnectorProvider | undefined {
    return this.providers.get(providerId);
  }

  static getAllProviders(): ConnectorProvider[] {
    return Array.from(this.providers.values());
  }

  static getProvidersByCategory(category: string): ConnectorProvider[] {
    return Array.from(this.providers.values()).filter(
      (p) => p.category === category
    );
  }

  static getPopularProviders(): ConnectorProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.isPopular);
  }

  static hasImplementation(providerId: string): boolean {
    return this.implementations.has(providerId);
  }

  static createConnector(
    connector: any,
    provider: ConnectorProvider
  ): BaseConnector | null {
    const Implementation = this.implementations.get(provider.id);
    if (!Implementation) {
      console.warn(`No implementation found for provider: ${provider.id}`);
      return null;
    }
    return new Implementation(connector, provider);
  }

  static isAvailable(providerId: string): boolean {
    const provider = this.providers.get(providerId);
    return provider?.status === 'available';
  }
}
