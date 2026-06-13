// scripts/val-container-text-flip.mjs
// Valida ContainerTextFlip (Aceternity) na página /components/container-text-flip.
// Comportamento esperado:
//   - 2 instâncias [data-slot=container-text-flip] renderizadas (Básico + Custom)
//   - Cada uma com width > 0, height > 0
//   - text-foreground respondendo ao tema (data-theme)
//   - Troca de palavra ocorre a cada ~3s (default interval) ou ~1.8s (custom)
//   - Sem erros de console / page errors
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errs = []
page.on("pageerror", (e) => errs.push("pageerror: " + e.message))
page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text()) })

await page.goto("http://localhost:5173/components/container-text-flip", {
  waitUntil: "domcontentloaded",
  timeout: 30000,
})
await page.waitForTimeout(3500)

const slots = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("[data-slot=container-text-flip]")).map((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      text: el.textContent?.trim().slice(0, 60),
      w: Math.round(r.width),
      h: Math.round(r.height),
      theme: el.getAttribute("data-theme"),
      border: cs.borderTopWidth,
      bgImage: cs.backgroundImage.slice(0, 60),
    }
  })
})
console.log("[data-slot=container-text-flip]", JSON.stringify(slots, null, 2))

// Aguarda 1 troca de palavra (default interval 3000ms)
await page.waitForTimeout(3500)
const slots2 = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("[data-slot=container-text-flip]")).map((el) => ({
    text: el.textContent?.trim().slice(0, 60),
    w: Math.round(el.getBoundingClientRect().width),
  }))
})
console.log("[after 3.5s]", JSON.stringify(slots2, null, 2))

console.log("errs", errs.length)
errs.slice(0, 5).forEach((e) => console.log("  -", e.slice(0, 250)))

await page.screenshot({ path: outPath("container-text-flip.png"), fullPage: true })
await browser.close()
console.log("done")
