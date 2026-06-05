// Refaz o scrollStates do original no container CERTO (y=2041)
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "node:fs"
mkdirSync("shots/scroll-fade-effect", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
try {
  await page.goto("https://chanhdai.com/components/scroll-fade-effect", { waitUntil: "networkidle", timeout: 30000 })
} catch (e) {
  console.warn(`warn: ${e.message}`)
}
await page.waitForTimeout(4000)

// Setup: acha o container real
const setup = await page.evaluate(() => {
  const cands = Array.from(document.querySelectorAll(".scroll-fade-effect-y, [data-vertical]"))
  const real = cands.find(c => {
    const r = c.getBoundingClientRect()
    return r.height > 200 && r.height < 600
  }) || cands[0]
  if (!real) return { ok: false, reason: "no scroll-fade-effect-y found" }
  const uniq = `__orig_${Math.random().toString(36).slice(2, 8)}`
  real.dataset.origId = uniq
  real.scrollIntoView({ block: "center" })
  const r = real.getBoundingClientRect()
  return {
    ok: true,
    uniq,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    scrollHeight: real.scrollHeight,
    clientHeight: real.clientHeight,
    maskImage: getComputedStyle(real).maskImage || getComputedStyle(real).webkitMaskImage,
  }
})
console.log("Setup original real:", JSON.stringify(setup, null, 2))
if (!setup.ok) { await browser.close(); process.exit(1) }

await page.waitForTimeout(500)
await page.evaluate((u) => {
  const el = document.querySelector(`[data-orig-id="${u}"]`)
  if (el) el.scrollTop = 0
}, setup.uniq)
await page.waitForTimeout(500)

async function getState() {
  return await page.evaluate((u) => {
    const el = document.querySelector(`[data-orig-id="${u}"]`)
    if (!el) return null
    const before = getComputedStyle(el, "::before")
    const after = getComputedStyle(el, "::after")
    return {
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      atTop: el.scrollTop === 0,
      atBottom: (el.scrollHeight - el.clientHeight - el.scrollTop) < 1,
      before: { opacity: before.opacity, content: before.content, background: before.backgroundImage?.slice(0, 200) },
      after: { opacity: after.opacity, content: after.content, background: after.backgroundImage?.slice(0, 200) },
    }
  }, setup.uniq)
}

async function scrollTo(top) {
  await page.evaluate(({ u, top }) => {
    const el = document.querySelector(`[data-orig-id="${u}"]`)
    if (el) el.scrollTop = top
  }, { u: setup.uniq, top })
  await page.waitForTimeout(400)
}

// Estado 1: TOPO
await scrollTo(0)
const sTop = await getState()
await page.screenshot({ path: "shots/scroll-fade-effect/original-real-scroll-top.png" })
console.log("TOP state:", JSON.stringify(sTop))

// Estado 2: MEIO
const mid = Math.floor((setup.scrollHeight - setup.clientHeight) / 2)
await scrollTo(mid)
const sMid = await getState()
await page.screenshot({ path: "shots/scroll-fade-effect/original-real-scroll-middle.png" })
console.log("MID state:", JSON.stringify(sMid))

// Estado 3: FUNDO
const max = setup.scrollHeight - setup.clientHeight
await scrollTo(max)
const sBot = await getState()
await page.screenshot({ path: "shots/scroll-fade-effect/original-real-scroll-bottom.png" })
console.log("BOT state:", JSON.stringify(sBot))

writeFileSync("shots/scroll-fade-effect/scroll-states-original-real.json", JSON.stringify({ setup, sTop, sMid, sBot }, null, 2))

await browser.close()
console.log("✓ Done")
