// Validador de REGRESSÃO da iniciativa REORG (smoke test pós-reorg).
//
// Depois de A1·B1·C1·C2·D1·E1 várias superfícies foram tocadas (taxonomia de
// 10 grupos + 2 sub-grupos de dashboard, rota índice `/components` como
// overview, filtro de grupo na Home, filtro runtime de
// composições `?category=dashboard`, deep-links de componente redirecionando
// para a group-page). Este é o SMOKE TEST FINAL que re-percorre o caminho feliz
// inteiro num único validador, garantindo que nada quebrou ponta-a-ponta.
//
// NÃO é um teste focado: a cobertura granular de cada feature vive nos testes
// dedicados (val-home-group-filter, val-sidebar-groups).
// Aqui cada cenário faz 2–4 asserções de alto nível só para provar que a
// superfície renderiza e responde. Por isso as contagens são TOLERANTES de
// propósito (`>=`, `contains`) — a taxonomia/registry evolui (hoje: 257
// famílias na Home, 15 famílias em dashboards-charts, 45 em dashboards-data,
// 7 composições dashboard-like, 10 grupos no overview) e cravar `===` daria
// falso-negativo a cada ajuste de curadoria.
//
// Cenários (cada um isolado num try/catch que identifica QUAL falhou):
//   1. `/`                                   → grid de famílias + filtro de grupo.
//   2. `/components`                         → overview com os 10 cards de grupo.
//   4. `/components/grupo/dashboards-charts` → <h1> "Dashboards & Charts" + famílias.
//   5. `/components/area-chart-tremor`       → redireciona p/ a âncora na group-page.
//   6. `/compositions?category=dashboard`    → grid filtrado (dashboard-like).
//   7. `/compositions/dba-workbench`         → deep-link sem filtro renderiza.
//
// Process.exit(0) quando TODOS passam; exit(1) com o(s) cenário(s) que falhou
// no resumo final. Se o servidor-alvo estiver fora do ar, o preflight aborta
// com `ECONNREFUSED` (mensagem acionável) ANTES de subir o chromium.
//
// Alvo: o dev/preview server. Por padrão http://localhost:5173, mas o :5173
// pode servir um `dist/` DESATUALIZADO (anterior à reorg). Para validar o
// código novo, suba um Vite próprio a partir de /workspace numa porta livre e
// aponte o validador via env (aceita os 2 nomes usados pelos val-*.mjs irmãos):
//
//   # sobe um vite isolado e valida contra ele (NÃO derruba o :5173):
//   npx vite --port 5174 --strictPort &   # a partir de /workspace
//   VITRINE_BASE_URL=http://localhost:5174 node _meta/playwright/val-reorg-regression.mjs
//
//   # teste do caminho de erro (servidor fora do ar → exit 1 com ECONNREFUSED):
//   BASE_URL=http://localhost:9999 node _meta/playwright/val-reorg-regression.mjs
//
// Cwd: /workspace. Headless (sem screenshots).
import { chromium } from "playwright"

// Alvo configurável: aceita VITRINE_BASE_URL (val-sidebar-groups,
// val-home-group-filter) e BASE_URL; default :5173.
const BASE =
  process.env.VITRINE_BASE_URL ?? process.env.BASE_URL ?? "http://localhost:5173"

/* -------------------------------------------------------------------------- */
/* Infra de asserção + agrupamento por cenário                                 */
/* -------------------------------------------------------------------------- */

let failures = 0
/** Registro de cada cenário rodado: { name, fails }. */
const scenarios = []

function check(label, cond, extra = "") {
  const ok = !!cond
  if (!ok) failures++
  console.log(`   ${ok ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`)
  return ok
}

/**
 * Roda um cenário isolado: conta as falhas que ele produziu (delta de
 * `failures`) e captura qualquer exceção como UMA falha do cenário (com a
 * mensagem), de modo que um erro inesperado em um cenário não derrube os
 * demais e ainda apareça nomeado no resumo final.
 */
async function scenario(name, fn) {
  const before = failures
  console.log(`\n▶ ${name}`)
  try {
    await fn()
  } catch (err) {
    failures++
    console.log(
      `   ✗ erro inesperado no cenário: ${String(err?.stack ?? err?.message ?? err)}`,
    )
  }
  scenarios.push({ name, fails: failures - before })
}

/* -------------------------------------------------------------------------- */
/* Preflight: servidor no ar? (sai com ECONNREFUSED claro antes do chromium)   */
/* -------------------------------------------------------------------------- */

/**
 * Garante que há um servidor escutando em `BASE` ANTES de gastar o boot do
 * chromium. Qualquer resposta HTTP (mesmo 404) prova que tem servidor. Se a
 * conexão é recusada (porta errada / server fora do ar), sai com exit 1
 * carregando o literal `ECONNREFUSED` — mensagem acionável em vez do
 * net::ERR_CONNECTION_REFUSED opaco que o `page.goto` lançaria depois.
 */
