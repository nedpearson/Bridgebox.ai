import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEO_DIR = path.join(__dirname, '../src/data/seo-content');
const REGISTRY_FILE = path.join(SEO_DIR, 'registry.json');
const CATEGORIES = ['blog', 'compare', 'features', 'industry', 'integrations', 'use-cases'];

async function buildRegistry() {
  console.log('🔄 [SEO Engine] Recompiling the Programmatic Content Registry...');
  const registry = [];

  for (const category of CATEGORIES) {
    const categoryPath = path.join(SEO_DIR, category);
    
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(categoryPath, file), 'utf-8');
          const data = JSON.parse(raw);
          
          if (data.category && data.slug) {
            registry.push({
              category: data.category,
              slug: data.slug,
              keyword: data.keyword || data.slug.replace(/-/g, ' ')
            });
          }
        } catch (err) {
          console.error(`❌ [SEO Engine] Failed to parse ${category}/${file}:`, err.message);
        }
      }
    }
  }

  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
  console.log(`✅ [SEO Engine] Registry successfully updated with ${registry.length} dynamic pages.`);
}

buildRegistry();
