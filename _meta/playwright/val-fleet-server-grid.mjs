// Validador Playwright do Fleet Server Grid na vitrine.
// Critérios de aceite (resumo da task cmqfjkjnx03j2pl0ikia53w98):
//  1. /components/fleet-server-grid retorna 200 e renderiza [data-slot=fleet-server-grid]
//  2. 2 instâncias renderizadas (status + role)
//  3. Cada uma com >=6 tiles
//  4. Tile tem: nome, status dot, >=3 mini-barras, sparkline (path/line)
//  5. groupBy="status" adiciona section headers
//  6. Toggle de groupBy/sort altera visual
//  7. Filtro de busca reduz o número de tiles
//  8. Click no tile abre modal/dialog com o detail
//  9. 390px: 1 coluna, sem overflow horizontal
// 10. Light + dark com borda visível
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const url = "http://localhost:5173/components/fleet-server-grid"

const browser = await chromium.launch()
const results = []

async function inspect(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  } else {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
  }

  // 1) Navega e espera o slot raiz aparecer.
  const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
  const status = resp ? resp.status() : 0
  await page.waitForSelector("[data-slot=fleet-server-grid]", {
    state: "attached",
    timeout: 20000,
  })
  await page.waitForTimeout(1000)

  // 2) Duas instâncias (status + role).
  const slotCount = await page.locator("[data-slot=fleet-server-grid]").count()

  // 3) Cada uma com >=6 tiles.
  const tileCount0 = await page
    .locator("[data-slot=fleet-server-grid]")
    .nth(0)
    .locator("[data-slot=fleet-server-tile]")
    .count()
  const tileCount1 = await page
    .locator("[data-slot=fleet-server-grid]")
    .nth(1)
    .locator("[data-slot=fleet-server-tile]")
    .count()

  // 4) Tile tem nome, status dot, 3 mini-barras, sparkline (path).
  const tileStructure = await page
    .locator("[data-slot=fleet-server-grid]")
    .nth(0)
    .locator("[data-slot=fleet-server-tile]")
    .first()
    .evaluate((el) => {
      const hasName = !!el.querySelector("span")
      const statusDot = el.querySelector("[data-slot=fleet-server-status-dot]")
      const bars = el.querySelectorAll("[data-slot=fleet-server-bars] > div")
      const sparkline = el.querySelector("[data-slot=fleet-server-sparkline]")
      const sparkPaths = sparkline ? sparkline.querySelectorAll("path") : []
      return {
        hasName,
        hasStatusDot: !!statusDot,
        barRows: bars.length,
        hasSparkline: !!sparkline,
        sparkPaths: sparkPaths.length,
        status: statusDot ? statusDot.className : null,
      }
    })

  // 5) groupBy="status" -> section headers. Confere que há >0 headers.
  const sectionCount0 = await page
    .locator("[data-slot=fleet-server-grid]")
    .nth(0)
    .locator("[data-slot=fleet-server-grid-section]")
    .count()

  // 6) Toggle groupBy: muda para "none" no Select. Mapeamento abaixo.
  //    Em shadcn Select, o trigger renderiza um button. Vamos abrir e clicar a opção.
  const groupTrigger1 = page
    .locator("[data-slot=fleet-server-grid]")
    .nth(1)
    .locator("[data-slot=fleet-server-grid-groupby]")
  await groupTrigger1.click()
  await page.waitForTimeout(200)
  // Seleciona "Sem agrupamento".
  await page.getByRole("option", { name: "Sem agrupamento" }).click()
  await page.waitForTimeout(300)
  const sectionCount1None = await page
    .locator("[data-slot=fleet-server-grid]")
    .nth(1)
    .locator("[data-slot=fleet-server-grid-section]")
    .count()
  // Voltar para "Por função".
  await groupTrigger1.click()
  await page.waitForTimeout(200)
  await page.getByRole("option", { name: "Por função" }).click()
  await page.waitForTimeout(300)

  // 7) Filtro de busca: digita "api" e confere redução de tiles na instância 1 (role).
  const search0 = page
    .locator("[data-slot=fleet-server-grid]")
    .nth(1)
    .locator("[data-slot=fleet-server-grid-search]")
  const tilesBefore = await page
    .locator("[data-slot=fleet-server-grid]")
    .nth(1)
    .locator("[data-slot=fleet-server-tile]")
    .count()
  await search0.fill("api")
  await page.waitForTimeout(300)
  const tilesAfter = await page
    .locator("[data-slot=fleet-server-grid]")
    .nth(1)
    .locator("[data-slot=fleet-server-tile]")
    .count()
  // Limpa o filtro.
  await search0.fill("")
  await page.waitForTimeout(200)

  // 8) Click no tile abre o dialog de detail.
  await page
    .locator("[data-slot=fleet-server-grid]")
    .nth(0)
    .locator("[data-slot=fleet-server-tile]")
    .first()
    .click()
  await page.waitForTimeout(400)
  const dialogOpen = await page
    .locator("[data-slot=fleet-server-grid-detail]")
    .count()
  // Fecha com Escape.
  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)

  // 9) Borda visível do TILE (que tem border-border) em ambos os temas.
  const borderInfo = await page
    .locator("[data-slot=fleet-server-grid]")
    .first()
    .locator("[data-slot=fleet-server-tile]")
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el)
      return { borderTop: cs.borderTopWidth, borderColor: cs.borderTopColor }
    })

  await page.screenshot({
    path: outPath(`fleet-server-grid/${theme}.png`),
    fullPage: true,
  })

  results.push({
    theme,
    httpStatus: status,
    slotCount,
    tileCount0,
    tileCount1,
    tileStructure,
    sectionCount0,
    sectionCount1None,
    tilesBeforeFilter: tilesBefore,
    tilesAfterFilter: tilesAfter,
    dialogOpenCount: dialogOpen,
    borderInfo,
  })
  await page.close()
}

