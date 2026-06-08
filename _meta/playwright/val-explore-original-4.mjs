// scripts/val-explore-original-4.mjs
// Tenta abrir o consent manager e checar
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/consent-manager", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3500)

// Procura QUALQUER coisa relacionada a cookie
const found = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("*"))
    .filter(el => {
      const text = (el.textContent || "").toLowerCase()
      const r = el.getBoundingClientRect()
      return /manage your|accept all|reject all|cookie prefer/i.test(text)
        && el.children.length < 8
        && r.width > 0
        && r.height > 0
    })
    .slice(0, 10)
    .map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 100) || "",
      rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) } })(),
    }))
})
console.log("Found candidates:")
for (const e of found) {
  console.log(`  ${e.tag} "${e.text.slice(0, 60)}" y=${e.rect.y} ${e.rect.w}x${e.rect.h}`)
}

// Tenta clicar em qualquer coisa que seja "Manage your cookies" ou similar
const match = page.locator("text=/manage your cookie/i").first()
const matchCount = await match.count()
console.log(`\nmanage your cookies locator: ${matchCount}`)

if (matchCount > 0) {
  await match.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await match.click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: "shots/consent-manager/original-click-manage.png" })
  console.log("Clicked 'Manage your cookies'")

  // Check dialog
  const dialog = await page.evaluate(() => {
    const d = document.querySelector("[role='dialog']")
    if (!d) return null
    return {
      rect: d.getBoundingClientRect(),
      title: d.querySelector("h1, h2, h3")?.textContent?.trim(),
      switches: Array.from(d.querySelectorAll("button[role='switch']")).map(s => ({
        checked: s.getAttribute("aria-checked"),
        disabled: s.disabled,
      })),
    }
  })
  console.log("Dialog after click:", JSON.stringify(dialog, null, 2))
}

await browser.close()
