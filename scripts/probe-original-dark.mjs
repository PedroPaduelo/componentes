// Try to capture the chanhdai.com page in its dark theme by clicking the theme toggle
import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/chevrons-up-down-icon", { waitUntil: "networkidle", timeout: 40000 })
await page.waitForTimeout(2000)

// The theme toggle should be near the top-right; look for the hidden sun/moon icons
// The probe showed: "hidden [html.dark_&]:block" (moon) and "hidden [html.light_&]:block" (sun)
// These are inside a button. Find the button that contains them.
const themeToggleInfo = await page.evaluate(() => {
  // Find buttons that have both hidden dark and light icons
  const btns = Array.from(document.querySelectorAll("button"))
  for (const b of btns) {
    const darkEl = b.querySelector(".hidden[class*='dark']")
    const lightEl = b.querySelector(".hidden[class*='light']")
    if (darkEl && lightEl) {
      const r = b.getBoundingClientRect()
      return {
        found: true,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        text: b.textContent?.trim().slice(0, 40),
        className: b.className?.slice(0, 80),
      }
    }
  }
  return { found: false }
})
console.log("Theme toggle:", JSON.stringify(themeToggleInfo, null, 2))

if (themeToggleInfo.found) {
  await page.click(`button:has(.hidden[class*='dark_&'])`)
  await page.waitForTimeout(1500)

  // Check if html element has dark class
  const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"))
  console.log("html.dark:", isDark)

  await page.screenshot({ path: "shots/chevrons-up-down-icon/original-dark-toggled.png" })
  console.log("✓ saved original-dark-toggled.png")
}

await browser.close()
