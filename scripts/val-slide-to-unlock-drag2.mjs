// scripts/val-slide-to-unlock-drag2.mjs
// Re-faz o drag com mais instrumentação: pega transform do handle, opacity do text, data-dragging
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const OUT = "shots/slide-to-unlock"
const VITRINE_URL = "http://localhost:5173/components/slide-to-unlock"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const pV = await ctx.newPage()
await pV.addInitScript(() => {
  try { localStorage.setItem("vitrine-theme", "light") } catch (e) {}
})
await pV.goto(VITRINE_URL, { waitUntil: "networkidle", timeout: 45000 })
await pV.waitForTimeout(3000)

// Acha o handle
const rects = await pV.evaluate(() => {
  const handle = document.querySelector("[data-slot=handle]")
  const track = document.querySelector("[data-slot=track]")
  const wrap = document.querySelector("[data-slot=slide-to-unlock]")
  return {
    handle: handle?.getBoundingClientRect() ? (() => { const r = handle.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })() : null,
    track: track?.getBoundingClientRect() ? (() => { const r = track.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })() : null,
    wrap: wrap?.getBoundingClientRect() ? (() => { const r = wrap.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })() : null,
  }
})
console.log("Rects:", JSON.stringify(rects, null, 2))

const sx = rects.handle.x + rects.handle.w / 2
const sy = rects.handle.y + rects.handle.h / 2
const tx = rects.track.x
const ty = rects.track.y + rects.track.h / 2
const span = rects.track.w - rects.handle.w  // quanto o handle pode andar

const probe = async (label) => {
  const info = await pV.evaluate(() => {
    const handle = document.querySelector("[data-slot=handle]")
    const text = document.querySelector("[data-slot=text]")
    const wrap = document.querySelector("[data-slot=slide-to-unlock]")
    return {
      handleTransform: handle?.style.transform || null,
      handleLeft: handle?.getBoundingClientRect()?.x || null,
      handleComputedLeft: handle ? getComputedStyle(handle).left : null,
      handleComputedTransform: handle ? getComputedStyle(handle).transform : null,
      textDataDragging: text?.getAttribute("data-dragging") || null,
      textOpacity: text?.style.opacity || null,
      textComputedOpacity: text ? getComputedStyle(text).opacity : null,
      wrapClass: wrap?.className?.toString()?.slice(0, 200) || null,
      bodyText: wrap?.textContent?.slice(0, 100) || null,
    }
  })
  console.log(`[${label}]`, JSON.stringify(info, null, 2))
  return info
}

await probe("0% antes")

// Inicia o drag
await pV.mouse.move(sx, sy)
await pV.waitForTimeout(150)
await pV.mouse.down()
await pV.waitForTimeout(150)

const states = []
const positions = [0, 0.25, 0.50, 0.75, 1.0]
for (let i = 0; i < positions.length; i++) {
  const p = positions[i]
  const targetX = tx + span * p
  // Vários passos
  const steps = 12
  const fromX = i === 0 ? sx : (tx + span * positions[i-1])
  for (let s = 1; s <= steps; s++) {
    const t = s / steps
    const x = fromX + (targetX - fromX) * t
    await pV.mouse.move(x, ty)
    await pV.waitForTimeout(15)
  }
  await pV.waitForTimeout(250)
  const info = await probe(`${(p * 100).toFixed(0)}% arrastando`)
  states.push({ pct: p, ...info })
  // Screenshot durante o drag (mouse ainda pressionado)
  await pV.screenshot({ path: `${OUT}/vitrine-light-drag2-${(p * 100).toFixed(0)}.png`, fullPage: false })
}

// Solta
await pV.mouse.up()
await pV.waitForTimeout(800)
await probe("100% soltou (after mouseup)")
await pV.screenshot({ path: `${OUT}/vitrine-light-drag2-unlocked.png`, fullPage: false })

writeFileSync(`${OUT}/drag2-summary.json`, JSON.stringify({ rects, span, states }, null, 2))
console.log("done")
await pV.close()
await browser.close()
