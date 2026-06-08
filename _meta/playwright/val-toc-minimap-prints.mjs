// scripts/val-toc-minimap-prints.mjs
// Prints adicionais com tema forçado (resolvendo problema do prefers-color-scheme)

import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots/toc-minimap", { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }

// Função: tira print com tema EXPLICITAMENTE setado no localStorage antes da navegação
async function forcedPrint(url, name, theme) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: theme, // força prefers-color-scheme do media query
  })
  const page = await ctx.newPage()
  // setar localStorage ANTES da navegação
  await page.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) { console.warn(`warn ${name}: ${e.message}`) }
  await page.waitForTimeout(3500)
  // Confirma o tema efetivo
  const actualTheme = await page.evaluate(() => ({
    cls: document.documentElement.classList.contains("dark") ? "dark" : "light",
    bg: getComputedStyle(document.body).backgroundColor,
  }))
  await page.screenshot({ path: `shots/toc-minimap/${name}.png`, fullPage: false })
  await browser.close()
  console.log(`✓ ${name} — tema efetivo: ${actualTheme.cls} bg=${actualTheme.bg}`)
  return actualTheme
}

const origLight = await forcedPrint("https://chanhdai.com/components/toc-minimap", "forced-original-light", "light")
const origDark  = await forcedPrint("https://chanhdai.com/components/toc-minimap", "forced-original-dark",  "dark")
const vitLight  = await forcedPrint("http://localhost:5173/components/toc-minimap", "forced-vitrine-light",  "light")
const vitDark   = await forcedPrint("http://localhost:5173/components/toc-minimap", "forced-vitrine-dark",   "dark")

console.log("DONE")
console.log("original.light =", origLight)
console.log("original.dark  =", origDark)
console.log("vitrine.light  =", vitLight)
console.log("vitrine.dark   =", vitDark)
