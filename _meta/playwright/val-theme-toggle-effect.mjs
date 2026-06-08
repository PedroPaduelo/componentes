// scripts/val-theme-toggle-effect.mjs
// Validação visual Playwright: theme-toggle-effect (chanhdai vs vitrine)
//
// O que faz:
//   1. 4 prints principais (original light/dark, vitrine light/dark)
//   2. 3 JSONs de inspeção (original, vitrine light, vitrine dark)
//   3. 1 print de hover do botão toggle
//   4. 5 frames durante a View Transition (100/200/300/500/800ms)
//   5. Verifica suporte da View Transition API, frames diferentes, :root.dark mudou
//
// Uso: node scripts/val-theme-toggle-effect.mjs
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { createHash } from "node:crypto"

const OUT = "shots/theme-toggle-effect"
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }
const SEL = {
  wrapper: '[data-slot="theme-toggle-effect"]',
  // O site do chanhdai também tem data-slot? Vamos ver no inspect. Cai pra outros seletores comuns se precisar.
  fallback: 'button[aria-label*="heme" i], button[aria-label*="oggle" i]',
}

const ORIGINAL = "https://chanhdai.com/components/theme-toggle-effect"
const VITRINE = "http://localhost:5173/components/theme-toggle-effect"

const results = {
  viewport: VIEWPORT,
  startedAt: new Date().toISOString(),
  steps: [],
  problems: [],
  score: { total: 0, hits: 0 },
}

function step(name, data) {
  results.steps.push({ name, ...data })
  const tag = data.ok ? "✓" : "✗"
  console.log(`${tag} ${name}${data.note ? ` — ${data.note}` : ""}`)
}

function hash(buf) {
  return createHash("sha256").update(buf).digest("hex").slice(0, 16)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
})
// Garante que View Transitions estão disponíveis
const supportsVT = await ctx.newPage().then(async (p) => {
  await p.goto("about:blank")
  return p.evaluate(() => typeof document.startViewTransition === "function")
})
await ctx.newPage().then((p) => p.close())
results.steps.push({ name: "browser-capability", supportsViewTransitionAPI: supportsVT })
console.log(`viewTransition API: ${supportsVT ? "suportada" : "NÃO suportada"}`)

// ────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────
async function gotoWithSettle(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    console.warn(`  warn networkidle: ${e.message}`)
  }
  // chanhdai costuma ter animações; vitrine é rápida
  await page.waitForTimeout(url.includes("chanhdai.com") ? 3500 : 2000)
}

async function findToggle(page) {
  // Primeiro tenta o data-slot (vitrine); se não, procura por aria-label/role
  const candidates = [
    '[data-slot="theme-toggle-effect"]',
    'button[aria-label*="theme" i]',
    'button[aria-label*="Alternar" i]',
    'button[aria-label*="toggle" i]',
    '[role="button"][aria-label*="theme" i]',
  ]
  for (const sel of candidates) {
    const loc = page.locator(sel).first()
    if ((await loc.count()) > 0) {
      try {
        await loc.scrollIntoViewIfNeeded({ timeout: 1500 })
      } catch {}
      return { locator: loc, selector: sel }
    }
  }
  return { locator: null, selector: null }
}

