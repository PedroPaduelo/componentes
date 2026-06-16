// Validador do ErrorTrackerFeed (Observability Center / Pulse).
//
// O validador roda contra o `vite preview` (build de produção) na 4173 —
// reflete o que usuários reais veem. Em worktree compartilhada o dev
// server pode estar servindo FS de outro worktree (cache do Vite); preview
// sempre reflete o build atual.
const PREVIEW_URL = process.env.VITRINE_URL || "http://localhost:4173"
const FEED_URL = `${PREVIEW_URL}/components/error-tracker-feed`

import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { SHOTS_DIR } from "./_shots.mjs"

const SUB = "error-tracker-feed"
mkdirSync(join(SHOTS_DIR, SUB), { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const failures = []
const log = (label, ok, detail = "") => {
  const tag = ok ? "✓" : "✗"
  console.log(`${tag} ${label}${detail ? ` — ${detail}` : ""}`)
  if (!ok) failures.push(label)
}

/* ------------------------------------------------------------------ */
/*  Navegação robusta (gotcha /components vs components.json)          */
/* ------------------------------------------------------------------ */

async function gotoFeed() {
  // Tentativa 1: goto direto
  const resp = await page
    .goto(FEED_URL, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    })
    .catch(() => null)
  if (resp && resp.status() === 200) {
    // Vite serve HTML mas pode estar mostrando a página index vazia
    // (gotcha components.json) — verifica se o React montou
    await page.waitForTimeout(800)
    const slotCount = await page.locator("[data-slot=error-tracker-feed]").count()
    if (slotCount > 0) return resp
  }
  // Tentativa 2: navega pela Home e clica
  await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.waitForTimeout(1200)
  // Procura por link que aponta pro slug
  const link = page
    .locator('a[href*="error-tracker-feed"]')
    .first()
  if ((await link.count()) > 0) {
    await link.click({ timeout: 5000 })
  } else {
    // Fallback: navega via history API (mesma origin)
    await page.evaluate(() => {
      window.history.pushState({}, "", "/components/error-tracker-feed")
      window.dispatchEvent(new PopStateEvent("popstate"))
    })
  }
  await page.waitForSelector("[data-slot=error-tracker-feed]", { timeout: 10000 })
  return null
}

await gotoFeed()
await page.waitForTimeout(500)

/* ------------------------------------------------------------------ */
/*  1) ≥2 instâncias                                                  */
/* ------------------------------------------------------------------ */

const instances = await page.locator("[data-slot=error-tracker-feed]").count()
log("instâncias renderizadas (≥2)", instances >= 2, `count=${instances}`)

/* ------------------------------------------------------------------ */
/*  2) Header — totalizadores                                         */
/* ------------------------------------------------------------------ */

const totalChip = (await page
  .locator("[data-slot=etf-total]")
  .first()
  .innerText()
  .catch(() => "")) || ""
const groupsChip = (await page
  .locator('[data-slot=error-tracker-feed]')
  .first()
  .locator("text=/\\d+\\s*grupos/")
  .first()
  .innerText()
  .catch(() => "")) || ""
const envsChip = (await page
  .locator('[data-slot=error-tracker-feed]')
  .first()
  .locator("text=/\\d+\\s*ambientes/")
  .first()
  .innerText()
  .catch(() => "")) || ""
log(
  "header com totalizadores",
  /12/.test(totalChip) && /grupos/.test(groupsChip) && /ambientes/.test(envsChip),
  `total="${totalChip.replace(/\s+/g, " ").trim().slice(0, 50)}" | groups="${groupsChip.trim()}" | envs="${envsChip.trim()}"`,
)

/* ------------------------------------------------------------------ */
/*  3) Cores de ambiente (rose/amber/sky)                              */
/* ------------------------------------------------------------------ */

const envColors = await page.evaluate(() => {
  const envs = ["prod", "staging", "dev"]
  const out = {}
  for (const env of envs) {
    const chips = document.querySelectorAll(
      `[data-slot="etf-env"][data-env="${env}"]`,
    )
    if (chips.length === 0) {
      out[env] = null
      continue
    }
    // Pega o chip do PRIMEIRO feed (12 erros) e mede o background-color
    // da bolinha (.size-1.5.rounded-full dentro)
    const chip = chips[0]
    const dot = chip.querySelector("span")
    if (!dot) {
      out[env] = null
      continue
    }
    const cs = getComputedStyle(dot)
    out[env] = { bg: cs.backgroundColor, cls: chip.className.match(/text-\S+/g) }
  }
  return out
})
const expected = {
  prod: { hasRose: /oklch\(0\.6[0-9]+ 0\.[12][0-9]+ (1[0-9]|[0-9])\./.test(envColors.prod?.bg || "") },
  staging: { hasAmber: /oklch\(0\.[78][0-9]+ 0\.[12][0-9]+ [67][0-9]/.test(envColors.staging?.bg || "") },
  dev: { hasSky: /oklch\(0\.[67][0-9]+ 0\.[12][0-9]+ 23[0-9]/.test(envColors.dev?.bg || "") },
}
log(
  "cor prod = rose",
  expected.prod.hasRose,
  JSON.stringify(envColors.prod),
)
log(
  "cor staging = amber",
  expected.staging.hasAmber,
  JSON.stringify(envColors.staging),
)
log(
  "cor dev = sky",
  expected.dev.hasSky,
  JSON.stringify(envColors.dev),
)

/* ------------------------------------------------------------------ */
/*  4) Filtro de ambiente (prod) reduz a lista                         */
/* ------------------------------------------------------------------ */

// Pega o feed1 (não filtrado)
const feed1 = page.locator("[data-slot=error-tracker-feed]").first()
const beforeRows = await feed1.locator("[data-slot=etf-row]").count()

// Toggle prod no PRIMEIRO feed
await feed1
  .locator('[data-slot="etf-env-toggle"][data-env="prod"]')
  .click()
await page.waitForTimeout(300)

const afterRows = await feed1.locator("[data-slot=etf-row]").count()
const allAreProd = await feed1.evaluate(() => {
  const rows = document.querySelectorAll(
    '[data-slot="error-tracker-feed"]:first-of-type [data-slot="etf-row"]',
  )
  return Array.from(rows).every((r) => r.getAttribute("data-env") === "prod")
})
log(
  "filtro prod reduz lista (rows < total)",
  afterRows > 0 && afterRows < beforeRows,
  `${beforeRows}→${afterRows}`,
)
log(
  "filtro prod só mostra itens prod",
  allAreProd,
  `${afterRows} rows; allProd=${allAreProd}`,
)

// Adiciona filtro status=new e valida interseção
await feed1
  .locator('[data-slot="etf-status-toggle"][data-status="new"]')
  .click()
await page.waitForTimeout(300)
const newRows = await feed1.locator("[data-slot=etf-row]").count()
const allAreProdAndNew = await feed1.evaluate(() => {
  const rows = document.querySelectorAll(
    '[data-slot="error-tracker-feed"]:first-of-type [data-slot="etf-row"]',
  )
  return (
    rows.length > 0 &&
    Array.from(rows).every(
      (r) =>
        r.getAttribute("data-env") === "prod" &&
        r.getAttribute("data-status") === "new",
    )
  )
})
log(
  "filtro prod+new aplicado (rows < newRows-prod, intersecção)",
  newRows > 0 && newRows <= afterRows && allAreProdAndNew,
  `prodOnly=${afterRows} → prod+new=${newRows}, allProdAndNew=${allAreProdAndNew}`,
)

// Limpa filtros e confere volta ao total
const resetBtn = feed1.locator('button:has-text("Limpar filtros")')
if ((await resetBtn.count()) > 0) {
  await resetBtn.click()
  await page.waitForTimeout(300)
  const resetRows = await feed1.locator("[data-slot=etf-row]").count()
  log(
    "limpar filtros restaura lista",
    resetRows === beforeRows,
    `${beforeRows}→${resetRows}`,
  )
} else {
  log("limpar filtros restaura lista", false, "botão não encontrado")
}

/* ------------------------------------------------------------------ */
/*  5) Screenshots light                                                */
/* ------------------------------------------------------------------ */

await page.screenshot({ path: join(SHOTS_DIR, SUB, "light-full.png"), fullPage: false })
console.log(`✓ ${join(SHOTS_DIR, SUB, "light-full.png")}`)

/* ------------------------------------------------------------------ */
/*  6) Dark mode                                                       */
/* ------------------------------------------------------------------ */

await page.evaluate(() => localStorage.setItem("vitrine-theme", "dark"))
await page.reload({ waitUntil: "domcontentloaded" })
await page.waitForSelector("[data-slot=error-tracker-feed]", { timeout: 8000 })
await page.waitForTimeout(500)
const darkInstances = await page.locator("[data-slot=error-tracker-feed]").count()
log("instâncias em dark", darkInstances >= 2, `count=${darkInstances}`)

// Confere que em dark o body tem data-theme=dark e as cores mudaram
const darkBg = await page.evaluate(() => {
  const first = document.querySelector("[data-slot=error-tracker-feed]")
  return first ? getComputedStyle(first).backgroundColor : null
})
log(
  "dark: background do feed é escuro",
  /oklch\(0\.|rgb\((\d|1\d|2\d|3\d),\s*\d+,\s*\d+\)/.test(darkBg || "") &&
    !/oklch\(1\s/.test(darkBg || ""),
  darkBg,
)

await page.screenshot({ path: join(SHOTS_DIR, SUB, "dark-full.png"), fullPage: false })

// Aplica filtro prod em dark e screenshot
await page
  .locator("[data-slot=error-tracker-feed]")
  .first()
  .locator('[data-slot="etf-env-toggle"][data-env="prod"]')
  .click()
await page.waitForTimeout(400)
await page.screenshot({ path: join(SHOTS_DIR, SUB, "dark-prod-filtered.png"), fullPage: false })

/* ------------------------------------------------------------------ */
/*  7) Responsivo 390px                                                */
/* ------------------------------------------------------------------ */

await page.setViewportSize({ width: 390, height: 844 })
await page.evaluate(() => localStorage.setItem("vitrine-theme", "light"))
await page.reload({ waitUntil: "domcontentloaded" })
await page.waitForSelector("[data-slot=error-tracker-feed]", { timeout: 8000 })
await page.waitForTimeout(500)

const overflows = await page.evaluate(() => {
  const feeds = document.querySelectorAll("[data-slot=error-tracker-feed]")
  return Array.from(feeds).map((f) => {
    const r = f.getBoundingClientRect()
    return { w: Math.round(r.width), scrollW: f.scrollWidth, hasOverflow: f.scrollWidth > f.clientWidth + 2 }
  })
})
const hasHorizontalOverflow = overflows.some((o) => o.hasOverflow)
log(
  "390px sem overflow horizontal",
  !hasHorizontalOverflow,
  JSON.stringify(overflows),
)
await page.screenshot({ path: join(SHOTS_DIR, SUB, "mobile-390.png"), fullPage: false })

/* ------------------------------------------------------------------ */
/*  Resultado final                                                    */
/* ------------------------------------------------------------------ */

const inspect = {
  total: instances,
  beforeRows,
  afterProd: afterRows,
  afterProdAndNew: newRows,
  envColors,
  darkBg,
  overflows,
}
writeFileSync(
  join(SHOTS_DIR, SUB, "inspect.json"),
  JSON.stringify(inspect, null, 2),
)
console.log(`\n${failures.length === 0 ? "✓ PASS" : `✗ FAIL (${failures.length})`}`)
if (failures.length > 0) {
  console.log("Falhas:", failures)
}

await browser.close()
process.exit(failures.length === 0 ? 0 : 1)
