/**
 * Validação visual Playwright — elastic-slider
 * Compara: https://chanhdai.com/components/elastic-slider vs http://localhost:5173/components/elastic-slider
 *
 * Gera:
 *   shots/elastic-slider/original-light.png
 *   shots/elastic-slider/original-dark.png
 *   shots/elastic-slider/vitrine-light.png
 *   shots/elastic-slider/vitrine-dark.png
 *   shots/elastic-slider/inspect-original.json
 *   shots/elastic-slider/inspect-vitrine-light.json
 *   shots/elastic-slider/inspect-vitrine-dark.json
 *   shots/elastic-slider/vitrine-light-hover-thumb.png
 *   shots/elastic-slider/vitrine-light-drag-25.png
 *   shots/elastic-slider/vitrine-light-drag-50.png
 *   shots/elastic-slider/vitrine-light-drag-75.png
 *   shots/elastic-slider/vitrine-light-drag-100.png
 *   shots/elastic-slider/vitrine-light-elastic-overshoot.png
 *   shots/elastic-slider/vitrine-light-elastic-settled.png
 *   shots/elastic-slider/original-light-hover-thumb.png
 *   shots/elastic-slider/original-light-drag-25.png
 *   shots/elastic-slider/original-light-drag-50.png
 *   shots/elastic-slider/original-light-drag-75.png
 *   shots/elastic-slider/original-light-drag-100.png
 *   shots/elastic-slider/original-light-elastic-overshoot.png
 *   shots/elastic-slider/original-light-elastic-settled.png
 *   shots/elastic-slider/REPORT.md
 */
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const OUT = outPath("elastic-slider")  // resolve sob _meta/scratch/shots/elastic-slider
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }
const TIMEOUT = 30000
const WAIT_MS = 2000

// ── helpers ──────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function setDark(page) {
  await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
}

async function screenshot(page, name) {
  const path = `${OUT}/${name}.png`
  await page.screenshot({ path, fullPage: false })
  console.log(`  ✓ ${name}.png`)
  return path
}

async function inspectDOM(page, label) {
  const data = await page.evaluate(() => {
    // Find the slider wrapper
    const wrap = document.querySelector("[data-slot='elastic-slider']")
    if (!wrap) return { error: "wrapper not found" }

    const rect = wrap.getBoundingClientRect()
    const computed = getComputedStyle(wrap)

    // Track element
    const track = wrap.querySelector("[role='slider']")
    const trackRect = track ? track.getBoundingClientRect() : null
    const trackStyle = track ? getComputedStyle(track) : null

    // Fill
    const fill = wrap.querySelector("[data-slot='elastic-slider-fill']")
    const fillRect = fill ? fill.getBoundingClientRect() : null
    const fillStyle = fill ? getComputedStyle(fill) : null

    // Handle
    const handle = wrap.querySelector("[data-slot='elastic-slider-handle']")
    const handleRect = handle ? handle.getBoundingClientRect() : null
    const handleStyle = handle ? getComputedStyle(handle) : null

    // Value display
    const valueEl = wrap.querySelector("[data-slot='elastic-slider-value']")
    const labelEl = wrap.querySelector("[data-slot='elastic-slider-label']")

    // Hash marks
    const hashMarks = wrap.querySelectorAll("[data-slot='elastic-slider-hash-marks'] > div")

    // ARIA
    const aria = track ? {
      min: track.getAttribute("aria-valuemin"),
      max: track.getAttribute("aria-valuemax"),
      now: track.getAttribute("aria-valuenow"),
      text: track.getAttribute("aria-valuetext"),
      label: track.getAttribute("aria-label"),
    } : null

    // CSS custom properties from inline style
    const inlineStyle = wrap.getAttribute("style") || ""
    const dataAttrs = {}
    for (const attr of wrap.attributes) {
      if (attr.name.startsWith("data-")) dataAttrs[attr.name] = attr.value
    }

    // Track data attrs
    const trackDataAttrs = {}
    if (track) {
      for (const attr of track.attributes) {
        if (attr.name.startsWith("data-")) trackDataAttrs[attr.name] = attr.value
      }
    }

    return {
      wrapper: {
        tag: wrap.tagName,
        dataSlot: wrap.dataset.slot,
        dataAttrs,
        rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        bg: computed.backgroundColor,
        color: computed.color,
        computedHeight: computed.height,
      },
      track: track ? {
        rect: trackRect ? { x: trackRect.x, y: trackRect.y, w: trackRect.width, h: trackRect.height } : null,
        bg: trackStyle?.backgroundColor,
        dataAttrs: trackDataAttrs,
        aria,
      } : null,
      fill: fill ? {
        rect: fillRect ? { x: fillRect.x, y: fillRect.y, w: fillRect.width, h: fillRect.height } : null,
        bg: fillStyle?.backgroundColor,
        width: fillStyle?.width,
      } : null,
      handle: handle ? {
        rect: handleRect ? { x: handleRect.x, y: handleRect.y, w: handleRect.width, h: handleRect.height } : null,
        bg: handleStyle?.backgroundColor,
        left: handleStyle?.left,
        transform: handleStyle?.transform,
      } : null,
      valueDisplay: valueEl ? {
        text: valueEl.textContent?.trim(),
        visible: valueEl.getBoundingClientRect().width > 0,
      } : null,
      label: labelEl ? {
        text: labelEl.textContent?.trim(),
        visible: labelEl.getBoundingClientRect().width > 0,
      } : null,
      hashMarks: hashMarks.length,
    }
  })

  const jsonPath = `${OUT}/inspect-${label}.json`
  writeFileSync(jsonPath, JSON.stringify(data, null, 2))
  console.log(`  ✓ inspect-${label}.json`)
  return data
}

