import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { SHOTS_DIR } from "./_shots.mjs"

const OUT = SHOTS_DIR
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

async function check(url, theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(String(e)))
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(2500)

  const info = await page.evaluate(() => {
    const out = {}
    // Vortex canvas vs container
    const vortex = document.querySelector("[data-slot=vortex]")
    if (vortex) {
      const canvas = vortex.querySelector("canvas")
      const vr = vortex.getBoundingClientRect()
      out.vortex = {
        container: { w: Math.round(vr.width), h: Math.round(vr.height) },
        canvasAttr: canvas ? { w: canvas.width, h: canvas.height } : null,
        canvasRect: canvas ? (() => { const r = canvas.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })() : null,
      }
    }
    // body bg (tema chrome)
    out.bodyBg = getComputedStyle(document.body).backgroundColor
    out.htmlClass = document.documentElement.className
    return out
  })

  await page.screenshot({ path: `${OUT}/bg-${theme}.png`, fullPage: true, animations: "disabled", timeout: 20000 }).catch((e) => errors.push("screenshot:" + e.message))
  console.log(`\n=== ${url} [${theme}] ===`)
  console.log(JSON.stringify(info, null, 2))
  if (errors.length) console.log("PAGE ERRORS:", errors)
  await ctx.close()
  return { info, errors }
}

// 1. Vortex na rota dedicada
await check("http://localhost:5173/components/vortex", "dark")
// 2. Showcase em dark e light
await check("http://localhost:5173/compositions/backgrounds-showcase", "dark")
await check("http://localhost:5173/compositions/backgrounds-showcase", "light")

await browser.close()
console.log("\nDONE")
