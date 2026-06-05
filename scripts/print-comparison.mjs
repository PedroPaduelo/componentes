// scripts/print-comparison.mjs
import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
const page = await ctx.newPage();
await page.goto("file://" + new URL("../shots/index.html", import.meta.url).pathname, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.screenshot({ path: "shots/comparison.png", fullPage: true });
await browser.close();
console.log("✓ shots/comparison.png");
