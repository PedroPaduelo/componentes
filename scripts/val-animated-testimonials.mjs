// Validação Playwright — AnimatedTestimonials (Aceternity UI).
// Critérios:
//   1. [data-slot=animated-testimonials] renderiza, altura > 0
//   2. ≥3 testemunhos (imgs com src picsum)
//   3. Clicar no botão Next → nome ativo muda
//   4. Console 0 errors
//   5. Shots em shots/animated-testimonials-{light,dark}.png

import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots/animated-testimonials", { recursive: true })

const URL = "http://localhost:5173/components/animated-testimonials"
const errors = []

const browser = await chromium.launch()

async function probe(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text()
      // Ignora 404s de assets genéricos do Vite (favicon, etc) — não são do componente
      if (
        !text.includes("favicon") &&
        !text.includes("404 (Not Found)") &&
        !text.includes("Failed to load resource")
      ) {
        errors.push(`[${theme}] ${text}`)
      }
    }
  })
  page.on("pageerror", (err) => {
    errors.push(`[${theme}] pageerror: ${err.message}`)
  })

  if (theme === "dark") {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForSelector("[data-slot=animated-testimonials]", { timeout: 15000 })
  await page.waitForTimeout(2500)

  const slot = page.locator("[data-slot=animated-testimonials]").first()
  const slotCount = await page.locator("[data-slot=animated-testimonials]").count()
  const slotBox = await slot.boundingBox()

  const imgs = await slot.locator("img").evaluateAll((nodes) =>
    nodes.map((n) => ({
      src: n.getAttribute("src"),
      alt: n.getAttribute("alt"),
      naturalWidth: n.naturalWidth,
    })),
  )
  const picsumImgs = imgs.filter((i) => i.src && i.src.includes("picsum.photos"))

  const h3 = slot.locator("h3").first()
  const initialName = (await h3.textContent())?.trim() ?? ""

  // Encontra botão Next (ChevronRight tem aria-label "Próximo depoimento")
  const nextBtn = slot.locator('button[aria-label="Próximo depoimento"]').first()
  await nextBtn.click({ force: true })
  await page.waitForTimeout(700)
  const nextName = (await h3.textContent())?.trim() ?? ""

  // Clica Prev para confirmar o ciclo
  const prevBtn = slot.locator('button[aria-label="Depoimento anterior"]').first()
  await prevBtn.click({ force: true })
  await page.waitForTimeout(700)
  const prevName = (await h3.textContent())?.trim() ?? ""

  // Confirma que tem todos os exemplos renderizados (Basic + Autoplay + Long)
  const allSlots = await page.locator("[data-slot=animated-testimonials]").count()
  const allPicsum = await page
    .locator("[data-slot=animated-testimonials] img[src*='picsum.photos']")
    .count()

  await page.screenshot({
    path: `shots/animated-testimonials/animated-testimonials-${theme}.png`,
    fullPage: true,
    animations: "disabled",
    timeout: 15000,
  })

  await ctx.close()

  return {
    theme,
    slotCount,
    slotBox,
    picsumImgCount: picsumImgs.length,
    allSlots,
    allPicsum,
    initialName,
    nextName,
    prevName,
    nextChanged: nextName !== initialName,
    prevChanged: prevName !== nextName,
  }
}

const light = await probe("light")
const dark = await probe("dark")
await browser.close()

const summary = { light, dark, consoleErrors: errors }
console.log(JSON.stringify(summary, null, 2))

const checks = [
  ["light: slotCount >= 1", light.slotCount >= 1],
  ["light: slotBox h > 0", (light.slotBox?.height ?? 0) > 0],
  ["light: picsumImgCount >= 3 (no 1º exemplo)", light.picsumImgCount >= 3],
  ["light: nextChanged", light.nextChanged],
  ["light: prevChanged", light.prevChanged],
  ["light: allSlots >= 3 (3 exemplos)", light.allSlots >= 3],
  ["light: allPicsum >= 11 (3+3+5)", light.allPicsum >= 11],
  ["dark: slotCount >= 1", dark.slotCount >= 1],
  ["dark: slotBox h > 0", (dark.slotBox?.height ?? 0) > 0],
  ["dark: picsumImgCount >= 3", dark.picsumImgCount >= 3],
  ["dark: nextChanged", dark.nextChanged],
  ["dark: prevChanged", dark.prevChanged],
  ["dark: allSlots >= 3", dark.allSlots >= 3],
  ["dark: allPicsum >= 11", dark.allPicsum >= 11],
  ["console 0 errors", errors.length === 0],
]

console.log("\n=== CHECKS ===")
let allOk = true
for (const [name, ok] of checks) {
  console.log(`${ok ? "✅" : "❌"} ${name}`)
  if (!ok) allOk = false
}
console.log(`\n=== RESULT: ${allOk ? "PASS" : "FAIL"} ===`)
process.exit(allOk ? 0 : 1)