async function assertServerUp() {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)
    const res = await fetch(BASE, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!(res.status > 0)) throw new Error(`status HTTP inesperado: ${res.status}`)
  } catch (err) {
    const chain = [err, err?.cause]
      .filter(Boolean)
      .map((e) => `${e?.code ? `${e.code} ` : ""}${e?.message ?? e}`)
      .join(" | ")
    const refused =
      err?.cause?.code === "ECONNREFUSED" || /ECONNREFUSED/.test(chain)
    console.error(`✗ servidor-alvo inacessível em ${BASE}`)
    console.error(`  ${refused ? "ECONNREFUSED" : "erro"}: ${chain}`)
    console.error(
      "  → suba um Vite a partir de /workspace (ex.: npx vite --port 5174 --strictPort) e\n" +
        "    aponte VITRINE_BASE_URL/BASE_URL para a porta certa. NUNCA derrube o :5173.",
    )
    process.exit(1)
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers de navegação/contagem                                               */
/* -------------------------------------------------------------------------- */

/**
 * Navega de forma robusta: espera o DOM (confiável), depois aguarda
 * `networkidle` em best-effort (telas pesadas — charts, DbSchemaExplorer —
 * podem manter rAF sem rede), e dá um pequeno settle. Nunca falha por
 * networkidle estourar (o cenário decide o que asseverar).
 */
async function goto(page, path) {
  await page.goto(`${BASE}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(400)
}

/**
 * Conta elementos `[data-slot=<slot>]` que NÃO estão dentro de uma `<aside>`
 * (a sidebar de docs/composições). Escopa o grid de conteúdo central,
 * ignorando links/cards de navegação lateral.
 */
async function countContentSlots(page, slot) {
  return page.$$eval(
    `[data-slot=${slot}]`,
    (els) => els.filter((e) => !e.closest("aside")).length,
  )
}

/* -------------------------------------------------------------------------- */
/* Execução                                                                    */
/* -------------------------------------------------------------------------- */

await assertServerUp()

let browser
try {
  browser = await chromium.launch()
} catch (err) {
  console.error(
    `✗ não foi possível iniciar o Chromium do Playwright: ${err?.message ?? err}`,
  )
  console.error(
    "  → instale o browser e as libs de sistema: npx playwright install --with-deps chromium",
  )
  process.exit(1)
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

try {
  // ── 1. Home: grid de famílias + filtro de grupo ──────────────────────────
  await scenario("1. Home (/) renderiza o grid de famílias + filtro de grupo", async () => {
    const page = await ctx.newPage()
    await goto(page, "/")

    const cards = await page.locator("[data-slot=family-card]").count()
    check("grid populado de famílias (>= 150; hoje 257)", cards >= 150, `cards=${cards}`)

    const groupFilter = await page
      .locator('[role="group"][aria-label="Filtrar por grupo"]')
      .count()
    check("filtro de grupo ('Filtrar por grupo') presente", groupFilter >= 1, `count=${groupFilter}`)

    const chartChip = await page
      .locator('[role="group"][aria-label="Filtrar por grupo"] button', {
        hasText: "Dashboards & Charts",
      })
      .count()
    check("chip de grupo 'Dashboards & Charts' presente", chartChip >= 1, `count=${chartChip}`)

    await page.close()
  })

  // ── 2. /components: overview dos 10 grupos ───────────────────────────────
  await scenario("2. /components renderiza o overview de grupos (10 cards)", async () => {
    const page = await ctx.newPage()
    await goto(page, "/components")

    const h1 = ((await page.locator("h1").first().textContent()) ?? "").trim()
    check("<h1> 'Componentes' presente", /componentes/i.test(h1), `h1="${h1}"`)

    // Cards do overview = links de grupo FORA da sidebar (aside). A sidebar de
    // docs também lista os grupos, então escopamos pelo conteúdo central.
    const overviewCards = await page.$$eval(
      'a[href*="/components/grupo/"]',
      (els) => els.filter((e) => !e.closest("aside")).length,
    )
    check("overview lista >= 10 cards de grupo (hoje 10)", overviewCards >= 10, `cards=${overviewCards}`)

    await page.close()
  })

  // ── 4. group-page dashboards-charts: <h1> + famílias ─────────────────────
  await scenario("4. /components/grupo/dashboards-charts: <h1> 'Dashboards & Charts' + famílias", async () => {
    const page = await ctx.newPage()
    await goto(page, "/components/grupo/dashboards-charts")

    // `attached` (não `visible`): basta o texto/contagem do header; a página é
    // pesada (15 famílias de charts) e pode demorar a pintar no cold-start.
    await page.waitForSelector("article h1", { state: "attached", timeout: 30000 })
    const h1 = ((await page.locator("article h1").first().textContent()) ?? "").trim()
    // O label real usa "&" ("Dashboards & Charts") → checamos por inclusão.
    check("h1 contém 'Dashboards'", /dashboards/i.test(h1), `h1="${h1}"`)
    check("h1 contém 'Charts'", /charts/i.test(h1), `h1="${h1}"`)

    // Header anuncia "<N> famílias · <M> componentes".
    const familyCount = await page.evaluate(() => {
      const scope =
        document.querySelector("article header") ?? document.querySelector("article")
      const m = (scope?.textContent ?? "").match(/(\d+)\s+fam[ií]lias?/)
      return m ? Number(m[1]) : null
    })
    check(
      "header anuncia >= 10 famílias (hoje 15)",
      typeof familyCount === "number" && familyCount >= 10,
      `familyCount=${familyCount}`,
    )

    await page.close()
  })

  // ── 5. deep-link de componente → âncora na group-page ────────────────────
  await scenario("5. /components/area-chart-tremor redireciona p/ a âncora na group-page", async () => {
    const page = await ctx.newPage()
    await page.goto(`${BASE}/components/area-chart-tremor`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })
    // <Navigate replace> da FamilyDetail roda no mount; esperamos a troca de URL.
    await page
      .waitForURL(/\/components\/grupo\/dashboards-charts/, { timeout: 15000 })
      .catch(() => {})
    await page.waitForTimeout(400)

    const url = page.url()
    check(
      "redirecionou para /components/grupo/dashboards-charts",
      /\/components\/grupo\/dashboards-charts/.test(url),
      url,
    )
    check("âncora #area-chart-tremor preservada na URL", url.includes("#area-chart-tremor"), url)

    // A seção-âncora existe de fato na group-page de destino (id=<slug>).
    const sec = await page.locator("#area-chart-tremor").count()
    check("group-page tem a seção #area-chart-tremor", sec >= 1, `count=${sec}`)

    await page.close()
  })

  // ── 6. filtro runtime de composições (?category=dashboard) ───────────────
  await scenario("6. /compositions?category=dashboard renderiza o grid filtrado", async () => {
    const page = await ctx.newPage()
    await goto(page, "/compositions?category=dashboard")
    await page.waitForSelector("[data-slot=card]", { timeout: 15000 }).catch(() => {})

    const filtered = await countContentSlots(page, "card")
    check("filtro dashboard renderiza >= 5 composições (hoje 7)", filtered >= 5, `cards=${filtered}`)

    // Banner "Filtrado" (role=status, com o texto "Filtrado…") confirma o
    // filtro ativo. Filtramos por texto p/ não casar o spinner do Suspense.
    const banner = page.locator("[role=status]").filter({ hasText: /filtrad/i })
    check("banner 'Filtrado' de dashboard ativo", (await banner.count()) >= 1)

    // O filtro de fato ESTREITA o catálogo (filtrados < total).
    await goto(page, "/compositions")
    const total = await countContentSlots(page, "card")
    check(
      "filtro estreita o catálogo (filtrados < total)",
      filtered < total && filtered >= 1,
      `filtrados=${filtered} total=${total}`,
    )

    await page.close()
  })

  // ── 7. deep-link de composição (sem filtro) renderiza ────────────────────
  await scenario("7. /compositions/dba-workbench (deep-link sem filtro) renderiza", async () => {
    const page = await ctx.newPage()
    const pageErrors = []
    page.on("pageerror", (e) => pageErrors.push(String(e?.message ?? e)))
    await goto(page, "/compositions/dba-workbench")

    // Página de detalhe válida tem <h1> com o NOME da composição ("DBA
    // Workbench"); NotFound teria "Página não encontrada".
    const h1 = ((await page.locator("h1").first().textContent()) ?? "").trim()
    check("<h1> é o nome da composição (não NotFound)", /dba workbench/i.test(h1), `h1="${h1}"`)
    check("não caiu em NotFound", !/não encontrad/i.test(h1), `h1="${h1}"`)

    // Chrome da página de detalhe (seção "Instalar este bloco") montou.
    const installHeading = await page
      .locator("h2", { hasText: /instalar este bloco/i })
      .count()
    check("seção 'Instalar este bloco' presente", installHeading >= 1, `count=${installHeading}`)

    check("sem pageerror fatal ao montar", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "))

    await page.close()
  })
} finally {
  await browser.close().catch(() => {})
}

/* -------------------------------------------------------------------------- */
/* Resumo agregado                                                             */
/* -------------------------------------------------------------------------- */

console.log("\n──────────────── resumo ────────────────")
for (const s of scenarios) {
  console.log(`${s.fails === 0 ? "✓" : "✗"} ${s.name}${s.fails ? `  (${s.fails} falha[s])` : ""}`)
}

const failed = scenarios.filter((s) => s.fails > 0)
if (failures === 0) {
  console.log(`\nALL PASS ✓ — ${scenarios.length} cenários OK`)
} else {
  console.log(
    `\n${failures} FAILURE(S) ✗ em ${failed.length} cenário(s):\n  - ` +
      failed.map((s) => s.name).join("\n  - "),
  )
}

process.exit(failures === 0 ? 0 : 1)
