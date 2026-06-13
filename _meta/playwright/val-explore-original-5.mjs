// scripts/val-explore-original-5.mjs
// Captura full page e mostra se o dialog está visível em algum lugar
import { chromium } from "playwright"
import { outPath } from "./_shots.mjs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/consent-manager", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3500)

// Rola toda a página pra carregar lazy
for (let i = 0; i < 8; i++) {
  await page.evaluate(() => window.scrollBy(0, 500))
  await page.waitForTimeout(500)
}

// De volta ao topo
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(1000)

await page.screenshot({ path: outPath("consent-manager/original-fullpage.png"), fullPage: true })
console.log("Full page saved")

// Verifica se existe dialog
const info = await page.evaluate(() => {
  const d = document.querySelector("[role='dialog']")
  const allDialogs = Array.from(document.querySelectorAll("[role='dialog'], [data-state='open']"))
  return {
    dialog: !!d,
    dialogsCount: allDialogs.length,
    dialogs: allDialogs.map(x => ({
      tag: x.tagName,
      role: x.getAttribute("role"),
      state: x.getAttribute("data-state"),
      text: x.textContent?.trim().slice(0, 100),
    })),
  }
})
console.log("Info:", JSON.stringify(info, null, 2))

await browser.close()
