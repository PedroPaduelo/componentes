// Validação Playwright do Tooltip Card: hover faz o tooltip flutuante aparecer
// e seguir o cursor; mouseout faz desaparecer. Testa light E dark.
import { chromium } from "playwright"

const URL = "http://localhost:5173/components/tooltip-card"

async function run(theme) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1200)

  // Trigger: o primeiro [data-slot=tooltip-card] do preview
  const trigger = page.locator("[data-slot='tooltip-card']").first()
  await trigger.waitFor({ state: "visible", timeout: 5000 })

  // Estado inicial: nenhum motion.div flutuante (pointer-events-none absolute z-50)
  const floatingSel = "[data-slot='tooltip-card'] .z-50.absolute, [data-slot='tooltip-card'] .absolute.z-50"
  const before = await page.locator("[data-slot='tooltip-card'] >> .z-50").count()

  // Hover no trigger
  const box = await trigger.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.waitForTimeout(600)
  const visibleAfterHover = await page.locator("[data-slot='tooltip-card'] >> .z-50").count()
  // captura top/left aplicados
  const pos1 = await page.evaluate(() => {
    const f = document.querySelector("[data-slot='tooltip-card'] .z-50")
    return f ? { top: f.style.top, left: f.style.left } : null
  })

  // Move o cursor dentro do trigger -> posição deve mudar (segue o cursor)
  await page.mouse.move(box.x + box.width / 2 + 8, box.y + box.height / 2 + 4)
  await page.waitForTimeout(300)
  const pos2 = await page.evaluate(() => {
    const f = document.querySelector("[data-slot='tooltip-card'] .z-50")
    return f ? { top: f.style.top, left: f.style.left } : null
  })

  // Mouseout -> desaparece
  await page.mouse.move(10, 10)
  await page.waitForTimeout(700)
  const afterOut = await page.locator("[data-slot='tooltip-card'] >> .z-50").count()

  const follows = pos1 && pos2 && (pos1.top !== pos2.top || pos1.left !== pos2.left)
  const result = {
    theme,
    before,
    visibleAfterHover,
    pos1,
    pos2,
    follows,
    afterOut,
    pass: before === 0 && visibleAfterHover >= 1 && follows && afterOut === 0,
  }
  console.log(JSON.stringify(result, null, 2))
  await browser.close()
  return result.pass
}

const light = await run("light")
const dark = await run("dark")
console.log(`\nLIGHT: ${light ? "PASS" : "FAIL"} | DARK: ${dark ? "PASS" : "FAIL"}`)
process.exit(light && dark ? 0 : 1)
