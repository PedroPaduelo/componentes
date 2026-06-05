// scripts/print-ncdai-glow.mjs
// Captura prints do site ncdai e da vitrine (light + dark) para glow-card-grid
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// 1) ncdai — light
{
  const page = await ctx.newPage()
  try {
    await page.goto("https://chanhdai.com/components/glow-card-grid", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    console.warn(`warn ncdai-light: ${e.message}`)
  }
  await page.waitForTimeout(3000)
  await page.screenshot({
    path: "shots/ncdai-glow-card-grid.png",
    fullPage: false,
  })
  console.log("✓ shots/ncdai-glow-card-grid.png")
  await page.close()
}

// 2) ncdai — dark (tentar via prefers-color-scheme)
{
  const darkCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  })
  const page = await darkCtx.newPage()
  try {
    await page.goto("https://chanhdai.com/components/glow-card-grid", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    console.warn(`warn ncdai-dark: ${e.message}`)
  }
  await page.waitForTimeout(3000)
  await page.screenshot({
    path: "shots/ncdai-glow-card-grid-dark.png",
    fullPage: false,
  })
  console.log("✓ shots/ncdai-glow-card-grid-dark.png")
  await page.close()
  await darkCtx.close()
}

// 3) vitrine — light
{
  const page = await ctx.newPage()
  try {
    await page.goto("http://localhost:5173/components/glow-card-grid", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    console.warn(`warn vitrine-light: ${e.message}`)
  }
  await page.waitForTimeout(2000)
  await page.screenshot({
    path: "shots/vitrine-glow-card-grid-light.png",
    fullPage: false,
  })
  console.log("✓ shots/vitrine-glow-card-grid-light.png")
  await page.close()
}

// 4) vitrine — dark
{
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    localStorage.setItem("vitrine-theme", "dark")
  })
  try {
    await page.goto("http://localhost:5173/components/glow-card-grid", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
  } catch (e) {
    console.warn(`warn vitrine-dark: ${e.message}`)
  }
  await page.waitForTimeout(2000)
  await page.screenshot({
    path: "shots/vitrine-glow-card-grid-dark.png",
    fullPage: false,
  })
  console.log("✓ shots/vitrine-glow-card-grid-dark.png")
  await page.close()
}

await browser.close()
console.log("done")
