// scripts/print-perspective-grid.mjs
// Validação visual do PerspectiveGrid na vitrine em light e dark.
// Inspeção: data-slot="perspective-grid" + N tiles renderizados.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const URL = "http://localhost:5173/components/perspective-grid"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function shoot(name, theme) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `shots/vitrine-perspective-grid-${theme}.png`, fullPage: false })
  console.log(`✓ shots/vitrine-perspective-grid-${theme}.png`)

  // Inspeção: contar tiles renderizados
  const info = await page.evaluate(() => {
    const wrap = document.querySelector('[data-slot="perspective-grid"]')
    const tiles = document.querySelectorAll('.tile')
    const firstTile = tiles[0]
    return {
      wrapFound: !!wrap,
      wrapDataTheme: wrap ? wrap.dataset.theme : null,
      wrapRect: wrap
        ? (() => {
            const r = wrap.getBoundingClientRect()
            return { w: Math.round(r.width), h: Math.round(r.height) }
          })()
        : null,
      tileCount: tiles.length,
      firstTileBorder: firstTile ? getComputedStyle(firstTile).borderColor : null,
    }
  })
  console.log(`[${theme}]`, JSON.stringify(info, null, 2))
  await page.close()
  return info
}

const lightInfo = await shoot("vitrine-perspective-grid-light", "light")
const darkInfo = await shoot("vitrine-perspective-grid-dark", "dark")

// Validações
const ok =
  lightInfo.wrapFound &&
  lightInfo.tileCount === 1600 &&
  darkInfo.wrapFound &&
  darkInfo.tileCount === 1600
console.log(ok ? "\n✅ ALL CHECKS PASSED" : "\n❌ FAILED — see info above")
await browser.close()
process.exit(ok ? 0 : 1)
