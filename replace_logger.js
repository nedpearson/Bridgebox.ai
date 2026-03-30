const fs = require("fs");
const files = [
  {
    p: "src/lib/stripe/webhookHandlers.ts",
    imp: "import { Logger } from '../logger';\n",
  },
  {
    p: "src/lib/systemIntegration.ts",
    imp: "import { Logger } from './logger';\n",
  },
  {
    p: "src/lib/internalRecordings.ts",
    imp: "import { Logger } from './logger';\n",
  },
  {
    p: "src/lib/intelligenceOrchestrator.ts",
    imp: "import { Logger } from './logger';\n",
  },
  {
    p: "src/lib/integrations/providers/clio.ts",
    imp: "import { Logger } from '../../logger';\n",
  },
  {
    p: "src/lib/engines/workflowExecutor.ts",
    imp: "import { Logger } from '../logger';\n",
  },
  {
    p: "src/lib/engines/aiTemplateGenerator.ts",
    imp: "import { Logger } from '../logger';\n",
  },
  {
    p: "src/lib/connectors/core/BaseConnector.ts",
    imp: "import { Logger } from '../../logger';\n",
  },
  {
    p: "src/lib/db/templateInstallEngine.ts",
    imp: "import { Logger } from '../logger';\n",
  },
];
for (let f of files) {
  if (fs.existsSync(f.p)) {
    let c = fs.readFileSync(f.p, "utf8");
    if (!c.includes("import { Logger }")) {
      c = f.imp + c;
    }
    c = c
      .replace(/console\.log/g, "Logger.info")
      .replace(/console\.warn/g, "Logger.warn")
      .replace(/console\.error/g, "Logger.error");
    fs.writeFileSync(f.p, c);
  }
}
