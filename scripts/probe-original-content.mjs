import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/chevrons-up-down-icon", { waitUntil: "networkidle", timeout: 40000 })
await page.waitForTimeout(2000)

// Get the full page content structure
const content = await page.evaluate(() => {
  // Get the main content area
  const main = document.querySelector("main") || document.body
  const allHeadings = Array.from(main.querySelectorAll("h1, h2, h3, p, code, pre, blockquote")).map(el => ({
    tag: el.tagName,
    text: el.textContent?.trim().slice(0, 80),
    className: (typeof el.className === "string" ? el.className : el.getAttribute("class") || "").slice(0, 60)
  })).slice(0, 30)
  return allHeadings
})
console.log("Content structure:")
console.log(JSON.stringify(content, null, 2))

// Also check the pre/code blocks (these contain the source code shown on the page)
const codeBlocks = await page.evaluate(() => {
  const pres = Array.from(document.querySelectorAll("pre, code"))
  return pres.slice(0, 10).map(p => ({
    tag: p.tagName,
    text: p.textContent?.trim().slice(0, 200),
    rect: (() => { const r = p.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })()
  }))
})
console.log("\nCode blocks:")
console.log(JSON.stringify(codeBlocks, null, 2))

await browser.close()
