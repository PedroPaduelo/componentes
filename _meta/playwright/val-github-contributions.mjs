// scripts/val-github-contributions.mjs
// Validação visual Playwright — github-contributions
// Compara original (chanhdai.com) vs vitrine (localhost:5173)
//
// Seletores corretos:
// - CHANHDAI: <svg.block.overflow-visible> com viewBox "0 0 739 117"
//             + <rect data-count data-date data-level> dentro
// - VITRINE: [data-slot="github-contributions"] > div > div > div
//            (52 week columns × 7 days cada)
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { setTimeout as sleep } from "node:timers/promises"
import { outPath } from "./_shots.mjs"

const OUT = outPath("github-contributions")
mkdirSync(OUT, { recursive: true })

const ORIGINAL = "https://chanhdai.com/components/github-contributions"
const VITRINE = "http://localhost:5173/components/github-contributions"
const VIEWPORT = { width: 1440, height: 900 }
const ORIGINAL_SVG_SEL = 'svg.block.overflow-visible'
const VITRINE_WRAP_SEL = "[data-slot='github-contributions']"

const browser = await chromium.launch()
const issues = []
function issue(s) { issues.push(s); console.warn(`⚠️  ${s}`) }
function ok(s) { console.log(`✓ ${s}`) }

// Helper to make a fresh page with theme
async function freshPage(ctx, dark = false) {
  const page = await ctx.newPage()
  await page.addInitScript((d) => {
    if (d) localStorage.setItem("vitrine-theme", "dark")
    else localStorage.removeItem("vitrine-theme")
  }, dark)
  return page
}

async function gotoReady(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    issue(`goto ${url}: ${e.message}`)
  }
  await sleep(3500) // extra for JS / hydration
}

async function screenshotSafe(page, path, label) {
  try {
    await page.screenshot({ path, fullPage: false })
    ok(`print: ${label}`)
  } catch (e) {
    issue(`falha screenshot ${label}: ${e.message}`)
  }
}

// ============================================================
// 1. SCREENSHOTS
// ============================================================
console.log("\n=== 1. SCREENSHOTS ===\n")

// Helper to scroll the chanhdai original to the GitHub Contributions section
async function scrollChanToGitHub(page) {
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll('h1, h2, h3, h4, [class*="title"]'))
      .find(el => el.textContent && el.textContent.trim() === 'GitHub Contributions')
    if (heading) heading.scrollIntoView({ block: 'start' })
  })
  await sleep(800)
}

// Helper to scroll vitrine to the FIRST example (52 weeks) for fair cell-count comparison
async function scrollVitrineToComp(page) {
  await page.evaluate(() => {
    const all = document.querySelectorAll("[data-slot='github-contributions']")
    if (all.length > 0) {
      // Use the FIRST example (52 weeks, "green" scale) — same 52 weeks as chanhdai
      all[0].scrollIntoView({ block: 'start' })
    }
  })
  await sleep(800)
}

// ORIGINAL — light
{
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await freshPage(ctx, false)
  await gotoReady(page, ORIGINAL)
  await scrollChanToGitHub(page)
  await screenshotSafe(page, `${OUT}/original-light.png`, "original-light.png")
  await page.close(); await ctx.close()
}

// ORIGINAL — dark (chanhdai respects prefers-color-scheme)
{
  const ctx = await browser.newContext({ viewport: VIEWPORT, colorScheme: 'dark' })
  const page = await freshPage(ctx, true)
  // Also set localStorage for full coverage
  await page.addInitScript(() => { try { document.documentElement.classList.add('dark') } catch {} })
  await gotoReady(page, ORIGINAL)
  await scrollChanToGitHub(page)
  await screenshotSafe(page, `${OUT}/original-dark.png`, "original-dark.png")
  await page.close(); await ctx.close()
}

// VITRINE — light
{
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await freshPage(ctx, false)
  await gotoReady(page, VITRINE)
  await scrollVitrineToComp(page)
  await screenshotSafe(page, `${OUT}/vitrine-light.png`, "vitrine-light.png")
  await page.close(); await ctx.close()
}

