import { chromium } from "playwright"

const URL = "http://localhost:5173/components/background-ripple-effect"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function run(theme) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() =>
      localStorage.setItem("vitrine-theme", "dark")
    )
  }
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(1200)

  const result = await page.evaluate(() => {
    const root = document.querySelector("[data-slot=background-ripple-effect]")
    if (!root) return { ok: false, reason: "no [data-slot] root" }
    const cells = Array.from(root.querySelectorAll(".cell"))
    if (cells.length === 0) return { ok: false, reason: "no .cell rendered" }

    // borda visível: borderColor não-transparente
    const firstBorder = getComputedStyle(cells[0]).borderTopColor

    return {
      ok: true,
      cellCount: cells.length,
      firstBorder,
    }
  })

  if (!result.ok) {
    console.log(`[${theme}] FAIL: ${result.reason}`)
    await page.close()
    return false
  }

  // Clica numa célula central e inspeciona delays das vizinhas
  const clickInfo = await page.evaluate(() => {
    const root = document.querySelector("[data-slot=background-ripple-effect]")
    const cells = Array.from(root.querySelectorAll(".cell"))
    const target = cells[Math.floor(cells.length / 2)]
    target.click()
    return { total: cells.length }
  })
  await page.waitForTimeout(120)

  const rippleInfo = await page.evaluate(() => {
    const root = document.querySelector("[data-slot=background-ripple-effect]")
    const cells = Array.from(root.querySelectorAll(".cell"))
    const withAnim = cells.filter((c) =>
      c.className.includes("animate-cell-ripple")
    )
    // coleta --delay de uma amostra
    const delays = cells
      .map((c) => c.style.getPropertyValue("--delay"))
      .filter((d) => d && d.length > 0)
    const uniqueDelays = [...new Set(delays)]
    // confirma a animação está de fato aplicada via computed style
    const animName = withAnim.length
      ? getComputedStyle(withAnim[0]).animationName
      : "none"
    return {
      animatedCount: withAnim.length,
      distinctDelays: uniqueDelays.length,
      sampleDelays: uniqueDelays.slice(0, 6),
      computedAnimationName: animName,
    }
  })

  const pass =
    result.cellCount > 0 &&
    rippleInfo.animatedCount > 0 &&
    rippleInfo.distinctDelays > 1 &&
    rippleInfo.computedAnimationName.includes("cell-ripple")

  console.log(
    `[${theme}] cells=${result.cellCount} border=${result.firstBorder} | clicked total=${clickInfo.total} animated=${rippleInfo.animatedCount} distinctDelays=${rippleInfo.distinctDelays} animName=${rippleInfo.computedAnimationName} sampleDelays=${JSON.stringify(rippleInfo.sampleDelays)} => ${pass ? "PASS" : "FAIL"}`
  )
  await page.close()
  return pass
}

const light = await run("light")
const dark = await run("dark")
await browser.close()

console.log(`\nRESULT: light=${light ? "PASS" : "FAIL"} dark=${dark ? "PASS" : "FAIL"}`)
process.exit(light && dark ? 0 : 1)