async function inspectPage(page, label) {
  return await page.evaluate((sel) => {
    function rectOf(el) {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        top: Math.round(r.top),
        right: Math.round(r.right),
        bottom: Math.round(r.bottom),
        left: Math.round(r.left),
      }
    }
    function styleOf(el) {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        bg: s.backgroundColor,
        color: s.color,
        borderColor: s.borderColor,
        borderRadius: s.borderRadius,
        fontSize: s.fontSize,
      }
    }

    // Tenta encontrar o botão de toggle de várias formas
    const candidates = [
      '[data-slot="theme-toggle-effect"]',
      'button[aria-label*="theme" i]',
      'button[aria-label*="Alternar" i]',
      'button[aria-label*="toggle" i]',
      'header button[aria-label]',
    ]
    let toggle = null
    let matchedSelector = null
    for (const s of candidates) {
      const el = document.querySelector(s)
      if (el) {
        toggle = el
        matchedSelector = s
        break
      }
    }

    // Inspeciona ícones filhos (Sun/Moon do lucide-react = svg)
    const svgs = toggle ? Array.from(toggle.querySelectorAll("svg")) : []
    const icons = svgs.map((svg) => {
      const s = getComputedStyle(svg)
      return {
        tag: svg.tagName,
        classes: svg.getAttribute("class") || "",
        size: { w: Math.round(svg.getBoundingClientRect().width), h: Math.round(svg.getBoundingClientRect().height) },
        opacity: s.opacity,
        // lucide-react: <svg class="lucide lucide-sun"> ou lucide-moon
        iconName:
          (svg.getAttribute("class") || "").match(/lucide-([\w-]+)/)?.[1] ||
          svg.getAttribute("aria-label") ||
          null,
        display: s.display,
        position: s.position,
      }
    })

    // Documento / tema
    const html = document.documentElement
    const htmlClass = html.className
    const htmlDataTheme = html.getAttribute("data-theme")
    const bodyBg = getComputedStyle(document.body).backgroundColor
    const bodyColor = getComputedStyle(document.body).color

    // CSS keyframes custom? Procura no CSSOM
    let keyframes = []
    try {
      for (const sheet of Array.from(document.styleSheets)) {
        let rules
        try {
          rules = sheet.cssRules
        } catch {
          continue
        }
        if (!rules) continue
        for (const r of Array.from(rules)) {
          if (r.type === 7 /* CSSKeyframesRule */) {
            keyframes.push(r.name)
          }
        }
      }
    } catch {}

    // Suporte a View Transition API
    const supportsViewTransition = typeof document.startViewTransition === "function"

    return {
      url: location.href,
      htmlClass,
      htmlDataTheme,
      bodyBg,
      bodyColor,
      toggle: toggle
        ? {
            tag: toggle.tagName,
            matchedSelector,
            rect: rectOf(toggle),
            style: styleOf(toggle),
            dataSlot: toggle.getAttribute("data-slot"),
            dataVariant: toggle.getAttribute("data-variant"),
            dataWithEffect: toggle.getAttribute("data-with-effect"),
            ariaLabel: toggle.getAttribute("aria-label"),
            classes: toggle.className,
          }
        : null,
      icons,
      keyframes,
      supportsViewTransition,
    }
  })
}

// ────────────────────────────────────────────────────────────────────
// 1) ORIGINAL (chanhdai) — light
// ────────────────────────────────────────────────────────────────────
{
  const page = await ctx.newPage()
  try {
    await gotoWithSettle(page, ORIGINAL)
    await page.screenshot({ path: `${OUT}/original-light.png`, fullPage: false })
    step("original-light screenshot", { ok: true })
  } catch (e) {
    results.problems.push(`original-light: ${e.message}`)
    step("original-light screenshot", { ok: false, note: e.message })
  }

  // Inspect DOM (light)
  try {
    const info = await inspectPage(page, "original")
    writeFileSync(`${OUT}/inspect-original.json`, JSON.stringify(info, null, 2))
    step("inspect-original.json", { ok: true, note: `toggle=${info.toggle ? "found" : "MISSING"} via ${info.toggle?.matchedSelector}` })
  } catch (e) {
    results.problems.push(`inspect-original: ${e.message}`)
    step("inspect-original.json", { ok: false, note: e.message })
  }
  await page.close()
}

