// scripts/debug.mjs
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Capturar erros do console
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    console.log(`[${msg.type()}]`, msg.text());
  }
});
page.on("pageerror", (err) => {
  console.log("[pageerror]", err.message);
});

await page.goto("http://localhost:5173/components/tree", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2000);

const html = await page.evaluate(() => {
  const tree = document.querySelector("[data-slot=tree]");
  return {
    treeHTML: tree ? tree.outerHTML.slice(0, 2000) : null,
    treeChildHTML: tree?.firstElementChild?.outerHTML?.slice(0, 1500) ?? null,
    bodyChildren: Array.from(document.body.children).map((c) => c.tagName + (c.className ? "." + c.className.split(" ").join(".") : "")),
  };
});

console.log("--- TREE HTML ---");
console.log(html.treeHTML);
console.log("--- TREE FIRST CHILD HTML ---");
console.log(html.treeChildHTML);

await browser.close();
