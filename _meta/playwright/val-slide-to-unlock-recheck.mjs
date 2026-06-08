// scripts/val-slide-to-unlock-recheck.mjs
// Re-tira os 4 prints + 3 inspects com tema garantido (setando html.className após load)
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const OUT = "shots/slide-to-unlock"
const VIEWPORT = { width: 1440, height: 900 }
const ORIGINAL_URL = "https://chanhdai.com/components/slide-to-unlock"
const VITRINE_URL = "http://localhost:5173/components/slide-to-unlock"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VIEWPORT })

async function ensureTheme(page, theme) {
  // Espera o ThemeProvider aplicar
  await page.waitForTimeout(500)
  // Seta html className diretamente pra forçar o tema
  if (theme === "dark") {
    await page.evaluate(() => {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    })
  } else if (theme === "light") {
    await page.evaluate(() => {
      document.documentElement.classList.add("light")
      document.documentElement.classList.remove("dark")
    })
  } else {
    // system = simular
    await page.evaluate(() => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", isDark)
    })
  }
  await page.waitForTimeout(300)
}

async function getTheme(page) {
  return await page.evaluate(() => ({
    htmlClass: document.documentElement.className,
    bg: getComputedStyle(document.body).backgroundColor,
  }))
}

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
    console.warn(`warn ${out}: ${e.message}`)
  }
  await page.waitForTimeout(2500)
  if (theme === "light" || theme === "dark") {
    await ensureTheme(page, theme)
  }
  const t = await getTheme(page)
  console.log(`[${out}] theme=${t.htmlClass} bg=${t.bg}`)
  await page.screenshot({ path: `${OUT}/${out}.png`, fullPage: false })
  console.log(`✓ ${OUT}/${out}.png`)
  await page.close()
  return t
}

console.log("=== PRINTS (re-checked) ===")
// Original (chanhdai) — dark é só simulando prefers-color-scheme
const p1 = await ctx.newPage()
await p1.goto(ORIGINAL_URL, { waitUntil: "networkidle", timeout: 45000 })
await p1.waitForTimeout(3500)
const oLightTheme = await getTheme(p1)
console.log(`[original-light] theme=${oLightTheme.htmlClass} bg=${oLightTheme.bg}`)
await p1.screenshot({ path: `${OUT}/original-light.png`, fullPage: false })
await p1.close()
console.log(`✓ ${OUT}/original-light.png`)

const p2 = await ctx.newPage()
// chanhdai usa data-theme / class / prefers-color-scheme? Vou setar localStorage se houver
await p2.addInitScript(() => {
  try {
    localStorage.setItem("theme", "dark")
    localStorage.setItem("darkMode", "true")
  } catch (e) {}
})
await p2.goto(ORIGINAL_URL, { waitUntil: "networkidle", timeout: 45000 })
await p2.waitForTimeout(3500)
// Força dark via class
await p2.evaluate(() => {
  document.documentElement.classList.add("dark")
  document.documentElement.setAttribute("data-theme", "dark")
  document.documentElement.style.colorScheme = "dark"
})
await p2.waitForTimeout(800)
const oDarkTheme = await getTheme(p2)
console.log(`[original-dark] theme=${oDarkTheme.htmlClass} bg=${oDarkTheme.bg}`)
await p2.screenshot({ path: `${OUT}/original-dark.png`, fullPage: false })
await p2.close()
console.log(`✓ ${OUT}/original-dark.png`)

// Vitrine
await printPage({ url: VITRINE_URL, out: "vitrine-light", theme: "light" })
await printPage({ url: VITRINE_URL, out: "vitrine-dark", theme: "dark" })

// ----------------------- INSPEÇÃO REFINADA -----------------------
async function inspect({ url, out, theme }) {
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
    console.warn(`warn ${out}: ${e.message}`)
  }
  await page.waitForTimeout(2500)
  if (theme === "light" || theme === "dark") {
    await ensureTheme(page, theme)
  }
  const t = await getTheme(page)
  console.log(`[inspect ${out}] theme=${t.htmlClass} bg=${t.bg}`)

  const info = await page.evaluate(() => {
    const root = document.body
    const candidates = [
      "[data-slot=slide-to-unlock]",
    ]
    let wrapper = null
    for (const sel of candidates) {
      wrapper = document.querySelector(sel)
      if (wrapper) break
    }
    const rect = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    }
    const track = wrapper?.querySelector("[data-slot=track]") || null
    const handle = wrapper?.querySelector("[data-slot=handle]") || null
    const text = wrapper?.querySelector("[data-slot=text]") || null
    return {
      url: location.href,
      title: document.title,
      htmlClass: document.documentElement.className,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyColor: getComputedStyle(document.body).color,
      wrapper: wrapper ? {
        rect: rect(wrapper),
        bg: getComputedStyle(wrapper).backgroundColor,
        color: getComputedStyle(wrapper).color,
        border: getComputedStyle(wrapper).border,
        borderRadius: getComputedStyle(wrapper).borderRadius,
      } : null,
      track: track ? {
        rect: rect(track),
        bg: getComputedStyle(track).backgroundColor,
      } : null,
      handle: handle ? {
        rect: rect(handle),
        bg: getComputedStyle(handle).backgroundColor,
        color: getComputedStyle(handle).color,
        borderRadius: getComputedStyle(handle).borderRadius,
        boxShadow: getComputedStyle(handle).boxShadow,
        cursor: getComputedStyle(handle).cursor,
        svgHTML: handle.querySelector("svg")?.outerHTML?.slice(0, 250) || null,
      } : null,
      text: text ? {
        content: text.textContent?.trim().slice(0, 60),
        opacity: getComputedStyle(text).opacity,
        color: getComputedStyle(text).color,
      } : null,
      // Conta total de instâncias
      allWrappers: document.querySelectorAll("[data-slot=slide-to-unlock]").length,
      allHandles: document.querySelectorAll("[data-slot=handle]").length,
    }
  })
  writeFileSync(`${OUT}/${out}.json`, JSON.stringify(info, null, 2))
  console.log(`✓ ${OUT}/${out}.json`)
  await page.close()
  return info
}

console.log("=== INSPECÃO (re-checked) ===")
await inspect({ url: ORIGINAL_URL, out: "inspect-original", theme: null })
await inspect({ url: VITRINE_URL, out: "inspect-vitrine-light", theme: "light" })
await inspect({ url: VITRINE_URL, out: "inspect-vitrine-dark", theme: "dark" })

await browser.close()
console.log("=== DONE ===")
