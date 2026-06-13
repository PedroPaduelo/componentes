// scripts/val-shimmering-text.mjs
// Validação visual Playwright: shimmering-text
// - 4 prints (original + vitrine, light + dark)
// - 3 JSONs de inspeção
// - 8 frames sequenciais para detectar animação shimmer
// - md5sum dos frames para verificar se há mudança
import { chromium } from "playwright"
import { mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { outPath } from "./_shots.mjs"

const VIEWPORT = { width: 1440, height: 900 }
const URL_ORIGINAL = "https://chanhdai.com/components/shimmering-text"
const URL_VITRINE = "http://localhost:5173/components/shimmering-text"

const md5 = (file) =>
  createHash("md5").update(readFileSync(file)).digest("hex")

async function shoot(page, file) {
  await page.screenshot({ path: file, fullPage: false })
  return file
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VIEWPORT })

// ============================================================
// 1) PRINTS — 4
// ============================================================
console.log("=== 1) PRINTS (4) ===")

// Original LIGHT
{
  const page = await ctx.newPage()
  try {
    await page.goto(URL_ORIGINAL, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) { console.warn("warn original-light:", e.message) }
  await page.waitForTimeout(4000)
  await shoot(page, outPath("shimmering-text/original-light.png"))
  console.log("✓ original-light.png")
  await page.close()
}

// Vitrine LIGHT
{
  const page = await ctx.newPage()
  try {
    await page.goto(URL_VITRINE, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) { console.warn("warn vitrine-light:", e.message) }
  await page.waitForTimeout(2000)
  await shoot(page, outPath("shimmering-text/vitrine-light.png"))
  console.log("✓ vitrine-light.png")
  await page.close()
}

// Vitrine DARK
{
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    localStorage.setItem("vitrine-theme", "dark")
  })
  try {
    await page.goto(URL_VITRINE, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) { console.warn("warn vitrine-dark:", e.message) }
  await page.waitForTimeout(2000)
  await shoot(page, outPath("shimmering-text/vitrine-dark.png"))
  console.log("✓ vitrine-dark.png")
  await page.close()
}

// Original DARK
{
  const page = await ctx.newPage()
  // chanhdai usa prefers-color-scheme + theme class
  await page.emulateMedia({ colorScheme: "dark" })
  try {
    await page.goto(URL_ORIGINAL, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) { console.warn("warn original-dark:", e.message) }
  await page.waitForTimeout(4000)
  await shoot(page, outPath("shimmering-text/original-dark.png"))
  console.log("✓ original-dark.png")
  await page.close()
}

// ============================================================
// 2) INSPEÇÃO DOM — 3 JSONs
// ============================================================
console.log("\n=== 2) INSPEÇÃO DOM (3 JSONs) ===")

async function inspect(url, label, isOriginal = false, forceDark = false) {
  const page = await ctx.newPage()
  if (forceDark) {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  } else if (isOriginal) {
    await page.emulateMedia({ colorScheme: forceDark ? "dark" : "light" })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) { console.warn(`warn inspect ${label}:`, e.message) }
  await page.waitForTimeout(2500)

  const info = await page.evaluate(() => {
    // Tenta achar wrapper do shimmering-text
    const candidates = [
      "[data-slot=shimmering-text]",
      "[data-slot='shimmering-text']",
      "[data-slot='shimmeringText']",
      "[data-slot='shimmering']",
    ]
    let wrap = null
    for (const sel of candidates) {
      wrap = document.querySelector(sel)
      if (wrap) break
    }
    // Fallback: procurar texto que pareça shimmer
    if (!wrap) {
      // pegar todos os h1/h2/h3 com shimmer
      const all = Array.from(document.querySelectorAll("h1, h2, h3, p, span, div"))
      wrap = all.find((el) => {
        const cs = getComputedStyle(el)
        const text = (el.textContent || "").trim()
        return (
          text.length > 2 &&
          text.length < 200 &&
          (cs.backgroundImage.includes("gradient") ||
            cs.backgroundClip === "text" ||
            cs.webkitBackgroundClip === "text" ||
            cs.animationName.includes("shimmer") ||
            el.querySelector?.("[style*='shimmer']"))
        )
      })
    }

    if (!wrap) return { found: false }

    const rect = wrap.getBoundingClientRect()
    const cs = getComputedStyle(wrap)
    const beforeCs = wrap ? getComputedStyle(wrap, "::before") : null
    const afterCs = wrap ? getComputedStyle(wrap, "::after") : null

    // pegar filhos diretos
    const children = Array.from(wrap.children).slice(0, 5).map((c) => {
      const r = c.getBoundingClientRect()
      const ccs = getComputedStyle(c)
      return {
        tag: c.tagName.toLowerCase(),
        rect: { w: Math.round(r.width), h: Math.round(r.height) },
        text: (c.textContent || "").trim().slice(0, 100),
        bg: ccs.backgroundColor,
        color: ccs.color,
        bgImage: ccs.backgroundImage.slice(0, 200),
        bgClip: ccs.backgroundClip || ccs.webkitBackgroundClip,
        animation: ccs.animation,
        animationName: ccs.animationName,
        animationDuration: ccs.animationDuration,
        animationIteration: ccs.animationIterationCount,
        dataAttrs: Object.fromEntries(
          Array.from(c.attributes)
            .filter((a) => a.name.startsWith("data-"))
            .map((a) => [a.name, a.value])
        ),
      }
    })

    return {
      found: true,
      rect: { w: Math.round(rect.width), h: Math.round(rect.height), top: Math.round(rect.top), left: Math.round(rect.left) },
      tag: wrap.tagName.toLowerCase(),
      className: wrap.className,
      dataAttrs: Object.fromEntries(
        Array.from(wrap.attributes)
          .filter((a) => a.name.startsWith("data-"))
          .map((a) => [a.name, a.value])
      ),
      bg: cs.backgroundColor,
      color: cs.color,
      bgImage: cs.backgroundImage.slice(0, 200),
      bgClip: cs.backgroundClip || cs.webkitBackgroundClip,
      animation: cs.animation,
      animationName: cs.animationName,
      animationDuration: cs.animationDuration,
      animationIteration: cs.animationIterationCount,
      textContent: (wrap.textContent || "").trim().slice(0, 200),
      // pseudo-elementos
      beforeContent: beforeCs?.content,
      beforeBg: beforeCs?.backgroundImage?.slice(0, 200),
      beforeAnimation: beforeCs?.animation,
      beforeAnimationName: beforeCs?.animationName,
      beforeAnimationDuration: beforeCs?.animationDuration,
      beforeAnimationIteration: beforeCs?.animationIterationCount,
      afterContent: afterCs?.content,
      afterBg: afterCs?.backgroundImage?.slice(0, 200),
      afterAnimation: afterCs?.animation,
      afterAnimationName: afterCs?.animationName,
      children,
    }
  })

  // Procurar keyframes 'shimmer' no CSS
  const cssInfo = await page.evaluate(() => {
    const found = { shimmer: false, keyframes: [] }
    for (const sheet of Array.from(document.styleSheets)) {
      let rules
      try { rules = sheet.cssRules } catch (e) { continue }
      if (!rules) continue
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSKeyframesRule) {
          if (rule.name.toLowerCase().includes("shimmer")) {
            found.shimmer = true
            found.keyframes.push({
              name: rule.name,
              cssText: rule.cssText.slice(0, 500),
            })
          }
        }
      }
    }
    return found
  })

  const result = { url, label, dom: info, css: cssInfo }
  const file = outPath(`shimmering-text/inspect-${label}.json`)
  writeFileSync(file, JSON.stringify(result, null, 2))
  console.log(`✓ ${file}`)
  await page.close()
  return result
}

