import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const targets = [
  { name: "original-consent-manager", url: "https://chanhdai.com/components/consent-manager" },
  { name: "vitrine-consent-manager-light", url: "http://localhost:5173/components/consent-manager" },
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

for (const t of targets) {
  const page = await ctx.newPage()
  if (t.name.includes("dark")) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
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
