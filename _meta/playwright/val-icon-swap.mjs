// scripts/val-icon-swap.mjs
// Validação visual do componente icon-swap: original (chanhdai.com) vs vitrine (localhost:5173)
// Captura: light/dark, hover, mid-swap (50% transition), after-swap, after-revert
// Salva: prints + JSONs de inspeção + REPORT.md em shots/icon-swap/

import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

const OUT = "shots/icon-swap"
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function screenshot(page, path) {
  await page.screenshot({ path, fullPage: false })
  console.log(`  ✓ ${path}`)
}

async function inspectDOM(page, label) {
  const info = await page.evaluate(() => {
    // Procurar o wrapper do icon-swap
    const wrap = document.querySelector("[data-slot='icon-swap']")
    if (!wrap) return { error: "data-slot='icon-swap' not found", bodyHTML: document.body.innerHTML.slice(0, 500) }

    const rect = wrap.getBoundingClientRect()
    const cs = getComputedStyle(wrap)

    // Coletar todos os SVGs/filhos
    const children = Array.from(wrap.children).map((el, i) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return {
        index: i,
        tag: el.tagName,
        className: el.className,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        opacity: s.opacity,
        visibility: s.visibility,
        display: s.display,
        transition: s.transition,
        transform: s.transform,
        position: s.position,
        width: s.width,
        height: s.height,
        viewBox: el.getAttribute("viewBox") || null,
        // SVG internals
        innerHTML: el.innerHTML?.slice(0, 200) || null,
      }
    })

    // Classes de animação
    const allClasses = Array.from(wrap.querySelectorAll("*")).flatMap((el) =>
      Array.from(el.classList)
    )
    const animClasses = [...new Set(allClasses)].filter(
      (c) =>
        c.includes("animate") ||
        c.includes("fade") ||
        c.includes("scale") ||
        c.includes("rotate") ||
        c.includes("transition") ||
        c.includes("swap")
    )

    // CSS vars no wrapper
    const cssVars = {}
    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i]
      if (prop.startsWith("--")) cssVars[prop] = cs.getPropertyValue(prop)
    }

    // data-* attrs
    const dataAttrs = {}
    for (const attr of wrap.attributes) {
      if (attr.name.startsWith("data-")) dataAttrs[attr.name] = attr.value
    }

    return {
      wrapper: {
        rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        bg: cs.backgroundColor,
        color: cs.color,
        opacity: cs.opacity,
        transition: cs.transition,
        transform: cs.transform,
        overflow: cs.overflow,
        position: cs.position,
        display: cs.display,
        cssVars,
        dataAttrs,
        className: wrap.className,
        innerHTML: wrap.innerHTML.slice(0, 500),
      },
      children,
      animClasses,
      childCount: children.length,
    }
  })
  const jsonPath = `${OUT}/inspect-${label}.json`
  writeFileSync(jsonPath, JSON.stringify(info, null, 2))
  console.log(`  ✓ ${jsonPath}`)
  return info
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
const browser = await chromium.launch()
const results = {}

// ── ORIGINAL (chanhdai.com) ──
console.log("\n=== ORIGINAL (chanhdai.com/components/icon-swap) ===")
{
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await ctx.newPage()
  try {
    await page.goto("https://chanhdai.com/components/icon-swap", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    console.warn(`  warn original: ${e.message}`)
  }
  await page.waitForTimeout(3000)

  await screenshot(page, `${OUT}/original-light.png`)
  await inspectDOM(page, "original")

  // Dark mode original
  await page.evaluate(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.style.colorScheme = "dark"
  })
  await page.waitForTimeout(1000)
  await screenshot(page, `${OUT}/original-dark.png`)

  // Interações no original
  const origWrap = await page.$("[data-slot='icon-swap']")
  if (origWrap) {
    // Hover
    await origWrap.hover()
    await page.waitForTimeout(500)
    await screenshot(page, `${OUT}/original-light-hover.png`)

    // Click e capturar mid-transition
    await origWrap.click()
    await page.waitForTimeout(150) // ~50% de uma transição de ~300ms
    await screenshot(page, `${OUT}/original-light-mid-swap.png`)

    // Depois de 1s
    await page.waitForTimeout(850)
    await screenshot(page, `${OUT}/original-light-after-swap.png`)

    // Click de volta
    await origWrap.click()
    await page.waitForTimeout(1000)
    await screenshot(page, `${OUT}/original-light-after-revert.png`)
  }

  await ctx.close()
}

