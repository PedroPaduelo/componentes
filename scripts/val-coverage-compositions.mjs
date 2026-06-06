import { chromium } from "playwright"

const base = "http://localhost:5173/compositions"
const checks = [
  {
    slug: "landing-page",
    must: { "glow-card-grid": 1, "glow-card": 3 },
  },
  {
    slug: "pricing-page",
    must: { "scales-container": 1, scales: 1 },
  },
  {
    slug: "saas-dashboard",
    must: { tree: 1, "toc-minimap": 1 },
  },
  {
    slug: "testimonials-wall",
    must: { "work-experience": 1 },
  },
]

const browser = await chromium.launch()
let failures = 0

for (const theme of ["light", "dark"]) {
  for (const c of checks) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.addInitScript((t) => {
      localStorage.setItem("vitrine-theme", t)
    }, theme)
    await page.goto(`${base}/${c.slug}`, { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(1500)

    const result = await page.evaluate((must) => {
      const out = {}
      for (const slot of Object.keys(must)) {
        out[slot] = document.querySelectorAll(`[data-slot="${slot}"]`).length
      }
      // tree height check
      const tree = document.querySelector('[data-slot="tree"]')
      out.__treeHeight = tree ? Math.round(tree.getBoundingClientRect().height) : null
      // page integrity: count any error overlay
      out.__hasViteError = !!document.querySelector("vite-error-overlay")
      return out
    }, c.must)

    let line = `[${theme}] ${c.slug}: `
    let ok = true
    for (const [slot, min] of Object.entries(c.must)) {
      const got = result[slot]
      const pass = got >= min
      if (!pass) ok = false
      line += `${slot}=${got}(>=${min}:${pass ? "OK" : "FAIL"}) `
    }
    if (result.__treeHeight !== null) {
      const hOk = result.__treeHeight > 0
      if (!hOk) ok = false
      line += `treeH=${result.__treeHeight}(${hOk ? "OK" : "FAIL"}) `
    }
    if (result.__hasViteError) {
      ok = false
      line += "VITE_ERROR "
    }
    if (!ok) failures++
    console.log((ok ? "✓ " : "✗ ") + line)
    await ctx.close()
  }
}

await browser.close()
console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
