// scripts/val-theme-switcher-interactions.mjs
// Re-roda APENAS as interações (corrigindo Light)
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = join(__dirname, "..", "shots", "theme-switcher")
mkdirSync(SHOTS_DIR, { recursive: true })

const log = (msg) => console.log(`[inter] ${msg}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const measureTheme = async (page) =>
  page.evaluate(() => ({
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
    htmlClassList: Array.from(document.documentElement.classList),
    ls: localStorage.getItem("vitrine-theme"),
  }))

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
await page.goto("http://localhost:5173/components/theme-switcher", {
  waitUntil: "networkidle",
  timeout: 30000,
})
await sleep(2000)

const triggerInfo = await page.evaluate(() => {
  const selectors = [
    '[data-slot="theme-switcher"] button',
    '[data-slot="theme-toggle"] button',
    '[data-slot="theme-toggle-effect"]',
    'button[aria-label*="theme" i]',
  ]
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el) {
      const r = el.getBoundingClientRect()
      return { selector: sel, ariaLabel: el.getAttribute("aria-label") }
    }
  }
  return { found: false }
})
log(`trigger: ${JSON.stringify(triggerInfo)}`)

const themeValues = ["light", "dark", "system"]
for (const themeVal of themeValues) {
  // Re-abre popover se fechou
  const stillOpen = await page.evaluate((sel) => {
    const t = document.querySelector(sel)
    return t?.getAttribute("aria-expanded") === "true" || t?.getAttribute("data-state") === "open"
  }, triggerInfo.selector)
  if (!stillOpen) {
    await page.click(triggerInfo.selector).catch(() => {})
    await sleep(400)
  }

  // Match flexível (aceita emoji)
  const opt = page
    .getByRole("menuitem")
    .filter({ hasText: new RegExp(themeVal, "i") })
    .first()
  const optCount = await opt.count()
  if (optCount === 0) {
    log(`⚠ opção "${themeVal}" não encontrada`)
    continue
  }
  log(`option ${themeVal}: found`)

  // Hover
  await opt.hover()
  await sleep(500)
  await page.screenshot({ path: join(SHOTS_DIR, `vitrine-light-hover-${themeVal}.png`) })
  log(`✓ vitrine-light-hover-${themeVal}.png`)

  // Click
  await opt.click()
  await sleep(700)
  const afterClick = await measureTheme(page)
  log(`after click ${themeVal}: ${JSON.stringify(afterClick)}`)
  writeFileSync(
    join(SHOTS_DIR, `vitrine-light-selected-${themeVal}-state.json`),
    JSON.stringify(afterClick, null, 2)
  )
  await page.screenshot({ path: join(SHOTS_DIR, `vitrine-light-selected-${themeVal}.png`) })
  log(`✓ vitrine-light-selected-${themeVal}.png`)
}

await ctx.close()
await browser.close()
log("=== DONE ===")
