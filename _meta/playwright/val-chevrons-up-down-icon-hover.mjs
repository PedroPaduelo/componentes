// Validação focada em hover + click do ChevronsUpDownIcon
// Testa:
//   (a) hover: computed style (color) antes vs depois do hover
//   (b) click: data-state toggla closed → open → closed
//   (c) rotação 180° presente após click
//
// Uso: node scripts/val-chevrons-up-down-icon-hover.mjs
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "node:fs"

const OUT = "shots/chevrons-up-down-icon"
mkdirSync(OUT, { recursive: true })

const VITRINE = "http://localhost:5173/components/chevrons-up-down-icon"
const VP = { width: 1440, height: 900 }
const SLOT = "chevrons-up-down-icon"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VP })
const page = await ctx.newPage()

console.log(`→ goto ${VITRINE}`)
try {
  await page.goto(VITRINE, { waitUntil: "networkidle", timeout: 40000 })
} catch (e) {
  console.warn(`[warn] ${e.message}`)
}
await page.waitForTimeout(2000)

// 1. Conta quantas instâncias existem
const count = await page.locator(`[data-slot="${SLOT}"]`).count()
console.log(`→ ${count} instâncias de [data-slot="${SLOT}"]`)

if (count === 0) {
  console.error("✗ Nenhuma instância encontrada")
  await browser.close()
  process.exit(1)
}

// Pega a primeira instância (a do toggle)
const target = page.locator(`[data-slot="${SLOT}"]`).first()
await target.scrollIntoViewIfNeeded()
await page.waitForTimeout(300)

// 2. Estado inicial
const initial = await target.evaluate((el) => {
  const s = getComputedStyle(el)
  return {
    dataState: el.getAttribute("data-state"),
    transform: s.transform,
    rotation: s.rotate,
    color: s.color,
    className: el.getAttribute("class"),
  }
})
console.log(`→ initial: ${JSON.stringify(initial)}`)

if (initial.dataState !== "closed") {
  console.error(`✗ dataState inicial esperado "closed", recebeu "${initial.dataState}"`)
  await browser.close()
  process.exit(1)
}

// 3. HOVER: computa style antes, faz hover, computa depois
const beforeHover = { ...initial }
await target.hover()
await page.waitForTimeout(600)

const afterHover = await target.evaluate((el) => {
  const s = getComputedStyle(el)
  return {
    dataState: el.getAttribute("data-state"),
    transform: s.transform,
    rotation: s.rotate,
    color: s.color,
  }
})
console.log(`→ before hover: color=${beforeHover.color}`)
console.log(`→ after  hover: color=${afterHover.color}`)

const hoverColorChanged = beforeHover.color !== afterHover.color
console.log(`→ hover color changed: ${hoverColorChanged}`)

// Move mouse para fora pra garantir estado neutro
await page.mouse.move(0, 0)
await page.waitForTimeout(300)

// 4. CLICK 1: data-state deve ir para "open"
await target.click()
await page.waitForTimeout(500)
const afterClick1 = await target.evaluate((el) => {
  const s = getComputedStyle(el)
  return {
    dataState: el.getAttribute("data-state"),
    transform: s.transform,
    rotation: s.rotate,
  }
})
console.log(`→ after click 1: ${JSON.stringify(afterClick1)}`)

if (afterClick1.dataState !== "open") {
  console.error(`✗ dataState após click 1 esperado "open", recebeu "${afterClick1.dataState}"`)
  await browser.close()
  process.exit(1)
}
if (!afterClick1.rotation.includes("180")) {
  console.error(`✗ rotação após click 1 esperada "180deg", recebeu "${afterClick1.rotation}"`)
  await browser.close()
  process.exit(1)
}

// 5. CLICK 2: data-state deve voltar para "closed"
await target.click()
await page.waitForTimeout(500)
const afterClick2 = await target.evaluate((el) => {
  const s = getComputedStyle(el)
  return {
    dataState: el.getAttribute("data-state"),
    transform: s.transform,
    rotation: s.rotate,
  }
})
console.log(`→ after click 2: ${JSON.stringify(afterClick2)}`)

if (afterClick2.dataState !== "closed") {
  console.error(`✗ dataState após click 2 esperado "closed", recebeu "${afterClick2.dataState}"`)
  await browser.close()
  process.exit(1)
}
if (afterClick2.rotation !== "none" && !afterClick2.rotation.includes("0deg")) {
  console.error(`✗ rotação após click 2 esperada "none"/"0deg", recebeu "${afterClick2.rotation}"`)
  await browser.close()
  process.exit(1)
}

// 6. Resumo final
const report = {
  initial,
  hover: { before: beforeHover, after: afterHover, colorChanged: hoverColorChanged },
  click1: afterClick1,
  click2: afterClick2,
  assertions: {
    "AC1: data-state closed → open": afterClick1.dataState === "open",
    "AC2: data-state open → closed": afterClick2.dataState === "closed",
    "AC3: hover color changed": hoverColorChanged,
    "AC4: rotation 180° após click": afterClick1.rotation.includes("180"),
    "AC5: rotação reset após 2º click":
      afterClick2.rotation === "none" || afterClick2.rotation.includes("0deg"),
  },
}

writeFileSync(`${OUT}/val-hover-report.json`, JSON.stringify(report, null, 2))
console.log(`\n→ assertions:`)
for (const [k, v] of Object.entries(report.assertions)) {
  console.log(`  ${v ? "✓" : "✗"} ${k}`)
}

const allPassed = Object.values(report.assertions).every(Boolean)
console.log(`\n${allPassed ? "✅ ALL CHECKS PASSED" : "❌ SOME CHECKS FAILED"}`)

await browser.close()
process.exit(allPassed ? 0 : 1)
