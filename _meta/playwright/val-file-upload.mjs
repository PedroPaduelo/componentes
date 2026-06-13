// Validação visual rápida do FileUpload (Aceternity).
// Confirma que o componente está sendo renderizado na página de detalhe
// e que o data-slot="file-upload" está presente (estado vazio padrão).
import { chromium } from "playwright"
import { outPath } from "./_shots.mjs"

const url = "http://localhost:5173/components/file-upload"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
await page.waitForTimeout(2000)

const info = await page.evaluate(() => {
  const wrap = document.querySelector("[data-slot='file-upload']")
  const handle = document.querySelector("#file-upload-handle")
  const cards = document.querySelectorAll("[data-slot='file-upload'] .grid, [data-slot='file-upload'] [class*='grid']")
  const hasGridPattern = !!document.querySelector("[data-slot='file-upload'] > div > div > div")
  const text = wrap ? wrap.textContent : null
  return {
    found: !!wrap,
    rect: wrap ? (() => {
      const r = wrap.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    })() : null,
    hasInput: !!handle,
    inputAccept: handle?.getAttribute("accept"),
    inputMultiple: handle?.hasAttribute("multiple"),
    hasGridPattern,
    text: text?.replace(/\s+/g, " ").trim().slice(0, 200),
  }
})

console.log("RESULT", JSON.stringify(info, null, 2))
await page.screenshot({ path: outPath("val-file-upload.png"), fullPage: false })
await browser.close()
console.log("OK")
