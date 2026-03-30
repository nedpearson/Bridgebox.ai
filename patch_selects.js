import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TABLES = [
  "profiles",
  "organizations",
  "organization_memberships",
  "projects",
  "project_milestones",
  "deliverables",
  "billing_plans",
  "subscriptions",
  "invoices",
  "support_tickets",
  "integrations",
  "workflows",
  "workflow_steps",
  "global_tasks",
  "global_communications",
  "subscription_plans",
  "ticket_comments",
  "delivery_notes",
  "workflow_executions",
  "workflow_step_executions",
  "workflow_templates",
  "organization_branding",
  "organization_feature_flags",
  "custom_roles",
  "plan_features",
];

// Replaces occurrences inside strings like: .select('*, profiles(...)')
const SELECT_REGEX = /\.select\(['`"]([^'"`]+)['`"]\)/g;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), "src"));

let filesChanged = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let originalContent = content;

  // Replace old table names in .select('') calls
  content = content.replace(SELECT_REGEX, (match, selectBody) => {
    let newSelectBody = selectBody;
    TABLES.forEach((table) => {
      // replace table( with bb_table(
      newSelectBody = newSelectBody.replace(
        new RegExp(`\\b${table}\\(`, "g"),
        `bb_${table}(`,
      );
      // replace table! with bb_table!
      newSelectBody = newSelectBody.replace(
        new RegExp(`\\b${table}!`, "g"),
        `bb_${table}!`,
      );
      // replace workflow:workflows with workflow:bb_workflows
      newSelectBody = newSelectBody.replace(
        new RegExp(`:\\s*${table}\\b`, "g"),
        `:bb_${table}`,
      );
    });
    return match.replace(selectBody, newSelectBody);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, "utf8");
    console.log(
      `Updated nested selects in: ${path.relative(process.cwd(), file)}`,
    );
    filesChanged++;
  }
});

console.log(`Done. Updated ${filesChanged} files.`);
