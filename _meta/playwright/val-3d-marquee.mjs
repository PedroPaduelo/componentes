// scripts/val-3d-marquee.mjs
// Valida render do 3D Marquee (Aceternity).
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()

async function probe(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`)
  })
  await page.goto("http://localhost:5173/components/3d-marquee", { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(2000)
  const info = await page.evaluate(() => {
    const wrappers = Array.from(document.querySelectorAll("[data-slot='3d-marquee']"))
    const first = wrappers[0]
    return {
      wrapperCount: wrappers.length,
      firstRect: first ? (() => { const r = first.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })() : null,
      imgCount: first ? first.querySelectorAll("img").length : 0,
      firstImgSrc: first ? first.querySelector("img")?.getAttribute("src") : null,
      // Espera 4 colunas (motion.div dentro do grid-cols-4)
      columnCount: first ? first.querySelectorAll(":scope > div > div > div > div").length : 0,
      // Total imgs por picsum
      picsumImgs: first ? Array.from(first.querySelectorAll("img[src*='picsum']")).length : 0,
    }
  })
  await page.screenshot({ path: `shots/3d-marquee-${theme}.png`, fullPage: false, animations: "disabled" })
  await ctx.close()
  return { theme, info, errors }
}

const light = await probe("light")
const dark = await probe("dark")

console.log("\n[light]", JSON.stringify(light, null, 2))
console.log("\n[dark]", JSON.stringify(dark, null, 2))

await browser.close()
