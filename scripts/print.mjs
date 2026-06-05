// scripts/print.mjs
// Captura screenshots com Playwright.
// Uso: node scripts/print.mjs <slug> <url-original>
// Ex:  node scripts/print.mjs shimmering-text https://chanhdai.com/components/shimmering-text
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const slug = process.argv[2];
const originalUrl = process.argv[3];

if (!slug || !originalUrl) {
  console.error("Uso: node scripts/print.mjs <slug> <url-original>");
  process.exit(1);
}

mkdirSync("shots", { recursive: true });

const targets = [
  { name: `original-${slug}`,        url: originalUrl },
  { name: `vitrine-home`,            url: "http://localhost:5173/" },
  { name: `vitrine-${slug}`,         url: `http://localhost:5173/components/${slug}` },
  { name: `vitrine-${slug}-dark`,    url: `http://localhost:5173/components/${slug}` },
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
