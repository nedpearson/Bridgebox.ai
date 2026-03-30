export interface NormalizedEvent {
  type: "event";
  source: string;
  sourceId: string;
  title: string;
  description?: string;
  timestamp: Date;
  participants?: string[];
  metadata: Record<string, any>;
}

export interface NormalizedMetric {
  type: "metric";
  source: string;
  sourceId: string;
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  dimensions: Record<string, any>;
  metadata: Record<string, any>;
}

export interface NormalizedEntity {
  type: "entity";
  source: string;
  sourceId: string;
  entityType: string;
  name: string;
  properties: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  metadata: Record<string, any>;
}

export type NormalizedData =
  | NormalizedEvent
  | NormalizedMetric
  | NormalizedEntity;

export class DataNormalizer {
  static normalizeEvent(data: {
    source: string;
    sourceId: string;
    title: string;
    description?: string;
    timestamp: Date | string;
    participants?: string[];
    metadata?: Record<string, any>;
  }): NormalizedEvent {
    return {
      type: "event",
      source: data.source,
      sourceId: data.sourceId,
      title: data.title,
      description: data.description,
      timestamp:
        typeof data.timestamp === "string"
          ? new Date(data.timestamp)
          : data.timestamp,
      participants: data.participants || [],
      metadata: data.metadata || {},
    };
  }

  static normalizeMetric(data: {
    source: string;
    sourceId: string;
    name: string;
    value: number | string;
    unit?: string;
    timestamp: Date | string;
    dimensions?: Record<string, any>;
    metadata?: Record<string, any>;
  }): NormalizedMetric {
    return {
      type: "metric",
      source: data.source,
      sourceId: data.sourceId,
      name: data.name,
      value:
        typeof data.value === "string" ? parseFloat(data.value) : data.value,
      unit: data.unit,
      timestamp:
        typeof data.timestamp === "string"
          ? new Date(data.timestamp)
          : data.timestamp,
      dimensions: data.dimensions || {},
      metadata: data.metadata || {},
    };
  }

  static normalizeEntity(data: {
    source: string;
    sourceId: string;
    entityType: string;
    name: string;
    properties: Record<string, any>;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    metadata?: Record<string, any>;
  }): NormalizedEntity {
    return {
      type: "entity",
      source: data.source,
      sourceId: data.sourceId,
      entityType: data.entityType,
      name: data.name,
      properties: data.properties,
      createdAt: data.createdAt
        ? typeof data.createdAt === "string"
          ? new Date(data.createdAt)
          : data.createdAt
        : undefined,
      updatedAt: data.updatedAt
        ? typeof data.updatedAt === "string"
          ? new Date(data.updatedAt)
          : data.updatedAt
        : undefined,
      metadata: data.metadata || {},
    };
  }

  static inferType(data: any): "event" | "metric" | "entity" {
    if (data.participants || data.attendees || data.start || data.end) {
      return "event";
    }

    if (
      typeof data.value === "number" ||
      data.amount !== undefined ||
      data.count !== undefined
    ) {
      return "metric";
    }

    return "entity";
  }

  static autoNormalize(
    source: string,
    sourceId: string,
    rawData: any,
  ): NormalizedData {
    const type = this.inferType(rawData);

    switch (type) {
      case "event":
        return this.normalizeEvent({
          source,
          sourceId,
          title:
            rawData.title ||
            rawData.summary ||
            rawData.name ||
            "Untitled Event",
          description: rawData.description || rawData.body,
          timestamp:
            rawData.timestamp ||
            rawData.start ||
            rawData.createdAt ||
            new Date(),
          participants: rawData.participants || rawData.attendees,
          metadata: rawData,
        });

      case "metric":
        return this.normalizeMetric({
          source,
          sourceId,
          name: rawData.name || rawData.metric || "Unnamed Metric",
          value: rawData.value || rawData.amount || rawData.count || 0,
          unit: rawData.unit || rawData.currency,
          timestamp: rawData.timestamp || rawData.date || new Date(),
          dimensions: this.extractDimensions(rawData),
          metadata: rawData,
        });

      case "entity":
        return this.normalizeEntity({
          source,
          sourceId,
          entityType: rawData.type || rawData.entityType || "unknown",
          name: rawData.name || rawData.title || `Entity ${sourceId}`,
          properties: this.extractProperties(rawData),
          createdAt: rawData.createdAt || rawData.created_at || rawData.created,
          updatedAt: rawData.updatedAt || rawData.updated_at || rawData.updated,
          metadata: rawData,
        });
    }
  }

  private static extractDimensions(data: any): Record<string, any> {
    const dimensions: Record<string, any> = {};
    const dimensionFields = [
      "category",
      "type",
      "status",
      "source",
      "region",
      "segment",
    ];

    for (const field of dimensionFields) {
      if (data[field] !== undefined) {
        dimensions[field] = data[field];
      }
    }

    return dimensions;
  }

  private static extractProperties(data: any): Record<string, any> {
    const properties: Record<string, any> = {};
    const excludedFields = [
      "id",
      "type",
      "entityType",
      "name",
      "title",
      "createdAt",
      "updatedAt",
      "created_at",
      "updated_at",
    ];

    for (const [key, value] of Object.entries(data)) {
      if (!excludedFields.includes(key)) {
        properties[key] = value;
      }
    }

    return properties;
  }

  static toStorageFormat(normalized: NormalizedData): {
    data_type: string;
    normalized_data: Record<string, any>;
    metadata: Record<string, any>;
  } {
    return {
      data_type: normalized.type,
      normalized_data: {
        ...normalized,
        timestamp:
          normalized.type === "event" || normalized.type === "metric"
            ? normalized.timestamp.toISOString()
            : undefined,
      },
      metadata: normalized.metadata,
    };
  }
}
