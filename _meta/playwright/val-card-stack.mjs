import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const errors = []

async function probe(theme) {
  const page = await ctx.newPage()
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${theme}] ${m.text()}`)
  })
  if (theme === "dark") {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  await page.goto("http://localhost:5173/components/card-stack", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })
  await page.waitForFunction(
    () => {
      const s = document.querySelector("[data-slot=card-stack]")
      return s && s.children.length >= 3
    },
    { timeout: 15000 }
  )

  const snap = async () =>
    page.evaluate(() => {
      const stack = document.querySelector("[data-slot=card-stack]")
      const cards = Array.from(stack.children)
      return cards.map((c) => {
        const r = c.getBoundingClientRect()
        return {
          name: c.querySelector("p")?.textContent?.trim() ?? "?",
          top: Math.round(r.top),
          z: getComputedStyle(c).zIndex,
        }
      })
    })

  const before = await snap()
  await page.waitForTimeout(6000)
  const after = await snap()

  // Topmost card = highest zIndex
  const topOf = (arr) =>
    arr.reduce((a, b) => (Number(b.z) > Number(a.z) ? b : a)).name
  const changed = JSON.stringify(before) !== JSON.stringify(after)

  console.log(`[${theme}] cards=${before.length} topBefore="${topOf(before)}" topAfter="${topOf(after)}" rotated=${changed}`)
  await page.close()
  return { count: before.length, changed }
}

const light = await probe("light")
const dark = await probe("dark")
await browser.close()

console.log("console errors:", errors.length ? errors : "none")
const ok =
  light.count === 3 &&
  dark.count === 3 &&
  light.changed &&
  dark.changed &&
  errors.length === 0
console.log(ok ? "RESULT: PASS" : "RESULT: FAIL")
process.exit(ok ? 0 : 1)
