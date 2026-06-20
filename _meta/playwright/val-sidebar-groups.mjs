// Validação Playwright — REORG-F2: sidebar de docs com os 10 GRUPOS da
// taxonomia (ONDA 2), incluindo os 2 sub-grupos de DASHBOARD.
//
// O que garante (rodando contra o dev server em http://localhost:5173):
//   1. /components renderiza a sidebar fixa de docs (aside desktop ≥ lg).
//   2. A sidebar lista os 10 grupos (links `/components/grupo/<id>`).
//   3. Existem links para `dashboards-charts` E `dashboards-data`.
//   4. Clicar no link `dashboards-charts` muda a URL e abre a group-page
//      certa (<h1> "Dashboards … Charts" + contagem de famílias no header).
//   5. Idem para `dashboards-data` (<h1> "Dashboards … Data").
//
// Contagens são validadas de forma TOLERANTE (sidebar com >= 10 grupos;
// header com >= 10 famílias) de propósito: a taxonomia evolui (charts tem 15
// famílias, data ~45) e hardcodar o número exato daria falso-negativo. O h1 é
// checado por inclusão ("Dashboards" + "Charts"/"Data") porque o label real
// usa "&" ("Dashboards & Charts").
//
// Exit 0 = tudo passou. Exit 1 = alguma falha (link quebrado, página errada)
// OU dev server fora do ar (mensagem clara, sem stack trace).
//
// Uso: node _meta/playwright/val-sidebar-groups.mjs   (cwd = /workspace)
import { chromium } from "playwright"
import { outPath } from "./_shots.mjs"

const BASE = "http://localhost:5173"

let failures = 0
function check(label, cond, extra = "") {
  const ok = !!cond
  if (!ok) failures++
  console.log(`${ok ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`)
}

/** Screenshot não-fatal em _meta/scratch/shots/sidebar-groups/<name>.png. */
async function safeShot(page, name) {
  try {
    await page.screenshot({
      path: outPath(`sidebar-groups/${name}.png`),
      fullPage: false,
    })
  } catch (err) {
    console.log(`  (screenshot ${name} falhou — ignorado: ${err.message})`)
  }
}

// --- Boot do browser (falha aqui = chromium não instalado → exit 1) ---------
let browser
try {
  browser = await chromium.launch()
} catch (err) {
  console.error(`✗ Não foi possível iniciar o Chromium do Playwright: ${err.message}`)
  console.error("  → instale com: npx playwright install chromium")
  process.exit(1)
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
// Começa SEMPRE com os domínios expandidos: zera a persistência de colapso
// (roda a cada navegação, pois addInitScript reaplica em todo load).
await page.addInitScript(() => localStorage.removeItem("vitrine-docs-collapsed"))

async function gotoComponents() {
  await page.goto(`${BASE}/components`, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(400)
}

/** Garante todos os domínios da sidebar expandidos (defensivo). */
async function expandAllDomains() {
  const collapsed = await page.$$eval(
    'aside nav button[aria-controls^="docs-domain-"]',
    (btns) =>
      btns
        .filter((b) => b.getAttribute("aria-expanded") !== "true")
        .map((b) => b.getAttribute("aria-controls")),
  )
  for (const id of collapsed) {
    await page.click(`aside nav button[aria-controls="${id}"]`)
    await page.waitForTimeout(150)
  }
}

/**
 * Clica no link de um grupo na sidebar, espera a navegação e valida a
 * group-page: URL, <h1> (inclui "Dashboards" + `expectWord`) e familyCount.
 */
async function visitGroup(groupId, expectWord) {
  const link = page.locator(`aside nav a[href$="/components/grupo/${groupId}"]`).first()
  if ((await link.count()) === 0) {
    check(`${groupId}: link presente na sidebar pra clicar`, false, "link não encontrado")
    return
  }

  try {
    await link.click()
    await page.waitForURL(`**/components/grupo/${groupId}`, { timeout: 15000 })
  } catch (err) {
    check(`${groupId}: clicar no link navega pra /components/grupo/${groupId}`, false, err.message)
    return
  }
  check(`${groupId}: URL mudou pra a group-page`, page.url().includes(`/components/grupo/${groupId}`), page.url())

  let h1 = ""
  try {
    await page.waitForSelector("article h1", { timeout: 15000 })
    h1 = ((await page.locator("article h1").first().textContent()) ?? "").trim()
  } catch (err) {
    check(`${groupId}: <h1> da group-page renderizado`, false, err.message)
    return
  }
  check(`${groupId}: h1 contém "Dashboards"`, /dashboards/i.test(h1), `h1="${h1}"`)
  check(`${groupId}: h1 contém "${expectWord}"`, new RegExp(expectWord, "i").test(h1), `h1="${h1}"`)

  // familyCount: header da group-page exibe "<N> famílias · <M> componentes".
  const familyCount = await page.evaluate(() => {
    const scope = document.querySelector("article header") ?? document.querySelector("article")
    const text = scope?.textContent ?? ""
    const m = text.match(/(\d+)\s+fam[ií]lias?/)
    return m ? Number(m[1]) : null
  })
  check(
    `${groupId}: familyCount no header (tolerante, >= 10)`,
    typeof familyCount === "number" && familyCount >= 10,
    `familyCount=${familyCount}`,
  )

  await safeShot(page, groupId)
}

// --- Abertura de /components (falha = dev server fora do ar → exit 1) --------
try {
  await gotoComponents()
} catch (err) {
  console.error(`✗ Não consegui abrir ${BASE}/components — o dev server está no ar? (npm run dev)`)
  console.error(`  ${err.message}`)
  await browser.close().catch(() => {})
  process.exit(1)
}

try {
  // 1. Sidebar fixa de docs presente (desktop ≥ lg).
  const navCount = await page.locator('aside nav[aria-label="Navegação de componentes"]').count()
  check("sidebar de docs presente (aside nav, desktop ≥ lg)", navCount >= 1, `count=${navCount}`)

  // Defensivo: assegura os 3 domínios expandidos antes de contar os grupos.
  await expandAllDomains()

  // 2. Os 10 grupos como links `/components/grupo/<id>` (tolerante: >= 10).
  const groupPaths = await page.$$eval(
    'aside nav a[href*="/components/grupo/"]',
    (els) => els.map((e) => new URL(e.href).pathname),
  )
  check("sidebar lista >= 10 grupos", groupPaths.length >= 10, `count=${groupPaths.length}: ${groupPaths.join(", ")}`)

  // 3. Os 2 sub-grupos de dashboard têm link na sidebar.
  check(
    "link da sidebar pra /components/grupo/dashboards-charts",
    groupPaths.includes("/components/grupo/dashboards-charts"),
  )
  check(
    "link da sidebar pra /components/grupo/dashboards-data",
    groupPaths.includes("/components/grupo/dashboards-data"),
  )

  await safeShot(page, "index")

  // 4. Navega (via clique) pra dashboards-charts e valida a group-page.
  await visitGroup("dashboards-charts", "Charts")

  // 5. Volta ao índice e navega (via clique) pra dashboards-data.
  await gotoComponents()
  await expandAllDomains()
  await visitGroup("dashboards-data", "Data")
} catch (err) {
  console.error(`✗ Erro inesperado durante a validação: ${err.message}`)
  failures++
} finally {
  await browser.close().catch(() => {})
}

console.log(`\n${failures === 0 ? "ALL PASS ✓" : `${failures} FAILURE(S) ✗`}`)
process.exit(failures === 0 ? 0 : 1)
