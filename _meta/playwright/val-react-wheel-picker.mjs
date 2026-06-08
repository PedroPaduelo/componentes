// scripts/val-react-wheel-picker.mjs
// Validação visual completa: react-wheel-picker (chanhdai.com vs vitrine)
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

const OUT = "shots/react-wheel-picker"
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }
const URL_ORIG = "https://chanhdai.com/components/react-wheel-picker"
const URL_VIT = "http://localhost:5173/components/react-wheel-picker"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VIEWPORT })

// =============== HELPERS =================
async function newPage({ theme = "light", url } = {}) {
  const page = await ctx.newPage()
  // IMPORTANTE: setar o localStorage EXPLÍCITAMENTE para o tema desejado
  // em todas as páginas. O contexto compartilha localStorage, então se
  // uma página anterior setou "dark" e a próxima quer "light", precisamos
  // sobrescrever — caso contrário o tema da anterior vaza.
  await page.addInitScript((t) => {
    try { localStorage.setItem("vitrine-theme", t) } catch {}
  }, theme)
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    console.warn(`warn goto: ${e.message}`)
  }
  await page.waitForTimeout(3000)
  return page
}

async function inspect(page, label) {
  const info = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="react-wheel-picker"]') ||
                 document.querySelector("[data-rwp]") ||
                 document.querySelector(".wheel-picker")
    // Tenta achar wrapper
    const wrap = document.querySelector('[data-slot="react-wheel-picker"]')
    if (!wrap) {
      return { found: false, html: document.body.innerHTML.slice(0, 800) }
    }
    const r = wrap.getBoundingClientRect()
    const cs = getComputedStyle(wrap)
    // Procura inputs/options dentro
    const optionEls = wrap.querySelectorAll(
      '[role="option"], [data-rwp-option], [data-value], li, [class*="option"]'
    )
    const items = Array.from(optionEls).slice(0, 15).map((el) => {
      const rr = el.getBoundingClientRect()
      const ecs = getComputedStyle(el)
      return {
        text: (el.textContent || "").trim().slice(0, 30),
        rect: { w: Math.round(rr.width), h: Math.round(rr.height) },
        bg: ecs.backgroundColor,
        color: ecs.color,
        fontSize: ecs.fontSize,
        fontWeight: ecs.fontWeight,
        opacity: ecs.opacity,
        classes: el.className?.toString().slice(0, 80),
        attrs: Array.from(el.attributes).map(a => `${a.name}="${a.value.slice(0,30)}"`).join(" "),
      }
    })
    // Selected / highlight
    const selectedEl = wrap.querySelector(
      '[aria-selected="true"], [data-selected="true"], [data-active], [class*="selected"], [class*="active"]'
    )
    let selectedInfo = null
    if (selectedEl) {
      const srr = selectedEl.getBoundingClientRect()
      const scs = getComputedStyle(selectedEl)
      selectedInfo = {
        text: (selectedEl.textContent || "").trim().slice(0, 30),
        bg: scs.backgroundColor,
        color: scs.color,
        fontSize: scs.fontSize,
        fontWeight: scs.fontWeight,
        rect: { w: Math.round(srr.width), h: Math.round(srr.height) },
        classes: selectedEl.className?.toString().slice(0, 80),
      }
    }
    return {
      found: true,
      wrap: {
        rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) },
        bg: cs.backgroundColor,
        color: cs.color,
        border: cs.border,
        fontSize: cs.fontSize,
        fontFamily: cs.fontFamily.slice(0, 60),
        dataTheme: wrap.dataset.theme,
        colorScheme: wrap.style.colorScheme,
        dataSlot: wrap.dataset.slot,
        childTags: Array.from(wrap.children).map(c => c.tagName.toLowerCase()).slice(0, 6),
      },
      itemCount: optionEls.length,
      items,
      selected: selectedInfo,
    }
  })
  console.log(`[${label}]`, JSON.stringify(info, null, 2).slice(0, 1500))
  return info
}

// =============== FASE 1: PRINTS COMPARATIVOS =================
console.log("== FASE 1: prints comparativos ==")

for (const [name, url, theme] of [
  ["original-light", URL_ORIG, "light"],
  ["original-dark", URL_ORIG, "dark"],
  ["vitrine-light", URL_VIT, "light"],
  ["vitrine-dark", URL_VIT, "dark"],
]) {
  const p = await newPage({ theme, url })
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  console.log(`✓ ${OUT}/${name}.png`)
  await p.close()
}