// ── get slider track rect for drag operations ────────────────────────
async function getSliderTrackRect(page, selector = "[data-slot='elastic-slider'] [role='slider']") {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  }, selector)
}

// ── perform drag on slider ──────────────────────────────────────────
async function dragSlider(page, targetPercent, label) {
  const track = await getSliderTrackRect(page)
  if (!track) { console.log(`  ✗ track not found for ${label}`); return }

  const startX = track.x + 4 // start from left edge + small offset
  const endX = track.x + track.w * (targetPercent / 100)
  const y = track.y + track.h / 2

  await page.mouse.move(startX, y)
  await page.mouse.down()
  await sleep(100)

  // Move in steps for smooth drag
  const steps = 10
  for (let i = 1; i <= steps; i++) {
    const x = startX + (endX - startX) * (i / steps)
    await page.mouse.move(x, y)
    await sleep(30)
  }

  await sleep(200)
  const path = await screenshot(page, label)
  await page.mouse.up()
  await sleep(300)
  return path
}

// ── perform elastic overshoot drag ──────────────────────────────────
async function dragOvershoot(page, direction, labelOvershoot, labelSettled) {
  const track = await getSliderTrackRect(page)
  if (!track) { console.log(`  ✗ track not found for overshoot`); return }

  const y = track.y + track.h / 2
  const startX = track.x + track.w / 2 // start from middle

  // Target beyond the edge
  const overshootPx = 60
  const targetX = direction === "right"
    ? track.x + track.w + overshootPx
    : track.x - overshootPx

  await page.mouse.move(startX, y)
  await page.mouse.down()
  await sleep(100)

  // Move to edge first
  const edgeX = direction === "right" ? track.x + track.w - 4 : track.x + 4
  await page.mouse.move(edgeX, y)
  await sleep(200)

  // Then overshoot
  await page.mouse.move(targetX, y)
  await sleep(300)

  // Capture overshoot state
  await screenshot(page, labelOvershoot)

  // Release and capture settled state
  await page.mouse.up()
  await sleep(1000) // wait for bounce-back animation
  await screenshot(page, labelSettled)
}

