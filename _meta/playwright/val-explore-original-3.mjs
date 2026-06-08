// scripts/val-explore-original-3.mjs
// Tenta achar e abrir o consent-manager
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/consent-manager", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3500)

// Rola para baixo para carregar tudo (lazy load)
for (let i = 0; i < 5; i++) {
  await page.evaluate(() => window.scrollBy(0, 600))
  await page.waitForTimeout(500)
}
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(1000)

// Tenta encontrar QUALQUER botão que pareça ser demo
const all = await page.evaluate(() => {
  // Procura todos elementos com texto de cookie/consent/preferences
  const els = Array.from(document.querySelectorAll("*"))
    .filter(el => {
      const text = (el.textContent || "").toLowerCase()
      return /manage cookie|cookie prefer|cookie setting|accept all|reject all|open.*cookie|cookie center|cookie manager/i.test(text)
        && el.children.length < 5
    })
    .map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 80) || "",
      rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) } })(),
    }))
  return els
})
console.log("Found elements with cookie/consent text:")
for (const e of all.slice(0, 30)) {
  console.log(`  ${e.tag} "${e.text}" y=${e.rect.y} ${e.rect.w}x${e.rect.h}`)
}

// Tenta também procurar <iframe> ou componentes "pre-rendered"
const iframes = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("iframe")).map(f => ({
    src: f.src,
    rect: (() => { const r = f.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })(),
  }))
})
console.log("\nIframes:", iframes)

// Tenta abrir procurando pelo conteúdo "Manage your cookies"
const possible = await page.locator("text=/manage.*cookie|accept.*all|reject.*all/i").count()
console.log(`\nLocator found: ${possible}`)

if (possible > 0) {
  await page.locator("text=/manage.*cookie|accept.*all|reject.*all/i").first().click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: "shots/consent-manager/original-dialog-attempt.png" })
  console.log("Clicked & screenshotted")
}

await browser.close()
