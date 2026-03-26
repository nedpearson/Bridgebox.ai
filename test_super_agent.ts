import { config } from 'dotenv';
config();

import { FeatureIngestionAgent } from './src/lib/ai/agents/FeatureIngestionAgent';

async function run() {
  console.log("🚀 Testing Bridgebox Feature Ingestion Agent...");
  
  try {
    const response = await FeatureIngestionAgent.draftCodePrompt({
      intent: "I need a native Calendar widget that syncs with Outlook and Apple Calendar to show task deadlines visually.",
      context: { source: "CLI_TEST" }
    });

    if (response.success) {
      console.log("✅ Success! Agent executed perfectly.");
      console.log("📦 Output Payload:");
      console.log(JSON.stringify(response.data, null, 2));
      console.log(`⏱️ Execution Time: ${response.execution_ms}ms`);
    } else {
      console.error("❌ Agent Failed:", response.error);
    }
  } catch (err) {
    console.error("💥 Fatal Test Error:", err);
  }
}

run();
