#!/usr/bin/env node
/**
 * Post-processes the prerendered output in dist/ for GitHub Pages:
 *  - 404/index.html -> 404.html (GitHub Pages serves it for unknown URLs)
 *  - hero preload: point it at the AVIF files the <picture> actually uses, with type="image/avif"
 *    so browsers without AVIF support skip it and use the WebP <img> instead
 *  - removes index.csr.html (every route is prerendered)
 *  - writes sitemap.xml with today's date (robots.txt in public/ points to it)
 */
import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist/bike-stand/browser');
const SITE = 'https://anevrensburg.github.io/bike-stand';

// 1. 404 page
await rename(path.join(dist, '404/index.html'), path.join(dist, '404.html'));
await rm(path.join(dist, '404'), { recursive: true });

// 2. Rewrite NgOptimizedImage preloads for local images to AVIF
const htmlFiles = [];
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await collect(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
await collect(dist);
let rewritten = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const next = html.replace(/<link\b[^>]*\bas="image"[^>]*\brel="preload"[^>]*>/g, (tag) => {
    if (!tag.includes('href="images/')) return tag;
    rewritten++;
    return tag.replace(/\.webp\b/g, '.avif').replace('<link ', '<link type="image/avif" ');
  });
  if (next !== html) await writeFile(file, next);
}

// 3. Not needed: every route is prerendered
await rm(path.join(dist, 'index.csr.html'), { force: true });

// 4. Sitemap (the site is a single page)
const today = new Date().toISOString().slice(0, 10);
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`,
);

console.log(`postbuild: 404.html, sitemap.xml, ${rewritten} AVIF preload(s)`);
