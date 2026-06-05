// scripts/print-vitrine-glow-update.mjs
// Prints da vitrine atualizada (light + dark) pra validar glow-card-grid
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// Light
const pageLight = await ctx.newPage()
await pageLight.goto("http://localhost:5173/components/glow-card-grid", {
  waitUntil: "networkidle",
  timeout: 30000,
})
await pageLight.waitForTimeout(2000)
await pageLight.screenshot({
  path: "shots/vitrine-glow-card-grid-light.png",
  fullPage: false,
})
console.log("✓ shots/vitrine-glow-card-grid-light.png")
await pageLight.close()

// Dark
const pageDark = await ctx.newPage()
await pageDark.addInitScript(() => {
  localStorage.setItem("vitrine-theme", "dark")
})
await pageDark.goto("http://localhost:5173/components/glow-card-grid", {
  waitUntil: "networkidle",
  timeout: 30000,
})
await pageDark.waitForTimeout(2000)
await pageDark.screenshot({
  path: "shots/vitrine-glow-card-grid-dark.png",
  fullPage: false,
})
console.log("✓ shots/vitrine-glow-card-grid-dark.png")
await pageDark.close()

await browser.close()
console.log("done")
