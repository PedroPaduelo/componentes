import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/chevrons-up-down-icon", { waitUntil: "networkidle", timeout: 40000 })
await page.waitForTimeout(2000)

const svgs = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("svg")).map((svg, i) => {
    const r = svg.getBoundingClientRect()
    const cls = svg.getAttribute("class") || ""
    const vb = svg.getAttribute("viewBox") || ""
    const paths = Array.from(svg.querySelectorAll("path")).map(p => p.getAttribute("d")?.slice(0, 60) || "")
    let parent = svg.parentElement
    const parentInfo = parent ? { tag: parent.tagName, class: (parent.className || "").slice(0, 60), text: parent.textContent?.trim().slice(0, 40) } : null
    return {
      i, cls, vb,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      paths: paths.slice(0, 3),
      parent: parentInfo,
    }
  })
})
console.log("ALL SVGs on original page:")
console.log(JSON.stringify(svgs, null, 2))

// Search for any element containing "chevron" in class or text
const chevronEls = await page.evaluate(() => {
  const all = document.querySelectorAll("[class*='chevron' i], [class*='up-down' i]")
  return Array.from(all).slice(0, 20).map(e => {
    const cn = (typeof e.className === "string" ? e.className : e.getAttribute("class") || "").slice(0, 100)
    const r = e.getBoundingClientRect()
    return {
      tag: e.tagName,
      class: cn,
      text: e.textContent?.trim().slice(0, 40),
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    }
  })
})
console.log("\nElements with 'chevron' or 'up-down' in class:")
console.log(JSON.stringify(chevronEls, null, 2))

// Also check what text content the page has
const headings = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("h1, h2, h3, h4")).map(h => h.textContent?.trim().slice(0, 60))
})
console.log("\nHeadings:", JSON.stringify(headings, null, 2))

await browser.close()
