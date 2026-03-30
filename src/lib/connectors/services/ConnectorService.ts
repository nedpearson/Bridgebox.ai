import { connectorsService } from "../../db/connectors";
import { ConnectorRegistry } from "../core/ConnectorRegistry";
import { MockConnector } from "../providers/MockConnector";
import type {
  Connector,
  ConnectorProvider,
  SyncResult,
  ConnectorStats,
  ConnectorHealth,
} from "../types";

class ConnectorService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const providers = await connectorsService.getProviders();
    providers.forEach((provider) => {
      ConnectorRegistry.registerProvider(provider);
      ConnectorRegistry.registerImplementation(provider.id, MockConnector);
    });

    this.initialized = true;
  }

  async getAllProviders(): Promise<ConnectorProvider[]> {
    await this.initialize();
    return ConnectorRegistry.getAllProviders();
  }

  async getProvidersByCategory(category: string): Promise<ConnectorProvider[]> {
    await this.initialize();
    return ConnectorRegistry.getProvidersByCategory(category);
  }

  async getConnectorsByOrganization(
    organizationId: string,
  ): Promise<Connector[]> {
    return connectorsService.getConnectorsByOrganization(organizationId);
  }

  async createConnector(
    organizationId: string,
    providerId: string,
  ): Promise<Connector> {
    await this.initialize();

    const provider = ConnectorRegistry.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const connector = await connectorsService.createConnector({
      organizationId,
      providerId: provider.id,
      providerName: provider.displayName,
      type: provider.type,
      category: provider.category,
      status: "not_connected",
      auth: {
        type: provider.authType,
        isAuthenticated: false,
      },
      config: {},
      metadata: {},
    });

    await connectorsService.logEvent(connector.id, organizationId, {
      type: "connected",
      message: `Connector created for ${provider.displayName}`,
    });

    return connector;
  }

  async connectConnector(
    connectorId: string,
    credentials?: Record<string, any>,
  ): Promise<boolean> {
    const connector = await connectorsService.getConnectorById(connectorId);
    if (!connector) {
      throw new Error("Connector not found");
    }

    const provider = ConnectorRegistry.getProvider(connector.providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const instance = ConnectorRegistry.createConnector(connector, provider);
    if (!instance) {
      throw new Error("Failed to create connector instance");
    }

    try {
      const success = await instance.connect(credentials);
      if (success) {
        await connectorsService.updateConnector(connectorId, {
          status: "connected",
          auth: {
            ...connector.auth,
            isAuthenticated: true,
          },
        });
      }
      return success;
    } catch (error: any) {
      await connectorsService.updateConnector(connectorId, {
        status: "error",
        lastSyncError: error.message,
      });
      throw error;
    }
  }

  async disconnectConnector(connectorId: string): Promise<boolean> {
    const connector = await connectorsService.getConnectorById(connectorId);
    if (!connector) {
      throw new Error("Connector not found");
    }

    const provider = ConnectorRegistry.getProvider(connector.providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const instance = ConnectorRegistry.createConnector(connector, provider);
    if (!instance) {
      throw new Error("Failed to create connector instance");
    }

    const success = await instance.disconnect();
    if (success) {
      await connectorsService.updateConnector(connectorId, {
        status: "not_connected",
        auth: {
          ...connector.auth,
          isAuthenticated: false,
        },
      });
    }

    return success;
  }

  async syncConnector(connectorId: string): Promise<SyncResult> {
    const connector = await connectorsService.getConnectorById(connectorId);
    if (!connector) {
      throw new Error("Connector not found");
    }

    const provider = ConnectorRegistry.getProvider(connector.providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    await connectorsService.updateConnector(connectorId, {
      status: "syncing",
    });

    const instance = ConnectorRegistry.createConnector(connector, provider);
    if (!instance) {
      throw new Error("Failed to create connector instance");
    }

    try {
      const result = await instance.syncNow();

      await connectorsService.updateConnector(connectorId, {
        status: "connected",
        lastSyncAt: result.completedAt,
        lastSyncStatus: result.success ? "success" : "error",
        lastSyncError: result.success ? undefined : result.errors?.[0]?.error,
        syncCount: (connector.syncCount || 0) + 1,
        recordCount: (connector.recordCount || 0) + result.recordsCreated,
      });

      await connectorsService.logSyncResult(
        connectorId,
        connector.organizationId,
        result,
      );

      return result;
    } catch (error: any) {
      await connectorsService.updateConnector(connectorId, {
        status: "error",
        lastSyncError: error.message,
      });
      throw error;
    }
  }

  async deleteConnector(connectorId: string): Promise<void> {
    await connectorsService.deleteConnector(connectorId);
  }

  async getConnectorHealth(connectorId: string): Promise<ConnectorHealth> {
    const connector = await connectorsService.getConnectorById(connectorId);
    if (!connector) {
      throw new Error("Connector not found");
    }

    const provider = ConnectorRegistry.getProvider(connector.providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const instance = ConnectorRegistry.createConnector(connector, provider);
    if (!instance) {
      throw new Error("Failed to create connector instance");
    }

    return instance.getHealth();
  }

  async getStats(organizationId: string): Promise<ConnectorStats> {
    return connectorsService.getConnectorStats(organizationId);
  }
}

export { ConnectorService };
export const connectorService = new ConnectorService();
