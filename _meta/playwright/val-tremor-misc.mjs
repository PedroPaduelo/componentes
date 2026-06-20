// _meta/playwright/val-tremor-misc.mjs
// Validador Playwright para os 9 componentes Tremor "misc" (UI + inputs + wrappers):
//   1. divider-tremor
//   2. tab-navigation-tremor          (role=tablist + role=tab + ≥2 tabs)
//   3. date-range-picker-tremor       (Button trigger + Calendar popover c/ 2 months)
//   4. radio-card-group-tremor        (role=radiogroup + role=radio + ≥2 cards)
//   5. card-tremor                    (Slot root c/ data-slot)
//   6. calendar-tremor                (wrapper do Calendar shadcn)
//   7. select-native-tremor           (select nativo + chevron overlay)
//   8. label-tremor                   (<label> + <input> pareado por htmlFor)
//   9. toggle-tremor                  (<button> c/ aria-pressed)
//
// Página de teste agregada: /tremor-test-misc (fullscreen, sem Layout).
// Valida light + dark. Falha se qualquer assert quebrar.

import { chromium } from "playwright"

import { outPath, saveJSON, shot } from "./_shots.mjs"

// URL do harness: configurável via env. Em dev local cai no Vite (porta 5173).
// Em CI / staging, sobrescreva com VITRINE_URL=http://host:porta/tremor-test-misc.
//
// IMPORTANTE: o servidor de PRODUÇÃO (dist/ estático) NÃO inclui a página de
// teste (criada nesta task) — o validador precisa de um dev server com HMR
// (ou de um rebuild de produção seguido de restart do processo).
const URL = process.env.VITRINE_URL ?? "http://localhost:5173/tremor-test-misc"

const MISC_SLUGS = [
  "divider-tremor",
  "tab-navigation-tremor",
  "date-range-picker-tremor",
  "radio-card-group-tremor",
  "card-tremor",
  "calendar-tremor",
  "select-native-tremor",
  "label-tremor",
  "toggle-tremor",
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1800 } })

const results = { light: {}, dark: {} }

async function validate(theme) {
  const page = await ctx.newPage()
  const consoleErrors = []
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })

  // Define o tema ANTES do primeiro paint — o ThemeProvider lê localStorage
  // no mount e injeta a class no <html>.
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("vitrine-theme", t)
    } catch {}
  }, theme)

  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1500)

  // Inspeção agregada: para cada misc, captura data-slot count + metadados
  // específicos (role, aria-*, contagens) via page.evaluate.
  const inspect = await page.evaluate((slugs) => {
    const out = {}
    for (const slug of slugs) {
      const els = Array.from(document.querySelectorAll(`[data-slot="${slug}"]`))
      const tremorEls = els.filter((el) => {
        const tid = el.getAttribute("tremor-id") ?? el.getAttribute("data-tremor-id")
        return tid === "tremor-raw"
      })
      const role = els[0]?.getAttribute("role") ?? null
      const ariaPressed = els[0]?.getAttribute("aria-pressed") ?? null
      const ariaLabel = els[0]?.getAttribute("aria-label") ?? null
      const dataOrientation = els[0]?.getAttribute("data-orientation") ?? null

      // tablist / tab — para tab-navigation-tremor
      let tablistCount = 0
      let tabCount = 0
      if (slug === "tab-navigation-tremor") {
        tablistCount = document.querySelectorAll(
          '[data-slot="tab-navigation-tremor"][role="tablist"]',
        ).length
        tabCount = document.querySelectorAll(
          '[data-slot="tab-navigation-tremor"] [role="tab"]',
        ).length
      }

      // date-range-picker-tremor — 1 Button trigger + 1 (opcional) Select preset
      let triggerButtonCount = 0
      let selectTriggersCount = 0
      if (slug === "date-range-picker-tremor") {
        const root = document.querySelector(
          '[data-slot="date-range-picker-tremor"]',
        )
        if (root) {
          triggerButtonCount = root.querySelectorAll("button").length
          // Select do shadcn tem role="combobox" no trigger
          selectTriggersCount = root.querySelectorAll(
            '[role="combobox"]',
          ).length
        }
      }

      // radio-card-group-tremor — role=radiogroup + role=radio
      let radiogroupCount = 0
      let radioCount = 0
      if (slug === "radio-card-group-tremor") {
        radiogroupCount = document.querySelectorAll(
          '[data-slot="radio-card-group-tremor"][role="radiogroup"]',
        ).length
        radioCount = document.querySelectorAll(
          '[data-slot="radio-card-group-tremor"] [role="radio"]',
        ).length
      }

      // select-native-tremor — <select> nativo dentro do wrapper
      let nativeSelectCount = 0
      if (slug === "select-native-tremor") {
        const root = document.querySelector(
          '[data-slot="select-native-tremor"]',
        )
        if (root) {
          nativeSelectCount = root.querySelectorAll("select").length
        }
      }

      // label-tremor — <label> dentro do wrapper
      let labelTagCount = 0
      if (slug === "label-tremor") {
        const root = document.querySelector('[data-slot="label-tremor"]')
        if (root) {
          labelTagCount = root.querySelectorAll("label").length
        }
      }

      // toggle-tremor — <button> com aria-pressed
      let pressedButtonCount = 0
      let unpressedButtonCount = 0
      if (slug === "toggle-tremor") {
        const buttons = document.querySelectorAll('[data-slot="toggle-tremor"]')
        pressedButtonCount = Array.from(buttons).filter(
          (b) => b.getAttribute("aria-pressed") === "true",
        ).length
        unpressedButtonCount = Array.from(buttons).filter(
          (b) => b.getAttribute("aria-pressed") === "false",
        ).length
      }

      // calendar-tremor — wrapper do Calendar shadcn (rdp)
      let rdpCount = 0
      if (slug === "calendar-tremor") {
        rdpCount = document.querySelectorAll(
          '[data-slot="calendar-tremor"] [class*="rdp"]',
        ).length
      }

      // divider-tremor — conta <hr> dentro do wrapper
      let hrCount = 0
      if (slug === "divider-tremor") {
        const root = document.querySelector('[data-slot="divider-tremor"]')
        if (root) hrCount = root.querySelectorAll("hr").length
      }

      out[slug] = {
        slotCount: els.length,
        tremorIdCount: tremorEls.length,
        role,
        ariaPressed,
        ariaLabel,
        dataOrientation,
        tablistCount,
        tabCount,
        triggerButtonCount,
        selectTriggersCount,
        radiogroupCount,
        radioCount,
        nativeSelectCount,
        labelTagCount,
        pressedButtonCount,
        unpressedButtonCount,
        rdpCount,
        hrCount,
      }
    }
    return out
  }, MISC_SLUGS)

  await shot(page, `tremor-misc-${theme}`, { fullPage: true })

  results[theme] = { inspect, consoleErrors }

  await page.close()
}

