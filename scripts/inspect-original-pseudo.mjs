// scripts/inspect-original-pseudo.mjs
// Inspeciona ::before/::after do shimmer original
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("https://chanhdai.com/components/shimmering-text", {
  waitUntil: "networkidle",
  timeout: 45000,
})
await page.waitForTimeout(5000)

const info = await page.evaluate(() => {
  // Encontrar todos os elementos com classe que tenha "shimmer" no nome
  const targets = []
  document.querySelectorAll("[class*='shimmer']").forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width > 50 && r.height > 10) {
      targets.push(el)
    }
  })

  // Para cada, pegar before/after
  const data = targets.map((el) => {
    const cs = getComputedStyle(el)
    const beforeCs = getComputedStyle(el, "::before")
    const afterCs = getComputedStyle(el, "::after")

    return {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || "").trim().slice(0, 80),
      rect: { w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) },
      className: el.className?.toString().slice(0, 300),
      self: {
        bg: cs.backgroundColor,
        color: cs.color,
        bgImage: cs.backgroundImage.slice(0, 200),
        animation: cs.animation,
      },
      before: {
        content: beforeCs.content,
        position: beforeCs.position,
        inset: beforeCs.inset,
        bg: beforeCs.backgroundColor,
        bgImage: beforeCs.backgroundImage.slice(0, 200),
        color: beforeCs.color,
        mask: beforeCs.mask || beforeCs.webkitMask,
        maskImage: beforeCs.maskImage || beforeCs.webkitMaskImage,
        maskComposite: beforeCs.maskComposite,
        animation: beforeCs.animation,
        animationName: beforeCs.animationName,
        animationDuration: beforeCs.animationDuration,
        animationIteration: beforeCs.animationIterationCount,
        animationDelay: beforeCs.animationDelay,
        animationTimingFunction: beforeCs.animationTimingFunction,
        backgroundClip: beforeCs.backgroundClip || beforeCs.webkitBackgroundClip,
        backgroundPosition: beforeCs.backgroundPosition,
      },
      after: {
        content: afterCs.content,
        position: afterCs.position,
        inset: afterCs.inset,
        bg: afterCs.backgroundColor,
        bgImage: afterCs.backgroundImage.slice(0, 200),
        color: afterCs.color,
        mask: afterCs.mask || afterCs.webkitMask,
        maskImage: afterCs.maskImage || afterCs.webkitMaskImage,
        animation: afterCs.animation,
        animationName: afterCs.animationName,
        animationDuration: afterCs.animationDuration,
        backgroundClip: afterCs.backgroundClip || afterCs.webkitBackgroundClip,
        backgroundPosition: afterCs.backgroundPosition,
      },
    }
  })

  // Procurar CSS rules que referenciem "shimmer" ou @keyframes shimmer
  const cssRules = []
  for (const sheet of Array.from(document.styleSheets)) {
    let rules
    try { rules = sheet.cssRules } catch (e) { continue }
    if (!rules) continue
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSKeyframesRule && rule.name.toLowerCase().includes("shimmer")) {
        cssRules.push({ type: "keyframes", name: rule.name, cssText: rule.cssText })
      }
      if (rule instanceof CSSStyleRule && (rule.selectorText || "").toLowerCase().includes("shimmer")) {
        cssRules.push({ type: "style", selector: rule.selectorText, cssText: rule.cssText.slice(0, 800) })
      }
    }
  }

  return { data, cssRules }
})

writeFileSync("shots/shimmering-text/inspect-original-pseudo.json", JSON.stringify(info, null, 2))
console.log(JSON.stringify(info, null, 2))

await browser.close()
console.log("\n✓ Done")
