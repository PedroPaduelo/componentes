// scripts/val-flip-words.mjs (v2)
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("http://localhost:5173/components/flip-words", { waitUntil: "domcontentloaded", timeout: 30000 })
await page.waitForTimeout(3000)

// Captura HTML bruto dos slots presentes
const all = await page.evaluate(() => {
  const slots = Array.from(document.querySelectorAll("[data-slot]"))
  return slots
    .map((el) => ({
      slot: el.getAttribute("data-slot"),
      text: el.textContent?.trim().slice(0, 60),
      visible: el.getBoundingClientRect().width > 0,
    }))
    .filter((x) => x.slot && (x.slot.includes("flip") || x.slot.includes("example")))
})
console.log("[DOM] slots relacionados:", JSON.stringify(all, null, 2))

// 1) data-slot existe
const slotsCount = await page.locator("[data-slot=flip-words]").count()
console.log(`[slots] data-slot=flip-words count: ${slotsCount}`)

// 2) Pega texto da primeira palavra visível no primeiro exemplo
const first = await page.locator("[data-slot=flip-words]").first().innerText().catch(() => "")
console.log(`[first] innerText: "${first.trim().slice(0, 80)}"`)

// 3) Aguarda 4s e captura de novo
await page.waitForTimeout(4000)
const after = await page.locator("[data-slot=flip-words]").first().innerText().catch(() => "")
console.log(`[after] innerText: "${after.trim().slice(0, 80)}"`)
console.log(`[cycle] changed: ${first !== after}`)

await page.screenshot({ path: "shots/flip-words.png", fullPage: false })
console.log("✓ shots/flip-words.png")

// Dark
await page.evaluate(() => localStorage.setItem("vitrine-theme", "dark"))
await page.reload({ waitUntil: "domcontentloaded" })
await page.waitForTimeout(3000)
await page.screenshot({ path: "shots/flip-words-dark.png", fullPage: false })
console.log("✓ shots/flip-words-dark.png")

// Light: segundo example
const slotsCount2 = await page.locator("[data-slot=flip-words]").count()
console.log(`[slots-final] data-slot=flip-words count: ${slotsCount2}`)

await browser.close()