// ── MAIN ────────────────────────────────────────────────────────────
async function main() {
  const browser = await chromium.launch()
  const results = { original: {}, vitrine: {}, comparisons: [] }

  // ═══════════════════════════════════════════════════════════════════
  // 1. PRINTS — Original site (light + dark)
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n═══ ORIGINAL (chanhdai.com) ═══")

  for (const mode of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: VIEWPORT })
    const page = await ctx.newPage()
    if (mode === "dark") await setDark(page)

    console.log(`\n[original-${mode}]`)
    try {
      await page.goto("https://chanhdai.com/components/elastic-slider", {
        waitUntil: "networkidle",
        timeout: TIMEOUT,
      })
    } catch (e) {
      console.warn(`  warn goto: ${e.message}`)
    }
    await page.waitForTimeout(WAIT_MS + 2000) // extra wait for animations

    await screenshot(page, `original-${mode}`)
    const inspect = await inspectDOM(page, `original-${mode}`)
    results.original[mode] = inspect

    await page.close()
    await ctx.close()
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. PRINTS — Vitrine (light + dark)
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n═══ VITRINE (localhost:5173) ═══")

  for (const mode of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: VIEWPORT })
    const page = await ctx.newPage()
    if (mode === "dark") await setDark(page)

    console.log(`\n[vitrine-${mode}]`)
    try {
      await page.goto("http://localhost:5173/components/elastic-slider", {
        waitUntil: "networkidle",
        timeout: TIMEOUT,
      })
    } catch (e) {
      console.warn(`  warn goto: ${e.message}`)
    }
    await page.waitForTimeout(WAIT_MS)

    await screenshot(page, `vitrine-${mode}`)
    const inspect = await inspectDOM(page, `vitrine-${mode}`)
    results.vitrine[mode] = inspect

    await page.close()
    await ctx.close()
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. INTERACTIONS — Vitrine light
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n═══ INTERAÇÕES VITRINE (light) ═══")

  {
    const ctx = await browser.newContext({ viewport: VIEWPORT })
    const page = await ctx.newPage()

    try {
      await page.goto("http://localhost:5173/components/elastic-slider", {
        waitUntil: "networkidle",
        timeout: TIMEOUT,
      })
    } catch (e) { console.warn(`  warn: ${e.message}`) }
    await page.waitForTimeout(WAIT_MS)

    // Hover on thumb
    console.log("\n[vitrine hover thumb]")
    const track = await getSliderTrackRect(page)
    if (track) {
      const thumbX = track.x + track.w * 0.5 // thumb at ~50% (default)
      const thumbY = track.y + track.h / 2
      await page.mouse.move(thumbX, thumbY)
      await sleep(500)
      await screenshot(page, "vitrine-light-hover-thumb")
    }

    // Drag to 25%
    console.log("\n[vitrine drag 25%]")
    await dragSlider(page, 25, "vitrine-light-drag-25")

    // Drag to 50%
    console.log("\n[vitrine drag 50%]")
    await dragSlider(page, 50, "vitrine-light-drag-50")

    // Drag to 75%
    console.log("\n[vitrine drag 75%]")
    await dragSlider(page, 75, "vitrine-light-drag-75")

    // Drag to 100%
    console.log("\n[vitrine drag 100%]")
    await dragSlider(page, 100, "vitrine-light-drag-100")

    // Elastic overshoot — right (beyond max)
    console.log("\n[vitrine elastic overshoot right]")
    await dragOvershoot(page, "right", "vitrine-light-elastic-overshoot-right", "vitrine-light-elastic-settled-right")

    // Elastic overshoot — left (beyond min)
    console.log("\n[vitrine elastic overshoot left]")
    await dragOvershoot(page, "left", "vitrine-light-elastic-overshoot-left", "vitrine-light-elastic-settled-left")

    await page.close()
    await ctx.close()
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. INTERACTIONS — Original light
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n═══ INTERAÇÕES ORIGINAL (light) ═══")

  {
    const ctx = await browser.newContext({ viewport: VIEWPORT })
    const page = await ctx.newPage()

    try {
      await page.goto("https://chanhdai.com/components/elastic-slider", {
        waitUntil: "networkidle",
        timeout: TIMEOUT,
      })
    } catch (e) { console.warn(`  warn: ${e.message}`) }
    await page.waitForTimeout(WAIT_MS + 2000)

    // Hover on thumb
    console.log("\n[original hover thumb]")
    const track = await getSliderTrackRect(page)
    if (track) {
      const thumbX = track.x + track.w * 0.5
      const thumbY = track.y + track.h / 2
      await page.mouse.move(thumbX, thumbY)
      await sleep(500)
      await screenshot(page, "original-light-hover-thumb")
    }

    // Drag to 25%
    console.log("\n[original drag 25%]")
    await dragSlider(page, 25, "original-light-drag-25")

    // Drag to 50%
    console.log("\n[original drag 50%]")
    await dragSlider(page, 50, "original-light-drag-50")

    // Drag to 75%
    console.log("\n[original drag 75%]")
    await dragSlider(page, 75, "original-light-drag-75")

    // Drag to 100%
    console.log("\n[original drag 100%]")
    await dragSlider(page, 100, "original-light-drag-100")

    // Elastic overshoot — right
    console.log("\n[original elastic overshoot right]")
    await dragOvershoot(page, "right", "original-light-elastic-overshoot-right", "original-light-elastic-settled-right")

    // Elastic overshoot — left
    console.log("\n[original elastic overshoot left]")
    await dragOvershoot(page, "left", "original-light-elastic-overshoot-left", "original-light-elastic-settled-left")

    await page.close()
    await ctx.close()
  }

  await browser.close()

  // ═══════════════════════════════════════════════════════════════════
  // 5. COMPARAÇÃO & REPORT
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n═══ GERANDO REPORT ═══")
  generateReport(results)
  console.log(`\n✓ ${OUT}/REPORT.md`)
}

