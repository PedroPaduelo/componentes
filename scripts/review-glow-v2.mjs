// Review Playwright v2: glow-card-grid — test glow layer, not card border
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const results = []

async function testTheme(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  if (theme === "dark") {
    await ctx.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  const page = await ctx.newPage()
  await page.goto("http://localhost:5173/components/glow-card-grid", { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  // Count cards
  const cardCount = await page.evaluate(() =>
    document.querySelectorAll('[data-slot="glow-card"]').length
  )
  console.log("[" + theme + "] Cards found: " + cardCount)

  // Verify 6 cards with h2, p, img
  const cardContents = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-slot="glow-card"]')
    return Array.from(cards).map((card, i) => {
      const h2 = card.querySelector("h2")
      const p = card.querySelector("p")
      const img = card.querySelector("img")
      return {
        index: i,
        hasH2: !!h2,
        h2Text: h2 ? h2.textContent.trim() : "",
        hasP: !!p,
        pText: p ? p.textContent.trim() : "",
        hasImg: !!img,
      }
    })
  })

  const allHaveContent = cardContents.every(c => c.hasH2 && c.hasP && c.hasImg)
  const expectedNames = ["shadcn", "OrcDev", "David Haz", "Shu", "Emil Kowalski", "Ch\u00e1nh \u00c1i"]
  const foundNames = cardContents.map(c => c.h2Text)
  const allNamesPresent = expectedNames.every(n => foundNames.some(f => f.includes(n)))
  console.log("[" + theme + "] All have h2+p+img: " + allHaveContent)
  console.log("[" + theme + "] All names present: " + allNamesPresent + " -> " + JSON.stringify(foundNames))

  // Move mouse away first
  await page.mouse.move(10, 10)
  await page.waitForTimeout(500)

  // No-hover screenshot
  await page.screenshot({ path: "shots/reviewer-glow-no-hover-" + theme + ".png" })
  console.log("[" + theme + "] OK no-hover screenshot")

  // Hover center of first card
  const firstCard = await page.$('[data-slot="glow-card"]')
  const box = await firstCard.boundingBox()
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  await page.mouse.move(cx, cy)
  await page.waitForTimeout(1000)

  // Check pointer values and glow layer opacity
  const hoverInfo = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="glow-card"]')
    if (!card) return null

    // The glow icon layer (first child of the clip container)
    const clipContainer = card.querySelector('[clip-path]')
    const glowLayer = clipContainer ? clipContainer.querySelector('.pointer-events-none.absolute') : null

    // The border glow layer (second child of card)
    const borderGlow = card.children[1] // second child

    return {
      pointerX: card.style.getPropertyValue("--pointer-x"),
      pointerY: card.style.getPropertyValue("--pointer-y"),
      // Glow layer computed styles
      glowLayerOpacity: glowLayer ? getComputedStyle(glowLayer).opacity : "n/a",
      glowLayerTransform: glowLayer ? getComputedStyle(glowLayer).transform : "n/a",
      glowLayerFilter: glowLayer ? getComputedStyle(glowLayer).filter.substring(0, 80) : "n/a",
      // Border glow layer
      borderGlowOpacity: borderGlow ? getComputedStyle(borderGlow).opacity : "n/a",
      borderGlowBackdrop: borderGlow ? getComputedStyle(borderGlow).backdropFilter : "n/a",
      // Card ring
      cardRingColor: getComputedStyle(card).getPropertyValue("--tw-ring-color") || "n/a",
    }
  })
  console.log("[" + theme + "] Hover info: " + JSON.stringify(hoverInfo, null, 2))

  await page.screenshot({ path: "shots/reviewer-glow-hover-center-" + theme + ".png" })
  console.log("[" + theme + "] OK hover-center screenshot")

  // Hover top-left
  await page.mouse.move(box.x + 10, box.y + 10)
  await page.waitForTimeout(1000)

  const tlInfo = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="glow-card"]')
    if (!card) return null
    return {
      pointerX: card.style.getPropertyValue("--pointer-x"),
      pointerY: card.style.getPropertyValue("--pointer-y"),
    }
  })
  console.log("[" + theme + "] TL pointer: " + JSON.stringify(tlInfo))

  await page.screenshot({ path: "shots/reviewer-glow-hover-tl-" + theme + ".png" })
  console.log("[" + theme + "] OK hover-tl screenshot")

  // Verify pointer range is -1 to +1 (not 0-100)
  const pointerCenter = hoverInfo.pointerX
  const pointerTL = tlInfo.pointerX
  const centerInRange = Math.abs(parseFloat(pointerCenter)) <= 1.0
  const tlInRange = Math.abs(parseFloat(pointerTL)) <= 1.0
  console.log("[" + theme + "] Pointer center in [-1,+1]: " + centerInRange + " (val=" + pointerCenter + ")")
  console.log("[" + theme + "] Pointer TL in [-1,+1]: " + tlInRange + " (val=" + pointerTL + ")")

  // Check glow layer has non-zero opacity on hover
  const glowOpacity = parseFloat(hoverInfo.glowLayerOpacity)
  const hasGlowOpacity = !isNaN(glowOpacity) && glowOpacity > 0
  console.log("[" + theme + "] Glow layer opacity > 0: " + hasGlowOpacity + " (val=" + hoverInfo.glowLayerOpacity + ")")

  // Check that the card has @container-size class
  const hasContainerSize = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="glow-card"]')
    return card ? card.classList.contains("@container-size") : false
  })
  console.log("[" + theme + "] Has @container-size: " + hasContainerSize)

  // Check group/glow-card class
  const hasGroupClass = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="glow-card"]')
    return card ? card.classList.contains("group/glow-card") : false
  })
  console.log("[" + theme + "] Has group/glow-card: " + hasGroupClass)

  const passed = cardCount === 6 && allHaveContent && allNamesPresent &&
    centerInRange && tlInRange && hasGlowOpacity && hasContainerSize && hasGroupClass

  results.push({
    theme,
    cardCount,
    allHaveContent,
    allNamesPresent,
    centerInRange,
    tlInRange,
    hasGlowOpacity,
    hasContainerSize,
    hasGroupClass,
    glowOpacity: hoverInfo.glowLayerOpacity,
    passed,
  })

  await page.close()
  await ctx.close()
}

await testTheme("light")
await testTheme("dark")

await browser.close()

console.log("\n===== RESULTS =====")
console.log(JSON.stringify(results, null, 2))
const allPassed = results.every(r => r.passed)
console.log("\nALL PASSED: " + allPassed)
if (!allPassed) {
  console.log("FAILURES:")
  results.filter(r => !r.passed).forEach(r => {
    var reasons = []
    if (r.cardCount !== 6) reasons.push("cards=" + r.cardCount)
    if (!r.allHaveContent) reasons.push("missing content")
    if (!r.allNamesPresent) reasons.push("missing names")
    if (!r.centerInRange) reasons.push("center oob")
    if (!r.tlInRange) reasons.push("tl oob")
    if (!r.hasGlowOpacity) reasons.push("no glow opacity")
    if (!r.hasContainerSize) reasons.push("no container-size")
    if (!r.hasGroupClass) reasons.push("no group class")
    console.log(" - " + r.theme + ": " + reasons.join(", "))
  })
}
