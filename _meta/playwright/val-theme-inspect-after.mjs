// scripts/val-theme-inspect-after.mjs
// Inspeção computada FOCADA (pós-fix) dos 3 offenders corrigidos:
//  1. card-hover-effect: mede o CARD INTERNO (filho do <a.group> dentro do
//     grid [data-slot=card-hover-effect]) — borderWidth/borderColor em REPOUSO
//     no light E no dark. O detector genérico do REPORT só vê [data-slot],
//     e o card interno NÃO tem data-slot; por isso medimos aqui diretamente.
//  2. logo-slider: cor computada dos <span> de logo (devem == --foreground).
//  3. glass-dock: cor dos ícones em repouso (== --muted-foreground).
//
// Uso: node scripts/val-theme-inspect-after.mjs
import { chromium } from "playwright"

const BASE = "http://localhost:5173"
const browser = await chromium.launch()

async function withTheme(theme, url, fn) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
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
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 })
  await page.waitForSelector("main, [data-slot]", { timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(1500)
  const out = await page.evaluate(fn)
  await page.close()
  await ctx.close()
  return out
}

const cardHoverProbe = () => {
  // token de referência
  const root = getComputedStyle(document.documentElement)
  const fg = root.getPropertyValue("--foreground").trim()
  const border = root.getPropertyValue("--border").trim()
  // grid wrapper
  const grid = document.querySelector("[data-slot=card-hover-effect]")
  // o card interno é o div com bg-card dentro do primeiro <a.group>
  const firstLink = grid?.querySelector("a.group")
  // o card é o div com classe que contém "bg-card" (rounded-2xl border ...)
  const innerCard = firstLink
    ? Array.from(firstLink.querySelectorAll("div")).find((d) =>
        /rounded-2xl/.test(d.className),
      )
    : null
  const cs = innerCard ? getComputedStyle(innerCard) : null
  return {
    foregroundToken: fg,
    borderToken: border,
    innerCard: cs
      ? {
          borderWidth: cs.borderTopWidth,
          borderColor: cs.borderTopColor,
          cls: innerCard.className.slice(0, 120),
        }
      : "NOT FOUND",
  }
}

const logoSliderProbe = () => {
  const root = getComputedStyle(document.documentElement)
  const fg = root.getPropertyValue("--foreground").trim()
  const wrap = document.querySelector("[data-slot=logo-slider]")
  const span = wrap?.querySelector(".logo-slider__item span")
  const cs = span ? getComputedStyle(span) : null
  return {
    foregroundToken: fg,
    logoColor: cs ? cs.color : "NOT FOUND",
  }
}

const glassDockProbe = () => {
  const root = getComputedStyle(document.documentElement)
  const muted = root.getPropertyValue("--muted-foreground").trim()
  const dock = document.querySelector("[data-slot=glass-dock]")
  // ícone em repouso: svg lucide dentro do primeiro item
  const svg = dock?.querySelector("svg")
  const cs = svg ? getComputedStyle(svg) : null
  return {
    mutedForegroundToken: muted,
    iconColorRest: cs ? cs.color : "NOT FOUND",
  }
}

console.log("\n═══ INSPEÇÃO COMPUTADA — AFTER ═══\n")

for (const theme of ["light", "dark"]) {
  console.log(`\n──── THEME: ${theme} ────`)
  const ch = await withTheme(
    theme,
    `${BASE}/components/card-hover-effect`,
    cardHoverProbe,
  )
  console.log("[card-hover-effect/inner card]", JSON.stringify(ch, null, 2))

  const ls = await withTheme(
    theme,
    `${BASE}/components/logo-slider`,
    logoSliderProbe,
  )
  console.log("[logo-slider]", JSON.stringify(ls))

  const gd = await withTheme(
    theme,
    `${BASE}/components/glass-dock`,
    glassDockProbe,
  )
  console.log("[glass-dock]", JSON.stringify(gd))

  // landing-page (caso reportado pelo usuário)
  const lp = await withTheme(
    theme,
    `${BASE}/compositions/landing-page`,
    cardHoverProbe,
  )
  console.log("[landing-page/feature card]", JSON.stringify(lp))
}

await browser.close()
console.log("\n✓ inspeção concluída")
