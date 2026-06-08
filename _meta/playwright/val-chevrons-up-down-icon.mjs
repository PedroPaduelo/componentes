// Validação visual: chevrons-up-down-icon
// Compara chanhdai.com vs vitrine (localhost:5173)
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "node:fs"

const OUT = "shots/chevrons-up-down-icon"
mkdirSync(OUT, { recursive: true })

const ORIGINAL = "https://chanhdai.com/components/chevrons-up-down-icon"
const VITRINE  = "http://localhost:5173/components/chevrons-up-down-icon"
const VP = { width: 1440, height: 900 }

const browser = await chromium.launch()

// ─── 1. PRINTS INICIAIS ─────────────────────────────────────────────

async function screenshot(url, label, dark = false) {
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
  await page.waitForTimeout(3000)
  const path = `${OUT}/${label}.png`
  await page.screenshot({ path, fullPage: false })
  console.log(`✓ ${path}`)
  await page.close()
  await ctx.close()
  return path
}

await screenshot(ORIGINAL, "original-light")
await screenshot(ORIGINAL, "original-dark", true)
await screenshot(VITRINE,  "vitrine-light")
await screenshot(VITRINE,  "vitrine-dark", true)

// ─── 2. INSPEÇÃO DOM ─────────────────────────────────────────────────

async function inspectDOM(url, label, dark = false) {
  const ctx = await browser.newContext({ viewport: VP })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 40000 })
  } catch (e) {
    console.warn(`[warn] inspect ${label}: ${e.message}`)
  }
  await page.waitForTimeout(2000)

  const data = await page.evaluate((args) => {
    const { label, url, dark } = args
    // Find the component wrapper — try data-slot first, then common selectors
    const wrap = document.querySelector("[data-slot]") ||
                 document.querySelector(".preview-area") ||
                 document.querySelector("[class*='component']") ||
                 document.body

    const cs = getComputedStyle(wrap)
    const rect = wrap.getBoundingClientRect()

    // Collect children info
    const children = Array.from(wrap.children).map(el => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      const cn = (el.className && typeof el.className === "string")
        ? el.className.slice(0, 80)
        : (el.getAttribute && el.getAttribute("class")?.slice(0, 80)) || ""
      return {
        tag: el.tagName.toLowerCase(),
        className: cn,
        text: el.textContent?.trim().slice(0, 60) || "",
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        bg: s.backgroundColor,
        color: s.color,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
      }
    })

    // Find SVGs
    const svgs = Array.from(wrap.querySelectorAll("svg")).map(svg => {
      const r = svg.getBoundingClientRect()
      const s = getComputedStyle(svg)
      const paths = Array.from(svg.querySelectorAll("path")).map(p => p.getAttribute("d")?.slice(0, 200) || "")
      return {
        viewBox: svg.getAttribute("viewBox"),
        width: svg.getAttribute("width"),
        height: svg.getAttribute("height"),
        fill: s.fill,
        stroke: s.stroke,
        strokeWidth: s.strokeWidth,
        transform: s.transform,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        paths,
      }
    })

    // CSS custom properties
    const style = cs
    const customProps = {}
    for (let i = 0; i < style.length; i++) {
      const prop = style[i]
      if (prop.startsWith("--")) {
        customProps[prop] = style.getPropertyValue(prop).trim()
      }
    }

    // data-* attributes
    const dataAttrs = {}
    for (const attr of wrap.attributes) {
      if (attr.name.startsWith("data-")) {
        dataAttrs[attr.name] = attr.value
      }
    }

    // Check for animations/transitions
    const animations = cs.animationName !== "none" ? {
      name: cs.animationName,
      duration: cs.animationDuration,
      timing: cs.animationTimingFunction,
      iterationCount: cs.animationIterationCount,
    } : null
    const transition = cs.transitionProperty !== "all" || cs.transitionDuration !== "0s" ? {
      property: cs.transitionProperty,
      duration: cs.transitionDuration,
      timing: cs.transitionTimingFunction,
    } : null

    return {
      label,
      url,
      dark,
      wrapper: {
        tag: wrap.tagName.toLowerCase(),
        className: wrap.className?.slice(0, 100) || "",
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        bg: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        dataAttrs,
        customProps: Object.fromEntries(
          Object.entries(customProps).filter(([k]) =>
            k.startsWith("--color-") || k.startsWith("--font-") || k.startsWith("--text-") || k.startsWith("--radius") || k === "--background" || k === "--foreground" || k === "--border" || k === "--accent" || k === "--muted" || k === "--primary" || k === "--secondary" || k === "--ring" || k === "--card" || k === "--popover" || k === "--destructive"
          )
        ),
        animations,
        transition,
      },
      svgs,
      children: children.slice(0, 20),
    }
  }, { label, url, dark })

  const jsonPath = `${OUT}/inspect-${label}.json`
  writeFileSync(jsonPath, JSON.stringify(data, null, 2))
  console.log(`✓ ${jsonPath}`)
  await page.close()
  await ctx.close()
  return data
}

