// scripts/palette.mjs
// Lê as imagens e extrai a paleta de cores dominantes (top 8)
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

function analyze(file) {
  const data = readFileSync(file);
  const png = PNG.sync.read(data);
  const counts = new Map();
  const w = png.width, h = png.height;
  for (let y = 0; y < h; y += 4) {
    for (let x = 0; x < w; x += 4) {
      const idx = (w * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];
      if (a < 200) continue;
      // quantizar
      const qr = Math.round(r / 16) * 16;
      const qg = Math.round(g / 16) * 16;
      const qb = Math.round(b / 16) * 16;
      const key = `rgb(${qr},${qg},${qb})`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
}

for (const f of [
  "shots/trees-element.png",
  "shots/vitrine-element.png",
  "shots/vitrine-element-dark.png",
]) {
  console.log("\n===", f, "===");
  try {
    const top = analyze(f);
    for (const [c, n] of top) {
      console.log(`  ${c}  ${"█".repeat(Math.min(40, Math.round(n / 50)))} ${n}`);
    }
  } catch (e) {
    console.log("  err:", e.message);
  }
}
