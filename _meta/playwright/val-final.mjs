// scripts/val-final.mjs
// Validação final consolidada — react-wheel-picker
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

const OUT = "shots/react-wheel-picker"
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }
const URL_ORIG = "https://chanhdai.com/components/react-wheel-picker"
const URL_VIT = "http://localhost:5173/components/react-wheel-picker"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VIEWPORT })

async function newPage({ theme, url }) {
  const page = await ctx.newPage()
  // SEMPRE setar tema explicitamente, em ambos os casos
  await page.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
    localStorage.setItem("theme", t)
  }, theme)
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) { console.warn(`warn: ${e.message}`) }
  await page.waitForTimeout(3500)
  return page
}

async function inspectPicker(page, label) {
  // Seletor amplo: nosso wrapper OU qualquer container com items da lib
  const info = await page.evaluate(() => {
    const out = {}
    // 1) Nosso wrapper padronizado (vitrine)
    const ourWrap = document.querySelector('[data-slot="react-wheel-picker"]')
    if (ourWrap) {
      const r = ourWrap.getBoundingClientRect()
      const cs = getComputedStyle(ourWrap)
      out.ourWrap = {
        rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
        bg: cs.backgroundColor,
        color: cs.color,
        border: cs.border,
        dataTheme: ourWrap.getAttribute("data-theme"),
        colorScheme: ourWrap.style.colorScheme,
        childTags: Array.from(ourWrap.children).slice(0,4).map(c => c.tagName.toLowerCase()),
      }
    }
    // 2) UL com data-rwp-options (lib root)
    const ul = document.querySelector("ul[data-rwp-options]") ||
               document.querySelector("ul") // fallback
    if (ul) {
      const r = ul.getBoundingClientRect()
      const cs = getComputedStyle(ul)
      out.libUl = {
        tag: ul.tagName,
        rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
        bg: cs.backgroundColor,
        color: cs.color,
        transform: cs.transform.slice(0, 60),
        attrs: Array.from(ul.attributes).map(a => `${a.name}="${a.value.slice(0,40)}"`).join(" "),
        childCount: ul.children.length,
      }
    }
    // 3) Wrapper externo da lib (parent do UL — geralmente tem border/bg)
    const libWrapper = ul?.closest("div[data-rwp], div") || null
    if (libWrapper) {
      const r = libWrapper.getBoundingClientRect()
      const cs = getComputedStyle(libWrapper)
      out.libWrapper = {
        rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
        bg: cs.backgroundColor,
        border: cs.border,
        attrs: Array.from(libWrapper.attributes).map(a => `${a.name}="${a.value.slice(0,40)}"`).slice(0,8).join(" "),
      }
    }
    // 4) Items + highlight-items
    const allItems = Array.from(document.querySelectorAll('[data-slot="option-item"]'))
    const highlightItems = Array.from(document.querySelectorAll('[data-slot="highlight-item"]'))
    out.optionItemCount = allItems.length
    out.highlightItemCount = highlightItems.length
    out.firstFiveItems = allItems.slice(0, 5).map(el => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        text: (el.textContent || "").trim().slice(0, 8),
        rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
        bg: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        opacity: cs.opacity,
        dataIndex: el.getAttribute("data-index"),
      }
    })
    out.middleItems = allItems.slice(Math.floor(allItems.length/2)-2, Math.floor(allItems.length/2)+3).map(el => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        text: (el.textContent || "").trim().slice(0, 8),
        rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
        bg: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        opacity: cs.opacity,
        dataIndex: el.getAttribute("data-index"),
      }
    })
    out.highlightItems = highlightItems.map(el => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        text: (el.textContent || "").trim().slice(0, 8),
        rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
        bg: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        style: el.getAttribute("style")?.slice(0, 60),
      }
    })
    // 5) CSS vars importantes
    const rootStyle = getComputedStyle(document.documentElement)
    out.cssVars = {
      background: rootStyle.getPropertyValue("--background").trim(),
      foreground: rootStyle.getPropertyValue("--foreground").trim(),
      card: rootStyle.getPropertyValue("--card").trim(),
      accent: rootStyle.getPropertyValue("--accent").trim(),
    }
    out.htmlClass = document.documentElement.className
    out.bodyBg = getComputedStyle(document.body).backgroundColor
    return out
  })
  console.log(`[${label}]`, JSON.stringify(info, null, 2))
  return info
}

