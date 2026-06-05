// scripts/first-tree.mjs
import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:5173/components/tree", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2500);
// garante light
await page.evaluate(() => localStorage.setItem("vitrine-theme", "light"));

const info = await page.evaluate(() => {
  const el = document.querySelector("[data-slot=tree]");
  if (!el) return { error: "not found" };
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const fc = el.querySelector("file-tree-container");
  const fcCs = fc ? getComputedStyle(fc) : null;
  return {
    rect: { w: r.width, h: r.height },
    bg: cs.backgroundColor,
    color: cs.color,
    dataTheme: el.dataset.theme,
    colorScheme: el.style.colorScheme,
    fc: fc ? {
      bg: fcCs.backgroundColor,
      color: fcCs.color,
      colorScheme: fcCs.colorScheme,
      // item dentro do shadow
      item: (() => {
        if (!fc.shadowRoot) return null;
        const i = fc.shadowRoot.querySelector("[data-type=item]");
        if (!i) return null;
        const ir = i.getBoundingClientRect();
        const is = getComputedStyle(i);
        return {
          text: i.textContent?.trim().slice(0, 30),
          rect: { w: ir.width, h: ir.height },
          bg: is.backgroundColor,
          color: is.color,
          fontSize: is.fontSize,
        };
      })(),
    } : null,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
