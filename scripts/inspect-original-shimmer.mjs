// scripts/inspect-original-shimmer.mjs
// Inspeção profunda do original chanhdai pra entender a estrutura
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// LIGHT
{
  const page = await ctx.newPage()
  await page.goto("https://chanhdai.com/components/shimmering-text", {
    waitUntil: "networkidle",
    timeout: 45000,
  })
  await page.waitForTimeout(4000)

  const dump = await page.evaluate(() => {
    // Tentar achar a section/demonstração do componente
    const heading = Array.from(document.querySelectorAll("h1, h2, h3")).find((h) =>
      (h.textContent || "").toLowerCase().includes("shimmer")
    )

    // Pegar todos os elementos com background-clip:text OU animation shimmer
    const candidates = []
    document.querySelectorAll("*").forEach((el) => {
      const cs = getComputedStyle(el)
      const clip = cs.backgroundClip || cs.webkitBackgroundClip
      const anim = cs.animationName
      const hasShimmer = (anim || "").toLowerCase().includes("shimmer")
      const hasGradient = cs.backgroundImage.includes("gradient")
      const hasClip = clip === "text"
      if (hasShimmer || (hasClip && hasGradient && (el.textContent || "").trim().length > 0)) {
        const r = el.getBoundingClientRect()
        candidates.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").trim().slice(0, 100),
          rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
          bg: cs.backgroundColor,
          color: cs.color,
          bgImage: cs.backgroundImage.slice(0, 250),
          bgClip: clip,
          animation: cs.animation,
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
          animationIteration: cs.animationIterationCount,
          dataAttrs: Object.fromEntries(
            Array.from(el.attributes)
              .filter((a) => a.name.startsWith("data-"))
              .map((a) => [a.name, a.value])
          ),
          className: el.className?.toString().slice(0, 200),
        })
      }
    })

    // Procurar keyframes shimmer no CSS
    const kfs = []
    for (const sheet of Array.from(document.styleSheets)) {
      let rules
      try { rules = sheet.cssRules } catch (e) { continue }
      if (!rules) continue
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSKeyframesRule) {
          if (rule.name.toLowerCase().includes("shimmer")) {
            kfs.push({ name: rule.name, cssText: rule.cssText.slice(0, 500) })
          }
        }
      }
    }

    return {
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim().slice(0, 100),
      htmlClassList: document.documentElement.className,
      heading: heading ? { tag: heading.tagName, text: heading.textContent.trim() } : null,
      candidates: candidates.slice(0, 10),
      keyframes: kfs,
    }
  })

  writeFileSync("shots/shimmering-text/inspect-original-deep-light.json", JSON.stringify(dump, null, 2))
  console.log("=== LIGHT ===")
  console.log(JSON.stringify(dump, null, 2))
  await page.close()
}

// DARK
{
  const page = await ctx.newPage()
  await page.emulateMedia({ colorScheme: "dark" })
  await page.goto("https://chanhdai.com/components/shimmering-text", {
    waitUntil: "networkidle",
    timeout: 45000,
  })
  await page.waitForTimeout(4000)

  const dump = await page.evaluate(() => {
    const candidates = []
    document.querySelectorAll("*").forEach((el) => {
      const cs = getComputedStyle(el)
      const clip = cs.backgroundClip || cs.webkitBackgroundClip
      const anim = cs.animationName
      const hasShimmer = (anim || "").toLowerCase().includes("shimmer")
      const hasGradient = cs.backgroundImage.includes("gradient")
      const hasClip = clip === "text"
      if (hasShimmer || (hasClip && hasGradient && (el.textContent || "").trim().length > 0)) {
        const r = el.getBoundingClientRect()
        candidates.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").trim().slice(0, 100),
          rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
          bgImage: cs.backgroundImage.slice(0, 250),
          bgClip: clip,
          animation: cs.animation,
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
        })
      }
    })
    return {
      htmlClassList: document.documentElement.className,
      candidates: candidates.slice(0, 10),
    }
  })

  writeFileSync("shots/shimmering-text/inspect-original-deep-dark.json", JSON.stringify(dump, null, 2))
  console.log("\n=== DARK ===")
  console.log(JSON.stringify(dump, null, 2))
  await page.close()
}

await browser.close()
console.log("\n✓ Done")
