// scripts/find-original-shimmer.mjs
// Procura o shimmer por outras técnicas
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("https://chanhdai.com/components/shimmering-text", {
  waitUntil: "networkidle",
  timeout: 45000,
})
await page.waitForTimeout(6000)

// Print inicial full page pra ver tudo
await page.screenshot({ path: "shots/shimmering-text/original-fullpage.png", fullPage: true })

// Procurar QUALQUER elemento com text-clip ou webkit-text-clip
const info = await page.evaluate(() => {
  const results = []

  // 1) Elementos com webkitTextFillColor: transparent (técnica comum)
  document.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el)
    if (cs.webkitTextFillColor === "rgba(0, 0, 0, 0)") {
      const r = el.getBoundingClientRect()
      if (r.width > 10 && r.height > 10) {
        results.push({
          via: "webkitTextFillColor",
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").trim().slice(0, 80),
          rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
          bgImage: cs.backgroundImage.slice(0, 250),
          animation: cs.animation,
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
        })
      }
    }
  })

  // 2) Elementos com classes que contenham "shimmer"
  document.querySelectorAll("[class*='shimmer']").forEach((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    results.push({
      via: "class-shimmer",
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || "").trim().slice(0, 80),
      rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
      className: el.className?.toString(),
      bgImage: cs.backgroundImage.slice(0, 250),
      animation: cs.animation,
      animationName: cs.animationName,
      bgClip: cs.backgroundClip || cs.webkitBackgroundClip,
    })
  })

  // 3) Elementos dentro de divs com 'preview', 'demo', 'example' classes
  const demoContainers = document.querySelectorAll("[class*='preview'], [class*='demo'], [class*='example']")
  const demoChildren = []
  demoContainers.forEach((c) => {
    c.querySelectorAll("h1, h2, h3, span, div, p").forEach((el) => {
      const t = (el.textContent || "").trim()
      if (t.length > 2 && t.length < 100) {
        const r = el.getBoundingClientRect()
        if (r.width > 30 && r.height > 10 && r.top > 100) {
          demoChildren.push({
            tag: el.tagName.toLowerCase(),
            text: t,
            rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
            classes: el.className?.toString().slice(0, 100),
          })
        }
      }
    })
  })

  return { count: results.length, results: results.slice(0, 10), demoCount: demoContainers.length, demoChildren: demoChildren.slice(0, 30) }
})

writeFileSync("shots/shimmering-text/find-original.json", JSON.stringify(info, null, 2))
console.log(JSON.stringify(info, null, 2))

await browser.close()
console.log("\n✓ Done")
