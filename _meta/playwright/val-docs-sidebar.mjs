// Validação da FASE 4 — hierarquia visual da sidebar de docs.
// CLIENT-SIDE: entra direto numa rota de componente (/components/<slug> sempre
// funciona no dev, só a rota NUA /components colide com components.json).
// Valida em LIGHT e DARK: grupos colapsáveis, aria-expanded, chevron rotate,
// rail (border-l border-border), badge "New", item ativo + auto-expand, busca.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots/docs-sidebar", { recursive: true })

const BASE = "http://localhost:5173"
const SLUG = "3d-card-effect" // família "3d-card" (lote Aceternity → badge New, categoria Layout)

const browser = await chromium.launch()
let failures = 0
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`)
  if (!cond) failures++
}

async function run(theme) {
  console.log(`\n=== THEME: ${theme} ===`)
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  // limpar persistência de colapso pra começar de "tudo expandido"
  await page.addInitScript(() => localStorage.removeItem("vitrine-docs-collapsed"))
  await page.goto(`${BASE}/components/${SLUG}`, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(800)

  // 1. Os 4 grupos como <button aria-expanded aria-controls>
  const headers = await page.$$eval("aside nav button[aria-controls]", (btns) =>
    btns.map((b) => ({
      label: b.querySelector("span")?.textContent?.trim(),
      expanded: b.getAttribute("aria-expanded"),
      controls: b.getAttribute("aria-controls"),
      hasIcon: !!b.querySelector("svg"),
      chevronRotated: (() => {
        const svgs = b.querySelectorAll("svg")
        const chevron = svgs[svgs.length - 1]
        return chevron ? chevron.className.baseVal.includes("rotate-90") : false
      })(),
    })),
  )
  ok(headers.length === 4, `4 grupos colapsáveis (got ${headers.length}): ${headers.map((h) => h.label).join(", ")}`)
  ok(headers.every((h) => h.hasIcon), "todo grupo tem ícone lucide")
  ok(headers.every((h) => h.controls && h.controls.startsWith("docs-group-")), "aria-controls aponta para o ul do grupo")

  // 2. Auto-expand do ativo: categoria do 3d-card-effect = Layout → deve estar aberto
  const layout = headers.find((h) => h.label === "Layout")
  ok(layout?.expanded === "true", "grupo do item ativo (Layout) auto-expandido")
  ok(layout?.chevronRotated === true, "chevron do grupo ativo está rotacionado (rotate-90)")

  // 3. Item ativo com aria-current=page + bg-accent
  const active = await page.$eval(
    'aside nav a[aria-current="page"]',
    (a) => ({
      text: a.textContent.trim(),
      bg: getComputedStyle(a).backgroundColor,
      hasFontMedium: a.className.includes("font-medium"),
    }),
  ).catch(() => null)
  ok(!!active, `item ativo com aria-current="page" (${active?.text ?? "AUSENTE"})`)

  // 4. Rail vertical: o <ul> do grupo expandido tem border-left com cor de token (não transparente)
  const railColor = await page.$eval('aside nav ul[id^="docs-group-"]', (ul) => {
    const s = getComputedStyle(ul)
    return { borderLeftWidth: s.borderLeftWidth, borderLeftColor: s.borderLeftColor }
  }).catch(() => null)
  const railVisible = railColor && parseFloat(railColor.borderLeftWidth) > 0 &&
    !/rgba?\([^)]*,\s*0\)/.test(railColor.borderLeftColor)
  ok(railVisible, `rail visível (border-l): ${JSON.stringify(railColor)}`)

  // 5. Badge "New" presente (família 3D Card Effect é Aceternity)
  const newBadges = await page.$$eval('aside nav a [data-slot="badge"]', (bs) =>
    bs.map((b) => b.textContent.trim()),
  )
  ok(newBadges.includes("New"), `badge "New" presente nas famílias recentes (got ${newBadges.length} badges)`)

  await page.screenshot({ path: `shots/docs-sidebar/${theme}-initial.png`, fullPage: false })

  // 6. Toggle: colapsar o grupo Layout e checar aria-expanded vira false + ul some
  const layoutBtn = page.locator('aside nav button[aria-controls="docs-group-layout"]')
  await layoutBtn.click()
  await page.waitForTimeout(300)
  const afterCollapse = await layoutBtn.getAttribute("aria-expanded")
  ok(afterCollapse === "false", "clicar no cabeçalho colapsa o grupo (aria-expanded=false)")
  const ulGone = await page.$('aside nav ul[id="docs-group-layout"]')
  ok(ulGone === null, "ul do grupo colapsado removido do DOM")
  // reabrir
  await layoutBtn.click()
  await page.waitForTimeout(300)
  ok((await layoutBtn.getAttribute("aria-expanded")) === "true", "reclicar expande de novo")

  // 7. Busca força todos os grupos expandidos
  const search = page.locator('aside nav').locator("xpath=preceding-sibling::*").first()
  const input = page.locator('aside input[type="search"], aside input').first()
  // Primeiro colapsa Layout de novo, depois digita busca → deve reexpandir
  await layoutBtn.click()
  await page.waitForTimeout(200)
  await input.fill("card")
  await page.waitForTimeout(400)
  const expandedDuringSearch = await page.$$eval("aside nav button[aria-controls]", (btns) =>
    btns.every((b) => b.getAttribute("aria-expanded") === "true"),
  )
  ok(expandedDuringSearch, "busca (query não-vazia) força TODOS os grupos expandidos")
  await input.fill("")
  await page.waitForTimeout(300)
  void search

  await ctx.close()
}

await run("light")
await run("dark")

// 8. Drawer mobile (~375px): abre, mostra grupos colapsáveis, fecha ao navegar
console.log("\n=== DRAWER MOBILE (375px) ===")
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } })
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.removeItem("vitrine-docs-collapsed"))
  await page.goto(`${BASE}/components/${SLUG}`, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(600)
  await page.click('button[aria-label="Abrir navegação de componentes"]')
  await page.waitForTimeout(500)
  const drawerHeaders = await page.$$eval('[role="dialog"] nav button[aria-controls]', (btns) =>
    btns.map((b) => ({ label: b.querySelector("span")?.textContent?.trim(), expanded: b.getAttribute("aria-expanded"), hasIcon: !!b.querySelector("svg") })),
  )
  ok(drawerHeaders.length === 4, `drawer tem 4 grupos colapsáveis (got ${drawerHeaders.length})`)
  ok(drawerHeaders.every((h) => h.hasIcon), "grupos do drawer têm ícone")
  await page.screenshot({ path: "shots/docs-sidebar/drawer-mobile.png", fullPage: false })
  // navegar fecha o drawer
  await page.click('[role="dialog"] nav a[aria-current="page"]')
  await page.waitForTimeout(500)
  const drawerClosed = (await page.$('[role="dialog"]')) === null
  ok(drawerClosed, "drawer fecha ao navegar (onNavigate)")
  await ctx.close()
}

await browser.close()
console.log(`\n${failures === 0 ? "ALL PASS ✓" : `${failures} FAILURE(S) ✗`}`)
process.exit(failures === 0 ? 0 : 1)
