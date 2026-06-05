// scripts/inspect-original-html.mjs
// Captura HTML bruto do original e mais detalhes
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

// Scroll a página inteira
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(2000)
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(2000)

const info = await page.evaluate(() => {
  // Pegar texto visível da demo (a section que mostra o componente)
  const main = document.querySelector("main") || document.body

  // Pegar TODOS os elementos com texto
  const textEls = Array.from(main.querySelectorAll("h1, h2, h3, h4, p, span"))
    .filter((el) => {
      const t = (el.textContent || "").trim()
      return t.length > 1 && t.length < 200
    })
    .slice(0, 30)
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: el.textContent.trim().slice(0, 80),
      classes: el.className?.toString().slice(0, 150),
      rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) } })(),
    }))

  // Pegar iframes
  const iframes = Array.from(document.querySelectorAll("iframe")).map((f) => ({
    src: f.src,
    width: f.width,
    height: f.height,
  }))

  // Pegar elementos com position:absolute (preview boxes)
  const allDivs = Array.from(document.querySelectorAll("div"))
    .filter((d) => {
      const cs = getComputedStyle(d)
      return (cs.position === "relative" || cs.position === "absolute") &&
             d.getBoundingClientRect().height > 50 &&
             d.getBoundingClientRect().height < 400 &&
             d.getBoundingClientRect().width > 100
    })
    .slice(0, 20)
    .map((d) => ({
      text: (d.textContent || "").trim().slice(0, 60),
      rect: (() => { const r = d.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) } })(),
    }))

  return { iframes, textEls, allDivs, htmlSnippet: document.body.innerHTML.length }
})

writeFileSync("shots/shimmering-text/inspect-original-html.json", JSON.stringify(info, null, 2))
console.log(JSON.stringify(info, null, 2))

// Screenshot com mouse parado em y=300 pra ver a demo
await page.mouse.move(0, 0)
await page.screenshot({ path: "shots/shimmering-text/original-zoom.png", clip: { x: 0, y: 100, width: 1440, height: 700 } })

await browser.close()
console.log("\n✓ Done")
