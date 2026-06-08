// Valida que o catálogo (/ ) lista 30 slugs (10 originais + 20 chanhdai).
import { chromium } from "playwright"

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto("http://localhost:5173/", { waitUntil: "networkidle", timeout: 20000 })
const slugs = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href^="/components/"]'))
  return links.map((a) => a.getAttribute("href").replace("/components/", ""))
})
const unique = [...new Set(slugs)].sort()
console.log(`Cards no catálogo: ${unique.length}`)
for (const s of unique) console.log("  - " + s)
await browser.close()
