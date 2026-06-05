// scripts/debug2.mjs
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on("console", (msg) => {
  console.log(`[${msg.type()}]`, msg.text());
});
page.on("pageerror", (err) => {
  console.log("[pageerror]", err.message);
});

await page.goto("http://localhost:5173/components/tree", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(3000);

const state = await page.evaluate(() => {
  const tc = document.querySelector("[data-slot=tree] file-tree-container");
  return {
    hasFileTreeContainer: !!tc,
    innerHTML: tc?.innerHTML?.slice(0, 500),
    childCount: tc?.childElementCount,
    hasShadowRoot: !!tc?.shadowRoot,
    shadowChildCount: tc?.shadowRoot?.childElementCount,
    shadowInner: tc?.shadowRoot?.innerHTML?.slice(0, 500),
    // verificar customElements
    customElementDefined: !!customElements.get("file-tree-container"),
  };
});

console.log("\n--- STATE ---");
console.log(JSON.stringify(state, null, 2));

await browser.close();
