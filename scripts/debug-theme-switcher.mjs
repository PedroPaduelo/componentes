// scripts/debug-theme-switcher.mjs
// Quick debug: what selectors actually match on the theme-switcher page?
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.addInitScript(() => {
  localStorage.setItem("vitrine-theme", "light")
})
await page.goto("http://localhost:5173/components/theme-switcher", { waitUntil: "networkidle", timeout: 30000 })
await new Promise((r) => setTimeout(r, 2000))

const info = await page.evaluate(() => {
  const allButtons = Array.from(document.querySelectorAll("button"))
  const allSlots = Array.from(document.querySelectorAll("[data-slot]")).map(el => ({
    slot: el.getAttribute("data-slot"),
    tag: el.tagName,
    text: (el.textContent || "").trim().slice(0, 40),
    ariaLabel: el.getAttribute("aria-label"),
  }))
  return {
    bodyBg: getComputedStyle(document.body).backgroundColor,
    htmlClassList: Array.from(document.documentElement.classList),
    ls: localStorage.getItem("vitrine-theme"),
    buttonCount: allButtons.length,
    buttons: allButtons.map((b) => ({
      ariaLabel: b.getAttribute("aria-label"),
      text: (b.textContent || "").trim().slice(0, 60),
      rect: (() => { const r = b.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })(),
      hasSvg: !!b.querySelector("svg"),
      inHeader: !!b.closest("header"),
    })),
    dataSlots: allSlots,
  }
})

console.log(JSON.stringify(info, null, 2))
await browser.close()
