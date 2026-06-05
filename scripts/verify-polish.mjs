// scripts/verify-polish.mjs
// Verifica os 3 fixes de polish do theme-switcher:
// 1. Trigger 32x32 (rect.w === 32 && rect.h === 32)
// 2. Tooltip visivel no hover (content text "Alternar tema")
// 3. aria-checked nos menuitems (true no ativo, false nos outros)
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = join(__dirname, "..", "shots", "theme-switcher")
mkdirSync(SHOTS_DIR, { recursive: true })

const log = (m) => console.log(`[polish] ${m}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
await page.goto("http://localhost:5173/components/theme-switcher", {
  waitUntil: "networkidle",
  timeout: 30000,
})
await sleep(2000)

// === FIX #1: Trigger 32x32 ===
const triggerRect = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="Toggle theme"]')
  if (!btn) return null
  const r = btn.getBoundingClientRect()
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
})
log(`FIX#1 trigger rect: ${JSON.stringify(triggerRect)}`)
const fix1Pass = triggerRect && triggerRect.w === 32 && triggerRect.h === 32
log(`FIX#1 (trigger 32x32): ${fix1Pass ? "✅ PASS" : "❌ FAIL"}`)

// === FIX #2: Tooltip on hover ===
// Hover the trigger and check if tooltip text "Alternar tema" appears
await page.hover('button[aria-label="Toggle theme"]')
await sleep(800) // default Radix tooltip delay
const tooltipInfo = await page.evaluate(() => {
  // Radix Tooltip content lives in a portal, not inside the trigger
  const tooltips = Array.from(
    document.querySelectorAll('[data-slot="tooltip-content"], [role="tooltip"]')
  ).map((el) => ({
    slot: el.getAttribute("data-slot"),
    role: el.getAttribute("role"),
    dataState: el.getAttribute("data-state"),
    text: (el.textContent || "").trim(),
    rect: (() => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })(),
    visible: el.getAttribute("data-state") === "delayed-open" || el.getAttribute("data-state") === "instant-open" || (() => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 })(),
  }))
  return tooltips
})
log(`FIX#2 tooltip elements: ${JSON.stringify(tooltipInfo)}`)
const fix2Pass = tooltipInfo.some((t) => t.text === "Alternar tema" && t.visible)
log(`FIX#2 (tooltip "Alternar tema"): ${fix2Pass ? "✅ PASS" : "❌ FAIL"}`)
// Screenshot of the trigger area with tooltip
await page.screenshot({ path: join(SHOTS_DIR, "vitrine-light-tooltip-visible.png") })
log(`✓ vitrine-light-tooltip-visible.png`)

// === FIX #3: aria-checked on menuitems ===
// Click the trigger to open popover, then inspect items BEFORE clicking any
await page.click('button[aria-label="Toggle theme"]')
await sleep(600)
const menuitems = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[role="menuitem"]')).map((it) => ({
    text: (it.textContent || "").trim().slice(0, 30),
    ariaChecked: it.getAttribute("aria-checked"),
    dataSlot: it.getAttribute("data-slot"),
  }))
})
log(`FIX#3 menuitems: ${JSON.stringify(menuitems)}`)
const fix3Pass = menuitems.length === 3 && menuitems.some((m) => m.ariaChecked === "true") && menuitems.some((m) => m.ariaChecked === "false")
log(`FIX#3 (aria-checked mix): ${fix3Pass ? "✅ PASS" : "❌ FAIL"}`)

// Screenshot of the popover open with active item visible
await page.screenshot({ path: join(SHOTS_DIR, "vitrine-light-popover-with-aria-checked.png") })
log(`✓ vitrine-light-popover-with-aria-checked.png`)

// Save the verification results
writeFileSync(
  join(SHOTS_DIR, "polish-verification.json"),
  JSON.stringify(
    {
      fix1_trigger32x32: { pass: fix1Pass, rect: triggerRect },
      fix2_tooltip: { pass: fix2Pass, tooltips: tooltipInfo },
      fix3_aria_checked: { pass: fix3Pass, menuitems },
    },
    null,
    2
  )
)
log(`✓ polish-verification.json`)

const allPass = fix1Pass && fix2Pass && fix3Pass
log(`=== ${allPass ? "✅ ALL 3 FIXES PASS" : "❌ SOME FIX FAILED"} ===`)

await ctx.close()
await browser.close()
process.exit(allPass ? 0 : 1)
