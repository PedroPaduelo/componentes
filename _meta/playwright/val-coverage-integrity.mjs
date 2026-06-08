import { chromium } from "playwright"

const base = "http://localhost:5173/compositions"
// componentes pré-existentes que NÃO podem sumir (regressão)
const checks = [
  { slug: "landing-page", existing: ["wavy-background", "card-hover-effect"] },
  { slug: "pricing-page", existing: ["dotted-glow-background", "switch"] },
  { slug: "saas-dashboard", existing: ["table", "github-contributions"] },
  { slug: "testimonials-wall", existing: ["card-stack", "card-hover-effect"] },
]

const browser = await chromium.launch()
let failures = 0

for (const c of checks) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${base}/${c.slug}`, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1200)
  const counts = await page.evaluate((slots) => {
    const o = {}
    for (const s of slots) o[s] = document.querySelectorAll(`[data-slot="${s}"]`).length
    return o
  }, c.existing)
  let ok = true
  let line = `${c.slug}: `
  for (const s of c.existing) {
    const got = counts[s]
    const pass = got >= 1
    if (!pass) ok = false
    line += `${s}=${got}(${pass ? "OK" : "FAIL"}) `
  }
  if (!ok) failures++
  console.log((ok ? "✓ " : "✗ ") + line)
  await ctx.close()
}

await browser.close()
console.log(failures === 0 ? "\nNO REGRESSION" : `\n${failures} REGRESSIONS`)
process.exit(failures === 0 ? 0 : 1)
