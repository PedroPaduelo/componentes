// scripts/val-slide-to-unlock-drag3.mjs
// Tenta drag usando API do Playwright + instrumentação adicional via console listener
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const OUT = "shots/slide-to-unlock"
const VITRINE_URL = "http://localhost:5173/components/slide-to-unlock"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const pV = await ctx.newPage()
const consoleMsgs = []
pV.on("console", (msg) => {
  consoleMsgs.push(`[${msg.type()}] ${msg.text()}`)
})

await pV.addInitScript(() => {
  try { localStorage.setItem("vitrine-theme", "light") } catch (e) {}
})
await pV.goto(VITRINE_URL, { waitUntil: "networkidle", timeout: 45000 })
await pV.waitForTimeout(3000)

// Injeta um listener global que conta mousemove no window
await pV.evaluate(() => {
  window.__moves = 0
  window.__downs = 0
  window.__ups = 0
  window.addEventListener("mousemove", () => { window.__moves++ }, { capture: true })
  window.addEventListener("mousedown", () => { window.__downs++ }, { capture: true })
  window.addEventListener("mouseup", () => { window.__ups++ }, { capture: true })
})

// Pega rects
const rects = await pV.evaluate(() => {
  const handle = document.querySelector("[data-slot=handle]")
  const track = document.querySelector("[data-slot=track]")
  return {
    handle: handle?.getBoundingClientRect() ? (() => { const r = handle.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })() : null,
    track: track?.getBoundingClientRect() ? (() => { const r = track.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })() : null,
  }
})
console.log("Rects:", JSON.stringify(rects, null, 2))

const handle = pV.locator("[data-slot=handle]").first()
const tx = rects.track.x
const ty = rects.track.y + rects.track.h / 2
const span = rects.track.w - rects.handle.w

// Estratégia: usa bounding box do handle e arrastra até 50% e depois 100%
console.log("=== TEST: drag handle 0 → 50% → 100% ===")

// Pos inicial do mouse: centro do handle
const sx = rects.handle.x + rects.handle.w / 2
const sy = rects.handle.y + rects.handle.h / 2

// mousedown
await pV.mouse.move(sx, sy, { steps: 5 })
await pV.waitForTimeout(200)
await pV.mouse.down()
await pV.waitForTimeout(300)

// arrastar pra 50% em passos
const t50 = tx + span * 0.50
for (let i = 1; i <= 20; i++) {
  const t = i / 20
  const x = sx + (t50 - sx) * t
  await pV.mouse.move(x, ty, { steps: 1 })
  await pV.waitForTimeout(20)
}
await pV.waitForTimeout(500)

const probe = async (label) => {
  const info = await pV.evaluate(() => {
    const handle = document.querySelector("[data-slot=handle]")
    const text = document.querySelector("[data-slot=text]")
    return {
      handleTransform: handle?.style.transform,
      handleComputedTransform: getComputedStyle(handle).transform,
      textDataDragging: text?.getAttribute("data-dragging"),
      textOpacity: text?.style.opacity,
      globalMoves: window.__moves,
      globalDowns: window.__downs,
      globalUps: window.__ups,
    }
  })
  console.log(`[${label}]`, JSON.stringify(info, null, 2))
  return info
}

await probe("depois de drag 50%")
await pV.screenshot({ path: `${OUT}/vitrine-light-drag3-50.png`, fullPage: false })

// Continua pra 100%
const t100 = tx + span * 0.99
for (let i = 1; i <= 20; i++) {
  const t = i / 20
  const x = t50 + (t100 - t50) * t
  await pV.mouse.move(x, ty, { steps: 1 })
  await pV.waitForTimeout(20)
}
await pV.waitForTimeout(500)

await probe("depois de drag 100%")
await pV.screenshot({ path: `${OUT}/vitrine-light-drag3-100.png`, fullPage: false })

// mouseup
await pV.mouse.up()
await pV.waitForTimeout(1000)
await probe("depois de mouseup (unlocked)")
await pV.screenshot({ path: `${OUT}/vitrine-light-drag3-unlocked.png`, fullPage: false })

// Verifica se bodyText mudou
const finalText = await pV.evaluate(() => {
  const wrap = document.querySelector("[data-slot=slide-to-unlock]")
  return wrap?.textContent
})
console.log("bodyText final do primeiro wrap:", finalText)

// Pega TODOS os wraps e seus textos
const allTexts = await pV.evaluate(() => {
  return Array.from(document.querySelectorAll("[data-slot=slide-to-unlock]")).map((w) => w.textContent)
})
console.log("Todos os textos:", JSON.stringify(allTexts, null, 2))

// Pega TODOS os handles e seus transforms
const allHandles = await pV.evaluate(() => {
  return Array.from(document.querySelectorAll("[data-slot=handle]")).map((h) => ({
    transform: h.style.transform,
    computedTransform: getComputedStyle(h).transform,
    rect: h.getBoundingClientRect(),
  }))
})
console.log("Todos os handles:", JSON.stringify(allHandles, null, 2))

writeFileSync(`${OUT}/drag3-summary.json`, JSON.stringify({
  consoleMsgs: consoleMsgs.slice(0, 50),
  allTexts,
  allHandles,
}, null, 2))

await pV.close()
await browser.close()
console.log("done")
