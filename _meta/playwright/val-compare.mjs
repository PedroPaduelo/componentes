// scripts/val-compare.mjs
// Comparação pixel-a-pixel: extrai cores de pixels específicos dos prints
// pra verificar se o "item central" tem destaque visual (mask/gradient)
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const OUT = "shots/react-wheel-picker"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// 1) Examinar o gradient/mask do picker (pseudo-elemento ::before/::after)
const gradientAnalysis = `
  function getMaskInfo() {
    const wrap = document.querySelector('[data-rwp="true"]');
    if (!wrap) return null;
    const cs = getComputedStyle(wrap);
    return {
      mask: cs.mask,
      webkitMask: cs.webkitMask,
      maskImage: cs.maskImage,
      webkitMaskImage: cs.webkitMaskImage,
      backgroundImage: cs.backgroundImage,
    };
  }
`

async function examineMask(theme) {
  const page = await ctx.newPage()
  await page.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  await page.goto("http://localhost:5173/components/react-wheel-picker", {
    waitUntil: "networkidle",
    timeout: 45000,
  })
  await page.waitForTimeout(3000)

  const info = await page.evaluate(`
    (() => {
      const wrap = document.querySelector('[data-rwp="true"]');
      if (!wrap) return { found: false };
      const cs = getComputedStyle(wrap);
      const beforeCS = getComputedStyle(wrap, '::before');
      const afterCS = getComputedStyle(wrap, '::after');
      return {
        wrap: {
          maskImage: cs.maskImage,
          webkitMaskImage: cs.webkitMaskImage,
          background: cs.background,
          backgroundImage: cs.backgroundImage,
          position: cs.position,
          overflow: cs.overflow,
        },
        before: {
          content: beforeCS.content,
          background: beforeCS.background.slice(0, 100),
          backgroundImage: beforeCS.backgroundImage.slice(0, 100),
          position: beforeCS.position,
          top: beforeCS.top,
          left: beforeCS.left,
          right: beforeCS.right,
          bottom: beforeCS.bottom,
          opacity: beforeCS.opacity,
        },
        after: {
          content: afterCS.content,
          background: afterCS.background.slice(0, 100),
          backgroundImage: afterCS.backgroundImage.slice(0, 100),
          position: afterCS.position,
          top: afterCS.top,
          left: afterCS.left,
          right: afterCS.right,
          bottom: afterCS.bottom,
          opacity: afterCS.opacity,
        },
      };
    })()
  `)
  console.log(`[${theme}]`, JSON.stringify(info, null, 2))
  writeFileSync(`${OUT}/inspect-vitrine-mask-${theme}.json`, JSON.stringify(info, null, 2))
  await page.close()
  return info
}

console.log("== ANALYSE MASK ==")
await examineMask("light")
await examineMask("dark")

// 2) Comparar pixel real do item central vs itens adjacentes
async function pixelSample(theme) {
  const page = await ctx.newPage()
  await page.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  await page.goto("http://localhost:5173/components/react-wheel-picker", {
    waitUntil: "networkidle",
    timeout: 45000,
  })
  await page.waitForTimeout(3000)

  // Pega 5 pontos do picker (centro, 2 acima, 2 abaixo) e amostra cor
  const samples = await page.evaluate(`
    (() => {
      const wrap = document.querySelector('[data-rwp="true"]');
      if (!wrap) return [];
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      // 5 pontos: -90, -60, centro, +60, +90 (em y)
      const ys = [r.top + 30, r.top + 60, r.top + r.height/2, r.top + r.height - 60, r.top + r.height - 30];
      return ys.map(y => ({ y: Math.round(y), x: Math.round(cx), rect: 'point' }));
    })()
  `)
  // Tira print focado no picker e amostragem via page.evaluate é mais complicado
  // Vou apenas retornar coordenadas; usaremos page.screenshot clip
  return samples
}

const lightSamples = await pixelSample("light")
const darkSamples = await pixelSample("dark")
console.log("\n[PIXEL SAMPLES light]", lightSamples)
console.log("[PIXEL SAMPLES dark]", darkSamples)

// 3) Tira print recortado do picker nos 2 temas para análise visual
async function clipShot(theme) {
  const page = await ctx.newPage()
  await page.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  await page.goto("http://localhost:5173/components/react-wheel-picker", {
    waitUntil: "networkidle",
    timeout: 45000,
  })
  await page.waitForTimeout(3000)
  const box = await page.evaluate(() => {
    const wrap = document.querySelector('[data-slot="react-wheel-picker"]')
    if (!wrap) return null
    const r = wrap.getBoundingClientRect()
    return { x: Math.max(0, r.left - 8), y: Math.max(0, r.top - 8), w: r.width + 16, h: r.height + 16 }
  })
  if (box) {
    await page.screenshot({
      path: `${OUT}/vitrine-${theme}-picker-clip.png`,
      clip: { x: box.x, y: box.y, width: box.w, height: box.h },
    })
    console.log(`✓ vitrine-${theme}-picker-clip.png`)
  }
  await page.close()
}

await clipShot("light")
await clipShot("dark")

await browser.close()
console.log("\n=== DONE ===")
