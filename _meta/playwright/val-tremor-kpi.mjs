// Validação Playwright dos 4 KPI Tremor (Onda 6).
//
// Cobre (1 cenário por componente, light + dark):
//   • tracker-tremor        → ≥1 bloco com data-slot="tracker-tremor"
//   • progress-bar-tremor   → role="progressbar" + aria-valuenow + variants
//   • progress-circle-tremor→ SVG + role="progressbar" + 2 círculos
//   • callout-tremor        → título renderizado + variant class
//
// Como os 4 já estão registrados em src/data/components.ts e possuem examples
// em src/data/examples-tremor.tsx, eles renderizam diretamente nas páginas
// /components/<slug> via FamilyDetail → VariantSection → ExampleBlock.render.
// Não é necessário criar página de teste dedicada.
//
// Cada teste: navega → screenshot light → seta tema dark → screenshot dark
//             → inspeciona DOM (data-slot, role, aria, classes) → log.
//
// Saída (screenshots + report):
//   _meta/scratch/shots/tremor-kpi/<slug>-<light|dark>.png
//   _meta/scratch/shots/tremor-kpi/val-results.json
//   _meta/scratch/shots/tremor-kpi/val-report.txt
//
// Uso:
//   npm run dev (porta 5173) + node _meta/playwright/val-tremor-kpi.mjs
import { chromium } from "playwright"
import { shot, saveJSON, saveText } from "./_shots.mjs"

const BASE = "http://localhost:5173"
const SLUGS = [
  "tracker-tremor",
  "progress-bar-tremor",
  "progress-circle-tremor",
  "callout-tremor",
]

