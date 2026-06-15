// Validador da componente db-schema-explorer (vitrine).
//
// Critérios:
//   - 2 instâncias em /components/db-schema-explorer (light + dark quando na página)
//   - Cada instância tem data-slot="db-schema-explorer"
//   - Cada uma: árvore (left) + painel de detalhe (right)
//   - Header com engine chip + host:port + version + size
//   - Toolbar: search + expand all/collapse all + toggle "Só com FK"
//   - Expandir/click em tabela → detalhe troca
//   - 4 abas: Columns / Indexes / Foreign keys / DDL
//   - Busca filtra em tempo real
//   - 390px: layout não overflow horizontal
//
// Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-db-schema-explorer.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON, outPath } from "./_shots.mjs"

const URL = "http://localhost:6180/components/db-schema-explorer"
const report = { light: {}, dark: {}, responsive: {}, interactivity: {} }

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

async function inspect(page) {
  return page.evaluate(() => {
    const roots = Array.from(
      document.querySelectorAll("[data-slot='db-schema-explorer']"),
    )
    return roots.map((root) => {
      const tree = root.querySelector("[data-slot='db-schema-explorer-tree']")
      const detail = root.querySelector("[data-slot='db-schema-explorer-detail']")
      const header = root.querySelector("[data-slot='db-schema-explorer-header']")
      const engineChip = root.querySelector(
        "[data-slot='db-schema-explorer-engine-chip']",
      )
      const toolbar = root.querySelector(
        "[data-slot='db-schema-explorer-toolbar']",
      )
      const search = root.querySelector(
        "[data-slot='db-schema-explorer-search']",
      )
      const onlyFk = root.querySelector(
        "[data-slot='db-schema-explorer-only-fk']",
      )
      const tableRows = root.querySelectorAll(
        "[data-slot='db-schema-explorer-row'][data-level='2']",
      )
      const schemaRows = root.querySelectorAll(
        "[data-slot='db-schema-explorer-row'][data-level='1']",
      )
      const dbRow = root.querySelector(
        "[data-slot='db-schema-explorer-row'][data-level='0']",
      )
      const cssCard = getComputedStyle(document.documentElement)
        .getPropertyValue("--card")
        .trim()
      const r = root.getBoundingClientRect()
      const cs = getComputedStyle(root)
      return {
        hasRoot: true,
        engine: root.getAttribute("data-engine"),
        rect: { w: Math.round(r.width), h: Math.round(r.height) },
        borderWidth: cs.borderTopWidth,
        borderColor: cs.borderTopColor,
        bg: cs.backgroundColor,
        hasTree: !!tree,
        hasDetail: !!detail,
        hasHeader: !!header,
        hasEngineChip: !!engineChip,
        engineChipText: engineChip?.textContent?.trim() ?? null,
        hasToolbar: !!toolbar,
        hasSearch: !!search,
        hasOnlyFk: !!onlyFk,
        hasDbRow: !!dbRow,
        schemaRows: schemaRows.length,
        tableRows: tableRows.length,
        cssCard,
        // selected row
        selectedRow: root.querySelector(
          "[data-slot='db-schema-explorer-row'][data-selected='true']",
        )?.textContent?.trim()?.slice(0, 60) ?? null,
        // tabs
        tabs: Array.from(
          root.querySelectorAll(
            "[role='tab']:not([role='tablist'] [role='tab'] *)",
          ),
        )
          .filter((t) => root.contains(t))
          .map((t) => t.textContent?.trim())
          .filter((t) => t && t.length < 40),
        // column count in current detail
        columnRows: root.querySelectorAll(
          "[data-slot='db-schema-explorer-column']",
        ).length,
        indexRows: root.querySelectorAll(
          "[data-slot='db-schema-explorer-index']",
        ).length,
        fkRows: root.querySelectorAll(
          "[data-slot='db-schema-explorer-fk']",
        ).length,
        fkLinks: root.querySelectorAll(
          "[data-slot='db-schema-explorer-fk-link']",
        ).length,
        ddl: root.querySelector("[data-slot='db-schema-explorer-ddl']")?.textContent
          ?.trim()
          ?.slice(0, 80) ?? null,
      }
    })
  })
}

