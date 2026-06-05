// scripts/visual-diff.mjs
// Extrai estrutura visual detalhada de ambos os sites pra comparar.
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function snapshot(url, label, opts = {}) {
  const page = await ctx.newPage();
  if (opts.dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"));
  }
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const snap = await page.evaluate((opts) => {
    function deepInspect(root, depth = 0, max = 4) {
      if (depth > max) return null;
      const out = [];
      for (const el of root.children) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const text = (el.textContent ?? "").trim().slice(0, 60);
        const sr = el.shadowRoot;
        const node = {
          tag: el.tagName.toLowerCase(),
          text: text || undefined,
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          bg: cs.backgroundColor !== "rgba(0, 0, 0, 0)" ? cs.backgroundColor : undefined,
          color: cs.color !== "rgb(0, 0, 0)" ? cs.color : undefined,
          display: cs.display !== "block" ? cs.display : undefined,
          border: cs.borderRadius !== "0px" ? `r=${cs.borderRadius}` : undefined,
        };
        if (sr) {
          node.shadow = deepInspect(sr, depth + 1, max);
        } else {
          const kids = deepInspect(el, depth + 1, max);
          if (kids?.length) node.children = kids;
        }
        out.push(node);
      }
      return out;
    }
    return deepInspect(document.body, 0, opts.maxDepth ?? 4);
  }, opts);

  await page.close();
  return snap;
}

const t = await snapshot("https://trees.software/", "trees", { maxDepth: 3 });
const v = await snapshot("http://localhost:5173/components/tree", "vitrine", { maxDepth: 3 });

// achar a tree em cada um
function findTree(nodes, depth = 0) {
  for (const n of nodes) {
    if (n.tag === "file-tree-container" || n.tag === "[data-slot=tree]") return n;
    if (n.shadow) {
      const f = findTree(n.shadow, depth + 1);
      if (f) return f;
    }
    if (n.children) {
      const f = findTree(n.children, depth + 1);
      if (f) return f;
    }
  }
  return null;
}

const tTree = findTree(t);
const vTree = findTree(v);

console.log("=== TREES.SOFTWARE TREE (deep) ===");
console.log(JSON.stringify(tTree, null, 2));
console.log("\n=== VITRINE TREE (deep) ===");
console.log(JSON.stringify(vTree, null, 2));

await browser.close();
