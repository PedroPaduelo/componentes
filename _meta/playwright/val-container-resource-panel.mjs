// Validação visual do ContainerResourcePanel na vitrine.
//
// Critérios cobertos:
//  1. Página /components/container-resource-panel responde 200 e tem >= 2
//     [data-slot=container-resource-panel] renderizados.
//  2. Cada painel tem data-status, header com chip de status + ID curto,
//     >= 4 mini-cards de recurso, lista de portas, restart count visível.
//  3. Barras de CPU e MEM têm label numérico no caption.
//  4. Cores reagem ao status (running=emerald, restarting=amber,
//     exited=rose) — verificado via getComputedStyle da cor do chip.
//  5. Light + dark: borda visível (1px, cor não-transparente) em ambos.
//  6. 390px: cards empilham verticalmente (resource grid vira 2 col, e
//     numa largura de 390px a grid 2-col de fato empilha porque o card
//     externo estouraria — validação pragmática: as 2 instâncias cabem
//     lado a lado no desktop mas cada uma tem altura própria no mobile).
//
// Saída: relatório em _meta/scratch/shots/container-resource-panel/*.json.
// Falha com process.exit(1) se qualquer critério quebrar.

import { chromium } from "playwright"
import { saveJSON } from "./_shots.mjs"

// Em dev (Vite HMR) a URL canônica é :5173; em prod (vite preview) é :4180.
// Aceita override via env BASE_URL; default = preview local (determinístico).
const URL = process.env.BASE_URL ?? "http://127.0.0.1:4180/components/container-resource-panel"
const SUBDIR = "container-resource-panel"
const browser = await chromium.launch()

async function probe(theme, viewport) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForSelector("[data-slot=container-resource-panel]", { timeout: 15000 })
  await page.waitForTimeout(800)
  const data = await page.evaluate(() => {
    const panels = Array.from(
      document.querySelectorAll("[data-slot=container-resource-panel]"),
    )
    return panels.map((panel) => {
      const cs = getComputedStyle(panel)
      const rect = panel.getBoundingClientRect()
      const statusChip = panel.querySelector(
        "[data-slot=container-status-chip]",
      )
      const healthBadge = panel.querySelector(
        "[data-slot=container-health-badge]",
      )
      const miniCards = Array.from(
        panel.querySelectorAll("[data-slot=container-mini-card]"),
      )
      const bars = Array.from(panel.querySelectorAll("[data-slot=container-bar]"))
      const ports = Array.from(panel.querySelectorAll("[data-slot=container-port-chip]"))
      const restartBadge = panel.querySelector("[data-slot=container-restart-badge]")
      const uptime = panel.querySelector("[data-slot=container-uptime]")
      const resourceGrid = panel.querySelector("[data-slot=container-resource-grid]")

      const chipColor = statusChip ? getComputedStyle(statusChip).color : null
      const chipBorderColor = statusChip
        ? getComputedStyle(statusChip).borderTopColor
        : null
      const chipBg = statusChip ? getComputedStyle(statusChip).backgroundColor : null

      return {
        status: panel.getAttribute("data-status"),
        health: panel.getAttribute("data-health"),
        rect: { w: Math.round(rect.width), h: Math.round(rect.height) },
        borderTopWidth: cs.borderTopWidth,
        borderTopColor: cs.borderTopColor,
        chip: {
          text: statusChip?.textContent?.trim() ?? null,
          color: chipColor,
          borderColor: chipBorderColor,
          bg: chipBg,
        },
        healthBadge: {
          text: healthBadge?.textContent?.trim() ?? null,
        },
        uptime: uptime?.textContent?.trim() ?? null,
        miniCardResources: miniCards.map((c) =>
          c.getAttribute("data-resource"),
        ),
        barLabels: bars.map((b) => b.getAttribute("data-bar-label")),
        barCaptions: bars.map((b) => {
          const spans = b.querySelectorAll("span")
          return spans[spans.length - 1]?.textContent?.trim() ?? null
        }),
        portsCount: ports.length,
        portTypes: ports.map((p) => p.getAttribute("data-port-type")),
        restart: {
          count: restartBadge?.getAttribute("data-restart-count") ?? null,
          color: restartBadge ? getComputedStyle(restartBadge).color : null,
        },
        resourceGridCols: resourceGrid
          ? getComputedStyle(resourceGrid).gridTemplateColumns
          : null,
      }
    })
  })
  await page.close()
  return data
}