async function run() {
  const browser = await chromium.launch()
  try {
    // 1) Light + dark
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      await setTheme(page, theme)
      await page.goto(URL, { waitUntil: "domcontentloaded" })
      await page.waitForSelector("[data-slot='db-schema-explorer']", {
        timeout: 15000,
      })
      await page.waitForTimeout(1200)
      report[theme] = await inspect(page)
      await shot(page, `db-schema-explorer-${theme}`, { sub: "db-schema-explorer" })
      await page.screenshot({
        path: outPath(`db-schema-explorer/full-${theme}.png`),
        animations: "disabled",
      })
      await page.close()
    }

    // 2) Interactivity: click a table in the first instance, then click an FK link
    {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      await setTheme(page, "light")
      await page.goto(URL, { waitUntil: "domcontentloaded" })
      await page.waitForSelector("[data-slot='db-schema-explorer']", {
        timeout: 15000,
      })
      await page.waitForTimeout(800)

      const firstExplorer = page.locator("[data-slot='db-schema-explorer']").first()

      // pick a row in the 1st explorer, click, then verify it becomes selected
      const firstTable = firstExplorer.locator(
        "[data-slot='db-schema-explorer-row'][data-level='2']",
      )
      const tablesAvailable = await firstTable.count()
      let clickOk = false
      if (tablesAvailable > 0) {
        // prefer a row that visibly has an FK (highlight badge "N FK").
        // fallback: click the 2nd table (iam.users) which always has FKs.
        let targetIdx = 1
        for (let i = 0; i < tablesAvailable; i++) {
          const text = await firstTable.nth(i).textContent()
          if (/\d+\s*FK/.test(text ?? "")) {
            targetIdx = i
            break
          }
        }
        await firstTable.nth(targetIdx).click()
        await page.waitForTimeout(300)
        const selectedAfter = await firstExplorer
          .locator(
            "[data-slot='db-schema-explorer-row'][data-selected='true']",
          )
          .first()
          .textContent()
        clickOk = !!selectedAfter
      }

      // search filter
      const search = firstExplorer.locator(
        "[data-slot='db-schema-explorer-search']",
      )
      await search.fill("users")
      await page.waitForTimeout(400)
      const tablesAfterSearch = await firstExplorer
        .locator("[data-slot='db-schema-explorer-row'][data-level='2']")
        .count()
      await search.fill("") // clear
      await page.waitForTimeout(300)

      // switch to FK tab
      const fkTab = firstExplorer.locator("[role='tab']").nth(2)
      await fkTab.click()
      // Wait for the FK tab content to actually render (Radix may defer)
      try {
        await firstExplorer
          .locator("[data-slot='db-schema-explorer-fk-link']")
          .first()
          .waitFor({ state: "visible", timeout: 5000 })
      } catch {
        // no FK links — table has no foreign keys
      }
      const fkLinks = await firstExplorer
        .locator("[data-slot='db-schema-explorer-fk-link']")
        .count()

      // jump via FK link (if any)
      let jumpOk = false
      if (fkLinks > 0) {
        await firstExplorer
          .locator("[data-slot='db-schema-explorer-fk-link']")
          .first()
          .click()
        await page.waitForTimeout(500)
        const newSelected = await firstExplorer
          .locator(
            "[data-slot='db-schema-explorer-row'][data-selected='true']",
          )
          .first()
          .getAttribute("data-level")
        jumpOk = newSelected === "2"
      }

      report.interactivity = {
        tableRowsBefore: tablesAvailable,
        clickOk,
        tablesAfterSearch,
        fkLinks,
        jumpOk,
      }

      await page.close()
    }

    // 3) Mobile 390px
    {
      const mob = await browser.newPage({ viewport: { width: 390, height: 780 } })
      await setTheme(mob, "light")
      await mob.goto(URL, { waitUntil: "domcontentloaded" })
      await mob.waitForSelector("[data-slot='db-schema-explorer']", {
        timeout: 15000,
      })
      await mob.waitForTimeout(1000)
      const overflow = await mob.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        hasTableRows: document.querySelectorAll(
          "[data-slot='db-schema-explorer'] [data-slot='db-schema-explorer-row'][data-level='2']",
        ).length,
      }))
      report.responsive = {
        ...overflow,
        noHorizontalOverflow: overflow.scrollW <= overflow.clientW + 1,
      }
      await mob.screenshot({
        path: outPath("db-schema-explorer/mobile-390.png"),
        animations: "disabled",
      })
      await mob.close()
    }
  } finally {
    await browser.close()
  }

  saveJSON("db-schema-explorer/report", report)

  const checks = []
  const push = (name, ok, detail) => checks.push({ name, ok, detail })

  for (const theme of ["light", "dark"]) {
    const r = report[theme]
    push(
      `[${theme}] >=1 instância renderizada`,
      r.length >= 1,
      `n=${r.length}`,
    )
    push(
      `[${theme}] rect w>0 e h>0`,
      r[0]?.rect.w > 0 && r[0]?.rect.h > 0,
      r[0]?.rect ? `${r[0].rect.w}x${r[0].rect.h}` : "n/a",
    )
    push(
      `[${theme}] engine = postgresql`,
      r[0]?.engine === "postgresql",
      r[0]?.engine,
    )
    push(
      `[${theme}] engine chip presente`,
      !!r[0]?.hasEngineChip && /PostgreSQL/i.test(r[0]?.engineChipText ?? ""),
      r[0]?.engineChipText,
    )
    push(
      `[${theme}] árvore + detalhe + header + toolbar`,
      r[0]?.hasTree && r[0]?.hasDetail && r[0]?.hasHeader && r[0]?.hasToolbar,
      `tree=${r[0]?.hasTree} detail=${r[0]?.hasDetail} header=${r[0]?.hasHeader} toolbar=${r[0]?.hasToolbar}`,
    )
    push(
      `[${theme}] busca + toggle FK presentes`,
      r[0]?.hasSearch && r[0]?.hasOnlyFk,
      `search=${r[0]?.hasSearch} onlyFk=${r[0]?.hasOnlyFk}`,
    )
    push(
      `[${theme}] >=5 schemas`,
      (r[0]?.schemaRows ?? 0) >= 5,
      r[0]?.schemaRows,
    )
    push(
      `[${theme}] >=12 tabelas`,
      (r[0]?.tableRows ?? 0) >= 12,
      r[0]?.tableRows,
    )
    push(
      `[${theme}] 4 abas (Colunas/Índices/FKs/DDL)`,
      (r[0]?.tabs.length ?? 0) >= 4,
      (r[0]?.tabs ?? []).join(" | "),
    )
    push(
      `[${theme}] coluna inicial tem >=3 colunas`,
      (r[0]?.columnRows ?? 0) >= 3,
      r[0]?.columnRows,
    )
    push(
      `[${theme}] borda visível (w>0)`,
      parseFloat(r[0]?.borderWidth ?? "0") > 0,
      `${r[0]?.borderWidth} ${r[0]?.borderColor}`,
    )
  }

  // Interactivity
  const itx = report.interactivity
  push(
    "click em tabela → selecionada",
    itx.clickOk === true,
    `tables=${itx.tableRowsBefore} selected=${itx.clickOk}`,
  )
  push(
    "busca 'users' filtra para >=1 e <todas as tabelas",
    (itx.tablesAfterSearch ?? 0) >= 1 && (itx.tablesAfterSearch ?? 0) < (itx.tableRowsBefore ?? 0),
    `${itx.tablesAfterSearch}/${itx.tableRowsBefore}`,
  )
  push(
    "aba Foreign keys renderiza links",
    (itx.fkLinks ?? 0) >= 1,
    `fkLinks=${itx.fkLinks}`,
  )
  push(
    "click em FK link → pula para tabela alvo",
    itx.jumpOk === true,
    `jumpOk=${itx.jumpOk}`,
  )

  // Responsive
  push(
    "390px sem overflow horizontal",
    report.responsive.noHorizontalOverflow,
    `${report.responsive.scrollW}/${report.responsive.clientW}`,
  )
  push(
    "390px árvore tem >=1 tabela visível",
    (report.responsive.hasTableRows ?? 0) >= 1,
    report.responsive.hasTableRows,
  )

  console.log("\n=== RESULTADO ===")
  for (const c of checks) {
    console.log(`${c.ok ? "✓" : "✗"} ${c.name} (${c.detail})`)
  }
  const failed = checks.filter((c) => !c.ok)
  console.log(`\n${checks.length - failed.length}/${checks.length} OK`)
  if (failed.length > 0) process.exitCode = 1
}

run()
