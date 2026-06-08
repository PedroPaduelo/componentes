// Valida que cada slug do lote chanhdai renderiza examples (não cai no "Exemplos em breve").
import { chromium } from "playwright"

const slugs = [
  "chevrons-up-down-icon", "code-block-command", "dot-grid-spotlight",
  "fluid-gradient-text", "glow-card-grid", "icon-swap", "react-wheel-picker",
  "shimmering-text", "theme-toggle-effect", "mobius-loop-icon",
  "scroll-fade-effect", "slide-to-unlock", "theme-switcher",
  "consent-manager", "copy-button", "elastic-slider", "github-contributions",
  "middle-truncation", "toc-minimap",
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

let ok = 0, broken = 0
for (const slug of slugs) {
  const page = await ctx.newPage()
  await page.goto(`http://localhost:5173/components/${slug}`, {
    waitUntil: "networkidle",
    timeout: 20000,
  }).catch(() => {})
  const hasEmpty = await page.locator("text=Exemplos em breve").count()
  const hasTabs = await page.locator('[role="tablist"]').count()
  const title = (await page.locator("h1").first().textContent().catch(() => ""))?.trim()
  if (hasEmpty > 0) {
    broken++
    console.log(`FAIL ${slug} — "Exemplos em breve" ainda aparece`)
  } else if (hasTabs > 0) {
    ok++
    console.log(`OK   ${slug} — examples renderizados (${title})`)
  } else {
    broken++
    console.log(`WARN ${slug} — sem tabs e sem empty state`)
  }
  await page.close()
}
await browser.close()
console.log("---")
console.log(`TOTAL: ${ok} OK, ${broken} BROKEN de ${slugs.length}`)
process.exit(broken === 0 ? 0 : 1)
