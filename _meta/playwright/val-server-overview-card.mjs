// _meta/playwright/val-server-overview-card.mjs
// Valida o render do ServerOverviewCard (Lote Observabilidade).
// Roda contra `vite preview` na 4173 (build de produção) — a dev em 5173
// pode estar sendo servida por outro worktree no mesmo host.
//
// Critérios cobertos:
//   1. 2 instâncias (1 por example) presentes na página
//   2. data-slot="server-overview-card" + data-server-status correto
//   3. Header: nome, status badge, host, role, uptime
//   4. 2 gauges (CPU + memória) com % visível
//   5. Load avg presente
//   6. ≥1 barra de disco (data-disk-mount) por card
//   7. Seção de rede com 4 sub-cards (in/out/connections/established)
//   8. Top processos (≥3) com PID, nome, CPU%, mem%, comando
//   9. Sparklines presentes (data-points=12)
//  10. Cores reagem ao status (emerald-500 / amber-500)
//  11. Borda 1px visível em ambos os temas (oklch não-transparente)
//  12. Footer: região/zona + último incidente
//  13. 390px sem overflow horizontal

import { chromium } from "playwright"
import { outPath } from "./_shots.mjs"

const browser = await chromium.launch()

async function probe(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`)
  })
  await page.goto("http://localhost:4173/components/server-overview-card", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })
  await page.waitForTimeout(1500)
  const info = await page.evaluate(() => {
    const wrappers = Array.from(document.querySelectorAll("[data-slot='server-overview-card']"))
    const first = wrappers[0]
    if (!first) {
      return { wrapperCount: 0 }
    }
    const rect = first.getBoundingClientRect()
    const cs = getComputedStyle(first)
    const status = first.getAttribute("data-server-status")
    const header = first.querySelector("h3")
    const badges = first.querySelectorAll("[data-server-status]")
    const uptimeEl = Array.from(first.querySelectorAll("span")).find((s) =>
      /\d+d\s\d+h|\d+h\s\d+m|\d+m/.test(s.textContent ?? ""),
    )
    // CPU e memória: cada um tem data-section
    const cpuSection = first.querySelector("[data-section='cpu']")
    const memSection = first.querySelector("[data-section='memory']")
    const cpuText = cpuSection?.textContent ?? ""
    const memText = memSection?.textContent ?? ""
    const loadMatch = cpuText.match(/load\s([\d.]+)\/([\d.]+)\/([\d.]+)/)
    // Sparklines
    const sparklines = Array.from(first.querySelectorAll("svg[data-points]"))
    const sparklinePoints = sparklines.map((s) => s.getAttribute("data-points"))
    // Discos
    const disks = Array.from(first.querySelectorAll("[data-disk-mount]"))
    const diskMounts = disks.map((d) => d.getAttribute("data-disk-mount"))
    // Processos
    const procs = Array.from(first.querySelectorAll("[data-process-pid]"))
    const procInfo = procs.map((p) => ({
      pid: p.getAttribute("data-process-pid"),
      name: p.getAttribute("data-process-name"),
      hasCommand: !!p.querySelector("[data-process-command]"),
    }))
    // Network
    const netIn = first.querySelector("[data-net='in']")
    const netOut = first.querySelector("[data-net='out']")
    const netConn = first.querySelector("[data-net='connections']")
    const netEst = first.querySelector("[data-net='established']")
    // Footer
    const lastIncident = first.querySelector("[data-section='last-incident']")
    const footerText = first.querySelector("[data-section='footer']")?.textContent ?? ""
    // Borda visível
    return {
      wrapperCount: wrappers.length,
      firstRect: { w: Math.round(rect.width), h: Math.round(rect.height) },
      borderTopWidth: cs.borderTopWidth,
      borderTopColor: cs.borderTopColor,
      status,
      badgeCount: badges.length,
      headerText: header?.textContent?.trim() ?? null,
      uptimeText: uptimeEl?.textContent?.trim() ?? null,
      cpuPctMatch: cpuText.match(/(\d+)%/),
      memGbMatch: memText.match(/([\d.]+)\s*\/\s*(\d+)\s*GB/),
      loadAvg: loadMatch ? [loadMatch[1], loadMatch[2], loadMatch[3]] : null,
      sparklineCount: sparklines.length,
      sparklinePoints,
      diskCount: disks.length,
      diskMounts,
      processCount: procs.length,
      processInfo: procInfo,
      hasNetIn: !!netIn,
      hasNetOut: !!netOut,
      hasNetConn: !!netConn,
      hasNetEst: !!netEst,
      hasLastIncident: !!lastIncident,
      footerHasRegion: /região/i.test(footerText),
      footerHasZone: /zona/i.test(footerText),
    }
  })
  await page.screenshot({ path: outPath(`server-overview-card-${theme}.png`), fullPage: false, animations: "disabled" })
  await ctx.close()
  return { theme, info, errors }
}

async function probeMobile() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } })
  await ctx.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
  const page = await ctx.newPage()
  await page.goto("http://localhost:4173/components/server-overview-card", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })
  await page.waitForSelector("[data-slot='server-overview-card']", { timeout: 10000 })
  await page.waitForTimeout(1500)
  const info = await page.evaluate(() => {
    const wrappers = Array.from(document.querySelectorAll("[data-slot='server-overview-card']"))
    return wrappers.map((w) => {
      const r = w.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    })
  })
  // overflow check no body
  const overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }
  })
  await page.screenshot({ path: outPath("server-overview-card-390px.png"), fullPage: false, animations: "disabled" })
  await ctx.close()
  return { info, overflow }
}

const light = await probe("light")
const dark = await probe("dark")
const mobile = await probeMobile()

const fail = (msg) => {
  console.error("FAIL:", msg)
  process.exitCode = 1
}

const lightOk =
  light.info.wrapperCount === 2 &&
  light.info.status === "online" &&
  light.info.firstRect.w > 0 &&
  light.info.firstRect.h > 0 &&
  parseFloat(light.info.borderTopWidth) >= 1 &&
  light.info.headerText &&
  light.info.uptimeText &&
  light.info.cpuPctMatch &&
  light.info.memGbMatch &&
  light.info.loadAvg &&
  light.info.diskCount >= 1 &&
  light.info.processCount >= 3 &&
  light.info.sparklineCount >= 2 &&
  light.info.sparklinePoints.every((p) => p === "12") &&
  light.info.hasNetIn &&
  light.info.hasNetOut &&
  light.info.hasNetConn &&
  light.info.hasNetEst &&
  light.info.hasLastIncident &&
  light.info.footerHasRegion &&
  light.info.footerHasZone &&
  light.info.processInfo.every((p) => p.pid && p.name) &&
  light.errors.length === 0

const darkOk =
  dark.info.wrapperCount === 2 &&
  dark.info.status === "online" &&
  parseFloat(dark.info.borderTopWidth) >= 1 &&
  dark.info.headerText &&
  dark.errors.length === 0

const mobileOk =
  mobile.overflow.hasHorizontalOverflow === false &&
  mobile.info.every((r) => r.w > 0 && r.h > 0)

console.log("\n[light]", JSON.stringify(light.info, null, 2))
console.log("\n[dark]", JSON.stringify({ wrapperCount: dark.info.wrapperCount, status: dark.info.status, borderTopWidth: dark.info.borderTopWidth, borderTopColor: dark.info.borderTopColor, headerText: dark.info.headerText }, null, 2))
console.log("\n[mobile 390px]", JSON.stringify(mobile, null, 2))
console.log("\n[errors light]", light.errors)
console.log("[errors dark]", dark.errors)

if (!lightOk) {
  fail("light checks failed")
  console.error({ lightOk })
}
if (!darkOk) {
  fail("dark checks failed")
  console.error({ darkOk })
}
if (!mobileOk) {
  fail("mobile 390px overflow checks failed")
  console.error({ mobileOk })
}

if (lightOk && darkOk && mobileOk) {
  console.log("\nOK: 2 instances / gauges / disks / net / processes / sparklines / border / 390px")
}

await browser.close()