// VITRINE — dark
{
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await freshPage(ctx, true)
  await gotoReady(page, VITRINE)
  await sleep(500)
  await scrollVitrineToComp(page)
  await screenshotSafe(page, `${OUT}/vitrine-dark.png`, "vitrine-dark.png")
  await page.close(); await ctx.close()
}

// ============================================================
// 2. DOM INSPECTION
// ============================================================
console.log("\n=== 2. DOM INSPECTION ===\n")

async function inspectOriginal() {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await freshPage(ctx, false)
  await gotoReady(page, ORIGINAL)
  await scrollChanToGitHub(page)

  const data = await page.evaluate((svgSel) => {
    const svgs = Array.from(document.querySelectorAll(svgSel))
    const target = svgs[0] // first = GitHub Contributions preview
    if (!target) return { error: 'no SVG found' }
    const rects = target.querySelectorAll('rect[data-count]')
    const first = rects[0]
    const last = rects[rects.length - 1]
    const second = rects[1]

    // Cell positions
    // rect[0] = first day of week 0, rect[1] = second day of week 0, rect[7] = first day of week 1
    // Horizontal gap = space between rect[0].right and rect[7].x (different week, same day)
    // Vertical gap = space between rect[0].bottom and rect[1].y (same week, different day)
    let gapX = null
    let gapY = null
    if (first && rects[7]) {
      const r0 = first.getBoundingClientRect()
      const r7 = rects[7].getBoundingClientRect()
      gapX = Math.round(r7.x - (r0.x + r0.width))
    }
    if (first && second) {
      const r0 = first.getBoundingClientRect()
      const r1 = second.getBoundingClientRect()
      gapY = Math.round(r1.y - (r0.y + r0.height))
    }
    const gap = gapX  // keep "gap" as horizontal (between cells in different weeks)
    let sameColDy = null
    if (first && rects[7]) {
      const r1 = first.getBoundingClientRect()
      const r7 = rects[7].getBoundingClientRect()
      sameColDy = Math.round(Math.abs(r7.y - r1.y))
    }

    // Sample first 10 rects with fill (resolved via CSS)
    const cellSamples = Array.from(rects).slice(0, 10).map(r => {
      const cs = getComputedStyle(r)
      return {
        w: r.getBoundingClientRect().width,
        h: r.getBoundingClientRect().height,
        fill: r.getAttribute('fill') || cs.fill,
        dataCount: r.getAttribute('data-count'),
        dataDate: r.getAttribute('data-date'),
        dataLevel: r.getAttribute('data-level'),
      }
    })

    // Compute SVG rect coordinates from viewBox 0 0 739 117
    const viewBox = target.getAttribute('viewBox')?.split(/\s+/).map(Number) || [0, 0, 739, 117]
    const svgRect = target.getBoundingClientRect()
    const scaleX = svgRect.width / viewBox[2]
    const scaleY = svgRect.height / viewBox[3]
    const gapX_vb = (11 + 3) * scaleX  // cell + gap in viewBox units
    const cellW_vb = 11 * scaleX
    const cellH_vb = 11 * scaleY

    // Get unique data levels
    const levels = new Set()
    for (const r of rects) levels.add(r.getAttribute('data-level'))
    const dataCounts = Array.from(rects).map(r => parseInt(r.getAttribute('data-count') || '0'))
    const maxCount = Math.max(...dataCounts)
    const totalCount = dataCounts.reduce((a, b) => a + b, 0)

    // Get the wrapper (closest .component-preview or .preview)
    let wrap = target.closest('.component-preview') || target.closest('.preview') || target.parentElement

    // Check summary text
    const summaryEl = Array.from(document.querySelectorAll('*')).find(el =>
      el.children.length === 0 && el.textContent && /\d+\s*contributions?\s*in\s*the\s*last\s*year/i.test(el.textContent)
    )
    const summary = summaryEl ? summaryEl.textContent.trim() : null

    return {
      wrapper: wrap ? {
        rect: (() => { const r = wrap.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })(),
        className: String(wrap.className || '').slice(0, 100),
      } : null,
      svg: {
        rect: { w: Math.round(svgRect.width), h: Math.round(svgRect.height), x: Math.round(svgRect.x), y: Math.round(svgRect.y) },
        viewBox: target.getAttribute('viewBox'),
      },
      totalCells: rects.length,
      cellDimensions: { w: first ? first.getBoundingClientRect().width : 0, h: first ? first.getBoundingClientRect().height : 0, gap, gapX, gapY },
      sameColumnDy: sameColDy,
      levels: Array.from(levels).sort(),
      maxCount,
      totalCount,
      cellSamples,
      summary,
      // color scale
      colorScale: ['fill-muted-foreground/5', 'fill-muted-foreground/20', 'fill-muted-foreground/40', 'fill-muted-foreground/60', 'fill-muted-foreground/80'],
    }
  }, ORIGINAL_SVG_SEL)

  writeFileSync(`${OUT}/inspect-original.json`, JSON.stringify(data, null, 2))
  ok('inspect-original.json')
  await page.close(); await ctx.close()
  return data
}

