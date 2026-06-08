// scripts/val-explore-original-6.mjs
// Verificar se a página do original tem o consent manager já renderizado em iframe
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/consent-manager", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3500)

// Pega HTML inteiro da página para análise
const html = await page.content()

// Procura por palavras-chave
const keywords = ["consent", "cookie", "c15t", "Manage", "Accept", "Reject", "Preferences", "Demo"]
console.log("Keywords found in HTML:")
for (const k of keywords) {
  const re = new RegExp(k, "gi")
  const matches = html.match(re)
  console.log(`  ${k}: ${matches?.length || 0} matches`)
}

// Pega todos os text nodes
const allText = await page.evaluate(() => {
  return document.body.innerText
})
console.log("\nBody text (first 3000 chars):")
console.log(allText.slice(0, 3000))

await browser.close()
