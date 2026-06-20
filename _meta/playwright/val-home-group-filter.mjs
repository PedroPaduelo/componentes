// Validador Playwright do FILTRO DE GRUPO na Home (REORG-F3 / E1).
//
// Valida end-to-end o GroupFilter adicionado na Home (src/pages/Home.tsx +
// src/components/catalog/GroupFilter.tsx): os chips renderizam, selecionar
// "Dashboards & Charts" filtra o grid para as famílias de charts, e
// "Limpar filtros" restaura o total.
//
// Roda contra o dev/preview server em http://localhost:5173 (mesmo contrato
// dos demais val-*.mjs; ver _meta/playwright/README.md).
//
//   node _meta/playwright/val-home-group-filter.mjs
//
// Exit 0 = filtro funciona; Exit 1 = alguma asserção falhou (com mensagem
// clara). Asserções de CONTAGEM são TOLERANTES de propósito (a taxonomia
// evolui): checa ">= 10 cards após filtrar charts" e "menos cards que o
// total", em vez de cravar o número exato. A corretude do conteúdo é garantida
// pela checagem de pertinência (todo card filtrado é uma família de charts).
import { chromium } from "playwright"

const BASE = process.env.VITRINE_BASE_URL ?? "http://localhost:5173"

// Container do filtro de grupo (role=group + aria-label estável). Os outros
// filtros (categoria/origem/tag) também usam role=group, por isso escopamos
// pelo aria-label.
const GROUP_SEL = '[role="group"][aria-label="Filtrar por grupo"]'
const CARD_SEL = "[data-slot=family-card]"

// 10 grupos (src/data/groups.ts → GROUP_IDS) + chip "Todos".
const EXPECTED_CHIP_COUNT = 11

// Mínimo tolerante de famílias após filtrar por "Dashboards & Charts".
// (Hoje são 15 famílias; usamos >= 10 para não quebrar a cada ajuste da
// taxonomia — ver nota no topo.)
const MIN_CHART_CARDS = 10

// Bases de família que pertencem ao grupo "dashboards-charts"
// (src/data/groups.ts → SLUG_GROUP_MAP, pós-hotfix REORG-A1 que reincluiu
// area-chart-tremor). Cada slug de chart é a sua própria família, então a
// base == o slug. Fonte da verdade da pertinência; atualize se o mapa mudar.
const EXPECTED_CHART_BASES = [
  "area-chart-tremor",
  "bar-chart",
  "bar-chart-tremor",
  "bar-list-tremor",
  "category-bar-tremor",
  "combo-chart-tremor",
  "donut-breakdown",
  "donut-chart",
  "donut-chart-tremor",
  "h-bar-chart",
  "line-chart",
  "line-chart-tremor",
  "scatter-chart-tremor",
  "spark-chart-tremor",
  "sparkline",
]

// Famílias-âncora que DEVEM aparecer ao filtrar charts (sanidade do filtro).
const ANCHOR_CHART_BASES = ["area-chart-tremor", "bar-chart-tremor", "line-chart-tremor"]

// Famílias claramente NÃO-charts: se vazarem no filtro, ele está quebrado.
const NON_CHART_BASES = ["button", "input", "card"]

let failures = 0
function check(label, cond, extra = "") {
  const ok = !!cond
  if (!ok) failures++
  console.log(`${ok ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`)
}

