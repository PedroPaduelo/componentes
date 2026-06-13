// scripts/val-3d-pin-debug2.mjs
import { chromium } from "playwright"
import { outPath } from "./_shots.mjs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const requests = []
page.on("response", (r) => {
  if (r.status() >= 400) {
    requests.push(`${r.status()} ${r.url()}`)
  }
})
const logs = []
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`))
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") logs.push(`${m.type()}: ${m.text()}`)
})

await page.goto("http://localhost:5173/components/3d-pin", { waitUntil: "domcontentloaded", timeout: 30000 })
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  return {
    h1: document.querySelector("h1")?.textContent,
    bodyText: document.body.innerText.slice(0, 300),
    hasSlot: document.querySelector("[data-slot='3d-pin']") !== null,
    titleSpans: Array.from(document.querySelectorAll("span")).filter(s => s.textContent?.includes("acme.com")).length,
  }
})
console.log("INFO:", JSON.stringify(info, null, 2))
console.log("\n4xx/5xx REQUESTS:")
if (requests.length === 0) console.log("(nenhum)")
else requests.forEach(r => console.log("  " + r))
console.log("\nLOGS:")
if (logs.length === 0) console.log("(nenhum)")
else logs.forEach(l => console.log("  " + l))

await page.screenshot({ path: outPath("3d-pin-debug2.png"), fullPage: false })
await browser.close()
