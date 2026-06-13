// scripts/val-mobius-loop-icon.mjs
// Validação visual Playwright do componente mobius-loop-icon.
// Compara chanhdai.com vs vitrine, captura frames pra detectar morphing SVG.
import { chromium } from "playwright"
import { mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { outPath } from "./_shots.mjs"

const SHOTS = outPath("mobius-loop-icon")
mkdirSync(SHOTS, { recursive: true })

const URL_ORIGINAL = "https://chanhdai.com/components/mobius-loop-icon"
const URL_VITRINE = "http://localhost:5173/components/mobius-loop-icon"

function md5(buf) {
  return createHash("md5").update(buf).digest("hex")
}

async function loadTheme(page, theme) {
  await page.addInitScript((t) => {
    try { localStorage.setItem("vitrine-theme", t) } catch {}
  }, theme)
}

async function gotoSettle(page, url, waitMs = 2500) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    console.warn(`warn goto: ${e.message}`)
  }
  await page.waitForTimeout(waitMs)
}

async function takeShots(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  // 1) ORIGINAL LIGHT
  const p1 = await ctx.newPage()
  await p1.addInitScript(() => {
    // chanhdai: por padrão é light. Limpar storage pra forçar.
    try { localStorage.clear() } catch {}
  })
  await gotoSettle(p1, URL_ORIGINAL, 3500)
  await p1.screenshot({ path: `${SHOTS}/original-light.png`, fullPage: false })
  console.log("✓ original-light.png")
  await p1.close()

  // 2) ORIGINAL DARK
  const p2 = await ctx.newPage()
  await p2.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); localStorage.setItem("chanhdai-theme", "dark") } catch {}
  })
  await gotoSettle(p2, URL_ORIGINAL, 3500)
  await p2.screenshot({ path: `${SHOTS}/original-dark.png`, fullPage: false })
  console.log("✓ original-dark.png")
  await p2.close()

  // 3) VITRINE LIGHT
  const p3 = await ctx.newPage()
  await loadTheme(p3, "light")
  await gotoSettle(p3, URL_VITRINE, 2500)
  await p3.screenshot({ path: `${SHOTS}/vitrine-light.png`, fullPage: false })
  console.log("✓ vitrine-light.png")
  await p3.close()

  // 4) VITRINE DARK
  const p4 = await ctx.newPage()
  await loadTheme(p4, "dark")
  await gotoSettle(p4, URL_VITRINE, 2500)
  await p4.screenshot({ path: `${SHOTS}/vitrine-dark.png`, fullPage: false })
  console.log("✓ vitrine-dark.png")
  await p4.close()

  await ctx.close()
}

async function inspectDOM(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  async function inspectOne(url, label, theme, useLocalStorage) {
    const page = await ctx.newPage()
    if (theme) {
      await page.addInitScript((t) => {
        try { localStorage.setItem("vitrine-theme", t) } catch {}
      }, theme)
    }
    await gotoSettle(page, url, 3000)

    const info = await page.evaluate(() => {
      // Heurística: procurar wrapper [data-slot=mobius-loop-icon] OU o primeiro <svg>
      const wrap = document.querySelector('[data-slot="mobius-loop-icon"]') ||
                   document.querySelector('svg[class*="mobius"]') ||
                   document.querySelector('main svg, [class*="preview"] svg, [class*="demo"] svg')

      // Listar TODOS os SVGs visíveis com tamanho razoável (>= 16x16) e path[animate]
      const svgs = Array.from(document.querySelectorAll('svg')).filter(s => {
        const r = s.getBoundingClientRect()
        return r.width >= 16 && r.height >= 16
      })

      const svgCandidates = svgs.slice(0, 6).map(s => {
        const r = s.getBoundingClientRect()
        const paths = Array.from(s.querySelectorAll('path')).map(p => ({
          d: p.getAttribute('d'),
          stroke: p.getAttribute('stroke'),
          animateAttr: p.getAttribute('animate'),
          // Não conseguimos ler valores computados de "d" sem o .getTotalLength, mas o attr em si é o que importa
        }))
        return {
          viewBox: s.getAttribute('viewBox'),
          width: s.getAttribute('width'),
          height: s.getAttribute('height'),
          rect: { w: Math.round(r.width), h: Math.round(r.height) },
          dataSlot: s.getAttribute('data-slot'),
          class: s.getAttribute('class'),
          paths,
        }
      })

      return {
        url: location.href,
        docBg: getComputedStyle(document.documentElement).backgroundColor,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        htmlClass: document.documentElement.className,
        wrap: wrap && {
          rect: (() => { const r = wrap.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })(),
          tag: wrap.tagName,
          dataSlot: wrap.getAttribute('data-slot'),
        },
        svgs: svgCandidates,
        // CSS animations/keyframes no documento
        styleSheets: (() => {
          const out = []
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                if (rule.type === CSSRule.KEYFRAMES_RULE) {
                  out.push({ name: rule.name, cssText: rule.cssText.slice(0, 200) })
                }
              }
            } catch {}
          }
          return out
        })(),
      }
    })

    writeFileSync(`${SHOTS}/inspect-${label}.json`, JSON.stringify(info, null, 2))
    console.log(`✓ inspect-${label}.json`)
    await page.close()
    return info
  }

  await inspectOne(URL_ORIGINAL, "original", null, false)
  await inspectOne(URL_VITRINE, "vitrine-light", "light", true)
  await inspectOne(URL_VITRINE, "vitrine-dark", "dark", true)

  await ctx.close()
}