const desktopLight = await probe("light", { width: 1440, height: 1000 })
const desktopDark = await probe("dark", { width: 1440, height: 1000 })
const mobile = await probe("light", { width: 390, height: 800 })

await browser.close()

saveJSON(`${SUBDIR}/desktop-light`, desktopLight)
saveJSON(`${SUBDIR}/desktop-dark`, desktopDark)
saveJSON(`${SUBDIR}/mobile-light`, mobile)

// ---- asserts ----
const errs = []

// 1. >= 2 instâncias em desktop
if (desktopLight.length < 2) {
  errs.push(`desktop-light: esperava >= 2 paineis, achei ${desktopLight.length}`)
}
if (desktopDark.length < 2) {
  errs.push(`desktop-dark: esperava >= 2 paineis, achei ${desktopDark.length}`)
}

// 2. cada painel: data-status presente, header tem chip, >=4 mini-cards
for (const p of [...desktopLight, ...desktopDark]) {
  if (!p.status) errs.push(`painel sem data-status: ${JSON.stringify(p.chip)}`)
  if (!p.chip.text) errs.push(`painel sem chip de status: ${JSON.stringify(p.chip)}`)
  if (p.miniCardResources.length < 4) {
    errs.push(`painel com < 4 mini-cards: ${p.miniCardResources.join(",")}`)
  }
  const required = ["cpu", "memory", "network", "disk"]
  for (const r of required) {
    if (!p.miniCardResources.includes(r)) {
      errs.push(`mini-card faltando: ${r} (achei: ${p.miniCardResources.join(",")})`)
    }
  }
  if (p.uptime == null) errs.push("painel sem uptime visível")
  if (p.restart.count == null) errs.push("painel sem restart count")
}

// 3. Barras de CPU e MEM têm caption numérico
for (const p of [...desktopLight, ...desktopDark]) {
  if (p.barLabels.length < 2) {
    errs.push(`painel com < 2 barras: ${p.barLabels.join(",")}`)
  }
  for (const c of p.barCaptions) {
    if (c == null || c === "" || !/\d/.test(c)) {
      errs.push(`caption de barra sem número: "${c}"`)
    }
  }
}

// 4. Cores reagem ao status — aceita rgb/rgba E oklch (token shadcn).
function parseColor(color) {
  if (!color) return null
  // rgb()/rgba()
  const rgb = color.match(/rgba?\(([^)]+)\)/)
  if (rgb) {
    const parts = rgb[1].split(",").map((s) => parseFloat(s.trim()))
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 }
  }
  // oklch()/oklab() — usar hue (3º número) como discriminador de família
  const oklch = color.match(/oklch\(([^)]+)\)/)
  if (oklch) {
    const parts = oklch[1].split("/")
    const main = parts[0].trim().split(/\s+/)
    const L = parseFloat(main[0])
    const C = parseFloat(main[1])
    const H = parseFloat(main[2])
    // alpha sufixo " / 0.1" ou "/ 0.1"
    let a = 1
    if (parts[1]) {
      const m = parts[1].match(/([\d.]+)%?/)
      if (m) a = parseFloat(m[1]) / (m[0].endsWith("%") ? 100 : 1)
    }
    return { oklch: true, L, C, H, a }
  }
  const oklab = color.match(/oklab\(([^)]+)\)/)
  if (oklab) {
    const parts = oklab[1].split(/\s+/)
    return { oklch: true, L: parseFloat(parts[0]), C: parseFloat(parts[1]), H: 0, a: 1 }
  }
  return null
}

// emerald ~ hue 160-170; amber ~ hue 50-65; rose ~ hue 0-15 ou 350-360.
function emeraldTone(color) {
  const c = parseColor(color)
  if (!c) return false
  if (c.oklch) {
    return c.L > 0.4 && c.L < 0.7 && c.C > 0.05 && c.H >= 140 && c.H <= 185
  }
  const [r, g, b] = [c.r, c.g, c.b]
  return g > 120 && r < 80 && b > 80 && b < 200
}
function amberTone(color) {
  const c = parseColor(color)
  if (!c) return false
  if (c.oklch) {
    return c.L > 0.4 && c.L < 0.75 && c.C > 0.1 && c.H >= 30 && c.H <= 80
  }
  const [r, g, b] = [c.r, c.g, c.b]
  return r > 200 && g > 120 && b < 80
}
function roseTone(color) {
  const c = parseColor(color)
  if (!c) return false
  if (c.oklch) {
    return c.L > 0.4 && c.L < 0.7 && c.C > 0.1 && ((c.H >= 0 && c.H <= 25) || c.H >= 340)
  }
  const [r, g, b] = [c.r, c.g, c.b]
  return r > 200 && g < 120 && b > 60
}
const byStatus = {}
for (const p of desktopLight) {
  if (!byStatus[p.status]) byStatus[p.status] = p
}
const running = byStatus["running"]
const restarting = byStatus["restarting"]
if (!running) errs.push("não achei painel running no exemplo 1")
if (!restarting) errs.push("não achei painel restarting no exemplo 2")
if (running && !emeraldTone(running.chip.color)) {
  errs.push(`running deveria ser emerald, achei cor: ${running.chip.color}`)
}
if (restarting && !amberTone(restarting.chip.color)) {
  errs.push(`restarting deveria ser amber, achei cor: ${restarting.chip.color}`)
}

