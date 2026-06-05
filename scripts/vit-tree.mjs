// scripts/vit-tree.mjs
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:5173/components/tree", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2000);

const tree = await page.evaluate(() => {
  const wrap = document.querySelector("[data-slot=tree]");
  if (!wrap) return { error: "no [data-slot=tree]" };
  const tc = wrap.querySelector("file-tree-container");
  return {
    wrap: {
      rect: (() => { const r = wrap.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })(),
      computedHeight: getComputedStyle(wrap).height,
    },
    tc: tc ? {
      rect: (() => { const r = tc.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })(),
      computedHeight: getComputedStyle(tc).height,
      computedDisplay: getComputedStyle(tc).display,
      shadowChildren: tc.shadowRoot ? Array.from(tc.shadowRoot.children).map((c) => ({
        tag: c.tagName,
        rect: (() => { const r = c.getBoundingClientRect(); return { w: r.width, h: r.height }; })(),
        display: getComputedStyle(c).display,
      })) : null,
    } : null,
  };
});
console.log(JSON.stringify(tree, null, 2));

await browser.close();
