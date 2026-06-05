// scripts/inspect-original-shimmer-deep.mjs
// Busca direta do shimmer na demo central
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
  // Pegar TODO elemento que tenha background-image com gradient E background-clip: text
  const results = []
  document.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el)
    const clip = cs.backgroundClip || cs.webkitBackgroundClip
    if (clip === "text" && cs.backgroundImage.includes("gradient")) {
      const r = el.getBoundingClientRect()
      const text = (el.textContent || "").trim()
      if (text.length > 0 && r.width > 10 && r.height > 10) {
        results.push({
          tag: el.tagName.toLowerCase(),
          text: text.slice(0, 80),
          rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) },
          bg: cs.backgroundColor,
          color: cs.color,
          bgImage: cs.backgroundImage.slice(0, 300),
          animation: cs.animation,
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
          animationIteration: cs.animationIterationCount,
          animationDelay: cs.animationDelay,
          animationTimingFunction: cs.animationTimingFunction,
          dataAttrs: Object.fromEntries(
            Array.from(el.attributes)
              .filter((a) => a.name.startsWith("data-"))
              .map((a) => [a.name, a.value])
          ),
          className: el.className?.toString().slice(0, 250),
        })
      }
    }
  })

  // Procurar keyframes shimmer
  const kfs = []
  for (const sheet of Array.from(document.styleSheets)) {
    let rules
    try { rules = sheet.cssRules } catch (e) { continue }
    if (!rules) continue
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSKeyframesRule) {
        if (rule.name.toLowerCase().includes("shimmer")) {
          kfs.push({ name: rule.name, cssText: rule.cssText.slice(0, 600) })
        }
      }
    }
  }

  return {
    count: results.length,
    candidates: results,
    keyframes: kfs,
    htmlClassList: document.documentElement.className,
    bodyClassList: document.body.className,
  }
})

writeFileSync("shots/shimmering-text/inspect-original-shimmer-deep.json", JSON.stringify(info, null, 2))
console.log(JSON.stringify(info, null, 2))

await browser.close()
console.log("\n✓ Done")
