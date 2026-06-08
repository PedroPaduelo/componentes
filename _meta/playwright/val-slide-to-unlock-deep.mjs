// scripts/val-slide-to-unlock-deep.mjs
// Deep probe: verify data-dragging, transform, SVG path, callback fires
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const VIEWPORT = { width: 1440, height: 900 }
const URL = "http://localhost:5173/components/slide-to-unlock"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VIEWPORT })

const page = await ctx.newPage()
await page.addInitScript(() => {
  try { localStorage.setItem("vitrine-theme", "light") } catch (e) {}
})
await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 })
await page.waitForTimeout(3000)

// Initial state probe
const initial = await page.evaluate(() => {
  const wrap = document.querySelector("[data-slot=slide-to-unlock]")
  const text = document.querySelector("[data-slot=text]")
  const handle = document.querySelector("[data-slot=handle]")
  const svg = handle?.querySelector("svg")
  const path = svg?.querySelector("path")
  return {
    wrapperWidth: wrap?.getBoundingClientRect().width,
    handleTransform: handle ? getComputedStyle(handle).transform : null,
    handleInlineTransform: handle?.style.transform,
    textDataDragging: text?.getAttribute("data-dragging"),
    bodyText: wrap?.textContent?.slice(0, 60),
    svgPath: path?.getAttribute("d"),
    svgViewBox: svg?.getAttribute("viewBox"),
    hasChevronRight: !!handle?.querySelector(".lucide-chevron-right"),
  }
})
console.log("=== INITIAL ===")
console.log(JSON.stringify(initial, null, 2))

// Find the first SlideToUnlock instance (the "Básico" example)
const targetInfo = await page.evaluate(() => {
  const wrap = document.querySelector("[data-slot=slide-to-unlock]")
  const handle = wrap?.querySelector("[data-slot=handle]")
  if (!handle) return null
  const r = handle.getBoundingClientRect()
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height, trackRight: wrap.getBoundingClientRect().x + wrap.getBoundingClientRect().width - 56 }
})
console.log("\n=== TARGET HANDLE ===", JSON.stringify(targetInfo, null, 2))

if (!targetInfo) {
  console.error("no handle found")
  await browser.close()
  process.exit(1)
}

// Drag to 100% (or past threshold)
const startX = targetInfo.x
const startY = targetInfo.y
const endX = targetInfo.trackRight + 8 // go past the threshold

console.log(`\n=== DRAG FROM ${startX} to ${endX} ===`)
await page.mouse.move(startX, startY)
await page.waitForTimeout(200)
await page.mouse.down()
await page.waitForTimeout(200)

// Move in 10 steps
for (let i = 1; i <= 10; i++) {
  const t = i / 10
  const x = startX + (endX - startX) * t
  await page.mouse.move(x, startY)
  await page.waitForTimeout(50)
}

// Check state mid-drag (mouse still down)
const midDrag = await page.evaluate(() => {
  const handle = document.querySelector("[data-slot=handle]")
  const text = document.querySelector("[data-slot=text]")
  return {
    handleTransform: handle ? getComputedStyle(handle).transform : null,
    handleInlineTransform: handle?.style.transform,
    textDataDragging: text?.getAttribute("data-dragging"),
  }
})
console.log("\n=== MID DRAG (mouse down) ===", JSON.stringify(midDrag, null, 2))

await page.waitForTimeout(300)
await page.mouse.up()
await page.waitForTimeout(800)

// Check post-mouseup state
const after = await page.evaluate(() => {
  const handle = document.querySelector("[data-slot=handle]")
  const text = document.querySelector("[data-slot=text]")
  const wrap = document.querySelector("[data-slot=slide-to-unlock]")
  return {
    handleTransform: handle ? getComputedStyle(handle).transform : null,
    handleInlineTransform: handle?.style.transform,
    textDataDragging: text?.getAttribute("data-dragging"),
    bodyText: wrap?.textContent?.slice(0, 60),
  }
})
console.log("\n=== AFTER MOUSEUP ===", JSON.stringify(after, null, 2))

// Validate the SVG path matches the chanhdai SVG
const isCorrectPath = initial.svgPath === "M24 12 12.75 3v4.696H0v8.608h12.75V21z"
console.log("\n=== CHECKS ===")
console.log("SVG path correct:", isCorrectPath)
console.log("SVG viewBox correct:", initial.svgViewBox === "0 0 24 24")
console.log("ChevronRight removed:", !initial.hasChevronRight)
console.log("Wrapper width is 216:", initial.wrapperWidth === 216)
console.log("Label default 'slide to unlock':", initial.bodyText?.includes("slide to unlock"))
console.log("Mid-drag transform changed:", midDrag.handleInlineTransform !== "translateX(0px)" && midDrag.handleInlineTransform !== "translate(0px, 0px)")
console.log("Mid-drag data-dragging=true:", midDrag.textDataDragging === "true")
console.log("Post-mouseup data-dragging=false:", after.textDataDragging === "false")
console.log("Post-mouseup label changed (Unlocked):", after.bodyText?.includes("Unlocked"))

writeFileSync("shots/slide-to-unlock/deep-probe.json", JSON.stringify({ initial, midDrag, after, targetInfo }, null, 2))

await page.close()
await browser.close()
console.log("\n✓ done")
