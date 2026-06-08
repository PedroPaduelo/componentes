// scripts/val-middle-truncation.mjs
// Validação visual do componente middle-truncation: chanhdai.com vs vitrine local.
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

const OUT = "shots/middle-truncation"
mkdirSync(OUT, { recursive: true })

const ORIGINAL = "https://chanhdai.com/components/middle-truncation"
const VITRINE = "http://localhost:5173/components/middle-truncation"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// ---------- helpers ----------

async function loadPage(url, theme) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`warn: ${url} (${theme}): ${e.message}`)
  }
  // chanhdai renders MDX components with delay
  await page.waitForTimeout(3500)
  return page
}

async function screenshot(page, name) {
  const path = `${OUT}/${name}.png`
  await page.screenshot({ path, fullPage: false })
  console.log(`✓ ${path}`)
}

async function inspect(page, name) {
  const data = await page.evaluate(() => {
    // Locate candidates: any element that LOOKS like the middle-truncation wrapper.
    // Strategy: find elements containing an ellipsis in the middle of text
    //   - container with attribute data-slot="middle-truncation"
    //   - or .truncate-middle / .middle-truncation class
    //   - or an element whose textContent contains '…' (real ellipsis) inside a text node
    const allEls = Array.from(document.querySelectorAll("*"))
    const candidates = allEls
      .filter((el) => {
        const txt = el.textContent || ""
        if (!el.children || el.children.length > 3) return false
        if (txt.length < 5 || txt.length > 200) return false
        // heuristic: contains real ellipsis or "..."
        return txt.includes("…") || txt.includes("...")
      })
      .slice(0, 10)
      .map((el) => {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        return {
          tag: el.tagName.toLowerCase(),
          cls: el.className?.toString().slice(0, 120) || "",
          dataSlot: el.getAttribute("data-slot"),
          dataAttrs: Object.fromEntries(
            Array.from(el.attributes)
              .filter((a) => a.name.startsWith("data-"))
              .map((a) => [a.name, a.value])
          ),
          text: el.textContent?.trim().slice(0, 80) || "",
          rect: {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
          },
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily.slice(0, 60),
          color: cs.color,
          bg: cs.backgroundColor,
          dir: cs.direction,
          textOverflow: cs.textOverflow,
          overflow: cs.overflow,
          whiteSpace: cs.whiteSpace,
        }
      })

    // Title / description
    const h1 = document.querySelector("h1")?.textContent?.trim() || ""
    const firstP = document.querySelector("p")?.textContent?.trim().slice(0, 120) || ""
    return {
      title: document.title,
      h1,
      firstP,
      bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 80),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyColor: getComputedStyle(document.body).color,
      candidates,
    }
  })
  writeFileSync(`${OUT}/${name}.json`, JSON.stringify(data, null, 2))
  console.log(`✓ ${OUT}/${name}.json (${data.candidates.length} candidates)`)
  return data
}

async function hoverAndShot(page, name) {
  // Try to find a candidate with ellipsis and hover.
  // Prefer [data-slot="middle-truncation"] specifically — otherwise the find
  // would hit the wrapper div (which has multiple children) and the mouse.move
  // would land on the gap between rows, missing the actual TooltipTrigger.
  const candidate = await page.evaluate(() => {
    const target =
      document.querySelector('[data-slot="middle-truncation"]') ||
      Array.from(document.querySelectorAll("*")).find((el) => {
        const txt = el.textContent || ""
        if (el.children?.length > 3) return false
        if (txt.length < 5 || txt.length > 200) return false
        return txt.includes("…") || txt.includes("...")
      })
    if (!target) return null
    const r = target.getBoundingClientRect()
    target.setAttribute("data-val-target", "1")
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }
  })
  if (!candidate) {
    console.log(`! ${name}: no ellipsis target found`)
    return
  }
  await page.mouse.move(candidate.x, candidate.y)
  await page.waitForTimeout(800)
  // Look for tooltip
  const tooltip = await page.evaluate(() => {
    const tooltips = Array.from(
      document.querySelectorAll(
        '[role="tooltip"], [data-slot="tooltip"], [data-radix-tooltip-content], .tooltip, [class*="tooltip" i]'
      )
    )
    return tooltips
      .map((t) => {
        const r = t.getBoundingClientRect()
        return {
          tag: t.tagName.toLowerCase(),
          cls: t.className?.toString().slice(0, 100) || "",
          text: t.textContent?.trim().slice(0, 120) || "",
          rect: { w: Math.round(r.width), h: Math.round(r.height) },
        }
      })
      .filter((t) => t.text.length > 0)
  })
  writeFileSync(`${OUT}/${name}-tooltip.json`, JSON.stringify(tooltip, null, 2))
  await screenshot(page, name)
  console.log(`  tooltips: ${tooltip.length}`)
}

// ---------- ORIGINAL ----------
console.log("== ORIGINAL (chanhdai.com) ==")
const origLight = await loadPage(ORIGINAL, "light")
await screenshot(origLight, "original-light")
const origData = await inspect(origLight, "inspect-original")
await hoverAndShot(origLight, "original-light-hover")
await origLight.close()

const origDark = await loadPage(ORIGINAL, "dark")
await screenshot(origDark, "original-dark")
await inspect(origDark, "inspect-original-dark")
await origDark.close()

// ---------- VITRINE ----------
console.log("== VITRINE (localhost) ==")
const vitLight = await loadPage(VITRINE, "light")
await screenshot(vitLight, "vitrine-light")
await inspect(vitLight, "inspect-vitrine-light")
await hoverAndShot(vitLight, "vitrine-light-hover")
await vitLight.close()

const vitDark = await loadPage(VITRINE, "dark")
await screenshot(vitDark, "vitrine-dark")
await inspect(vitDark, "inspect-vitrine-dark")
await vitDark.close()

await browser.close()
console.log("done")
