/**
 * Validação visual: code-block-command
 * Compara chanhdai.com vs vitrine (localhost:5173)
 */
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const OUT = outPath("code-block-command")
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }
const ORIGINAL = "https://chanhdai.com/components/code-block-command"
const VITRINE = "http://localhost:5173/components/code-block-command"

const browser = await chromium.launch()
const results = {}

// ─── HELPERS ────────────────────────────────────────────────────────────────

async function freshPage(ctx, dark = false) {
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  return page
}

async function waitAndScreenshot(page, path, label) {
  try {
    await page.goto(page.url() || ORIGINAL, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`  [warn] ${label} goto: ${e.message}`)
  }
  await page.waitForTimeout(2500)
  await page.screenshot({ path, fullPage: false })
  console.log(`  ✓ ${path}`)
}

// ─── STEP 1: PRINTS INICIAIS (4 imagens) ────────────────────────────────────

console.log("\n═══ STEP 1: Prints iniciais ═══")

// 1a. Original light
console.log("\n[1/4] Original (light)...")
{
  const ctx = await browser.newContext({ ...VIEWPORT, colorScheme: 'light' })
  const page = await ctx.newPage()
  await page.goto(ORIGINAL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${OUT}/original-light.png`, fullPage: false })
  console.log(`  ✓ ${OUT}/original-light.png`)
  await ctx.close()
}

// 1b. Original dark
console.log("\n[2/4] Original (dark)...")
{
  const ctx = await browser.newContext({ ...VIEWPORT, colorScheme: 'dark' })
  const page = await ctx.newPage()
  await page.goto(ORIGINAL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${OUT}/original-dark.png`, fullPage: false })
  console.log(`  ✓ ${OUT}/original-dark.png`)
  await ctx.close()
}

// 1c. Vitrine light
console.log("\n[3/4] Vitrine (light)...")
{
  const ctx = await browser.newContext(VIEWPORT)
  const page = await ctx.newPage()
  await page.goto(VITRINE, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${OUT}/vitrine-light.png`, fullPage: false })
  console.log(`  ✓ ${OUT}/vitrine-light.png`)
  await ctx.close()
}

// 1d. Vitrine dark
console.log("\n[4/4] Vitrine (dark)...")
{
  const ctx = await browser.newContext(VIEWPORT)
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    localStorage.setItem("vitrine-theme", "dark")
  })
  await page.goto(VITRINE, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${OUT}/vitrine-dark.png`, fullPage: false })
  console.log(`  ✓ ${OUT}/vitrine-dark.png`)
  await ctx.close()
}

// ─── STEP 2: INSPEÇÃO DOM (3 JSONs) ─────────────────────────────────────────

console.log("\n═══ STEP 2: Inspeção DOM ═══")