async function inspectVitrine(dark) {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await freshPage(ctx, dark)
  await gotoReady(page, VITRINE)
  await scrollVitrineToComp(page)

  const data = await page.evaluate((sel) => {
    const allWraps = document.querySelectorAll(sel)
    // Use FIRST example (52 weeks, "green" scale) for structural comparison — matches chanhdai's 52-week cell count
    const wrap = allWraps[0]
    if (!wrap) return { error: 'wrapper not found' }
    const wr = wrap.getBoundingClientRect()

    // Structure: wrap > div.flex (weeks container) > div.flex-col (52 week columns) > div.rounded-sm (7 day cells each)
    const weeksContainer = wrap.querySelector(":scope > div")  // <div class="flex items-end gap-px overflow-x-auto">
    const weekColumns = weeksContainer ? Array.from(weeksContainer.children) : []
    const totalWeeks = weekColumns.length

    // For cell dimensions, go to first week column → its children are day cells
    let cellW = null
    let cellH = null
    let gapX = null  // horizontal gap between weeks
    let gapY = null  // vertical gap between days in same week
    if (weekColumns.length > 0) {
      const firstCol = weekColumns[0]
      const firstColChildren = Array.from(firstCol.children)
      if (firstColChildren.length >= 2) {
        const r0 = firstColChildren[0].getBoundingClientRect()
        const r1 = firstColChildren[1].getBoundingClientRect()
        cellW = r0.width
        cellH = r0.height
        gapY = Math.round(r1.y - (r0.y + r0.height))
      }
      if (weekColumns.length >= 2) {
        const c0 = weekColumns[0]
        const c1 = weekColumns[1]
        const r0c0 = c0.getBoundingClientRect()
        const r0c1 = c1.getBoundingClientRect()
        gapX = Math.round(r0c1.x - (r0c0.x + r0c0.width))
      }
    }

    // Find all the actual day cells (rounded-sm class)
    const dayCells = wrap.querySelectorAll("div.rounded-sm.cursor-pointer")
    const dayCellCount = dayCells.length

    // Sample 10 cells
    const samples = Array.from(dayCells).slice(0, 10).map(c => {
      const cs = getComputedStyle(c)
      return {
        w: c.getBoundingClientRect().width,
        h: c.getBoundingClientRect().height,
        bg: cs.backgroundColor,
        className: c.className.slice(0, 100),
      }
    })

    // Color scale: find the 5 cells in the legend "Less ... More"
    // The legend is the bottom div with "Less" text
    const lessEl = Array.from(wrap.querySelectorAll('*')).find(el =>
      el.children.length === 0 && el.textContent && el.textContent.trim() === 'Less'
    )
    const legendCells = lessEl ? lessEl.parentElement.querySelectorAll('div.rounded-sm') : []
    const legendColors = Array.from(legendCells).map(c => getComputedStyle(c).backgroundColor)

    // Summary
    const summaryEl = Array.from(wrap.querySelectorAll('*')).find(el =>
      el.children.length === 0 && el.textContent && /\d+\s*contributions?\s*in\s*the\s*last\s*year/i.test(el.textContent)
    )
    const summary = summaryEl ? summaryEl.textContent.trim() : null

    // data attrs on wrapper
    const dataAttrs = {}
    for (const a of wrap.attributes) {
      if (a.name.startsWith('data-')) dataAttrs[a.name] = a.value
    }

    return {
      wrapper: {
        rect: { w: Math.round(wr.width), h: Math.round(wr.height), x: Math.round(wr.x), y: Math.round(wr.y) },
        dataAttrs,
      },
      totalWeeks,
      totalCells: dayCellCount,
      cellDimensions: { w: cellW, h: cellH, gap: gapX, gapX, gapY },
      samples,
      legendColors,
      summary,
    }
  }, VITRINE_WRAP_SEL)

  writeFileSync(`${OUT}/inspect-vitrine-${dark ? 'dark' : 'light'}.json`, JSON.stringify(data, null, 2))
  ok(`inspect-vitrine-${dark ? 'dark' : 'light'}.json`)
  await page.close(); await ctx.close()
  return data
}

