import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add lazy/Suspense to React import if not there
if (!content.includes("from 'react'")) {
  content = `import React, { lazy, Suspense } from 'react';\n` + content;
} else if (!content.includes('lazy')) {
  content = content.replace("from 'react';", ", lazy, Suspense } from 'react';");
}

// 2. Identify all standard default page imports from './pages...'
const importRegex = /^import\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+['"](\.\/pages\/[^'"]+)['"];$/gm;
let newContent = content;

newContent = newContent.replace(importRegex, (match, componentName, path) => {
  return `const ${componentName} = lazy(() => import('${path}'));`;
});

// Identify structured lazy loading for named imports (Documents, Workflows, etc.)
const namedImportRegex = /^import\s+\{\s*([A-Za-z0-9_,\s]+)\s*\}\s+from\s+['"](\.\/pages\/[^'"]+)['"];$/gm;
newContent = newContent.replace(namedImportRegex, (match, importsStr, path) => {
  const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
  return imports.map(imp => {
    return `const ${imp} = lazy(() => import('${path}').then(module => ({ default: module.${imp} })));`;
  }).join('\n');
});

// 3. Wrap <Routes> with <Suspense fallback={<LoadingSpinner />}>
// However, App.tsx has multiple <Routes> blocks. Let's just wrap the inner route structures.
// Wait, replacing <Routes> with <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><LoadingSpinner /></div>}><Routes>
newContent = newContent.replace(/<Routes>/g, `<Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><LoadingSpinner /></div>}>\n          <Routes>`);
newContent = newContent.replace(/<\/Routes>/g, `</Routes>\n          </Suspense>`);

fs.writeFileSync('src/App.tsx', newContent);
console.log('App.tsx refactored for lazy loading');