async function captureFrames(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  // 8 frames, 200ms entre cada = captura ~1.6s do ciclo (que dura 3s)
  // Pegaremos o início do ciclo pra ter 3 keyframes visíveis em momentos diferentes
  async function captureAt(url, label, theme, nFrames = 8, intervalMs = 200) {
    const page = await ctx.newPage()
    if (theme) {
      await page.addInitScript((t) => {
        try { localStorage.setItem("vitrine-theme", t) } catch {}
      }, theme)
    }
    await gotoSettle(page, url, 3000)

    // Esconder cursor pra garantir que não haja hover
    await page.mouse.move(0, 0)
    await page.waitForTimeout(300)

    const frames = []
    for (let i = 1; i <= nFrames; i++) {
      const buf = await page.screenshot({ fullPage: false, clip: { x: 0, y: 0, width: 1440, height: 900 } })
      const path = `${SHOTS}/${label}-frame-${i}.png`
      writeFileSync(path, buf)
      const hash = md5(buf)

      // Tentar extrair o path d atual (caso o componente use SVG morphing)
      const dInfo = await page.evaluate(() => {
        // Tentar o data-slot mobius-loop-icon primeiro
        const slot = document.querySelector('[data-slot="mobius-loop-icon"]')
        const svg = slot && slot.tagName === 'svg' ? slot : slot?.querySelector('svg') || document.querySelector('svg')
        if (!svg) return { found: false }
        const path = svg.querySelector('path')
        if (!path) return { found: false, svg: true }
        return {
          found: true,
          // O attribute `d` no DOM em geral é o valor atual da animação quando há requestAnimationFrame rodando
          attrD: path.getAttribute('d'),
          computedD: path.getAttribute('d'), // SVG <path> não tem "computed style" pro d
          stroke: path.getAttribute('stroke') || getComputedStyle(path).stroke,
          transform: path.getAttribute('transform'),
          pathLength: typeof path.getTotalLength === 'function' ? Math.round(path.getTotalLength()) : null,
        }
      })

      frames.push({ i, hash, d: dInfo.attrD, stroke: dInfo.stroke, pathLength: dInfo.pathLength, dInfo })
      console.log(`  ${label} frame ${i}: hash=${hash.slice(0, 10)}... dLen=${dInfo.attrD?.length || 0} pathLen=${dInfo.pathLength}`)

      if (i < nFrames) await page.waitForTimeout(intervalMs)
    }

    writeFileSync(`${SHOTS}/frames-${label}.json`, JSON.stringify(frames, null, 2))
    console.log(`✓ frames-${label}.json (${nFrames} frames)`)
    await page.close()
    return frames
  }

  // Vitrine light + dark
  const vitrineLightFrames = await captureAt(URL_VITRINE, "vitrine-light", "light", 8, 200)
  const vitrineDarkFrames = await captureAt(URL_VITRINE, "vitrine-dark", "dark", 8, 200)

  // Original (sem setar vitrine-theme)
  const originalLightFrames = await captureAt(URL_ORIGINAL, "original-light", null, 8, 200)

  await ctx.close()

  return { vitrineLightFrames, vitrineDarkFrames, originalLightFrames }
}

