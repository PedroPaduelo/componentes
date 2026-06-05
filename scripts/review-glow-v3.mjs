// Review Playwright v3: glow-card-grid — deep DOM inspection
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("http://localhost:5173/components/glow-card-grid", { waitUntil: "networkidle" })
await page.waitForTimeout(2000)

// Deep DOM inspection of first card
const domInfo = await page.evaluate(() => {
  const card = document.querySelectorAll('[data-slot="glow-card"]')[0]
  if (!card) return null

  function describeEl(el, depth) {
    if (depth > 4) return { tag: el.tagName, note: "..." }
    const cs = getComputedStyle(el)
    return {
      tag: el.tagName,
      classes: el.className ? el.className.substring(0, 60) : "",
      bg: cs.backgroundColor,
      opacity: cs.opacity,
      transform: cs.transform ? cs.transform.substring(0, 80) : "",
      filter: cs.filter ? cs.filter.substring(0, 80) : "",
      backdrop: cs.backdropFilter ? cs.backdropFilter.substring(0, 80) : "",
      borderColor: cs.borderColor,
      children: Array.from(el.children).map(c => describeEl(c, depth + 1)),
    }
  }

  return {
    card: describeEl(card, 0),
    pointerX: card.style.getPropertyValue("--pointer-x"),
    pointerY: card.style.getPropertyValue("--pointer-y"),
  }
})
console.log("DOM structure: " + JSON.stringify(domInfo, null, 2))

// Move mouse to center of first card
const firstCard = await page.$('[data-slot="glow-card"]')
const box = await firstCard.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.waitForTimeout(1000)

// Inspect after hover
const hoverInfo = await page.evaluate(() => {
  const card = document.querySelectorAll('[data-slot="glow-card"]')[0]
  if (!card) return null
  const clipDiv = card.children[0] // first child: clip container
  const borderDiv = card.children[1] // second child: border glow

  // Inside clipDiv: glow layer + content layer
  const glowDiv = clipDiv ? clipDiv.querySelector('.opacity-\\[var\\(--card-icon-opacity\\)\\]') : null

  // Try finding by class that has translate-x with pointer-x
  const allDivs = clipDiv ? Array.from(clipDiv.querySelectorAll('div')) : []
  const translateDiv = allDivs.find(d => d.className.includes('translate-x'))

  return {
    pointerX: card.style.getPropertyValue("--pointer-x"),
    pointerY: card.style.getPropertyValue("--pointer-y"),
    clipDivClass: clipDiv ? clipDiv.className.substring(0, 80) : "n/a",
    borderDivOpacity: borderDiv ? getComputedStyle(borderDiv).opacity : "n/a",
    borderDivBackdrop: borderDiv ? getComputedStyle(borderDiv).backdropFilter : "n/a",
    glowDivFound: !!glowDiv,
    glowDivOpacity: glowDiv ? getComputedStyle(glowDiv).opacity : "n/a",
    glowDivTransform: glowDiv ? getComputedStyle(glowDiv).transform : "n/a",
    glowDivFilter: glowDiv ? getComputedStyle(glowDiv).filter.substring(0, 80) : "n/a",
    translateDivFound: !!translateDiv,
    translateDivOpacity: translateDiv ? getComputedStyle(translateDiv).opacity : "n/a",
    translateDivTransform: translateDiv ? getComputedStyle(translateDiv).transform : "n/a",
    translateDivFilter: translateDiv ? getComputedStyle(translateDiv).filter.substring(0, 80) : "n/a",
  }
})
console.log("\nHover info: " + JSON.stringify(hoverInfo, null, 2))

// Now test hover effect: the group-hover opacity increase
const hoverOpacityCheck = await page.evaluate(() => {
  const card = document.querySelectorAll('[data-slot="glow-card"]')[0]
  if (!card) return null

  // Find the element that should have the hover opacity
  // Look for elements with group-hover/glow-card in computed styles
  function findGlowElements(el, depth) {
    if (depth > 5) return []
    const results = []
    const cs = getComputedStyle(el)
    // Check opacity
    if (cs.opacity && cs.opacity !== "1" && cs.opacity !== "0") {
      results.push({
        tag: el.tagName,
        classes: el.className ? el.className.substring(0, 80) : "",
        opacity: cs.opacity,
        transform: cs.transform ? cs.transform.substring(0, 60) : "",
      })
    }
    for (const child of el.children) {
      results.push(...findGlowElements(child, depth + 1))
    }
    return results
  }

  return findGlowElements(card, 0)
})
console.log("\nElements with non-trivial opacity: " + JSON.stringify(hoverOpacityCheck, null, 2))

await page.screenshot({ path: "shots/reviewer-glow-v3-hover.png" })
console.log("\nOK screenshot saved")

await page.close()
await ctx.close()
await browser.close()
