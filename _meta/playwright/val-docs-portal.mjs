// Validador da composição docs-portal (Portal de Documentação + Mapa React Flow).
//
// Cobre: a vista "Doc" monta normalmente; o toggle "Mapa" troca o conteúdo
// central por um canvas React Flow (>= 1 raiz + 3 grupos + 6 páginas, edges,
// Controls + MiniMap), com nós tematizados (bg + borda visível). PROVA DA
// NAVEGAÇÃO: clicar num nó de página volta para a vista doc e o <h1> da doc
// corresponde ao título do nó clicado. Light + dark + 390px sem overflow.
// Output em _meta/scratch/shots/docs-portal.
//
// Uso: node _meta/playwright/val-docs-portal.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON, outPath } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/docs-portal"
const report = { light: {}, dark: {}, responsive: {}, navigation: {} }

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

async function openMap(page) {
  // Botão "Mapa" no toggle (>= sm). Em 390px é o botão de ícone.
  const tab = page.getByRole("tab", { name: /Mapa/i })
  if (await tab.count()) {
    await tab.first().click()
  } else {
    await page
      .getByRole("button", { name: /Ver mapa da documentação/i })
      .click()
  }
  await page.waitForSelector(".react-flow__node", { timeout: 15000 })
  await page.waitForTimeout(700)
}

async function inspectMap(page) {
  return page.evaluate(() => {
    const flow = document.querySelector("[data-slot='react-flow']")
    const rect = flow?.getBoundingClientRect()
    const root = document.querySelector("[data-slot='docmap-node'][data-kind='root']")
    const groups = document.querySelectorAll("[data-slot='docmap-node'][data-kind='group']")
    const pages = document.querySelectorAll("[data-slot='docmap-node'][data-kind='page']")
    const activePage = document.querySelector("[data-slot='docmap-node'][data-kind='page'][data-active='true']")
    const nodeEls = document.querySelectorAll(".react-flow__node")
    const edgeEls = document.querySelectorAll(".react-flow__edge")
    const controls = document.querySelector(".react-flow__controls")
    const minimap = document.querySelector(".react-flow__minimap")
    const cs = (el) => (el ? getComputedStyle(el) : null)
    const ps = cs(pages[0])
    return {
      flowHeight: rect ? Math.round(rect.height) : 0,
      hasRoot: !!root,
      groups: groups.length,
      pages: pages.length,
      hasActivePage: !!activePage,
      nodes: nodeEls.length,
      edges: edgeEls.length,
      hasControls: !!controls,
      hasMiniMap: !!minimap,
      pageBg: ps ? ps.backgroundColor : null,
      pageBorderW: ps ? ps.borderTopWidth : null,
      pageBorderC: ps ? ps.borderTopColor : null,
    }
  })
}

