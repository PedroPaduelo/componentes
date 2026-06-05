// scripts/dark-check2.mjs
import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("[err]", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("[console.error]", m.text());
});
await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"));
await page.goto("http://localhost:5173/components/tree", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll("*"));
  const slotTrees = all.filter((e) => e.getAttribute("data-slot") === "tree");
  const fileTreeContainers = all.filter((e) => e.tagName === "FILE-TREE-CONTAINER");
  const h1 = document.querySelector("h1");
  return {
    htmlClass: document.documentElement.className,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyChildren: Array.from(document.body.children).map((c) => c.tagName),
    slotTrees: slotTrees.length,
    fileTreeContainers: fileTreeContainers.length,
    fileTreeContainerInfo: fileTreeContainers.slice(0, 3).map((c) => ({
      rect: (() => { const r = c.getBoundingClientRect(); return { w: r.width, h: r.height }; })(),
      parent: c.parentElement?.tagName,
      parentDataSlot: c.parentElement?.getAttribute("data-slot"),
    })),
    h1Text: h1?.textContent,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
