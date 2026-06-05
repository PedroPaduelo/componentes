// scripts/inspect.mjs
// Extrai informação estrutural: dimensões de elementos, cores computadas,
// estrutura DOM, etc. Pra comparar visualmente o original com a vitrine.
// Uso: node scripts/inspect.mjs <slug> <data-slot-name>
// Ex:  node scripts/inspect.mjs shimmering-text shimmering-text
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const slug = process.argv[2];
const slotName = process.argv[3];

if (!slug || !slotName) {
  console.error("Uso: node scripts/inspect.mjs <slug> <data-slot-name>");
  process.exit(1);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function inspect(url, label) {
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const info = await page.evaluate((slot) => {
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

    // component wrapper
    const wrap = document.querySelector(`[data-slot="${slot}"]`);
    if (wrap) {
      const wr = wrap.getBoundingClientRect();
      const ws = getComputedStyle(wrap);
      result.wrap = {
        rect: { x: wr.x, y: wr.y, width: wr.width, height: wr.height },
        bg: ws.backgroundColor,
        color: ws.color,
        fontFamily: ws.fontFamily,
        fontSize: ws.fontSize,
        fontWeight: ws.fontWeight,
        borderRadius: ws.borderRadius,
        // filhos diretos
        children: Array.from(wrap.children).slice(0, 5).map((child) => {
          const cr = child.getBoundingClientRect();
          const cs2 = getComputedStyle(child);
          return {
            tag: child.tagName.toLowerCase(),
            text: child.textContent?.trim().slice(0, 80),
            width: Math.round(cr.width),
            height: Math.round(cr.height),
            bg: cs2.backgroundColor,
            color: cs2.color,
          };
        }),
      };
    } else {
      result.wrap = null;
    }

    return result;
  }, slotName);

  console.log(JSON.stringify(info, null, 2));
  writeFileSync(`shots/${label}-inspect.json`, JSON.stringify(info, null, 2));
  await page.close();
  return info;
}

const originalUrl = `https://chanhdai.com/components/${slug}`;
const t = await inspect(originalUrl, `original-${slug}`);
const v = await inspect(`http://localhost:5173/components/${slug}`, `vitrine-${slug}`);

// Diff
console.log("\n=== DIFF ===");
console.log("original wrap rect:", t.wrap?.rect);
console.log("vitrine wrap rect:", v.wrap?.rect);
console.log("original wrap bg:", t.wrap?.bg, "color:", t.wrap?.color);
console.log("vitrine wrap bg:", v.wrap?.bg, "color:", v.wrap?.color);

await browser.close();