async function run() {
  const browser = await chromium.launch()
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      await setTheme(page, theme)
      await page.goto(URL, { waitUntil: "domcontentloaded" })
      await page.waitForSelector("[data-slot='docs-portal']", { timeout: 15000 })
      await page.waitForTimeout(500)
      // A vista doc monta (h1 presente)
      const docTitle = await page.evaluate(() => {
        const h1 = document.querySelector("[data-slot='docs-portal'] h1")
        return h1 ? h1.textContent.trim() : null
      })
      await openMap(page)
      const map = await inspectMap(page)
      report[theme] = { docTitle, ...map }
      await shot(page, `docs-portal-map-${theme}`, { sub: "docs-portal" })
      await page.close()
    }

    // Responsivo 390px (light): abre mapa e checa overflow
    const mob = await browser.newPage({ viewport: { width: 390, height: 780 } })
    await setTheme(mob, "light")
    await mob.goto(URL, { waitUntil: "domcontentloaded" })
    await mob.waitForSelector("[data-slot='docs-portal']", { timeout: 15000 })
    await mob.waitForTimeout(400)
    await openMap(mob)
    const overflow = await mob.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    report.responsive = {
      ...overflow,
      noHorizontalOverflow: overflow.scrollW <= overflow.clientW + 1,
    }
    await mob.screenshot({
      path: outPath("docs-portal/mobile-390.png"),
      animations: "disabled",
    })
    await mob.close()

    // PROVA DA NAVEGAÇÃO: abre o mapa, clica num nó de página específico,
    // confirma que voltou para a vista doc e o <h1> bate com o título clicado.
    const nav = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await setTheme(nav, "light")
    await nav.goto(URL, { waitUntil: "domcontentloaded" })
    await nav.waitForSelector("[data-slot='docs-portal']", { timeout: 15000 })
    await nav.waitForTimeout(400)
    await openMap(nav)
    // escolhe um nó de página que NÃO seja a página ativa atual (Introdução)
    const target = await nav.evaluate(() => {
      const pages = Array.from(
        document.querySelectorAll("[data-slot='docmap-node'][data-kind='page']"),
      )
      const node = pages.find((p) => p.getAttribute("data-active") !== "true")
      const title = node?.querySelector("p")?.textContent?.trim() ?? null
      return { title }
    })
    // clica no nó pelo título
    await nav
      .locator("[data-slot='docmap-node'][data-kind='page']", {
        hasText: target.title,
      })
      .first()
      .click()
    await nav.waitForTimeout(600)
    const afterClick = await nav.evaluate(() => {
      const flow = document.querySelector("[data-slot='react-flow']")
      const h1 = document.querySelector("[data-slot='docs-portal'] article h1")
      return {
        mapStillVisible: !!flow,
        docTitle: h1 ? h1.textContent.trim() : null,
      }
    })
    report.navigation = {
      clickedTitle: target.title,
      backToDoc: !afterClick.mapStillVisible,
      docTitle: afterClick.docTitle,
      matched: afterClick.docTitle === target.title,
    }
    await nav.screenshot({
      path: outPath("docs-portal/after-nav.png"),
      animations: "disabled",
    })
    await nav.close()
  } finally {
    await browser.close()
  }

  saveJSON("docs-portal/report", report)

  const checks = []
  const push = (name, ok, detail) => checks.push({ name, ok, detail })
  for (const theme of ["light", "dark"]) {
    const r = report[theme]
    push(`[${theme}] vista doc monta (h1)`, !!r.docTitle, r.docTitle)
    push(`[${theme}] mapa flow altura>0`, r.flowHeight > 0, r.flowHeight)
    push(`[${theme}] raiz presente`, r.hasRoot, r.hasRoot)
    push(`[${theme}] >=3 grupos`, r.groups >= 3, r.groups)
    push(`[${theme}] >=6 páginas`, r.pages >= 6, r.pages)
    push(`[${theme}] página ativa destacada`, r.hasActivePage, r.hasActivePage)
    push(`[${theme}] edges presentes`, r.edges >= 9, r.edges)
    push(`[${theme}] Controls + MiniMap`, r.hasControls && r.hasMiniMap, `${r.hasControls}/${r.hasMiniMap}`)
    push(`[${theme}] nó-página bg tematizado`, !!r.pageBg, r.pageBg)
    push(
      `[${theme}] nó-página borda visível`,
      !!r.pageBorderW && parseFloat(r.pageBorderW) > 0,
      `${r.pageBorderW} ${r.pageBorderC}`,
    )
  }
  push(
    "390px sem overflow horizontal",
    report.responsive.noHorizontalOverflow,
    `${report.responsive.scrollW}/${report.responsive.clientW}`,
  )
  push(
    "navegação: clique no nó volta p/ doc",
    report.navigation.backToDoc === true,
    report.navigation.backToDoc,
  )
  push(
    "navegação: título da doc bate com o nó clicado",
    report.navigation.matched === true,
    `clicado="${report.navigation.clickedTitle}" doc="${report.navigation.docTitle}"`,
  )

  console.log("\n=== RESULTADO docs-portal ===")
  for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name} (${c.detail})`)
  const failed = checks.filter((c) => !c.ok)
  console.log(`\n${checks.length - failed.length}/${checks.length} OK`)
  if (failed.length > 0) process.exitCode = 1
}

run()
