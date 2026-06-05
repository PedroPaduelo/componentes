// Print script for toc-minimap validation
// Compares original (chanhdai.com) vs vitrine in light/dark
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const targets = [
  { name: "original-toc-minimap", url: "https://chanhdai.com/components/toc-minimap" },
  { name: "vitrine-toc-minimap", url: "http://localhost:5173/components/toc-minimap" },
  { name: "vitrine-toc-minimap-dark", url: "http://localhost:5173/components/toc-minimap" },
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

for (const t of targets) {
  const page = await ctx.newPage()
  if (t.name.endsWith("-dark")) {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  try {
    await page.goto(t.url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`warn ${t.name}: ${e.message}`)
  }
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `shots/${t.name}.png`, fullPage: false })
  console.log(`✓ shots/${t.name}.png`)
  await page.close()
}
await browser.close()
console.log("done")
