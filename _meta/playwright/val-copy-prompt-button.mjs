// Validador Playwright: botão "Copiar prompt" no topo de cada página de componente.
//
// Cobertura: 3 slugs × 2 temas (light+dark) = 6 page loads.
//
// Critérios por page load:
//  1. Botão [data-slot="copy-prompt-button"] EXISTE no header da família.
//  2. Texto inicial = "Copiar prompt".
//  3. Click → texto vira "Copiado!".
//  4. navigator.clipboard.readText() retorna markdown válido:
//     - começa com "# Componente:"
//     - contém "## Como instalar"
//     - contém "npx shadcn@latest add"
//  5. Screenshot full-page em _meta/scratch/shots/copy-prompt-<slug>-<theme>.png
//
// Exit code 0 = PASS em todos. Falha em QUALQUER critério = exit 1 com motivo.

import { chromium } from "playwright"
import { shot, outPath } from "./_shots.mjs"

const BASE = "http://localhost:5173"
const SLUGS = ["button", "dropdown", "button-fluid"]
const THEMES = ["light", "dark"]

const browser = await chromium.launch()
let pass = 0
let fail = 0
const failures = []

for (const slug of SLUGS) {
  for (const theme of THEMES) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    await ctx.grantPermissions(["clipboard-read", "clipboard-write"])
    const page = await ctx.newPage()

    if (theme === "dark") {
      await page.addInitScript(() => {
        try {
          localStorage.setItem("vitrine-theme", "dark")
        } catch {
          // ignore
        }
      })
    }

    const url = `${BASE}/components/${slug}`
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
    } catch (e) {
      fail++
      failures.push(`${slug} ${theme}: goto falhou — ${e.message}`)
      await ctx.close()
      continue
    }

    try {
      // Critério 1: botão existe
      const btn = page.locator('[data-slot="copy-prompt-button"]').first()
      await btn.waitFor({ state: "visible", timeout: 10000 })

      // Critério 2: texto inicial
      const initialText = (await btn.textContent()) ?? ""
      if (!initialText.includes("Copiar prompt")) {
        throw new Error(
          `texto inicial esperado "Copiar prompt", achei "${initialText.trim()}"`,
        )
      }

      // Critério 3: click → "Copiado!"
      await btn.click()
      // Espera o React re-renderizar com o label novo (timeout maior que o feedbackMs default)
      await page.waitForFunction(
        () => {
          const el = document.querySelector('[data-slot="copy-prompt-button"]')
          return el !== null && (el.textContent ?? "").includes("Copiado!")
        },
        { timeout: 5000 },
      )
      const afterText = (await btn.textContent()) ?? ""
      if (!afterText.includes("Copiado!")) {
        throw new Error(
          `texto pós-click esperado "Copiado!", achei "${afterText.trim()}"`,
        )
      }

      // Critério 4: conteúdo do clipboard
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText(),
      )
      if (!clipboardText.startsWith("# Componente:")) {
        throw new Error(
          `clipboard não começa com "# Componente:" (início: "${clipboardText.slice(0, 60).replace(/\n/g, "\\n")}")`,
        )
      }
      if (!clipboardText.includes("## Como instalar")) {
        throw new Error('clipboard não contém "## Como instalar"')
      }
      if (!clipboardText.includes("npx shadcn@latest add")) {
        throw new Error('clipboard não contém "npx shadcn@latest add"')
      }

      // Critério 5: screenshot
      await shot(page, `copy-prompt-${slug}-${theme}`, { fullPage: true })

      pass++
      console.log(`✓ ${slug} ${theme} (${clipboardText.length} chars no clipboard)`)
    } catch (e) {
      fail++
      const msg = `${slug} ${theme}: ${e.message}`
      failures.push(msg)
      console.log(`✗ ${msg}`)
      // Screenshot de erro pra ajudar debug
      try {
        await page.screenshot({
          path: outPath(`copy-prompt-ERROR-${slug}-${theme}.png`),
          fullPage: true,
        })
      } catch {
        // ignore
      }
    } finally {
      await ctx.close()
    }
  }
}

await browser.close()

console.log("")
console.log(`Resultado: ${pass} pass / ${fail} fail de ${SLUGS.length * THEMES.length} page loads`)
if (failures.length > 0) {
  console.log("Falhas:")
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
process.exit(0)
