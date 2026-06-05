// Probe chanhdai summary text
import { chromium } from "playwright"
import { setTimeout as sleep } from "node:timers/promises"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/github-contributions", { waitUntil: "networkidle", timeout: 45000 })
await sleep(4000)

const probe = await page.evaluate(() => {
  // Find all text on the page that matches "X contributions in ..."
  const allEls = Array.from(document.querySelectorAll('*'))
  const matches = allEls.filter(el =>
    el.children.length === 0 && el.textContent && /contributions?/i.test(el.textContent)
  ).map(el => ({
    text: el.textContent.trim(),
    class: String(el.className || '').slice(0, 80),
  }))

  // Find the GitHub Contributions component-preview wrapper
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, [class*="title"]'))
  const ghTitle = headings.find(el => el.textContent && el.textContent.trim() === 'GitHub Contributions')

  return { matches: matches.slice(0, 5), hasGhTitle: !!ghTitle }
})

console.log(JSON.stringify(probe, null, 2))
await browser.close()
