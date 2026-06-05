import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("http://localhost:5173/components/theme-toggle-effect", { waitUntil: "networkidle" })
await page.waitForTimeout(800)

// 1. Confirmar 8 botões com data-slot dentro do example (excluindo o do header)
const count = await page.locator("[data-slot='theme-toggle-effect']").count()
const dataVariantAttrs = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("[data-slot='theme-toggle-effect']"))
    .map(b => b.getAttribute("data-variant") ?? "(sem variant — default)")
})
console.log(`[COUNT] botões com data-slot='theme-toggle-effect': ${count}`)
console.log(`[VARIANTS] ${JSON.stringify(dataVariantAttrs)}`)

// 2. Conferir bg inicial (light) — botão que NÃO é o primeiro (pula o do header)
const firstInExample = page.locator("[data-slot='theme-toggle-effect']").nth(1) // header é o 0
const htmlBefore = await page.evaluate(() => document.documentElement.className)
const bgBefore = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
console.log(`[BEFORE] html=${htmlBefore}, bg=${bgBefore}`)

// 3. Clicar e checar
await firstInExample.click()
await page.waitForTimeout(800)
const htmlAfter = await page.evaluate(() => document.documentElement.className)
const bgAfter = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
console.log(`[AFTER CLICK 1st] html=${htmlAfter}, bg=${bgAfter}`)

// 4. Print final
await page.screenshot({ path: "shots/verify-variants-after-click.png" })
await browser.close()
console.log("done")
