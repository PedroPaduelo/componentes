// scripts/val-explore-original.mjs
// Exploração do original para entender o trigger do dialog
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/consent-manager", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3500)

// Listar TODOS os botões com texto
const buttons = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("button")).map((b, i) => ({
    idx: i,
    text: b.textContent?.trim().slice(0, 80) || "",
    rect: (() => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) } })(),
    role: b.getAttribute("role"),
    type: b.getAttribute("type"),
    disabled: b.disabled,
  })).filter(b => b.text || b.role === "switch")
})

console.log("Total buttons:", buttons.length)
for (const b of buttons) {
  console.log(`  [${b.idx}] "${b.text}" y=${b.rect.y} ${b.rect.w}x${b.rect.h}${b.role ? ` role=${b.role}` : ""}${b.disabled ? " DISABLED" : ""}`)
}

await browser.close()