const results = []
function check(name, pass, detail = "") {
  results.push({ name, pass, detail })
  console.log(`${pass ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const browser = await chromium.launch()

/**
 * Abre a página /components/<slug>, alterna tema via localStorage e tira
 * screenshots em light e dark. Retorna o `page` (no tema dark) e o `ctx`
 * para que o caller possa fechar.
 */
async function openSlug(slug, { dark = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() =>
      localStorage.setItem("vitrine-theme", "dark"),
    )
  }
  await page.goto(`${BASE}/components/${slug}`, {
    waitUntil: "networkidle",
    timeout: 30000,
  })
  // Espera explícita pela seção da variante (o id é o próprio slug).
  await page.waitForSelector(`section#${slug}`, { timeout: 10000 })
  await page.waitForTimeout(400)
  return { ctx, page }
}

// ─── 1. tracker-tremor ──────────────────────────────────────────────────
{
  const { ctx, page } = await openSlug("tracker-tremor")
  await shot(page, "tracker-tremor-light", { sub: "tremor-kpi" })

  const slots = await page.locator('section#tracker-tremor [data-slot="tracker-tremor"]').count()
  check("tracker-tremor: tem ≥1 bloco com data-slot", slots >= 1, `slots=${slots}`)

  const blockCount = await page
    .locator('section#tracker-tremor [data-slot="tracker-tremor"] > div')
    .count()
  check(
    "tracker-tremor: 365 dias (faixa completa) tem ≥300 blocos",
    blockCount >= 300,
    `blocos=${blockCount}`,
  )

  // tremor-id presente (discriminador Tremor vs Progress shadcn).
  const tremorIds = await page
    .locator('section#tracker-tremor [data-slot="tracker-tremor"][tremor-id="tremor-raw"]')
    .count()
  check("tracker-tremor: tremor-id='tremor-raw' presente", tremorIds >= 1, `tremorIds=${tremorIds}`)

  // HoverCard: hover num bloco deve abrir o portal com o tooltip.
  const firstBlock = page
    .locator('section#tracker-tremor [data-slot="tracker-tremor"] > div')
    .first()
  await firstBlock.hover({ force: true })
  await page.waitForTimeout(700)
  const tooltipOpen = await page
    .locator('section#tracker-tremor [role="tooltip"]')
    .count()
  check(
    "tracker-tremor: hover em bloco abre HoverCard com tooltip",
    tooltipOpen >= 1,
    `tooltips=${tooltipOpen}`,
  )

  // Dark: re-abre a página com tema dark.
  const darkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const darkPage = await darkCtx.newPage()
  await darkPage.addInitScript(() =>
    localStorage.setItem("vitrine-theme", "dark"),
  )
  await darkPage.goto(`${BASE}/components/tracker-tremor`, {
    waitUntil: "networkidle",
    timeout: 30000,
  })
  await darkPage.waitForSelector('section#tracker-tremor', { timeout: 10000 })
  await darkPage.waitForTimeout(500)
  await shot(darkPage, "tracker-tremor-dark", { sub: "tremor-kpi" })
  const htmlClass = await darkPage.evaluate(() => document.documentElement.className)
  check(
    "tracker-tremor: <html> tem classe 'dark' no tema dark",
    htmlClass.includes("dark"),
    `class="${htmlClass}"`,
  )
  await ctx.close()
  await darkCtx.close()
}

// ─── 2. progress-bar-tremor ─────────────────────────────────────────────
{
  const { ctx, page } = await openSlug("progress-bar-tremor")
  await shot(page, "progress-bar-tremor-light", { sub: "tremor-kpi" })

  const slots = await page
    .locator('section#progress-bar-tremor [data-slot="progress-bar-tremor"]')
    .count()
  check(
    "progress-bar-tremor: tem ≥2 instâncias (exemplos basic+variants)",
    slots >= 2,
    `slots=${slots}`,
  )

  const roleAttr = await page
    .locator('section#progress-bar-tremor [data-slot="progress-bar-tremor"][role="progressbar"]')
    .count()
  check(
    "progress-bar-tremor: tem role='progressbar'",
    roleAttr === slots,
    `role=${roleAttr} slots=${slots}`,
  )

  // aria-valuenow deve bater com value (75 no exemplo basic).
  const firstAria = await page
    .locator('section#progress-bar-tremor [data-slot="progress-bar-tremor"]')
    .first()
    .getAttribute("aria-valuenow")
  check(
    "progress-bar-tremor: 1ª instância tem aria-valuenow numérico",
    firstAria !== null && !Number.isNaN(Number(firstAria)),
    `aria-valuenow=${firstAria}`,
  )

  // aria-valuemax=100 por padrão.
  const firstMax = await page
    .locator('section#progress-bar-tremor [data-slot="progress-bar-tremor"]')
    .first()
    .getAttribute("aria-valuemax")
  check(
    "progress-bar-tremor: aria-valuemax=100 (default)",
    firstMax === "100",
    `aria-valuemax=${firstMax}`,
  )

  // tremor-id presente.
  const tremorIds = await page
    .locator(
      'section#progress-bar-tremor [data-slot="progress-bar-tremor"][tremor-id="tremor-raw"]',
    )
    .count()
  check(
    "progress-bar-tremor: tremor-id='tremor-raw' presente",
    tremorIds >= 1,
    `tremorIds=${tremorIds}`,
  )

  // Variants: as 5 cores (default/neutral/warning/error/success) devem
  // aparecer pelo menos 1× nas classes Tailwind do slot bar interno.
  const innerClasses = await page.$$eval(
    'section#progress-bar-tremor [data-slot="progress-bar-tremor"] > div > div',
    (els) => els.map((e) => e.className).join(" | "),
  )
  const expectedColors = ["blue-500", "gray-500", "yellow-500", "red-500", "emerald-500"]
  const missing = expectedColors.filter((c) => !innerClasses.includes(c))
  check(
    "progress-bar-tremor: 5 variants semânticas presentes (blue/gray/yellow/red/emerald-500)",
    missing.length === 0,
    missing.length ? `faltando=${missing.join(",")}` : "todas presentes",
  )

  // Width da barra = valor% (exemplo basic com value=75 → ~75% no style).
  const firstBarStyle = await page
    .locator('section#progress-bar-tremor [data-slot="progress-bar-tremor"] > div > div')
    .first()
    .getAttribute("style")
  check(
    "progress-bar-tremor: 1ª barra tem style com width em %",
    !!firstBarStyle && firstBarStyle.includes("width"),
    `style="${firstBarStyle}"`,
  )

  // Dark.
  const darkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const darkPage = await darkCtx.newPage()
  await darkPage.addInitScript(() =>
    localStorage.setItem("vitrine-theme", "dark"),
  )
  await darkPage.goto(`${BASE}/components/progress-bar-tremor`, {
    waitUntil: "networkidle",
    timeout: 30000,
  })
  await darkPage.waitForSelector('section#progress-bar-tremor', { timeout: 10000 })
  await darkPage.waitForTimeout(500)
  await shot(darkPage, "progress-bar-tremor-dark", { sub: "tremor-kpi" })
  await ctx.close()
  await darkCtx.close()
}

// ─── 3. progress-circle-tremor ──────────────────────────────────────────
{
  const { ctx, page } = await openSlug("progress-circle-tremor")
  await shot(page, "progress-circle-tremor-light", { sub: "tremor-kpi" })

  const slots = await page
    .locator('section#progress-circle-tremor [data-slot="progress-circle-tremor"]')
    .count()
  check(
    "progress-circle-tremor: tem ≥2 instâncias (basic+variants)",
    slots >= 2,
    `slots=${slots}`,
  )

  // role=progressbar está no CONTAINER <div> externo (não no <svg>).
  const roleCount = await page
    .locator(
      'section#progress-circle-tremor [data-slot="progress-circle-tremor"][role="progressbar"]',
    )
    .count()
  check(
    "progress-circle-tremor: container externo tem role='progressbar'",
    roleCount === slots,
    `role=${roleCount} slots=${slots}`,
  )

  // SVG interno com viewBox correto.
  const svgs = await page
    .locator('section#progress-circle-tremor [data-slot="progress-circle-tremor"] svg')
    .count()
  check(
    "progress-circle-tremor: SVG presente em cada instância",
    svgs === slots,
    `svgs=${svgs} slots=${slots}`,
  )

  // 2 círculos por SVG (trilha de fundo + progresso).
  const circlesPerSvg = await page.$$eval(
    'section#progress-circle-tremor [data-slot="progress-circle-tremor"] svg',
    (els) => els.map((e) => e.querySelectorAll("circle").length),
  )
  const allHaveTwo = circlesPerSvg.every((n) => n === 2)
  check(
    "progress-circle-tremor: cada SVG tem 2 <circle> (trilha+progresso)",
    allHaveTwo,
    `counts=${circlesPerSvg.join(",")}`,
  )

  // aria-valuenow coerente (basic tem value=80).
  const ariaValues = await page.$$eval(
    'section#progress-circle-tremor [data-slot="progress-circle-tremor"]',
    (els) => els.map((e) => e.getAttribute("aria-valuenow")),
  )
  const allNumeric = ariaValues.every((v) => v !== null && !Number.isNaN(Number(v)))
  check(
    "progress-circle-tremor: aria-valuenow numérico em todas as instâncias",
    allNumeric,
    `values=${ariaValues.join(",")}`,
  )

  // tremor-id presente.
  const tremorIds = await page
    .locator(
      'section#progress-circle-tremor [data-slot="progress-circle-tremor"][tremor-id="tremor-raw"]',
    )
    .count()
  check(
    "progress-circle-tremor: tremor-id='tremor-raw' presente",
    tremorIds >= 1,
    `tremorIds=${tremorIds}`,
  )

  // Children central (basic: <span>80%</span>) — valida que o slot children
  // foi renderizado dentro do absolute inset-0.
  const centeredText = await page
    .locator('section#progress-circle-tremor [data-slot="progress-circle-tremor"]')
    .first()
    .locator("text=80%")
    .count()
  check(
    "progress-circle-tremor: children '80%' renderizado no centro",
    centeredText >= 1,
    `matches=${centeredText}`,
  )

  // Dark.
  const darkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const darkPage = await darkCtx.newPage()
  await darkPage.addInitScript(() =>
    localStorage.setItem("vitrine-theme", "dark"),
  )
  await darkPage.goto(`${BASE}/components/progress-circle-tremor`, {
    waitUntil: "networkidle",
    timeout: 30000,
  })
  await darkPage.waitForSelector('section#progress-circle-tremor', { timeout: 10000 })
  await darkPage.waitForTimeout(500)
  await shot(darkPage, "progress-circle-tremor-dark", { sub: "tremor-kpi" })
  await ctx.close()
  await darkCtx.close()
}

// ─── 4. callout-tremor ──────────────────────────────────────────────────
{
  const { ctx, page } = await openSlug("callout-tremor")
  await shot(page, "callout-tremor-light", { sub: "tremor-kpi" })

  const slots = await page
    .locator('section#callout-tremor [data-slot="callout-tremor"]')
    .count()
  check(
    "callout-tremor: tem ≥2 instâncias (info+success)",
    slots >= 2,
    `slots=${slots}`,
  )

  // tremor-id presente.
  const tremorIds = await page
    .locator('section#callout-tremor [data-slot="callout-tremor"][tremor-id="tremor-raw"]')
    .count()
  check(
    "callout-tremor: tremor-id='tremor-raw' presente",
    tremorIds >= 1,
    `tremorIds=${tremorIds}`,
  )

  // Título renderizado (texto literal do exemplo info: "Atualização disponível").
  const titleMatches = await page
    .locator('section#callout-tremor [data-slot="callout-tremor"]')
    .getByText("Atualização disponível", { exact: false })
    .count()
  check(
    "callout-tremor: título 'Atualização disponível' presente",
    titleMatches >= 1,
    `matches=${titleMatches}`,
  )

  // 5 variants de cor (default/info/success/warning/error) — uma por
  // instância; verifica se as classes Tailwind aparecem no className.
  const classes = await page.$$eval(
    'section#callout-tremor [data-slot="callout-tremor"]',
    (els) => els.map((e) => e.className).join(" | "),
  )
  const expectedColorClasses = [
    "bg-blue-50", // info / default
    "bg-emerald-50", // success
    "bg-yellow-50", // warning
    "bg-red-50", // error
  ]
  const missing = expectedColorClasses.filter((c) => !classes.includes(c))
  check(
    "callout-tremor: variants info/success/warning/error presentes",
    missing.length === 0,
    missing.length ? `faltando=${missing.join(",")}` : "todas presentes",
  )

  // Ícone lucide renderizado (exemplo info: <Info />).
  const icons = await page
    .locator('section#callout-tremor [data-slot="callout-tremor"] svg')
    .count()
  check(
    "callout-tremor: ícones lucide renderizados",
    icons >= 2,
    `svgs=${icons}`,
  )

  // Dark.
  const darkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const darkPage = await darkCtx.newPage()
  await darkPage.addInitScript(() =>
    localStorage.setItem("vitrine-theme", "dark"),
  )
  await darkPage.goto(`${BASE}/components/callout-tremor`, {
    waitUntil: "networkidle",
    timeout: 30000,
  })
  await darkPage.waitForSelector('section#callout-tremor', { timeout: 10000 })
  await darkPage.waitForTimeout(500)
  await shot(darkPage, "callout-tremor-dark", { sub: "tremor-kpi" })
  await ctx.close()
  await darkCtx.close()
}

await browser.close()

const passed = results.filter((r) => r.pass).length
const total = results.length
const summary = `RESULT ${passed}/${total} checks passaram`
console.log("\n" + summary)
saveJSON("tremor-kpi/val-results", { summary, results, slugs: SLUGS })
saveText(
  "tremor-kpi/val-report.txt",
  summary +
    "\n\n" +
    results
      .map((r) => `${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  — " + r.detail : ""}`)
      .join("\n"),
)
process.exit(passed === total ? 0 : 1)
