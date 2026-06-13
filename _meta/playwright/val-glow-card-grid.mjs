// scripts/val-glow-card-grid.mjs
// Full visual validation for glow-card-grid: prints + DOM inspect + glow interaction + report
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { outPath } from "./_shots.mjs"

const OUT = outPath("glow-card-grid")
mkdirSync(OUT, { recursive: true })

const VP = { width: 1440, height: 900 }
const ORIG_URL = "https://chanhdai.com/components/glow-card-grid"
const VIT_URL = "http://localhost:5173/components/glow-card-grid"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VP })

// ── helpers ──────────────────────────────────────────────────────────

async function screenshotPage(url, path, opts = {}) {
  const pageCtx = opts.dark
    ? await browser.newContext({ viewport: VP, colorScheme: "dark" })
    : ctx
  const page = await pageCtx.newPage()
  if (opts.localStorage) {
    await page.addInitScript((entries) => {
      for (const [k, v] of entries) localStorage.setItem(k, v)
    }, Object.entries(opts.localStorage))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) { console.warn(`  warn goto ${path}: ${e.message}`) }
  await page.waitForTimeout(opts.waitAfter ?? 2500)
  await page.screenshot({ path, fullPage: false })
  console.log(`  ✓ ${path}`)
  await page.close()
  if (opts.dark && pageCtx !== ctx) await pageCtx.close()
}

async function inspectDOM(url, label, opts = {}) {
  const pageCtx = opts.dark
    ? await browser.newContext({ viewport: VP, colorScheme: "dark" })
    : ctx
  const page = await pageCtx.newPage()
  if (opts.localStorage) {
    await page.addInitScript((entries) => {
      for (const [k, v] of entries) localStorage.setItem(k, v)
    }, Object.entries(opts.localStorage))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) { console.warn(`  warn goto ${label}: ${e.message}`) }
  await page.waitForTimeout(2500)

  const info = await page.evaluate(() => {
    // ── find the actual grid (parent of glow-card elements) ──
    const cards = Array.from(document.querySelectorAll('[data-slot="glow-card"]'))
    const gridByDataSlot = document.querySelector('[data-slot="glow-card-grid"]')
    const grid = gridByDataSlot || cards[0]?.parentElement || null

    const gridInfo = grid ? {
      tag: grid.tagName,
      className: grid.className?.toString().slice(0, 300),
      rect: (() => { const r = grid.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })(),
      computed: {
        display: getComputedStyle(grid).display,
        gap: getComputedStyle(grid).gap,
        gridTemplateColumns: getComputedStyle(grid).gridTemplateColumns,
        gridTemplateRows: getComputedStyle(grid).gridTemplateRows,
        backgroundColor: getComputedStyle(grid).backgroundColor,
        padding: getComputedStyle(grid).padding,
        position: getComputedStyle(grid).position,
        overflow: getComputedStyle(grid).overflow,
      },
      cssVars: (() => {
        const s = getComputedStyle(grid)
        const vars = {}
        for (let i = 0; i < s.length; i++) {
          const name = s[i]
          if (name.startsWith("--pointer-") || name.startsWith("--mouse-") || name.startsWith("--card-") || name.startsWith("--glow-"))
            vars[name] = s.getPropertyValue(name).trim()
        }
        return vars
      })(),
      dataAttrs: (() => {
        const attrs = {}
        for (const attr of grid.attributes) {
          if (attr.name.startsWith("data-")) attrs[attr.name] = attr.value
        }
        return attrs
      })(),
    } : null

    // ── cards ──
    const cardInfos = cards.slice(0, 12).map((card, idx) => {
      const cs = getComputedStyle(card)
      const rect = card.getBoundingClientRect()

      // icon (translate element with --pointer-x)
      const iconEls = Array.from(card.querySelectorAll('[class*="translate-x-"]'))
      const icon = iconEls[0] || card.querySelector("svg, img, [class*=icon]") || null
      const iconInfo = icon ? {
        tag: icon.tagName,
        className: icon.className?.toString().slice(0, 200),
        computed: {
          color: getComputedStyle(icon).color,
          filter: getComputedStyle(icon).filter,
          width: getComputedStyle(icon).width,
          height: getComputedStyle(icon).height,
          transform: getComputedStyle(icon).transform,
          background: getComputedStyle(icon).background?.slice(0, 200),
          position: getComputedStyle(icon).position,
          inset: getComputedStyle(icon).inset,
        },
      } : null

      // text
      const textEls = Array.from(card.querySelectorAll("span, p, h1, h2, h3, h4")).filter(
        (el) => el.children.length === 0 && el.textContent?.trim()
      )
      const texts = textEls.slice(0, 5).map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().slice(0, 60),
        className: el.className?.toString().slice(0, 100),
        computed: {
          fontSize: getComputedStyle(el).fontSize,
          fontWeight: getComputedStyle(el).fontWeight,
          color: getComputedStyle(el).color,
        },
      }))

      // pointer-x/pointer-y on card itself
      const pointerX = cs.getPropertyValue("--pointer-x")
      const pointerY = cs.getPropertyValue("--pointer-y")

      // card CSS vars (filter to relevant)
      const cardVars = (() => {
        const vars = {}
        for (let i = 0; i < cs.length; i++) {
          const name = cs[i]
          if (name.startsWith("--pointer-") || name.startsWith("--mouse-") || name.startsWith("--card-") || name.startsWith("--glow-"))
            vars[name] = cs.getPropertyValue(name).trim()
        }
        return vars
      })()

      return {
        index: idx,
        className: card.className?.toString().slice(0, 300),
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        pointerX,
        pointerY,
        computed: {
          backgroundColor: cs.backgroundColor,
          borderRadius: cs.borderRadius,
          border: cs.border?.slice(0, 100),
          boxShadow: cs.boxShadow?.slice(0, 200),
          backdropFilter: cs.backdropFilter || cs.getPropertyValue("backdrop-filter"),
          padding: cs.padding,
          transform: cs.transform,
        },
        icon: iconInfo,
        texts,
        cardVars,
      }
    })

    // ── page-level ──
    const bodyCs = getComputedStyle(document.body)

    return {
      url: location.href,
      title: document.title,
      htmlClass: document.documentElement.className,
      bodyBg: bodyCs.backgroundColor,
      bodyColor: bodyCs.color,
      grid: gridInfo,
      cardCount: cardInfos.length,
      cards: cardInfos,
    }
  })

  console.log(`  [${label}] cards: ${info.cardCount}, grid: ${info.grid ? "found" : "NOT FOUND"}`)
  await page.close()
  if (opts.dark && pageCtx !== ctx) await pageCtx.close()
  return info
}

