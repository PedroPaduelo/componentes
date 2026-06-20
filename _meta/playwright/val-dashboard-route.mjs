// Validação Playwright da rota índice `/dashboard` (REORG) + filtro runtime de
// composições (`/compositions?category=dashboard`). Roda contra o dev server em
// http://localhost:5173 (mesmo padrão de `val-families.mjs`).
//
// Cobertura (headless, exit 0/1):
//   1. `/dashboard` boota (networkidle) e tem um <h1> contendo "Dashboard".
//   2. Há cards de sub-grupo linkando para
//      /components/grupo/dashboards-charts e /components/grupo/dashboards-data.
//   3. Há um CTA linkando para /compositions?category=dashboard.
//   4. Clicar no CTA navega para /compositions?category=dashboard e renderiza
//      o grid filtrado de composições.
//   5. O filtro de fato ESTREITA o catálogo (composições filtradas < total) e
//      o banner "Filtrado" é coerente com os cards renderizados.
//
// CONTAGENS TOLERANTES (de propósito): os dados evoluem (hoje são 2 sub-grupos
// e 7 composições dashboard-like), então validamos limiares (>= 2 sub-grupos,
// >= 1 CTA, filtrados < total, banner == cards) em vez de números frágeis
// hardcoded. Assim a regressão pega quebras reais sem falsos negativos quando
// alguém adiciona/retira uma composição.
//
// Saída: 0 quando tudo OK; 1 com mensagem clara quando algo falha. Se o dev
// server estiver fora do ar, o preflight aborta com "ECONNREFUSED" ANTES de
// subir o chromium (mensagem acionável em vez de net::ERR_CONNECTION_REFUSED).
//
// Uso (cwd = /workspace, para o _shots.mjs ancorar em _meta/scratch/shots):
//   node _meta/playwright/val-dashboard-route.mjs
//   BASE_URL=http://localhost:9999 node _meta/playwright/val-dashboard-route.mjs  # testa ECONNREFUSED

import { chromium } from "playwright"
import { shot } from "./_shots.mjs"

const BASE = process.env.BASE_URL ?? "http://localhost:5173"

let failures = 0
function check(label, cond, extra = "") {
  const ok = !!cond
  if (!ok) failures++
  console.log(`${ok ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`)
}

/**
 * Preflight: garante que há um servidor escutando em `BASE` antes de gastar o
 * boot do chromium. Roda ANTES de `chromium.launch()`, então o caso "dev server
 * fora do ar / porta trocada" sai com exit 1 carregando o literal ECONNREFUSED
 * (contrato do critério de teste), em vez do net::ERR_CONNECTION_REFUSED opaco
 * que o `page.goto` lançaria depois.
 */
async function assertDevServerUp() {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(BASE, { signal: ctrl.signal })
    clearTimeout(timer)
    // Qualquer resposta HTTP (mesmo 404) prova que tem servidor escutando.
    if (!(res.status > 0)) throw new Error(`status HTTP inesperado: ${res.status}`)
  } catch (err) {
    const chain = [err, err?.cause]
      .filter(Boolean)
      .map((e) => `${e?.code ? `${e.code} ` : ""}${e?.message ?? e}`)
      .join(" | ")
    const refused = err?.cause?.code === "ECONNREFUSED" || /ECONNREFUSED/.test(chain)
    console.error(`✗ dev server inacessível em ${BASE}`)
    console.error(`  ${refused ? "ECONNREFUSED" : "erro"}: ${chain}`)
    console.error("  → suba o dev server antes de validar: npm run dev (porta 5173)")
    process.exit(1)
  }
}

await assertDevServerUp()

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(400)
}

