import { chromium } from "playwright"

const URL = "http://localhost:5173/components/svg-mask-effect"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function run(theme) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1200)

  const wrap = page.locator("[data-slot=svg-mask-effect]").first()
  const present = (await wrap.count()) > 0
  if (!present) {
    console.log(`[${theme}] FAIL: [data-slot=svg-mask-effect] não encontrado`)
    await page.close()
    return
  }

  // Camada mascarada = primeiro filho motion.div com maskSize
  const masked = wrap.locator("> div").first()

  const box = await wrap.boundingBox()
  // Estado repouso
  const restSize = await masked.evaluate((el) => getComputedStyle(el).maskSize || getComputedStyle(el).webkitMaskSize)
  const restPos = await masked.evaluate((el) => getComputedStyle(el).maskPosition || getComputedStyle(el).webkitMaskPosition)

  // Hover + mover mouse
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 + 20)
  await page.waitForTimeout(600)
  const hoverSize = await masked.evaluate((el) => getComputedStyle(el).maskSize || getComputedStyle(el).webkitMaskSize)
  const posA = await masked.evaluate((el) => getComputedStyle(el).maskPosition || getComputedStyle(el).webkitMaskPosition)

  // Mover de novo p/ confirmar que a posição segue o cursor
  await page.mouse.move(box.x + box.width / 4, box.y + box.height / 4)
  await page.waitForTimeout(400)
  const posB = await masked.evaluate((el) => getComputedStyle(el).maskSize || getComputedStyle(el).webkitMaskSize)
  const posBpos = await masked.evaluate((el) => getComputedStyle(el).maskPosition || getComputedStyle(el).webkitMaskPosition)

  const revealText = await wrap.locator(":scope > div").last().textContent()

  console.log(JSON.stringify({
    theme, present,
    restSize, restPos,
    hoverSize, posA,
    posBpos,
    grew: parseFloat(hoverSize) > parseFloat(restSize),
    positionFollows: posA !== posBpos,
    revealTextSnippet: (revealText || "").trim().slice(0, 40),
  }, null, 2))
  await page.close()
}

await run("light")
await run("dark")
await browser.close()
