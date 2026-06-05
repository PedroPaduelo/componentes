import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
mkdirSync("shots/scroll-fade-effect", { recursive: true })

const browser = await chromium.launch()

for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme,
  })
  const page = await ctx.newPage()
  try {
    await page.goto("https://chanhdai.com/components/scroll-fade-effect", { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`warn ${theme}: ${e.message}`)
  }
  await page.waitForTimeout(3500)
  const out = `shots/scroll-fade-effect/original-${theme}.png`
  await page.screenshot({ path: out, fullPage: false })
  console.log(`✓ ${out}`)
  await page.close()
  await ctx.close()
}

await browser.close()
