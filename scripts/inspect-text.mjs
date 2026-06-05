// scripts/inspect-text.mjs
// Extrai o primeiro item da árvore e mostra o texto
import { chromium } from "playwright";

async function inspect(url, opts = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  if (opts.dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"));
  }
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2500);

  const data = await page.evaluate(() => {
    function findFileTree(el) {
      return el.tagName === "FILE-TREE-CONTAINER" ? el : null;
    }
    const tc = Array.from(document.querySelectorAll("file-tree-container")).find(findFileTree);
    if (!tc?.shadowRoot) return null;
    const items = Array.from(tc.shadowRoot.querySelectorAll("[data-type=item]")).slice(0, 5);
    return items.map((it) => {
      const r = it.getBoundingClientRect();
      const s = getComputedStyle(it);
      return {
        text: (it.textContent ?? "").trim().slice(0, 60),
        width: Math.round(r.width),
        height: Math.round(r.height),
        bg: s.backgroundColor,
        color: s.color,
        font: s.fontSize + " " + s.fontFamily.split(",")[0],
      };
    });
  });
  await browser.close();
  return data;
}

console.log("trees.software items:");
console.log(JSON.stringify(await inspect("https://trees.software/"), null, 2));
console.log("\nvitrine light items:");
console.log(JSON.stringify(await inspect("http://localhost:5173/components/tree"), null, 2));
console.log("\nvitrine dark items:");
console.log(JSON.stringify(await inspect("http://localhost:5173/components/tree", { dark: true }), null, 2));