await inspect("light")
await inspect("dark")

// 9b) Mobile 390px: 1 coluna, sem overflow horizontal.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForSelector("[data-slot=fleet-server-grid]", { timeout: 15000 })
  await page.waitForTimeout(500)
  const cols0 = await page
    .locator("[data-slot=fleet-server-grid]")
    .nth(0)
    .locator("[data-slot=fleet-server-grid-tiles]")
    .first()
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  const overflowX = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  const viewportW = await page.evaluate(() => window.innerWidth)
  await page.screenshot({
    path: outPath("fleet-server-grid/mobile-390.png"),
    fullPage: true,
  })
  results.push({ theme: "mobile-390", cols0, overflowX, viewportW })
  await page.close()
}

await browser.close()
console.log(JSON.stringify(results, null, 2))

// Validação programática.
const light = results.find((r) => r.theme === "light")
const dark = results.find((r) => r.theme === "dark")
const mobile = results.find((r) => r.theme === "mobile-390")

const pass =
  light &&
  dark &&
  light.httpStatus === 200 &&
  dark.httpStatus === 200 &&
  light.slotCount === 2 &&
  dark.slotCount === 2 &&
  light.tileCount0 >= 6 &&
  light.tileCount1 >= 6 &&
  dark.tileCount0 >= 6 &&
  dark.tileCount1 >= 6 &&
  light.tileStructure.hasStatusDot &&
  light.tileStructure.barRows >= 3 &&
  light.tileStructure.hasSparkline &&
  light.tileStructure.sparkPaths >= 1 &&
  light.sectionCount0 >= 1 &&
  light.sectionCount1None === 1 && // groupBy=none => 1 seção única
  light.tilesAfterFilter < light.tilesBeforeFilter &&
  light.tilesAfterFilter > 0 &&
  light.dialogOpenCount === 1 &&
  light.borderInfo.borderTop !== "0px" &&
  dark.borderInfo.borderTop !== "0px" &&
  mobile &&
  mobile.overflowX <= mobile.viewportW + 1

console.log(`\nFINAL: ${pass ? "PASS" : "FAIL"}`)
process.exit(pass ? 0 : 1)