try {
  const page = await ctx.newPage()

  // ── 1. /dashboard boota + <h1> "Dashboard" ────────────────────────────────
  await goto(page, "/dashboard")
  const h1s = await page.$$eval("h1", (els) =>
    els.map((e) => (e.textContent ?? "").trim()),
  )
  check(
    "/dashboard tem <h1> contendo 'Dashboard'",
    h1s.some((t) => t.includes("Dashboard")),
    h1s.join(" | ") || "(sem h1)",
  )

  // ── 2. Cards dos 2 sub-grupos (charts + data) ─────────────────────────────
  const chartsCount = await page
    .locator('a[href$="/components/grupo/dashboards-charts"]')
    .count()
  const dataCount = await page
    .locator('a[href$="/components/grupo/dashboards-data"]')
    .count()
  const subgroupCards = await page
    .locator('a[href*="/components/grupo/"]')
    .count()
  check("card → /components/grupo/dashboards-charts", chartsCount >= 1, `count=${chartsCount}`)
  check("card → /components/grupo/dashboards-data", dataCount >= 1, `count=${dataCount}`)
  check(">= 2 cards de sub-grupo", subgroupCards >= 2, `count=${subgroupCards}`)

  // ── 3. CTA para o filtro de composições ───────────────────────────────────
  const ctaSel = 'a[href*="/compositions?category=dashboard"]'
  const ctaCount = await page.locator(ctaSel).count()
  check(">= 1 CTA → /compositions?category=dashboard", ctaCount >= 1, `count=${ctaCount}`)

  // Screenshot de evidência (best-effort; nunca derruba a validação).
  await shot(page, "dashboard-route").catch(() => {})

  // ── 4. Clique no CTA → navega para o filtro + renderiza grid ──────────────
  if (ctaCount > 0) {
    await page.locator(ctaSel).first().click()
    await page.waitForURL(/\/compositions\?category=dashboard/, { timeout: 15000 })
    await page.waitForLoadState("networkidle").catch(() => {})
    check(
      "clique no CTA navega para /compositions?category=dashboard",
      /\/compositions\?category=dashboard/.test(page.url()),
      page.url(),
    )

    // O grid usa <Card data-slot="card">; a sidebar de composições usa <Link>
    // (sem data-slot), então este seletor conta SÓ os cards do grid filtrado.
    await page.waitForSelector("[data-slot=card]", { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(300)
    const filteredCards = await page.locator("[data-slot=card]").count()
    check("filtro de dashboard renderiza >= 1 composição", filteredCards >= 1, `cards=${filteredCards}`)

    // Banner "Filtrado" (role=status) confirma o filtro ativo e deve ser
    // coerente com a quantidade de cards renderizada (sem hardcode de número).
    // Filtramos por TEXTO porque o app tem outros [role=status] efêmeros — ex.:
    // o RouteFallback (spinner do Suspense, role=status sem texto) que aparece
    // enquanto o chunk de /compositions carrega após o clique. Pegar `.first()`
    // cru poderia casar o spinner vazio; o filtro por /filtrad/i mira o banner.
    const banner = page.locator("[role=status]").filter({ hasText: /filtrad/i })
    await banner.first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {})
    const bannerCount = await banner.count()
    check("banner 'Filtrado' de dashboard ativo", bannerCount >= 1, `matches=${bannerCount}`)
    if (bannerCount >= 1) {
      const statusText = await banner.first().innerText().catch(() => "")
      const bannerMatch = statusText.match(/(\d+)\s+composi/i)
      if (bannerMatch) {
        check(
          "contagem do banner == cards renderizados",
          Number(bannerMatch[1]) === filteredCards,
          `banner=${bannerMatch[1]} cards=${filteredCards}`,
        )
      }
    }

    await shot(page, "dashboard-compositions-filtered").catch(() => {})

    // ── 5. O filtro estreita o catálogo: filtrados < total ──────────────────
    await goto(page, "/compositions")
    const totalCards = await page.locator("[data-slot=card]").count()
    check(
      "filtro estreita o catálogo (filtrados < total)",
      filteredCards < totalCards && filteredCards >= 1,
      `filtrados=${filteredCards} total=${totalCards}`,
    )
  } else {
    check("clique no CTA de composições", false, "CTA ausente — não há o que clicar")
  }

  await page.close()
} catch (err) {
  failures++
  console.error(`✗ erro inesperado durante a validação:\n${String(err?.stack ?? err?.message ?? err)}`)
} finally {
  await browser.close()
}

console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURES`}`)
process.exit(failures === 0 ? 0 : 1)
