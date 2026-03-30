import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://bridgebox.ai';

// Simple Regex Extractor to avoid ts-node overhead during CI/CD build scripts
function extractSlugsFromTsFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const slugMatches = [...content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)];
    return slugMatches.map(match => match[1]);
  } catch (error) {
    console.warn(`Could not read ${filePath} for SEO generation. Assuming empty.`);
    return [];
  }
}

// Map the static programmatic arrays
const industries = extractSlugsFromTsFile(path.join(__dirname, '../src/data/marketing/industries.ts'));
const useCases = extractSlugsFromTsFile(path.join(__dirname, '../src/data/marketing/use-cases.ts'));
const integrations = extractSlugsFromTsFile(path.join(__dirname, '../src/data/marketing/integrations.ts'));
const comparisons = extractSlugsFromTsFile(path.join(__dirname, '../src/data/marketing/comparisons.ts'));
const features = extractSlugsFromTsFile(path.join(__dirname, '../src/data/marketing/features.ts'));

// Build Core Pages structure
const pages = [
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

// Append dynamic pages
industries.forEach(slug => pages.push(`/solutions/${slug}`));
useCases.forEach(slug => pages.push(`/use-cases/${slug}`));
integrations.forEach(slug => pages.push(`/integrations/${slug}`));
comparisons.forEach(slug => pages.push(`/compare/${slug}`));
features.forEach(slug => pages.push(`/features/${slug}`));

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
