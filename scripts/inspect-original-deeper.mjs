// scripts/inspect-original-deeper.mjs
// Inspeciona DOM profundo do original
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = join(__dirname, "..", "shots", "theme-switcher")

const log = (msg) => console.log(`[deep] ${msg}`)
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

const trigger = await page.evaluate(() => {
  const el = document.querySelector('button[aria-label="Toggle Mode"]')
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, html: el.outerHTML.slice(0, 500) }
})
log(`trigger: ${JSON.stringify(trigger)}`)

// Click e espera 500ms
await page.mouse.click(trigger.x, trigger.y)
await sleep(500)

// Dump TUDO que possa ser menu/popover
const all = await page.evaluate(() => {
  const out = []
  // qualquer div/ul com position absolute/fixed
  document.querySelectorAll("div, ul, section, [role]").forEach((el) => {
    const cs = getComputedStyle(el)
    if (
      (cs.position === "absolute" || cs.position === "fixed") &&
      cs.zIndex !== "auto" &&
      cs.display !== "none" &&
      el.offsetWidth > 0
    ) {
      const r = el.getBoundingClientRect()
      out.push({
        tag: el.tagName,
        role: el.getAttribute("role"),
        dataState: el.getAttribute("data-state"),
        dataSide: el.getAttribute("data-side"),
        dataBaseUiMenu: el.getAttribute("data-base-ui-menu") || el.getAttribute("data-base-ui-popover"),
        zIndex: cs.zIndex,
        position: cs.position,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        text: (el.textContent || "").trim().slice(0, 200),
        className: (el.className || "").slice(0, 100),
      })
    }
  })
  return out
})
log(`abs/fixed elements: ${JSON.stringify(all, null, 2)}`)

writeFileSync(join(SHOTS_DIR, "inspect-original-deep.json"), JSON.stringify(all, null, 2))

// Tira print final
await page.screenshot({ path: join(SHOTS_DIR, "original-popover-approach-4-final.png") })

await ctx.close()
await browser.close()
log("=== DONE ===")