const origData   = await inspectDOM(ORIGINAL, "original")
const vlData     = await inspectDOM(VITRINE,  "vitrine-light")
const vdData     = await inspectDOM(VITRINE,  "vitrine-dark", true)

// ─── 3. HOVER TESTS ──────────────────────────────────────────────────

async function hoverTest(url, label, dark = false) {
  const ctx = await browser.newContext({ viewport: VP })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 40000 })
  } catch (e) {
    console.warn(`[warn] hover ${label}: ${e.message}`)
  }
  await page.waitForTimeout(2000)

  // Find the icon/button to hover
  const iconSel = "[data-slot], svg, button, [class*='icon'], [class*='chevron']"
  const el = await page.$(iconSel)

  let hoverInfo = { found: false }

  if (el) {
    // Screenshot before hover
    const beforePath = `${OUT}/${label}-hover-before.png`
    await page.screenshot({ path: beforePath, fullPage: false })

    // Get computed style before
    const styleBefore = await el.evaluate(e => {
      const s = getComputedStyle(e)
      return { color: s.color, bg: s.backgroundColor, transform: s.transform, opacity: s.opacity, fill: s.fill, stroke: s.stroke }
    })

    // Hover
    await el.hover()
    await page.waitForTimeout(500)

    // Get computed style after
    const styleAfter = await el.evaluate(e => {
      const s = getComputedStyle(e)
      return { color: s.color, bg: s.backgroundColor, transform: s.transform, opacity: s.opacity, fill: s.fill, stroke: s.stroke }
    })

    // Screenshot after hover
    const afterPath = `${OUT}/${label}-hover-after.png`
    await page.screenshot({ path: afterPath, fullPage: false })

    hoverInfo = { found: true, styleBefore, styleAfter, changed: JSON.stringify(styleBefore) !== JSON.stringify(styleAfter) }
    console.log(`✓ hover ${label}: changed=${hoverInfo.changed}`)
  } else {
    console.warn(`[warn] hover ${label}: no icon element found`)
  }

  await page.close()
  await ctx.close()
  return hoverInfo
}

const hoverOrigLight = await hoverTest(ORIGINAL, "original-light")
const hoverVitLight  = await hoverTest(VITRINE,  "vitrine-light")

// ─── 4. ANIMATION FRAMES (if continuous animation detected) ──────────

async function captureAnimationFrames(url, label, dark = false) {
  const ctx = await browser.newContext({ viewport: VP })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 40000 })
  } catch (e) {
    console.warn(`[warn] anim ${label}: ${e.message}`)
  }
  await page.waitForTimeout(1000)

  const frames = []
  for (let i = 0; i < 3; i++) {
    const path = `${OUT}/${label}-frame${i}.png`
    await page.screenshot({ path, fullPage: false })
    frames.push(path)
    await page.waitForTimeout(500)
  }

  console.log(`✓ animation frames ${label}: ${frames.length} frames`)
  await page.close()
  await ctx.close()
  return frames
}

const animOrig = await captureAnimationFrames(ORIGINAL, "original-light")
const animVit  = await captureAnimationFrames(VITRINE,  "vitrine-light")

// ─── 5. CLICK TEST (if interactive) ──────────────────────────────────

async function clickTest(url, label, dark = false) {
  const ctx = await browser.newContext({ viewport: VP })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 40000 })
  } catch (e) {
    console.warn(`[warn] click ${label}: ${e.message}`)
  }
  await page.waitForTimeout(2000)

  const iconSel = "[data-slot], svg, button, [class*='icon'], [class*='chevron']"
  const el = await page.$(iconSel)

  let clickInfo = { found: false, stateChanged: false }
  if (el) {
    const before = await page.screenshot()
    await el.click()
    await page.waitForTimeout(500)
    const after = await page.screenshot({ path: `${OUT}/${label}-after-click.png` })
    clickInfo = { found: true, screenshotTaken: true }
    console.log(`✓ click ${label}: screenshot taken`)
  } else {
    console.warn(`[warn] click ${label}: no element found`)
  }

  await page.close()
  await ctx.close()
  return clickInfo
}

const clickOrig = await clickTest(ORIGINAL, "original-light")
const clickVit  = await clickTest(VITRINE,  "vitrine-light")

await browser.close()

// ─── 6. SUMMARY ──────────────────────────────────────────────────────

console.log("\n═══════════════════════════════════════")
console.log("VALIDAÇÃO COMPLETA: chevrons-up-down-icon")
console.log("═══════════════════════════════════════")
console.log(`Original wrapper: ${JSON.stringify(origData.wrapper.rect)}`)
console.log(`Vitrine-L wrapper: ${JSON.stringify(vlData.wrapper.rect)}`)
console.log(`Vitrine-D wrapper: ${JSON.stringify(vdData.wrapper.rect)}`)
console.log(`Original SVGs: ${origData.svgs.length}`)
console.log(`Vitrine-L SVGs: ${vlData.svgs.length}`)
console.log(`Hover original changed: ${hoverOrigLight.changed}`)
console.log(`Hover vitrine changed: ${hoverVitLight.changed}`)
console.log(`Files in ${OUT}/:`)