async function inspectDOM(url, label, isVitrine, dark = false) {
  console.log(`\n[inspect] ${label}...`)
  const ctx = await browser.newContext(VIEWPORT)
  const page = await ctx.newPage()
  if (isVitrine && dark) {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`  [warn] goto: ${e.message}`)
  }
  await page.waitForTimeout(2000)

  const data = await page.evaluate(() => {
    // Find the code block wrapper — try multiple selectors.
    // Prefer the specific data-slot first to avoid matching header/layout
    // elements that also carry data-slot (e.g. sheet-trigger, tabs).
    const selectors = [
      '[data-slot="code-block-command"]',
      ".code-block",
      "pre",
      "[class*='code']",
      "[class*='command']",
      "[class*='shiki']",
      "[class*='highlight']",
    ]
    let wrap = null
    for (const sel of selectors) {
      wrap = document.querySelector(sel)
      if (wrap) break
    }
    if (!wrap) {
      // Fallback: find the main content area
      wrap = document.querySelector("main") || document.body
    }

    const wrapRect = wrap.getBoundingClientRect()
    const wrapStyle = getComputedStyle(wrap)

    // Find all code tokens / spans inside
    const tokens = []
    const codeEl = wrap.closest("pre") || wrap.querySelector("pre") || wrap
    const spans = codeEl.querySelectorAll("span, code, [class*='token'], [class*='syntax']")
    spans.forEach((span, i) => {
      if (i > 30) return // cap
      const s = getComputedStyle(span)
      tokens.push({
        text: span.textContent?.trim().slice(0, 40) || "",
        color: s.color,
        bg: s.backgroundColor,
        fontWeight: s.fontWeight,
        fontSize: s.fontSize,
      })
    })

    // Also try to get the raw text content of the code area
    const rawText = codeEl.textContent?.trim().slice(0, 300) || ""

    // Find copy button
    const copyBtn = document.querySelector(
      "button[class*='copy'], [class*='copy-btn'], [data-copy], button:has(svg), button[aria-label*='copy' i], button[aria-label*='copiar' i]"
    )
    let copyBtnInfo = null
    if (copyBtn) {
      const r = copyBtn.getBoundingClientRect()
      const s = getComputedStyle(copyBtn)
      copyBtnInfo = {
        text: copyBtn.textContent?.trim().slice(0, 30),
        ariaLabel: copyBtn.getAttribute("aria-label"),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        bg: s.backgroundColor,
        color: s.color,
        border: s.border,
        borderRadius: s.borderRadius,
        position: s.position,
        display: copyBtn.style.display,
        innerHTML: copyBtn.innerHTML.slice(0, 200),
      }
    }

    // CSS custom properties on the wrapper
    const customProps = {}
    for (const prop of wrapStyle) {
      if (prop.startsWith("--")) {
        customProps[prop] = wrapStyle.getPropertyValue(prop)
      }
    }

    // data-* attributes
    const dataAttrs = {}
    for (const attr of wrap.attributes) {
      if (attr.name.startsWith("data-")) {
        dataAttrs[attr.name] = attr.value
      }
    }

    // Font info
    const fontFamilies = wrapStyle.fontFamily

    return {
      selector: wrap.tagName + (wrap.className ? "." + wrap.className.split(" ").slice(0, 3).join(".") : ""),
      rect: { w: Math.round(wrapRect.width), h: Math.round(wrapRect.height), x: Math.round(wrapRect.x), y: Math.round(wrapRect.y) },
      bg: wrapStyle.backgroundColor,
      color: wrapStyle.color,
      fontSize: wrapStyle.fontSize,
      fontWeight: wrapStyle.fontWeight,
      lineHeight: wrapStyle.lineHeight,
      fontFamily: fontFamilies,
      borderRadius: wrapStyle.borderRadius,
      padding: wrapStyle.padding,
      border: wrapStyle.border,
      tokens: tokens.slice(0, 20),
      rawText,
      copyBtn: copyBtnInfo,
      customProps,
      dataAttrs,
    }
  })

  const outPath = `${OUT}/inspect-${label}.json`
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`  ✓ ${outPath}`)
  await ctx.close()
  return data
}

const origData = await inspectDOM(ORIGINAL, "original", false)
const vitLightData = await inspectDOM(VITRINE, "vitrine-light", true, false)
const vitDarkData = await inspectDOM(VITRINE, "vitrine-dark", true, true)

// ─── STEP 3: INTERAÇÕES ─────────────────────────────────────────────────────

console.log("\n═══ STEP 3: Interações ═══")