const inspectOriginal = await inspect(URL_ORIGINAL, "original", true, false)
const inspectVitrineLight = await inspect(URL_VITRINE, "vitrine-light", false, false)
const inspectVitrineDark = await inspect(URL_VITRINE, "vitrine-dark", false, true)

// ============================================================
// 3) FRAMES DE ANIMAÇÃO — 8 frames com 100ms entre cada
// ============================================================
console.log("\n=== 3) FRAMES DE ANIMAÇÃO (8 frames, 100ms entre cada) ===")

{
  const page = await ctx.newPage()
  try {
    await page.goto(URL_VITRINE, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) { console.warn("warn frames:", e.message) }
  await page.waitForTimeout(2000)

  // Garantir que o mouse está parado (não hover) — animações shimmer são contínuas, hover pode mudar
  await page.mouse.move(0, 0)
  await page.waitForTimeout(500)

  const frameFiles = []
  for (let i = 1; i <= 8; i++) {
    const file = outPath(`shimmering-text/vitrine-light-frame-${i}.png`)
    // crop pequeno em volta do componente para isolar movimento
    await page.screenshot({ path: file, fullPage: false, clip: { x: 0, y: 0, width: 1440, height: 900 } })
    frameFiles.push(file)
    if (i < 8) await page.waitForTimeout(100)
  }
  console.log("✓ 8 frames capturados")

  // md5sum de cada frame
  const hashes = frameFiles.map((f) => ({ file: f.split("/").pop(), md5: md5(f) }))
  const uniqueHashes = new Set(hashes.map((h) => h.md5))
  console.log("\nMD5 dos frames:")
  hashes.forEach((h) => console.log(`  ${h.file}: ${h.md5}`))
  console.log(`\nHashes únicos: ${uniqueHashes.size} / 8`)

  writeFileSync(outPath("shimmering-text/frame-hashes.json"), JSON.stringify({ hashes, uniqueCount: uniqueHashes.size }, null, 2))
  await page.close()
}

// ============================================================
// 4) Capturar frames também do ORIGINAL (mesma técnica)
// ============================================================
console.log("\n=== 4) FRAMES DO ORIGINAL (8 frames) ===")
{
  const page = await ctx.newPage()
  try {
    await page.goto(URL_ORIGINAL, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) { console.warn("warn orig frames:", e.message) }
  await page.waitForTimeout(4000)
  await page.mouse.move(0, 0)
  await page.waitForTimeout(500)

  for (let i = 1; i <= 8; i++) {
    const file = outPath(`shimmering-text/original-light-frame-${i}.png`)
    await page.screenshot({ path: file, fullPage: false, clip: { x: 0, y: 0, width: 1440, height: 900 } })
    if (i < 8) await page.waitForTimeout(100)
  }
  console.log("✓ 8 frames do original capturados")
  await page.close()
}

await browser.close()
console.log("\n=== DONE ===")
