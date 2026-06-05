// scripts/debug3.mjs
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:5173/components/tree", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2500);

const treeShadow = await page.evaluate(() => {
  const tc = document.querySelector("[data-slot=tree] file-tree-container");
  if (!tc?.shadowRoot) return null;
  const children = Array.from(tc.shadowRoot.children);
  return {
    childCount: children.length,
    children: children.map((c) => {
      const r = c.getBoundingClientRect();
      const s = getComputedStyle(c);
      return {
        tag: c.tagName,
        attrs: Array.from(c.attributes).map((a) => `${a.name}=${a.value}`).join(" "),
        rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
        display: s.display,
        height: s.height,
        overflow: s.overflow,
        innerHTMLLen: c.innerHTML.length,
      };
    }),
  };
});
console.log("TREE SHADOW CHILDREN:");
console.log(JSON.stringify(treeShadow, null, 2));

// também: dimensões do tree (e o CSS calculado)
const dims = await page.evaluate(() => {
  const wrap = document.querySelector("[data-slot=tree]");
  const tc = wrap?.querySelector("file-tree-container");
  const wr = wrap?.getBoundingClientRect();
  const tr = tc?.getBoundingClientRect();
  return {
    wrapper: wr ? { w: Math.round(wr.width), h: Math.round(wr.height) } : null,
    container: tr ? { w: Math.round(tr.width), h: Math.round(tr.height) } : null,
    containerComputedHeight: getComputedStyle(tc).height,
    containerComputedMinHeight: getComputedStyle(tc).minHeight,
  };
});
console.log("\nDIMS:");
console.log(JSON.stringify(dims, null, 2));

await browser.close();
