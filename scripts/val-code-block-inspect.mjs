import { chromium } from "playwright"
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.goto("http://localhost:5173/components/code-block", { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.waitForTimeout(2500)
  const info = await page.evaluate(() => {
    const allRoots = Array.from(document.querySelectorAll("[data-slot=code-block]"))
    return {
      count: allRoots.length,
      perInstance: allRoots.map((r, i) => {
        const content = r.querySelector("[data-slot=code-block-content]")
        const lines = content ? content.querySelectorAll("[data-line]").length : 0
        return {
          i,
          language: r.getAttribute("data-language"),
          tabs: r.getAttribute("data-tabs"),
          contentLines: lines,
          textStart: r.textContent?.slice(0, 40),
        }
      }),
    }
  })
  console.log(JSON.stringify(info, null, 2))
} finally {
  await browser.close()
}
