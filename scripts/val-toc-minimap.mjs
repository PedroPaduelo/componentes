// scripts/val-toc-minimap.mjs
// Validação visual Playwright: toc-minimap (chanhdai.com vs vitrine local)
// Componente: sidebar com TOC (table of contents) + minimap visual
// Testes: scroll 25/50/75% → verifica item ativo do TOC e barra de progresso

import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

mkdirSync("shots/toc-minimap", { recursive: true })

const ORIGINAL = "https://chanhdai.com/components/toc-minimap"
const VITRINE  = "http://localhost:5173/components/toc-minimap"
const VIEWPORT = { width: 1440, height: 900 }

const log = (...a) => console.log("•", ...a)
const out = (path, data) =>
  writeFileSync(`shots/toc-minimap/${path}`, JSON.stringify(data, null, 2), "utf8")

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: VIEWPORT })

// ============================================================
// PASSO 2 — 4 PRINTS (light + dark, original + vitrine)
// ============================================================
log("PASSO 2: prints iniciais (4)")

async function shoot(url, name, theme) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    console.warn(`warn ${name}: ${e.message}`)
  }
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `shots/toc-minimap/${name}.png`, fullPage: false })
  log("✓", name)
  return page
}

await shoot(ORIGINAL, "original-light", "light")
await shoot(ORIGINAL, "original-dark", "dark")
await shoot(VITRINE,  "vitrine-light", "light")
await shoot(VITRINE,  "vitrine-dark", "dark")

// ============================================================
// PASSO 3 — INSPEÇÃO DE DOM (3 JSONs: original, vitrine-light, vitrine-dark)
// ============================================================
log("PASSO 3: inspeção de DOM (3 JSONs)")

async function inspectFull(url, label, theme) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    console.warn(`warn inspect ${label}: ${e.message}`)
  }
  await page.waitForTimeout(3000)

  const info = await page.evaluate(() => {
    // 1. Doc-level
    const html = document.documentElement
    const isDark = html.classList.contains("dark") || document.body.classList.contains("dark")
    const dataTheme = html.getAttribute("data-theme") || html.dataset?.theme || null

    // 2. CSS vars at :root
    const rootCS = getComputedStyle(html)
    const cssVars = {}
    for (const v of [
      "--background", "--foreground", "--muted", "--muted-foreground",
      "--accent", "--accent-foreground", "--border", "--ring", "--card",
      "--popover", "--primary", "--secondary", "--destructive",
    ]) {
      cssVars[v] = rootCS.getPropertyValue(v).trim()
    }

    // 3. All elements with data-slot (vitrine pattern) + main wrappers
    const slots = Array.from(document.querySelectorAll("[data-slot]")).map((el) => {
      const r = el.getBoundingClientRect()
      return {
        slot: el.dataset.slot,
        tag: el.tagName.toLowerCase(),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        bg: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color,
        dataAttrs: { ...el.dataset },
        classNames: el.className && typeof el.className === "string" ? el.className.slice(0, 200) : null,
      }
    })

    // 4. Sidebar / aside / nav with TOC links
    const tocLinksAll = Array.from(document.querySelectorAll('a[href^="#"]'))
    const tocLinks = tocLinksAll.map((a) => {
      const r = a.getBoundingClientRect()
      const cs = getComputedStyle(a)
      return {
        text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
        href: a.getAttribute("href"),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        isActive: a.getAttribute("data-active") === "true" || a.classList.contains("active") || a.getAttribute("aria-current") !== null,
        classes: (a.className && typeof a.className === "string" ? a.className.slice(0, 200) : "") || "",
        color: cs.color,
        bg: cs.backgroundColor,
        fontWeight: cs.fontWeight,
        fontSize: cs.fontSize,
      }
    }).filter((l) => l.text.length > 0 && l.rect.w > 0)

    // 5. Sections: h1, h2, h3 headings (what TOC tracks)
    const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map((h) => {
      const r = h.getBoundingClientRect()
      return {
        tag: h.tagName.toLowerCase(),
        id: h.id || null,
        text: (h.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      }
    })

    // 6. Progress bar: look for a positioned bar (fixed/absolute, narrow vertical) or anything with "progress" in data
    const progressCandidates = Array.from(document.querySelectorAll('[data-slot*="progress"], [data-progress], [role="progressbar"]')).map((el) => {
      const r = el.getBoundingClientRect()
      return {
        tag: el.tagName.toLowerCase(),
        slot: el.dataset.slot || null,
        progress: el.dataset.progress || null,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        position: getComputedStyle(el).position,
        bg: getComputedStyle(el).backgroundColor,
      }
    })

    // 7. Page-level: document height, scroll position, body rect
    const body = document.body
    const htmlEl = document.documentElement
    const pageHeight = Math.max(body.scrollHeight, htmlEl.scrollHeight)
    const viewportHeight = window.innerHeight
    const scrollable = pageHeight > viewportHeight

    return {
      meta: {
        url: location.href,
        title: document.title,
        isDark,
        dataTheme,
        viewportH: viewportHeight,
        viewportW: window.innerWidth,
        pageHeight,
        scrollable,
        scrollY: window.scrollY,
      },
      cssVars,
      slots,
      tocLinks,
      headings,
      progressCandidates,
    }
  })

  await page.close()
  return info
}

