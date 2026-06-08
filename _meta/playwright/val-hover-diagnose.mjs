// scripts/val-hover-diagnose.mjs
// Refaz hovers com locator.hover() + testa hover no link (que TEM CSS :hover)
import { chromium } from "playwright"
import { statSync, readFileSync } from "node:fs"
import { createHash } from "node:crypto"

const OUT = "shots/work-experience-component"

function md5(p) {
  return createHash("md5").update(readFileSync(p)).digest("hex")
}

const log = (msg) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`)

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const page = await ctx.newPage()
try { await page.goto("http://localhost:5173/components/work-experience-component", { waitUntil: "networkidle", timeout: 30000 }) }
catch (e) { log(`warn: ${e.message}`) }
await page.waitForTimeout(3000)

// 1) Hover em item (li) — testando com locator
try {
  const li = page.locator("ol > li").first()
  await li.scrollIntoViewIfNeeded()
  await li.hover()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/vitrine-light-hover-item-v2.png`, fullPage: false })
  log("✓ vitrine-light-hover-item-v2.png (via locator.hover)")
} catch (e) {
  log(`warn hover item: ${e.message}`)
}

// 2) Hover no link "Acme Corp" (que TEM hover:underline no componente)
try {
  const link = page.locator("a:has-text('Acme Corp')").first()
  await link.scrollIntoViewIfNeeded()
  await link.hover()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/vitrine-light-hover-link.png`, fullPage: false })
  log("✓ vitrine-light-hover-link.png (hover no link Acme Corp)")
} catch (e) {
  log(`warn hover link: ${e.message}`)
}

// 3) Hover em badge
try {
  const badge = page.locator("[data-slot='work-experience'] [data-slot='badge']").first()
  await badge.scrollIntoViewIfNeeded()
  await badge.hover()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/vitrine-light-hover-badge-v2.png`, fullPage: false })
  log("✓ vitrine-light-hover-badge-v2.png (via locator.hover)")
} catch (e) {
  log(`warn hover badge: ${e.message}`)
}

await page.close()
await browser.close()

// 4) Comparar hashes para detectar diffs reais
log("=== HASHES ===")
for (const f of ["vitrine-light.png","vitrine-light-hover-item.png","vitrine-light-hover-badge.png","vitrine-light-hover-item-v2.png","vitrine-light-hover-link.png","vitrine-light-hover-badge-v2.png"]) {
  try {
    const sz = statSync(`${OUT}/${f}`).size
    const h = md5(`${OUT}/${f}`)
    log(`${f.padEnd(45)} ${sz}B  md5=${h.slice(0,12)}`)
  } catch (e) { log(`(missing) ${f}`) }
}
log("=== DONE ===")