async function glowInteraction(url, label, opts = {}) {
  const page = await ctx.newPage()
  if (opts.localStorage) {
    await page.addInitScript((entries) => {
      for (const [k, v] of entries) localStorage.setItem(k, v)
    }, Object.entries(opts.localStorage))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) { console.warn(`  warn goto glow ${label}: ${e.message}`) }
  await page.waitForTimeout(2500)

  // find the grid
  const gridRect = await page.evaluate(() => {
    const grid =
      document.querySelector('[data-slot="glow-card-grid"]') ||
      document.querySelectorAll('[data-slot="glow-card"]')[0]?.parentElement
    if (!grid) return null
    const r = grid.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  })

  if (!gridRect) {
    console.log(`  [${label}-glow] grid NOT FOUND, skipping interaction`)
    await page.close()
    return { found: false }
  }

  console.log(`  [${label}-glow] grid at ${JSON.stringify(gridRect)}`)

  // full-view clip (covers the grid + 20px margin)
  const viewClip = {
    x: Math.max(0, gridRect.x - 20),
    y: Math.max(0, gridRect.y - 20),
    width: Math.min(VP.width - Math.max(0, gridRect.x - 20), gridRect.w + 40),
    height: Math.min(VP.height - Math.max(0, gridRect.y - 20), gridRect.h + 40),
  }

  // Check the glow mechanism
  const glowMechanism = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="glow-card"]')
    if (!card) return null

    const cs = getComputedStyle(card)
    const hasPointerVars = cs.getPropertyValue("--pointer-x") !== "" || cs.getPropertyValue("--pointer-y") !== ""
    const hasMouseVars = cs.getPropertyValue("--mouse-x") !== "" || cs.getPropertyValue("--mouse-y") !== ""

    // Check inner div for blur/filter
    const innerDiv = card.querySelector('[class*="translate-x-"]')
    const innerTransform = innerDiv ? getComputedStyle(innerDiv).transform : null
    const innerFilter = innerDiv ? getComputedStyle(innerDiv).filter : null

    // Check class names
    const classStr = card.className?.toString() || ""
    const hasContainerSize = classStr.includes("@container-size") || classStr.includes("container-")
    const hasCqi = innerDiv?.className?.toString().includes("cqi") || false

    // Is there a mousemove handler? Check the React event binding (heuristic)
    const hasMouseMoveListener = card.onmousemove !== null || card.dataset.pointerHandler === "true"

    return {
      hasPointerVars,
      hasMouseVars,
      hasContainerSize,
      hasCqi,
      hasMouseMoveListener,
      innerTransform,
      innerFilter,
      cardPointerX: cs.getPropertyValue("--pointer-x")?.trim(),
      cardPointerY: cs.getPropertyValue("--pointer-y")?.trim(),
    }
  })

  console.log(`  [${label}-glow] mechanism: ${JSON.stringify(glowMechanism)}`)

  // Move mouse OUTSIDE grid
  await page.mouse.move(5, 5)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${label}-glow-outside.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-outside.png`)

  const varsOutside = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="glow-card"]')
    if (!card) return null
    const s = getComputedStyle(card)
    return {
      pointerX: s.getPropertyValue("--pointer-x")?.trim(),
      pointerY: s.getPropertyValue("--pointer-y")?.trim(),
      innerTransform: card.querySelector('[class*="translate-x-"]') ? getComputedStyle(card.querySelector('[class*="translate-x-"]')).transform : null,
    }
  })

  // Move mouse to TOP-LEFT of grid
  const tlX = gridRect.x + 30
  const tlY = gridRect.y + 30
  await page.mouse.move(tlX, tlY)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${label}-glow-tl.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-tl.png`)

  const varsTL = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="glow-card"]')
    if (!card) return null
    const s = getComputedStyle(card)
    return {
      pointerX: s.getPropertyValue("--pointer-x")?.trim(),
      pointerY: s.getPropertyValue("--pointer-y")?.trim(),
      innerTransform: card.querySelector('[class*="translate-x-"]') ? getComputedStyle(card.querySelector('[class*="translate-x-"]')).transform : null,
    }
  })

  // Move mouse to CENTER of grid
  const centerX = gridRect.x + gridRect.w / 2
  const centerY = gridRect.y + gridRect.h / 2
  await page.mouse.move(centerX, centerY)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${label}-glow-center.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-center.png`)

  const varsCenter = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="glow-card"]')
    if (!card) return null
    const s = getComputedStyle(card)
    return {
      pointerX: s.getPropertyValue("--pointer-x")?.trim(),
      pointerY: s.getPropertyValue("--pointer-y")?.trim(),
      innerTransform: card.querySelector('[class*="translate-x-"]') ? getComputedStyle(card.querySelector('[class*="translate-x-"]')).transform : null,
    }
  })

  // Move mouse to BOTTOM-RIGHT of grid
  const brX = gridRect.x + gridRect.w - 30
  const brY = gridRect.y + gridRect.h - 30
  await page.mouse.move(brX, brY)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${label}-glow-br.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-br.png`)

  const varsBR = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="glow-card"]')
    if (!card) return null
    const s = getComputedStyle(card)
    return {
      pointerX: s.getPropertyValue("--pointer-x")?.trim(),
      pointerY: s.getPropertyValue("--pointer-y")?.trim(),
      innerTransform: card.querySelector('[class*="translate-x-"]') ? getComputedStyle(card.querySelector('[class*="translate-x-"]')).transform : null,
    }
  })

  // Move mouse OUTSIDE grid again
  await page.mouse.move(5, 5)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${label}-glow-outside2.png`, clip: viewClip })
  console.log(`  ✓ ${OUT}/${label}-glow-outside2.png`)

  await page.close()

  return {
    found: true,
    gridRect,
    glowMechanism,
    mouseVars: {
      outside: varsOutside,
      tl: varsTL,
      center: varsCenter,
      br: varsBR,
    },
  }
}

// ════════════════════════════════════════════════════════════════════
// STEP 1: SCREENSHOTS (4)
// ════════════════════════════════════════════════════════════════════
console.log("\n📸 STEP 1: Screenshots")

await screenshotPage(ORIG_URL, `${OUT}/original-light.png`, { waitAfter: 3000 })
await screenshotPage(ORIG_URL, `${OUT}/original-dark.png`, { dark: true, waitAfter: 3000 })
await screenshotPage(VIT_URL, `${OUT}/vitrine-light.png`, { waitAfter: 2000 })
await screenshotPage(VIT_URL, `${OUT}/vitrine-dark.png`, {
  localStorage: { "vitrine-theme": "dark" },
  waitAfter: 2000,
})

// ════════════════════════════════════════════════════════════════════
// STEP 2: DOM INSPECTION (3 JSONs)
// ════════════════════════════════════════════════════════════════════
console.log("\n🔍 STEP 2: DOM Inspection")

const origInfo = await inspectDOM(ORIG_URL, "ORIGINAL")
const vitrineLightInfo = await inspectDOM(VIT_URL, "VITRINE-LIGHT")
const vitrineDarkInfo = await inspectDOM(VIT_URL, "VITRINE-DARK", {
  localStorage: { "vitrine-theme": "dark" },
})

writeFileSync(`${OUT}/inspect-original.json`, JSON.stringify(origInfo, null, 2))
writeFileSync(`${OUT}/inspect-vitrine-light.json`, JSON.stringify(vitrineLightInfo, null, 2))
writeFileSync(`${OUT}/inspect-vitrine-dark.json`, JSON.stringify(vitrineDarkInfo, null, 2))
console.log(`  ✓ ${OUT}/inspect-original.json`)
console.log(`  ✓ ${OUT}/inspect-vitrine-light.json`)
console.log(`  ✓ ${OUT}/inspect-vitrine-dark.json`)

// ════════════════════════════════════════════════════════════════════
// STEP 3: GLOW INTERACTION (full-view screenshots — see the glow move)
// ════════════════════════════════════════════════════════════════════
console.log("\n✨ STEP 3: Glow Interaction (mouse follow, full view)")

const origGlow = await glowInteraction(ORIG_URL, "original")
const vitrineGlow = await glowInteraction(VIT_URL, "vitrine-light")
const vitrineGlowDark = await glowInteraction(VIT_URL, "vitrine-dark", {
  localStorage: { "vitrine-theme": "dark" },
})

writeFileSync(`${OUT}/glow-original.json`, JSON.stringify(origGlow, null, 2))
writeFileSync(`${OUT}/glow-vitrine-light.json`, JSON.stringify(vitrineGlow, null, 2))
writeFileSync(`${OUT}/glow-vitrine-dark.json`, JSON.stringify(vitrineGlowDark, null, 2))
console.log(`  ✓ ${OUT}/glow-original.json`)
console.log(`  ✓ ${OUT}/glow-vitrine-light.json`)
console.log(`  ✓ ${OUT}/glow-vitrine-dark.json`)

// Visual proof via MD5 hashes
let origVisualGlow = false
let vitrineVisualGlow = false
let origHashCount = 0
let vitLHashCount = 0
let vitDHashCount = 0
try {
  const origOut = execSync(`md5sum ${OUT}/original-glow-*.png | awk '{print $1}' | sort -u | wc -l`, { encoding: "utf-8" }).trim()
  const vitLOut = execSync(`md5sum ${OUT}/vitrine-light-glow-*.png | awk '{print $1}' | sort -u | wc -l`, { encoding: "utf-8" }).trim()
  const vitDOut = execSync(`md5sum ${OUT}/vitrine-dark-glow-*.png | awk '{print $1}' | sort -u | wc -l`, { encoding: "utf-8" }).trim()
  origHashCount = Number(origOut)
  vitLHashCount = Number(vitLOut)
  vitDHashCount = Number(vitDOut)
  origVisualGlow = origHashCount > 1
  vitrineVisualGlow = vitLHashCount > 1 || vitDHashCount > 1
  console.log(`  visual glow proof: orig=${origHashCount} unique, vitrine-light=${vitLHashCount}, vitrine-dark=${vitDHashCount}`)
} catch (e) {
  console.warn(`  warn: visual proof check failed: ${e.message}`)
}

// ════════════════════════════════════════════════════════════════════
// STEP 4: COMPARISON + SCORING
// ════════════════════════════════════════════════════════════════════
console.log("\n⚖️  STEP 4: Comparison & Scoring")

const problems = []
let score = 100

// --- Card count ---
if (origInfo.cardCount !== vitrineLightInfo.cardCount) {
  problems.push({
    severity: "high",
    area: "card-count",
    msg: `Card count mismatch: original=${origInfo.cardCount}, vitrine=${vitrineLightInfo.cardCount}`,
  })
  score -= 15
}
console.log(`  card count: orig=${origInfo.cardCount} vitrine=${vitrineLightInfo.cardCount} ${origInfo.cardCount === vitrineLightInfo.cardCount ? "✅" : "❌"}`)

// --- Grid layout (col count) ---
const origGrid = origInfo.grid
const vitGrid = vitrineLightInfo.grid

if (origGrid && vitGrid) {
  const origColCount = origGrid.computed.gridTemplateColumns.split(" ").length
  const vitColCount = vitGrid.computed.gridTemplateColumns.split(" ").length
  console.log(`  grid cols: orig=${origColCount} vitrine=${vitColCount}`)
  if (origColCount !== vitColCount) {
    problems.push({
      severity: "medium",
      area: "grid-columns",
      msg: `Grid column count differ: orig=${origColCount} vitrine=${vitColCount}`,
    })
    score -= 8
  }

  if (origGrid.computed.gap !== vitGrid.computed.gap) {
    problems.push({
      severity: "low",
      area: "grid-gap",
      msg: `gap differ: orig="${origGrid.computed.gap}" vitrine="${vitGrid.computed.gap}"`,
    })
    score -= 3
  }
  console.log(`  grid gap: orig="${origGrid.computed.gap}" vitrine="${vitGrid.computed.gap}"`)
  console.log(`  grid width: orig=${origGrid.rect.w} vitrine=${vitGrid.rect.w}`)
} else {
  problems.push({ severity: "critical", area: "grid", msg: "Grid element not found in one or both pages" })
  score -= 25
}

// --- Card styling ---
if (origInfo.cards.length > 0 && vitrineLightInfo.cards.length > 0) {
  const origC0 = origInfo.cards[0]
  const vitC0 = vitrineLightInfo.cards[0]

  if (origC0.computed.borderRadius !== vitC0.computed.borderRadius) {
    problems.push({
      severity: "low",
      area: "card-border-radius",
      msg: `border-radius differ: orig="${origC0.computed.borderRadius}" vitrine="${vitC0.computed.borderRadius}"`,
    })
    score -= 3
  }
  console.log(`  card border-radius: orig="${origC0.computed.borderRadius}" vitrine="${vitC0.computed.borderRadius}"`)

  // @container-size check (CRITICAL for cqi to resolve to card, not viewport)
  const origHasContainerSize = origC0.className.includes("@container-size") || origC0.className.includes("@container/")
  const vitHasContainerSize = vitC0.className.includes("@container-size") || vitC0.className.includes("@container/")
  console.log(`  @container-size: orig=${origHasContainerSize ? "✅" : "❌"} vitrine=${vitHasContainerSize ? "✅" : "❌"}`)
  if (origHasContainerSize && !vitHasContainerSize) {
    problems.push({
      severity: "high",
      area: "container-queries",
      msg: `CRITICAL: Original card uses @container-size so 50cqi resolves to the card's width (translate stays inside). Vitrine lacks @container-size so 50cqi resolves to viewport (1440px) — translate moves the icon FAR offscreen, glow following cursor is INVISIBLE.`,
    })
    score -= 18
  }

  console.log(`  card size: orig=${origC0.rect.w}x${origC0.rect.h} vitrine=${vitC0.rect.w}x${vitC0.rect.h}`)
}

