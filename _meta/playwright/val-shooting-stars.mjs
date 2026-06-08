// scripts/val-shooting-stars.mjs
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded", timeout: 30000 })
await page.waitForTimeout(2000)

const linkCount = await page.locator("a[href='/components/shooting-stars-and-stars-background']").count()
console.log("linkCount:", linkCount)

if (linkCount > 0) {
  await page.locator("a[href='/components/shooting-stars-and-stars-background']").first().click()
  await page.waitForTimeout(2500)
  const info = await page.evaluate(() => {
    const s = document.querySelector("[data-slot='shooting-stars']")
    const st = document.querySelector("[data-slot='stars-background']")
    return {
      url: location.pathname,
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      shooting: s ? { tag: s.tagName, w: Math.round(s.getBoundingClientRect().width), h: Math.round(s.getBoundingClientRect().height) } : null,
      stars: st ? { tag: st.tagName, w: Math.round(st.getBoundingClientRect().width), h: Math.round(st.getBoundingClientRect().height), cw: st.width, ch: st.height } : null,
    }
  })
  console.log("INFO:", JSON.stringify(info, null, 2))
  await page.screenshot({ path: "shots/shooting-stars.png", animations: "disabled", timeout: 15000 }).catch((e) => console.warn("screenshot:", e.message))
}
await browser.close()
console.log("done")
