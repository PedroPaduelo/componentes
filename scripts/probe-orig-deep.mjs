/**
 * Investigação DOM profunda do ORIGINAL (chanhdai.com)
 * Procura: SVG com patterns/dots, canvas, web components custom, framer-motion,
 * elementos com mouse listeners, radial-gradient em qualquer profundidade.
 */
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("https://chanhdai.com/components/dot-grid-spotlight", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3000)

// Move mouse para dentro do componente (no centro da tela, área da preview)
await page.mouse.move(720, 450)
await page.waitForTimeout(1500)

const probe = await page.evaluate(() => {
  const result = {}

  // 1. All canvases on the page
  result.canvases = Array.from(document.querySelectorAll("canvas")).map(c => {
    const r = c.getBoundingClientRect()
    return { rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }, dataAttrs: Array.from(c.attributes).filter(a => a.name.startsWith("data-") || a.name === "id" || a.name === "class").map(a => `${a.name}=${a.value}`) }
  })

  // 2. All SVGs
  result.svgs = Array.from(document.querySelectorAll("svg")).slice(0, 10).map(s => {
    const r = s.getBoundingClientRect()
    return { rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }, viewBox: s.getAttribute("viewBox"), hasDefs: !!s.querySelector("defs"), hasPattern: !!s.querySelector("pattern"), dataAttrs: Array.from(s.attributes).filter(a => a.name.startsWith("data-")).map(a => `${a.name}=${a.value}`) }
  })

  // 3. All elements with radial-gradient in any background
  result.radialEls = Array.from(document.querySelectorAll("*"))
    .filter(el => {
      const s = getComputedStyle(el)
      return s.backgroundImage?.includes("radial-gradient")
    })
    .slice(0, 15)
    .map(el => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return {
        tag: el.tagName,
        cls: el.className?.toString().slice(0, 100),
        rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
        bg: s.backgroundImage?.slice(0, 300),
        mask: (s.webkitMaskImage || s.maskImage || "").slice(0, 200),
        maskPos: s.webkitMaskPosition || s.maskPosition,
      }
    })

  // 4. All elements with mask-image containing radial
  result.maskRadialEls = Array.from(document.querySelectorAll("*"))
    .filter(el => {
      const s = getComputedStyle(el)
      return (s.webkitMaskImage || s.maskImage || "").includes("radial")
    })
    .slice(0, 15)
    .map(el => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return {
        tag: el.tagName,
        cls: el.className?.toString().slice(0, 100),
        rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
        mask: (s.webkitMaskImage || s.maskImage || "").slice(0, 300),
        maskPos: s.webkitMaskPosition || s.maskPosition,
      }
    })

  // 5. Find the dot grid container — search by text "dot" in classes, or
  //    search the main preview area for the spotlight
  result.gridLike = Array.from(document.querySelectorAll("[class*='grid'], [class*='dot'], [class*='spotlight'], [class*='pattern']"))
    .slice(0, 20)
    .map(el => {
      const r = el.getBoundingClientRect()
      return {
        tag: el.tagName,
        cls: el.className?.toString().slice(0, 120),
        rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
        bg: getComputedStyle(el).backgroundImage?.slice(0, 200),
      }
    })

  // 6. Look at body innerHTML structure briefly to find preview area
  const previewArea = document.querySelector("[class*='preview'], [class*='demo'], [class*='component']")
  if (previewArea) {
    result.previewArea = {
      tag: previewArea.tagName,
      cls: previewArea.className?.toString().slice(0, 200),
      children: Array.from(previewArea.children).slice(0, 10).map(c => ({
        tag: c.tagName,
        cls: c.className?.toString().slice(0, 150),
        childCount: c.children.length,
      })),
    }
  }

  return result
})

writeFileSync("shots/dot-grid-spotlight/orig-deep-probe.json", JSON.stringify(probe, null, 2))
console.log("✓ orig-deep-probe.json")
console.log("canvases:", probe.canvases.length)
console.log("svgs:", probe.svgs.length)
console.log("radialEls:", probe.radialEls.length)
console.log("maskRadialEls:", probe.maskRadialEls.length)
console.log("gridLike:", probe.gridLike.length)
console.log("previewArea:", !!probe.previewArea)

await browser.close()