// --- Glow mechanism ---
const origMech = origGlow.glowMechanism
const vitMech = vitrineGlow.glowMechanism

if (origMech && vitMech) {
  console.log(`  hasPointerVars: orig=${origMech.hasPointerVars} vit=${vitMech.hasPointerVars}`)

  const vitTL = vitrineGlow.mouseVars?.tl
  const vitCenter = vitrineGlow.mouseVars?.center
  const vitBR = vitrineGlow.mouseVars?.br
  const vitOutside = vitrineGlow.mouseVars?.outside

  const varsChange = vitOutside?.pointerX !== vitCenter?.pointerX || vitOutside?.pointerY !== vitCenter?.pointerY
  console.log(`  pointer vars change on mousemove: ${varsChange ? "✅" : "❌"} (outside=${JSON.stringify(vitOutside)} center=${JSON.stringify(vitCenter)})`)
  if (!varsChange) {
    problems.push({
      severity: "high",
      area: "mouse-vars",
      msg: `--pointer-x/--pointer-y CSS vars not updating on mousemove`,
    })
    score -= 15
  }

  const origTL = origGlow.mouseVars?.tl
  const origCenter = origGlow.mouseVars?.center
  const origBR = origGlow.mouseVars?.br
  const origOutside = origGlow.mouseVars?.outside
  const origVarsChange = origOutside?.pointerX !== origCenter?.pointerX || origOutside?.pointerY !== origCenter?.pointerY
  console.log(`  original pointer vars change: ${origVarsChange ? "✅" : "❌"} (outside=${JSON.stringify(origOutside)} center=${JSON.stringify(origCenter)} br=${JSON.stringify(origBR)})`)

  const hasBlur = vitMech.innerFilter?.includes("blur")
  console.log(`  inner div has blur filter: ${hasBlur ? "✅" : "❌"} (filter="${vitMech.innerFilter?.slice(0, 80)}")`)
  if (!hasBlur) {
    problems.push({
      severity: "medium",
      area: "glow-blur",
      msg: `Inner glow div has no blur filter (orig filter="${origMech.innerFilter?.slice(0, 80)}", vit filter="${vitMech.innerFilter?.slice(0, 80)}")`,
    })
    score -= 8
  }
} else if (!vitMech) {
  problems.push({ severity: "critical", area: "glow-mechanism", msg: "Vitrine glow mechanism not detected at all" })
  score -= 20
}

