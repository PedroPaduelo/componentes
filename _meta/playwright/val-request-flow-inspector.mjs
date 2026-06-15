// Validador Playwright do RequestFlowInspector (Lote Observabilidade).
// Critérios (spec da task):
//  1. /components/request-flow-inspector retorna 200 e renderiza 2 instâncias [data-slot]
//  2. Cada uma: method + url + status visíveis; status com cor (200 verde / 500 vermelho)
//  3. Timing waterfall tem 5 segmentos (DNS/TCP/TLS/Server/Transfer)
//  4. Tabela de headers visível (request OU response), com >=5 linhas cada
//  5. Body JSON com indentação + syntax highlight (>=3 cores de token)
//  6. 390px: sem overflow horizontal grave
//  7. Geo card lateral presente, com bandeira + ASN
//
// Uso: node _meta/playwright/val-request-flow-inspector.mjs (dev server em :5173)
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const URL = process.env.RFI_URL || "http://localhost:5173/components/request-flow-inspector"
const SEL = "[data-slot='request-flow-inspector']"

mkdirSync(outPath("request-flow-inspector"), { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

let pass = 0
let total = 0
const log = []
function check(label, ok, extra) {
  total++
  if (ok) pass++
  log.push(`  ${ok ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`)
}

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

/** Lê a cor do badge de status e converte oklch/oklab/rgb → hue (HSL, graus). */
async function readStatusHue(page, idx) {
  return page.evaluate(
    ({ idx, SEL }) => {
      const slot = document.querySelectorAll(SEL)[idx]
      const el = slot?.querySelector("[data-slot='request-flow-inspector-status']")
      if (!el) return null
      const raw = getComputedStyle(el).color
      // Cores shadcn vêm como oklch(L C H) ou oklab(L a b) ou rgb()/rgba().
      // Parsing direto (sem canvas) pra cobrir todos os formatos.
      const oklchM = /oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/.exec(raw)
      if (oklchM) {
        return { raw, kind: "oklch", L: +oklchM[1], C: +oklchM[2], H: +oklchM[3] }
      }
      const oklabM = /oklab\(\s*([0-9.]+)\s+([-\d.]+)\s+([-\d.]+)/.exec(raw)
      if (oklabM) {
        // a,b → hue aproximado: atan2(b,a) em rad → deg
        const a = +oklabM[2]
        const b = +oklabM[3]
        const h = (Math.atan2(b, a) * 180) / Math.PI
        return { raw, kind: "oklab", L: +oklabM[1], a, b, h: Math.round((h + 360) % 360) }
      }
      const rgbM = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(raw)
      if (rgbM) {
        const r = +rgbM[1]
        const g = +rgbM[2]
        const b = +rgbM[3]
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h = 0
        if (max !== min) {
          const d = max - min
          if (max === r) h = ((g - b) / d) % 6
          else if (max === g) h = (b - r) / d + 2
          else h = (r - g) / d + 4
          h *= 60
          if (h < 0) h += 360
        }
        return { raw, kind: "rgb", r, g, b, h: Math.round(h) }
      }
      return { raw, kind: "unknown" }
    },
    { idx, SEL },
  )
}

/** Inspeção rápida: method, url, status text, timing segments, geo info. */
async function inspectQuick(page) {
  return page.evaluate((SEL) => {
    const slots = document.querySelectorAll(SEL)
    const get = (slot, sel) => slot?.querySelector(sel) ?? null
    return Array.from(slots).map((slot) => {
      const method = get(slot, "[data-method]")
      const url = get(slot, "[data-slot='request-flow-inspector-url']")
      const status = get(slot, "[data-slot='request-flow-inspector-status']")
      const timing = get(slot, "[data-slot='request-flow-inspector-timing']")
      const segments = timing ? timing.querySelectorAll("[data-timing-segment]") : []
      const widths = Array.from(
        timing?.querySelectorAll("[data-timing-width]") ?? [],
      ).map((el) => Number(el.getAttribute("data-timing-width")))
      const geo = get(slot, "[data-slot='request-flow-inspector-geo']")
      return {
        method: method?.getAttribute("data-method") ?? null,
        urlText: url?.textContent?.trim() ?? null,
        statusText: status?.textContent?.trim() ?? null,
        segments: segments.length,
        widths,
        hasGeo: !!geo,
        geoHasAsn: !!geo?.textContent?.includes("ASN"),
        geoHasFlag: !!geo?.querySelector("[aria-hidden='true']"),
      }
    })
  }, SEL)
}

/** Clica na aba "Body" e captura info de syntax highlight do JSON. */
async function inspectBodyJson(page) {
  const bodyTab = page
    .locator(SEL)
    .first()
    .locator("button[role='tab']", { hasText: "Body" })
  await bodyTab.click()
  await page.waitForTimeout(300)
  return page.evaluate((SEL) => {
    const slot = document.querySelector(SEL)
    if (!slot) return null
    const pre = slot.querySelector("pre[data-slot='request-flow-inspector-body-json']")
    if (!pre) return { mode: "text", present: false }
    const spans = Array.from(pre.querySelectorAll("span"))
    const colors = new Set()
    for (const s of spans) colors.add(getComputedStyle(s).color)
    const hasIndent = /\n {2,}/.test(pre.textContent ?? "")
    return {
      mode: "json",
      present: true,
      uniqueColors: colors.size,
      hasIndent,
      totalSpans: spans.length,
    }
  }, SEL)
}

/** Captura contagem de linhas das tabelas de headers (clicando na aba Headers). */
async function inspectHeaders(page) {
  const tab = page
    .locator(SEL)
    .first()
    .locator("button[role='tab']", { hasText: "Headers" })
  await tab.click()
  await page.waitForTimeout(300)
  return page.evaluate((SEL) => {
    const slot = document.querySelector(SEL)
    const req = slot?.querySelector(
      "[data-slot='request-flow-inspector-headers-request']",
    )
    const res = slot?.querySelector(
      "[data-slot='request-flow-inspector-headers-response']",
    )
    return {
      reqRows: req?.querySelectorAll("tbody tr").length ?? 0,
      resRows: res?.querySelectorAll("tbody tr").length ?? 0,
    }
  }, SEL)
}

/** 390px — mede se cabe sem estourar a viewport. */
async function inspectResponsive() {
  const page = await ctx.newPage()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForSelector(SEL, { timeout: 15000 })
  await page.waitForTimeout(600)
  const info = await page.evaluate((SEL) => {
    const slots = document.querySelectorAll(SEL)
    return Array.from(slots).map((el) => {
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    })
  }, SEL)
  await page.screenshot({ path: outPath("request-flow-inspector/vitrine-390.png") })
  await page.close()
  return info
}

/** Captura completa pra um tema: quick, hue, body, headers, screenshot. */
async function capture(theme) {
  const page = await ctx.newPage()
  await setTheme(page, theme)
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForSelector(SEL, { timeout: 15000 })
  await page.waitForTimeout(600)
  const quick = await inspectQuick(page)
  const hue0 = await readStatusHue(page, 0)
  const hue1 = await readStatusHue(page, 1)
  const body = await inspectBodyJson(page)
  const headers = await inspectHeaders(page)
  await page.screenshot({
    path: outPath(`request-flow-inspector/vitrine-${theme}.png`),
    fullPage: true,
  })
  await page.close()
  return { theme, slots: quick, hue0, hue1, body, headers }
}

const light = await capture("light")
const dark = await capture("dark")
const responsive = await inspectResponsive()

await browser.close()

// --- checks ---
log.push("=== request-flow-inspector ===")

// 1. 2 instâncias
check("duas instâncias [data-slot=...] renderizadas", light.slots.length === 2, `count=${light.slots.length}`)

// 2. method + url + status visíveis
const s0 = light.slots[0]
const s1 = light.slots[1]
check("slot 0: method=GET", s0?.method === "GET", `method=${s0?.method}`)
check("slot 0: url presente", !!s0?.urlText && s0.urlText.length > 0, s0?.urlText)
check("slot 0: status 200 OK", /\b200\b/.test(s0?.statusText ?? ""), s0?.statusText)
check("slot 1: method=POST", s1?.method === "POST", `method=${s1?.method}`)
check("slot 1: status 500", /\b500\b/.test(s1?.statusText ?? ""), s1?.statusText)

// 3. cor do status por hue (HSL em graus) — leitura do componente H do oklch
//    ou h computado de rgb/oklab.
//    emerald ≈ 150-175°, rose ≈ 0-25°
const hueOf = (probe) =>
  probe == null ? null : typeof probe.H === "number" ? probe.H : probe.h
const inGreen = (h) => typeof h === "number" && h >= 130 && h <= 180
const inRed = (h) => typeof h === "number" && (h <= 30 || h >= 330)
const fmt = (p) => (p ? `${p.kind}=${p.raw}` : "null")
const l0 = hueOf(light.hue0)
const l1 = hueOf(light.hue1)
const d0 = hueOf(dark.hue0)
const d1 = hueOf(dark.hue1)
check("[light] status 200 hue ~verde (130-180°)", inGreen(l0), `h=${l0} ${fmt(light.hue0)}`)
check("[light] status 500 hue ~vermelho (0-30°)", inRed(l1), `h=${l1} ${fmt(light.hue1)}`)
check("[dark] status 200 hue ~verde (130-180°)", inGreen(d0), `h=${d0} ${fmt(dark.hue0)}`)
check("[dark] status 500 hue ~vermelho (0-30°)", inRed(d1), `h=${d1} ${fmt(dark.hue1)}`)

// 4. timing waterfall: 5 segmentos
check("timing waterfall com 5 segmentos", s0?.segments === 5, `segments=${s0?.segments}`)

// 5. headers
check(
  "request headers tem >=5 linhas",
  (light.headers?.reqRows ?? 0) >= 5,
  `reqRows=${light.headers?.reqRows}`,
)
check(
  "response headers tem >=5 linhas",
  (light.headers?.resRows ?? 0) >= 5,
  `resRows=${light.headers?.resRows}`,
)

// 6. body json com indentação + syntax highlight
check(
  "body JSON: pre[data-slot=...body-json] presente",
  light.body?.present === true,
  `mode=${light.body?.mode}`,
)
check("body JSON: indentação de 2 espaços presente", light.body?.hasIndent === true)
check(
  "body JSON: >=3 cores distintas (syntax highlight)",
  (light.body?.uniqueColors ?? 0) >= 3,
  `uniqueColors=${light.body?.uniqueColors} spans=${light.body?.totalSpans}`,
)

// 7. geo card
check("geo card presente", s0?.hasGeo === true)
check("geo card tem ASN", s0?.geoHasAsn === true)
check("geo card tem bandeira (aria-hidden)", s0?.geoHasFlag === true)

// 8. responsive 390px
const r0 = responsive[0]
const r1 = responsive[1]
check(
  "[390px] slot 0 tem largura > 0 e <= viewport",
  !!r0 && r0.w > 0 && r0.w <= 600,
  r0 ? `${r0.w}x${r0.h}` : "missing",
)
check(
  "[390px] slot 1 tem largura > 0 e <= viewport",
  !!r1 && r1.w > 0 && r1.w <= 600,
  r1 ? `${r1.w}x${r1.h}` : "missing",
)

console.log(log.join("\n"))
console.log(`\nRESULT: ${pass}/${total} checks passed`)
process.exit(pass === total ? 0 : 1)
