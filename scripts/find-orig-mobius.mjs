// scripts/find-orig-mobius.mjs
// Encontra o SVG real do mobius-loop-icon na página original
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/mobius-loop-icon", { waitUntil: "networkidle", timeout: 45000 })
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('svg'))
  return all.map((s, idx) => {
    const r = s.getBoundingClientRect()
    const paths = Array.from(s.querySelectorAll('path'))
    return {
      idx,
      viewBox: s.getAttribute('viewBox'),
      width: s.getAttribute('width'),
      height: s.getAttribute('height'),
      rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
      class: s.getAttribute('class'),
      dataSlot: s.getAttribute('data-slot'),
      ariaLabel: s.getAttribute('aria-label'),
      pathCount: paths.length,
      path0: paths[0] && {
        d: paths[0].getAttribute('d'),
        dLen: (paths[0].getAttribute('d') || '').length,
        stroke: paths[0].getAttribute('stroke'),
        style: paths[0].getAttribute('style'),
      },
    }
  })
})

writeFileSync("shots/mobius-loop-icon/orig-svgs.json", JSON.stringify(info, null, 2))
console.log("Total SVGs:", info.length)
console.log("\nSVGs com rect > 24x24:")
for (const s of info) {
  if (s.rect.w >= 24 && s.rect.h >= 24) {
    console.log(`  [${s.idx}] ${s.rect.w}x${s.rect.h} @${s.rect.x},${s.rect.y} viewBox=${s.viewBox} class=${(s.class || '').slice(0, 80)}`)
    console.log(`       path0 dLen=${s.path0?.dLen} d=${(s.path0?.d || '').slice(0, 120)}`)
  }
}
await browser.close()
