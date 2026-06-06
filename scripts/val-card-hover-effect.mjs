import { chromium } from "playwright"

const URL = "http://localhost:5173/components/card-hover-effect"

const browser = await chromium.launch()

async function run(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(800)

  // Scope ao primeiro grid card-hover-effect
  const wrap = page.locator("[data-slot=card-hover-effect]").first()
  const cards = wrap.locator("> a")
  const n = await cards.count()

  // Função: qual índice de card contém o span de fundo (bg destacado)
  async function hoveredBgIndex() {
    return await wrap.evaluate((el) => {
      const links = Array.from(el.querySelectorAll(":scope > a"))
      // o fundo é um span com layoutId -> motion adiciona; identificamos pelo rounded-3xl/bg
      for (let i = 0; i < links.length; i++) {
        const span = links[i].querySelector("span")
        if (span) {
          const cs = getComputedStyle(span)
          // tem bg não-transparente
          if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") {
            return { idx: i, bg: cs.backgroundColor }
          }
        }
      }
      return { idx: -1, bg: null }
    })
  }

  const before = await hoveredBgIndex()

  // hover card 0
  await cards.nth(0).hover()
  await page.waitForTimeout(700)
  const a = await hoveredBgIndex()

  // mover pra fora e esperar exit
  await page.mouse.move(5, 5)
  await page.waitForTimeout(600)

  // hover card 2
  await cards.nth(2).hover()
  await page.waitForTimeout(900)
  const b = await hoveredBgIndex()

  console.log(`[${theme}] cards=${n} | before=${JSON.stringify(before)} | hoverCard0=${JSON.stringify(a)} | hoverCard2=${JSON.stringify(b)}`)

  const ok =
    n === 6 &&
    before.idx === -1 &&
    a.idx === 0 &&
    b.idx === 2 &&
    a.bg !== null
  console.log(`[${theme}] RESULT: ${ok ? "PASS" : "FAIL"}`)

  await ctx.close()
  return ok
}

const lightOk = await run("light")
const darkOk = await run("dark")
await browser.close()
console.log(`\nFINAL: light=${lightOk ? "PASS" : "FAIL"} dark=${darkOk ? "PASS" : "FAIL"}`)
process.exit(lightOk && darkOk ? 0 : 1)
