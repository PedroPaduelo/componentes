import { chromium } from "playwright"

const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console.error: ${m.text()}`)
  })
  await page.goto("http://localhost:5173/components/code-block", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  })
  await page.waitForTimeout(2500)
  const info = await page.evaluate(() => {
    const root = document.querySelector("[data-slot=code-block]")
    const all = document.querySelectorAll("[data-slot=code-block]")
    const tabs = document.querySelectorAll("[data-slot=code-block-tabs]")
    const headers = document.querySelectorAll("[data-slot=code-block-header]")
    const copies = document.querySelectorAll("[data-slot=code-block-copy]")
    const lines = document.querySelectorAll("[data-slot=code-block-content] [data-line]")
    const tabButtons = document.querySelectorAll("[data-slot=code-block-tab]")
    const notFound = document.body.textContent?.includes("não encontrado") || document.body.textContent?.includes("404") || false
    return {
      ok: !!root,
      instances: all.length,
      tabs: tabs.length,
      headers: headers.length,
      copies: copies.length,
      lines: lines.length,
      tabButtons: tabButtons.length,
      notFound,
      titleText: root?.textContent?.slice(0, 60),
    }
  })
  console.log(JSON.stringify({ info, errors }, null, 2))
  await page.screenshot({ path: "/tmp/code-block-page.png", fullPage: false })
  console.log("screenshot: /tmp/code-block-page.png")
} finally {
  await browser.close()
}