const origInfo   = await inspectFull(ORIGINAL, "original", "light")
out("inspect-original.json", origInfo)
log("✓ inspect-original.json")

const vitLightInfo = await inspectFull(VITRINE, "vitrine-light", "light")
out("inspect-vitrine-light.json", vitLightInfo)
log("✓ inspect-vitrine-light.json")

const vitDarkInfo = await inspectFull(VITRINE, "vitrine-dark", "dark")
out("inspect-vitrine-dark.json", vitDarkInfo)
log("✓ inspect-vitrine-dark.json")

// ============================================================
// PASSO 4 — INTERAÇÕES DE SCROLL (vitrine, 25/50/75%)
// ============================================================
log("PASSO 4: testes de scroll (25/50/75%)")

async function scrollVitrine(theme) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  }
  try {
    await page.goto(VITRINE, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    console.warn(`warn scroll ${theme}: ${e.message}`)
  }
  await page.waitForTimeout(2500)

  // 4.1 — Estado inicial (topo)
  const initial = await page.evaluate(() => ({
    scrollY: window.scrollY,
    docHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
    viewportH: window.innerHeight,
    activeLinkText: (document.querySelector('a[href^="#"][data-active="true"], a[href^="#"].active, a[href^="#"][aria-current]')?.textContent || "").trim().slice(0, 80),
    activeLinkHref: (document.querySelector('a[href^="#"][data-active="true"], a[href^="#"].active, a[href^="#"][aria-current]')?.getAttribute("href")) || null,
    progressBar: (() => {
      const els = document.querySelectorAll('[data-slot*="progress"], [data-progress], [role="progressbar"]')
      return Array.from(els).map((el) => {
        const r = el.getBoundingClientRect()
        return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, bg: getComputedStyle(el).backgroundColor, progress: el.dataset?.progress || null, transform: getComputedStyle(el).transform }
      })
    })(),
  }))
  log("  initial scrollY:", initial.scrollY, "activeLink:", initial.activeLinkText || "(nenhum)")

  const docHeight = initial.docHeight
  const viewportH = initial.viewportH
  const maxScroll = Math.max(0, docHeight - viewportH)
  log(`  docHeight=${docHeight} viewportH=${viewportH} maxScroll=${maxScroll}`)

  const states = []
  const targets = [
    { pct: 0,   name: "scroll-0"   },
    { pct: 25,  name: "scroll-25"  },
    { pct: 50,  name: "scroll-50"  },
    { pct: 75,  name: "scroll-75"  },
    { pct: 100, name: "scroll-100" },
  ]

  for (const t of targets) {
    const targetY = Math.round(maxScroll * (t.pct / 100))
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), targetY)
    await page.waitForTimeout(800) // deixa o IntersectionObserver rodar

    const state = await page.evaluate(() => {
      const active = document.querySelector('a[href^="#"][data-active="true"], a[href^="#"].active, a[href^="#"][aria-current]')
      // also any link inside the page that got highlighted by being in viewport — many TOCs use IntersectionObserver
      const allLinks = Array.from(document.querySelectorAll('a[href^="#"]'))
      const activeCandidates = allLinks.filter((a) =>
        a.getAttribute("data-active") === "true" ||
        a.classList.contains("active") ||
        a.getAttribute("aria-current") !== null ||
        a.getAttribute("data-state") === "active"
      )
      const progress = (() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        return max > 0 ? (window.scrollY / max) * 100 : 0
      })()
      // any bar/element whose height or transform changes with scroll
      const progressEls = Array.from(document.querySelectorAll('[data-slot*="progress"], [data-progress], [role="progressbar"], [class*="progress"]'))
        .map((el) => {
          const r = el.getBoundingClientRect()
          return {
            slot: el.dataset.slot || null,
            cls: (el.className && typeof el.className === "string" ? el.className.slice(0, 120) : "") || "",
            rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
            transform: getComputedStyle(el).transform,
            height: getComputedStyle(el).height,
            progress: el.dataset?.progress || null,
          }
        })
      return {
        scrollY: window.scrollY,
        progress,
        activeLinkText: (active?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
        activeLinkHref: active?.getAttribute("href") || null,
        allActiveCandidates: activeCandidates.map((a) => ({
          text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
          href: a.getAttribute("href"),
        })),
        progressEls,
      }
    })

    const fname = `vitrine-${theme}-${t.name}.png`
    await page.screenshot({ path: `shots/toc-minimap/${fname}`, fullPage: false })
    states.push({ pct: t.pct, targetY, ...state, screenshot: fname })
    log(`  ✓ ${t.pct}% → scrollY=${state.scrollY} active="${state.activeLinkText || "?"}" progress=${state.progress.toFixed(1)}%`)
  }

  return { page, states, initial }
}

