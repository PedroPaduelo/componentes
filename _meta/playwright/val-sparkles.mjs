// Validação visual do Sparkles: canvas existe com dimensões > 0 e anima
// (dois frames capturados em momentos diferentes diferem).
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("http://localhost:5173/components/sparkles", {
  waitUntil: "networkidle",
  timeout: 30000,
})
await page.waitForTimeout(1500)

const dims = await page.evaluate(() => {
  const wrap = document.querySelector("[data-slot=sparkles]")
  const canvas = wrap?.querySelector("canvas")
  if (!canvas) return null
  const r = canvas.getBoundingClientRect()
  return { w: Math.round(r.width), h: Math.round(r.height), cw: canvas.width, ch: canvas.height }
})
console.log("canvas dims:", JSON.stringify(dims))

// Captura dois frames do primeiro canvas e compara via toDataURL.
const grab = () =>
  page.evaluate(() => {
    const canvas = document.querySelector("[data-slot=sparkles] canvas")
    return canvas ? canvas.toDataURL() : null
  })

const f1 = await grab()
await page.waitForTimeout(700)
const f2 = await grab()
const animated = f1 && f2 && f1 !== f2

console.log("frame1 len:", f1?.length, "frame2 len:", f2?.length)
console.log("ANIMATED (frames differ):", animated)

const ok = dims && dims.w > 0 && dims.h > 0 && animated
console.log(ok ? "PASS" : "FAIL")

await browser.close()
process.exit(ok ? 0 : 1)
