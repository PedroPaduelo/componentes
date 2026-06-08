// Validação Playwright da Task B (catálogo por família + página de família).
// Roda contra o dev server em http://localhost:5173.
import { chromium } from "playwright"

const BASE = "http://localhost:5173"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

let failures = 0
function check(label, cond, extra = "") {
  const ok = !!cond
  if (!ok) failures++
  console.log(`${ok ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`)
}

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(400)
}

// 1. Home: 43 cards
{
  const page = await ctx.newPage()
  await goto(page, "/")
  const count = await page.locator("[data-slot=family-card]").count()
  check("Home tem 43 family-cards", count === 43, `count=${count}`)
  const bases = await page.$$eval("[data-slot=family-card]", (els) =>
    els.map((e) => e.getAttribute("data-family-base"))
  )
  const unique = new Set(bases)
  check("data-family-base únicos", unique.size === bases.length, `${unique.size}/${bases.length}`)
  await page.close()
}

// 2. Busca por "button-fluid" traz a família Button
{
  const page = await ctx.newPage()
  await goto(page, "/")
  await page.fill("input[role=searchbox]", "button-fluid")
  await page.waitForTimeout(300)
  const bases = await page.$$eval("[data-slot=family-card]", (els) =>
    els.map((e) => e.getAttribute("data-family-base"))
  )
  check("Busca 'button-fluid' acha família Button", bases.includes("button"), bases.join(","))
  await page.close()
}

// 3. Busca por "fluid" traz várias famílias com variante Fluid
{
  const page = await ctx.newPage()
  await goto(page, "/")
  await page.fill("input[role=searchbox]", "fluid")
  await page.waitForTimeout(300)
  const count = await page.locator("[data-slot=family-card]").count()
  check("Busca 'fluid' traz >= 7 famílias", count >= 7, `count=${count}`)
  await page.close()
}

// 4. /components/button: 2 seções, 2 abas, badges shadcn + Fluid
{
  const page = await ctx.newPage()
  await goto(page, "/components/button")
  const sec1 = await page.locator("#button").count()
  const sec2 = await page.locator("#button-fluid").count()
  check("/components/button tem seção #button", sec1 === 1)
  check("/components/button tem seção #button-fluid", sec2 === 1)
  const tabs = await page.locator('nav[aria-label="Variantes da família"] [role=tab]').count()
  check("/components/button tem 2 abas", tabs === 2, `tabs=${tabs}`)
  const origins = await page.$$eval("[data-slot=origin-badge]", (els) =>
    els.map((e) => e.getAttribute("data-origin"))
  )
  check("badge shadcn presente", origins.includes("shadcn"))
  check("badge Fluid presente", origins.includes("Fluid"), origins.join(","))
  await page.close()
}

// 5. /components/tabs: 3 seções, 3 abas
{
  const page = await ctx.newPage()
  await goto(page, "/components/tabs")
  const ids = ["tabs", "tabs-subtle-fluid", "tabs-fluid"]
  let present = 0
  for (const id of ids) present += await page.locator(`[id="${id}"]`).count()
  check("/components/tabs tem 3 seções", present === 3, `present=${present}`)
  const tabs = await page.locator('nav[aria-label="Variantes da família"] [role=tab]').count()
  check("/components/tabs tem 3 abas", tabs === 3, `tabs=${tabs}`)
  await page.close()
}

// 6. /components/card: 1 seção, 0 abas
{
  const page = await ctx.newPage()
  await goto(page, "/components/card")
  const sec = await page.locator("#card").count()
  check("/components/card tem seção #card", sec === 1)
  const tabs = await page.locator('nav[aria-label="Variantes da família"] [role=tab]').count()
  check("/components/card tem 0 abas (solo)", tabs === 0, `tabs=${tabs}`)
  await page.close()
}

// 7. /components/button-fluid redireciona pra /components/button#button-fluid e rola
{
  const page = await ctx.newPage()
  const errors = []
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()) })
  await goto(page, "/components/button-fluid")
  await page.waitForTimeout(800)
  const url = page.url()
  check("redirect URL termina em /components/button#button-fluid", url.endsWith("/components/button#button-fluid"), url)
  const visible = await page.evaluate(() => {
    const el = document.getElementById("button-fluid")
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.top >= -5 && r.top < window.innerHeight
  })
  check("seção button-fluid rolada para o viewport", visible)
  check("console sem erros no redirect", errors.length === 0, errors.join(" | "))
  await page.close()
}

// 8. /components/tree (solo @pierre/trees) abre
{
  const page = await ctx.newPage()
  await goto(page, "/components/tree")
  const sec = await page.locator("#tree").count()
  check("/components/tree tem seção #tree", sec === 1)
  const origins = await page.$$eval("[data-slot=origin-badge]", (els) =>
    els.map((e) => e.getAttribute("data-origin"))
  )
  check("/components/tree badge @pierre/trees", origins.includes("@pierre/trees"), origins.join(","))
  await page.close()
}

await browser.close()
console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURES`}`)
process.exit(failures === 0 ? 0 : 1)