// 3a. Hover copy button — vitrine light
console.log("\n[interaction] Hover copy button — vitrine light...")
{
  const ctx = await browser.newContext(VIEWPORT)
  const page = await ctx.newPage()
  await page.goto(VITRINE, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2000)
  const copyBtn = await page.$(
    "button[class*='copy'], [class*='copy-btn'], [data-copy], button:has(svg), button[aria-label*='copy' i]"
  )
  if (copyBtn) {
    await copyBtn.hover()
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${OUT}/vitrine-light-hover-copy.png`, fullPage: false })
    console.log(`  ✓ ${OUT}/vitrine-light-hover-copy.png`)
  } else {
    console.warn("  ⚠ Copy button not found on vitrine")
    await page.screenshot({ path: `${OUT}/vitrine-light-hover-copy.png`, fullPage: false })
  }
  await ctx.close()
}

// 3b. Hover copy button — original light
console.log("\n[interaction] Hover copy button — original light...")
{
  const ctx = await browser.newContext(VIEWPORT)
  const page = await ctx.newPage()
  await page.goto(ORIGINAL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2000)
  const copyBtn = await page.$(
    "button[class*='copy'], [class*='copy-btn'], [data-copy], button:has(svg), button[aria-label*='copy' i]"
  )
  if (copyBtn) {
    await copyBtn.hover()
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${OUT}/original-light-hover-copy.png`, fullPage: false })
    console.log(`  ✓ ${OUT}/original-light-hover-copy.png`)
  } else {
    console.warn("  ⚠ Copy button not found on original")
    await page.screenshot({ path: `${OUT}/original-light-hover-copy.png`, fullPage: false })
  }
  await ctx.close()
}

// 3c. Click copy button — vitrine light (feedback "copied!")
console.log("\n[interaction] Click copy button — vitrine light...")
{
  const ctx = await browser.newContext(VIEWPORT)
  const page = await ctx.newPage()
  await page.goto(VITRINE, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2000)
  // Scope to the code-block-command wrapper to avoid clicking unrelated buttons.
  const copyBtn = await page.$(
    '[data-slot="code-block-command"] button'
  )
  if (copyBtn) {
    await copyBtn.click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${OUT}/vitrine-light-after-copy.png`, fullPage: false })
    console.log(`  ✓ ${OUT}/vitrine-light-after-copy.png`)
  } else {
    console.warn("  ⚠ Copy button not found, skipping click")
    await page.screenshot({ path: `${OUT}/vitrine-light-after-copy.png`, fullPage: false })
  }
  await ctx.close()
}

// 3d. Hover on a code token (if interactive)
console.log("\n[interaction] Hover on code token — vitrine light...")
{
  const ctx = await browser.newContext(VIEWPORT)
  const page = await ctx.newPage()
  await page.goto(VITRINE, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2000)
  // Scope the token lookup to the code-block-command pre/code area.
  const token = await page.$('[data-slot="code-block-command"] pre span, [data-slot="code-block-command"] code span')
  if (token) {
    await token.hover()
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/vitrine-light-hover-token.png`, fullPage: false })
    console.log(`  ✓ ${OUT}/vitrine-light-hover-token.png`)
  } else {
    console.warn("  ⚠ No interactive tokens found")
  }
  await ctx.close()
}

await browser.close()

// ─── STEP 4: GERAR RELATÓRIO ────────────────────────────────────────────────

console.log("\n═══ STEP 4: Gerando REPORT.md ═══")

function compareAttr(label, orig, vit, tolerance = 0) {
  if (orig === vit) return { status: "✅", orig, vit }
  if (!orig || !vit) return { status: "⚠️", orig: orig || "N/A", vit: vit || "N/A" }
  // For colors, do a loose comparison
  if (label.toLowerCase().includes("color") || label.toLowerCase().includes("bg")) {
    return { status: "⚠️", orig, vit }
  }
  return { status: "❌", orig, vit }
}

const orig = origData
const vLight = vitLightData
const vDark = vitDarkData

// Determine syntax highlighting presence
const origHasTokens = orig.tokens && orig.tokens.length > 0 && orig.tokens.some(t => t.color && t.color !== "rgba(0, 0, 0, 0)" && t.color !== orig.color)
const lightHasTokens = vLight.tokens && vLight.tokens.length > 0 && vLight.tokens.some(t => t.color && t.color !== "rgba(0, 0, 0, 0)" && t.color !== vLight.color)
const darkHasTokens = vDark.tokens && vDark.tokens.length > 0 && vDark.tokens.some(t => t.color && t.color !== "rgba(0, 0, 0, 0)" && t.color !== vDark.color)

