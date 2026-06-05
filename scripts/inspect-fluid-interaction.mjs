// scripts/inspect-fluid-interaction.mjs
// Test the mouse interaction on original to confirm it actually shifts
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

const OUT = "shots/fluid-gradient-text"
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// ── ORIGINAL: test mouse movement ──
console.log("\n═══ ORIGINAL: mouse interaction test ═══\n")

const orig = await ctx.newPage()
await orig.goto("https://chanhdai.com/components/fluid-gradient-text", { waitUntil: "networkidle", timeout: 30000 })
await orig.waitForTimeout(3000)

// Find the actual FluidGradientText component (it's inside a div with relative w-full)
const wrapperBox = await orig.evaluate(() => {
  // The component renders "shadcn" — find the SVG containing this text
  const svgs = Array.from(document.querySelectorAll("svg"))
  for (const svg of svgs) {
    if (svg.textContent?.includes("shadcn") || svg.querySelector("text")?.textContent?.includes("shadcn")) {
      const r = svg.getBoundingClientRect()
      return { x: r.x, y: r.y, w: r.width, h: r.height, found: true }
    }
  }
  return { found: false }
})

console.log("Original SVG text box:", wrapperBox)

if (wrapperBox.found) {
  // Move mouse to LEFT of the text
  const cx = wrapperBox.x + wrapperBox.w / 2
  const cy = wrapperBox.y + wrapperBox.h / 2
  await orig.mouse.move(wrapperBox.x + 20, cy)
  await orig.waitForTimeout(500)
  await orig.screenshot({ path: `${OUT}/original-light-mouse-left.png` })
  console.log(`✓ ${OUT}/original-light-mouse-left.png`)

  // Move to CENTER
  await orig.mouse.move(cx, cy)
  await orig.waitForTimeout(500)
  await orig.screenshot({ path: `${OUT}/original-light-mouse-center.png` })
  console.log(`✓ ${OUT}/original-light-mouse-center.png`)

  // Move to RIGHT
  await orig.mouse.move(wrapperBox.x + wrapperBox.w - 20, cy)
  await orig.waitForTimeout(500)
  await orig.screenshot({ path: `${OUT}/original-light-mouse-right.png` })
  console.log(`✓ ${OUT}/original-light-mouse-right.png`)
}

// Get the SVG details
const svgInfo = await orig.evaluate(() => {
  const svgs = Array.from(document.querySelectorAll("svg"))
  const target = svgs.find(s => s.textContent?.includes("shadcn") || s.querySelector("text")?.textContent?.includes("shadcn"))
  if (!target) return null
  return {
    viewBox: target.getAttribute("viewBox"),
    width: target.getAttribute("width"),
    height: target.getAttribute("height"),
    class: typeof target.className === "string" ? target.className : String(target.className),
    parentClass: target.parentElement?.className,
    text: target.querySelector("text")?.textContent,
    gradientStops: Array.from(target.querySelectorAll("stop")).map(s => ({
      offset: s.getAttribute("offset"),
      stopColor: s.getAttribute("stopColor"),
      stopOpacity: s.getAttribute("stopOpacity"),
    })),
    linearGradient: (() => {
      const lg = target.querySelector("linearGradient")
      if (!lg) return null
      return {
        id: lg.id,
        x1: lg.getAttribute("x1"),
        y1: lg.getAttribute("y1"),
        x2: lg.getAttribute("x2"),
        y2: lg.getAttribute("y2"),
        gradientUnits: lg.getAttribute("gradientUnits"),
      }
    })(),
  }
})

writeFileSync(`${OUT}/inspect-original-svg.json`, JSON.stringify(svgInfo, null, 2))
console.log(`✓ ${OUT}/inspect-original-svg.json`)

await orig.close()

// ── VITRINE: test mouse interaction (should be nothing since it has no handler) ──
console.log("\n═══ VITRINE: mouse interaction test ═══\n")

const vit = await ctx.newPage()
await vit.goto("http://localhost:5173/components/fluid-gradient-text", { waitUntil: "networkidle", timeout: 30000 })
await vit.waitForTimeout(2000)

const vitBox = await vit.evaluate(() => {
  // Find H1 with text "Gradiente animado" or any element with data-slot="fluid-gradient-text"
  const el = document.querySelector("[data-slot='fluid-gradient-text']")
  if (!el) return { found: false }
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, w: r.width, h: r.height, found: true, tag: el.tagName, text: el.textContent?.trim() }
})

console.log("Vitrine wrapper box:", vitBox)

if (vitBox.found) {
  const cy = vitBox.y + vitBox.h / 2
  await vit.mouse.move(vitBox.x + 20, cy)
  await vit.waitForTimeout(500)
  await vit.screenshot({ path: `${OUT}/vitrine-light-mouse-left.png` })
  console.log(`✓ ${OUT}/vitrine-light-mouse-left.png`)

  await vit.mouse.move(vitBox.x + vitBox.w / 2, cy)
  await vit.waitForTimeout(500)
  await vit.screenshot({ path: `${OUT}/vitrine-light-mouse-center.png` })
  console.log(`✓ ${OUT}/vitrine-light-mouse-center.png`)

  await vit.mouse.move(vitBox.x + vitBox.w - 20, cy)
  await vit.waitForTimeout(500)
  await vit.screenshot({ path: `${OUT}/vitrine-light-mouse-right.png` })
  console.log(`✓ ${OUT}/vitrine-light-mouse-right.png`)
}

await vit.close()
await browser.close()

console.log("\n✅ Interaction test complete")
