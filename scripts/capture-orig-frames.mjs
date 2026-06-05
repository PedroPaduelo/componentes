// scripts/capture-orig-frames.mjs
// Captura frames do SVG real do mobius-loop-icon no original (idx 15: 64x64 @688,465)
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "node:fs"
import { createHash } from "node:crypto"

mkdirSync("shots/mobius-loop-icon", { recursive: true })

function md5(buf) { return createHash("md5").update(buf).digest("hex") }

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/mobius-loop-icon", { waitUntil: "networkidle", timeout: 45000 })
await page.waitForTimeout(3000)

// Encontrar o SVG: viewBox 0 0 24 24 com class size-16 e mover o mouse para fora
await page.mouse.move(0, 0)
await page.waitForTimeout(300)

const frames = []
for (let i = 1; i <= 8; i++) {
  // Crop no retângulo do SVG idx 15 (688,465 64x64) + um pouco de padding
  const clip = { x: 670, y: 445, width: 100, height: 100 }
  const buf = await page.screenshot({ fullPage: false, clip })
  const path = `shots/mobius-loop-icon/original-mobius-frame-${i}.png`
  writeFileSync(path, buf)
  const hash = md5(buf)

  // Capturar d atual do path do SVG idx 15
  const dInfo = await page.evaluate(() => {
    // Estratégia: pegar SVG com class="size-16 text-foreground" e viewBox 0 0 24 24
    const candidates = Array.from(document.querySelectorAll('svg'))
    const svg = candidates.find(s => s.getAttribute('viewBox') === '0 0 24 24' && (s.getAttribute('class') || '').includes('size-16'))
    if (!svg) return { found: false, why: 'svg not found' }
    const path = svg.querySelector('path')
    if (!path) return { found: false, why: 'path not found' }
    return {
      found: true,
      attrD: path.getAttribute('d'),
      stroke: path.getAttribute('stroke') || getComputedStyle(path).stroke,
      pathLength: typeof path.getTotalLength === 'function' ? Math.round(path.getTotalLength()) : null,
      svgClass: svg.getAttribute('class'),
      svgViewBox: svg.getAttribute('viewBox'),
      // Tem data-* attrs da motion?
      styleAttr: path.getAttribute('style'),
      // Tem parent com motion attribute?
      parentStyle: path.parentElement?.getAttribute('style')?.slice(0, 100),
    }
  })

  frames.push({ i, hash, ...dInfo })
  console.log(`  original-mobius frame ${i}: hash=${hash.slice(0, 10)}... dLen=${dInfo.attrD?.length || 0} pathLen=${dInfo.pathLength}`)
  if (i < 8) await page.waitForTimeout(200)
}

writeFileSync("shots/mobius-loop-icon/frames-original-mobius.json", JSON.stringify(frames, null, 2))
console.log(`✓ frames-original-mobius.json`)

// Resumo
const uniqueHashes = new Set(frames.map(f => f.hash))
const uniqueDs = new Set(frames.map(f => f.attrD).filter(Boolean))
console.log(`\nResumo:`)
console.log(`  unique hashes: ${uniqueHashes.size}/8`)
console.log(`  unique d values: ${uniqueDs.size}/8`)
console.log(`  MORPHING: ${uniqueDs.size > 1 ? 'SIM ✅' : 'NÃO ❌'}`)

await browser.close()
