// scripts/val-compositions-theme.mjs
// QA VISUAL DE TEMA — prints light/dark de TODAS as composições + páginas de
// componente representativas, e inspeção de cor computada (tipografia apagada
// no light) + borda em repouso (cards "soltos no ar" = borda só no hover).
//
// Gera:
//   shots/theme-audit/<phase>/<slug>-{light,dark}.png
//   shots/theme-audit/REPORT-<phase>.md   (phase = "before" | "after")
//
// Uso: node scripts/val-compositions-theme.mjs [before|after]
// (default: "before")
//
// Detecção de offenders:
//  - TIPOGRAFIA: texto (h1-h4/p) cujo `color` no LIGHT fica perto do background
//    (contraste baixo = "cinza-apagado") OU usa cinza hardcoded literal.
//  - BORDA: card com data-slot que, em REPOUSO, tem borderWidth 0 ou
//    borderColor transparente no LIGHT enquanto no DARK tem borda visível
//    (assimetria light/dark = "solto no ar").
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const PHASE = (process.argv[2] || "before").toLowerCase()
const BASE = "http://localhost:5173"
const OUT = outPath(`theme-audit/${PHASE}`)
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 1200 }
const GOTO_TIMEOUT = 20000
const POST_LOAD_WAIT = 2200

const COMPOSITIONS = [
  "landing-page",
  "saas-dashboard",
  "pricing-page",
  "testimonials-wall",
  "hero-gallery",
  "backgrounds-showcase",
  "text-effects-showcase",
  "signup-form",
  "chat-app",
  "component-playground",
]

// Páginas de componente representativas (cards + texto)
const COMPONENTS = [
  "card-hover-effect", // offender principal (borda só no hover)
  "card-stack",
  "glass-dock", // tipografia cinza hardcoded
  "logo-slider", // tipografia cinza hardcoded
]

const TARGETS = [
  ...COMPOSITIONS.map((s) => ({ slug: s, url: `${BASE}/compositions/${s}` })),
  ...COMPONENTS.map((s) => ({ slug: s, url: `${BASE}/components/${s}` })),
]

const browser = await chromium.launch()

// ── helpers ──────────────────────────────────────────────────────────

async function goto(page, url) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: GOTO_TIMEOUT })
  } catch (e) {
    console.warn(`  ⚠ goto ${url}: ${e.message}`)
  }
  // Algumas telas têm rAF infinito (sparkles/beams/vortex) → networkidle nunca
  // dispara. Espera por <main> e dá um tempo tolerante.
  try {
    await page.waitForSelector("main, [data-slot]", { timeout: 8000 })
  } catch {
    /* tela sem main detectável — segue mesmo assim */
  }
  await page.waitForTimeout(POST_LOAD_WAIT)
}

// Distância perceptual simples entre duas cores rgb (0-255). < ~48 = baixo contraste.
function colorDistance(a, b) {
  if (!a || !b) return 999
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  )
}

function parseRGB(str) {
  if (!str) return null
  const m = str.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(",").map((x) => parseFloat(x.trim()))
  return [parts[0], parts[1], parts[2], parts[3] ?? 1]
}

