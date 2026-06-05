import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.grantPermissions(["clipboard-read", "clipboard-write"])
const page = await ctx.newPage()
await page.goto("http://localhost:5173/components/copy-button", { waitUntil: "networkidle" })
await page.waitForTimeout(2000)

const btn = page.locator("[data-slot=copy-button]").first()
await btn.click()
await page.waitForTimeout(2500) // wait past 2000ms feedbackMs

// Verify state has reverted
const stateAfter = await page.evaluate(() => {
  const btn = document.querySelector("[data-slot=copy-button]")
  return {
    text: btn.textContent?.trim(),
    hasCheckIcon: !!btn.querySelector('svg.lucide-check'),
    hasCopyIcon: !!btn.querySelector('svg.lucide-copy'),
  }
})
console.log("State after 2500ms:", JSON.stringify(stateAfter))

await page.screenshot({ path: "shots/copy-button/vitrine-light-click-2500ms.png" })
console.log("✓ shots/copy-button/vitrine-light-click-2500ms.png")
await browser.close()