async function main() {
  const browser = await chromium.launch()
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()

    const consoleErrors = []
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text())
    })
    page.on("pageerror", (e) => consoleErrors.push(String(e?.message ?? e)))

    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(400)

    // 1. GroupFilter presente na Home.
    let groupPresent = true
    try {
      await page.waitForSelector(GROUP_SEL, { timeout: 15000 })
    } catch {
      groupPresent = false
    }
    check(
      "GroupFilter ('Filtrar por grupo') presente na Home",
      groupPresent,
      groupPresent ? "" : "container não encontrado — E1 deployado? build (dist/) atualizado?",
    )

    if (groupPresent) {
      // 2. 11 chips (10 grupos + "Todos").
      const chipCount = await page.locator(`${GROUP_SEL} button`).count()
      check(
        `GroupFilter renderiza ${EXPECTED_CHIP_COUNT} chips (10 grupos + "Todos")`,
        chipCount === EXPECTED_CHIP_COUNT,
        `chips=${chipCount}`,
      )

      // 3. Chip "Todos".
      const todosChip = page.locator(`${GROUP_SEL} button`, { hasText: "Todos" })
      check('Chip "Todos" presente', (await todosChip.count()) >= 1)

      // Total inicial (sem filtro). Tolerante: só precisa ser > que os charts.
      const totalCards = await page.locator(CARD_SEL).count()
      check("Home inicia com grid populado (sem filtro)", totalCards > MIN_CHART_CARDS, `total=${totalCards}`)

      // 4. Selecionar "Dashboards & Charts".
      const chartChip = page.locator(`${GROUP_SEL} button`, { hasText: "Dashboards & Charts" })
      const chartChipCount = await chartChip.count()
      check('Chip "Dashboards & Charts" presente (exatamente 1)', chartChipCount === 1, `count=${chartChipCount}`)

      if (chartChipCount >= 1) {
        await chartChip.first().click()
        await page.waitForTimeout(200) // re-render do grid (filtro local, sem rede)

        const pressed = await chartChip.first().getAttribute("aria-pressed")
        check('Chip "Dashboards & Charts" fica ativo (aria-pressed=true)', pressed === "true", `aria-pressed=${pressed}`)

        // 5. Contar cards filtrados + coletar as bases de família.
        const chartsCount = await page.locator(CARD_SEL).count()
        const bases = await page.$$eval(CARD_SEL, (els) =>
          els.map((e) => e.getAttribute("data-family-base")),
        )

        check(`Filtro charts mostra >= ${MIN_CHART_CARDS} famílias`, chartsCount >= MIN_CHART_CARDS, `count=${chartsCount}`)
        check("Filtro charts mostra MENOS cards que o total", chartsCount < totalCards, `${chartsCount} < ${totalCards}`)

        // 6. Pertinência: todo card filtrado é uma família de charts esperada.
        const unexpected = bases.filter((b) => !EXPECTED_CHART_BASES.includes(b))
        check(
          "Todo card filtrado é uma família de charts (lista esperada)",
          unexpected.length === 0,
          unexpected.length ? `inesperados: ${unexpected.join(", ")}` : `${bases.length} cards ok`,
        )

        // Âncoras presentes.
        const missingAnchors = ANCHOR_CHART_BASES.filter((b) => !bases.includes(b))
        check(
          "Famílias-âncora de charts presentes",
          missingAnchors.length === 0,
          missingAnchors.length ? `faltando: ${missingAnchors.join(", ")}` : ANCHOR_CHART_BASES.join(", "),
        )

        // Nenhuma família não-charts vazando.
        const leaks = NON_CHART_BASES.filter((b) => bases.includes(b))
        check("Nenhuma família não-charts vaza no filtro", leaks.length === 0, leaks.length ? `vazou: ${leaks.join(", ")}` : "")

        // Bases únicas (não duplica card).
        const unique = new Set(bases)
        check("Cards filtrados têm data-family-base único", unique.size === bases.length, `${unique.size}/${bases.length}`)

        // 7. "Limpar filtros" restaura o total.
        const clearBtn = page.locator("button", { hasText: "Limpar filtros" })
        const hasClear = (await clearBtn.count()) >= 1
        check('Botão "Limpar filtros" aparece com filtro ativo', hasClear)

        if (hasClear) {
          await clearBtn.first().click()
          await page.waitForTimeout(200)

          const afterClear = await page.locator(CARD_SEL).count()
          check('"Limpar filtros" restaura o total de cards', afterClear === totalCards, `${afterClear} == ${totalCards}`)

          const pressedAfter = await chartChip.first().getAttribute("aria-pressed")
          check("Chip charts volta a inativo após limpar", pressedAfter === "false", `aria-pressed=${pressedAfter}`)
        }
      }
    }

    // Console errors são informativos (não-fatais) — registramos para diagnóstico.
    if (consoleErrors.length) {
      console.log(`\nℹ️  ${consoleErrors.length} console error(s) na página (não-fatal):`)
      for (const e of consoleErrors.slice(0, 5)) console.log(`   - ${e}`)
    }
  } finally {
    await browser.close().catch(() => {})
  }
}

main()
  .then(() => {
    console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`}`)
    process.exit(failures === 0 ? 0 : 1)
  })
  .catch((err) => {
    console.error("\n✗ ERRO inesperado ao validar o filtro de grupo:")
    console.error(`  ${err?.stack ?? err?.message ?? err}`)
    console.error(
      "  Pré-requisitos: dev server no ar em :5173 (com E1 deployado) + browser do " +
        "Playwright instalado (`npx playwright install chromium` e deps de sistema).",
    )
    process.exit(1)
  })
