// One-time image optimizer: resizes and converts template PNGs to WebP.
// Usage: node --env-file-if-exists=/vercel/share/.env.project scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync } from 'fs';
import { join, extname, basename } from 'path';

const ROOT = 'public/images';
const MAX_WIDTH = 1000; // templates render at max-w-lg (512px); 1000px covers 2x DPR
const QUALITY = 78;

async function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...(await walk(full)));
    else if (extname(entry).toLowerCase() === '.png') files.push(full);
  }
  return files;
}

const pngs = await walk(ROOT);
let before = 0;
let after = 0;

for (const file of pngs) {
  const out = file.replace(/\.png$/i, '.webp');
  const img = sharp(file);
  const meta = await img.metadata();
  const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);
  const info = await img
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);
  before += statSync(file).size;
  after += info.size;
  unlinkSync(file);
  console.log('[v0] optimized', basename(file), `${(statSync.call ? 0 : 0)}`, `${(info.size / 1024).toFixed(0)}KB`);
}

console.log(`[v0] done: ${pngs.length} files, ${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB`);
