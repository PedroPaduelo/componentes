// scripts/val-original-deep.mjs
// Inspeção profunda do original: chanhdai.com
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const OUT = outPath("react-wheel-picker")
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function inspectOriginal({ theme = "light" } = {}) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark")
    })
  }
  try {
    await page.goto("https://chanhdai.com/components/react-wheel-picker", {
      waitUntil: "networkidle",
      timeout: 45000,
    })
  } catch (e) {
    console.warn(`warn: ${e.message}`)
  }
  await page.waitForTimeout(3500)

  // Dump de toda a estrutura do componente
  const info = await page.evaluate(() => {
    // 1) Localizar todos os elementos que tenham data-slot, data-state, etc.
    const allWithAttrs = Array.from(document.querySelectorAll("*")).filter(el => {
      const ds = el.getAttribute("data-slot")
      return ds && (ds.includes("wheel") || ds.includes("picker"))
    })
    // 2) Localizar elementos com classes típicas de wheel picker
    const wheelClasses = Array.from(document.querySelectorAll("[class*='wheel'], [class*='picker'], [class*='Wheel']"))
    // 3) Identificar o container principal via heurística (mãe dos items)
    const allItems = Array.from(document.querySelectorAll(
      "[data-slot='option-item'], [role='option'], [data-rwp-option], [data-rwp-highlight-item]"
    ))
    // Pega o parent mais comum
    const itemParents = allItems.map(el => el.parentElement)
    const parentCounts = {}
    itemParents.forEach(p => {
      if (!p) return
      const k = p.tagName + ":" + p.className?.toString().slice(0, 40)
      parentCounts[k] = (parentCounts[k] || 0) + 1
    })
    const mainParentKey = Object.entries(parentCounts).sort((a,b) => b[1]-a[1])[0]?.[0]

    // 4) Walk up a partir do item mais frequente para achar o wrapper
    let mainWrap = null
    if (itemParents.length) {
      let cur = itemParents[0]
      while (cur && cur !== document.body) {
        const ds = cur.getAttribute("data-slot")
        if (ds && ds.includes("wheel")) { mainWrap = cur; break }
        // Se tem mais de 3 items filhos, provavelmente é o wrapper
        const children = cur.querySelectorAll("[data-slot='option-item'], [data-rwp-option], [data-rwp-highlight-item], [role='option']")
        if (children.length >= 5) { mainWrap = cur; break }
        cur = cur.parentElement
      }
    }

    // 5) Inspecionar o mainWrap
    let wrapInfo = null
    if (mainWrap) {
      const r = mainWrap.getBoundingClientRect()
      const cs = getComputedStyle(mainWrap)
      wrapInfo = {
        tag: mainWrap.tagName,
        rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) },
        bg: cs.backgroundColor,
        color: cs.color,
        border: cs.border,
        dataSlot: mainWrap.getAttribute("data-slot"),
        dataTheme: mainWrap.getAttribute("data-theme"),
        className: mainWrap.className?.toString().slice(0, 100),
        attrs: Array.from(mainWrap.attributes).map(a => `${a.name}="${a.value.slice(0,40)}"`).slice(0, 12).join(" "),
        childTags: Array.from(mainWrap.children).slice(0, 8).map(c => c.tagName.toLowerCase()),
      }
    }

    // 6) Inspecionar items + highlight-items
    const items = allItems.slice(0, 18).map(el => {
      const rr = el.getBoundingClientRect()
      const ecs = getComputedStyle(el)
      return {
        text: (el.textContent || "").trim().slice(0, 30),
        rect: { w: Math.round(rr.width), h: Math.round(rr.height), top: Math.round(rr.top) },
        bg: ecs.backgroundColor,
        color: ecs.color,
        fontSize: ecs.fontSize,
        fontWeight: ecs.fontWeight,
        opacity: ecs.opacity,
        dataSlot: el.getAttribute("data-slot"),
        dataIndex: el.getAttribute("data-index"),
        dataValue: el.getAttribute("data-value"),
        dataActive: el.getAttribute("data-active"),
        ariaSelected: el.getAttribute("aria-selected"),
      }
    })

    // 7) CSS variables no :root
    const rootStyle = getComputedStyle(document.documentElement)
    const cssVars = {
      bg: rootStyle.getPropertyValue("--background"),
      fg: rootStyle.getPropertyValue("--foreground"),
      accent: rootStyle.getPropertyValue("--accent"),
      border: rootStyle.getPropertyValue("--border"),
      radius: rootStyle.getPropertyValue("--radius"),
    }

    return {
      mainParentKey,
      wrap: wrapInfo,
      itemCount: allItems.length,
      items,
      cssVars,
      htmlClass: document.documentElement.className,
      htmlDataTheme: document.documentElement.getAttribute("data-theme"),
      bodyBg: getComputedStyle(document.body).backgroundColor,
    }
  })

  console.log(`[ORIGINAL ${theme}]`, JSON.stringify(info, null, 2).slice(0, 4000))
  writeFileSync(`${OUT}/inspect-original-${theme}-deep.json`, JSON.stringify(info, null, 2))
  await page.close()
  return info
}

const lightInfo = await inspectOriginal({ theme: "light" })
const darkInfo = await inspectOriginal({ theme: "dark" })

// Comparar backgrounds (pra ver se o original TEM dark mode funcional)
console.log("\n[THEME CHECK]")
console.log(`  light bodyBg: ${lightInfo.bodyBg}`)
console.log(`  dark  bodyBg: ${darkInfo.bodyBg}`)
console.log(`  light htmlClass: ${lightInfo.htmlClass}`)
console.log(`  dark  htmlClass: ${darkInfo.htmlClass}`)

await browser.close()
