// Validador Playwright do Wobble Card: verifica que o card aparece, tem
// altura > 0, e que ao mover o mouse o transform do wrapper muda
// (translate3d com translateX/Y não-zero). O conteúdo interno deve
// receber o movimento inverso + scale3d(1.03).
import { chromium } from "playwright"

const url = "http://localhost:5173/components/wobble-card"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const consoleErrors = []
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`))
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(`console.error: ${msg.text()}`)
})

try {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(1500)
} catch (e) {
  console.warn(`warn goto: ${e.message}`)
}

const card = page.locator('[data-slot="wobble-card"]').first()
const cardContent = page.locator('[data-slot="wobble-card-content"]').first()

const initialBox = await card.boundingBox()
const initialTransform = await card.evaluate((el) => el.style.transform)
const initialContentTransform = await cardContent.evaluate(
  (el) => el.style.transform,
)

console.log("INITIAL (sem hover):")
console.log("  card box:             ", JSON.stringify(initialBox))
console.log("  card style.transform: ", initialTransform)
console.log("  content transform:    ", initialContentTransform)

let cardHasNonZero = false
let contentHasNonZero = false
let contentHasScale = false

if (initialBox && initialBox.height > 0) {
  // Mover mouse pra fora (mouseLeave) e depois voltar com hover em
  // posição offset → dispara mouseenter + mousemove
  await page.mouse.move(0, 0)
  await page.waitForTimeout(150)
  await card.hover({ position: { x: 100, y: 100 } })
  await page.waitForTimeout(400)
  const hoverTransform = await card.evaluate((el) => el.style.transform)
  const hoverContentTransform = await cardContent.evaluate(
    (el) => el.style.transform,
  )
  console.log("HOVER (offset +100,+100 do topo-esquerdo):")
  console.log("  card transform:       ", hoverTransform)
  console.log("  content transform:    ", hoverContentTransform)

  cardHasNonZero =
    hoverTransform.includes("translate3d") &&
    !hoverTransform.includes("translate3d(0px, 0px, 0px)")
  contentHasNonZero =
    hoverContentTransform.includes("translate3d") &&
    !hoverContentTransform.includes("translate3d(0px, 0px, 0px)")
  contentHasScale = hoverContentTransform.includes("1.03")
}

console.log("---")
console.log("CHECKS:")
console.log(`  card height > 0:           ${initialBox ? initialBox.height > 0 : false}`)
console.log(`  card translate3d não-zero: ${cardHasNonZero}`)
console.log(`  content translate3d ≠ 0:   ${contentHasNonZero}`)
console.log(`  content scale 1.03:        ${contentHasScale}`)

const allOk =
  initialBox &&
  initialBox.height > 0 &&
  cardHasNonZero &&
  contentHasNonZero &&
  contentHasScale &&
  consoleErrors.length === 0

console.log("---")
console.log(`console errors: ${consoleErrors.length}`)
for (const e of consoleErrors) console.log(`  ${e}`)
console.log(`ALL OK: ${allOk}`)

await page.screenshot({ path: "shots/val-wobble-card.png", fullPage: false })
console.log("✓ shots/val-wobble-card.png")

await browser.close()
process.exit(allOk ? 0 : 1)
