/**
 * Inspector mais inteligente: procura especificamente o code block.
 */
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "node:fs"

const OUT = "shots/code-block-command"
mkdirSync(OUT, { recursive: true })
const VIEWPORT = { width: 1440, height: 900 }
const browser = await chromium.launch()

async function inspectSmart(url, label, isVitrine, dark = false) {
  const ctx = await browser.newContext(VIEWPORT)
  const page = await ctx.newPage()
  if (isVitrine && dark) {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`[warn] goto: ${e.message}`)
  }
  await page.waitForTimeout(2500)

  // Find the actual code block by looking for <pre> elements with code content
  const data = await page.evaluate(() => {
    // Strategy 1: find <pre> with at least 50 chars of text and a copy button near it
    const pres = Array.from(document.querySelectorAll("pre"))
    const blocks = []
    for (const pre of pres) {
      const text = pre.textContent?.trim() || ""
      if (text.length < 5) continue
      // Look for a button (copy button) near or inside the parent
      const parent = pre.closest("[class*='relative'], [class*='code'], [class*='group']") || pre.parentElement
      const buttons = parent?.querySelectorAll("button") || []
      // Get the relevant wrapper (the one that contains both pre and button)
      const wrapper = pre.closest("div") || pre
      const rect = wrapper.getBoundingClientRect()
      if (rect.width < 100) continue // skip tiny wrappers

      const ws = getComputedStyle(wrapper)
      blocks.push({
        wrapperSelector: wrapper.tagName + (wrapper.className ? "." + wrapper.className.split(" ").slice(0, 3).join(".") : ""),
        rect: { w: Math.round(rect.width), h: Math.round(rect.height), x: Math.round(rect.x), y: Math.round(rect.y) },
        bg: ws.backgroundColor,
        color: ws.color,
        fontSize: ws.fontSize,
        fontFamily: ws.fontFamily,
        borderRadius: ws.borderRadius,
        padding: ws.padding,
        border: ws.border,
        textPreview: text.slice(0, 200),
        textLen: text.length,
        buttonsNearPre: buttons.length,
      })
    }

    // Strategy 2: explicitly find buttons labeled "copy" / "copiar"
    const copyButtons = []
    for (const btn of document.querySelectorAll("button")) {
      const t = (btn.textContent || "").trim().toLowerCase()
      const al = (btn.getAttribute("aria-label") || "").toLowerCase()
      if (
        t === "copy" || t === "copiar" ||
        al.includes("copy") || al.includes("copiar") ||
        btn.querySelector("svg") && (al.includes("copy") || al.includes("copiar"))
      ) {
        const r = btn.getBoundingClientRect()
        const bs = getComputedStyle(btn)
        copyButtons.push({
          text: btn.textContent?.trim().slice(0, 40),
          ariaLabel: btn.getAttribute("aria-label"),
          className: btn.className.slice(0, 80),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          bg: bs.backgroundColor,
          color: bs.color,
          opacity: bs.opacity,
          position: bs.position,
          isVisible: r.width > 0 && r.height > 0,
        })
      }
    }

    // Strategy 3: find the code block by looking for $ or > prefix in text
    const allDivs = Array.from(document.querySelectorAll("div"))
    const codeBlock = allDivs.find(d => {
      const t = d.textContent || ""
      return (t.startsWith("$ ") || t.startsWith("npm ") || t.startsWith("pnpm ") || t.startsWith("yarn ") || t.startsWith("> "))
        && d.querySelector("pre, code")
    })

    let blockInfo = null
    if (codeBlock) {
      const r = codeBlock.getBoundingClientRect()
      const cs = getComputedStyle(codeBlock)
      const innerCode = codeBlock.querySelector("pre, code")
      const is2 = innerCode ? getComputedStyle(innerCode) : null
      blockInfo = {
        selector: codeBlock.tagName + "." + (codeBlock.className || "").split(" ").slice(0, 3).join("."),
        rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
        bg: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        fontFamily: cs.fontFamily,
        borderRadius: cs.borderRadius,
        padding: cs.padding,
        border: cs.border,
        text: codeBlock.textContent?.trim().slice(0, 300),
        innerCode: innerCode ? {
          tag: innerCode.tagName,
          bg: is2?.backgroundColor,
          color: is2?.color,
          fontFamily: is2?.fontFamily,
          text: innerCode.textContent?.trim().slice(0, 300),
        } : null,
        // Find spans within inner code (potential syntax tokens)
        spans: innerCode ? Array.from(innerCode.querySelectorAll("span")).slice(0, 30).map(s => {
          const ss = getComputedStyle(s)
          return {
            text: s.textContent?.trim().slice(0, 40) || "",
            color: ss.color,
            bg: ss.backgroundColor,
            fontWeight: ss.fontWeight,
            className: s.className.slice(0, 60),
          }
        }) : [],
      }
    }

    return { blocks, copyButtons, blockInfo }
  })

  writeFileSync(`${OUT}/inspect-${label}.json`, JSON.stringify(data, null, 2))
  console.log(`✓ ${OUT}/inspect-${label}.json`)
  await ctx.close()
  return data
}

console.log("[1/3] Original...")
const orig = await inspectSmart("https://chanhdai.com/components/code-block-command", "original", false)

console.log("[2/3] Vitrine light...")
const vLight = await inspectSmart("http://localhost:5173/components/code-block-command", "vitrine-light", true, false)

console.log("[3/3] Vitrine dark...")
const vDark = await inspectSmart("http://localhost:5173/components/code-block-command", "vitrine-dark", true, true)

await browser.close()

console.log("\n=== Summary ===")
console.log("Original blocks found:", orig.blocks.length)
console.log("Vitrine-light blocks found:", vLight.blocks.length)
console.log("Vitrine-dark blocks found:", vDark.blocks.length)
console.log("Original copy buttons:", orig.copyButtons.length)
console.log("Vitrine-light copy buttons:", vLight.copyButtons.length)
console.log("Vitrine-dark copy buttons:", vDark.copyButtons.length)
console.log("\nOriginal blockInfo present:", !!orig.blockInfo)
console.log("Vitrine-light blockInfo present:", !!vLight.blockInfo)
console.log("Vitrine-dark blockInfo present:", !!vDark.blockInfo)