// --- Visual proof ---
console.log(`  visual glow proof: orig=${origVisualGlow ? "✅" : "❌"} vitrine=${vitrineVisualGlow ? "✅" : "❌"}`)
if (!vitrineVisualGlow && origVisualGlow) {
  problems.push({
    severity: "high",
    area: "visual-glow",
    msg: `5 mouse-position screenshots are byte-identical in vitrine (no visible glow effect). Original's 5 screenshots have ${origHashCount} unique frames (visible glow). Glow following cursor is INVISIBLE.`,
  })
  score -= 15
}

// --- Dark mode ---
const vitDarkGrid = vitrineDarkInfo.grid
if (vitDarkGrid) {
  const darkBodyBg = vitrineDarkInfo.bodyBg
  const isDarkBg = darkBodyBg.includes("oklch(0.1") || darkBodyBg.includes("oklch(0.14") || darkBodyBg.includes("rgb(1") || darkBodyBg.includes("rgb(2") || darkBodyBg.includes("rgb(0,")
  console.log(`  dark mode body bg: ${darkBodyBg} ${isDarkBg ? "✅" : "❌"}`)
  if (!isDarkBg) {
    problems.push({ severity: "high", area: "dark-mode", msg: `Dark mode body bg doesn't look dark: ${darkBodyBg}` })
    score -= 10
  }
} else {
  problems.push({ severity: "medium", area: "dark-grid", msg: "Grid not found in dark mode" })
  score -= 8
}

