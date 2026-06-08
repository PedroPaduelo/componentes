// Tira prints light + dark de cada detalhe do lote chanhdai pra validação visual.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const slugs = [
  "chevrons-up-down-icon", "code-block-command", "dot-grid-spotlight",
  "fluid-gradient-text", "glow-card-grid", "icon-swap", "react-wheel-picker",
  "shimmering-text", "theme-toggle-effect", "mobius-loop-icon",
  "scroll-fade-effect", "slide-to-unlock", "theme-switcher",
  "consent-manager", "copy-button", "elastic-slider", "github-contributions",
  "middle-truncation", "toc-minimap",
]

const browser = await chromium.launch()
let ok = 0
for (const slug of slugs) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    if (theme === "dark") {
      await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
    }
    try {
      await page.goto(`http://localhost:5173/components/${slug}`, {
        waitUntil: "networkidle",
        timeout: 20000,
      })
      await page.waitForTimeout(500)
      await page.screenshot({
        path: `shots/vitrine-${slug}-${theme}.png`,
        fullPage: false,
      })
      ok++
    } catch (e) {
      console.warn(`FAIL ${slug}-${theme}: ${e.message}`)
    }
    await ctx.close()
  }
}
await browser.close()
console.log(`--- ${ok}/${slugs.length * 2} prints salvos em shots/`)