// =================== ORIGINAL ===================
console.log("\n== ORIGINAL ==")
for (const theme of ["light", "dark"]) {
  const p = await newPage({ theme, url: URL_ORIG })
  await p.screenshot({ path: `${OUT}/original-${theme}.png` })
  console.log(`✓ original-${theme}.png`)
  const info = await inspectPicker(p, `ORIGINAL-${theme}`)
  writeFileSync(`${OUT}/inspect-original-${theme}.json`, JSON.stringify(info, null, 2))
  await p.close()
}

// =================== VITRINE ===================
console.log("\n== VITRINE ==")
for (const theme of ["light", "dark"]) {
  const p = await newPage({ theme, url: URL_VIT })
  await p.screenshot({ path: `${OUT}/vitrine-${theme}.png` })
  console.log(`✓ vitrine-${theme}.png`)
  const info = await inspectPicker(p, `VITRINE-${theme}`)
  writeFileSync(`${OUT}/inspect-vitrine-${theme}.json`, JSON.stringify(info, null, 2))
  await p.close()
}

// =================== INTERAÇÕES (light) ===================
console.log("\n== INTERAÇÕES (vitrine light) ==")
const p = await newPage({ theme: "light", url: URL_VIT })

// Hover
const center = await p.evaluate(() => {
  const wrap = document.querySelector('[data-slot="react-wheel-picker"]')
  if (!wrap) return null
  const r = wrap.getBoundingClientRect()
  return { x: r.left + r.width/2, y: r.top + r.height/2 }
})
if (center) {
  await p.mouse.move(center.x, center.y)
  await p.waitForTimeout(300)
  await p.screenshot({ path: `${OUT}/vitrine-light-hover.png` })
  console.log("✓ vitrine-light-hover.png")
}

// Scroll up — 3 frames
if (center) {
  await p.mouse.move(center.x, center.y)
  for (let i = 1; i <= 3; i++) {
    await p.mouse.wheel(0, -120)
    await p.waitForTimeout(250)
    await p.screenshot({ path: `${OUT}/vitrine-light-scroll-up-frame-${i}.png` })
    console.log(`✓ vitrine-light-scroll-up-frame-${i}.png`)
  }
}

// Scroll down
if (center) {
  for (let i = 0; i < 3; i++) await p.mouse.wheel(0, 120)
  await p.waitForTimeout(400)
  await p.screenshot({ path: `${OUT}/vitrine-light-scroll-down.png` })
  console.log("✓ vitrine-light-scroll-down.png")
  const afterScroll = await inspectPicker(p, "AFTER-SCROLL")
  writeFileSync(`${OUT}/inspect-vitrine-after-scroll.json`, JSON.stringify(afterScroll, null, 2))
}

// Drag
if (center) {
  await p.mouse.move(center.x, center.y)
  await p.mouse.down()
  await p.mouse.move(center.x, center.y - 80, { steps: 12 })
  await p.waitForTimeout(200)
  await p.screenshot({ path: `${OUT}/vitrine-light-drag.png` })
  await p.mouse.up()
  await p.waitForTimeout(500)
  console.log("✓ vitrine-light-drag.png")
  const afterDrag = await inspectPicker(p, "AFTER-DRAG")
  writeFileSync(`${OUT}/inspect-vitrine-after-drag.json`, JSON.stringify(afterDrag, null, 2))
}
await p.close()

// =================== DARK INTERACTIONS ===================
console.log("\n== DARK INTERACTIONS ==")
const pDark = await newPage({ theme: "dark", url: URL_VIT })
const centerDark = await pDark.evaluate(() => {
  const wrap = document.querySelector('[data-slot="react-wheel-picker"]')
  if (!wrap) return null
  const r = wrap.getBoundingClientRect()
  return { x: r.left + r.width/2, y: r.top + r.height/2 }
})
if (centerDark) {
  await pDark.mouse.move(centerDark.x, centerDark.y)
  await pDark.waitForTimeout(200)
  await pDark.screenshot({ path: `${OUT}/vitrine-dark-hover.png` })
  await pDark.mouse.wheel(0, -150)
  await pDark.waitForTimeout(400)
  await pDark.screenshot({ path: `${OUT}/vitrine-dark-scroll-up.png` })
  console.log("✓ vitrine-dark-hover.png + vitrine-dark-scroll-up.png")
}
await pDark.close()

await browser.close()
console.log("\n=== DONE ===")
