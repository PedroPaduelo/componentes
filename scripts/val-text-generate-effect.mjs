// scripts/val-text-generate-effect.mjs
// Valida text-generate-effect: página /components/text-generate-effect,
// presença de data-slot, renderização dos 3 examples, e cor text-foreground.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("http://localhost:5173/components/text-generate-effect", {
  waitUntil: "domcontentloaded",
  timeout: 30000,
})
// aguarda a animação stagger terminar (3 examples * 12 palavras * 0.2s + buffer)
await page.waitForTimeout(8000)

const result = {
  slots: 0,
  examples: 0,
  firstText: "",
  firstOpacity: "",
  firstFilter: "",
  firstColor: "",
  firstBg: "",
  // luzes: detecta se a animação stagger realmente rodou (spans com opacity 1 depois)
  wordsWithOpacityOne: 0,
  totalWords: 0,
  consoleErrors: [],
}

result.slots = await page.locator("[data-slot='text-generate-effect']").count()
result.examples = await page
  .locator("[data-slot='text-generate-effect']")
  .count()

const first = page.locator("[data-slot='text-generate-effect']").first()
result.firstText = (await first.innerText().catch(() => "")).trim().slice(0, 100)

// mede estilos do primeiro span do primeiro example (dentro do scope)
const probe = await first
  .evaluate((el) => {
    const span = el.querySelector("span")
    if (!span) return null
    const cs = getComputedStyle(span)
    return {
      opacity: cs.opacity,
      filter: cs.filter,
      color: cs.color,
      bg: cs.backgroundColor,
      text: span.textContent?.trim() ?? "",
    }
  })
  .catch(() => null)

if (probe) {
  result.firstOpacity = probe.opacity
  result.firstFilter = probe.filter
  result.firstColor = probe.color
  result.firstBg = probe.bg
  if (probe.opacity === "1") result.wordsWithOpacityOne = 1
}

result.totalWords = await first.locator("span").count()
const opacities = await first.evaluate((el) => {
  const spans = Array.from(el.querySelectorAll("span"))
  return spans.map((s) => Number(getComputedStyle(s).opacity))
})
result.wordsWithOpacityOne = opacities.filter((o) => o > 0.95).length

// console errors
page.on("pageerror", (e) => result.consoleErrors.push(`pageerror: ${e.message}`))
page.on("console", (msg) => {
  if (msg.type() === "error") result.consoleErrors.push(`console.error: ${msg.text()}`)
})

await page
  .screenshot({ path: "shots/text-generate-effect-light.png", fullPage: true })
  .catch(() => {})

console.log(JSON.stringify(result, null, 2))
await browser.close()
