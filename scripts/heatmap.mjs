// scripts/heatmap.mjs
// Tira um print do tree + extrai a paleta de cores dominantes via canvas
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function captureTreeColors(url, label, opts = {}) {
  const page = await ctx.newPage();
  if (opts.dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"));
  }
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2500);

  // Scroll até a tree
  await page.evaluate(() => {
    const el = document.querySelector("[data-slot=tree]") || document.querySelector("file-tree-container");
    el?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(500);

  // Screenshot só do elemento tree
  const target = await page.evaluateHandle(() => {
    return document.querySelector("[data-slot=tree]") || document.querySelector("file-tree-container");
  });
  const targetEl = target.asElement();
  if (targetEl) {
    await targetEl.screenshot({ path: `shots/${label}.png` });
  }

  // Screenshot da viewport pra contexto
  await page.screenshot({ path: `shots/${label}-viewport.png` });

  await page.close();
  return label;
}

await captureTreeColors("https://trees.software/", "trees-element");
await captureTreeColors("http://localhost:5173/components/tree", "vitrine-element");
await captureTreeColors("http://localhost:5173/components/tree", "vitrine-element-dark", { dark: true });

console.log("done");
await browser.close();
