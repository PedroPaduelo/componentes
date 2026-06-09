// Validador da composição ai-ide (IDE com IA estilo VS Code).
// Roda interações reais e mede bordas em light+dark. Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-ai-ide.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/ai-ide"
const report = { theme: {}, interactions: {}, borders: {}, responsive: {}, width: {} }

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
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } })
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

      if (theme === "dark") {
        // ── F1 DIFF em DARK: dispara prompt → Revisar → mede realces do diff
        const ta = page.locator("textarea[aria-label='Message']").first()
        await ta.fill("Refatore o App.tsx")
        await ta.press("Enter")
        await page.waitForTimeout(5200)
        const rev = page.locator("button:has-text('Revisar mudança')").first()
        if ((await rev.count()) > 0) {
          await rev.click()
          await page.waitForTimeout(400)
          const diffDark = await page.locator("[data-diff]").count()
          const hunkDark = await page.locator("[data-hunk]").count()
          // mede o background de uma linha adicionada (deve ter alpha visível)
          const addBg = await page.evaluate(() => {
            const diff = document.querySelector("[data-diff]")
            if (!diff) return null
            const hunk = diff.querySelector("[data-hunk]")
            if (!hunk) return null
            const rows = hunk.querySelectorAll("div")
            for (const r of rows) {
              const bg = getComputedStyle(r).backgroundColor
              if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg
            }
            return null
          })
          report.interactions.diffDark = {
            diffDark, hunkDark, addBg,
            addBgVisible: addBg !== null && parseColorAlpha(addBg) > 0.02,
          }
          await shot(page, "ai-ide-diff-dark", { sub: "ai-ide" })
        }
      }

      if (theme === "light") {
        // ── LARGURA: container da IDE acompanha o layout wide (> teto antigo 1152)
        const ideWidth = await page.evaluate(() => {
          const el = document.querySelector("[data-slot='ai-ide']")
          return el ? Math.round(el.getBoundingClientRect().width) : 0
        })
        report.width = { ideWidth, widerThanOld: ideWidth > 1152 }

        // ── EXPLORER PASTA: abre/fecha a pasta "lib" e confere variação de itens
        const treeFileCount = () => page.locator("[data-slot='ai-ide'] aside button[aria-current], [data-slot='ai-ide'] aside .group").count()
        const libToggle = page.locator("button[aria-label*='pasta lib']").first()
        const apiBeforeCollapse = await page.locator("button:has-text('api.ts')").count()
        await libToggle.click() // recolhe (estava aberta)
        await page.waitForTimeout(300)
        const apiAfterCollapse = await page.locator("button:has-text('api.ts')").count()
        await libToggle.click() // expande de novo
        await page.waitForTimeout(300)
        const apiAfterExpand = await page.locator("button:has-text('api.ts')").count()
        report.interactions.folder = { apiBeforeCollapse, apiAfterCollapse, apiAfterExpand }

        // ── EXPLORER NOVO ARQUIVO: cria um arquivo e confere que vira tab
        const tabsBefore = await page.locator("[data-slot='ai-ide'] .group:has(button[aria-label^='Fechar'])").count()
        await page.locator("button[aria-label='Novo arquivo']").first().click()
        await page.waitForTimeout(200)
        const createInput = page.locator("input[aria-label='Nome do novo arquivo']").first()
        await createInput.fill("hello.tsx")
        await createInput.press("Enter")
        await page.waitForTimeout(300)
        const tabsAfter = await page.locator("[data-slot='ai-ide'] .group:has(button[aria-label^='Fechar'])").count()
        const helloTab = await page.locator("button[aria-label='Fechar hello.tsx']").count()
        report.interactions.newFile = { tabsBefore, tabsAfter, helloTab }

        // ── TITLE BAR: abre menu Ver e alterna painel inferior
        await page.locator("button[data-menu='view']").first().click()
        await page.waitForTimeout(300)
        const viewMenuOpen = await page.locator("[aria-label='Alternar painel inferior']").count()
        await page.locator("[aria-label='Alternar painel inferior']").first().click()
        await page.waitForTimeout(300)
        // depois de alternar, o terminal input some (painel recolhido)
        const termAfterToggle = await page.locator("input[aria-label='Comando do terminal']").count()
        report.interactions.titleBar = { viewMenuOpen, termAfterToggle }
        // reabre o painel
        await page.locator("button[aria-label='Expandir painel']").first().click().catch(() => {})
        await page.waitForTimeout(200)

        // ── ACTIVITY BAR: Settings abre Preferências com SwitchFluid
        await page.locator("button[aria-label='Configurações']").first().click()
        await page.waitForTimeout(300)
        const prefsVisible = await page.locator("text=Preferências").count()
        const switchCount = await page.locator("[data-slot='ai-ide'] aside [role='switch']").count()
        report.interactions.settings = { prefsVisible, switchCount }
        await page.locator("nav[aria-label='Barra de atividades'] button").first().click() // volta explorer
        await page.waitForTimeout(200)

        // ── IA: envia prompt → raciocínio EXPANDIDO durante o thinking
        await page.locator("button:has-text('api.ts')").first().click().catch(() => {})
        const textarea = page.locator("textarea[aria-label='Message']").first()
        await textarea.fill("Refatore o App.tsx")
        await textarea.press("Enter")
        await page.waitForTimeout(700)
        const reasoning = page.locator("[data-reasoning]").last()
        const expandedDuring = await reasoning.getAttribute("data-expanded")
        const activeDuring = await reasoning.getAttribute("data-active")

        // ── ESTABILIDADE DO SCROLL: amostra scrollTop do container do chat ao longo
        // de todo o ciclo (thinking → auto-contrair → streaming). Sem reversão brusca.
        const samples = []
        for (let i = 0; i < 45; i += 1) {
          const top = await page.evaluate(() => {
            const r = document.querySelector("[data-reasoning]")
            let el = r ? r.parentElement : null
            while (el) {
              const oy = getComputedStyle(el).overflowY
              if (oy === "auto" || oy === "scroll") return Math.round(el.scrollTop)
              el = el.parentElement
            }
            return null
          })
          if (top !== null) samples.push(top)
          await page.waitForTimeout(200)
        }
        // métricas: maior reversão pra cima (subir-descer-subir) e nº de reversões > tolerância
        const REVERSAL_TOLERANCE = 24 // px — suavização/sub-pixel é aceitável
        let maxUpwardReversal = 0
        let bigReversals = 0
        for (let i = 1; i < samples.length; i += 1) {
          const delta = samples[i] - samples[i - 1]
          if (delta < 0) {
            const up = -delta
            if (up > maxUpwardReversal) maxUpwardReversal = up
            if (up > REVERSAL_TOLERANCE) bigReversals += 1
          }
        }
        report.interactions.scrollStability = {
          sampleCount: samples.length,
          first: samples[0],
          last: samples[samples.length - 1],
          maxUpwardReversal,
          bigReversals,
          stable: bigReversals === 0,
          samples,
        }

        const expandedAfter = await reasoning.getAttribute("data-expanded")
        const activeAfter = await reasoning.getAttribute("data-active")
        // clica no cabeçalho para re-expandir
        await reasoning.locator("button[aria-expanded]").first().click()
        await page.waitForTimeout(400)
        const expandedReopen = await reasoning.getAttribute("data-expanded")
        report.interactions.reasoning = {
          expandedDuring, activeDuring, expandedAfter, activeAfter, expandedReopen,
        }

        // garante o streaming concluído e o botão Revisar mudança surgido
        await page.waitForTimeout(1500)
        const reviewBtn = page.locator("button:has-text('Revisar mudança')").first()
        const reviewCount = await reviewBtn.count()
        report.interactions.ai = { reviewCount }

        // ── F1 DIFF INLINE: cenário 1 — Rejeitar tudo NÃO altera (volta ao original)
        const modifiedBeforeAll = await page.locator("footer >> text=modificado").count()
        if (reviewCount > 0) {
          await reviewBtn.click()
          await page.waitForTimeout(400)
          const diffShown = await page.locator("[data-diff]").count()
          const hunkCount = await page.locator("[data-hunk]").count()
          const acceptHunkBtns = await page.locator("[data-diff-action='accept-hunk']").count()
          const rejectHunkBtns = await page.locator("[data-diff-action='reject-hunk']").count()
          const plusMinus = await page.locator("[data-diff] >> text=/\\+\\d+/").count()
          report.interactions.diffEnter = {
            diffShown, hunkCount, acceptHunkBtns, rejectHunkBtns, plusMinus,
          }
          await shot(page, "ai-ide-diff-light", { sub: "ai-ide" })

          // Rejeitar tudo → sai do diff, NÃO marca modificado
          await page.locator("[data-diff-action='reject-all']").first().click()
          await page.waitForTimeout(400)
          const diffAfterReject = await page.locator("[data-diff]").count()
          const modifiedAfterReject = await page.locator("footer >> text=modificado").count()
          report.interactions.diffRejectAll = {
            diffAfterReject,
            modifiedBeforeAll,
            modifiedAfterReject,
            noChange: diffAfterReject === 0 && modifiedAfterReject === modifiedBeforeAll,
          }
        }

        // ── F1 DIFF INLINE: cenário 2 — decisão por hunk + Aceitar tudo aplica
        const reviewBtn2 = page.locator("button:has-text('Revisar mudança')").first()
        if ((await reviewBtn2.count()) > 0) {
          await reviewBtn2.click()
          await page.waitForTimeout(400)
          const hunksInitial = await page.locator("[data-hunk][data-hunk-status='pending']").count()
          // aceita o primeiro hunk individual
          await page.locator("[data-diff-action='accept-hunk']").first().click()
          await page.waitForTimeout(300)
          const pendingAfterOne = await page.locator("[data-hunk][data-hunk-status='pending']").count()
          const acceptedOne = await page.locator("[data-hunk][data-hunk-status='accepted']").count()
          // rejeita o próximo hunk individual
          await page.locator("[data-diff-action='reject-hunk']").first().click()
          await page.waitForTimeout(300)
          const rejectedOne = await page.locator("[data-hunk][data-hunk-status='rejected']").count()
          // aceita tudo (decide os restantes + aplica)
          const stillInDiff = await page.locator("[data-diff]").count()
          if (stillInDiff > 0) {
            await page.locator("[data-diff-action='accept-all']").first().click()
            await page.waitForTimeout(400)
          }
          const diffAfterAccept = await page.locator("[data-diff]").count()
          const modifiedAfterAccept = await page.locator("footer >> text=modificado").count()
          const scmEntry = await page.locator("[data-slot='ai-ide'] aside button:has-text('App.tsx')").count()
          report.interactions.diffHunks = {
            hunksInitial, pendingAfterOne, acceptedOne, rejectedOne,
            diffAfterAccept, modifiedAfterAccept, scmEntry,
            appliedAndModified: diffAfterAccept === 0 && modifiedAfterAccept > 0,
          }
        }

        await shot(page, "ai-ide-after-flow", { sub: "ai-ide" })

        // ── TERMINAL: garante o painel aberto na aba Terminal, digita comando
        if ((await page.locator("input[aria-label='Comando do terminal']").count()) === 0) {
          await page.locator("button:has-text('Terminal')").first().click().catch(() => {})
          await page.waitForTimeout(300)
        }
        const termInput = page.locator("input[aria-label='Comando do terminal']").first()
        await termInput.fill("npm run dev")
        await termInput.press("Enter")
        await page.waitForTimeout(300)
        const viteOut = await page.locator("text=VITE").count()
        await termInput.fill("clear")
        await termInput.press("Enter")
        await page.waitForTimeout(200)
        const afterClear = await page.locator("text=VITE").count()
        report.interactions.terminal = { viteOut, afterClear }

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