// ── REPORT GENERATOR ────────────────────────────────────────────────
function generateReport(results) {
  const o = results.original
  const v = results.vitrine

  const oLight = o.light
  const oDark = o.dark
  const vLight = v.light
  const vDark = v.dark

  let score = 100
  const issues = []
  const checks = []

  // Check 1: Wrapper exists
  const oWrap = oLight?.wrapper
  const vWrap = vLight?.wrapper
  if (!oWrap) { issues.push("ORIGINAL: wrapper não encontrado"); score -= 10 }
  if (!vWrap) { issues.push("VITRINE: wrapper não encontrado"); score -= 10 }
  checks.push({ name: "Wrapper existe", status: oWrap && vWrap ? "✅" : "❌" })

  // Check 2: data-slot
  const oSlot = oWrap?.dataSlot
  const vSlot = vWrap?.dataSlot
  checks.push({ name: "data-slot=\"elastic-slider\"", status: vSlot === "elastic-slider" ? "✅" : "❌" })
  if (vSlot !== "elastic-slider") { issues.push(`data-slot errado: ${vSlot}`); score -= 5 }

  // Check 3: Dimensions
  if (oWrap?.rect && vWrap?.rect) {
    const ow = Math.round(oWrap.rect.w)
    const vw = Math.round(vWrap.rect.w)
    const oh = Math.round(oWrap.rect.h)
    const vh = Math.round(vWrap.rect.h)
    const wDiff = Math.abs(ow - vw)
    const hDiff = Math.abs(oh - vh)
    const wOk = wDiff < 50
    const hOk = hDiff < 20
    checks.push({ name: `Largura (orig=${ow}px, vit=${vw}px)`, status: wOk ? "✅" : "⚠️" })
    checks.push({ name: `Altura (orig=${oh}px, vit=${vh}px)`, status: hOk ? "✅" : "⚠️" })
    if (!wOk) { issues.push(`Largura difere: ${ow} vs ${vw} (diff=${wDiff}px)`); score -= 5 }
    if (!hOk) { issues.push(`Altura difere: ${oh} vs ${vh} (diff=${hDiff}px)`); score -= 5 }
  }

  // Check 4: Track exists
  const oTrack = oLight?.track
  const vTrack = vLight?.track
  checks.push({ name: "Track (role=slider) existe", status: oTrack && vTrack ? "✅" : "❌" })
  if (!vTrack) { issues.push("Track não encontrada"); score -= 10 }

  // Check 5: Fill exists
  const oFill = oLight?.fill
  const vFill = vLight?.fill
  checks.push({ name: "Fill existe", status: oFill && vFill ? "✅" : "❌" })
  if (!vFill) { issues.push("Fill não encontrado"); score -= 10 }

  // Check 6: Handle exists
  const oHandle = oLight?.handle
  const vHandle = vLight?.handle
  checks.push({ name: "Handle existe", status: oHandle && vHandle ? "✅" : "❌" })
  if (!vHandle) { issues.push("Handle não encontrado"); score -= 10 }

  // Check 7: Value display
  const oVal = oLight?.valueDisplay
  const vVal = vLight?.valueDisplay
  checks.push({ name: "Value display existe", status: oVal && vVal ? "✅" : "❌" })
  if (oVal && vVal) {
    const sameText = oVal.text === vVal.text
    checks.push({ name: `Valor inicial (orig=${oVal.text}, vit=${vVal.text})`, status: sameText ? "✅" : "⚠️" })
    if (!sameText) { issues.push(`Valor inicial difere: ${oVal.text} vs ${vVal.text}`); score -= 3 }
  }

  // Check 8: ARIA
  const oAria = oTrack?.aria
  const vAria = vTrack?.aria
  if (oAria && vAria) {
    checks.push({ name: `ARIA min (orig=${oAria.min}, vit=${vAria.min})`, status: oAria.min === vAria.min ? "✅" : "⚠️" })
    checks.push({ name: `ARIA max (orig=${oAria.max}, vit=${vAria.max})`, status: oAria.max === vAria.max ? "✅" : "⚠️" })
    checks.push({ name: `ARIA now (orig=${oAria.now}, vit=${vAria.now})`, status: oAria.now === vAria.now ? "✅" : "⚠️" })
    if (oAria.min !== vAria.min) { issues.push(`ARIA min difere: ${oAria.min} vs ${vAria.min}`); score -= 3 }
    if (oAria.max !== vAria.max) { issues.push(`ARIA max difere: ${oAria.max} vs ${vAria.max}`); score -= 3 }
    if (oAria.now !== vAria.now) { issues.push(`ARIA now difere: ${oAria.now} vs ${vAria.now}`); score -= 3 }
  }

  // Check 9: Hash marks
  const oHash = oLight?.hashMarks
  const vHash = vLight?.hashMarks
  checks.push({ name: `Hash marks (orig=${oHash}, vit=${vHash})`, status: oHash === vHash ? "✅" : "⚠️" })
  if (oHash !== vHash) { issues.push(`Hash marks difere: ${oHash} vs ${vHash}`); score -= 2 }

  // Check 10: Dark mode colors
  if (oDark?.wrapper && vDark?.wrapper) {
    const oBg = oDark.wrapper.bg
    const vBg = vDark.wrapper.bg
    checks.push({ name: `Dark bg (orig=${oBg}, vit=${vBg})`, status: oBg === vBg ? "✅" : "⚠️" })
    if (oBg !== vBg) { issues.push(`Dark bg difere: ${oBg} vs ${vBg}`); score -= 5 }
  }

  // Check 11: Light mode colors
  if (oLight?.wrapper && vLight?.wrapper) {
    const oBg = oLight.wrapper.bg
    const vBg = vLight.wrapper.bg
    checks.push({ name: `Light bg (orig=${oBg}, vit=${vBg})`, status: oBg === vBg ? "✅" : "⚠️" })
    if (oBg !== vBg) { issues.push(`Light bg difere: ${oBg} vs ${vBg}`); score -= 5 }
  }

  // Check 12: Label
  const oLabel = oLight?.label
  const vLabel = vLight?.label
  if (oLabel && vLabel) {
    checks.push({ name: `Label (orig="${oLabel.text}", vit="${vLabel.text}")`, status: oLabel.text === vLabel.text ? "✅" : "⚠️" })
  }

  // Check 13: Elastic stretch (track transform during drag)
  // This is verified by the overshoot screenshots — we note it
  checks.push({ name: "Efeito elástico (overshoot)", status: "📸" })

  score = Math.max(0, score)

  // Build markdown
  let md = `# Relatório de Validação Visual — elastic-slider

**Data:** ${new Date().toISOString()}
**Original:** https://chanhdai.com/components/elastic-slider
**Vitrine:** http://localhost:5173/components/elastic-slider
**Score:** ${score}/100
**Problemas:** ${issues.length}

---

## Resumo

| Check | Status |
|---|---|
${checks.map(c => `| ${c.name} | ${c.status} |`).join("\n")}

`

  if (issues.length > 0) {
    md += `## Problemas Encontrados\n\n`
    issues.forEach((iss, i) => { md += `${i + 1}. ${iss}\n` })
    md += `\n`
  } else {
    md += `## ✅ Nenhum problema encontrado\n\n`
  }

  md += `## Prints

### Light Mode
- Original: ![original-light](original-light.png)
- Vitrine: ![vitrine-light](vitrine-light.png)

### Dark Mode
- Original: ![original-dark](original-dark.png)
- Vitrine: ![vitrine-dark](vitrine-dark.png)

### Interações Vitrine (Light)
- Hover no thumb: ![hover](vitrine-light-hover-thumb.png)
- Drag 25%: ![drag25](vitrine-light-drag-25.png)
- Drag 50%: ![drag50](vitrine-light-drag-50.png)
- Drag 75%: ![drag75](vitrine-light-drag-75.png)
- Drag 100%: ![drag100](vitrine-light-drag-100.png)
- Elastic overshoot right: ![overshoot](vitrine-light-elastic-overshoot-right.png)
- Elastic settled right: ![settled](vitrine-light-elastic-settled-right.png)
- Elastic overshoot left: ![overshoot](vitrine-light-elastic-overshoot-left.png)
- Elastic settled left: ![settled](vitrine-light-elastic-settled-left.png)

### Interações Original (Light)
- Hover no thumb: ![hover](original-light-hover-thumb.png)
- Drag 25%: ![drag25](original-light-drag-25.png)
- Drag 50%: ![drag50](original-light-drag-50.png)
- Drag 75%: ![drag75](original-light-drag-75.png)
- Drag 100%: ![drag100](original-light-drag-100.png)
- Elastic overshoot right: ![overshoot](original-light-elastic-overshoot-right.png)
- Elastic settled right: ![settled](original-light-elastic-settled-right.png)
- Elastic overshoot left: ![overshoot](original-light-elastic-overshoot-left.png)
- Elastic settled left: ![settled](original-light-elastic-settled-left.png)

## Inspeção DOM

### Original (Light)
\`\`\`json
${JSON.stringify(oLight, null, 2)}
\`\`\`

### Vitrine (Light)
\`\`\`json
${JSON.stringify(vLight, null, 2)}
\`\`\`

### Vitrine (Dark)
\`\`\`json
${JSON.stringify(vDark, null, 2)}
\`\`\`
`

  writeFileSync(`${OUT}/REPORT.md`, md)
}

// ── RUN ─────────────────────────────────────────────────────────────
main().catch(e => {
  console.error("FATAL:", e)
  process.exit(1)
})
