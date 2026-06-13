// scripts/val-glow-card-grid-replay.mjs
// Re-do ONLY the glow interaction screenshots, WITHOUT clip, so the full view shows the glow
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const OUT = outPath("glow-card-grid")
mkdirSync(OUT, { recursive: true })
const VP = { width: 1440, height: 900 }
const ORIG_URL = "https://chanhdai.com/components/glow-card-grid"
const VIT_URL = "http://localhost:5173/components/glow-card-grid"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VP })

async function glowShotFullView(url, label, opts = {}) {
  const page = await ctx.newPage()
  if (opts.localStorage) {
    await page.addInitScript((entries) => {
      for (const [k, v] of entries) localStorage.setItem(k, v)
    }, Object.entries(opts.localStorage))
  }
  try { await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }) } catch (e) { console.warn(e.message) }
  await page.waitForTimeout(2500)

  const gridRect = await page.evaluate(() => {
    const grid = document.querySelector('[data-slot="glow-card-grid"]') ||
      document.querySelectorAll('[data-slot="glow-card"]')[0]?.parentElement
    if (!grid) return null
    const r = grid.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  })
  if (!gridRect) { await page.close(); return }

  // full-view viewport clip (covers the grid + margin)
  const viewClip = {
    x: Math.max(0, gridRect.x - 20),
    y: Math.max(0, gridRect.y - 20),
    width: Math.min(VP.width - Math.max(0, gridRect.x - 20), gridRect.w + 40),
    height: Math.min(VP.height - Math.max(0, gridRect.y - 20), gridRect.h + 40),
  }

  // outside
  await page.mouse.move(5, 5)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${label}-glow-outside.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-outside.png`)

  // top-left of first card
  const tlX = gridRect.x + 30
  const tlY = gridRect.y + 30
  await page.mouse.move(tlX, tlY)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${label}-glow-tl.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-tl.png`)

  // center of grid
  const centerX = gridRect.x + gridRect.w / 2
  const centerY = gridRect.y + gridRect.h / 2
  await page.mouse.move(centerX, centerY)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${label}-glow-center.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-center.png`)

  // bottom-right
  const brX = gridRect.x + gridRect.w - 30
  const brY = gridRect.y + gridRect.h - 30
  await page.mouse.move(brX, brY)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${label}-glow-br.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-br.png`)

  // outside again
  await page.mouse.move(5, 5)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${label}-glow-outside2.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-outside2.png`)

  await page.close()
}

console.log("\n📸 Replay glow screenshots (full view)")
await glowShotFullView(ORIG_URL, "original")
await glowShotFullView(VIT_URL, "vitrine-light")
await glowShotFullView(VIT_URL, "vitrine-dark", { localStorage: { "vitrine-theme": "dark" } })

await browser.close()