// ────────────────────────────────────────────────────────────────────
// 2) ORIGINAL (chanhdai) — dark
// ────────────────────────────────────────────────────────────────────
{
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    // chanhdai usa tema via next-themes; força dark via localStorage
    try { localStorage.setItem("theme", "dark") } catch {}
    try { localStorage.setItem("next-themes", "dark") } catch {}
  })
  try {
    await gotoWithSettle(page, ORIGINAL)
    // Confere se está dark; se não, clica
    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"))
    if (!isDark) {
      const t = await findToggle(page)
      if (t.locator) {
        await t.locator.click({ force: true }).catch(() => {})
        await page.waitForTimeout(800)
      }
    }
    await page.screenshot({ path: `${OUT}/original-dark.png`, fullPage: false })
    step("original-dark screenshot", { ok: true })
  } catch (e) {
    results.problems.push(`original-dark: ${e.message}`)
    step("original-dark screenshot", { ok: false, note: e.message })
  }
  await page.close()
}

// ────────────────────────────────────────────────────────────────────
// 3) VITRINE — light
// ────────────────────────────────────────────────────────────────────
let vitrineToggleSelector = null
{
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    try { localStorage.setItem("vitrine-theme", "light") } catch {}
  })
  try {
    await gotoWithSettle(page, VITRINE)
    await page.screenshot({ path: `${OUT}/vitrine-light.png`, fullPage: false })
    step("vitrine-light screenshot", { ok: true })

    const info = await inspectPage(page, "vitrine-light")
    vitrineToggleSelector = info.toggle?.matchedSelector || null
    if (info.toggle) {
      results.score.total++
      results.score.hits++
    } else {
      results.score.total++
    }
    writeFileSync(`${OUT}/inspect-vitrine-light.json`, JSON.stringify(info, null, 2))
    step("inspect-vitrine-light.json", { ok: true, note: `toggle=${info.toggle ? "found" : "MISSING"} via ${vitrineToggleSelector}` })

    // Hover no botão
    const t = await findToggle(page)
    if (t.locator) {
      await t.locator.hover({ force: true }).catch(() => {})
      await page.waitForTimeout(300)
      await page.screenshot({ path: `${OUT}/vitrine-light-hover.png`, fullPage: false })
      step("vitrine-light-hover screenshot", { ok: true })
    } else {
      results.problems.push("vitrine-light-hover: toggle não encontrado")
      step("vitrine-light-hover screenshot", { ok: false, note: "toggle não encontrado" })
    }
  } catch (e) {
    results.problems.push(`vitrine-light: ${e.message}`)
    step("vitrine-light screenshot", { ok: false, note: e.message })
  }
  await page.close()
}

// ────────────────────────────────────────────────────────────────────
// 4) VITRINE — dark
// ────────────────────────────────────────────────────────────────────
{
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    try { localStorage.setItem("vitrine-theme", "dark") } catch {}
  })
  try {
    await gotoWithSettle(page, VITRINE)
    await page.screenshot({ path: `${OUT}/vitrine-dark.png`, fullPage: false })
    step("vitrine-dark screenshot", { ok: true })

    const info = await inspectPage(page, "vitrine-dark")
    writeFileSync(`${OUT}/inspect-vitrine-dark.json`, JSON.stringify(info, null, 2))
    step("inspect-vitrine-dark.json", { ok: true, note: `toggle=${info.toggle ? "found" : "MISSING"}` })
  } catch (e) {
    results.problems.push(`vitrine-dark: ${e.message}`)
    step("vitrine-dark screenshot", { ok: false, note: e.message })
  }
  await page.close()
}

