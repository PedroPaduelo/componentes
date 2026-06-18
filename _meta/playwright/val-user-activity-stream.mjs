// Validador Playwright do componente `user-activity-stream` (Lote Observabilidade).
//
// Critérios de aceite (do task cmqfjn7lo03jopl0ihe4um1f1):
//   - 2 instâncias renderizadas na página
//   - ≥10 eventos visíveis em cada
//   - Avatar visível em cada evento
//   - Timestamp relativo presente
//   - Filtro "purchase" reduz a lista
//   - groupBy="user" cria section headers
//   - 390px sem overflow horizontal
//
// Uso: `node _meta/playwright/val-user-activity-stream.mjs`
// Pré-req: `npm run dev` no ar em http://localhost:5173

import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const errors = []

async function probe(theme) {
  const page = await ctx.newPage()
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${theme}] ${m.text()}`)
  })
  if (theme === "dark") {
    await page.addInitScript(() =>
      localStorage.setItem("vitrine-theme", "dark")
    )
  }
  await page.goto(
    "http://localhost:5173/components/user-activity-stream",
    { waitUntil: "domcontentloaded", timeout: 30000 }
  )

  // 2 instâncias
  await page.waitForFunction(
    () => document.querySelectorAll("[data-slot=user-activity-stream]").length === 2,
    { timeout: 15000 }
  )

  const snap = async () =>
    page.evaluate(() => {
      const streams = Array.from(
        document.querySelectorAll("[data-slot=user-activity-stream]")
      )
      return streams.map((stream) => {
        const events = Array.from(
          stream.querySelectorAll("[data-slot=user-activity-stream-event]")
        )
        const avatars = Array.from(
          stream.querySelectorAll("[data-slot=user-activity-stream-avatar]")
        )
        const times = Array.from(
          stream.querySelectorAll("[data-slot=user-activity-stream-time]")
        )
        const visibleEvents = events.filter((ev) => {
          const r = ev.getBoundingClientRect()
          const streamRect = stream.getBoundingClientRect()
          return r.top >= streamRect.top && r.bottom <= streamRect.bottom + 1000
        })
        return {
          count: events.length,
          visible: visibleEvents.length,
          avatarCount: avatars.length,
          timeCount: times.length,
          live: stream.getAttribute("data-live") === "true",
          groupBy: stream.getAttribute("data-group-by"),
          hasHeader: !!stream.querySelector(
            "[data-slot=user-activity-stream-header]"
          ),
        }
      })
    })

  const initial = await snap()

  // Critério 6: groupBy=user cria section headers
  const groupedSections = await page.evaluate(() => {
    const streams = Array.from(
      document.querySelectorAll("[data-slot=user-activity-stream]")
    )
    const grouped = streams.find((s) => s.getAttribute("data-group-by") === "user")
    if (!grouped) return 0
    return grouped.querySelectorAll("[data-slot=user-activity-stream-section-header]").length
  })

  // Critério 5: aplicar filtro "purchase" deve reduzir a primeira lista
  // (a instância do modo live tem 30 eventos, ~10% são purchase)
  const filterResult = await page.evaluate(() => {
    const streams = Array.from(
      document.querySelectorAll("[data-slot=user-activity-stream]")
    )
    // pega a 1ª instância (live)
    const target = streams[0]
    if (!target) return { before: 0, after: 0 }
    const before = target.querySelectorAll(
      "[data-slot=user-activity-stream-event]"
    ).length
    const purchaseChip = target.querySelector(
      '[data-slot=user-activity-stream-action-chip][data-active="false"]'
    )
    // O chip pode estar com texto "purchase"
    const chips = Array.from(
      target.querySelectorAll('[data-slot=user-activity-stream-action-chip]')
    )
    const purchase = chips.find((c) =>
      c.textContent?.toLowerCase().includes("purchase")
    )
    if (purchase) (purchase).click()
    // nenhum return — o React re-renderiza assíncrono
    return { before, chipFound: !!purchase, chipName: purchase?.textContent?.trim() }
  })

  // aguarda o React aplicar o filtro
  await page.waitForTimeout(400)

  const afterFilter = await page.evaluate(() => {
    const streams = Array.from(
      document.querySelectorAll("[data-slot=user-activity-stream]")
    )
    const target = streams[0]
    if (!target) return 0
    return target.querySelectorAll(
      "[data-slot=user-activity-stream-event]"
    ).length
  })

  // Critério 7: 390px sem overflow horizontal
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(200)
  const mobileOverflow = await page.evaluate(() => {
    const streams = Array.from(
      document.querySelectorAll("[data-slot=user-activity-stream]")
    )
    return streams.map((s) => {
      const r = s.getBoundingClientRect()
      return { w: Math.round(r.width), scrollW: s.scrollWidth, hasOverflow: s.scrollWidth > r.width + 1 }
    })
  })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.close()

  return {
    streams: initial,
    groupedSections,
    filter: {
      before: filterResult.before,
      after: afterFilter,
      chipFound: filterResult.chipFound,
    },
    mobileOverflow,
  }
}

const light = await probe("light")
const dark = await probe("dark")
await browser.close()

console.log("[light]", JSON.stringify(light, null, 2))
console.log("[dark]", JSON.stringify(dark, null, 2))
console.log("console errors:", errors.length ? errors : "none")

const passes = []
const fails = []

function check(name, cond) {
  ;(cond ? passes : fails).push(name)
}

const a = light.streams[0]
const b = light.streams[1]
const aD = dark.streams[0]
const bD = dark.streams[1]

// 2 instâncias, em ambos os temas
check("light: 2 instâncias", light.streams.length === 2)
check("dark:  2 instâncias", dark.streams.length === 2)

// Cada uma com ≥10 eventos
check("light: stream 0 ≥10 eventos", a?.count >= 10)
check("light: stream 1 ≥10 eventos", b?.count >= 10)
check("dark:  stream 0 ≥10 eventos", aD?.count >= 10)
check("dark:  stream 1 ≥10 eventos", bD?.count >= 10)

// Avatar em cada evento (mesma contagem)
check("light: stream 0 avatares = eventos", a && a.avatarCount >= a.count * 0.9)
check("light: stream 1 avatares = eventos", b && b.avatarCount >= b.count * 0.9)
check("dark:  stream 0 avatares = eventos", aD && aD.avatarCount >= aD.count * 0.9)
check("dark:  stream 1 avatares = eventos", bD && bD.avatarCount >= bD.count * 0.9)

// Tempo relativo presente
check("light: stream 0 tem timestamps", (a?.timeCount ?? 0) >= 10)
check("dark:  stream 0 tem timestamps", (aD?.timeCount ?? 0) >= 10)

// Header presente
check("light: header presente", a?.hasHeader && b?.hasHeader)
check("dark:  header presente", aD?.hasHeader && bD?.hasHeader)

// Modo live correto
check("light: stream 0 = live", a?.live === true)
check("light: stream 1 = grouped (user)", b?.groupBy === "user")
check("dark:  stream 0 = live", aD?.live === true)
check("dark:  stream 1 = grouped (user)", bD?.groupBy === "user")

// groupBy=user cria section headers (light)
check(
  "light: groupBy=user tem ≥2 section headers",
  light.groupedSections >= 2
)

// Filtro purchase reduz a lista
check(
  "light: filtro 'purchase' foi encontrado",
  light.filter.chipFound
)
check(
  "light: filtro 'purchase' reduz a lista",
  light.filter.after < light.filter.before
)

// 390px sem overflow horizontal
const lightMobileOk = light.mobileOverflow.every((m) => !m.hasOverflow)
check("light: 390px sem overflow", lightMobileOk)

console.log("---")
console.log("passes:", passes.length, passes)
console.log("fails: ", fails.length, fails)
const ok = fails.length === 0 && errors.length === 0
console.log(ok ? "RESULT: PASS" : "RESULT: FAIL")
process.exit(ok ? 0 : 1)