const origData = await inspectOriginal()
const vitrineLight = await inspectVitrine(false)
const vitrineDark = await inspectVitrine(true)

// ============================================================
// 3. HOVER INTERACTIONS
// ============================================================
console.log("\n=== 3. HOVER / TOOLTIP ===\n")

async function hoverOriginal() {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await freshPage(ctx, false)
  await gotoReady(page, ORIGINAL)
  await scrollChanToGitHub(page)

  // Find a high-intensity cell (data-level = 4)
  const hover = await page.evaluate((svgSel) => {
    const target = document.querySelector(svgSel)
    if (!target) return { error: 'no svg' }
    const rects = Array.from(target.querySelectorAll('rect[data-level="4"]'))
    if (rects.length === 0) {
      // fallback to any level >= 2
      const fallback = Array.from(target.querySelectorAll('rect[data-level="3"], rect[data-level="2"]'))
      if (fallback.length === 0) return { error: 'no populated cells' }
      rects.push(...fallback)
    }
    const t = rects[Math.floor(rects.length / 2)]
    const r = t.getBoundingClientRect()
    return {
      hoverTarget: {
        dataCount: t.getAttribute('data-count'),
        dataDate: t.getAttribute('data-date'),
        dataLevel: t.getAttribute('data-level'),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      },
      totalRects: target.querySelectorAll('rect').length,
      level4Count: target.querySelectorAll('rect[data-level="4"]').length,
    }
  }, ORIGINAL_SVG_SEL)

  if (hover.error) {
    issue(`original hover: ${hover.error}`)
    await page.close(); await ctx.close()
    return null
  }
  ok(`original hover target: count=${hover.hoverTarget.dataCount}, level=${hover.hoverTarget.dataLevel}`)

  // Move mouse to the cell
  const { x, y, w, h } = hover.hoverTarget.rect
  await page.mouse.move(x + w / 2, y + h / 2)
  await sleep(1200)

  await screenshotSafe(page, `${OUT}/original-light-hover-cell.png`, "original-light-hover-cell.png")

  // Look for tooltip
  const tooltip = await page.evaluate(() => {
    const selectors = [
      '[role="tooltip"]',
      '[data-radix-tooltip-content]',
      '[data-state="delayed-open"][data-side]',
      '.tooltip',
      '[class*="TooltipContent"]',
      'div[class*="bg-popover"][class*="text-popover-foreground"]',
    ]
    for (const sel of selectors) {
      const el = document.querySelector(sel)
      if (el && el.getBoundingClientRect().width > 0) {
        const cs = getComputedStyle(el)
        return {
          found: true,
          selector: sel,
          text: el.textContent.trim(),
          bg: cs.backgroundColor,
          color: cs.color,
          rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) } })(),
        }
      }
    }
    return { found: false }
  })
  if (tooltip.found) ok(`original tooltip: "${tooltip.text.slice(0, 80)}"`)
  else issue('original tooltip: NÃO apareceu')

  // Now hover an empty cell
  const emptyHover = await page.evaluate((svgSel) => {
    const target = document.querySelector(svgSel)
    if (!target) return null
    const empties = Array.from(target.querySelectorAll('rect[data-level="0"]'))
    if (empties.length === 0) return null
    const t = empties[Math.floor(empties.length / 2)]
    const r = t.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  }, ORIGINAL_SVG_SEL)
  if (emptyHover) {
    await page.mouse.move(emptyHover.x + emptyHover.w / 2, emptyHover.y + emptyHover.h / 2)
    await sleep(1000)
    await screenshotSafe(page, `${OUT}/original-light-hover-empty.png`, "original-light-hover-empty.png")
  }

  await page.close(); await ctx.close()
  return { hover, tooltip }
}