// =============== FASE 2: INSPEÇÃO DE DOM =================
console.log("\n== FASE 2: inspeção de DOM ==")

const orig = await newPage({ url: URL_ORIG })
const origInfo = await inspect(orig, "ORIGINAL")
writeFileSync(`${OUT}/inspect-original.json`, JSON.stringify(origInfo, null, 2))
await orig.close()

const vLight = await newPage({ url: URL_VIT, theme: "light" })
const vLightInfo = await inspect(vLight, "VITRINE-LIGHT")
writeFileSync(`${OUT}/inspect-vitrine-light.json`, JSON.stringify(vLightInfo, null, 2))

// =============== FASE 3: INTERAÇÕES =================
console.log("\n== FASE 3: interações ==")

// 3.1 Hover sobre a coluna
const hoverBox = await vLight.evaluate(() => {
  const wrap = document.querySelector('[data-slot="react-wheel-picker"]')
  if (!wrap) return null
  const r = wrap.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
})
if (hoverBox) {
  await vLight.mouse.move(hoverBox.x, hoverBox.y)
  await vLight.waitForTimeout(500)
  await vLight.screenshot({ path: `${OUT}/vitrine-light-hover-column.png` })
  console.log(`✓ vitrine-light-hover-column.png`)
}

// 3.2 Scroll up (decrementar)
if (hoverBox) {
  await vLight.mouse.move(hoverBox.x, hoverBox.y)
  for (let i = 1; i <= 3; i++) {
    await vLight.mouse.wheel(0, -100) // scroll para cima
    await vLight.waitForTimeout(300)
    await vLight.screenshot({ path: `${OUT}/vitrine-light-scroll-up-frame-${i}.png` })
    console.log(`✓ vitrine-light-scroll-up-frame-${i}.png`)
  }
}

// 3.3 Scroll down
if (hoverBox) {
  for (let i = 0; i < 2; i++) {
    await vLight.mouse.wheel(0, 100)
    await vLight.waitForTimeout(300)
  }
  await vLight.screenshot({ path: `${OUT}/vitrine-light-scroll-down.png` })
  console.log(`✓ vitrine-light-scroll-down.png`)

  // Inspecionar estado pós-scroll
  const afterScroll = await inspect(vLight, "VITRINE-AFTER-SCROLL")
  writeFileSync(`${OUT}/inspect-vitrine-after-scroll.json`, JSON.stringify(afterScroll, null, 2))
}

// 3.4 Drag (mousedown + mousemove + mouseup)
if (hoverBox) {
  await vLight.mouse.move(hoverBox.x, hoverBox.y)
  await vLight.mouse.down()
  await vLight.mouse.move(hoverBox.x, hoverBox.y - 50, { steps: 10 })
  await vLight.waitForTimeout(200)
  await vLight.screenshot({ path: `${OUT}/vitrine-light-drag.png` })
  await vLight.mouse.up()
  await vLight.waitForTimeout(500)
  console.log(`✓ vitrine-light-drag.png`)

  // Inspecionar estado pós-drag
  const afterDrag = await inspect(vLight, "VITRINE-AFTER-DRAG")
  writeFileSync(`${OUT}/inspect-vitrine-after-drag.json`, JSON.stringify(afterDrag, null, 2))
}

await vLight.close()

// 3.5 Dark mode: interação similar
const vDark = await newPage({ url: URL_VIT, theme: "dark" })
const vDarkInfo = await inspect(vDark, "VITRINE-DARK")
writeFileSync(`${OUT}/inspect-vitrine-dark.json`, JSON.stringify(vDarkInfo, null, 2))

const darkBox = await vDark.evaluate(() => {
  const wrap = document.querySelector('[data-slot="react-wheel-picker"]')
  if (!wrap) return null
  const r = wrap.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
})
if (darkBox) {
  await vDark.mouse.move(darkBox.x, darkBox.y)
  await vDark.mouse.wheel(0, -150)
  await vDark.waitForTimeout(500)
  await vDark.screenshot({ path: `${OUT}/vitrine-dark-scroll-up.png` })
  console.log(`✓ vitrine-dark-scroll-up.png`)
}

await vDark.close()

await browser.close()
console.log("\n=== DONE ===")
