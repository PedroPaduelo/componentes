// scripts/dark-check.mjs
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"));
await page.goto("http://localhost:5173/components/tree", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForSelector("[data-slot=tree]", { timeout: 10000 });
await page.waitForTimeout(2500);

const info = await page.evaluate(() => {
  const html = document.documentElement;
  return {
    htmlClass: html.className,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
    vitrineTree: (() => {
      const el = document.querySelector("[data-slot=tree]");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const fc = el.querySelector("file-tree-container");
      return {
        dataTheme: el.dataset.theme,
        styleColorScheme: el.style.colorScheme,
        rect: { w: r.width, h: r.height },
        bg: cs.backgroundColor,
        color: cs.color,
        // dentro do file-tree-container
        fcBg: fc ? getComputedStyle(fc).backgroundColor : null,
        // cor do item dentro do shadow
        itemBg: (() => {
          if (!fc?.shadowRoot) return null;
          const item = fc.shadowRoot.querySelector("[data-type=item]");
          return item ? getComputedStyle(item).backgroundColor : null;
        })(),
      };
    }),
  };
});
console.log(JSON.stringify(info, null, 2));

await browser.close();
