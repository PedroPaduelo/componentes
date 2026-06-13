// scripts/val-3d-pin.mjs
// Valida render + hover do 3D Pin (Aceternity).
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const browser = await chromium.launch()

async function probe(theme, hoverTimeout = 8000) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`)
  })
  await page.goto("http://localhost:5173/components/3d-pin", { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(1500)
  const info = await page.evaluate(() => {
    const pins = Array.from(document.querySelectorAll("[data-slot='3d-pin']"))
    return {
      pinCount: pins.length,
      firstH: pins[0] ? Math.round(pins[0].getBoundingClientRect().height) : null,
      firstW: pins[0] ? Math.round(pins[0].getBoundingClientRect().width) : null,
      titleSpans: Array.from(document.querySelectorAll("[data-slot='3d-pin'] span")).filter(s => s.textContent?.includes("acme.com") || s.textContent?.includes("github.com")).map(s => s.textContent),
      motionDivCount: document.querySelectorAll("[data-slot='3d-pin'] [class*='rounded-[50%]']").length,
    }
  })
  await page.screenshot({ path: outPath(`3d-pin-${theme}-rest.png`), fullPage: false, animations: "disabled" })
  let hoverOk = false
  let hoverTransform = null
  try {
    await page.locator("[data-slot='3d-pin']").first().hover({ timeout: hoverTimeout })
    await page.waitForTimeout(1200)
    hoverOk = true
    hoverTransform = await page.evaluate(() => {
      const inner = document.querySelector("[data-slot='3d-pin'] .rounded-2xl")
      return inner ? inner.style.transform : null
    })
  } catch (e) {
    errors.push(`hover: ${e.message.slice(0, 200)}`)
  }
  await page.screenshot({ path: outPath(`3d-pin-${theme}-hover.png`), fullPage: false, animations: "disabled" })
  await ctx.close()
  return { theme, info, hoverOk, hoverTransform, errors }
}

const light = await probe("light")
const dark = await probe("dark")

console.log("\n[light]", JSON.stringify(light, null, 2))
console.log("\n[dark]", JSON.stringify(dark, null, 2))

await browser.close()