// Sobe a árvore procurando o primeiro background não-transparente.
const EXTRACT = `
(() => {
  function rgb(str) {
    const m = (str || "").match(/rgba?\\(([^)]+)\\)/)
    if (!m) return null
    const p = m[1].split(",").map((x) => parseFloat(x.trim()))
    return [p[0], p[1], p[2], p[3] ?? 1]
  }
  function effectiveBg(el) {
    let n = el
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor
      const v = rgb(c)
      if (v && v[3] > 0.1) return c
      n = n.parentElement
    }
    return getComputedStyle(document.body).backgroundColor
  }

  // TEXTO: amostra de h1-h4 e p visíveis (primeiros 24)
  const texts = []
  const textEls = Array.from(document.querySelectorAll("h1,h2,h3,h4,p,span,a"))
    .filter((el) => {
      const r = el.getBoundingClientRect()
      const txt = (el.textContent || "").trim()
      return r.width > 8 && r.height > 6 && txt.length > 1
    })
    .slice(0, 40)
  for (const el of textEls) {
    const cs = getComputedStyle(el)
    texts.push({
      tag: el.tagName.toLowerCase(),
      cls: el.className && typeof el.className === "string" ? el.className.slice(0, 90) : "",
      text: (el.textContent || "").trim().slice(0, 32),
      color: cs.color,
      bg: effectiveBg(el),
    })
  }

  // CARDS: elementos com data-slot "card" (exceto wrappers de GRID sem borda
  // própria) + os cards internos reais (filhos visuais com rounded+border que
  // NÃO têm data-slot, ex.: HoverEffect renderiza o card interno sem slot).
  const cards = []
  const cardSet = new Set()
  const pushCard = (el, label) => {
    if (!el || cardSet.has(el)) return
    cardSet.add(el)
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    if (r.width < 40 || r.height < 24) return
    cards.push({
      slot: label,
      borderWidth: cs.borderTopWidth,
      borderColor: cs.borderTopColor,
      cls:
        el.className && typeof el.className === "string"
          ? el.className.slice(0, 90)
          : "",
    })
  }
  // 1) data-slot com "card": mede o card interno (rounded+border) quando o
  //    elemento com slot é só um GRID wrapper (sem borda própria).
  const slotCardEls = Array.from(document.querySelectorAll("[data-slot]"))
    .filter((el) => /card/.test(el.getAttribute("data-slot") || ""))
    .slice(0, 30)
  for (const el of slotCardEls) {
    const slot = el.getAttribute("data-slot")
    const cs = getComputedStyle(el)
    const ownBorder = (parseFloat(cs.borderTopWidth) || 0) > 0
    if (ownBorder) {
      pushCard(el, slot)
    } else {
      // grid wrapper sem borda → medir o primeiro card interno real
      const inner = Array.from(el.querySelectorAll("div")).find((d) =>
        /rounded-(xl|2xl|3xl|lg)/.test(d.className || ""),
      )
      pushCard(inner || el, slot)
    }
  }
  return { texts, cards }
})()
`

async function inspect(slug, url) {
  const result = { slug, url, light: null, dark: null }
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({
      viewport: VIEWPORT,
      colorScheme: theme,
    })
    const page = await ctx.newPage()
    await page.addInitScript((t) => {
      try {
        localStorage.setItem("vitrine-theme", t)
      } catch {
        /* ignore */
      }
    }, theme)
    await goto(page, url)
    // garante a classe .dark / ausência
    await page.waitForTimeout(400)
    let data = null
    try {
      data = await page.evaluate(EXTRACT)
    } catch (e) {
      console.warn(`  ⚠ evaluate ${slug} ${theme}: ${e.message}`)
      data = { texts: [], cards: [] }
    }
    try {
      await page.screenshot({
        path: `${OUT}/${slug}-${theme}.png`,
        fullPage: false,
        animations: "disabled",
        timeout: 15000,
      })
    } catch (e) {
      console.warn(`  ⚠ screenshot ${slug} ${theme}: ${e.message}`)
    }
    console.log(`✓ ${OUT}/${slug}-${theme}.png`)
    result[theme] = data
    await page.close()
    await ctx.close()
  }
  return result
}

// ── run ──────────────────────────────────────────────────────────────

console.log(`\n═══ THEME AUDIT (${PHASE}) ═══\n`)

const all = []
for (const t of TARGETS) {
  console.log(`▶ ${t.slug}`)
  all.push(await inspect(t.slug, t.url))
}
await browser.close()

// ── analyse offenders ────────────────────────────────────────────────

const offenders = []

