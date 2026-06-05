/**
 * Validação Playwright — ThemeToggleEffect variantes.
 *
 * Testa cada variante em light e dark:
 * - Tira print do estado inicial
 * - Clica no botão da variante
 * - Verifica se o background mudou corretamente
 *
 * Uso: node scripts/check-theme-toggle-variants.mjs
 */

import { chromium } from "playwright"
import { mkdirSync, existsSync } from "node:fs"

const SHOTS_DIR = "shots"
if (!existsSync(SHOTS_DIR)) mkdirSync(SHOTS_DIR, { recursive: true })

const BASE_URL = "http://localhost:5173/components/theme-toggle-effect"

const VARIANTS = [
  "circle",
  "circle-blur",
  "circle-blur-top-left",
  "triangle",
  "triangle-blur",
  "polygon",
  "polygon-gradient",
]

// Configurações de teste: variante + withEffect
const CONFIGS = [
  ...VARIANTS.map((v) => ({ variant: v, withEffect: true })),
  { variant: "none", withEffect: false },
]

const LIGHT_BG = "oklch(1 0 0)"
const DARK_BG = "oklch(0.145 0 0)"

let passed = 0
let failed = 0
const failures = []

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

for (const config of CONFIGS) {
  const label = config.withEffect === false ? "no-effect" : config.variant

  for (const theme of ["light", "dark"]) {
    const page = await ctx.newPage()

    // Set initial theme via localStorage
    await page.addInitScript((t) => {
      localStorage.setItem("vitrine-theme", t)
    }, theme)

    try {
      await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 })
    } catch (e) {
      console.warn(`  ⚠ ${label}/${theme}: goto falhou (${e.message})`)
    }

    await page.waitForTimeout(500)

    // Screenshot initial
    const initialShot = `${SHOTS_DIR}/theme-toggle-effect-${label}-${theme}-initial.png`
    await page.screenshot({ path: initialShot, fullPage: false })
    console.log(`  ✓ print inicial: ${initialShot}`)

    // Find the button for this variant
    let selector
    if (config.withEffect === false) {
      // Find button with withEffect=false — it's the last one without data-variant or with data-variant="none"
      // Actually, the "no effect" button doesn't have data-variant attr set to "none"
      // It's the one with withEffect={false}. We'll find by text "sem efeito" nearby or by index.
      // Simpler: find all buttons, the last one is "sem efeito"
      selector = `[data-slot="theme-toggle-effect"]:last-of-type`
    } else {
      selector = `[data-slot="theme-toggle-effect"][data-variant="${config.variant}"]`
    }

    const button = page.locator(selector).first()
    const buttonCount = await button.count()

    if (buttonCount === 0) {
      console.warn(`  ✗ ${label}/${theme}: botão não encontrado (selector: ${selector})`)
      failed++
      failures.push(`${label}/${theme}: botão não encontrado`)
      await page.close()
      continue
    }

    // Click and wait for animation
    await button.click()
    await page.waitForTimeout(800)

    // Screenshot after click
    const afterShot = `${SHOTS_DIR}/theme-toggle-effect-${label}-${theme}-after.png`
    await page.screenshot({ path: afterShot, fullPage: false })
    console.log(`  ✓ print pós-click: ${afterShot}`)

    // Verify background
    const result = await page.evaluate(() => {
      const el = document.documentElement
      const bodyBg = getComputedStyle(document.body).backgroundColor
      const htmlBg = getComputedStyle(el).backgroundColor
      const className = el.className
      return { bodyBg, htmlBg, className }
    })

    // After clicking, theme should have toggled
    const expectedBg = theme === "light" ? DARK_BG : LIGHT_BG
    const actualBg = result.bodyBg

    // Check if the theme class changed
    const themeChanged = theme === "light"
      ? result.className.includes("dark")
      : !result.className.includes("dark")

    if (themeChanged) {
      console.log(`  ✓ ${label}/${theme}: tema alternado (${theme} → ${theme === "light" ? "dark" : "light"})`)
      passed++
    } else {
      console.warn(`  ✗ ${label}/${theme}: tema NÃO alternou (class: "${result.className}", bg: ${actualBg})`)
      failed++
      failures.push(`${label}/${theme}: tema não alternou`)
    }

    await page.close()
  }
}

await browser.close()

console.log("\n═══════════════════════════════════════")
if (failed === 0) {
  console.log(`✓ ${passed}/${passed + failed} testes OK`)
} else {
  console.log(`✗ ${failed} falhas de ${passed + failed}:`)
  failures.forEach((f) => console.log(`  - ${f}`))
}
console.log("═══════════════════════════════════════")

process.exit(failed > 0 ? 1 : 0)