async function diffAnalysis(originalLightFrames, vitrineLightFrames, vitrineDarkFrames) {
  const summary = {
    originalLight: { uniqueHashes: new Set(), uniqueDs: new Set(), morphs: false, frameCount: originalLightFrames.length },
    vitrineLight: { uniqueHashes: new Set(), uniqueDs: new Set(), morphs: false, frameCount: vitrineLightFrames.length },
    vitrineDark: { uniqueHashes: new Set(), uniqueDs: new Set(), morphs: false, frameCount: vitrineDarkFrames.length },
  }

  for (const f of originalLightFrames) {
    summary.originalLight.uniqueHashes.add(f.hash)
    if (f.d) summary.originalLight.uniqueDs.add(f.d)
  }
  for (const f of vitrineLightFrames) {
    summary.vitrineLight.uniqueHashes.add(f.hash)
    if (f.d) summary.vitrineLight.uniqueDs.add(f.d)
  }
  for (const f of vitrineDarkFrames) {
    summary.vitrineDark.uniqueHashes.add(f.hash)
    if (f.d) summary.vitrineDark.uniqueDs.add(f.d)
  }

  summary.originalLight.morphs = summary.originalLight.uniqueDs.size > 1 || summary.originalLight.uniqueHashes.size > 1
  summary.vitrineLight.morphs = summary.vitrineLight.uniqueDs.size > 1 || summary.vitrineLight.uniqueHashes.size > 1
  summary.vitrineDark.morphs = summary.vitrineDark.uniqueDs.size > 1 || summary.vitrineDark.uniqueHashes.size > 1

  return {
    originalLight: {
      uniqueHashCount: summary.originalLight.uniqueHashes.size,
      uniqueDCount: summary.originalLight.uniqueDs.size,
      uniqueDs: [...summary.originalLight.uniqueDs],
      morphs: summary.originalLight.morphs,
      frameCount: summary.originalLight.frameCount,
    },
    vitrineLight: {
      uniqueHashCount: summary.vitrineLight.uniqueHashes.size,
      uniqueDCount: summary.vitrineLight.uniqueDs.size,
      uniqueDs: [...summary.vitrineLight.uniqueDs],
      morphs: summary.vitrineLight.morphs,
      frameCount: summary.vitrineLight.frameCount,
    },
    vitrineDark: {
      uniqueHashCount: summary.vitrineDark.uniqueHashes.size,
      uniqueDCount: summary.vitrineDark.uniqueDs.size,
      uniqueDs: [...summary.vitrineDark.uniqueDs],
      morphs: summary.vitrineDark.morphs,
      frameCount: summary.vitrineDark.frameCount,
    },
  }
}

async function captureHover(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    try { localStorage.setItem("vitrine-theme", "light") } catch {}
  })
  await gotoSettle(page, URL_VITRINE, 2500)

  // Tenta achar o slot
  const slot = await page.$('[data-slot="mobius-loop-icon"]')
  if (slot) {
    const box = await slot.boundingBox()
    if (box) {
      await page.screenshot({ path: `${SHOTS}/vitrine-hover-before.png`, fullPage: false })
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(800)
      await page.screenshot({ path: `${SHOTS}/vitrine-hover-after.png`, fullPage: false })
      console.log("✓ hover before/after captured")
    } else {
      console.log("slot tem rect zero, pulando hover")
    }
  } else {
    console.log("sem [data-slot=mobius-loop-icon] visível direto, procurando wrapper")
    // Tenta primeiro svg da página
    const firstSvg = await page.$('main svg, [class*="preview"] svg, [class*="showcase"] svg')
    if (firstSvg) {
      const box = await firstSvg.boundingBox()
      if (box) {
        await page.screenshot({ path: `${SHOTS}/vitrine-hover-before.png`, fullPage: false })
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.waitForTimeout(800)
        await page.screenshot({ path: `${SHOTS}/vitrine-hover-after.png`, fullPage: false })
        console.log("✓ hover before/after captured (fallback)")
      }
    }
  }
  await page.close()
  await ctx.close()
}

const browser = await chromium.launch()

console.log("\n=== STEP 1: prints ===")
await takeShots(browser)

console.log("\n=== STEP 2: inspect DOM ===")
await inspectDOM(browser)

console.log("\n=== STEP 3: capture frames (morphing) ===")
const { originalLightFrames, vitrineLightFrames, vitrineDarkFrames } = await captureFrames(browser)

console.log("\n=== STEP 4: hover ===")
await captureHover(browser)

console.log("\n=== STEP 5: diff analysis ===")
const analysis = await diffAnalysis(originalLightFrames, vitrineLightFrames, vitrineDarkFrames)
writeFileSync(`${SHOTS}/diff-analysis.json`, JSON.stringify(analysis, null, 2))
console.log(JSON.stringify(analysis, null, 2))

await browser.close()
console.log("\n✓ done")
