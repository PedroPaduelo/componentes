// scripts/inspect-fluid-deep.mjs
// Deep inspection: find the actual fluid gradient demo element
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const OUT = "shots/fluid-gradient-text"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// ── ORIGINAL ──
const orig = await ctx.newPage()
await orig.goto("https://chanhdai.com/components/fluid-gradient-text", { waitUntil: "networkidle", timeout: 30000 })
await orig.waitForTimeout(3000)

const origInfo = await orig.evaluate(() => {
  // Find ALL elements with background-image containing gradient
  const allEls = Array.from(document.querySelectorAll("*"))
  const gradientEls = allEls
    .map(el => {
      const s = getComputedStyle(el)
      const bg = s.backgroundImage
      if (bg && bg !== "none" && (bg.includes("gradient"))) {
        return {
          tag: el.tagName,
          className: typeof el.className === "string" ? el.className : String(el.className),
          text: el.textContent?.trim().slice(0, 100),
          backgroundImage: bg,
          backgroundClip: s.webkitBackgroundClip,
          animation: s.animation,
          animationName: s.animationName,
          animationDuration: s.animationDuration,
          animationTimingFunction: s.animationTimingFunction,
          backgroundSize: s.backgroundSize,
          backgroundPosition: s.backgroundPosition,
          background: s.background,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          fontFamily: s.fontFamily?.slice(0, 60),
          color: s.color,
          // data attrs
          dataSlot: el.dataset.slot,
          dataAttr: Object.fromEntries(
            Object.entries(el.dataset).slice(0, 5)
          ),
          rect: (() => {
            const r = el.getBoundingClientRect()
            return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
          })(),
        }
      }
      return null
    })
    .filter(Boolean)
    .slice(0, 20)

  // Find all keyframes
  let keyframesFound = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule.type === CSSRule.KEYFRAMES_RULE) {
          keyframesFound.push({
            name: rule.name,
            cssText: rule.cssText.slice(0, 500),
          })
        }
        // @keyframes inside @supports etc
        if (rule.cssRules) {
          for (const sub of Array.from(rule.cssRules)) {
            if (sub.type === CSSRule.KEYFRAMES_RULE) {
              keyframesFound.push({
                name: sub.name,
                cssText: sub.cssText.slice(0, 500),
              })
            }
          }
        }
      }
    } catch (e) { /* CORS */ }
  }

  return {
    url: location.href,
    title: document.title,
    gradientEls,
    keyframes: keyframesFound,
  }
})

writeFileSync(`${OUT}/inspect-original-deep.json`, JSON.stringify(origInfo, null, 2))
console.log(`✓ ${OUT}/inspect-original-deep.json`)
console.log(`  Found ${origInfo.gradientEls.length} elements with gradient`)
console.log(`  Found ${origInfo.keyframes.length} @keyframes rules`)
console.log(`  Keyframes names: ${origInfo.keyframes.map(k => k.name).join(", ")}`)

await orig.close()

// ── VITRINE ──
const vit = await ctx.newPage()
await vit.goto("http://localhost:5173/components/fluid-gradient-text", { waitUntil: "networkidle", timeout: 30000 })
await vit.waitForTimeout(2000)

const vitInfo = await vit.evaluate(() => {
  const allEls = Array.from(document.querySelectorAll("*"))
  const gradientEls = allEls
    .map(el => {
      const s = getComputedStyle(el)
      const bg = s.backgroundImage
      if (bg && bg !== "none" && (bg.includes("gradient"))) {
        return {
          tag: el.tagName,
          className: typeof el.className === "string" ? el.className : String(el.className),
          text: el.textContent?.trim().slice(0, 100),
          backgroundImage: bg,
          backgroundClip: s.webkitBackgroundClip,
          animation: s.animation,
          animationName: s.animationName,
          animationDuration: s.animationDuration,
          animationTimingFunction: s.animationTimingFunction,
          backgroundSize: s.backgroundSize,
          backgroundPosition: s.backgroundPosition,
          background: s.background,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          fontFamily: s.fontFamily?.slice(0, 60),
          color: s.color,
          dataSlot: el.dataset.slot,
          dataAttr: Object.fromEntries(Object.entries(el.dataset).slice(0, 5)),
          rect: (() => {
            const r = el.getBoundingClientRect()
            return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
          })(),
        }
      }
      return null
    })
    .filter(Boolean)
    .slice(0, 20)

  let keyframesFound = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule.type === CSSRule.KEYFRAMES_RULE) {
          keyframesFound.push({
            name: rule.name,
            cssText: rule.cssText.slice(0, 500),
          })
        }
        if (rule.cssRules) {
          for (const sub of Array.from(rule.cssRules)) {
            if (sub.type === CSSRule.KEYFRAMES_RULE) {
              keyframesFound.push({
                name: sub.name,
                cssText: sub.cssText.slice(0, 500),
              })
            }
          }
        }
      }
    } catch (e) { /* CORS */ }
  }

  return {
    url: location.href,
    title: document.title,
    gradientEls,
    keyframes: keyframesFound,
  }
})

writeFileSync(`${OUT}/inspect-vitrine-deep.json`, JSON.stringify(vitInfo, null, 2))
console.log(`✓ ${OUT}/inspect-vitrine-deep.json`)
console.log(`  Found ${vitInfo.gradientEls.length} elements with gradient`)
console.log(`  Found ${vitInfo.keyframes.length} @keyframes rules`)
console.log(`  Keyframes names: ${vitInfo.keyframes.map(k => k.name).join(", ")}`)

await vit.close()
await browser.close()
