// Targeted inspection: find the actual ChevronsUpDownIcon component on the vitrine page
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "node:fs"

const OUT = "shots/chevrons-up-down-icon"
mkdirSync(OUT, { recursive: true })

const ORIGINAL = "https://chanhdai.com/components/chevrons-up-down-icon"
const VITRINE  = "http://localhost:5173/components/chevrons-up-down-icon"
const VP = { width: 1440, height: 900 }

const browser = await chromium.launch()

async function targetedInspect(url, label, dark = false, slot = "chevrons-up-down-icon") {
  const ctx = await browser.newContext({ viewport: VP })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 40000 })
  } catch (e) {
    console.warn(`[warn] ${label}: ${e.message}`)
  }
  await page.waitForTimeout(2500)

  // Find ALL elements with the target data-slot
  const data = await page.evaluate((args) => {
    const { slot, label, url, dark } = args
    const elements = Array.from(document.querySelectorAll(`[data-slot="${slot}"]`))
    if (elements.length === 0) {
      return { label, url, dark, found: false }
    }

    return elements.map((wrap, idx) => {
      const cs = getComputedStyle(wrap)
      const rect = wrap.getBoundingClientRect()

      const svgs = Array.from(wrap.querySelectorAll("svg")).map(svg => {
        const r = svg.getBoundingClientRect()
        const s = getComputedStyle(svg)
        const paths = Array.from(svg.querySelectorAll("path")).map(p => p.getAttribute("d")?.slice(0, 200) || "")
        const lines = Array.from(svg.querySelectorAll("line")).map(l => ({
          x1: l.getAttribute("x1"), y1: l.getAttribute("y1"),
          x2: l.getAttribute("x2"), y2: l.getAttribute("y2"),
        }))
        const polylines = Array.from(svg.querySelectorAll("polyline")).map(p => p.getAttribute("points")?.slice(0, 200) || "")
        return {
          viewBox: svg.getAttribute("viewBox"),
          className: (svg.getAttribute("class") || "").slice(0, 100),
          width: svg.getAttribute("width") || (svg.getBoundingClientRect().width + "px"),
          height: svg.getAttribute("height") || (svg.getBoundingClientRect().height + "px"),
          fill: s.fill,
          stroke: s.stroke,
          strokeWidth: s.strokeWidth,
          transform: s.transform,
          rotation: s.rotate,
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          paths,
          lines,
          polylines,
        }
      })

      const dataAttrs = {}
      for (const attr of wrap.attributes) {
        if (attr.name.startsWith("data-")) dataAttrs[attr.name] = attr.value
      }

      const animations = cs.animationName !== "none" ? {
        name: cs.animationName, duration: cs.animationDuration,
        timing: cs.animationTimingFunction, iterationCount: cs.animationIterationCount,
      } : null
      const transition = cs.transitionProperty !== "all" || cs.transitionDuration !== "0s" ? {
        property: cs.transitionProperty, duration: cs.transitionDuration, timing: cs.transitionTimingFunction,
      } : null

      return {
        index: idx,
        wrapper: {
          tag: wrap.tagName.toLowerCase(),
          className: (typeof wrap.className === "string" ? wrap.className : wrap.getAttribute("class") || "").slice(0, 200),
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
          bg: cs.backgroundColor,
          color: cs.color,
          dataAttrs,
          animations,
          transition,
          inlineStyle: wrap.getAttribute("style")?.slice(0, 200) || "",
        },
        svgs,
      }
    })
  }, { slot, label, url, dark })

  const jsonPath = `${OUT}/inspect-targeted-${label}.json`
  writeFileSync(jsonPath, JSON.stringify(data, null, 2))
  console.log(`✓ ${jsonPath} (${Array.isArray(data) ? data.length : (data.found === false ? 0 : 1)} elements)`)
  await page.close()
  await ctx.close()
  return data
}

const orig = await targetedInspect(ORIGINAL, "original")
const vl   = await targetedInspect(VITRINE,  "vitrine-light")
const vd   = await targetedInspect(VITRINE,  "vitrine-dark", true)

// For original, the data-slot is "context-menu-trigger" — re-check
const origCtx = await targetedInspect(ORIGINAL, "original-ctxmenu", false, "context-menu-trigger")

