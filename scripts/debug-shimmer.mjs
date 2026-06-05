import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
page.on("console", (msg) => console.log(`[console.${msg.type()}] ${msg.text()}`))
page.on("pageerror", (err) => console.log(`[pageerror] ${err.message}`))

await page.goto("http://localhost:5173/components/shimmering-text", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  const slot = document.querySelector("[data-slot='shimmering-text']")
  return {
    title: document.title,
    bodyText: (document.body.innerText || "").slice(0, 500),
    h2Count: document.querySelectorAll("h2").length,
    h2Texts: Array.from(document.querySelectorAll("h2")).map(h => h.textContent).slice(0, 5),
    slotCount: document.querySelectorAll("[data-slot='shimmering-text']").length,
    slot: slot ? { tag: slot.tagName, text: slot.textContent.slice(0, 50), className: slot.className.slice(0, 200) } : null,
  }
})
console.log(JSON.stringify(info, null, 2))

await browser.close()
