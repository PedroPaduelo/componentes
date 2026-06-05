// Validação: os transforms dos motion divs do ContainerScroll (Header translateY
// + Card rotateX/scale) devem mudar ao scrollar a área scrollável própria do
// example. Verifica em light e dark.
import { chromium } from "playwright"

const URL = (process.env.CSA_URL ?? "http://localhost:5173") + "/components/container-scroll-animation"
const browser = await chromium.launch()

async function run(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1400 } })
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1500)

  // garantir scroll no TOPO da área scrollável
  await page.evaluate((slot) => {
    const node = document.querySelector(slot)
    let p = node?.parentElement
    while (p) {
      const oy = getComputedStyle(p).overflowY
      if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) {
        p.scrollTop = 0
        return
      }
      p = p.parentElement
    }
  }, '[data-slot="container-scroll-animation"]')
  await page.waitForTimeout(600)

  // capturar transforms de TODOS os motion divs (com style transform) dentro do slot
  const snap = () =>
    page.evaluate((slot) => {
      const root = document.querySelector(slot)
      if (!root) return null
      const els = Array.from(root.querySelectorAll('[style*="transform"]'))
      return els.map((e) => getComputedStyle(e).transform)
    }, '[data-slot="container-scroll-animation"]')

  const before = await snap()

  // scroll incremental até o fim
  for (let i = 0; i < 8; i++) {
    await page.evaluate((slot) => {
      const node = document.querySelector(slot)
      let p = node?.parentElement
      while (p) {
        const oy = getComputedStyle(p).overflowY
        if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) {
          p.scrollTop += p.clientHeight * 0.5
          return
        }
        p = p.parentElement
      }
    }, '[data-slot="container-scroll-animation"]')
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(500)

  const after = await snap()
  await ctx.close()

  const changed =
    before &&
    after &&
    before.length === after.length &&
    before.some((t, i) => t !== after[i])

  console.log(`[${theme}] before=${JSON.stringify(before)}`)
  console.log(`[${theme}] after =${JSON.stringify(after)}`)
  console.log(`[${theme}] CHANGED=${changed}`)
  return !!changed
}

const lightOk = await run("light")
const darkOk = await run("dark")
await browser.close()
console.log(`\nRESULT: light=${lightOk} dark=${darkOk} => ${lightOk && darkOk ? "PASS" : "FAIL"}`)
process.exit(lightOk && darkOk ? 0 : 1)
