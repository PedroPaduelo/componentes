/**
 * Verifica a implementação do mouse-follow da vitrine:
 * - Lê o mask-image da CAMADA SPOTLIGHT (2º div, não o wrapper)
 * - Lê as CSS vars --mouse-x e --mouse-y do wrapper
 * - Move o mouse para 4 posições e confirma se o mask muda
 */
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("http://localhost:5173/components/dot-grid-spotlight", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(2500)

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
    const wrap = document.querySelector("[data-slot='dot-grid-spotlight']")
    if (!wrap) return { error: "wrapper not found" }
    const wrapperStyle = getComputedStyle(wrap)
    const wrapperInline = wrap.style
    // Layer 1: dot grid
    const layer1 = wrap.children[0]
    // Layer 2: spotlight
    const layer2 = wrap.children[1]
    return {
      wrapperCssVars: {
        "--mouse-x": wrapperStyle.getPropertyValue("--mouse-x") || wrapperInline.getPropertyValue("--mouse-x"),
        "--mouse-y": wrapperStyle.getPropertyValue("--mouse-y") || wrapperInline.getPropertyValue("--mouse-y"),
        "--dot-size": wrapperStyle.getPropertyValue("--dot-size") || wrapperInline.getPropertyValue("--dot-size"),
        "--dot-spacing": wrapperStyle.getPropertyValue("--dot-spacing") || wrapperInline.getPropertyValue("--dot-spacing"),
        "--spotlight-size": wrapperStyle.getPropertyValue("--spotlight-size") || wrapperInline.getPropertyValue("--spotlight-size"),
      },
      layer1Class: layer1?.className,
      layer1Bg: layer1 ? getComputedStyle(layer1).backgroundImage?.slice(0, 200) : null,
      layer1Size: layer1 ? getComputedStyle(layer1).backgroundSize : null,
      layer2Class: layer2?.className,
      layer2Mask: layer2 ? (getComputedStyle(layer2).webkitMaskImage || getComputedStyle(layer2).maskImage)?.slice(0, 300) : null,
      layer2MaskPos: layer2 ? (getComputedStyle(layer2).webkitMaskPosition || getComputedStyle(layer2).maskPosition) : null,
      layer2Opacity: layer2 ? getComputedStyle(layer2).opacity : null,
      layer2Bg: layer2 ? getComputedStyle(layer2).backgroundColor : null,
    }
  })

  results[p.name] = { mouse: p, ...data }
  console.log(`[${p.name}] --mouse-x=${data.wrapperCssVars["--mouse-x"]} --mouse-y=${data.wrapperCssVars["--mouse-y"]} | layer2 mask=${data.layer2Mask?.slice(0, 80)}... | opacity=${data.layer2Opacity}`)
}

writeFileSync("shots/dot-grid-spotlight/vitrine-mouse-cssvars.json", JSON.stringify(results, null, 2))
console.log("\n✓ vitrine-mouse-cssvars.json")

await browser.close()
