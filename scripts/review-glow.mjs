// Review Playwright: glow-card-grid hover glow validation
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const results = []

function parseRgb(s) {
  const m = s.match(/(\d+)/g)
  return m ? m.map(Number) : [0, 0, 0]
}

function colorDiff(a, b) {
  const ra = parseRgb(a)
  const rb = parseRgb(b)
  return Math.sqrt(ra.reduce((acc, v, i) => acc + (v - rb[i]) ** 2, 0))
}

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

  // Check each card has h2, p, img
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
        imgSrc: img ? img.src : "",
      }
    })
  })
  console.log("[" + theme + "] Card contents: " + JSON.stringify(cardContents, null, 2))

  // No-hover screenshot
  await page.mouse.move(10, 10)
  await page.waitForTimeout(500)
  await page.screenshot({ path: "shots/reviewer-glow-no-hover-" + theme + ".png" })
  console.log("[" + theme + "] OK no-hover screenshot")

  // Get border colors without hover
  const noHoverBorders = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-slot="glow-card"]')
    return Array.from(cards).map((card, i) => {
      const style = getComputedStyle(card)
      return { index: i, borderColor: style.borderColor }
    })
  })
  console.log("[" + theme + "] No-hover borders: " + JSON.stringify(noHoverBorders))

  // Hover center of first card
  const firstCard = await page.$('[data-slot="glow-card"]')
  if (firstCard) {
    const box = await firstCard.boundingBox()
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.move(cx, cy)
    await page.waitForTimeout(800)

    const hoverBorderCenter = await page.evaluate(() => {
      const card = document.querySelector('[data-slot="glow-card"]')
      return card ? getComputedStyle(card).borderColor : "n/a"
    })
    console.log("[" + theme + "] Hover-center border: " + hoverBorderCenter)

    const pointerVals = await page.evaluate(() => {
      const card = document.querySelector('[data-slot="glow-card"]')
      if (!card) return null
      return {
        pointerX: card.style.getPropertyValue("--pointer-x"),
        pointerY: card.style.getPropertyValue("--pointer-y"),
      }
    })
    console.log("[" + theme + "] Pointer values at center: " + JSON.stringify(pointerVals))

    await page.screenshot({ path: "shots/reviewer-glow-hover-center-" + theme + ".png" })
    console.log("[" + theme + "] OK hover-center screenshot")

    // Hover top-left of first card
    await page.mouse.move(box.x + 10, box.y + 10)
    await page.waitForTimeout(800)

    const hoverBorderTL = await page.evaluate(() => {
      const card = document.querySelector('[data-slot="glow-card"]')
      return card ? getComputedStyle(card).borderColor : "n/a"
    })
    console.log("[" + theme + "] Hover-tl border: " + hoverBorderTL)

    const pointerValsTL = await page.evaluate(() => {
      const card = document.querySelector('[data-slot="glow-card"]')
      if (!card) return null
      return {
        pointerX: card.style.getPropertyValue("--pointer-x"),
        pointerY: card.style.getPropertyValue("--pointer-y"),
      }
    })
    console.log("[" + theme + "] Pointer values at TL: " + JSON.stringify(pointerValsTL))

    await page.screenshot({ path: "shots/reviewer-glow-hover-tl-" + theme + ".png" })
    console.log("[" + theme + "] OK hover-tl screenshot")

    // Verify border color changed
    const noHoverRgb = noHoverBorders[0] ? noHoverBorders[0].borderColor : ""
    const hoverCenterRgb = hoverBorderCenter
    const hoverTlRgb = hoverBorderTL

    const centerDiff = colorDiff(noHoverRgb, hoverCenterRgb)
    const tlDiff = colorDiff(noHoverRgb, hoverTlRgb)

    console.log("[" + theme + "] Color change center d=" + centerDiff.toFixed(1) + ", TL d=" + tlDiff.toFixed(1))

    // Check 6 expected names
    const expectedNames = ["shadcn", "OrcDev", "David Haz", "Shu", "Emil Kowalski", "Ch\u00e1nh \u00c1i"]
    const foundNames = cardContents.map(c => c.h2Text)
    const allNamesPresent = expectedNames.every(n => foundNames.some(f => f.includes(n)))

    results.push({
      theme,
      cardCount,
      allNamesPresent,
      noHoverBorder: noHoverRgb,
      hoverCenterBorder: hoverCenterRgb,
      hoverTlBorder: hoverTlRgb,
      centerDelta: centerDiff,
      tlDelta: tlDiff,
      pointerCenter: pointerVals,
      pointerTL: pointerValsTL,
      passed: cardCount === 6 && centerDiff > 30 && tlDiff > 30 && allNamesPresent,
    })
  }

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
  results.filter(r => !r.passed).forEach(r => console.log(" - " + r.theme + ": cards=" + r.cardCount + ", centerD=" + r.centerDelta + ", tlD=" + r.tlDelta + ", names=" + r.allNamesPresent))
}
