// scripts/val-theme-switcher-original-interaction.mjs
// Tira print do theme switcher do ORIGINAL aberto + mede estado
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { outPath } from "./_shots.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = outPath("theme-switcher")
mkdirSync(SHOTS_DIR, { recursive: true })

const log = (msg) => console.log(`[orig] ${msg}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
try {
  await page.goto("https://chanhdai.com/components/theme-switcher", {
    waitUntil: "networkidle",
    timeout: 45000,
  })
} catch (e) {
  log(`warn goto: ${e.message}`)
}
await sleep(3500)

// Mede o estado inicial do original
const initialState = await page.evaluate(() => ({
  bodyBg: getComputedStyle(document.body).backgroundColor,
  bodyColor: getComputedStyle(document.body).color,
  htmlClassList: Array.from(document.documentElement.classList),
  ls: Object.fromEntries(
    ["theme", "next-theme", "color-theme"].map((k) => [k, localStorage.getItem(k)])
  ),
}))
log(`initial: ${JSON.stringify(initialState)}`)

// Acha o trigger do theme switcher do header
const trigger = await page.evaluate(() => {
  // O original usa "Toggle Mode" como aria-label
  const candidates = [
    'button[aria-label="Toggle Mode"]',
    'button[aria-label*="Toggle" i]',
  ]
  for (const sel of candidates) {
    const el = document.querySelector(sel)
    if (el) {
      const r = el.getBoundingClientRect()
      return {
        selector: sel,
        ariaLabel: el.getAttribute("aria-label"),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      }
    }
  }
  return { found: false }
})
log(`trigger: ${JSON.stringify(trigger)}`)

if (trigger.found || trigger.selector) {
  await page.click(trigger.selector)
  await sleep(800)
  await page.screenshot({ path: join(SHOTS_DIR, "original-popover-open.png") })
  log("✓ original-popover-open.png")

  // Inspeciona o popover
  const popover = await page.evaluate(() => {
    const popovers = Array.from(
      document.querySelectorAll('[role="menu"], [role="listbox"], [role="dialog"], [data-state="open"]')
    )
    return popovers.map((p) => {
      const r = p.getBoundingClientRect()
      return {
        role: p.getAttribute("role"),
        dataState: p.getAttribute("data-state"),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        text: (p.textContent || "").trim().slice(0, 200),
        items: Array.from(p.querySelectorAll('[role="menuitem"], [role="option"], button')).map((it) => ({
          tag: it.tagName,
          role: it.getAttribute("role"),
          text: (it.textContent || "").trim().slice(0, 40),
          hasSvg: !!it.querySelector("svg"),
        })),
      }
    })
  })
  writeFileSync(join(SHOTS_DIR, "inspect-original-popover.json"), JSON.stringify(popover, null, 2))
  log(`popover: ${JSON.stringify(popover, null, 2)}`)
}

await ctx.close()
await browser.close()
log("=== DONE ===")
