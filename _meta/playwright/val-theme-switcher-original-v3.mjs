// scripts/val-theme-switcher-original-v3.mjs
// Tenta abrir popover do original com wait explícito
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { outPath } from "./_shots.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = outPath("theme-switcher")
mkdirSync(SHOTS_DIR, { recursive: true })

const log = (msg) => console.log(`[v3] ${msg}`)
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

// Click usando locator
const trigger = page.locator('button[aria-label="Toggle Mode"]')
const triggerCount = await trigger.count()
log(`trigger count: ${triggerCount}`)

if (triggerCount > 0) {
  // Espera por QUALQUER menu que apareça em até 2s
  const popoverPromise = page
    .waitForSelector(
      '[data-base-ui-menu], [data-base-ui-popover], [role="menu"], [data-state="open"]',
      { timeout: 2000, state: "visible" }
    )
    .catch(() => null)

  await trigger.click({ force: true })
  const popoverEl = await popoverPromise
  log(`popover appeared: ${!!popoverEl}`)

  await sleep(500)
  await page.screenshot({ path: join(SHOTS_DIR, "original-popover-approach-5.png") })
  log("✓ original-popover-approach-5.png")

  // Inspeciona tudo visível
  const dump = await page.evaluate(() => {
    const result = {}
    result.allVisible = Array.from(document.querySelectorAll("*"))
      .filter((el) => {
        const cs = getComputedStyle(el)
        return cs.display !== "none" && el.offsetWidth > 50 && el.offsetHeight > 30
      })
      .filter((el) => /menu|popover|dropdown|dialog/i.test(el.tagName + (el.className || "") + (el.getAttribute("role") || "")))
      .slice(0, 10)
      .map((el) => ({
        tag: el.tagName,
        role: el.getAttribute("role"),
        dataBaseUi: Object.fromEntries(
          Array.from(el.attributes)
            .filter((a) => a.name.startsWith("data-base-ui"))
            .map((a) => [a.name, a.value])
        ),
        dataState: el.getAttribute("data-state"),
        text: (el.textContent || "").trim().slice(0, 150),
      }))
    return result
  })

  writeFileSync(join(SHOTS_DIR, "inspect-original-deep-v3.json"), JSON.stringify(dump, null, 2))
  log(`dump: ${JSON.stringify(dump, null, 2)}`)
}

await ctx.close()
await browser.close()
log("=== DONE ===")