const lightScroll = await scrollVitrine("light")
out("scroll-states-vitrine-light.json", lightScroll)
log("✓ scroll-states-vitrine-light.json")

const darkScroll = await scrollVitrine("dark")
out("scroll-states-vitrine-dark.json", darkScroll)
log("✓ scroll-states-vitrine-dark.json")

// ============================================================
// PASSO 4.2 — HOVER + CLICK em link do TOC (vitrine, light)
// ============================================================
log("PASSO 4.2: hover + click em link do TOC")

const hoverPage = await ctx.newPage()
try {
  await hoverPage.goto(VITRINE, { waitUntil: "networkidle", timeout: 45000 })
} catch (e) { console.warn("warn hover:", e.message) }
await hoverPage.waitForTimeout(2500)

// scroll para o meio pra ver mais itens do TOC
await hoverPage.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }))
await hoverPage.waitForTimeout(500)

// Pega o 2º link do TOC pra dar hover (assumindo que tem mais de um)
const hoverResult = await hoverPage.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href^="#"]'))
    .filter((a) => a.getBoundingClientRect().width > 0)
  if (links.length < 2) return { error: "menos de 2 links", count: links.length }
  // pick 2nd link in DOM order — different from the active one typically
  const target = links[Math.min(1, links.length - 1)]
  const r = target.getBoundingClientRect()
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), text: target.textContent.trim().slice(0, 60), href: target.getAttribute("href") }
})
if (hoverResult.x != null) {
  await hoverPage.mouse.move(hoverResult.x, hoverResult.y)
  await hoverPage.waitForTimeout(500)
  await hoverPage.screenshot({ path: "shots/toc-minimap/vitrine-light-hover-toc.png" })
  log("  ✓ hover screenshot — link:", hoverResult.text.slice(0, 40))
} else {
  log("  ⚠ hover skipped:", hoverResult.error || "sem link visível")
}

