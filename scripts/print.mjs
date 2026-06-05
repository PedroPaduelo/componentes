// scripts/print.mjs
// Captura screenshots com Playwright.
// Uso: node scripts/print.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("shots", { recursive: true });

const targets = [
  { name: "trees-home",         url: "https://trees.software/" },
  { name: "vitrine-home",       url: "http://localhost:5173/" },
  { name: "vitrine-tree",       url: "http://localhost:5173/components/tree" },
  { name: "vitrine-tree-dark",  url: "http://localhost:5173/components/tree" },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const t of targets) {
  const page = await ctx.newPage();
  if (t.name.endsWith("-dark")) {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark");
    });
  }
  try {
    await page.goto(t.url, { waitUntil: "networkidle", timeout: 30000 });
  } catch (e) {
    console.warn(`goto warn ${t.name}: ${e.message}`);
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `shots/${t.name}.png`, fullPage: false });
  console.log(`✓ shots/${t.name}.png`);
  await page.close();
}

await browser.close();
console.log("done");
