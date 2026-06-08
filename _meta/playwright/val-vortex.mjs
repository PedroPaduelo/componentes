import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const result = { canvasPresent: false, animated: false, rafLeak: null }

await page.goto("http://localhost:5173/components/vortex", { waitUntil: "domcontentloaded", timeout: 30000 })
await page.waitForSelector("[data-slot=vortex] canvas", { timeout: 15000 })
await page.waitForTimeout(1500)

// 1. canvas presente dentro de [data-slot=vortex]
const canvasCount = await page.evaluate(() =>
  document.querySelectorAll("[data-slot=vortex] canvas").length,
)
result.canvasPresent = canvasCount > 0
result.canvasCount = canvasCount

// 2. animação ativa — capturar 2 frames do canvas e comparar pixels
const frameDiff = await page.evaluate(async () => {
  const canvas = document.querySelector("[data-slot=vortex] canvas")
  if (!canvas) return { ok: false, reason: "no canvas" }
  const grab = () => {
    const c = document.createElement("canvas")
    c.width = canvas.width
    c.height = canvas.height
    const cx = c.getContext("2d")
    cx.drawImage(canvas, 0, 0)
    return cx.getImageData(0, 0, Math.min(400, c.width), Math.min(400, c.height)).data
  }
  const a = grab()
  await new Promise((r) => setTimeout(r, 500))
  const b = grab()
  let diff = 0
  for (let i = 0; i < a.length; i += 4) {
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) diff++
  }
  return { ok: true, diffPixels: diff, total: a.length / 4 }
})
result.frameDiff = frameDiff
result.animated = frameDiff.ok && frameDiff.diffPixels > 0

// 3. leak de rAF observável via navegação SPA (sem reload): patch contadores,
// navega para home pelo router (link interno) e checa se cancelAnimationFrame foi chamado
await page.evaluate(() => {
  window.__raf = { req: 0, cancel: 0 }
  const origReq = window.requestAnimationFrame.bind(window)
  const origCancel = window.cancelAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => {
    window.__raf.req++
    return origReq(cb)
  }
  window.cancelAnimationFrame = (id) => {
    window.__raf.cancel++
    return origCancel(id)
  }
})
// navegar via router SPA (não goto) para desmontar o Vortex sem reload
const navigated = await page.evaluate(() => {
  const link = document.querySelector("a[href='/']") || document.querySelector("header a")
  if (link) {
    link.click()
    return true
  }
  return false
})
await page.waitForTimeout(1000)
const rafStats = await page.evaluate(() => window.__raf || null)
const stillMounted = await page.evaluate(() =>
  document.querySelectorAll("[data-slot=vortex] canvas").length,
)
result.navigated = navigated
result.rafLeak = rafStats
result.vortexStillMountedAfterNav = stillMounted
// cleanup OK se: ainda capturou pelo menos 1 cancelAnimationFrame após desmontar
result.cleanupObserved = rafStats && rafStats.cancel > 0

console.log(JSON.stringify(result, null, 2))
await browser.close()
