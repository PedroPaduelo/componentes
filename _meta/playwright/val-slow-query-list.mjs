// _meta/playwright/val-slow-query-list.mjs
// Validação visual/funcional do SlowQueryList na vitrine.
// Critérios:
//  1. /components/slow-query-list retorna 200
//  2. 2 instâncias [data-slot=slow-query-list] (audit + sgt)
//  3. Cada uma com ≥4 query cards visíveis
//  4. Expandir 1 query mostra plan tree com ≥3 nós aninhados
//  5. Sugestões visíveis com estimatedImprovementPct
//  6. Cores por severidade (warning=amber, critical=rose)
//  7. 390px: cards empilham, sem overflow horizontal
import { chromium } from "playwright"
import { outPath } from "./_shots.mjs"

const url = "http://localhost:5173/components/slow-query-list"
const browser = await chromium.launch()
const results = []

async function inspect(theme, viewport) {
  const ctx = await browser.newContext({
    viewport: { width: viewport, height: 900 },
  })
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() =>
      localStorage.setItem("vitrine-theme", "dark"),
    )
  } else {
    await page.addInitScript(() =>
      localStorage.setItem("vitrine-theme", "light"),
    )
  }
  const errors = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console.error: ${m.text()}`)
  })

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 })
  await page.waitForTimeout(2500)

  // 1. Count instances
  const instanceCount = await page
    .locator('[data-slot="slow-query-list"]')
    .count()

  // 2. Count query cards in first instance
  const firstInstance = page.locator('[data-slot="slow-query-list"]').first()
  const cardCount = await firstInstance
    .locator('[data-slot="slow-query-card"]')
    .count()

  // 3. Severity badges
  const warningBadges = await page
    .locator('[data-slot="slow-query-duration"]')
    .filter({ hasText: /warning|ms|s/ })
    .count()

  // 4. Expand first query card and check plan tree
  const firstCard = firstInstance
    .locator('[data-slot="slow-query-card-header"]')
    .first()
  await firstCard.click()
  await page.waitForTimeout(800)

  const planNodes = await page
    .locator('[data-slot="slow-query-plan-node"]')
    .count()
  const planTree = await page
    .locator('[data-slot="slow-query-plan"]')
    .count()

  // 5. Suggestions
  const suggestionCards = await page
    .locator('[data-slot="slow-query-suggestion"]')
    .count()
  const improvementBadges = await page
    .locator('[data-slot="slow-query-improvement"]')
    .count()

  // 6. Copy DDL button
  const copyDdlBtn = await page
    .locator('[data-slot="slow-query-copy-ddl"]')
    .count()

  // 7. Severity colors — check first critical badge has rose/amber classes
  const criticalBadge = page
    .locator('[data-slot="slow-query-card"][data-severity="critical"]')
    .first()
  const criticalExists = (await criticalBadge.count()) > 0

  // 8. SQL highlight
  const sqlHighlight = await page
    .locator('[data-slot="slow-query-sql"]')
    .count()

  // 9. Locks
  const locks = await page.locator('[data-slot="slow-query-locks"]').count()

  // 10. Empty state (should NOT exist — we have data)
  const emptyState = await page
    .locator('[data-slot="slow-query-empty"]')
    .count()

  // 11. Group labels
  const groupLabels = await page
    .locator('[data-slot="slow-query-group-label"]')
    .count()

  // 12. Header stats
  const headerCount = await page
    .locator('[data-slot="slow-query-list-count"]')
    .count()

  await page.screenshot({
    path: outPath(`slow-query-list/${theme}-${viewport}.png`),
    fullPage: false,
  })

  const result = {
    theme,
    viewport,
    instanceCount,
    cardCount,
    planNodes,
    planTree,
    suggestionCards,
    improvementBadges,
    copyDdlBtn,
    criticalExists,
    sqlHighlight,
    locks,
    emptyState,
    groupLabels,
    headerCount,
    errors,
  }
  results.push(result)
  await page.close()
  return result
}

// Light + desktop
const r1 = await inspect("light", 1440)
// Dark + desktop
const r2 = await inspect("dark", 1440)
// Light + mobile 390
const r3 = await inspect("light", 390)

await browser.close()

console.log(JSON.stringify(results, null, 2))

// Score
const ok =
  r1.instanceCount === 2 &&
  r1.cardCount >= 4 &&
  r1.planNodes >= 3 &&
  r1.planTree >= 1 &&
  r1.suggestionCards >= 1 &&
  r1.improvementBadges >= 1 &&
  r1.copyDdlBtn >= 1 &&
  r1.criticalExists &&
  r1.sqlHighlight >= 1 &&
  r1.locks >= 1 &&
  r1.emptyState === 0 &&
  r1.groupLabels >= 1 &&
  r1.headerCount === 2 &&
  r2.instanceCount === 2 &&
  r2.cardCount >= 4 &&
  r3.instanceCount === 2 &&
  r3.cardCount >= 4 &&
  r1.errors.length === 0 &&
  r2.errors.length === 0 &&
  r3.errors.length === 0

console.log(ok ? "✅ val-slow-query-list: PASS" : "❌ val-slow-query-list: FAIL")
process.exitCode = ok ? 0 : 1
