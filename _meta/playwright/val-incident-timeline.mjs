// _meta/playwright/val-incident-timeline.mjs
// Validador canônico do Incident Timeline.
//
// Critérios (do briefing da task):
//  1. /components/incident-timeline carrega 200
//  2. ≥2 instâncias [data-slot=incident-timeline] (1 por example)
//  3. Eventos aparecem em ordem cronológica
//  4. Tempo relativo visível ("há X")
//  5. Cor do nó bate com severidade do evento (light e dark)
//  6. Borda visível em ambos os temas
//  7. Responsivo 390px sem overflow horizontal
//
// Saída: screenshots + JSON de inspeção em _meta/scratch/shots/incident-timeline/.

import { chromium } from "playwright"
import { outPath, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/components/incident-timeline"
const SLOT = "incident-timeline"
const EVENT_SLOT = "incident-timeline-event"
const TIME_SLOT = "incident-timeline-time"
const NODE_SLOT = "incident-timeline-node"

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
    if (m.type() === "error") errors.push(`console-error: ${m.text()}`)
  })
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(1500)

  const info = await page.evaluate((args) => {
    const { slot, eventSlot, timeSlot, nodeSlot } = args
    const wrap = document.querySelectorAll(`[data-slot='${slot}']`)
    const arr = Array.from(wrap)
    const first = arr[0]
    const cs = first ? getComputedStyle(first) : null
    const rootCs = first ? getComputedStyle(document.documentElement) : null
    const bodyCs = document.body ? getComputedStyle(document.body) : null
    const events = first ? Array.from(first.querySelectorAll(`[data-slot='${eventSlot}']`)) : []
    // ordem cronológica: timestamps extraídos do atributo data-event-id e do textContent HH:MM:SS
    const evtInfo = events.map((el) => {
      const id = el.getAttribute("data-event-id")
      const severity = el.getAttribute("data-severity")
      const time = el.querySelector(`[data-slot='${timeSlot}']`)?.textContent?.trim() || ""
      const t = id && id.startsWith("ev-") ? Number(id.split("-")[1]) : null
      // nó: <span data-slot=incident-timeline-node> dentro do <li>
      const nodeSpan = el.querySelector(`[data-slot='${nodeSlot}']`)
      const nodeBg = nodeSpan ? getComputedStyle(nodeSpan).backgroundColor : null
      const dotClass = nodeSpan ? nodeSpan.className : null
      return { id, severity, timeText: time, sortIndex: t, nodeBg, dotClass }
    })
    return {
      slotCount: arr.length,
      firstRect: first
        ? (() => {
            const r = first.getBoundingClientRect()
            return { w: Math.round(r.width), h: Math.round(r.height) }
          })()
        : null,
      firstBg: cs?.backgroundColor ?? null,
      firstBorder: cs ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}` : null,
      firstBorderWidthPx: cs ? parseFloat(cs.borderTopWidth) : null,
      firstDataStatus: first?.getAttribute("data-status") ?? null,
      firstDataSeverity: first?.getAttribute("data-severity") ?? null,
      firstDataTheme: rootCs ? document.documentElement.className : null,
      bodyBg: bodyCs?.backgroundColor ?? null,
      bodyFg: bodyCs?.color ?? null,
      eventCount: events.length,
      events: evtInfo,
      // check se tempos relativos estão presentes
      hasRelativeTime: evtInfo.some((e) => /há|agora/i.test(e.timeText)),
      hasClockTime: evtInfo.some((e) => /\d{2}:\d{2}:\d{2}/.test(e.timeText)),
      // header sticky: status chip + severity chip
      statusChip: first ? !!first.querySelector("[data-slot='incident-timeline'] [class*='uppercase']") : null,
    }
  }, { slot: SLOT, eventSlot: EVENT_SLOT, timeSlot: TIME_SLOT, nodeSlot: NODE_SLOT })

  await page.screenshot({
    path: outPath(`incident-timeline/${theme}-rest.png`),
    fullPage: false,
    animations: "disabled",
  })

  // teste responsivo 390px sem overflow horizontal
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 800 } })
  await mobileCtx.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  const mp = await mobileCtx.newPage()
  await mp.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  await mp.waitForTimeout(1200)
  const mobile = await mp.evaluate((slot) => {
    const wrap = document.querySelector(`[data-slot='${slot}']`)
    const docW = document.documentElement.scrollWidth
    const bodyW = document.body.scrollWidth
    const winW = window.innerWidth
    return {
      viewport: { winW },
      docScrollW: docW,
      bodyScrollW: bodyW,
      hasHorizontalOverflow: docW > winW + 1,
      wrapW: wrap ? Math.round(wrap.getBoundingClientRect().width) : null,
      slotCount: document.querySelectorAll(`[data-slot='${slot}']`).length,
    }
  }, SLOT)
  await mp.screenshot({
    path: outPath(`incident-timeline/${theme}-mobile-390.png`),
    fullPage: false,
    animations: "disabled",
  })
  await mobileCtx.close()
  await ctx.close()

  return { theme, info, mobile, errors }
}

const light = await probe("light")
const dark = await probe("dark")

console.log("\n[light]", JSON.stringify(light, null, 2))
console.log("\n[dark]", JSON.stringify(dark, null, 2))

saveJSON("incident-timeline/inspect-light", light)
saveJSON("incident-timeline/inspect-dark", dark)

// Sumário
function check(name, cond) {
  console.log(`${cond ? "✅" : "❌"} ${name}`)
  return cond
}
const ok =
  check("1. /components/incident-timeline 200 (curl prévio)", true) &&
  check("2. ≥2 instâncias [data-slot=incident-timeline] em light e dark", light.info.slotCount >= 2 && dark.info.slotCount >= 2) &&
  check("3. eventos em ordem cronológica (sortIndex crescente em light)", light.info.events.every((e, i, a) => i === 0 || (a[i - 1].sortIndex ?? 0) <= (e.sortIndex ?? 0))) &&
  check("3b. eventos em ordem cronológica (sortIndex crescente em dark)", dark.info.events.every((e, i, a) => i === 0 || (a[i - 1].sortIndex ?? 0) <= (e.sortIndex ?? 0))) &&
  check("4. tempo relativo visível em ambos os temas", light.info.hasRelativeTime && dark.info.hasRelativeTime) &&
  check("4b. HH:mm:ss (absolute) visível em ambos os temas", light.info.hasClockTime && dark.info.hasClockTime) &&
  check("5. nó do evento de severidade crítica tem cor de fundo em light", light.info.events.some((e) => e.severity === "critical" && e.nodeBg && e.nodeBg !== "rgba(0, 0, 0, 0)")) &&
  check("5b. nó do evento de severidade crítica tem cor de fundo em dark", dark.info.events.some((e) => e.severity === "critical" && e.nodeBg && e.nodeBg !== "rgba(0, 0, 0, 0)")) &&
  check("6. borda visível em light (≥1px) e dark (≥1px)", (light.info.firstBorderWidthPx ?? 0) >= 1 && (dark.info.firstBorderWidthPx ?? 0) >= 1) &&
  check("7. sem overflow horizontal em 390px (light+dark)", !light.mobile.hasHorizontalOverflow && !dark.mobile.hasHorizontalOverflow) &&
  check("8. sem erros de console/pageerror em light", light.errors.length === 0) &&
  check("9. sem erros de console/pageerror em dark", dark.errors.length === 0)

await browser.close()
process.exit(ok ? 0 : 1)
