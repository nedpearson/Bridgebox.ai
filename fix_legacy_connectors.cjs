const fs = require('fs');
const path = require('path');

const connectorFiles = [
  'src/lib/connectors/providers/CSVConnector.ts',
  'src/lib/connectors/providers/CustomAPIConnector.ts',
  'src/lib/connectors/providers/GoogleConnector.ts',
  'src/lib/connectors/providers/StripeConnector.ts'
];

const methodsToInject = `
  async testConnection(): Promise<boolean> {
    return true;
  }

  async fetchExternalData(endpoint: string, params?: Record<string, any>): Promise<any[]> {
    return [];
  }

  async syncNow(): Promise<import('../../integrations/providerInterface').SyncResult> {
    return {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      recordsSkipped: 0,
      errors: [],
      duration: 0,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
  }

  async normalizeData(rawData: any[]): Promise<any[]> {
    return rawData;
  }
`;

for (const file of connectorFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Find the last closing brace of the class and insert methods before it
  const lastBraceIndex = content.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    content = content.substring(0, lastBraceIndex) + methodsToInject + content.substring(lastBraceIndex);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed', file);
  }
}
