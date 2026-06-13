// scripts/val-glow-fix.mjs
// Validação visual do fix do glow-card-grid:
// - Printa a vitrine COM mouse hover em diferentes posições (4 cards diferentes)
// - Printa a vitrine SEM mouse hover (estado base)
// - Printa em light e dark
// - Compara com o print do ncdai (referência)
// - Inspeção: glow layer deve estar VISÍVEL dentro do card e seguir o cursor
// - 6 cards devem renderizar
//
// Saídas: shots/vitrine-glow-{hover-state}-{theme}.png
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const VIEWPORT = { width: 1440, height: 900 }
const URL = "http://localhost:5173/components/glow-card-grid"

const browser = await chromium.launch()

async function capture(opts) {
  const { label, dark, hover } = opts
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1500)

  if (hover) {
    const card = await page.$(`[data-slot="glow-card"]:nth-of-type(${hover.cardIndex + 1})`)
    if (card) {
      const box = await card.boundingBox()
      if (box) {
        const cx = box.x + box.width * hover.x
        const cy = box.y + box.height * hover.y
        await page.mouse.move(cx, cy)
        await page.waitForTimeout(400)
      }
    }
  }

  // take screenshot
  const path = outPath(`vitrine-glow-${label}.png`)
  await page.screenshot({ path, fullPage: false })
  console.log(`✓ ${path}`)

  // inspect state
  const info = await page.evaluate((hoverIdx) => {
    const cards = document.querySelectorAll("[data-slot='glow-card']")
    const c0 = cards[hoverIdx ?? 0]
    if (!c0) return { error: "no cards", count: cards.length }
    const cs = getComputedStyle(c0)
    const clip = c0.children[0]
    const glow = clip?.children[0]
    const border = c0.children[1]
    return {
      count: cards.length,
      rect: (() => {
        const r = c0.getBoundingClientRect()
        return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }
      })(),
      pointerX: cs.getPropertyValue("--pointer-x").trim(),
      pointerY: cs.getPropertyValue("--pointer-y").trim(),
      glow: glow
        ? {
            transform: getComputedStyle(glow).transform,
            rect: (() => {
              const r = glow.getBoundingClientRect()
              return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }
            })(),
            filter: getComputedStyle(glow).filter,
            opacity: getComputedStyle(glow).opacity,
          }
        : null,
      border: border
        ? {
            rect: (() => {
              const r = border.getBoundingClientRect()
              return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }
            })(),
            backdropFilter: getComputedStyle(border).backdropFilter,
          }
        : null,
    }
  }, hover?.cardIndex ?? 0)

  await page.close()
  await ctx.close()
  return { path, info }
}

const results = []
results.push(await capture({ label: "no-hover-light", dark: false }))
results.push(await capture({ label: "no-hover-dark", dark: true }))
// mouse over center of first card
results.push(await capture({ label: "hover-center-light", dark: false, hover: { cardIndex: 0, x: 0.5, y: 0.5 } }))
results.push(await capture({ label: "hover-center-dark", dark: true, hover: { cardIndex: 0, x: 0.5, y: 0.5 } }))
// mouse top-left of second card (different card → different avatar)
results.push(await capture({ label: "hover-tl-light", dark: false, hover: { cardIndex: 1, x: 0.15, y: 0.15 } }))
results.push(await capture({ label: "hover-tl-dark", dark: true, hover: { cardIndex: 1, x: 0.15, y: 0.15 } }))

console.log("\n=== INSPECTION ===")
for (const r of results) {
  console.log(`\n[${r.path}]`)
  console.log("  cards:", r.info.count)
  if (r.info.pointerX !== undefined) {
    console.log("  pointer-x/y:", r.info.pointerX, "/", r.info.pointerY)
    if (r.info.glow) {
      console.log("  glow rect:", r.info.glow.rect, "opacity:", r.info.glow.opacity)
    }
    if (r.info.border) {
      console.log("  border rect:", r.info.border.rect, "backdrop:", r.info.border.backdropFilter?.slice(0, 60))
    }
  }
}

await browser.close()
console.log("\ndone")