// ── VITRINE (localhost:5173) ──
console.log("\n=== VITRINE (localhost:5173/components/icon-swap) ===")
{
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await ctx.newPage()
  try {
    await page.goto("http://localhost:5173/components/icon-swap", {
      waitUntil: "networkidle",
      timeout: 15000,
    })
  } catch (e) {
    console.warn(`  warn vitrine: ${e.message}`)
  }
  await page.waitForTimeout(2000)

  await screenshot(page, `${OUT}/vitrine-light.png`)
  const vitrineLightInfo = await inspectDOM(page, "vitrine-light")

  // Dark mode vitrine
  await page.evaluate(() => {
    localStorage.setItem("vitrine-theme", "dark")
  })
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(2000)
  await screenshot(page, `${OUT}/vitrine-dark.png`)
  await inspectDOM(page, "vitrine-dark")

  // Voltar pra light pra testar interações
  await page.evaluate(() => {
    localStorage.setItem("vitrine-theme", "light")
  })
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  // Interações na vitrine
  const vitWrap = await page.$("[data-slot='icon-swap']")
  if (vitWrap) {
    // Estado inicial (já temos vitrine-light.png, mas vamos inspecionar)
    const initialState = await page.evaluate(() => {
      const wrap = document.querySelector("[data-slot='icon-swap']")
      return Array.from(wrap.children).map((el, i) => ({
        index: i,
        opacity: getComputedStyle(el).opacity,
        visibility: getComputedStyle(el).visibility,
        transform: getComputedStyle(el).transform,
        transition: getComputedStyle(el).transition,
      }))
    })
    console.log("  Initial state:", JSON.stringify(initialState))

    // Hover
    await vitWrap.hover()
    await page.waitForTimeout(500)
    await screenshot(page, `${OUT}/vitrine-light-hover.png`)

    // Click e capturar mid-transition
    await vitWrap.click()
    await page.waitForTimeout(150)
    await screenshot(page, `${OUT}/vitrine-light-mid-swap.png`)

    // Depois de 1s
    await page.waitForTimeout(850)
    await screenshot(page, `${OUT}/vitrine-light-after-swap.png`)

    const afterSwapState = await page.evaluate(() => {
      const wrap = document.querySelector("[data-slot='icon-swap']")
      return Array.from(wrap.children).map((el, i) => ({
        index: i,
        opacity: getComputedStyle(el).opacity,
        visibility: getComputedStyle(el).visibility,
        transform: getComputedStyle(el).transform,
      }))
    })
    console.log("  After swap state:", JSON.stringify(afterSwapState))

    // Click de volta
    await vitWrap.click()
    await page.waitForTimeout(1000)
    await screenshot(page, `${OUT}/vitrine-light-after-revert.png`)

    const afterRevertState = await page.evaluate(() => {
      const wrap = document.querySelector("[data-slot='icon-swap']")
      return Array.from(wrap.children).map((el, i) => ({
        index: i,
        opacity: getComputedStyle(el).opacity,
        visibility: getComputedStyle(el).visibility,
        transform: getComputedStyle(el).transform,
      }))
    })
    console.log("  After revert state:", JSON.stringify(afterRevertState))
  } else {
    console.warn("  ⚠ data-slot='icon-swap' not found on vitrine page!")
  }

  await ctx.close()
}

await browser.close()
console.log("\n✅ All screenshots saved to shots/icon-swap/")
