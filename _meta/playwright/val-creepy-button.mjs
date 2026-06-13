// scripts/val-creepy-button.mjs
// Valida o componente CreepyButton na vitrine.
// v2: slot.hover() antes do mouse.move, regex oklch para red-500,
//     blink capturado com várias medições em 3.5s.

import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const URL = "http://localhost:5173/components/creepy-button"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const results = { light: {}, dark: {} }

async function validate(theme) {
  const page = await ctx.newPage()
  const consoleErrors = []
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })

  if (theme === "dark") {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1500)

  // 1. slot renderiza
  const slot = page.locator("[data-slot='creepy-button']").first()
  const slotCount = await page.locator("[data-slot='creepy-button']").count()
  const slotText = await slot.textContent()

  // 2. texto children visível
  const isVisible = await slot.isVisible()
  const slotBg = await slot.evaluate((el) => getComputedStyle(el).backgroundColor)

  // Mouse positioning
  const slotBox = await slot.boundingBox()
  if (!slotBox) throw new Error("slot has no bounding box")
  const centerX = slotBox.x + slotBox.width / 2
  const centerY = slotBox.y + slotBox.height / 2

  // Reset: mouse leave
  await page.mouse.move(0, 0)
  await page.waitForTimeout(500)

  // Pupila locator (escopada ao primeiro slot)
  const pupil = page
    .locator("[data-slot='creepy-button']")
    .first()
    .locator("span.absolute.bg-black.rounded-full")
    .first()
  const pupilCenter = await pupil.evaluate((el) => getComputedStyle(el).transform)

  // 3. mouse move em 2 pontos — primeiro hover para o mouse entrar no slot
  await slot.hover()
  await page.waitForTimeout(150)
  const pupilAfterHover = await pupil.evaluate((el) => getComputedStyle(el).transform)

  // Agora mover dentro do slot para a esquerda
  await page.mouse.move(centerX - 50, centerY)
  await page.waitForTimeout(200)
  const pupilLeft = await pupil.evaluate((el) => getComputedStyle(el).transform)

  // Mover para a direita
  await page.mouse.move(centerX + 50, centerY)
  await page.waitForTimeout(200)
  const pupilRight = await pupil.evaluate((el) => getComputedStyle(el).transform)

  // 4. mouse leave -> reset
  await page.mouse.move(0, 0)
  await page.waitForTimeout(500)
  const pupilAfterLeave = await pupil.evaluate((el) => getComputedStyle(el).transform)

  // 5. hover -> cover rotaciona
  const cover = page
    .locator("[data-slot='creepy-button']")
    .first()
    .locator("span.absolute.bg-blue-500")
    .first()
  const coverBefore = await cover.evaluate((el) => getComputedStyle(el).transform)
  await slot.hover()
  await page.waitForTimeout(700)
  const coverAfter = await cover.evaluate((el) => getComputedStyle(el).transform)

  // 7. blink — medir altura a cada 50ms por 3500ms (1 ciclo + um pouco)
  // O blink é height: 0.75em -> 0.75em -> 0em -> 0.75em, com duration:3s, times [0, 0.92, 0.96, 1]
  // Ou seja, em 96%-100% (96ms) a altura é 0em
  const eyeBg = page
    .locator("[data-slot='creepy-button']")
    .first()
    .locator("span.bg-white.rounded-full")
    .first()
  const heights = []
  const start = Date.now()
  // Janela de 4500ms (1.5 ciclos de 3s) garante que pegamos pelo menos 1 blink
  // (blink dura 4% do ciclo = 120ms, é fácil perder com timing ruim)
  while (Date.now() - start < 4500) {
    const h = await eyeBg.evaluate((el) => el.getBoundingClientRect().height)
    heights.push(h)
    await page.waitForTimeout(50)
  }
  const minHeight = Math.min(...heights)
  const maxHeight = Math.max(...heights)
  const blinkHappened = maxHeight - minHeight > 1.0

  // 6. custom cover (2º example)
  let customCoverBg = null
  try {
    const secondSlot = page.locator("[data-slot='creepy-button']").nth(1)
    const customCoverCandidate = secondSlot
      .locator("span.absolute")
      .filter({ hasText: /Don't/i })
      .first()
    await customCoverCandidate.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    customCoverBg = await customCoverCandidate.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    )
  } catch (e) {
    customCoverBg = `not-found: ${e.message}`
  }

  await page.screenshot({
    path: outPath(`vitrine-creepy-button-${theme}.png`),
    fullPage: false,
  })

  results[theme] = {
    slotCount,
    slotText: slotText?.trim().slice(0, 50),
    isVisible,
    slotBg,
    pupilCenter,
    pupilAfterHover,
    pupilLeft,
    pupilRight,
    pupilAfterLeave,
    coverBefore,
    coverAfter,
    blinkHeights: { min: minHeight, max: maxHeight, samples: heights.length },
    blinkHappened,
    customCoverBg,
    consoleErrors,
  }

  await page.close()
}

await validate("light")
await validate("dark")

await browser.close()

console.log("\n=== LIGHT ===")
console.log(JSON.stringify(results.light, null, 2))
console.log("\n=== DARK ===")
console.log(JSON.stringify(results.dark, null, 2))

let ok = true
function assert(name, cond) {
  console.log(`${cond ? "✓" : "✗"} ${name}`)
  if (!cond) ok = false
}

// red-500 do Tailwind v4 = oklch(0.637 0.237 25.331) ou rgb equivalente
const RED_OKLCH = /oklch\(0\.637.*0\.237.*25/
const RED_RGB = /239,\s*68,\s*68/

for (const theme of ["light", "dark"]) {
  const r = results[theme]
  console.log(`\n--- [${theme}] ---`)
  assert(`[${theme}] 1. slot renderiza (3 examples)`, r.slotCount === 3)
  assert(`[${theme}] 2. texto visível`, r.isVisible)
  assert(
    `[${theme}] 3a. pupila move após hover: afterHover !== center`,
    r.pupilAfterHover !== r.pupilCenter,
  )
  assert(
    `[${theme}] 3b. pupila move: left !== center`,
    r.pupilLeft !== r.pupilCenter,
  )
  assert(
    `[${theme}] 3c. pupila move: right !== center`,
    r.pupilRight !== r.pupilCenter,
  )
  assert(`[${theme}] 3d. pupila: left !== right`, r.pupilLeft !== r.pupilRight)
  assert(
    `[${theme}] 4. mouse leave reset`,
    r.pupilAfterLeave === r.pupilCenter,
  )
  assert(
    `[${theme}] 5. cover rotaciona: after !== before`,
    r.coverAfter !== r.coverBefore,
  )
  assert(
    `[${theme}] 5b. cover transform contém rotate ou matrix`,
    /rotate/i.test(r.coverAfter) || /matrix/i.test(r.coverAfter),
  )
  assert(
    `[${theme}] 6. custom cover bg vermelho (oklch ou rgb)`,
    RED_OKLCH.test(r.customCoverBg) || RED_RGB.test(r.customCoverBg),
  )
  assert(
    `[${theme}] 7. blink: altura variou (min=${r.blinkHeights.min}, max=${r.blinkHeights.max})`,
    r.blinkHappened,
  )
  assert(`[${theme}] 8. zero erros no console`, r.consoleErrors.length === 0)
}

console.log(ok ? "\n✅ ALL CHECKS PASSED" : "\n❌ SOME CHECKS FAILED")
process.exit(ok ? 0 : 1)