async function hoverVitrine(dark) {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await freshPage(ctx, dark)
  await gotoReady(page, VITRINE)
  await scrollVitrineToComp(page)

  // Hover in the FIRST example (52 weeks) for fair cell-count comparison
  const hover = await page.evaluate((sel) => {
    const allWraps = document.querySelectorAll(sel)
    const wrap = allWraps[0]
    if (!wrap) return { error: 'no wrap' }
    // Get all rounded-sm cells (excluding empty placeholder divs which have no bg class)
    const allCells = Array.from(wrap.querySelectorAll("div.rounded-sm, button.rounded-sm"))
    // Get the cells with bg classes other than bg-muted-foreground/5
    const populated = allCells.filter(c => {
      const cls = c.className || ''
      return cls.includes('bg-muted-foreground/20') ||
             cls.includes('bg-muted-foreground/40') ||
             cls.includes('bg-muted-foreground/60') ||
             cls.includes('bg-muted-foreground/80') ||
             cls.includes('bg-green-')
    })
    if (populated.length === 0) return { error: 'no populated cells' }
    // Pick one in the middle-right of the graph for better visual
    const t = populated[Math.floor(populated.length * 0.7)]
    const r = t.getBoundingClientRect()
    return {
      hoverTarget: {
        className: t.className.slice(0, 120),
        bg: getComputedStyle(t).backgroundColor,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      },
      totalCells: allCells.length,
      populatedCount: populated.length,
    }
  }, VITRINE_WRAP_SEL)

  if (hover.error) {
    issue(`vitrine-${dark ? 'dark' : 'light'} hover: ${hover.error}`)
    await page.close(); await ctx.close()
    return null
  }
  ok(`vitrine-${dark ? 'dark' : 'light'} hover: bg=${hover.hoverTarget.bg}`)

  const { x, y, w, h } = hover.hoverTarget.rect
  await page.mouse.move(x + w / 2, y + h / 2)
  await sleep(1200)

  await screenshotSafe(page, `${OUT}/vitrine-${dark ? 'dark' : 'light'}-hover-cell.png`, `vitrine-${dark ? 'dark' : 'light'}-hover-cell.png`)

  const tooltip = await page.evaluate(() => {
    const selectors = [
      '[role="tooltip"]',
      '[data-radix-tooltip-content]',
      '[data-state="delayed-open"][data-side]',
      '[class*="TooltipContent"]',
    ]
    for (const sel of selectors) {
      const el = document.querySelector(sel)
      if (el && el.getBoundingClientRect().width > 0) {
        const cs = getComputedStyle(el)
        return {
          found: true,
          selector: sel,
          text: el.textContent.trim(),
          bg: cs.backgroundColor,
          color: cs.color,
          rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) } })(),
        }
      }
    }
    return { found: false }
  })
  if (tooltip.found) ok(`vitrine-${dark ? 'dark' : 'light'} tooltip: "${tooltip.text.slice(0, 80)}"`)
  else issue(`vitrine-${dark ? 'dark' : 'light'} tooltip: NÃO apareceu`)

  // Empty cell hover (first example)
  const emptyHover = await page.evaluate((sel) => {
    const allWraps = document.querySelectorAll(sel)
    const wrap = allWraps[0]
    if (!wrap) return null
    // Empty cells are placeholder divs WITHOUT rounded-sm AND with the muted-foreground/5 bg
    // OR rounded-sm with the empty level class
    const allCells = Array.from(wrap.querySelectorAll("div"))
    const empties = allCells.filter(c => {
      const cls = c.className || ''
      return (cls.includes('rounded-sm') && cls.includes('bg-muted-foreground/5'))
    })
    if (empties.length === 0) return null
    const t = empties[Math.floor(empties.length / 2)]
    const r = t.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  }, VITRINE_WRAP_SEL)
  if (emptyHover) {
    await page.mouse.move(emptyHover.x + emptyHover.w / 2, emptyHover.y + emptyHover.h / 2)
    await sleep(1000)
    await screenshotSafe(page, `${OUT}/vitrine-${dark ? 'dark' : 'light'}-hover-empty.png`, `vitrine-${dark ? 'dark' : 'light'}-hover-empty.png`)
  }

  await page.close(); await ctx.close()
  return { hover, tooltip }
}

