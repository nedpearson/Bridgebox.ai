import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://bridgebox.ai';

const corePages = [
  '/',
  '/platform',
  '/solutions',
  '/use-cases',
  '/services',
  '/custom-software',
  '/dashboards',
  '/mobile-apps',
  '/case-studies',
  '/industries',
  '/pricing',
  '/contact',
  '/about',
  '/sales-onboarding',
  '/start'
];

let pages = [...corePages];

try {
  const registryRaw = fs.readFileSync(path.join(__dirname, '../src/data/seo-content/registry.json'), 'utf-8');
  const registry = JSON.parse(registryRaw);
  
  registry.forEach(route => {
    pages.push(`/${route.category}/${route.slug}`);
  });
} catch (err) {
  console.warn(`Could not load programmatic SEO registry. Generating standard core pages.`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>${page === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '/' ? '1.0' : page.startsWith('/solutions/') || page === '/platform' ? '0.9' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml);
console.log(`✅ [SEO] sitemap.xml generated with ${pages.length} URLs.`);

// Also generate a permissive robots.txt that points to the sitemap!
const robotsTxt = `User-agent: *
Allow: /
Disallow: /app/
Disallow: /admin/
Disallow: /portal/
Disallow: /onboarding/

Sitemap: ${BASE_URL}/sitemap.xml`;

fs.writeFileSync(path.join(__dirname, '../public/robots.txt'), robotsTxt);
console.log('✅ [SEO] robots.txt generated with strict Disallow logic for internal application routes.');
