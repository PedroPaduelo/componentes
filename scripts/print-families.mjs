// Prints light+dark do catálogo por família e da página /components/button.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })
const BASE = "http://localhost:5173"

const targets = [
  { name: "families-home-light", url: "/", dark: false },
  { name: "families-home-dark", url: "/", dark: true },
  { name: "families-button-light", url: "/components/button", dark: false },
  { name: "families-button-dark", url: "/components/button", dark: true },
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

for (const t of targets) {
  const page = await ctx.newPage()
  if (t.dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  await page.goto(`${BASE}${t.url}`, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `shots/${t.name}.png`, fullPage: true })
  console.log(`✓ shots/${t.name}.png`)
  await page.close()
}
await browser.close()
console.log("done")