// 4.2.2 — Click no 3º link e vê se scrolla
const clickResult = await hoverPage.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href^="#"]'))
    .filter((a) => a.getBoundingClientRect().width > 0)
  if (links.length < 3) return { error: "menos de 3 links" }
  const target = links[Math.min(2, links.length - 1)]
  const r = target.getBoundingClientRect()
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), text: target.textContent.trim().slice(0, 60), href: target.getAttribute("href") }
})
if (clickResult.x != null) {
  const beforeY = await hoverPage.evaluate(() => window.scrollY)
  await hoverPage.mouse.click(clickResult.x, clickResult.y)
  await hoverPage.waitForTimeout(1500) // smooth scroll
  const afterY = await hoverPage.evaluate(() => window.scrollY)
  await hoverPage.screenshot({ path: "shots/toc-minimap/vitrine-light-click-toc.png" })
  log(`  ✓ click "${clickResult.text.slice(0, 40)}" → scrollY ${beforeY}→${afterY}`)
}
await hoverPage.close()

// ============================================================
// PASSO 4.3 — INSPEÇÃO DETALHADA DO MINIMAP (vitrine light, original)
// ============================================================
log("PASSO 4.3: inspeção detalhada do minimap")

// Re-rolar pro topo, screenshot fullPage do TOC sidebar pra ver a estrutura toda
const detailPage = await ctx.newPage()
await detailPage.goto(ORIGINAL, { waitUntil: "networkidle", timeout: 45000 })
await detailPage.waitForTimeout(3000)
// Screenshot fullPage para ver a sidebar completa
await detailPage.screenshot({ path: "shots/toc-minimap/original-fullpage.png", fullPage: false })
log("  ✓ original fullpage")

const detailVitrine = await ctx.newPage()
await detailVitrine.goto(VITRINE, { waitUntil: "networkidle", timeout: 45000 })
await detailVitrine.waitForTimeout(3000)
await detailVitrine.screenshot({ path: "shots/toc-minimap/vitrine-light-fullpage.png", fullPage: false })
log("  ✓ vitrine fullpage")

// Try to find the minimap element specifically — common patterns
async function findMinimap(page, label) {
  return await page.evaluate(() => {
    // Minimap: a small visualization of the page (often <canvas> or <svg> or scaled divs)
    const candidates = Array.from(document.querySelectorAll('aside, nav, [class*="minimap"], [data-slot*="minimap"], [class*="sidebar"], [class*="toc"]'))
      .filter((el) => el.getBoundingClientRect().width > 0)
    return candidates.map((el) => {
      const r = el.getBoundingClientRect()
      return {
        tag: el.tagName.toLowerCase(),
        slot: el.dataset?.slot || null,
        cls: (el.className && typeof el.className === "string" ? el.className.slice(0, 200) : "") || "",
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        innerHTMLLen: el.innerHTML.length,
        hasCanvas: !!el.querySelector("canvas"),
        hasSvg: !!el.querySelector("svg"),
        hasLinks: el.querySelectorAll("a").length,
      }
    })
  })
}
const origMinimap = await findMinimap(detailPage, "original")
out("minimap-candidates-original.json", origMinimap)
log("  ✓ minimap-candidates-original.json")

const vitMinimap = await findMinimap(detailVitrine, "vitrine")
out("minimap-candidates-vitrine.json", vitMinimap)
log("  ✓ minimap-candidates-vitrine.json")

await detailPage.close()
await detailVitrine.close()

// ============================================================
// FIM
// ============================================================
log("PASSO 5+6: relatório será gerado em seguida")
await browser.close()
log("DONE")
