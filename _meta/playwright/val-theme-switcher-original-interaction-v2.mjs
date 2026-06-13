// scripts/val-theme-switcher-original-interaction-v2.mjs
// Tenta diferentes abordagens pra abrir o popover do original
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { outPath } from "./_shots.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = outPath("theme-switcher")
mkdirSync(SHOTS_DIR, { recursive: true })

const log = (msg) => console.log(`[orig2] ${msg}`)
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
await sleep(4000)

// Tira print inicial
await page.screenshot({ path: join(SHOTS_DIR, "original-popover-approach-1.png") })
log("✓ original-popover-approach-1.png (initial)")

// Acha o trigger
const trigger = await page.evaluate(() => {
  const el = document.querySelector('button[aria-label="Toggle Mode"]')
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    x: r.x + r.width / 2,
    y: r.y + r.height / 2,
  }
})
log(`trigger center: ${JSON.stringify(trigger)}`)

// Abordagem 1: hover direto no botão
await page.mouse.move(trigger.x, trigger.y)
await sleep(800)
await page.screenshot({ path: join(SHOTS_DIR, "original-popover-approach-2-hover.png") })
log("✓ original-popover-approach-2-hover.png")

// Verifica se abriu
const popover1 = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[role="menu"], [role="listbox"], [role="dialog"], [data-state="open"]'))
    .map((p) => ({
      role: p.getAttribute("role"),
      dataState: p.getAttribute("data-state"),
      text: (p.textContent || "").trim().slice(0, 200),
    }))
})
log(`after hover: ${JSON.stringify(popover1)}`)

// Abordagem 2: click + espera
await page.mouse.click(trigger.x, trigger.y)
await sleep(200) // click + animação rápida
await page.screenshot({ path: join(SHOTS_DIR, "original-popover-approach-3-after-click.png") })
log("✓ original-popover-approach-3-after-click.png")

const popover2 = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[role="menu"], [role="listbox"], [role="dialog"], [data-state="open"]'))
    .map((p) => ({
      role: p.getAttribute("role"),
      dataState: p.getAttribute("data-state"),
      text: (p.textContent || "").trim().slice(0, 200),
    }))
})
log(`after click: ${JSON.stringify(popover2)}`)

writeFileSync(join(SHOTS_DIR, "inspect-original-popover-v2.json"), JSON.stringify({ afterHover: popover1, afterClick: popover2 }, null, 2))

await ctx.close()
await browser.close()
log("=== DONE ===")
