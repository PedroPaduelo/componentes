import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

for (const [label, url] of [
  ["ORIGINAL", "https://chanhdai.com/components/glow-card-grid"],
  ["VITRINE-LIGHT", "http://localhost:5173/components/glow-card-grid"],
]) {
  const page = await ctx.newPage()
  try { await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }) } catch (e) { console.warn(e.message) }
  await page.waitForTimeout(3000)

  const info = await page.evaluate(() => {
    const root = document.querySelector("[data-slot=glow-card-grid]")
    const card = document.querySelector("[data-slot=glow-card]")
    return {
      rootFound: !!root,
      rootClass: root?.className?.toString().slice(0, 300),
      rootPointerX: root ? getComputedStyle(root).getPropertyValue("--pointer-x") : null,
      rootPointerY: root ? getComputedStyle(root).getPropertyValue("--pointer-y") : null,
      rootMouseX: root ? getComputedStyle(root).getPropertyValue("--mouse-x") : null,
      cardFound: !!card,
      cardClass: card?.className?.toString().slice(0, 300),
      cardPointerX: card ? getComputedStyle(card).getPropertyValue("--pointer-x") : null,
      cardPointerY: card ? getComputedStyle(card).getPropertyValue("--pointer-y") : null,
      cardMouseX: card ? getComputedStyle(card).getPropertyValue("--mouse-x") : null,
      cardMouseY: card ? getComputedStyle(card).getPropertyValue("--mouse-y") : null,
      allSlots: Array.from(document.querySelectorAll("[data-slot]"))
        .map(el => el.getAttribute("data-slot"))
        .filter((v, i, a) => a.indexOf(v) === i),
    }
  })
  console.log(`[${label}]`, JSON.stringify(info, null, 2))
  await page.close()
}

await browser.close()
