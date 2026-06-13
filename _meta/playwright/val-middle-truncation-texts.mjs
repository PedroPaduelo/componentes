// scripts/val-middle-truncation-texts.mjs
// Testa a truncação com textos de diferentes tamanhos + valida o title (native tooltip).
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const OUT = outPath("middle-truncation")
mkdirSync(OUT, { recursive: true })

const VITRINE = "http://localhost:5173/components/middle-truncation"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function testTexts(url, label) {
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2000)

  // Para cada [data-slot="middle-truncation"], extrair:
  //  - textContent (renderizado, depois de truncado)
  //  - title attr (deve ter o texto completo se showTooltip=true)
  //  - textLength (chars)
  //  - rect
  const data = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[data-slot="middle-truncation"]'))
    return els.map((el) => ({
      textContent: el.textContent,
      textLength: (el.textContent || "").length,
      title: el.getAttribute("title"),
      titleLength: (el.getAttribute("title") || "").length,
      tag: el.tagName.toLowerCase(),
      classes: el.className,
      rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })(),
      computedFontSize: getComputedStyle(el).fontSize,
      computedFontFamily: getComputedStyle(el).fontFamily.slice(0, 60),
    }))
  })

  // Testa a função truncateMiddle com inputs de diferentes tamanhos
  const tests = await page.evaluate(() => {
    // Can't import the function directly; simulate using the same logic
    const truncateMiddle = (text, maxLength = 20, ellipsis = "…") => {
      if (text.length <= maxLength) return { result: text, truncated: false }
      const charsToShow = maxLength - ellipsis.length
      const startChars = Math.ceil(charsToShow / 2)
      const endChars = Math.floor(charsToShow / 2)
      return { result: text.slice(0, startChars) + ellipsis + text.slice(-endChars), truncated: true }
    }
    return [
      { input: "curto123", maxLength: 20, ellipsis: "…" },          // 9 chars < 20 → NO truncate
      { input: "este é um texto de tamanho médio que vai truncar", maxLength: 20, ellipsis: "…" }, // 49 chars > 20
      { input: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", maxLength: 20, ellipsis: "…" },
      { input: "https://www.apple.com/news/some/very/long/path/that/should/truncate", maxLength: 24, ellipsis: "…" },
      { input: "contato.suporte.equipe@empresa-exemplo.com.br", maxLength: 30, ellipsis: "…" },
    ].map((t) => ({ ...t, output: truncateMiddle(t.input, t.maxLength, t.ellipsis) }))
  })

  writeFileSync(`${OUT}/inspect-texts-${label}.json`, JSON.stringify({ dom: data, logicTests: tests }, null, 2))
  console.log(`✓ inspect-texts-${label}.json: ${data.length} elements`)
  await page.close()
  return { data, tests }
}

await testTexts(VITRINE, "vitrine")
await browser.close()
console.log("done")