for (const r of all) {
  // TIPOGRAFIA: texto com baixo contraste no LIGHT
  if (r.light) {
    for (const tx of r.light.texts) {
      const c = parseRGB(tx.color)
      const bg = parseRGB(tx.bg)
      const dist = colorDistance(c, bg)
      if (dist < 70) {
        offenders.push({
          type: "low-contrast-text",
          screen: r.slug,
          element: `${tx.tag} "${tx.text}"`,
          theme: "light",
          detail: `color=${tx.color} vs bg=${tx.bg} dist=${dist.toFixed(0)}`,
          cls: tx.cls,
        })
      }
    }
  }
  // BORDA: assimetria light vs dark em REPOUSO (card sem borda no light, com no dark)
  if (r.light && r.dark) {
    const byCls = new Map()
    for (const cd of r.dark.cards) byCls.set(cd.cls, cd)
    // Detecta borda visível mesmo quando a cor vem em oklch()/rgb()/rgba():
    // só é "sem borda" se width=0 OU a cor for explicitamente transparente
    // (rgba alpha≈0, "transparent", ou oklch(... / 0%)).
    const hasVisibleBorder = (widthStr, colorStr) => {
      const w = parseFloat(widthStr) || 0
      if (w <= 0) return false
      const c = (colorStr || "").trim()
      if (c === "transparent" || c === "none" || c === "") return false
      const rgba = parseRGB(c)
      if (rgba && rgba[3] <= 0.02) return false
      // oklch(... / 0%) / oklch(... / 0) => transparente
      const okAlpha = c.match(/oklch\([^)]*\/\s*([0-9.]+)%?\s*\)/)
      if (okAlpha && parseFloat(okAlpha[1]) <= 0.02) return false
      return true
    }
    for (const cl of r.light.cards) {
      const cd = byCls.get(cl.cls)
      const lightHasBorder = hasVisibleBorder(cl.borderWidth, cl.borderColor)
      const darkHasBorder = cd
        ? hasVisibleBorder(cd.borderWidth, cd.borderColor)
        : false
      if (!lightHasBorder && darkHasBorder) {
        offenders.push({
          type: "border-asymmetry",
          screen: r.slug,
          element: `card[data-slot=${cl.slot}]`,
          theme: "light(no border) vs dark(border)",
          detail: `light: w=${cl.borderWidth} c=${cl.borderColor} | dark: w=${cd.borderWidth} c=${cd.borderColor}`,
          cls: cl.cls,
        })
      } else if (!lightHasBorder && !darkHasBorder && /card-hover|card-stack/.test(cl.slot || "")) {
        // card sem borda em repouso em ambos (também relevante p/ card-hover)
        offenders.push({
          type: "no-border-rest",
          screen: r.slug,
          element: `card[data-slot=${cl.slot}]`,
          theme: "both",
          detail: `light: w=${cl.borderWidth} c=${cl.borderColor} | dark: w=${cd ? cd.borderWidth : "n/a"} c=${cd ? cd.borderColor : "n/a"}`,
          cls: cl.cls,
        })
      }
    }
  }
}

// ── REPORT.md ────────────────────────────────────────────────────────

const lines = []
lines.push(`# Theme Audit Report — ${PHASE.toUpperCase()}`)
lines.push("")
lines.push(`Gerado: ${new Date().toISOString()}`)
lines.push(`Telas auditadas: ${all.length} (${COMPOSITIONS.length} composições + ${COMPONENTS.length} componentes)`)
lines.push(`Prints: \`${OUT}/<slug>-{light,dark}.png\``)
lines.push("")
lines.push(`## Offenders encontrados: ${offenders.length}`)
lines.push("")
if (offenders.length === 0) {
  lines.push("Nenhum offender de borda-em-repouso assimétrica nem texto cinza-apagado no light. ✅")
} else {
  lines.push("| Tipo | Tela | Elemento | Tema | Detalhe |")
  lines.push("|------|------|----------|------|---------|")
  for (const o of offenders) {
    lines.push(
      `| ${o.type} | ${o.screen} | ${o.element.replace(/\|/g, "\\|")} | ${o.theme} | ${o.detail.replace(/\|/g, "\\|")} |`,
    )
  }
  lines.push("")
  lines.push("### Classes (debug)")
  for (const o of offenders) {
    lines.push(`- **${o.screen}** ${o.element}: \`${o.cls}\``)
  }
}
lines.push("")

const reportPath = outPath(`theme-audit/REPORT-${PHASE}.md`)
writeFileSync(reportPath, lines.join("\n"))
console.log(`\n✓ ${reportPath}`)
console.log(`\nOffenders: ${offenders.length}`)
for (const o of offenders.slice(0, 40)) {
  console.log(`  [${o.type}] ${o.screen} ${o.element} (${o.theme}) — ${o.detail}`)
}
