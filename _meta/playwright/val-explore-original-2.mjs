// scripts/val-explore-original-2.mjs
// Tenta achar o trigger do dialog
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/consent-manager", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3500)

// Tenta rolar até a seção "Demo" e procura o botão
await page.evaluate(() => window.scrollTo(0, 1500))
await page.waitForTimeout(1000)

// Screenshot da página inteira
await page.screenshot({ path: "shots/consent-manager/original-full.png", fullPage: true })

// Tenta procurar a demo
const demoButton = await page.evaluate(() => {
  // Procura elementos que pareçam ser um trigger de demo
  const candidates = Array.from(document.querySelectorAll("button, [role='button'], a"))
    .map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 60) || "",
      rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) } })(),
      visible: (() => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 })(),
    }))
    .filter(c => c.visible && c.text.length > 0 && c.text.length < 60)
  return candidates
})
console.log("Visible candidates:")
for (const c of demoButton) {
  console.log(`  ${c.tag} "${c.text}" y=${c.rect.y} ${c.rect.w}x${c.rect.h}`)
}

await browser.close()