await validate("light")
await validate("dark")

await browser.close()

// Salva snapshot JSON para auditoria (apenas o `inspect` — não inclui
// consoleErrors pra não vazar HTML dos pages de erro).
saveJSON("tremor-misc/inspect", {
  light: results.light.inspect,
  dark: results.dark.inspect,
})

console.log("\n=== LIGHT ===")
console.log(JSON.stringify(results.light.inspect, null, 2))
console.log("\n=== DARK ===")
console.log(JSON.stringify(results.dark.inspect, null, 2))

let ok = true
function assert(name, cond) {
  console.log(`${cond ? "✓" : "✗"} ${name}`)
  if (!cond) ok = false
}

// =============================================================
// Asserções para os 9 misc (light + dark)
// =============================================================
for (const theme of ["light", "dark"]) {
  const r = results[theme].inspect
  const errors = results[theme].consoleErrors
  console.log(`\n--- [${theme}] ---`)

  // Genérico: cada data-slot presente ≥1x em ambos os temas
  for (const slug of MISC_SLUGS) {
    assert(
      `[${theme}] ${slug}: data-slot presente (≥1)`,
      r[slug].slotCount >= 1,
    )
    assert(
      `[${theme}] ${slug}: tremor-id="tremor-raw" presente (≥1)`,
      r[slug].tremorIdCount >= 1,
    )
  }

  // 1. divider-tremor: tem <hr> dentro do wrapper
  assert(
    `[${theme}] divider-tremor: ≥1 <hr> dentro do wrapper`,
    r["divider-tremor"].hrCount >= 1,
  )

  // 2. tab-navigation-tremor: role=tablist + ≥2 role=tab
  assert(
    `[${theme}] tab-navigation-tremor: role=tablist presente`,
    r["tab-navigation-tremor"].tablistCount >= 1,
  )
  assert(
    `[${theme}] tab-navigation-tremor: ≥2 abas (role=tab)`,
    r["tab-navigation-tremor"].tabCount >= 2,
  )

  // 3. date-range-picker-tremor: tem Button trigger (1)
  // O Select de presets é OPCIONAL (não contar se não foi passado no harness).
  assert(
    `[${theme}] date-range-picker-tremor: ≥1 button trigger (PopoverTrigger)`,
    r["date-range-picker-tremor"].triggerButtonCount >= 1,
  )

  // 4. radio-card-group-tremor: role=radiogroup + ≥2 role=radio
  assert(
    `[${theme}] radio-card-group-tremor: role=radiogroup presente`,
    r["radio-card-group-tremor"].radiogroupCount >= 1,
  )
  assert(
    `[${theme}] radio-card-group-tremor: ≥2 cards (role=radio)`,
    r["radio-card-group-tremor"].radioCount >= 2,
  )

  // 5. card-tremor: data-slot presente (já checado) — sem asserts extras

  // 6. calendar-tremor: wrapper do react-day-picker (classe rdp-*) presente
  assert(
    `[${theme}] calendar-tremor: ≥1 elemento rdp-* (react-day-picker) dentro do wrapper`,
    r["calendar-tremor"].rdpCount >= 1,
  )

  // 7. select-native-tremor: <select> nativo dentro do wrapper
  assert(
    `[${theme}] select-native-tremor: ≥1 <select> nativo dentro do wrapper`,
    r["select-native-tremor"].nativeSelectCount >= 1,
  )

  // 8. label-tremor: <label> dentro do wrapper
  assert(
    `[${theme}] label-tremor: ≥1 <label> dentro do wrapper`,
    r["label-tremor"].labelTagCount >= 1,
  )

  // 9. toggle-tremor: ≥1 toggle pressed (aria-pressed="true") + ≥1 unpressed
  assert(
    `[${theme}] toggle-tremor: ≥1 toggle pressed (aria-pressed="true")`,
    r["toggle-tremor"].pressedButtonCount >= 1,
  )
  assert(
    `[${theme}] toggle-tremor: ≥1 toggle unpressed (aria-pressed="false")`,
    r["toggle-tremor"].unpressedButtonCount >= 1,
  )

  // Console limpo (sem erro de runtime nos 9 misc)
  assert(
    `[${theme}] zero erros no console durante render dos 9 misc`,
    errors.length === 0,
  )
}

console.log(ok ? "\n✅ ALL CHECKS PASSED" : "\n❌ SOME CHECKS FAILED")
process.exit(ok ? 0 : 1)