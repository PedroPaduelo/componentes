// Validador da composição ai-ide (IDE com IA estilo VS Code).
// Roda interações reais e mede bordas em light+dark. Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-ai-ide.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/ai-ide"
const report = { theme: {}, interactions: {}, borders: {}, responsive: {} }

function parseColorAlpha(c) {
  if (!c) return 0
  if (c === "transparent") return 0
  const rgba = c.match(/rgba?\(([^)]+)\)/)
  if (rgba) {
    const parts = rgba[1].split(",").map((s) => s.trim())
    return parts.length === 4 ? parseFloat(parts[3]) : 1
  }
  const oklch = c.match(/oklch\(([^)]+)\)/)
  if (oklch) {
    const slash = oklch[1].split("/")
    return slash.length === 2 ? parseFloat(slash[1]) : 1
  }
  const oklab = c.match(/oklab\(([^)]+)\)/)
  if (oklab) {
    const slash = oklab[1].split("/")
    return slash.length === 2 ? parseFloat(slash[1]) : 1
  }
  return 1
}

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

async function measureBorders(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-slot='ai-ide']")
    if (!root) return { found: false }
    const sels = ["[data-slot='ai-ide']", "aside", "header", "footer"]
    const out = []
    for (const sel of sels) {
      const el = root.matches?.(sel) ? root : root.querySelector(sel)
      if (!el) continue
      const cs = getComputedStyle(el)
      out.push({
        sel,
        borderWidth: cs.borderTopWidth || cs.borderLeftWidth || cs.borderBottomWidth,
        borderColor: cs.borderTopColor || cs.borderLeftColor || cs.borderBottomColor,
      })
    }
    return { found: true, els: out }
  })
}

async function run() {
  const browser = await chromium.launch()
  try {
    for (const theme of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const page = await ctx.newPage()
      const errors = []
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()) })
      await setTheme(page, theme)
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
      await page.waitForSelector("[data-slot='ai-ide']", { timeout: 15000 })
      await page.waitForTimeout(800)

      // overflow horizontal
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientW = await page.evaluate(() => document.documentElement.clientWidth)
      report.theme[theme] = { overflowX: scrollW > clientW + 2, scrollW, clientW, consoleErrors: errors.length }

      // bordas (medir card interno real: asides/header/footer)
      const borders = await measureBorders(page)
      const visible = (borders.els ?? []).map((e) => ({
        ...e,
        visible: parseFloat(e.borderWidth) > 0 && parseColorAlpha(e.borderColor) > 0.02,
      }))
      report.borders[theme] = visible

      await shot(page, `ai-ide-${theme}`, { sub: "ai-ide" })

      if (theme === "light") {
        // ── ACTIVITY BAR: clica em Source Control e confere troca de painel
        const beforeExplorer = await page.locator("text=Explorer").count()
        await page.locator("nav[aria-label='Barra de atividades'] button[aria-current]").first().waitFor()
        await page.locator("nav[aria-label='Barra de atividades'] button").nth(2).click() // scm
        await page.waitForTimeout(300)
        const scmVisible = await page.locator("text=Controle de origem").count()
        report.interactions.activityBar = { beforeExplorer, scmVisible }

        // volta pro explorer
        await page.locator("nav[aria-label='Barra de atividades'] button").first().click()
        await page.waitForTimeout(300)

        // ── FILE TREE: abre api.ts e confere que vira tab + breadcrumb muda
        await page.locator("button:has-text('api.ts')").first().click()
        await page.waitForTimeout(300)
        const breadcrumbApi = await page.locator("text=api.ts").count()
        report.interactions.fileTree = { breadcrumbApi }

        // ── IA: envia prompt e espera thinking + resposta com código
        const textarea = page.locator("textarea[aria-label='Message']").first()
        await textarea.fill("Refatore o App.tsx")
        await textarea.press("Enter")
        await page.waitForTimeout(400)
        const thinkingVisible = await page.locator("text=Raciocinando").count()
        await page.waitForTimeout(1600)
        const applyBtn = page.locator("button:has-text('Aplicar')").first()
        const applyCount = await applyBtn.count()
        report.interactions.ai = { thinkingVisible, applyCount }

        // ── APLICAR: clica e confere que App.tsx fica modificado (status bar)
        if (applyCount > 0) {
          await applyBtn.click()
          await page.waitForTimeout(400)
          const modifiedStatus = await page.locator("footer >> text=modificado").count()
          const scmCount = await page.locator("nav[aria-label='Barra de atividades'] button").nth(2).locator("span").count()
          report.interactions.apply = { modifiedStatus, scmCount }
        }

        // ── TERMINAL: digita comando e confere saída
        const termInput = page.locator("input[aria-label='Comando do terminal']").first()
        await termInput.fill("npm run dev")
        await termInput.press("Enter")
        await page.waitForTimeout(300)
        const viteOut = await page.locator("text=VITE").count()
        report.interactions.terminal = { viteOut }

        // ── ⌘K: abre palette
        await page.keyboard.press("Meta+k")
        await page.waitForTimeout(400)
        let paletteVisible = await page.locator("input[placeholder*='Buscar arquivos']").count()
        if (paletteVisible === 0) {
          await page.keyboard.press("Control+k")
          await page.waitForTimeout(400)
          paletteVisible = await page.locator("input[placeholder*='Buscar arquivos']").count()
        }
        report.interactions.palette = { paletteVisible }
        await page.keyboard.press("Escape")
      }

      await ctx.close()
    }

    // ── RESPONSIVO 390px
    const ctxM = await browser.newContext({ viewport: { width: 390, height: 800 } })
    const pageM = await ctxM.newPage()
    await setTheme(pageM, "light")
    await pageM.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
    await pageM.waitForSelector("[data-slot='ai-ide']", { timeout: 15000 })
    await pageM.waitForTimeout(600)
    const scrollW = await pageM.evaluate(() => document.documentElement.scrollWidth)
    const clientW = await pageM.evaluate(() => document.documentElement.clientWidth)
    // painel IA desktop deve estar oculto; botão Ask AI visível
    const askAiBtn = await pageM.locator("button:has-text('Ask AI')").count()
    await pageM.locator("button:has-text('Ask AI')").first().click()
    await pageM.waitForTimeout(500)
    const sheetComposer = await pageM.locator("textarea[aria-label='Message']").count()
    report.responsive = { overflowX: scrollW > clientW + 2, scrollW, clientW, askAiBtn, sheetComposer }
    await shot(pageM, "ai-ide-mobile", { sub: "ai-ide" })
    await ctxM.close()

    saveJSON("ai-ide/report", report)
    console.log("\n=== REPORT ===")
    console.log(JSON.stringify(report, null, 2))
  } finally {
    await browser.close()
  }
}

run()