// ────────────────────────────────────────────────────────────────────
// 5) VIEW TRANSITION — captura 5 frames
// Estratégia: começa em light, clica no botão (vai pra dark) e captura
// screenshots em 100, 200, 300, 500, 800ms após o clique. Também salva
// o estado do :root.dark antes e depois para confirmar troca.
// ────────────────────────────────────────────────────────────────────
{
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    try { localStorage.setItem("vitrine-theme", "light") } catch {}
  })
  try {
    await gotoWithSettle(page, VITRINE)
    const t = await findToggle(page)
    if (!t.locator) throw new Error("toggle não encontrado na vitrine")

    // Garante tema light antes
    await page.evaluate(() => {
      const html = document.documentElement
      html.classList.remove("dark")
      html.classList.add("light")
    })
    await page.waitForTimeout(300)

    // Mede estado inicial (light)
    const before = await page.evaluate(() => {
      const html = document.documentElement
      return {
        htmlClass: html.className,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        supportsViewTransition: typeof document.startViewTransition === "function",
      }
    })
    step("transition: before", { ok: true, note: `class="${before.htmlClass}" bg=${before.bodyBg} supportsVT=${before.supportsViewTransition}` })

    // IMPORTANTE: dispara o click E mede os frames em paralelo.
    // Para não perder a transição, o click não pode ser bloqueante.
    // Usa page.evaluate pra chamar startViewTransition no DOM,
    // OU usa click() e mede tempo logo depois.
    //
    // Estratégia: clica e mede tempo real; tira 5 screenshots em janelas
    // curtas após o click. Como o transition.ready.resolve é assíncrono,
    // os frames entre 100-800ms pegam o meio da animação (círculo crescendo).
    const clickStart = Date.now()
    await t.locator.click({ force: true })

    // Captura frames em offsets fixos após o click
    const offsets = [100, 200, 300, 500, 800]
    const buffers = []
    let last = 0
    for (const ms of offsets) {
      const wait = ms - (Date.now() - clickStart)
      if (wait > 0) await page.waitForTimeout(wait)
      const buf = await page.screenshot({ fullPage: false })
      const path = `${OUT}/vitrine-light-transition-${ms}ms.png`
      writeFileSync(path, buf)
      buffers.push({ ms, path, hash: hash(buf), size: buf.length })
      last = ms
    }

    // Espera o resto da transição terminar
    await page.waitForTimeout(Math.max(0, 1500 - (Date.now() - clickStart)))

    const after = await page.evaluate(() => {
      const html = document.documentElement
      return {
        htmlClass: html.className,
        bodyBg: getComputedStyle(document.body).backgroundColor,
      }
    })
    step("transition: after", { ok: true, note: `class="${after.htmlClass}" bg=${after.bodyBg}` })

    // Verifica que pelo menos 2 dos 5 frames são DIFERENTES (transição rolou)
    const unique = new Set(buffers.map((b) => b.hash))
    const transitionAnimated = unique.size >= 2

    // Verifica que o tema MUDOU
    const themeChanged = before.htmlClass !== after.htmlClass || before.bodyBg !== after.bodyBg

    // Verifica se :root.dark está aplicado (dark no after)
    const becameDark = after.htmlClass.includes("dark")

    step("transition: 5 frames captured", { ok: true, note: `${buffers.length} frames, ${unique.size} únicos` })
    step("transition: frames diferentes", { ok: transitionAnimated, note: `${unique.size}/5 únicos` })
    step("transition: tema mudou", { ok: themeChanged, note: `"${before.htmlClass}" → "${after.htmlClass}"` })
    step("transition: virou dark", { ok: becameDark, note: becameDark ? "sim" : "NÃO" })

    // Salva metadados da transição
    writeFileSync(`${OUT}/transition-frames.json`, JSON.stringify({
      before,
      after,
      frames: buffers,
      uniqueHashes: unique.size,
      supportsViewTransition: before.supportsViewTransition,
      themeChanged,
      becameDark,
      transitionAnimated,
    }, null, 2))

    if (!transitionAnimated) results.problems.push("View Transition: 5 frames eram todos iguais (sem animação)")
    if (!themeChanged) results.problems.push("View Transition: tema não mudou após click")
    if (!becameDark) results.problems.push("View Transition: tema final não é dark (começou em light)")
  } catch (e) {
    results.problems.push(`transition: ${e.message}`)
    step("transition capture", { ok: false, note: e.message })
  }
  await page.close()
}

await browser.close()

// Resumo
const ok = results.steps.filter((s) => s.ok).length
const total = results.steps.length
console.log(`\n${ok}/${total} steps ok · ${results.problems.length} problemas`)
results.finishedAt = new Date().toISOString()
writeFileSync(`${OUT}/run-summary.json`, JSON.stringify(results, null, 2))
process.exit(results.problems.length > 0 ? 1 : 0)
