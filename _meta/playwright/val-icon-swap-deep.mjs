// scripts/val-icon-swap-deep.mjs
// Comparação profunda: medir timing exato do crossfade no original vs vitrine

import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const OUT = "shots/icon-swap"

const browser = await chromium.launch()

// ── ORIGINAL: medir timing do click ──
console.log("\n=== ORIGINAL: timing measurement ===")
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto("https://chanhdai.com/components/icon-swap", {
    waitUntil: "networkidle",
    timeout: 30000,
  })
  await page.waitForTimeout(3000)

  // Capturar estado antes do click
  const before = await page.evaluate(() => {
    const btn = document.querySelector("button.group\\/button")
    if (!btn) return null
    return Array.from(btn.querySelectorAll("svg")).map((svg, i) => ({
      index: i,
      display: getComputedStyle(svg).display,
      opacity: getComputedStyle(svg).opacity,
      visibility: getComputedStyle(svg).visibility,
      transition: getComputedStyle(svg).transition,
    }))
  })
  console.log("Before click:", JSON.stringify(before, null, 2))

  // Capturar transições CSS nos SVGs (não nos parents)
  const svgTransitions = await page.evaluate(() => {
    const btn = document.querySelector("button.group\\/button")
    if (!btn) return null
    return Array.from(btn.querySelectorAll("svg")).map((svg) => ({
      transition: getComputedStyle(svg).transition,
      className: svg.getAttribute("class") || "",
    }))
  })
  console.log("SVG transitions:", JSON.stringify(svgTransitions, null, 2))

  // Click e medir
  const btn = await page.$("button.group\\/button")
  if (btn) {
    await btn.click()
    // Esperar 50ms e capturar
    await page.waitForTimeout(50)
    const t50 = await page.evaluate(() => {
      const b = document.querySelector("button.group\\/button")
      return Array.from(b.querySelectorAll("svg")).map((s, i) => ({
        i,
        display: getComputedStyle(s).display,
        opacity: getComputedStyle(s).opacity,
      }))
    })
    await page.waitForTimeout(100)
    const t150 = await page.evaluate(() => {
      const b = document.querySelector("button.group\\/button")
      return Array.from(b.querySelectorAll("svg")).map((s, i) => ({
        i,
        display: getComputedStyle(s).display,
        opacity: getComputedStyle(s).opacity,
      }))
    })
    await page.waitForTimeout(300)
    const t450 = await page.evaluate(() => {
      const b = document.querySelector("button.group\\/button")
      return Array.from(b.querySelectorAll("svg")).map((s, i) => ({
        i,
        display: getComputedStyle(s).display,
        opacity: getComputedStyle(s).opacity,
      }))
    })
    await page.waitForTimeout(1000)
    const t1450 = await page.evaluate(() => {
      const b = document.querySelector("button.group\\/button")
      return Array.from(b.querySelectorAll("svg")).map((s, i) => ({
        i,
        display: getComputedStyle(s).display,
        opacity: getComputedStyle(s).opacity,
      }))
    })

    writeFileSync(`${OUT}/timing-original.json`, JSON.stringify({
      before, svgTransitions, t50, t150, t450, t1450,
    }, null, 2))
    console.log("Timing data saved to timing-original.json")
  }

  await ctx.close()
}

// ── VITRINE: medir timing do click ──
console.log("\n=== VITRINE: timing measurement ===")
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto("http://localhost:5173/components/icon-swap", {
    waitUntil: "networkidle",
    timeout: 15000,
  })
  await page.waitForTimeout(2000)

  const before = await page.evaluate(() => {
    const wrap = document.querySelector("[data-slot='icon-swap']")
    if (!wrap) return null
    return Array.from(wrap.children).map((el, i) => ({
      index: i,
      tag: el.tagName,
      opacity: getComputedStyle(el).opacity,
      transition: getComputedStyle(el).transition,
      transform: getComputedStyle(el).transform,
    }))
  })
  console.log("Before click:", JSON.stringify(before, null, 2))

  const wrap = await page.$("[data-slot='icon-swap']")
  if (wrap) {
    await wrap.click()
    await page.waitForTimeout(50)
    const t50 = await page.evaluate(() => {
      const w = document.querySelector("[data-slot='icon-swap']")
      return Array.from(w.children).map((el, i) => ({
        i,
        opacity: getComputedStyle(el).opacity,
        transform: getComputedStyle(el).transform,
      }))
    })
    await page.waitForTimeout(100)
    const t150 = await page.evaluate(() => {
      const w = document.querySelector("[data-slot='icon-swap']")
      return Array.from(w.children).map((el, i) => ({
        i,
        opacity: getComputedStyle(el).opacity,
        transform: getComputedStyle(el).transform,
      }))
    })
    await page.waitForTimeout(300)
    const t450 = await page.evaluate(() => {
      const w = document.querySelector("[data-slot='icon-swap']")
      return Array.from(w.children).map((el, i) => ({
        i,
        opacity: getComputedStyle(el).opacity,
        transform: getComputedStyle(el).transform,
      }))
    })
    await page.waitForTimeout(1000)
    const t1450 = await page.evaluate(() => {
      const w = document.querySelector("[data-slot='icon-swap']")
      return Array.from(w.children).map((el, i) => ({
        i,
        opacity: getComputedStyle(el).opacity,
        transform: getComputedStyle(el).transform,
      }))
    })

    writeFileSync(`${OUT}/timing-vitrine.json`, JSON.stringify({
      before, t50, t150, t450, t1450,
    }, null, 2))
    console.log("Timing data saved to timing-vitrine.json")
  }

  await ctx.close()
}

await browser.close()
console.log("\n✅ Done")
