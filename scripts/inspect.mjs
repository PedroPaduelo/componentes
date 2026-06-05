// scripts/inspect.mjs
// Extrai informação estrutural: dimensões de elementos, cores computadas,
// estrutura DOM, etc. Pra comparar visualmente o original com a vitrine.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function inspect(url, label) {
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const result = { label: location.href, title: document.title, view: {} };

    // viewport
    result.view.width = window.innerWidth;
    result.view.height = window.innerHeight;

    // body computed colors
    const cs = getComputedStyle(document.body);
    result.body = {
      bg: cs.backgroundColor,
      color: cs.color,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
    };

    // file tree
    const tree = document.querySelector("file-tree-container, [data-file-tree-style]");
    if (tree) {
      const tr = tree.getBoundingClientRect();
      const ts = getComputedStyle(tree);
      result.tree = {
        rect: { x: tr.x, y: tr.y, width: tr.width, height: tr.height },
        bg: ts.backgroundColor,
        color: ts.color,
        fontFamily: ts.fontFamily,
        fontSize: ts.fontSize,
        fontWeight: ts.fontWeight,
        borderRadius: ts.borderRadius,
        // primeiros items
        items: Array.from(tree.querySelectorAll("[role=treeitem], [data-type=item]"))
          .slice(0, 8)
          .map((it) => {
            const r = it.getBoundingClientRect();
            const s = getComputedStyle(it);
            return {
              text: it.textContent?.trim().slice(0, 50),
              width: Math.round(r.width),
              height: Math.round(r.height),
              bg: s.backgroundColor,
              color: s.color,
              fontSize: s.fontSize,
              padding: s.padding,
            };
          }),
      };
    } else {
      result.tree = null;
    }

    return result;
  });

  console.log(JSON.stringify(info, null, 2));
  writeFileSync(`shots/${label}.json`, JSON.stringify(info, null, 2));
  await page.close();
  return info;
}

const t = await inspect("https://trees.software/", "trees-inspect");
const v = await inspect("http://localhost:5173/components/tree", "vitrine-inspect");

// Diff
console.log("\n=== DIFF ===");
console.log("trees tree rect:", t.tree?.rect);
console.log("vitrine tree rect:", v.tree?.rect);
console.log("trees tree bg:", t.tree?.bg, "color:", t.tree?.color);
console.log("vitrine tree bg:", v.tree?.bg, "color:", v.tree?.color);
console.log("trees first item:", t.tree?.items?.[0]);
console.log("vitrine first item:", v.tree?.items?.[0]);

await browser.close();
