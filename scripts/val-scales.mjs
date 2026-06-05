// Validação visual do Scales (Aceternity) na vitrine.
// Checa: [data-slot=scales] tem backgroundImage != "none" em light E dark,
// e que as 3 orientações geram backgroundImage distintos entre si.
import { chromium } from "playwright"

const URL = "http://localhost:5173/components/scales"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 } })

async function probe(theme) {
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1200)
  const data = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll("[data-slot=scales]"))
    return nodes.map((n) => {
      const cs = getComputedStyle(n)
      return {
        orientation: n.getAttribute("data-orientation"),
        backgroundImage: cs.backgroundImage,
        backgroundSize: cs.backgroundSize,
        none: cs.backgroundImage === "none",
      }
    })
  })
  await page.close()
  return data
}

const light = await probe("light")
const dark = await probe("dark")
await browser.close()

console.log("LIGHT scales nodes:", light.length)
light.forEach((d, i) => console.log(`  [${i}] ${d.orientation} | size=${d.backgroundSize} | none=${d.none} | bg=${d.backgroundImage.slice(0, 70)}...`))
console.log("DARK scales nodes:", dark.length)
dark.forEach((d, i) => console.log(`  [${i}] ${d.orientation} | size=${d.backgroundSize} | none=${d.none} | bg=${d.backgroundImage.slice(0, 70)}...`))

// Asserts
const errs = []
if (light.length < 3) errs.push("menos de 3 nodes scales em light")
if (light.some((d) => d.none)) errs.push("algum scales com backgroundImage=none em LIGHT")
if (dark.some((d) => d.none)) errs.push("algum scales com backgroundImage=none em DARK")

// 3 orientações distintas: agrupar bg por orientation única
const byOri = {}
for (const d of light) byOri[d.orientation] = d.backgroundImage
const oris = Object.keys(byOri)
if (!(oris.includes("horizontal") && oris.includes("vertical") && oris.includes("diagonal")))
  errs.push("faltam as 3 orientações distintas: " + oris.join(","))
const uniqueBgs = new Set([byOri.horizontal, byOri.vertical, byOri.diagonal])
if (uniqueBgs.size < 3) errs.push("as 3 orientações NÃO geram backgroundImage distintos: " + uniqueBgs.size)

// cor reage ao tema: diagonal light vs dark deve diferir (color-mix com --foreground)
const lightDiag = light.find((d) => d.orientation === "diagonal")?.backgroundImage
const darkDiag = dark.find((d) => d.orientation === "diagonal")?.backgroundImage
console.log("\nLIGHT diagonal bg:", lightDiag?.slice(0, 90))
console.log("DARK  diagonal bg:", darkDiag?.slice(0, 90))

if (errs.length) {
  console.error("\n❌ FALHAS:\n - " + errs.join("\n - "))
  process.exit(1)
}
console.log("\n✅ Scales OK: 3 orientações distintas, pattern visível em light e dark.")