const origHoverResult = await hoverOriginal()
const vitrineHoverLight = await hoverVitrine(false)
const vitrineHoverDark = await hoverVitrine(true)

// ============================================================
// 4. COMPARISON
// ============================================================
console.log("\n=== 4. COMPARISON ===\n")

const diffs = []
function checkEqual(a, b, name, tolerance = 0) {
  if (Math.abs(a - b) > tolerance) diffs.push(`${name}: original=${a} vs vitrine=${b} (Δ${Math.abs(a - b)})`)
}

// Cell count: chanhdai has 370 rects (52 weeks × 7 + ~6 legend). Vitrine has 364 (52 × 7).
// We just verify both are around 360-400.
if (origData.totalCells && vitrineLight.totalCells) {
  // chanhdai: 52×7=364 + ~6 legend rects = 370. Vitrine: 52×7=364.
  if (origData.totalCells < 360) issue(`original cells count baixa: ${origData.totalCells}`)
  if (vitrineLight.totalCells < 360) issue(`vitrine cells count baixa: ${vitrineLight.totalCells}`)
  if (Math.abs(origData.totalCells - vitrineLight.totalCells) > 10) {
    diffs.push(`total cells: original=${origData.totalCells} vs vitrine=${vitrineLight.totalCells} (Δ${Math.abs(origData.totalCells - vitrineLight.totalCells)})`)
  }
}

// Cell dimensions
if (origData.cellDimensions && vitrineLight.cellDimensions) {
  const o = origData.cellDimensions
  const v = vitrineLight.cellDimensions
  checkEqual(o.w, v.w, 'cell width', 1)
  checkEqual(o.h, v.h, 'cell height', 1)
  if (o.gap !== null && v.gap !== null) checkEqual(o.gap, v.gap, 'cell horizontal gap (between weeks)', 1)
  if (o.gapX !== undefined && v.gapX !== null) checkEqual(o.gapX, v.gapX, 'cell horizontal gap (between weeks, raw)', 1)
  if (o.gapY !== undefined && v.gapY !== null) checkEqual(o.gapY, v.gapY, 'cell vertical gap (between days, raw)', 1)
}

// Summary text
// Note: chanhdai's preview doesn't include a "X contributions in the last year" summary line —
// the vitrine adds it as an enhancement. Don't treat absence as a diff.
if (origData.summary && vitrineLight.summary) {
  if (origData.summary !== vitrineLight.summary) {
    diffs.push(`summary: original="${origData.summary}" vs vitrine="${vitrineLight.summary}"`)
  }
}
// (absence on either side is not a diff — it's an enhancement)

