/**
 * Re-testa o mouse-follow com posições DENTRO do wrapper (vitrine).
 * Wrapper ocupa x=257..1183, y=438..694 na viewport 1440x900.
 */
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("http://localhost:5173/components/dot-grid-spotlight", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(2500)

const positions = [
  { name: "static-center", x: 720, y: 560 },
  { name: "inside-tl", x: 350, y: 480 },
  { name: "inside-center", x: 720, y: 560 },
  { name: "inside-br", x: 1100, y: 650 },
]

const results = {}
for (const p of positions) {
  await page.mouse.move(p.x, p.y)
  await page.waitForTimeout(800)

  const data = await page.evaluate(() => {
    const wrap = document.querySelector("[data-slot='dot-grid-spotlight']")
    if (!wrap) return { error: "wrapper not found" }
    const r = wrap.getBoundingClientRect()
    const wrapperStyle = getComputedStyle(wrap)
    const wrapperInline = wrap.style
    const layer2 = wrap.children[1]
    return {
      wrapperRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      cssVars: {
        "--mouse-x": wrapperStyle.getPropertyValue("--mouse-x") || wrapperInline.getPropertyValue("--mouse-x"),
        "--mouse-y": wrapperStyle.getPropertyValue("--mouse-y") || wrapperInline.getPropertyValue("--mouse-y"),
      },
      layer2Mask: layer2 ? (getComputedStyle(layer2).webkitMaskImage || getComputedStyle(layer2).maskImage)?.slice(0, 300) : null,
      layer2Opacity: layer2 ? getComputedStyle(layer2).opacity : null,
    }
  })

  results[p.name] = { mouse: p, ...data }
  await page.screenshot({ path: `shots/dot-grid-spotlight/vitrine-light-inside-${p.name}.png`, fullPage: false })
  console.log(`[${p.name}] mouse=(${p.x},${p.y}) | --mouse-x=${data.cssVars["--mouse-x"]} --mouse-y=${data.cssVars["--mouse-y"]} | opacity=${data.layer2Opacity}`)
}

writeFileSync("shots/dot-grid-spotlight/vitrine-mouse-inside.json", JSON.stringify(results, null, 2))
console.log("\n✓ vitrine-mouse-inside.json")

await browser.close()
