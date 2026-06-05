// scripts/inspect-glow-deep.mjs
// Inspeção profunda (recursiva) do glow-card-grid ncdai vs vitrine,
// com mouse hover em diferentes posições para ver o glow.
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "node:fs"

mkdirSync("shots/glow-deep", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function inspect(url, label, opts = {}) {
  const page = await ctx.newPage()
  if (opts.dark) {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`warn ${label}: ${e.message}`)
  }
  await page.waitForTimeout(2500)

  // ─── 1) capture state with NO mouse (just navigation) ───
  const noMouse = await captureState(page, "no-mouse")
  await page.screenshot({ path: `shots/glow-deep/${label}-no-mouse.png`, fullPage: false })

  // ─── 2) move mouse to center of first card ───
  const cards = await page.$$("[data-slot='glow-card']")
  if (cards.length > 0) {
    const c0 = await cards[0].boundingBox()
    if (c0) {
      const cx = c0.x + c0.width / 2
      const cy = c0.y + c0.height / 2
      await page.mouse.move(cx, cy)
      await page.waitForTimeout(500)
      const centerMouse = await captureState(page, "center-mouse")
      await page.screenshot({ path: `shots/glow-deep/${label}-center-mouse.png`, fullPage: false })

      // ─── 3) move to top-left of first card ───
      await page.mouse.move(c0.x + 20, c0.y + 20)
      await page.waitForTimeout(500)
      const tlMouse = await captureState(page, "tl-mouse")
      await page.screenshot({ path: `shots/glow-deep/${label}-tl-mouse.png`, fullPage: false })

      // ─── 4) move out ───
      await page.mouse.move(10, 10)
      await page.waitForTimeout(500)
      const outMouse = await captureState(page, "out-mouse")
      await page.screenshot({ path: `shots/glow-deep/${label}-out-mouse.png`, fullPage: false })

      return { noMouse, centerMouse, tlMouse, outMouse }
    }
  }
  await page.close()
  return { noMouse }
}

async function captureState(page, label) {
  return await page.evaluate((label) => {
    const card = document.querySelector("[data-slot='glow-card']")
    if (!card) return { error: "no card" }
    const cs = getComputedStyle(card)
    const rect = card.getBoundingClientRect()

    // Get all descendants recursively
    function describe(el, depth = 0) {
      if (depth > 4) return null
      const r = el.getBoundingClientRect()
      const c = getComputedStyle(el)
      return {
        tag: el.tagName,
        className: typeof el.className === "string" ? el.className : "",
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        cssVars: (() => {
          const vars = {}
          for (let i = 0; i < c.length; i++) {
            const n = c[i]
            if (n.startsWith("--card-") || n.startsWith("--pointer-")) vars[n] = c.getPropertyValue(n).trim()
          }
          return vars
        })(),
        transform: c.transform,
        filter: c.filter,
        opacity: c.opacity,
        backdropFilter: c.backdropFilter || c.getPropertyValue("-webkit-backdrop-filter"),
        children: Array.from(el.children).map((c) => describe(c, depth + 1)),
      }
    }

    // pointer-x/y on the card
    return {
      label,
      cardPointerX: cs.getPropertyValue("--pointer-x").trim(),
      cardPointerY: cs.getPropertyValue("--pointer-y").trim(),
      cardRect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
      tree: describe(card),
    }
  }, label)
}

// ─── run ───
const ncdaiLight = await inspect("https://chanhdai.com/components/glow-card-grid", "ncdai-light")
const vitrineLight = await inspect("http://localhost:5173/components/glow-card-grid", "vitrine-light")
const vitrineDark = await inspect("http://localhost:5173/components/glow-card-grid", "vitrine-dark", { dark: true })

writeFileSync("shots/glow-deep/ncdai-light.json", JSON.stringify(ncdaiLight, null, 2))
writeFileSync("shots/glow-deep/vitrine-light.json", JSON.stringify(vitrineLight, null, 2))
writeFileSync("shots/glow-deep/vitrine-dark.json", JSON.stringify(vitrineDark, null, 2))

console.log("✓ shots/glow-deep/*.json")
await browser.close()
console.log("done")
