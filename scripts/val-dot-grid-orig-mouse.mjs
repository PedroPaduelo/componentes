/**
 * Verifica se o ORIGINAL também não tem mouse-follow OU se tem e a vitrine está bugada.
 * Lê o componente original em chanhdai e mede o mask-position em 4 posições do mouse.
 */
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

const OUT = "shots/dot-grid-spotlight"
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

console.log("goto original...")
await page.goto("https://chanhdai.com/components/dot-grid-spotlight", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(2500)

// Probe original DOM structure first
const probe = await page.evaluate(() => {
  // Try multiple ways to find the spotlight element
  const candidates = Array.from(document.querySelectorAll("*"))
    .filter(el => {
      const s = getComputedStyle(el)
      return (s.webkitMaskImage?.includes("radial") ||
              s.maskImage?.includes("radial") ||
              s.backgroundImage?.includes("radial"))
    })
    .slice(0, 10)
    .map(el => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return {
        tag: el.tagName,
        cls: el.className?.toString().slice(0, 100),
        rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
        maskImage: (s.webkitMaskImage || s.maskImage || "").slice(0, 250),
        maskPosition: s.webkitMaskPosition || s.maskPosition,
        maskSize: s.webkitMaskSize || s.maskSize,
        bg: s.backgroundImage?.slice(0, 200),
        dataAttrs: Array.from(el.attributes).filter(a => a.name.startsWith("data-")).map(a => `${a.name}=${a.value}`).join(" "),
      }
    })
  return { candidates }
})
console.log("PROBE:", JSON.stringify(probe, null, 2).slice(0, 3000))

// Move mouse to 4 positions and capture mask
const positions = [
  { name: "center", x: 720, y: 450 },
  { name: "tl", x: 200, y: 200 },
  { name: "center2", x: 700, y: 400 },
  { name: "br", x: 1200, y: 800 },
]

const results = {}
for (const p of positions) {
  await page.mouse.move(p.x, p.y)
  await page.waitForTimeout(800)
  const data = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll("*"))
      .filter(el => {
        const s = getComputedStyle(el)
        return (s.webkitMaskImage?.includes("radial") || s.maskImage?.includes("radial"))
      })
      .slice(0, 5)
      .map(el => {
        const s = getComputedStyle(el)
        return {
          cls: el.className?.toString().slice(0, 80),
          mask: s.webkitMaskPosition || s.maskPosition,
          maskSize: s.webkitMaskSize || s.maskSize,
        }
      })
    return { candidates, mouseX: -1, mouseY: -1 }
  })
  results[p.name] = { x: p.x, y: p.y, ...data }
  await page.screenshot({ path: `${OUT}/orig-mouse-${p.name}.png`, fullPage: false })
  console.log(`✓ orig-mouse-${p.name}.png — ${JSON.stringify(data).slice(0, 200)}`)
}

writeFileSync(`${OUT}/orig-interactions.json`, JSON.stringify(results, null, 2))
console.log("✓ orig-interactions.json")
await browser.close()
