import { chromium } from "playwright"
// Validação do LampEffect: render isolado (inject no DOM) pra inspecionar DOM e conic-gradients.
// 2 conic-gradients = 2 cones (esquerda/direita). height >= 512px = min-h-[32rem] OK.
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on("pageerror", e => errors.push("PAGEERROR: " + e.message))
page.on("console", m => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()) })

await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded", timeout: 30000 })
await page.waitForTimeout(2000)

const lampResult = await page.evaluate(async () => {
  const mod = await import("/src/components/ui/lamp-effect.tsx")
  const reactMod = await import("/node_modules/.vite/deps/react.js?v=" + Date.now()).catch(() => null)
  const reactDomMod = await import("/node_modules/.vite/deps/react-dom_client.js?v=" + Date.now()).catch(() => null)
  if (!reactMod || !reactDomMod) return { error: "react/react-dom not loadable" }
  const host = document.createElement("div")
  host.id = "lamp-test-host"
  host.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;background:#020617;"
  document.body.appendChild(host)
  const root = reactDomMod.default.createRoot(host)
  root.render(reactMod.default.createElement(mod.LampContainer, null,
    reactMod.default.createElement("h1", { className: "text-white text-4xl text-center" }, "Lâmpada Teste")))
  return { step: "rendered" }
})
console.log("RENDER:", JSON.stringify(lampResult))
await page.waitForTimeout(2500)

const info = await page.evaluate(() => {
  const lamp = document.querySelector("#lamp-test-host [data-slot='lamp-effect']")
  if (!lamp) return { ok: false, reason: "no lamp in host" }
  const r = lamp.getBoundingClientRect()
  const cones = lamp.querySelectorAll("div[style*='conic-gradient']").length
  const h1 = lamp.querySelector("h1")
  const bg = getComputedStyle(lamp).backgroundColor
  return { ok: true, w: Math.round(r.width), h: Math.round(r.height), cones, h1Text: h1?.textContent?.trim(), bg }
})
console.log("INFO:", JSON.stringify(info, null, 2))
console.log("ERRORS:", errors.length, errors)
await page.screenshot({ path: "shots/lamp-isolated.png", fullPage: false })
await browser.close()
