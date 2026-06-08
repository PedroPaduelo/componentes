// scripts/val-icon-swap-original.mjs
// Inspeção complementar do original chanhdai.com/components/icon-swap
// O site não usa data-slot, então procuramos por estrutura de ícones sobrepostos

import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

const OUT = "shots/icon-swap"
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VIEWPORT })
const page = await ctx.newPage()

console.log("Loading chanhdai.com/components/icon-swap...")
await page.goto("https://chanhdai.com/components/icon-swap", {
  waitUntil: "networkidle",
  timeout: 30000,
})
await page.waitForTimeout(3000)

// Inspeção genérica: procurar elementos com 2 SVGs sobrepostos
const domInfo = await page.evaluate(() => {
  // Procurar containers com múltiplos SVGs filhos
  const allDivs = document.querySelectorAll("div, button, span")
  const candidates = []

  for (const el of allDivs) {
    const svgs = el.querySelectorAll("svg")
    if (svgs.length >= 2) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 10 && rect.height > 10 && rect.width < 100) {
        const children = Array.from(el.children).map((child, i) => {
          const r = child.getBoundingClientRect()
          const s = getComputedStyle(child)
          return {
            index: i,
            tag: child.tagName,
            className: child.className?.toString().slice(0, 100) || "",
            rect: { x: r.x, y: r.y, w: r.width, h: r.height },
            opacity: s.opacity,
            visibility: s.visibility,
            display: s.display,
            transition: s.transition,
            transform: s.transform,
            position: s.position,
          }
        })

        candidates.push({
          tag: el.tagName,
          className: el.className?.toString().slice(0, 100) || "",
          rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
          childCount: el.children.length,
          svgCount: svgs.length,
          children,
        })
      }
    }
  }

  // Também procurar por classes que mencionam "swap", "icon", "toggle"
  const swapEls = document.querySelectorAll("[class*='swap'], [class*='icon-swap'], [class*='theme']")
  const swapInfo = Array.from(swapEls).map((el) => ({
    tag: el.tagName,
    className: el.className?.toString().slice(0, 150) || "",
    rect: (() => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })(),
    childCount: el.children.length,
  }))

  return { candidates: candidates.slice(0, 10), swapElements: swapInfo.slice(0, 10) }
})

console.log("DOM inspection:", JSON.stringify(domInfo, null, 2))
writeFileSync(`${OUT}/inspect-original-full.json`, JSON.stringify(domInfo, null, 2))

// Tentar interagir com o primeiro candidato que parece ser o icon-swap
// Usar querySelectorAll genérico em vez de classe escapada
const allButtons = await page.$$("button")
let target = null
for (const btn of allButtons) {
  const info = await btn.evaluate((el) => ({
    rect: (() => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })(),
    svgs: el.querySelectorAll("svg").length,
    className: el.className?.toString() || "",
  }))
  if (info.svgs >= 2 && info.rect.w < 100 && info.rect.h < 100) {
    target = { btn, info }
    break
  }
}

if (target) {
  const el = target.btn
  console.log(`\nInteracting with button: ${target.info.className.slice(0, 80)} at ${JSON.stringify(target.info.rect)}`)

  // Hover
  await el.hover()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/original-light-hover.png`, fullPage: false })
  console.log(`  ✓ ${OUT}/original-light-hover.png`)

  // Click mid-transition
  await el.click()
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${OUT}/original-light-mid-swap.png`, fullPage: false })
  console.log(`  ✓ ${OUT}/original-light-mid-swap.png`)

  // After swap
  await page.waitForTimeout(850)
  await page.screenshot({ path: `${OUT}/original-light-after-swap.png`, fullPage: false })
  console.log(`  ✓ ${OUT}/original-light-after-swap.png`)

  // Click revert
  await el.click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUT}/original-light-after-revert.png`, fullPage: false })
  console.log(`  ✓ ${OUT}/original-light-after-revert.png`)
} else {
  console.log("  Could not find element for interaction")
}

// Dark mode
await page.evaluate(() => {
  document.documentElement.classList.add("dark")
  document.documentElement.style.colorScheme = "dark"
})
await page.waitForTimeout(1000)
await page.screenshot({ path: `${OUT}/original-dark.png`, fullPage: false })
console.log(`  ✓ ${OUT}/original-dark.png`)

await browser.close()
console.log("\nDone")
