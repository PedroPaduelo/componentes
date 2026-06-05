// Inspect elastic-slider DOM: original chanhdai vs vitrine
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function inspect(url, label) {
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(3000)

  const info = await page.evaluate(() => {
    const result = { label: location.href, title: document.title }

    // Find elastic-slider elements
    const sliders = document.querySelectorAll("[data-slot=elastic-slider]")
    result.sliderCount = sliders.length
    result.sliders = Array.from(sliders).map((s) => {
      const r = s.getBoundingClientRect()
      const cs = getComputedStyle(s)
      const track = s.querySelector("[data-slot=elastic-slider-track]")
      const trackR = track ? track.getBoundingClientRect() : null
      const fill = s.querySelector("[data-slot=elastic-slider-fill]")
      const fillR = fill ? fill.getBoundingClientRect() : null
      const handle = s.querySelector("[data-slot=elastic-slider-handle]")
      const handleR = handle ? handle.getBoundingClientRect() : null
      const label = s.querySelector("[data-slot=elastic-slider-label]")
      const value = s.querySelector("[data-slot=elastic-slider-value]")
      return {
        rect: { w: Math.round(r.width), h: Math.round(r.height) },
        bg: cs.backgroundColor,
        color: cs.color,
        track: trackR ? { w: Math.round(trackR.width), h: Math.round(trackR.height) } : null,
        fill: fillR ? { w: Math.round(fillR.width) } : null,
        handle: handleR ? { w: Math.round(handleR.width), h: Math.round(handleR.height) } : null,
        labelText: label?.textContent?.trim(),
        valueText: value?.textContent?.trim(),
        ariaLabel: track?.getAttribute("aria-label"),
        ariaValueNow: track?.getAttribute("aria-valuenow"),
      }
    })

    return result
  })

  console.log(`[${label}]`, JSON.stringify(info, null, 2))
  await page.close()
  return info
}

await inspect("https://chanhdai.com/components/elastic-slider", "ORIGINAL")
await inspect("http://localhost:5173/components/elastic-slider", "VITRINE")
await browser.close()