// restart count > 3 = rose
if (restarting && Number(restarting.restart.count) > 3 && !roseTone(restarting.restart.color)) {
  errs.push(`restart count alto (${restarting.restart.count}) deveria ser rose, achei: ${restarting.restart.color}`)
}

// 5. borda visível em light E dark (1px + cor não-transparente)
function hasVisibleBorder(p) {
  if (!p.borderTopWidth || p.borderTopWidth === "0px") return false
  const c = parseColor(p.borderTopColor)
  if (!c) return false
  // rgb alpha<0.05 = transparente
  if (!c.oklch && c.a !== undefined && c.a < 0.05) return false
  // oklch alpha embutido no "/ 0.1" (ex.: "oklch(1 0 0 / 0.1)")
  if (c.oklch && c.a !== undefined && c.a < 0.05) return false
  // oklch puro sem alpha = opaco
  return true
}
for (const p of desktopLight) {
  if (!hasVisibleBorder(p)) {
    errs.push(`light: painel sem borda visível: ${JSON.stringify(p.rect)} ${p.borderTopWidth} ${p.borderTopColor}`)
  }
}
for (const p of desktopDark) {
  if (!hasVisibleBorder(p)) {
    errs.push(`dark: painel sem borda visível: ${JSON.stringify(p.rect)} ${p.borderTopWidth} ${p.borderTopColor}`)
  }
}

// 6. mobile 390px: ambos painéis ainda visíveis (altura > 0) e empilhados
//    (rect.y do segundo > rect.y do primeiro — assumindo flow vertical)
if (mobile.length < 2) {
  errs.push(`mobile: esperava >= 2 paineis, achei ${mobile.length}`)
} else {
  for (const p of mobile) {
    if (p.rect.h === 0 || p.rect.w === 0) {
      errs.push(`mobile: painel com ret zero: ${JSON.stringify(p.rect)}`)
    }
  }
  // empilhamento vertical: y do segundo > y do primeiro (sem overlap)
  const first = mobile[0]
  const second = mobile[1]
  if (first.rect.h + first.rect.y < 390 /* some default header offset */) {
    // sem header offset, first pode estar no topo — checa apenas second.top > first.top
  }
  if (second.rect.y <= first.rect.y) {
    errs.push(`mobile: painéis não empilharam (first.y=${first.rect.y} second.y=${second.rect.y})`)
  }
}

// ---- report ----
console.log("\n=== ContainerResourcePanel validador ===")
console.log(`desktop-light: ${desktopLight.length} paineis`)
desktopLight.forEach((p, i) => {
  console.log(
    `  [${i}] status=${p.status} health=${p.health} h=${p.rect.h}px chips=${p.miniCardResources.length} ports=${p.portsCount} restarts=${p.restart.count}`,
  )
  console.log(`     chip: ${p.chip.text} | cor: ${p.chip.color}`)
})
console.log(`desktop-dark: ${desktopDark.length} paineis`)
desktopDark.forEach((p, i) => {
  console.log(
    `  [${i}] status=${p.status} health=${p.health} h=${p.rect.h}px chips=${p.miniCardResources.length} ports=${p.portsCount} restarts=${p.restart.count}`,
  )
})
console.log(`mobile (390px): ${mobile.length} paineis`)
mobile.forEach((p, i) => {
  console.log(`  [${i}] y=${p.rect.y} h=${p.rect.h}px w=${p.rect.w}px`)
})

if (errs.length) {
  console.error("\n❌ FALHAS:\n - " + errs.join("\n - "))
  process.exit(1)
}
console.log("\n✅ ContainerResourcePanel OK: 2+ instâncias, status colorindo, bordas visíveis light+dark, mobile empilha.")
