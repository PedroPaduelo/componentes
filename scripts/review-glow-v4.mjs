// Review v4: Check computed transform on glow layer
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("http://localhost:5173/components/glow-card-grid", { waitUntil: "networkidle" })
await page.waitForTimeout(2000)

// Move mouse away
await page.mouse.move(10, 10)
await page.waitForTimeout(500)

// Check no-hover state
const noHover = await page.evaluate(() => {
  const card = document.querySelectorAll('[data-slot="glow-card"]')[0]
  const clipDiv = card.children[0]
  const allDivs = Array.from(clipDiv.querySelectorAll('div'))
  const glowDiv = allDivs.find(d => d.className.includes('translate-x'))
  if (!glowDiv) return null
  const cs = getComputedStyle(glowDiv)
  return {
    opacity: cs.opacity,
    transform: cs.transform,
    filter: cs.filter,
    willChange: cs.willChange,
    // Check if the element has the expected classes
    hasGroupHover: glowDiv.className.includes('group-hover'),
    hasTransition: glowDiv.className.includes('transition-opacity'),
  }
})
console.log("No-hover glow layer: " + JSON.stringify(noHover, null, 2))

// Hover center
const firstCard = await page.$('[data-slot="glow-card"]')
const box = await firstCard.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.waitForTimeout(1000)

const hoverCenter = await page.evaluate(() => {
  const card = document.querySelectorAll('[data-slot="glow-card"]')[0]
  const clipDiv = card.children[0]
  const allDivs = Array.from(clipDiv.querySelectorAll('div'))
  const glowDiv = allDivs.find(d => d.className.includes('translate-x'))
  if (!glowDiv) return null
  const cs = getComputedStyle(glowDiv)
  return {
    opacity: cs.opacity,
    transform: cs.transform,
    filter: cs.filter,
    pointerX: card.style.getPropertyValue("--pointer-x"),
    pointerY: card.style.getPropertyValue("--pointer-y"),
  }
})
console.log("Hover-center glow layer: " + JSON.stringify(hoverCenter, null, 2))

// Hover TL
await page.mouse.move(box.x + 10, box.y + 10)
await page.waitForTimeout(1000)

const hoverTL = await page.evaluate(() => {
  const card = document.querySelectorAll('[data-slot="glow-card"]')[0]
  const clipDiv = card.children[0]
  const allDivs = Array.from(clipDiv.querySelectorAll('div'))
  const glowDiv = allDivs.find(d => d.className.includes('translate-x'))
  if (!glowDiv) return null
  const cs = getComputedStyle(glowDiv)
  return {
    opacity: cs.opacity,
    transform: cs.transform,
    pointerX: card.style.getPropertyValue("--pointer-x"),
    pointerY: card.style.getPropertyValue("--pointer-y"),
  }
})
console.log("Hover-TL glow layer: " + JSON.stringify(hoverTL, null, 2))

// Key assertion: opacity should increase from ~0.3 to ~0.54
const noHoverOp = parseFloat(noHover.opacity)
const hoverOp = parseFloat(hoverCenter.opacity)
console.log("\nOpacity no-hover: " + noHoverOp + " (expected ~0.3)")
console.log("Opacity hover: " + hoverOp + " (expected ~0.54)")
console.log("Opacity increased: " + (hoverOp > noHoverOp))

// Check that transform is NOT "none" (it should have translate)
console.log("\nTransform no-hover: " + noHover.transform)
console.log("Transform hover: " + hoverCenter.transform)
console.log("Transform is NOT none: " + (hoverCenter.transform !== "none"))

await page.close()
await ctx.close()
await browser.close()
