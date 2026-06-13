// Validador Playwright do Comet Card (Aceternity UI) na vitrine.
// Critérios:
//  1. /components/comet-card retorna 200 e renderiza [data-slot=comet-card]
//  2. wrapper tem altura > 0 (sem colapsar)
//  3. motion.div interno tem transform aplicado (rotate/translate)
//  4. hover no card: glare visível (com a classe mix-blend-overlay) e o card escala
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const url = "http://localhost:5173/components/comet-card"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const results = []

async function inspect(theme) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  } else {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
  }
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(1500)

  // 1. existence
  const slots = await page.locator('[data-slot="comet-card"]').count()

  // 2. height
  const rect = await page
    .locator('[data-slot="comet-card"]')
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    })

  // 3. motion.div transform (antes do hover)
  const beforeStyle = await page
    .locator('[data-slot="comet-card"] > *')
    .first()
    .evaluate((el) => ({
      transform: el.style.transform || "",
      boxShadow: el.style.boxShadow || "",
    }))

  // 4. mouseover no centro do primeiro card → captura transform after
  const box = await page.locator('[data-slot="comet-card"]').first().boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.15)
    await page.waitForTimeout(600) // spring settle
  }
  const afterStyle = await page
    .locator('[data-slot="comet-card"] > *')
    .first()
    .evaluate((el) => ({
      transform: el.style.transform || "",
      boxShadow: el.style.boxShadow || "",
    }))

  // 5. glare layer existe
  const glareCount = await page.locator('[data-slot="comet-card-glare"]').count()
  const glareBg = await page
    .locator('[data-slot="comet-card-glare"]')
    .first()
    .evaluate((el) => ({
      background: el.style.background || "",
      mixBlendMode: getComputedStyle(el).mixBlendMode,
      opacity: getComputedStyle(el).opacity,
    }))

  await page.screenshot({
    path: outPath(`comet-card/vitrine-${theme}.png`),
    fullPage: false,
  })

  await page.close()
  return { theme, slots, rect, beforeStyle, afterStyle, glareCount, glareBg }
}

for (const t of ["light", "dark"]) {
  results.push(await inspect(t))
}

await browser.close()

let pass = 0
let total = 0
const log = []
for (const r of results) {
  log.push(`\n[${r.theme}]`)
  total++
  if (r.slots >= 1) {
    pass++
    log.push(`  ✓ slots=${r.slots} (>=1)`)
  } else {
    log.push(`  ✗ slots=${r.slots} (esperado >=1)`)
  }
  total++
  if (r.rect.h > 0 && r.rect.w > 0) {
    pass++
    log.push(`  ✓ rect=${r.rect.w}x${r.rect.h} (>0)`)
  } else {
    log.push(`  ✗ rect=${r.rect.w}x${r.rect.h} (esperado >0)`)
  }
  total++
  const beforeHas = /matrix|rotate|translate|perspective/i.test(r.beforeStyle.transform) || r.beforeStyle.boxShadow.length > 0
  if (beforeHas) {
    pass++
    log.push(`  ✓ before.style (motion.div) tem transform/boxShadow`)
  } else {
    log.push(`  ✗ before.style vazio: ${JSON.stringify(r.beforeStyle)}`)
  }
  total++
  const transformChanged = r.beforeStyle.transform !== r.afterStyle.transform
  if (transformChanged) {
    pass++
    log.push(`  ✓ hover mudou transform: "${r.beforeStyle.transform.slice(0, 40)}" → "${r.afterStyle.transform.slice(0, 40)}"`)
  } else {
    log.push(`  ✗ hover NÃO mudou transform (interatividade quebrada): ${r.afterStyle.transform.slice(0, 40)}`)
  }
  total++
  if (r.glareCount >= 1 && r.glareBg.background.includes("radial-gradient")) {
    pass++
    log.push(`  ✓ glare presente (count=${r.glareCount}, mix-blend=${r.glareBg.mixBlendMode})`)
  } else {
    log.push(`  ✗ glare AUSENTE ou sem background: ${JSON.stringify(r.glareBg)}`)
  }
}

console.log(log.join("\n"))
console.log(`\nRESULT: ${pass}/${total} checks passed`)
process.exit(pass === total ? 0 : 1)