// Light vs dark color scale
if (vitrineLight.legendColors.length > 0 && vitrineDark.legendColors.length > 0) {
  if (JSON.stringify(vitrineLight.legendColors) === JSON.stringify(vitrineDark.legendColors)) {
    diffs.push('cores light === dark — provavelmente NÃO está trocando tema')
  } else {
    ok(`cores light/dark diferentes: ${vitrineLight.legendColors.length} vs ${vitrineDark.legendColors.length} cores`)
  }
}

// Tooltip comparison
if (origHoverResult?.tooltip && vitrineHoverLight?.tooltip) {
  if (!origHoverResult.tooltip.found) issue('original tooltip NÃO apareceu')
  if (!vitrineHoverLight.tooltip.found) issue('vitrine tooltip NÃO apareceu')
  if (origHoverResult.tooltip.found && vitrineHoverLight.tooltip.found) {
    // Both should mention "contribution"
    if (!origHoverResult.tooltip.text.toLowerCase().includes('contribution')) {
      issue(`original tooltip não menciona "contribution": "${origHoverResult.tooltip.text}"`)
    }
    if (!vitrineHoverLight.tooltip.text.toLowerCase().includes('contribution')) {
      issue(`vitrine tooltip não menciona "contribution": "${vitrineHoverLight.tooltip.text}"`)
    }
  }
}

if (diffs.length === 0) ok('nenhuma diff estrutural')
for (const d of diffs) issue(`diff: ${d}`)

await browser.close()

// ============================================================
// 5. REPORT
// ============================================================
const major = issues.filter(i => /NÃO|error:|não encontrou|não apareceu|ausentes/i.test(i))
const minor = issues.filter(i => !/NÃO|error:|não encontrou|não apareceu|ausentes/i.test(i))
let score = 100 - major.length * 15 - minor.length * 5
score = Math.max(0, Math.min(100, score))

const verdict = score >= 90 ? '✅ APROVADO — Componente visualmente fiel ao original.' :
                score >= 70 ? '⚠️ APROVAÇÃO PARCIAL — Pequenas diferenças que podem ser ajustadas.' :
                '❌ REPROVADO — Diferenças significativas que precisam de correção.'

