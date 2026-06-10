// Validador da composição ai-ide (IDE com IA estilo VS Code).
// Roda interações reais e mede bordas em light+dark. Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-ai-ide.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/ai-ide"
const report = { theme: {}, interactions: {}, borders: {}, responsive: {}, width: {} }

// Coletor focado no bug do SVG path "d=undefined" durante a animação da IA.
const pathErrors = []
function isPathError(text) {
  return /Expected moveto path command|attribute d:.*undefined/i.test(text || "")
}
function watchPathErrors(page) {
  page.on("console", (m) => {
    if (m.type() === "error" && isPathError(m.text())) pathErrors.push(m.text())
  })
  page.on("pageerror", (e) => {
    if (isPathError(e.message)) pathErrors.push(e.message)
  })
}

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
      watchPathErrors(page)
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
        // F3 em DARK: durante o thinking, mede a borda de um card de tool call
        await page.waitForTimeout(1600)
        const toolBorderDark = await page.evaluate(() => {
          const r = document.querySelector("[data-reasoning]")
          const card = r?.querySelector("[data-tool-call]")
          if (!card) return null
          const cs = getComputedStyle(card)
          return { borderWidth: cs.borderTopWidth, borderColor: cs.borderTopColor }
        })
        report.interactions.toolCallsDark = {
          toolBorderDark,
          toolBorderDarkVisible:
            toolBorderDark !== null &&
            parseFloat(toolBorderDark.borderWidth) > 0 &&
            parseColorAlpha(toolBorderDark.borderColor) > 0.02,
        }
        await page.waitForTimeout(3600)
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

        // ── F4 ⌘K INLINE em DARK: garante que abre com editor focado e que
        // a borda do popover é visível no tema escuro (mesmo tratamento
        // oklch/oklab do resto do validador).
        const rejectAllDark = page.locator("[data-diff-action='reject-all']")
        if ((await rejectAllDark.count()) > 0) {
          await rejectAllDark.first().click()
          await page.waitForTimeout(300)
        }
        const editorSurfaceDk = page
          .locator("[data-slot='ai-ide'] .relative.min-h-0.flex-1.overflow-auto")
          .first()
        const boxDk = await editorSurfaceDk.boundingBox()
        if (boxDk) {
          await page.mouse.click(
            boxDk.x + boxDk.width / 2,
            boxDk.y + Math.min(40, boxDk.height / 3),
          )
          await page.waitForTimeout(120)
        }
        const firstLineDk = editorSurfaceDk.locator("button").first()
        if ((await firstLineDk.count()) > 0) {
          await firstLineDk.click()
          await page.waitForTimeout(120)
        }
        await page.keyboard.press("Meta+k")
        let inlineOpenedDk = await page.locator("[data-inline-edit]").count()
        if (inlineOpenedDk === 0) {
          await page.keyboard.press("Control+k")
          await page.waitForTimeout(200)
          inlineOpenedDk = await page.locator("[data-inline-edit]").count()
        }
        const inlineBorderDk = await page.evaluate(() => {
          const pe = document.querySelector("[data-inline-edit]")
          if (!pe) return null
          const cs = getComputedStyle(pe)
          return { borderWidth: cs.borderTopWidth, borderColor: cs.borderTopColor }
        })
        await shot(page, "ai-ide-inline-open-dark", { sub: "ai-ide" })
        await page.keyboard.press("Escape")
        await page.waitForTimeout(200)
        report.interactions.inlineDark = {
          inlineOpenedDk,
          inlineBorderDk,
          inlineBorderDarkVisible:
            inlineBorderDk !== null &&
            parseFloat(inlineBorderDk.borderWidth) > 0 &&
            parseColorAlpha(inlineBorderDk.borderColor) > 0.02,
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

        // ── F3 TOOL CALLS: amostra os cartões de uso de ferramenta enquanto pensa.
        // Os itens surgem em sequência; coletamos por ~2.4s e ficamos com o pico.
        // Mede também o scrollTop a cada passo: surgimento de card NÃO pode causar
        // reversão (jitter) — stick-to-bottom deve crescer monotonicamente.
        let toolPeak = 0
        const toolSamples = []
        const toolScroll = []
        for (let i = 0; i < 12; i += 1) {
          const snap = await page.evaluate(() => {
            const r = document.querySelector("[data-reasoning]")
            if (!r) return { cards: [], top: null }
            let el = r.parentElement
            let top = null
            while (el) {
              const oy = getComputedStyle(el).overflowY
              if (oy === "auto" || oy === "scroll") {
                top = Math.round(el.scrollTop)
                break
              }
              el = el.parentElement
            }
            const cards = Array.from(r.querySelectorAll("[data-tool-call]")).map(
              (c) => ({
                name: c.getAttribute("data-tool-name"),
                status: c.getAttribute("data-tool-status"),
                text: (c.textContent || "").replace(/\s+/g, " ").trim(),
                hasResult: !!c.querySelector("[data-tool-result]"),
              }),
            )
            return { cards, top }
          })
          if (snap.cards.length > toolPeak) toolPeak = snap.cards.length
          toolSamples.push(snap.cards)
          if (snap.top !== null) toolScroll.push(snap.top)
          await page.waitForTimeout(200)
        }
        let toolPhaseReversal = 0
        for (let i = 1; i < toolScroll.length; i += 1) {
          const up = toolScroll[i - 1] - toolScroll[i]
          if (up > toolPhaseReversal) toolPhaseReversal = up
        }
        const peakSnapshot =
          toolSamples.find((s) => s.length === toolPeak) ?? []
        // cada card tem nome (mono), argumento entre parênteses e um resultado
        const wellFormed = peakSnapshot.filter(
          (c) =>
            c.name &&
            c.hasResult &&
            /\(.+\)/.test(c.text) &&
            c.text.length > (c.name?.length ?? 0),
        ).length
        // mede a borda de um card real em light (precisa ser visível)
        const toolBorder = await page.evaluate(() => {
          const r = document.querySelector("[data-reasoning]")
          const card = r?.querySelector("[data-tool-call]")
          if (!card) return null
          const cs = getComputedStyle(card)
          return {
            borderWidth: cs.borderTopWidth,
            borderColor: cs.borderTopColor,
          }
        })
        report.interactions.toolCalls = {
          toolPeak,
          wellFormed,
          enough: toolPeak >= 4 && wellFormed >= 4,
          names: peakSnapshot.map((c) => c.name),
          sample: peakSnapshot.slice(0, 6),
          toolBorder,
          toolBorderVisible:
            toolBorder !== null &&
            parseFloat(toolBorder.borderWidth) > 0 &&
            parseColorAlpha(toolBorder.borderColor) > 0.02,
          toolScroll,
          toolPhaseReversal,
          toolPhaseStable: toolPhaseReversal <= 24,
        }
        await shot(page, "ai-ide-toolcalls-light", { sub: "ai-ide" })

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

        // ── MODO AGENT (F2): troca pra aba Agent, envia prompt, acompanha plano ──
        // Conta quantos arquivos existem no explorer ANTES do plano.
        const fileNamesBefore = await page
          .locator("[data-slot='ai-ide'] aside button[aria-current], [data-slot='ai-ide'] aside [aria-current='true']")
          .count()
        const typesBefore = await page
          .locator("[data-slot='ai-ide'] aside button:has-text('types.ts')")
          .count()
        const formatBefore = await page
          .locator("[data-slot='ai-ide'] aside button:has-text('format.ts')")
          .count()
        const termLinesBefore = await page.evaluate(() => {
          let el = document.querySelector("[data-slot='ai-ide']")
          while (el) {
            const oy = getComputedStyle(el).overflowY
            if (oy === "auto" || oy === "scroll") return el.scrollHeight
            el = el.parentElement
          }
          return 0
        })
        // Clica na aba "Agent" (TabsSubtleFluidItem com label "Agent")
        const agentTab = page.locator("[role='tablist'] button:has-text('Agent')").first()
        await agentTab.click()
        await page.waitForTimeout(200)
        const agentTabActive = await page.locator("[role='tab'][aria-selected='true']:has-text('Agent')").count()
        // Envia prompt
        const taAgent = page.locator("textarea[aria-label='Message']").first()
        await taAgent.fill("Implemente a feature")
        await taAgent.press("Enter")
        // Espera o plano aparecer
        await page.waitForSelector("[data-agent-plan]", { timeout: 8000 })
        const agentPlanCount = await page.locator("[data-agent-plan]").count()
        const agentSteps = await page.locator("[data-agent-step]").count()
        // Lê o tipo de cada passo pelo atributo data-step-status (amostra em t1, t2, t3)
        const stepSamples = []
        // primeiro passo: deve estar pending ou running
        const step0Status = await page.locator("[data-agent-step]").nth(0).getAttribute("data-step-status")
        stepSamples.push({ index: 0, status: step0Status })
        // Espera algum passo virar done
        await page.waitForFunction(
          () => {
            const steps = document.querySelectorAll("[data-agent-step][data-step-status='done']")
            return steps.length >= 1
          },
          { timeout: 15000 },
        )
        const step1Status = await page.locator("[data-agent-step]").nth(0).getAttribute("data-step-status")
        stepSamples.push({ index: 0, status: step1Status, after: "wait-done" })
        // Espera todos os 5 passos concluírem
        await page.waitForFunction(
          () => {
            const steps = document.querySelectorAll("[data-agent-step][data-step-status='done']")
            return steps.length >= 5
          },
          { timeout: 30000 },
        )
        const stepFinalDone = await page.locator("[data-agent-step][data-step-status='done']").count()
        // Efeitos reais: criar adicionou types.ts e format.ts no explorer; editar abriu App.tsx e modificou.
        const typesAfter = await page
          .locator("[data-slot='ai-ide'] aside button:has-text('types.ts')")
          .count()
        const formatAfter = await page
          .locator("[data-slot='ai-ide'] aside button:has-text('format.ts')")
          .count()
        const typesTab = await page
          .locator("[data-slot='ai-ide'] [aria-label='Fechar types.ts']")
          .count()
        const modifiedCount = await page.locator("footer >> text=modificado").count()
        // Terminal deve ter ganhado as linhas de npm test e npm run build
        const termText = await page.locator("[aria-label='Comando do terminal']").first().evaluate(
          (input) => {
            // pega o terminal: irmão do input, ou container anterior
            const root = input.closest("[data-slot='ai-ide']")
            return root ? root.textContent || "" : ""
          },
        )
        const hasNpmTest = termText.includes("npm test") || termText.includes("vitest")
        const hasNpmBuild = termText.includes("npm run build") || termText.includes("vite build")
        // Resumo final (o status geral vira "done" um gap após o último passo)
        await page.waitForSelector("[data-agent-summary]", { timeout: 5000 })
        const summaryShown = await page.locator("[data-agent-summary]").count()
        const summaryText = await page
          .locator("[data-agent-summary]")
          .first()
          .textContent()
          .catch(() => "")
        // Progresso: contagem de passos concluídos chegou a 5?
        const progressText = await page
          .locator("[data-agent-progress]")
          .first()
          .textContent()
          .catch(() => "")
        const stepKinds = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("[data-agent-step]")).map((s) => {
            const txt = (s.textContent || "").toLowerCase()
            if (txt.includes("criar")) return "create"
            if (txt.includes("editar")) return "edit"
            if (txt.includes("rodar")) return "run"
            return "other"
          })
        })
        report.interactions.agent = {
          agentTabActive,
          agentPlanCount,
          agentSteps,
          stepFinalDone,
          stepKinds,
          hasCreate: stepKinds.includes("create"),
          hasEdit: stepKinds.includes("edit"),
          hasRun: stepKinds.includes("run"),
          typesBefore,
          formatBefore,
          typesAfter,
          formatAfter,
          treeAddedTypes: typesAfter > typesBefore,
          treeAddedFormat: formatAfter > formatBefore,
          typesTab,
          modifiedCount,
          terminalAppended: hasNpmTest && hasNpmBuild,
          hasNpmTest,
          hasNpmBuild,
          summaryShown,
          summaryText: (summaryText || "").replace(/\s+/g, " ").trim(),
          progressText: (progressText || "").replace(/\s+/g, " ").trim(),
          stepSamples,
          fileNamesBefore,
          termLinesBefore,
        }
        await shot(page, "ai-ide-agent-light", { sub: "ai-ide" })

        // ── AGENT: controles Pausar/Continuar/Parar (segundo ciclo) ──────
        const agentTab2 = page.locator("[role='tablist'] button:has-text('Agent')").first()
        await agentTab2.click()
        await page.waitForTimeout(200)
        const taAgent2 = page.locator("textarea[aria-label='Message']").first()
        await taAgent2.fill("Outro plano de teste")
        await taAgent2.press("Enter")
        await page.waitForSelector("[data-agent-plan]", { timeout: 8000 })
        // espera algum passo ficar running
        await page.waitForFunction(
          () => {
            const steps = document.querySelectorAll("[data-agent-step][data-step-status='running']")
            return steps.length >= 1
          },
          { timeout: 10000 },
        )
        // Pausar
        const pauseBtn = page.locator("[data-agent-action='pause']").first()
        const pauseVisible = await pauseBtn.count()
        await pauseBtn.click()
        await page.waitForTimeout(200)
        const statusAfterPause = await page
          .locator("[data-agent-plan]")
          .first()
          .getAttribute("data-agent-status")
        const resumeBtn = page.locator("[data-agent-action='resume']").first()
        const resumeVisible = await resumeBtn.count()
        // Continuar
        await resumeBtn.click()
        await page.waitForTimeout(300)
        const runningAfterResume = await page
          .locator("[data-agent-step][data-step-status='running']")
          .count()
        // Parar
        const stopBtn = page.locator("[data-agent-action='stop']").first()
        await stopBtn.click()
        await page.waitForTimeout(300)
        const statusAfterStop = await page
          .locator("[data-agent-plan]")
          .first()
          .getAttribute("data-agent-status")
        const stuckRunning = await page
          .locator("[data-agent-step][data-step-status='running']")
          .count()
        report.interactions.agentControls = {
          pauseVisible,
          statusAfterPause,
          resumeVisible,
          runningAfterResume,
          statusAfterStop,
          stuckRunning,
          noStuck: stuckRunning === 0,
        }
        await shot(page, "ai-ide-agent-controls", { sub: "ai-ide" })

        // ── F4 ⌘K INLINE: popover ancorado à linha, reusa diff da F1 ─────
        // Garante que estamos de volta em alguma aba Chat/Edit (não Agent) e
        // que o popover/palette anteriores foram fechados.
        const editorSurface = page
          .locator("[data-slot='ai-ide'] .relative.min-h-0.flex-1.overflow-auto")
          .first()
        // foca a superfície do editor (click no meio da área de código)
        const editorBox = await editorSurface.boundingBox()
        if (editorBox) {
          await page.mouse.click(
            editorBox.x + editorBox.width / 2,
            editorBox.y + Math.min(40, editorBox.height / 3),
          )
          await page.waitForTimeout(120)
        }
        // fecha qualquer palette/inline aberto antes
        await page.keyboard.press("Escape")
        await page.waitForTimeout(120)
        await page.keyboard.press("Escape")
        await page.waitForTimeout(120)
        // garante caret em uma linha (click num botão de linha do editor)
        const firstLineBtn = editorSurface.locator("button").first()
        const firstLineCount = await firstLineBtn.count()
        if (firstLineCount > 0) {
          await firstLineBtn.click()
          await page.waitForTimeout(120)
        }
        // mede a borda do popover (precisa estar visível nos 2 temas)
        const inlineBorder = await page.evaluate(() => {
          const pe = document.querySelector("[data-inline-edit]")
          if (!pe) return null
          const cs = getComputedStyle(pe)
          return { borderWidth: cs.borderTopWidth, borderColor: cs.borderTopColor }
        })
        report.interactions = report.interactions || {}
        // ⌘K com editor focado → abre o INLINE
        await page.keyboard.press("Meta+k")
        let inlineOpened = await page.locator("[data-inline-edit]").count()
        if (inlineOpened === 0) {
          await page.keyboard.press("Control+k")
          await page.waitForTimeout(200)
          inlineOpened = await page.locator("[data-inline-edit]").count()
        }
        // mede a borda do popover AGORA que está aberto
        const inlineBorderOpen = await page.evaluate(() => {
          const pe = document.querySelector("[data-inline-edit]")
          if (!pe) return null
          const cs = getComputedStyle(pe)
          return { borderWidth: cs.borderTopWidth, borderColor: cs.borderTopColor }
        })
        await shot(page, "ai-ide-inline-open-light", { sub: "ai-ide" })
        // verifica os hooks de Playwright
        const inlineTrigger = await page.locator("[data-inline-edit-trigger]").count()
        const inlineInput = await page.locator("[data-inline-edit-input]").count()
        const inlineActions = await page.locator("[data-inline-edit-action]").count()
        const inlineAnchorText = await page
          .locator("[data-inline-edit-anchor]")
          .first()
          .textContent()
          .catch(() => "")
        // preenche o input + Enter → dispara loading → depois data-diff
        await page.locator("[data-inline-edit-input]").first().fill("Refatorar essa parte")
        await page.locator("[data-inline-edit-input]").first().press("Enter")
        // mini-loading deve aparecer
        await page.waitForSelector("[data-inline-edit-loading]", { timeout: 2000 })
        const loadingShown = await page.locator("[data-inline-edit-loading]").count()
        // espera o loading sumir (timer 820ms + folga) e o diff inline abrir
        await page.waitForTimeout(1100)
        const diffAfterInline = await page.locator("[data-diff]").count()
        const hunksAfterInline = await page.locator("[data-hunk]").count()
        // popover deve ter fechado (o /refatorar aciona o diff da F1)
        const popoverStillOpen = await page.locator("[data-inline-edit]").count()
        await shot(page, "ai-ide-inline-diff-light", { sub: "ai-ide" })
        // aceita todos os hunks → marca modificado e fecha diff
        let modifiedAfterInlineAccept = 0
        if (hunksAfterInline > 0) {
          await page.locator("[data-diff-action='accept-all']").first().click()
          await page.waitForTimeout(400)
          modifiedAfterInlineAccept = await page
            .locator("footer >> text=modificado")
            .count()
        }
        // Esc fecha: abre o inline, depois Esc
        await page.keyboard.press("Meta+k")
        if ((await page.locator("[data-inline-edit]").count()) === 0) {
          await page.keyboard.press("Control+k")
          await page.waitForTimeout(200)
        }
        const inlineOpenBeforeEsc = await page.locator("[data-inline-edit]").count()
        await page.keyboard.press("Escape")
        await page.waitForTimeout(300)
        const inlineOpenAfterEsc = await page.locator("[data-inline-edit]").count()
        // SEM foco no editor: ⌘K abre o command palette global (NÃO o inline)
        // clica no título do arquivo (fora do editor) para tirar o foco
        const headerArea = page
          .locator("[data-slot='ai-ide'] header")
          .first()
        const headerBox = await headerArea.boundingBox()
        if (headerBox) {
          await page.mouse.click(headerBox.x + 20, headerBox.y + headerBox.height / 2)
          await page.waitForTimeout(150)
        }
        // clica no Explorer para tirar o foco do editor definitivamente
        await page
          .locator("nav[aria-label='Barra de atividades'] button")
          .first()
          .click()
        await page.waitForTimeout(200)
        // também clica no body do aside do Explorer para garantir blur
        const aside = page.locator("[data-slot='ai-ide'] aside").first()
        const asideBox = await aside.boundingBox()
        if (asideBox) {
          await page.mouse.click(asideBox.x + 10, asideBox.y + 30)
          await page.waitForTimeout(150)
        }
        await page.keyboard.press("Escape")
        await page.waitForTimeout(150)
        await page.keyboard.press("Meta+k")
        let paletteOpenedGlobal = await page
          .locator("input[placeholder*='Buscar arquivos']")
          .count()
        if (paletteOpenedGlobal === 0) {
          await page.keyboard.press("Control+k")
          await page.waitForTimeout(200)
          paletteOpenedGlobal = await page
            .locator("input[placeholder*='Buscar arquivos']")
            .count()
        }
        // o inline NÃO pode estar aberto nesse momento
        const inlineOpenedWhenPaletteOpen = await page
          .locator("[data-inline-edit]")
          .count()
        await page.keyboard.press("Escape")
        await page.waitForTimeout(200)
        // /explicar (sem diff): abre o inline de novo, clica na ação
        await page.keyboard.press("Meta+k")
        if ((await page.locator("[data-inline-edit]").count()) === 0) {
          await page.keyboard.press("Control+k")
          await page.waitForTimeout(200)
        }
        // garante foco no editor
        if (firstLineCount > 0) {
          await firstLineBtn.click()
          await page.waitForTimeout(100)
          await page.keyboard.press("Meta+k")
          if ((await page.locator("[data-inline-edit]").count()) === 0) {
            await page.keyboard.press("Control+k")
            await page.waitForTimeout(200)
          }
        }
        await page.locator("[data-inline-edit-action='explain']").first().click()
        await page.waitForTimeout(1100)
        const explainShown = await page.locator("[data-inline-edit-explain]").count()
        // ao usar /explicar, o popover continua aberto com o modal leve
        const popoverAfterExplain = await page.locator("[data-inline-edit]").count()
        const explainText = await page
          .locator("[data-inline-edit-explain] p")
          .first()
          .textContent()
          .catch(() => "")
        await shot(page, "ai-ide-inline-explain-light", { sub: "ai-ide" })
        // fecha
        await page.keyboard.press("Escape")
        await page.waitForTimeout(200)

        report.interactions.inline = {
          theme,
          inlineBorder,
          inlineBorderOpen,
          inlineBorderVisible:
            inlineBorderOpen !== null &&
            parseFloat(inlineBorderOpen.borderWidth) > 0 &&
            parseColorAlpha(inlineBorderOpen.borderColor) > 0.02,
          inlineTrigger,
          inlineInput,
          inlineActions,
          inlineAnchorText: (inlineAnchorText || "").replace(/\s+/g, " ").trim(),
          inlineOpened,
          loadingShown,
          diffAfterInline,
          hunksAfterInline,
          popoverStillOpen,
          modifiedAfterInlineAccept,
          inlineOpenBeforeEsc,
          inlineOpenAfterEsc,
          escCloses: inlineOpenAfterEsc === 0,
          paletteOpenedGlobal,
          inlineOpenedWhenPaletteOpen,
          globalPrecedence: paletteOpenedGlobal > 0 && inlineOpenedWhenPaletteOpen === 0,
          explainShown,
          popoverAfterExplain,
          explainText: (explainText || "").replace(/\s+/g, " ").trim(),
        }
      }

      await ctx.close()
    }

    // ── RESPONSIVO 390px
    const ctxM = await browser.newContext({ viewport: { width: 390, height: 800 } })
    const pageM = await ctxM.newPage()
    watchPathErrors(pageM)
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

    report.svgPathBug = {
      pathErrorCount: pathErrors.length,
      pass: pathErrors.length === 0,
      sample: pathErrors.slice(0, 3),
    }

    saveJSON("ai-ide/report", report)
    console.log("\n=== REPORT ===")
    console.log(JSON.stringify(report, null, 2))
    console.log("\n=== SVG PATH BUG ===")
    console.log(
      pathErrors.length === 0
        ? "PASS: 0 erros 'Expected moveto path command'"
        : `FAIL: ${pathErrors.length} erros de path SVG`,
    )
  } finally {
    await browser.close()
  }
}

run()
