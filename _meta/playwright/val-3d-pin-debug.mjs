// scripts/val-3d-pin-debug.mjs
// Debug simples: vê o que está no DOM e no console.
import { chromium } from "playwright"
import { outPath } from "./_shots.mjs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const logs = []
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`))
page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`))

await page.goto("http://localhost:5173/components/3d-pin", { waitUntil: "domcontentloaded", timeout: 30000 })
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  const h1 = document.querySelector("h1")
  return {
    title: document.title,
    h1: h1?.textContent,
    bodyText: document.body.innerText.slice(0, 500),
    hasSlot: document.querySelector("[data-slot='3d-pin']") !== null,
    allSlots: Array.from(document.querySelectorAll("[data-slot]")).map(s => s.dataset.slot).slice(0, 20),
  }
})

console.log("INFO:", JSON.stringify(info, null, 2))
console.log("\nLOGS:", logs.length === 0 ? "(nenhum)" : logs.join("\n"))

await page.screenshot({ path: outPath("3d-pin-debug.png"), fullPage: false })
await browser.close()
