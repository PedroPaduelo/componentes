// scripts/val-slide-to-unlock.mjs
// Validação visual Playwright: compara chanhdai.com/components/slide-to-unlock vs vitrine
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const OUT = outPath("slide-to-unlock")
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }
const ORIGINAL_URL = "https://chanhdai.com/components/slide-to-unlock"
const VITRINE_URL = "http://localhost:5173/components/slide-to-unlock"

const log = (...a) => console.log(...a)

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VIEWPORT })

// ----------------------- 1. PRINTS (4) -----------------------
async function printPage({ url, out, theme }) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => {
      try { localStorage.setItem("vitrine-theme", "dark") } catch (e) {}
    })
  } else if (theme === "light") {
    await page.addInitScript(() => {
      try { localStorage.setItem("vitrine-theme", "light") } catch (e) {}
    })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    log(`warn ${out}: ${e.message}`)
  }
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${OUT}/${out}.png`, fullPage: false })
  log(`✓ ${OUT}/${out}.png`)
  await page.close()
  return page
}

log("=== PRINTS ===")
// Original (chanhdai)
const pOrigLight = await ctx.newPage()
await pOrigLight.goto(ORIGINAL_URL, { waitUntil: "networkidle", timeout: 45000 })
await pOrigLight.waitForTimeout(3500)
await pOrigLight.screenshot({ path: `${OUT}/original-light.png`, fullPage: false })
log(`✓ ${OUT}/original-light.png`)
await pOrigLight.close()

const pOrigDark = await ctx.newPage()
await pOrigDark.goto(ORIGINAL_URL, { waitUntil: "networkidle", timeout: 45000 })
await pOrigDark.waitForTimeout(3500)
await pOrigDark.screenshot({ path: `${OUT}/original-dark.png`, fullPage: false })
log(`✓ ${OUT}/original-dark.png`)
await pOrigDark.close()

// Vitrine
await printPage({ url: VITRINE_URL, out: "vitrine-light", theme: "light" })
await printPage({ url: VITRINE_URL, out: "vitrine-dark", theme: "dark" })

// ----------------------- 2. INSPEÇÃO DOM (3 JSONs) -----------------------
log("=== INSPECÃO DOM ===")
async function inspect({ url, out, theme }) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => {
      try { localStorage.setItem("vitrine-theme", "dark") } catch (e) {}
    })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    log(`warn ${out}: ${e.message}`)
  }
  await page.waitForTimeout(2500)

  const info = await page.evaluate(() => {
    // Procura o wrapper do componente slide-to-unlock
    const root = document.body

    // Tenta vários seletores
    const candidates = [
      "[data-slot=slide-to-unlock]",
      "[data-slot=\"slide-to-unlock\"]",
      "[data-component=\"slide-to-unlock\"]",
    ]

    let wrapper = null
    for (const sel of candidates) {
      wrapper = document.querySelector(sel)
      if (wrapper) break
    }

    // Fallback: busca por texto/aria
    if (!wrapper) {
      const all = Array.from(document.querySelectorAll("*"))
      wrapper = all.find((el) => {
        const t = el.textContent || ""
        return /desliz|deslize|slide|unlock|desbloque/i.test(t) && el.getAttribute("role") !== null
      })
    }

    const rect = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    }

    // Tenta achar track e thumb
    const trackCandidates = wrapper ? Array.from(wrapper.querySelectorAll("*")).filter((el) => {
      const cls = el.className?.toString() || ""
      const ds = el.getAttribute("data-slot") || ""
      return /track|range|slider/i.test(cls) || /track|range|slider/i.test(ds)
    }) : []

    const thumbCandidates = wrapper ? Array.from(wrapper.querySelectorAll("*")).filter((el) => {
      const cls = el.className?.toString() || ""
      const ds = el.getAttribute("data-slot") || ""
      return /thumb|handle|knob|button/i.test(cls) || /thumb|handle|knob|button/i.test(ds) || el.getAttribute("role") === "slider"
    }) : []

    // Captura info mais detalhada do wrapper
    const wrapperInfo = wrapper ? {
      tag: wrapper.tagName,
      class: wrapper.className?.toString()?.slice(0, 200),
      dataSlot: wrapper.getAttribute("data-slot"),
      dataState: wrapper.getAttribute("data-state"),
      role: wrapper.getAttribute("role"),
      ariaLabel: wrapper.getAttribute("aria-label"),
      rect: rect(wrapper),
      bg: getComputedStyle(wrapper).backgroundColor,
      color: getComputedStyle(wrapper).color,
      border: getComputedStyle(wrapper).border,
      borderRadius: getComputedStyle(wrapper).borderRadius,
      height: getComputedStyle(wrapper).height,
      width: getComputedStyle(wrapper).width,
    } : null

    return {
      url: location.href,
      title: document.title,
      html: document.documentElement.getAttribute("class"),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyColor: getComputedStyle(document.body).color,
      wrapperFound: !!wrapper,
      wrapper: wrapperInfo,
      tracks: trackCandidates.slice(0, 5).map((t) => ({
        tag: t.tagName,
        class: t.className?.toString()?.slice(0, 200),
        dataSlot: t.getAttribute("data-slot"),
        dataState: t.getAttribute("data-state"),
        role: t.getAttribute("role"),
        rect: rect(t),
        bg: getComputedStyle(t).backgroundColor,
        color: getComputedStyle(t).color,
        border: getComputedStyle(t).border,
        borderRadius: getComputedStyle(t).borderRadius,
      })),
      thumbs: thumbCandidates.slice(0, 5).map((t) => ({
        tag: t.tagName,
        class: t.className?.toString()?.slice(0, 200),
        dataSlot: t.getAttribute("data-slot"),
        dataState: t.getAttribute("data-state"),
        role: t.getAttribute("role"),
        ariaValueNow: t.getAttribute("aria-valuenow"),
        ariaValueMin: t.getAttribute("aria-valuemin"),
        ariaValueMax: t.getAttribute("aria-valuemax"),
        rect: rect(t),
        bg: getComputedStyle(t).backgroundColor,
        color: getComputedStyle(t).color,
        border: getComputedStyle(t).border,
        borderRadius: getComputedStyle(t).borderRadius,
        boxShadow: getComputedStyle(t).boxShadow,
        cursor: getComputedStyle(t).cursor,
      })),
      // Captura innerHTML resumido do wrapper pra ver estrutura
      innerHTML: wrapper ? wrapper.outerHTML?.slice(0, 3000) : null,
    }
  })

  writeFileSync(`${OUT}/${out}.json`, JSON.stringify(info, null, 2))
  log(`✓ ${OUT}/${out}.json`)
  await page.close()
  return info
}

await inspect({ url: ORIGINAL_URL, out: "inspect-original", theme: null })
await inspect({ url: VITRINE_URL, out: "inspect-vitrine-light", theme: "light" })
await inspect({ url: VITRINE_URL, out: "inspect-vitrine-dark", theme: "dark" })

// ----------------------- 3. INTERAÇÕES DRAG -----------------------
log("=== INTERAÇÕES DRAG ===")
const pV = await ctx.newPage()
await pV.addInitScript(() => {
  try { localStorage.setItem("vitrine-theme", "light") } catch (e) {}
})
await pV.goto(VITRINE_URL, { waitUntil: "networkidle", timeout: 45000 })
await pV.waitForTimeout(3000)

// Acha thumb e track
const els = await pV.evaluate(() => {
  const root = document.body
  const all = Array.from(document.querySelectorAll("*"))
  // Procura por role=slider
  const slider = document.querySelector("[role=slider]")
  // Procura por aria-valuenow
  const valNow = document.querySelector("[aria-valuenow]")
  // Wrapper
  const wrap = document.querySelector("[data-slot=slide-to-unlock]")
  // Ou qualquer container com texto "deslize" ou "slide"
  let track = null
  if (wrap) {
    // pega o track que parece um retângulo horizontal
    const candidates = Array.from(wrap.querySelectorAll("*"))
    track = candidates.find((c) => {
      const r = c.getBoundingClientRect()
      const cs = getComputedStyle(c)
      return r.width > 200 && r.height < 80 && r.height > 30 && /relative|absolute/.test(cs.position)
    }) || candidates.find((c) => {
      const r = c.getBoundingClientRect()
      return r.width > 200 && r.height < 80 && r.height > 30
    })
  }
  // Thumb
  let thumb = slider || valNow
  if (!thumb && wrap) {
    const candidates = Array.from(wrap.querySelectorAll("*"))
    thumb = candidates.find((c) => {
      const r = c.getBoundingClientRect()
      return r.width < 80 && r.width > 30 && r.height > 30 && r.height < 80 && c.querySelector("svg, [class*=icon], [class*=arrow]")
    })
  }
  return {
    slider: !!slider,
    valNow: !!valNow,
    wrap: !!wrap,
    track: !!track,
    thumb: !!thumb,
    wrapRect: wrap?.getBoundingClientRect() ? (() => { const r = wrap.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })() : null,
    trackRect: track?.getBoundingClientRect() ? (() => { const r = track.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })() : null,
    thumbRect: thumb?.getBoundingClientRect() ? (() => { const r = thumb.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })() : null,
  }
})

log("Elementos encontrados:", JSON.stringify(els, null, 2))

if (!els.thumb) {
  log("❌ Nenhum thumb encontrado - abortando testes de drag")
  await pV.close()
  await browser.close()
  process.exit(1)
}

// Hover no thumb
log("Hover no thumb...")
const hoverX = els.thumbRect.x + els.thumbRect.w / 2
const hoverY = els.thumbRect.y + els.thumbRect.h / 2
await pV.mouse.move(hoverX, hoverY)
await pV.waitForTimeout(600)
await pV.screenshot({ path: `${OUT}/vitrine-light-hover-thumb.png`, fullPage: false })
log(`✓ ${OUT}/vitrine-light-hover-thumb.png`)

// Função helper pra drag
async function dragTo(targetX, targetY) {
  // mousedown no thumb atual
  await pV.mouse.move(hoverX, hoverY)
  await pV.waitForTimeout(150)
  await pV.mouse.down()
  await pV.waitForTimeout(150)
  // Vários passos intermediários (smooth)
  const steps = 15
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const x = hoverX + (targetX - hoverX) * t
    const y = hoverY + (targetY - hoverY) * t
    await pV.mouse.move(x, y)
    await pV.waitForTimeout(20)
  }
  await pV.waitForTimeout(200)
}

async function getThumbInfo() {
  return await pV.evaluate(() => {
    const slider = document.querySelector("[role=slider]")
    const wrap = document.querySelector("[data-slot=slide-to-unlock]")
    const valNow = document.querySelector("[aria-valuenow]")
    const valText = document.querySelector("[data-slot=slide-to-unlock]")?.textContent
    return {
      ariaValueNow: valNow?.getAttribute("aria-valuenow") || null,
      slider: !!slider,
      wrapDataState: wrap?.getAttribute("data-state") || null,
      wrapClasses: wrap?.className?.toString()?.slice(0, 200) || null,
      bodyText: valText?.slice(0, 200) || null,
    }
  })
}

const trackStartX = els.trackRect ? els.trackRect.x : els.thumbRect.x
const trackEndX = els.trackRect ? (els.trackRect.x + els.trackRect.w) : (els.thumbRect.x + els.thumbRect.w)
const trackY = els.trackRect ? (els.trackRect.y + els.trackRect.h / 2) : hoverY
const span = trackEndX - trackStartX

// 0% (estado inicial) — sem mexer
log("0% estado inicial...")
await pV.screenshot({ path: `${OUT}/vitrine-light-drag-0.png`, fullPage: false })
log(`✓ ${OUT}/vitrine-light-drag-0.png`)

// 25%
const x25 = trackStartX + span * 0.25
log(`25% drag para x=${x25}...`)
await dragTo(x25, trackY)
await pV.waitForTimeout(300)
await pV.screenshot({ path: `${OUT}/vitrine-light-drag-25.png`, fullPage: false })
log(`✓ ${OUT}/vitrine-light-drag-25.png`)
const info25 = await getThumbInfo()
log("25% info:", JSON.stringify(info25))

// 50%
const x50 = trackStartX + span * 0.50
log(`50% drag para x=${x50}...`)
await dragTo(x50, trackY)
await pV.waitForTimeout(300)
await pV.screenshot({ path: `${OUT}/vitrine-light-drag-50.png`, fullPage: false })
log(`✓ ${OUT}/vitrine-light-drag-50.png`)
const info50 = await getThumbInfo()
log("50% info:", JSON.stringify(info50))

// 75%
const x75 = trackStartX + span * 0.75
log(`75% drag para x=${x75}...`)
await dragTo(x75, trackY)
await pV.waitForTimeout(300)
await pV.screenshot({ path: `${OUT}/vitrine-light-drag-75.png`, fullPage: false })
log(`✓ ${OUT}/vitrine-light-drag-75.png`)
const info75 = await getThumbInfo()
log("75% info:", JSON.stringify(info75))

// 100% — completar
const x100 = trackStartX + span * 0.99
log(`100% drag para x=${x100}...`)
await dragTo(x100, trackY)
await pV.waitForTimeout(300)
await pV.screenshot({ path: `${OUT}/vitrine-light-drag-100.png`, fullPage: false })
log(`✓ ${OUT}/vitrine-light-drag-100.png`)

// mouseup
await pV.mouse.up()
await pV.waitForTimeout(800)
await pV.screenshot({ path: `${OUT}/vitrine-light-unlocked.png`, fullPage: false })
log(`✓ ${OUT}/vitrine-light-unlocked.png`)
const info100 = await getThumbInfo()
log("100% info (unlocked):", JSON.stringify(info100))

// Captura info consolidada do estado final
writeFileSync(`${OUT}/drag-summary.json`, JSON.stringify({
  initialElements: els,
  states: {
    "0": await getThumbInfo(),
    "25": info25,
    "50": info50,
    "75": info75,
    "100": info100,
  },
  finalAriaValueNow: info100.ariaValueNow,
  finalWrapDataState: info100.wrapDataState,
  finalBodyText: info100.bodyText,
}, null, 2))
log(`✓ ${OUT}/drag-summary.json`)

await pV.close()
await browser.close()
log("=== DONE ===")