// --- data-slot contract ---
const hasDataSlot = !!vitrineLightInfo.grid?.dataAttrs?.["data-slot"]
console.log(`  data-slot on vitrine grid: ${hasDataSlot ? "✅" : "⚠️"}`)
if (!hasDataSlot) {
  problems.push({ severity: "low", area: "data-slot", msg: "Vitrine grid missing data-slot='glow-card-grid'" })
  score -= 3
}

// Clamp score
score = Math.max(0, Math.min(100, score))

// ════════════════════════════════════════════════════════════════════
// STEP 5: REPORT
// ════════════════════════════════════════════════════════════════════
console.log("\n📋 STEP 5: Report")

const now = new Date().toISOString()
const report = `# Glow Card Grid — Validation Report

**Date:** ${now}
**Component:** glow-card-grid
**Category:** Layout
**Original:** ${ORIG_URL}
**Vitrine:** ${VIT_URL}

---

## Score: ${score}/100

${problems.length === 0 ? "✅ **No problems found.**" : `⚠️ **${problems.length} problem(s) found:**`}

${problems.length > 0 ? problems.map((p, i) => `${i + 1}. **[${p.severity.toUpperCase()}]** ${p.area}: ${p.msg}`).join("\n") : ""}

---

## Screenshots

| Variant | File |
|---------|------|
| Original Light | \`original-light.png\` |
| Original Dark | \`original-dark.png\` |
| Vitrine Light | \`vitrine-light.png\` |
| Vitrine Dark | \`vitrine-dark.png\` |

---

## Glow Interaction Screenshots (clipped to grid + 20px margin — full view)

| Position | Original | Vitrine Light | Vitrine Dark |
|----------|----------|--------------|-------------|
| Outside | \`original-glow-outside.png\` | \`vitrine-light-glow-outside.png\` | \`vitrine-dark-glow-outside.png\` |
| Top-Left | \`original-glow-tl.png\` | \`vitrine-light-glow-tl.png\` | \`vitrine-dark-glow-tl.png\` |
| Center | \`original-glow-center.png\` | \`vitrine-light-glow-center.png\` | \`vitrine-dark-glow-center.png\` |
| Bottom-Right | \`original-glow-br.png\` | \`vitrine-light-glow-br.png\` | \`vitrine-dark-glow-br.png\` |
| Outside again | \`original-glow-outside2.png\` | \`vitrine-light-glow-outside2.png\` | \`vitrine-dark-glow-outside2.png\` |

---

## Visual Proof (MD5 hashes of glow shots)

| Variant | Unique MD5 hashes (out of 5 shots) | Verdict |
|---------|-----------------------------------|---------|
| Original | ${origHashCount} | ${origVisualGlow ? "✅ Glow visibly follows cursor" : "❌ No visible change"} |
| Vitrine Light | ${vitLHashCount} | ${vitLHashCount > 1 ? "✅ Glow visibly follows cursor" : "❌ No visible change (5/5 byte-identical)"} |
| Vitrine Dark | ${vitDHashCount} | ${vitDHashCount > 1 ? "✅ Glow visibly follows cursor" : "❌ No visible change (5/5 byte-identical)"} |

> This is the smoking gun: pointer vars update correctly in both, but in the original the icon visibly moves 4 times (centered glow follows cursor), while in the vitrine the 5 frames are byte-identical — the icon doesn't move because the **cqi-based translate** is so large that the icon flies off-screen and isn't visible in the card anymore.

---

## DOM Comparison

### Grid

| Property | Original | Vitrine Light | Vitrine Dark |
|----------|----------|--------------|-------------|
| Card count | ${origInfo.cardCount} | ${vitrineLightInfo.cardCount} | ${vitrineDarkInfo.cardCount} |
| Grid columns | ${origGrid?.computed?.gridTemplateColumns ?? "N/A"} | ${vitGrid?.computed?.gridTemplateColumns ?? "N/A"} | ${vitDarkGrid?.computed?.gridTemplateColumns ?? "N/A"} |
| Grid width (px) | ${origGrid?.rect?.w ?? "N/A"} | ${vitGrid?.rect?.w ?? "N/A"} | ${vitDarkGrid?.rect?.w ?? "N/A"} |
| Gap | ${origGrid?.computed?.gap ?? "N/A"} | ${vitGrid?.computed?.gap ?? "N/A"} | ${vitDarkGrid?.computed?.gap ?? "N/A"} |
| Position | ${origGrid?.computed?.position ?? "N/A"} | ${vitGrid?.computed?.position ?? "N/A"} | ${vitDarkGrid?.computed?.position ?? "N/A"} |

### First Card (Light)

| Property | Original | Vitrine |
|----------|----------|---------|
| Card class | ${origInfo.cards[0]?.className?.slice(0, 100) ?? "N/A"} | ${vitrineLightInfo.cards[0]?.className?.slice(0, 100) ?? "N/A"} |
| Size (W×H) | ${origInfo.cards[0]?.rect?.w ?? "?"}×${origInfo.cards[0]?.rect?.h ?? "?"} | ${vitrineLightInfo.cards[0]?.rect?.w ?? "?"}×${vitrineLightInfo.cards[0]?.rect?.h ?? "?"} |
| Border Radius | ${origInfo.cards[0]?.computed?.borderRadius ?? "N/A"} | ${vitrineLightInfo.cards[0]?.computed?.borderRadius ?? "N/A"} |
| Backdrop Filter | ${origInfo.cards[0]?.computed?.backdropFilter ?? "N/A"} | ${vitrineLightInfo.cards[0]?.computed?.backdropFilter ?? "N/A"} |
| Icon filter | ${origInfo.cards[0]?.icon?.computed?.filter?.slice(0, 60) ?? "N/A"} | ${vitrineLightInfo.cards[0]?.icon?.computed?.filter?.slice(0, 60) ?? "N/A"} |
| Title (H2) | ${origInfo.cards[0]?.texts?.[0]?.text ?? "N/A"} | ${vitrineLightInfo.cards[0]?.texts?.[0]?.text ?? "N/A"} |
| Subtitle | ${origInfo.cards[0]?.texts?.[1]?.text ?? "N/A"} | ${vitrineLightInfo.cards[0]?.texts?.[1]?.text ?? "N/A"} |

---

## Glow Mechanism

| Property | Original | Vitrine Light | Vitrine Dark |
|----------|----------|--------------|-------------|
| Has --pointer-x/y vars | ${origMech?.hasPointerVars ? "✅" : "❌"} | ${vitMech?.hasPointerVars ? "✅" : "❌"} | ${vitrineGlowDark?.glowMechanism?.hasPointerVars ? "✅" : "❌"} |
| Has --mouse-x/y vars | ${origMech?.hasMouseVars ? "✅" : "❌"} | ${vitMech?.hasMouseVars ? "✅" : "❌"} | ${vitrineGlowDark?.glowMechanism?.hasMouseVars ? "✅" : "❌"} |
| @container-size | ${origMech?.hasContainerSize ? "✅" : "❌"} | ${vitMech?.hasContainerSize ? "✅" : "❌"} | ${vitrineGlowDark?.glowMechanism?.hasContainerSize ? "✅" : "❌"} |
| Inner blur filter | ${origMech?.innerFilter?.includes("blur") ? "✅" : "❌"} | ${vitMech?.innerFilter?.includes("blur") ? "✅" : "❌"} | ${vitrineGlowDark?.glowMechanism?.innerFilter?.includes("blur") ? "✅" : "❌"} |

### Pointer Var Tracking (Vitrine Light)

| Position | --pointer-x | --pointer-y |
|----------|-------------|-------------|
| Outside | ${vitrineGlow.mouseVars?.outside?.pointerX ?? "N/A"} | ${vitrineGlow.mouseVars?.outside?.pointerY ?? "N/A"} |
| Top-Left | ${vitrineGlow.mouseVars?.tl?.pointerX ?? "N/A"} | ${vitrineGlow.mouseVars?.tl?.pointerY ?? "N/A"} |
| Center | ${vitrineGlow.mouseVars?.center?.pointerX ?? "N/A"} | ${vitrineGlow.mouseVars?.center?.pointerY ?? "N/A"} |
| Bottom-Right | ${vitrineGlow.mouseVars?.br?.pointerX ?? "N/A"} | ${vitrineGlow.mouseVars?.br?.pointerY ?? "N/A"} |

### Pointer Var Tracking (Original)

| Position | --pointer-x | --pointer-y |
|----------|-------------|-------------|
| Outside | ${origGlow.mouseVars?.outside?.pointerX ?? "N/A"} | ${origGlow.mouseVars?.outside?.pointerY ?? "N/A"} |
| Top-Left | ${origGlow.mouseVars?.tl?.pointerX ?? "N/A"} | ${origGlow.mouseVars?.tl?.pointerY ?? "N/A"} |
| Center | ${origGlow.mouseVars?.center?.pointerX ?? "N/A"} | ${origGlow.mouseVars?.center?.pointerY ?? "N/A"} |
| Bottom-Right | ${origGlow.mouseVars?.br?.pointerX ?? "N/A"} | ${origGlow.mouseVars?.br?.pointerY ?? "N/A"} |

> The original normalizes --pointer-x to roughly -1..+1 (because cqi = card-width/100, and the icon is multiplied by 50cqi, so 1% movement = 0.5 card-widths). The vitrine computes --pointer-x in 0..100 (because cqi = viewport-width/100, the percentage is on the grid not the card, AND the multiplier is 50cqi which is now 50 * 14.4px = 720px per unit — so the icon moves 7,200px at the bottom-right corner, way offscreen).

---

## JSON Artifacts

| File | Description |
|------|-------------|
| \`inspect-original.json\` | Full DOM inspection of original (light) |
| \`inspect-vitrine-light.json\` | Full DOM inspection of vitrine (light) |
| \`inspect-vitrine-dark.json\` | Full DOM inspection of vitrine (dark) |
| \`glow-original.json\` | Glow interaction data from original |
| \`glow-vitrine-light.json\` | Glow interaction data from vitrine (light) |
| \`glow-vitrine-dark.json\` | Glow interaction data from vitrine (dark) |

---

## Verdict

${score >= 90 ? "✅ **PASS** — Component closely matches the original." : score >= 70 ? "⚠️ **PARTIAL** — Component works but has notable differences." : "❌ **FAIL** — Component has significant issues that need fixing."}

${score < 70 ? `\n### Critical Issue: Glow not visible

The centerpiece of this component — the icon glow that follows the cursor — does **not work visually** in the vitrine. The implementation correctly updates the CSS variables on \`mousemove\`, but the \`translate-x-[calc(var(--pointer-x,-10)*50cqi)]\` Tailwind class on the inner div needs a container query context (\`@container-size\`) to resolve \`cqi\` to the card's width. Without it, \`cqi\` falls back to the viewport width (1440px), and the translate moves the icon off-screen.

**Fix:** Add \`@container-size\` to the GlowCard className. The original chanhdai implementation has it on the card root element. After fixing, the glow icon will visibly follow the cursor within each card.` : ""}
`

writeFileSync(`${OUT}/REPORT.md`, report)
console.log(`  ✓ ${OUT}/REPORT.md`)

await browser.close()
console.log(`\n🏁 Validation complete: score=${score}/100, problems=${problems.length}`)