// Hover test on the actual component
async function targetedHover(url, label, dark = false, slot = "chevrons-up-down-icon") {
  const ctx = await browser.newContext({ viewport: VP })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 40000 })
  } catch (e) { console.warn(`[warn] hover ${label}: ${e.message}`) }
  await page.waitForTimeout(2000)

  const el = await page.$(`[data-slot="${slot}"]`)
  if (!el) {
    console.warn(`[warn] hover ${label}: no element with slot=${slot}`)
    await page.close()
    await ctx.close()
    return { found: false }
  }

  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const before = await el.screenshot({ path: `${OUT}/${label}-hover-before.png` })

  const beforeStyle = await el.evaluate(e => {
    const s = getComputedStyle(e)
    return { transform: s.transform, rotation: s.rotate, dataState: e.getAttribute("data-state") }
  })

  await el.hover()
  await page.waitForTimeout(600)

  const after = await el.screenshot({ path: `${OUT}/${label}-hover-after.png` })
  const afterStyle = await el.evaluate(e => {
    const s = getComputedStyle(e)
    return { transform: s.transform, rotation: s.rotate, dataState: e.getAttribute("data-state") }
  })

  // Click test
  await el.click()
  await page.waitForTimeout(600)
  const clickStyle = await el.evaluate(e => {
    const s = getComputedStyle(e)
    return { transform: s.transform, rotation: s.rotate, dataState: e.getAttribute("data-state") }
  })
  await el.screenshot({ path: `${OUT}/${label}-after-click.png` })

  console.log(`✓ hover ${label}: before=${JSON.stringify(beforeStyle)} after=${JSON.stringify(afterStyle)} click=${JSON.stringify(clickStyle)}`)
  await page.close()
  await ctx.close()
  return { found: true, before: beforeStyle, after: afterStyle, click: clickStyle }
}

const hoverVit = await targetedHover(VITRINE, "vitrine-light", false, "chevrons-up-down-icon")
const hoverOrig = await targetedHover(ORIGINAL, "original-light", false, "context-menu-trigger")

// Animation frame capture — 3 frames at 500ms apart
async function captureFrames(url, label, dark = false, slot = "chevrons-up-down-icon") {
  const ctx = await browser.newContext({ viewport: VP })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 40000 })
  } catch (e) { console.warn(`[warn] frames ${label}: ${e.message}`) }
  await page.waitForTimeout(2000)

  const el = await page.$(`[data-slot="${slot}"]`)
  if (!el) {
    await page.close()
    await ctx.close()
    return []
  }
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)

  const frames = []
  for (let i = 0; i < 3; i++) {
    await el.screenshot({ path: `${OUT}/${label}-targeted-frame${i}.png` })
    frames.push(`${OUT}/${label}-targeted-frame${i}.png`)
    await page.waitForTimeout(500)
  }
  console.log(`✓ frames ${label}: 3 captured`)
  await page.close()
  await ctx.close()
  return frames
}

const framesVit = await captureFrames(VITRINE, "vitrine-light", false, "chevrons-up-down-icon")
const framesOrig = await captureFrames(ORIGINAL, "original-light", false, "context-menu-trigger")

// Also try to get the original site in dark mode by clicking its theme toggle
async function originalInDark() {
  const ctx = await browser.newContext({ viewport: VP })
  const page = await ctx.newPage()
  try {
    await page.goto(ORIGINAL, { waitUntil: "networkidle", timeout: 40000 })
  } catch (e) { console.warn(`[warn] original-dark: ${e.message}`) }
  await page.waitForTimeout(2000)

  // Find theme toggle button (usually in header, has sun/moon icon)
  const themeBtn = await page.$('button[aria-label*="theme" i], button[aria-label*="Theme" i], [data-theme-toggle]')
  if (themeBtn) {
    await themeBtn.click()
    await page.waitForTimeout(1000)
    console.log('✓ clicked theme toggle on chanhdai.com')
  } else {
    // Try to find any button with sun/moon svg
    const sunMoonBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      for (const b of btns) {
        const svg = b.querySelector('svg')
        if (svg) {
          const cls = svg.getAttribute('class') || ''
          if (cls.includes('sun') || cls.includes('moon') || cls.includes('theme')) {
            b.click()
            return true
          }
        }
      }
      return false
    })
    console.log(`theme toggle found via SVG: ${sunMoonBtn}`)
  }

  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/original-dark-toggled.png` })
  console.log(`✓ original-dark-toggled.png`)
  await page.close()
  await ctx.close()
}

await originalInDark()

await browser.close()
console.log("Done")