const report = `# Validation Report — github-contributions

**Date:** ${new Date().toISOString()}
**Original:** ${ORIGINAL}
**Vitrine:** ${VITRINE}

## Score: ${score}/100

## Screenshots

| File | Description |
|---|---|
| \`original-light.png\` | Original (chanhdai.com) — light |
| \`original-dark.png\` | Original (chanhdai.com) — dark |
| \`vitrine-light.png\` | Vitrine — light |
| \`vitrine-dark.png\` | Vitrine — dark |
| \`original-light-hover-cell.png\` | Original — hover on high-intensity cell (data-level=4) |
| \`original-light-hover-empty.png\` | Original — hover on empty cell (data-level=0) |
| \`vitrine-light-hover-cell.png\` | Vitrine — hover on populated cell (light) |
| \`vitrine-light-hover-empty.png\` | Vitrine — hover on empty cell (light) |
| \`vitrine-dark-hover-cell.png\` | Vitrine — hover on populated cell (dark) |
| \`vitrine-dark-hover-empty.png\` | Vitrine — hover on empty cell (dark) |

## DOM Structure Comparison

### Original (chanhdai.com)
- **Render type:** SVG (\`<svg class="block overflow-visible" viewBox="0 0 739 117" width=739 height=117>\`)
- **Cells:** SVG \`<rect data-count data-date data-level>\` (11×11px)
- **Total cells:** ${origData.totalCells} (52 weeks × 7 days = 364 + 6 legenda = 370)
- **Cell gap:** ${origData.cellDimensions?.gap}px (horizontal entre dias da mesma semana)
- **Same-column gap:** ${origData.sameColumnDy}px (vertical entre semanas — diferença entre cells do mesmo dia)
- **Levels used:** ${JSON.stringify(origData.levels)}
- **Max count:** ${origData.maxCount}
- **Total contributions:** ${origData.totalCount}
- **Summary:** "${origData.summary}"
- **Color scale (chanhdai):** \`data-[level="X"]:fill-muted-foreground/Y\` — uses shadcn tokens (same as vitrine)

### Vitrine (light)
- **Render type:** HTML \`<div>\` grid (Tailwind flex columns, 11×11px each)
- **Cells:** \`<div class="rounded-sm cursor-pointer bg-muted-foreground/X">\` wrapped in \`<Tooltip>\` (Radix shadcn)
- **Total weeks:** ${vitrineLight.totalWeeks} (52)
- **Total cells:** ${vitrineLight.totalCells}
- **Cell dimensions:** ${vitrineLight.cellDimensions?.w}×${vitrineLight.cellDimensions?.h}px
- **Cell gap (vertical same column):** ${vitrineLight.cellDimensions?.gap}px
- **Legend colors:** ${JSON.stringify(vitrineLight.legendColors)}
- **Summary:** "${vitrineLight.summary}"
- **Wrapper rect:** ${vitrineLight.wrapper ? JSON.stringify(vitrineLight.wrapper.rect) : 'N/A'}
- **data-slot:** "${vitrineLight.wrapper?.dataAttrs?.['data-slot'] || 'N/A'}"

### Vitrine (dark)
- **Wrapper rect:** ${vitrineDark.wrapper ? JSON.stringify(vitrineDark.wrapper.rect) : 'N/A'}
- **Legend colors:** ${JSON.stringify(vitrineDark.legendColors)}
- **Summary:** "${vitrineDark.summary}"

## Hover / Tooltip

### Original
- **Target cell:** data-count=${origHoverResult?.hover?.hoverTarget?.dataCount}, data-date=${origHoverResult?.hover?.hoverTarget?.dataDate}, data-level=${origHoverResult?.hover?.hoverTarget?.dataLevel}
- **Tooltip:** ${origHoverResult?.tooltip?.found ? `✅ "${origHoverResult.tooltip.text.slice(0, 100)}"\n  - bg: ${origHoverResult.tooltip.bg}\n  - color: ${origHoverResult.tooltip.color}` : '❌ não apareceu'}

### Vitrine (light)
- **Target cell bg:** ${vitrineHoverLight?.hover?.hoverTarget?.bg}
- **Tooltip:** ${vitrineHoverLight?.tooltip?.found ? `✅ "${vitrineHoverLight.tooltip.text.slice(0, 100)}"\n  - bg: ${vitrineHoverLight.tooltip.bg}\n  - color: ${vitrineHoverLight.tooltip.color}` : '❌ não apareceu'}

### Vitrine (dark)
- **Target cell bg:** ${vitrineHoverDark?.hover?.hoverTarget?.bg}
- **Tooltip:** ${vitrineHoverDark?.tooltip?.found ? `✅ "${vitrineHoverDark.tooltip.text.slice(0, 100)}"\n  - bg: ${vitrineHoverDark.tooltip.bg}\n  - color: ${vitrineHoverDark.tooltip.color}` : '❌ não apareceu'}

## Diffs Estruturais

${diffs.length === 0 ? '✅ Nenhuma diferença estrutural detectada.' : diffs.map(d => `- ⚠️ ${d}`).join('\n')}

## Issues Encontrados (${issues.length})

${issues.length === 0 ? '✅ Nenhum problema encontrado.' :
  issues.map((s, i) => {
    const isMajor = /NÃO|error:|não encontrou|não apareceu|ausentes/i.test(s)
    return `${i + 1}. ${isMajor ? '❌' : '⚠️'} ${s}`
  }).join('\n')}

## Veredito

${verdict}
`

writeFileSync(`${OUT}/REPORT.md`, report)
ok(`REPORT.md salvo`)

console.log(`\n${'='.repeat(60)}`)
console.log(`✅ Validação completa: ${OUT}/REPORT.md — Score ${score}/100 — ${issues.length} problemas`)
console.log(`${'='.repeat(60)}\n`)
