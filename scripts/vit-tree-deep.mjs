// scripts/vit-tree-deep.mjs
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:5173/components/tree", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2500);

const deep = await page.evaluate(() => {
  const tc = document.querySelector("[data-slot=tree] file-tree-container");
  if (!tc?.shadowRoot) return null;
  const root = tc.shadowRoot.querySelector("[data-file-tree-virtualized-root=true]");
  if (!root) return { shadowChildren: Array.from(tc.shadowRoot.children).map(c => c.tagName) };
  function walk(el, depth) {
    if (depth > 5) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      attrs: Array.from(el.attributes).map((a) => `${a.name}=${a.value.slice(0,30)}`).join(" "),
      rect: { w: Math.round(r.width), h: Math.round(r.height) },
      bg: cs.backgroundColor,
      color: cs.color,
      display: cs.display,
      text: el.textContent?.trim().slice(0, 50),
      children: Array.from(el.children).slice(0, 5).map((c) => walk(c, depth+1)).filter(Boolean),
    };
  }
  return {
    root: walk(root, 0),
    rootChildrenCount: root.children.length,
    rootInnerHTML: root.innerHTML.slice(0, 800),
  };
});
console.log(JSON.stringify(deep, null, 2));

await browser.close();
