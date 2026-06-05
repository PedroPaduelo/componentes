// scripts/val-theme-switcher.mjs
// Validação visual Playwright completa do componente theme-switcher
// Compara chanhdai.com (original) vs localhost:5173 (vitrine)
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = join(__dirname, "..", "shots", "theme-switcher")
mkdirSync(SHOTS_DIR, { recursive: true })

const log = (msg) => console.log(`[val] ${msg}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Helper: extrai info estrutural de um theme switcher na página
async function inspectThemeSwitcher(page, label) {
  return page.evaluate((lbl) => {
    const out = {
      label: lbl,
      url: location.href,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyColor: getComputedStyle(document.body).color,
      htmlClassList: Array.from(document.documentElement.classList),
      localStorageTheme: localStorage.getItem("vitrine-theme"),
      // Tenta achar o theme switcher por vários seletores
      candidates: [],
    }

    // Estratégia: encontrar elementos com data-slot relacionados a theme
    const slots = ["theme-switcher", "theme-toggle", "theme-toggle-effect", "mode-toggle"]
    const all = []
    for (const s of slots) {
      document.querySelectorAll(`[data-slot="${s}"]`).forEach((el) => all.push({ slot: s, el }))
    }
    // Também procurar buttons no header
    document.querySelectorAll("header button, [role='button']").forEach((el) => {
      const text = (el.textContent || "").trim()
      const aria = el.getAttribute("aria-label") || ""
      if (/theme|mode|dark|light|sun|moon/i.test(text + " " + aria) || el.querySelector("svg")) {
        if (!all.find((x) => x.el === el)) all.push({ slot: "header-button", el })
      }
    })

    out.candidates = all.map(({ slot, el }, i) => {
      const r = el.getBoundingClientRect()
      return {
        index: i,
        slot,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        tagName: el.tagName,
        role: el.getAttribute("role"),
        ariaLabel: el.getAttribute("aria-label"),
        text: (el.textContent || "").trim().slice(0, 80),
        dataAttrs: Object.fromEntries(
          Array.from(el.attributes).filter((a) => a.name.startsWith("data-")).map((a) => [a.name, a.value])
        ),
        classList: Array.from(el.classList).slice(0, 10),
        // Cor do bg/borda pra detectar tema visual
        bg: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color,
        borderColor: getComputedStyle(el).borderColor,
        hasSvg: !!el.querySelector("svg"),
        svgCount: el.querySelectorAll("svg").length,
      }
    })

    return out
  }, label)
}

// Helper: mede bg do body e <html>
async function measureTheme(page) {
  return page.evaluate(() => ({
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
    htmlClassList: Array.from(document.documentElement.classList),
    htmlDataTheme: document.documentElement.getAttribute("data-theme"),
    htmlBg: getComputedStyle(document.documentElement).backgroundColor,
    ls: localStorage.getItem("vitrine-theme"),
  }))
}

const browser = await chromium.launch()

// ============================================================
// 1. PRINTS BÁSICOS (4)
// ============================================================
log("=== 1. PRINTS BÁSICOS ===")

// Original LIGHT
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  try {
    await page.goto("https://chanhdai.com/components/theme-switcher", {
      waitUntil: "networkidle",
      timeout: 45000,
    })
  } catch (e) {
    log(`warn original light goto: ${e.message}`)
  }
  await sleep(3500)
  await page.screenshot({ path: join(SHOTS_DIR, "original-light.png") })
  log("✓ original-light.png")
  await ctx.close()
}

// Original DARK
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    try {
      localStorage.setItem("theme", "dark")
    } catch (e) {}
  })
  try {
    await page.goto("https://chanhdai.com/components/theme-switcher", {
      waitUntil: "networkidle",
      timeout: 45000,
    })
  } catch (e) {
    log(`warn original dark goto: ${e.message}`)
  }
  await sleep(3500)
  await page.screenshot({ path: join(SHOTS_DIR, "original-dark.png") })
  log("✓ original-dark.png")
  await ctx.close()
}

// Vitrine LIGHT
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  try {
    await page.goto("http://localhost:5173/components/theme-switcher", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    log(`warn vitrine light goto: ${e.message}`)
  }
  await sleep(2000)
  await page.screenshot({ path: join(SHOTS_DIR, "vitrine-light.png") })
  log("✓ vitrine-light.png")
  await ctx.close()
}

// Vitrine DARK
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    localStorage.setItem("vitrine-theme", "dark")
  })
  try {
    await page.goto("http://localhost:5173/components/theme-switcher", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    log(`warn vitrine dark goto: ${e.message}`)
  }
  await sleep(2000)
  await page.screenshot({ path: join(SHOTS_DIR, "vitrine-dark.png") })
  log("✓ vitrine-dark.png")
  await ctx.close()
}

// ============================================================
// 2. INSPEÇÃO DE DOM (3 JSONs)
// ============================================================
log("=== 2. INSPEÇÃO DE DOM ===")

// Inspect original
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  try {
    await page.goto("https://chanhdai.com/components/theme-switcher", {
      waitUntil: "networkidle",
      timeout: 45000,
    })
  } catch (e) {
    log(`warn inspect original: ${e.message}`)
  }
  await sleep(3000)
  const info = await inspectThemeSwitcher(page, "original")
  writeFileSync(join(SHOTS_DIR, "inspect-original.json"), JSON.stringify(info, null, 2))
  log("✓ inspect-original.json")
  await ctx.close()
}

// Inspect vitrine-light
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  try {
    await page.goto("http://localhost:5173/components/theme-switcher", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    log(`warn inspect vitrine-light: ${e.message}`)
  }
  await sleep(2000)
  const info = await inspectThemeSwitcher(page, "vitrine-light")
  writeFileSync(join(SHOTS_DIR, "inspect-vitrine-light.json"), JSON.stringify(info, null, 2))
  log("✓ inspect-vitrine-light.json")
  await ctx.close()
}

// Inspect vitrine-dark
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    localStorage.setItem("vitrine-theme", "dark")
  })
  try {
    await page.goto("http://localhost:5173/components/theme-switcher", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    log(`warn inspect vitrine-dark: ${e.message}`)
  }
  await sleep(2000)
  const info = await inspectThemeSwitcher(page, "vitrine-dark")
  writeFileSync(join(SHOTS_DIR, "inspect-vitrine-dark.json"), JSON.stringify(info, null, 2))
  log("✓ inspect-vitrine-dark.json")
  await ctx.close()
}

// ============================================================
// 3. INTERAÇÕES — popover + hover + seleção (vitrine)
// ============================================================
log("=== 3. INTERAÇÕES ===")

// Para as interações, vamos abrir a página em light, capturar o body bg inicial,
// depois clicar no trigger, screenshot do popover, hover em cada opção,
// e depois clicar em cada opção pra ver se o tema muda
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  // Garante que começamos em light
  await page.addInitScript(() => {
    localStorage.setItem("vitrine-theme", "light")
  })
  try {
    await page.goto("http://localhost:5173/components/theme-switcher", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    log(`warn interactions goto: ${e.message}`)
  }
  await sleep(2000)

  const initialTheme = await measureTheme(page)
  log(`initial: ${JSON.stringify(initialTheme)}`)

  // Tenta achar o botão trigger do theme switcher
  // Estratégia: procurar data-slot="theme-switcher" > button, ou um button com aria-label "theme"
  const triggerInfo = await page.evaluate(() => {
    // Possíveis triggers em ordem de preferência
    const selectors = [
      '[data-slot="theme-switcher"] button',
      '[data-slot="theme-toggle"] button',
      '[data-slot="theme-toggle-effect"]',
      'button[aria-label*="theme" i]',
      'button[aria-label*="Theme" i]',
      'header button:has(svg)',
    ]
    for (const sel of selectors) {
      const el = document.querySelector(sel)
      if (el) {
        const r = el.getBoundingClientRect()
        return {
          selector: sel,
          found: true,
          text: (el.textContent || "").trim().slice(0, 60),
          ariaLabel: el.getAttribute("aria-label"),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          isExpanded: el.getAttribute("aria-expanded"),
          dataState: el.getAttribute("data-state"),
        }
      }
    }
    return { found: false }
  })
  log(`trigger: ${JSON.stringify(triggerInfo)}`)

  if (!triggerInfo.found) {
    log("⚠ nenhum trigger de theme switcher encontrado!")
  } else {
    // 3.1 — Clicar no trigger para abrir o popover
    await page.click(triggerInfo.selector)
    await sleep(700)
    await page.screenshot({ path: join(SHOTS_DIR, "vitrine-light-popover-open.png") })
    log("✓ vitrine-light-popover-open.png")

    // Verifica se abriu
    const popoverState = await page.evaluate((sel) => {
      const trigger = document.querySelector(sel)
      return {
        triggerExpanded: trigger?.getAttribute("aria-expanded"),
        triggerDataState: trigger?.getAttribute("data-state"),
        // Procura pelo popover/menu
        popovers: Array.from(
          document.querySelectorAll(
            '[role="menu"], [role="listbox"], [role="dialog"], [data-state="open"]'
          )
        ).map((p) => {
          const r = p.getBoundingClientRect()
          return {
            role: p.getAttribute("role"),
            dataState: p.getAttribute("data-state"),
            dataSlot: p.getAttribute("data-slot"),
            rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
            text: (p.textContent || "").trim().slice(0, 200),
            items: Array.from(p.querySelectorAll('[role="menuitem"], [role="option"], button, [data-theme], [data-value]')).map(
              (it) => ({
                tag: it.tagName,
                role: it.getAttribute("role"),
                text: (it.textContent || "").trim().slice(0, 40),
                dataValue: it.getAttribute("data-value"),
                dataTheme: it.getAttribute("data-theme"),
                ariaChecked: it.getAttribute("aria-checked"),
                hasSvg: !!it.querySelector("svg"),
                svgHtml: it.querySelector("svg")?.outerHTML.slice(0, 200) || null,
              })
            ),
          }
        }),
      }
    }, triggerInfo.selector)
    log(`popover state: ${JSON.stringify(popoverState, null, 2)}`)

    // Salva snapshot do popover
    writeFileSync(join(SHOTS_DIR, "popover-state.json"), JSON.stringify(popoverState, null, 2))

    // 3.2 — Para cada opção de tema (light, dark, system): hover + click
    const themeValues = ["light", "dark", "system"]
    for (const themeVal of themeValues) {
      // Re-abre popover se fechou
      const stillOpen = await page.evaluate((sel) => {
        const t = document.querySelector(sel)
        return t?.getAttribute("aria-expanded") === "true" || t?.getAttribute("data-state") === "open"
      }, triggerInfo.selector)
      if (!stillOpen) {
        await page.click(triggerInfo.selector).catch(() => {})
        await sleep(400)
      }

      // Match mais flexível: aceita emoji/ícone ao lado (ex.: "Light☀️", "Dark", "System")
      const optByText = page.getByRole("menuitem").filter({ hasText: new RegExp(themeVal, "i") })
      const optFallback = page.locator(`[role="option"]`).filter({ hasText: new RegExp(themeVal, "i") })
      const optByButton = page.locator(`button`).filter({ hasText: new RegExp(themeVal, "i") })

      let target = null
      if ((await optByText.count()) > 0) target = optByText.first()
      else if ((await optFallback.count()) > 0) target = optFallback.first()
      else if ((await optByButton.count()) > 0) target = optByButton.first()
      else {
        log(`⚠ opção "${themeVal}" não encontrada`)
        continue
      }

      // Hover na opção
      await target.hover()
      await sleep(500)
      await page.screenshot({ path: join(SHOTS_DIR, `vitrine-light-hover-${themeVal}.png`) })
      log(`✓ vitrine-light-hover-${themeVal}.png`)

      // Clica na opção
      await target.click()
      await sleep(700)

      // Mede o tema atual
      const afterClick = await measureTheme(page)
      log(`after click ${themeVal}: ${JSON.stringify(afterClick)}`)
      writeFileSync(
        join(SHOTS_DIR, `vitrine-light-selected-${themeVal}-state.json`),
        JSON.stringify(afterClick, null, 2)
      )

      // Screenshot do estado final
      await page.screenshot({ path: join(SHOTS_DIR, `vitrine-light-selected-${themeVal}.png`) })
      log(`✓ vitrine-light-selected-${themeVal}.png`)
    }
  }

  await ctx.close()
}

await browser.close()
log("=== DONE ===")
