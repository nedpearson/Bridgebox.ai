import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'src'));
const missingTables = new Set();
// match .from('table_name') or .from("table_name") or .from(`table_name`)
const FROM_REGEX = /\.from\(['"`]([a-zA-Z0-9_]+)['"`]\)/g;

let filesUpdated = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  let match;
  while ((match = FROM_REGEX.exec(content)) !== null) {
    const tableName = match[1];
    if (!tableName.startsWith('bb_')) {
      // Ignored tables that aren't bb_
      if (['fcpa_', 'stripe_', 'pnx_'].some(prefix => tableName.startsWith(prefix))) continue;
      // Is it a supabase rpc or auth table? No, .from() is only for tables
      missingTables.add(tableName);
    }
  }

  // Update these missing ones
  const tablesArray = Array.from(missingTables);
  if (tablesArray.length > 0) {
    tablesArray.forEach(table => {
      content = content.replace(new RegExp(`\\.from\\(['"\`]${table}['"\`]\\)`, 'g'), `.from('bb_${table}')`);
    });

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      filesUpdated++;
      console.log(`Updated missing .from statements in: ${path.relative(process.cwd(), file)}`);
    }
  }
});

console.log('Missing tables found:', Array.from(missingTables));
console.log(`Updated ${filesUpdated} files.`);
