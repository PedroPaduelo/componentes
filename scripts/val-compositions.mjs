import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function check(path, label) {
  const page = await ctx.newPage()
  await page.goto(`http://localhost:5173/${path}`, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(500)
  const info = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim(),
    cards: document.querySelectorAll("a[href^='/compositions/']").length,
    stub: Array.from(document.querySelectorAll("p")).some((p) => p.textContent?.includes("Composição em breve")),
    bodyHasNotFound: document.body.textContent?.includes("Página não encontrada"),
  }))
  console.log(label, JSON.stringify(info))
  await page.close()
}

await check("compositions", "GALERIA      ")
await check("compositions/landing-page", "landing-page ")
await check("compositions/saas-dashboard", "saas-dashboard")
await check("compositions/pricing-page", "pricing-page ")
await check("compositions/testimonials-wall", "testimon-wall")
await check("compositions/hero-gallery", "hero-gallery ")
await check("compositions/slug-invalido", "INVALIDO     ")
await browser.close()