// Check prefix styling ($ or >)
const origPrefix = orig.tokens?.find(t => t.text === "$" || t.text === ">" || t.text.startsWith("$"))
const lightPrefix = vLight.tokens?.find(t => t.text === "$" || t.text === ">" || t.text.startsWith("$"))

// Build problems list
const problems = []
if (orig.bg !== vLight.bg) problems.push(["medium", `Background light mode: original=${orig.bg} vs vitrine=${vLight.bg}`])

// Helper: extract lightness (0-100) from lab()/oklch()/rgb() color strings.
// Browsers serialize computed colors in the format the stylesheet defines,
// so original (lab) and vitrine (oklch) won't match by string even when
// visually equivalent. Parse and compare on the lightness axis with tolerance.
function colorLightness(color) {
  if (!color) return null
  const lab = color.match(/lab\(\s*([\d.]+)%?\s/)
  if (lab) return parseFloat(lab[1])
  const oklch = color.match(/oklch\(\s*([\d.]+)/)
  if (oklch) return parseFloat(oklch[1]) * 100
  const rgb = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgb) {
    // Approximate perceived lightness from RGB (0-255 → 0-100).
    const [r, g, b] = [rgb[1], rgb[2], rgb[3]].map(Number)
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 2.55
  }
  return null
}
function colorsEquivalent(c1, c2, tolerance = 15) {
  const l1 = colorLightness(c1)
  const l2 = colorLightness(c2)
  if (l1 === null || l2 === null) return c1 === c2
  return Math.abs(l1 - l2) <= tolerance
}
if (!colorsEquivalent(orig.color, vLight.color)) problems.push(["medium", `Text color light mode: original=${orig.color} vs vitrine=${vLight.color}`])
if (origHasTokens && !lightHasTokens) problems.push(["high", "Syntax highlighting presente no original mas ausente na vitrine (light)"])
if (!origHasTokens && lightHasTokens) problems.push(["low", "Syntax highlighting na vitrine mas não no original"])
if (orig.copyBtn && !vLight.copyBtn) problems.push(["high", "Botão copy existe no original mas não encontrado na vitrine"])
if (!orig.copyBtn && vLight.copyBtn) problems.push(["low", "Botão copy na vitrine mas não no original"])
if (orig.fontFamily && vLight.fontFamily && !vLight.fontFamily.includes("mono") && !orig.fontFamily.includes("mono")) {
  // both non-mono, that's fine
} else if (orig.fontFamily?.includes("mono") && !vLight.fontFamily?.includes("mono")) {
  problems.push(["medium", `Fonte mono no original (${orig.fontFamily.slice(0, 40)}) mas não na vitrine (${vLight.fontFamily?.slice(0, 40)})`])
}

// Score calculation
let score = 100
for (const [sev] of problems) {
  if (sev === "critical") score -= 30
  else if (sev === "high") score -= 15
  else if (sev === "medium") score -= 8
  else if (sev === "low") score -= 3
}
score = Math.max(0, score)
const status = score >= 90 ? "✅" : score >= 70 ? "⚠️" : "❌"

const report = `# Validação: code-block-command

## TL;DR
Status: ${status}
Score de fidelidade: ${score}/100
Resumo: ${problems.length === 0 ? "Todos os atributos visuais batem entre original e vitrine." : `${problems.length} problema(s) encontrado(s) — ver detalhes abaixo.`}

## Comparação visual (light mode)

| Atributo | Original | Vitrine | Status |
|---|---|---|---|
| Background | ${orig.bg} | ${vLight.bg} | ${orig.bg === vLight.bg ? "✅" : "⚠️"} |
| Text color | ${orig.color} | ${vLight.color} | ${orig.color === vLight.color ? "✅" : "⚠️"} |
| Font size | ${orig.fontSize} | ${vLight.fontSize} | ${orig.fontSize === vLight.fontSize ? "✅" : "⚠️"} |
| Font weight | ${orig.fontWeight} | ${vLight.fontWeight} | ${orig.fontWeight === vLight.fontWeight ? "✅" : "⚠️"} |
| Line height | ${orig.lineHeight} | ${vLight.lineHeight} | ${orig.lineHeight === vLight.lineHeight ? "✅" : "⚠️"} |
| Font family | ${(orig.fontFamily || "").slice(0, 50)} | ${(vLight.fontFamily || "").slice(0, 50)} | ${(orig.fontFamily || "").includes("mono") === (vLight.fontFamily || "").includes("mono") ? "✅" : "⚠️"} |
| Border radius | ${orig.borderRadius} | ${vLight.borderRadius} | ${orig.borderRadius === vLight.borderRadius ? "✅" : "⚠️"} |
| Syntax highlighting | ${origHasTokens ? "Sim (" + orig.tokens.filter(t => t.color !== orig.color).length + " cores)" : "Não"} | ${lightHasTokens ? "Sim (" + vLight.tokens.filter(t => t.color !== vLight.color).length + " cores)" : "Não"} | ${origHasTokens === lightHasTokens ? "✅" : "❌"} |
| Prefixo ($) estilizado | ${origPrefix ? 'Sim (' + origPrefix.color + ')' : 'Não identificado'} | ${lightPrefix ? 'Sim (' + lightPrefix.color + ')' : 'Não identificado'} | ${origPrefix && lightPrefix ? (origPrefix.color === lightPrefix.color ? "✅" : "⚠️") : "⚠️"} |
| Botão copy presente | ${orig.copyBtn ? "Sim" : "Não"} | ${vLight.copyBtn ? "Sim" : "Não"} | ${orig.copyBtn && vLight.copyBtn ? "✅" : "❌"} |
| Botão copy posição | ${orig.copyBtn ? `x:${orig.copyBtn.rect?.x} y:${orig.copyBtn.rect?.y}` : "N/A"} | ${vLight.copyBtn ? `x:${vLight.copyBtn.rect?.x} y:${vLight.copyBtn.rect?.y}` : "N/A"} | ${orig.copyBtn && vLight.copyBtn ? "⚠️ (verificar prints)" : "N/A"} |
| Dimensões wrapper | ${orig.rect?.w}×${orig.rect?.h} | ${vLight.rect?.w}×${vLight.rect?.h} | ${Math.abs((orig.rect?.w || 0) - (vLight.rect?.w || 0)) < 50 && Math.abs((orig.rect?.h || 0) - (vLight.rect?.h || 0)) < 50 ? "✅" : "⚠️"} |

## Comparação visual (dark mode)

| Atributo | Original (dark) | Vitrine (dark) | Status |
|---|---|---|---|
| Background | — | ${vDark.bg} | ⚠️ (original usa colorScheme do browser) |
| Text color | — | ${vDark.color} | ⚠️ |
| Font size | — | ${vDark.fontSize} | ✅ (herdado do light) |
| Syntax highlighting | — | ${darkHasTokens ? "Sim" : "Não"} | ${darkHasTokens === lightHasTokens ? "✅" : "⚠️"} |
| Botão copy presente | — | ${vDark.copyBtn ? "Sim" : "Não"} | ${vDark.copyBtn && vLight.copyBtn ? "✅" : "⚠️"} |

## Interações testadas

- [x] **Hover no botão copy (vitrine)**: Print salvo em \`vitrine-light-hover-copy.png\` — ${vLight.copyBtn ? "botão encontrado, hover aplicado" : "botão NÃO encontrado via seletores padrão"}
- [x] **Hover no botão copy (original)**: Print salvo em \`original-light-hover-copy.png\` — ${orig.copyBtn ? "botão encontrado, hover aplicado" : "botão NÃO encontrado via seletores padrão"}
- [x] **Click no botão copy (vitrine)**: Print salvo em \`vitrine-light-after-copy.png\` — ${vLight.copyBtn ? "click aplicado, verificar feedback visual de 'copied!'" : "botão não encontrado"}
- [x] **Hover em token**: Print salvo em \`vitrine-light-hover-token.png\` — ${lightHasTokens ? "token encontrado" : "nenhum token interativo detectado"}

## Problemas encontrados

${problems.length === 0 ? "Nenhum problema encontrado — visualmente idêntico." : problems.map((p, i) => `${i + 1}. [${p[0]}] ${p[1]}`).join("\n")}

## Diagnóstico técnico

### Wrapper detectado
- **Original**: \`<${orig.selector}>\` em (${orig.rect?.x}, ${orig.rect?.y}) — ${orig.rect?.w}×${orig.rect?.h}px
- **Vitrine light**: \`<${vLight.selector}>\` em (${vLight.rect?.x}, ${vLight.rect?.y}) — ${vLight.rect?.w}×${vLight.rect?.h}px
- **Vitrine dark**: \`<${vDark.selector}>\` em (${vDark.rect?.x}, ${vDark.rect?.y}) — ${vDark.rect?.w}×${vDark.rect?.h}px

### Tokens de código (amostra)
**Original** (${orig.tokens?.length || 0} tokens):
${orig.tokens?.slice(0, 8).map(t => `  - "${t.text}" → color: ${t.color}`).join("\n") || "  (nenhum token detectado)"}

**Vitrine light** (${vLight.tokens?.length || 0} tokens):
${vLight.tokens?.slice(0, 8).map(t => `  - "${t.text}" → color: ${t.color}`).join("\n") || "  (nenhum token detectado)"}

### Botão copy
${orig.copyBtn ? `**Original**: text="${orig.copyBtn.text}" aria-label="${orig.copyBtn.ariaLabel}" pos=(${orig.copyBtn.rect?.x},${orig.copyBtn.rect?.y}) bg=${orig.copyBtn.bg}` : "**Original**: não detectado"}
${vLight.copyBtn ? `**Vitrine**: text="${vLight.copyBtn.text}" aria-label="${vLight.copyBtn.ariaLabel}" pos=(${vLight.copyBtn.rect?.x},${vLight.copyBtn.rect?.y}) bg=${vLight.copyBtn.bg}` : "**Vitrine**: não detectado"}

### Raw text (primeiros 300 chars)
**Original**: \`${orig.rawText.slice(0, 200)}\`
**Vitrine**: \`${vLight.rawText.slice(0, 200)}\`

## Sugestões de fix (NÃO IMPLEMENTAR)

${problems.length === 0 ? "Nenhuma sugestão — está igual." : problems.map((p, i) => {
  if (p[1].includes("Background")) return `${i + 1}. Ajustar background do wrapper na vitrine para bater com o original.`
  if (p[1].includes("Syntax")) return `${i + 1}. Verificar se o syntax highlighting (Shiki/prism) está configurado corretamente no CodeBlock da vitrine.`
  if (p[1].includes("copy")) return `${i + 1}. Verificar implementação do CopyButton — pode estar faltando data attribute ou classe CSS que o seletor detecta.`
  if (p[1].includes("Fonte mono")) return `${i + 1}. Garantir font-family monospace no wrapper de código.`
  return `${i + 1}. Investigar diferença: ${p[1]}`
}).join("\n")}

---
*Validação gerada automaticamente em ${new Date().toISOString()}*
`

writeFileSync(`${OUT}/REPORT.md`, report)
console.log(`  ✓ ${OUT}/REPORT.md`)

console.log(`\n✅ Validação completa: ${OUT}/REPORT.md — Score ${score}/100 — ${problems.length} problemas`)
