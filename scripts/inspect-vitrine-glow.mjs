// scripts/inspect-vitrine-glow.mjs
// Inspeciona DOM do glow-card-grid: 6 nomes h2 + 6 imgs de avatar
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("http://localhost:5173/components/glow-card-grid", {
  waitUntil: "networkidle",
  timeout: 30000,
})
await page.waitForTimeout(2000)

const names = await page.$$eval(
  "[data-slot='glow-card'] h2",
  (els) => els.map((e) => e.textContent)
)

const imgs = await page.$$eval(
  "[data-slot='glow-card'] img",
  (els) => els.map((e) => e.src)
)

console.log("Nomes encontrados:", JSON.stringify(names, null, 2))
console.log("Total nomes:", names.length)
console.log("Avatares encontrados:", JSON.stringify(imgs, null, 2))
Console.log("Total avatares:", imgs.length)

const expectedNames = [
  "shadcn",
  "OrcDev",
  "David Haz",
  "Shu",
  "Emil Kowalski",
  "Chánh Đại",
]

const namesOk = JSON.stringify(names) === JSON.stringify(expectedNames)
const imgsOk = imgs.length === 6 && imgs.every((s) => s.startsWith("https://unavatar.io/x/"))

console.log("\n=== VALIDAÇÃO ===")
console.log("Nomes corretos:", namesOk ? "✅" : "❌")
console.log("Avatares corretos:", imgsOk ? "✅" : "❌")

await page.close()
await browser.close()
