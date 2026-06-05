// Inspect script for toc-minimap validation
// Extracts DOM info to diagnose theme/height issues
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function inspect(url, label) {
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1500)
  const info = await page.evaluate(() => {
    const wrap = document.querySelector("[data-slot=toc-minimap]")
    const nav = wrap?.querySelector("nav")
    const links = nav ? Array.from(nav.querySelectorAll("a")).slice(0, 8) : []
    return {
      wrap: wrap && {
        rect: (() => {
          const r = wrap.getBoundingClientRect()
          return { w: Math.round(r.width), h: Math.round(r.height) }
        })(),
        bg: getComputedStyle(wrap).backgroundColor,
        color: getComputedStyle(wrap).color,
      },
      nav: nav && {
        bg: getComputedStyle(nav).backgroundColor,
        color: getComputedStyle(nav).color,
      },
      links: links.map((a) => ({
        text: a.textContent?.trim().slice(0, 40),
        href: a.getAttribute("href"),
        active: a.getAttribute("aria-current"),
        color: getComputedStyle(a).color,
        bg: getComputedStyle(a).backgroundColor,
      })),
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    }
  })
  console.log(`[${label}]`, JSON.stringify(info, null, 2))
  await page.close()
  return info
}

await inspect("https://chanhdai.com/components/toc-minimap", "ORIGINAL")
await inspect("http://localhost:5173/components/toc-minimap", "VITRINE")
await browser.close()
