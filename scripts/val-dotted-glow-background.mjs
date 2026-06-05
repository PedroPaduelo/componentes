// Validação visual — Dotted Glow Background.
// Confirma: canvas com w/h>0, animação (2 frames diferentes), cor muda light/dark.
import { chromium } from "playwright"

const URL = "http://localhost:5173/components/dotted-glow-background"
const SEL = "[data-slot=dotted-glow-background] canvas"

const browser = await chromium.launch()

async function probe(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForSelector(SEL, { state: "attached", timeout: 15000 })
  await page.waitForTimeout(1200)

  const dims = await page.$eval(SEL, (c) => ({ w: c.width, h: c.height }))

  // frame 1
  const f1 = await page.$eval(SEL, (c) => c.toDataURL())
  await page.waitForTimeout(300)
  const f2 = await page.$eval(SEL, (c) => c.toDataURL())

  // amostra de cor: pega pixel mais brilhante do canvas
  const sample = await page.$eval(SEL, (c) => {
    const ctx = c.getContext("2d")
    const { data } = ctx.getImageData(0, 0, c.width, c.height)
    let best = [0, 0, 0, 0]
    let bestA = -1
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > bestA) {
        bestA = data[i + 3]
        best = [data[i], data[i + 1], data[i + 2], data[i + 3]]
      }
    }
    return best
  })

  await ctx.close()
  return { theme, dims, animated: f1 !== f2, sample }
}

const light = await probe("light")
const dark = await probe("dark")
await browser.close()

const colorChanged =
  JSON.stringify(light.sample.slice(0, 3)) !==
  JSON.stringify(dark.sample.slice(0, 3))

console.log(JSON.stringify({ light, dark, colorChanged }, null, 2))

const ok =
  light.dims.w > 0 &&
  light.dims.h > 0 &&
  light.animated &&
  dark.animated &&
  colorChanged
console.log(ok ? "\nRESULT: PASS" : "\nRESULT: FAIL")
process.exit(ok ? 0 : 1)
