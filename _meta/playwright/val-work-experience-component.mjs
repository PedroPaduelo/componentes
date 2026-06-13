// scripts/val-work-experience-component.mjs
// Validação visual completa: prints + inspeção DOM + hovers
// Compara chanhdai.com (original) vs vitrine local (work-experience-component)
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { outPath } from "./_shots.mjs"

const OUT = outPath("work-experience-component")
mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }
const ORIGINAL_URL = "https://chanhdai.com/components/work-experience-component"
const VITRINE_URL = "http://localhost:5173/components/work-experience-component"

const log = (msg) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`)

async function openPage(ctx, url, theme = "light") {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => {
      try { localStorage.setItem("vitrine-theme", "dark") } catch (e) {}
    })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) {
    log(`warn nav ${url}: ${e.message}`)
  }
  await page.waitForTimeout(3500)
  return page
}

async function snapshotDom(page, label) {
  return await page.evaluate(() => {
    // Helper para extrair tipografia
    const typo = (el) => {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().slice(0, 80) || "",
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        color: s.color,
        bg: s.backgroundColor,
        fontFamily: s.fontFamily?.slice(0, 60),
        textTransform: s.textTransform,
        letterSpacing: s.letterSpacing,
      }
    }
    const rect = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    }
    // Tenta achar wrappers conhecidos
    const candidates = [
      "[data-slot='work-experience']",
      "[data-slot='work-experience-component']",
      "[data-slot='timeline']",
      "[data-slot]",
      "main article",
      "article",
      "section",
    ]
    let root = null
    for (const sel of candidates) {
      root = document.querySelector(sel)
      if (root) break
    }
    if (!root) {
      root = document.querySelector("body > * > main") || document.querySelector("main") || document.body
    }
    // Coletar data-* do root e seus filhos
    const dataAttrs = (el) => {
      if (!el) return {}
      const obj = {}
      for (const a of el.attributes) {
        if (a.name.startsWith("data-")) obj[a.name] = a.value
      }
      return obj
    }
    // Tenta identificar cards/timeline items
    const itemSelectors = [
      "[data-slot='work-experience-item']",
      "[data-slot='experience-item']",
      "li[data-year]",
      "li",
      "ol > li",
      "ul > li",
      "article",
      "[role='listitem']",
    ]
    let items = []
    for (const sel of itemSelectors) {
      const list = document.querySelectorAll(sel)
      if (list.length > 0 && list.length < 50) {
        items = Array.from(list).map((el, idx) => ({
          idx,
          sel,
          rect: rect(el),
          dataAttrs: dataAttrs(el),
          text: el.textContent?.trim().slice(0, 200) || "",
          ...typo(el),
        }))
        break
      }
    }
    // Tenta identificar tech badges
    const badgeSelectors = [
      "[data-slot='badge']",
      ".badge",
      "[class*='badge']",
      "li[class*='tech']",
      "span[class*='tech']",
    ]
    let badges = []
    for (const sel of badgeSelectors) {
      const list = document.querySelectorAll(sel)
      if (list.length > 0 && list.length < 80) {
        badges = Array.from(list).slice(0, 20).map((el, idx) => ({
          idx,
          sel,
          text: el.textContent?.trim() || "",
          rect: rect(el),
          ...typo(el),
        }))
        break
      }
    }
    // Tenta identificar hierarquia tipográfica
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,p,span,div"))
      .filter(el => el.textContent && el.textContent.trim().length > 0 && el.textContent.trim().length < 60)
      .slice(0, 20)
      .map(typo)
      .filter(Boolean)
    return {
      title: document.title,
      htmlClass: document.documentElement.className,
      bodyClass: document.body.className,
      bgBody: getComputedStyle(document.body).backgroundColor,
      colorBody: getComputedStyle(document.body).color,
      root: {
        tag: root?.tagName?.toLowerCase() || null,
        rect: rect(root),
        dataAttrs: dataAttrs(root),
        ...typo(root),
      },
      items: items.slice(0, 12),
      badges: badges.slice(0, 20),
      headings: headings.slice(0, 20),
      cssVars: (() => {
        const s = getComputedStyle(document.documentElement)
        const vars = {}
        for (const v of ["--background","--foreground","--muted","--muted-foreground","--accent","--accent-foreground","--border","--ring","--card","--card-foreground","--popover","--popover-foreground","--primary","--primary-foreground","--secondary","--secondary-foreground"]) {
          vars[v] = s.getPropertyValue(v).trim()
        }
        return vars
      })(),
    }
  })
}

async function run() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: VIEWPORT })

  // ============================================================
  // 1) PRINTS
  // ============================================================
  log("=== FASE 1: PRINTS ===")

  // Original light
  log("original light…")
  let page = await openPage(ctx, ORIGINAL_URL, "light")
  await page.screenshot({ path: `${OUT}/original-light.png`, fullPage: false })
  log("✓ original-light.png")
  await page.close()

  // Original dark (forçando prefers-color-scheme)
  log("original dark…")
  page = await ctx.newPage()
  await page.emulateMedia({ colorScheme: "dark" })
  try {
    await page.goto(ORIGINAL_URL, { waitUntil: "networkidle", timeout: 45000 })
  } catch (e) { log(`warn: ${e.message}`) }
  await page.waitForTimeout(3500)
  await page.screenshot({ path: `${OUT}/original-dark.png`, fullPage: false })
  log("✓ original-dark.png")
  await page.close()

  // Vitrine light
  log("vitrine light…")
  page = await openPage(ctx, VITRINE_URL, "light")
  await page.screenshot({ path: `${OUT}/vitrine-light.png`, fullPage: false })
  log("✓ vitrine-light.png")
  // Inspeção DOM
  const inspectVitrineLight = await snapshotDom(page, "vitrine-light")
  writeFileSync(`${OUT}/inspect-vitrine-light.json`, JSON.stringify(inspectVitrineLight, null, 2))
  log("✓ inspect-vitrine-light.json")
  // Interação: hover em item
  try {
    const itemSel = "[data-slot='work-experience-item'], [data-slot='experience-item'], li[data-year], ol > li:first-child, ul > li:first-child"
    const item = await page.$(itemSel)
    if (item) {
      await item.scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
      const box = await item.boundingBox()
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.waitForTimeout(700)
        await page.screenshot({ path: `${OUT}/vitrine-light-hover-item.png`, fullPage: false })
        log("✓ vitrine-light-hover-item.png")
      }
    } else {
      log("(item não encontrado para hover)")
    }
  } catch (e) {
    log(`warn hover item: ${e.message}`)
  }
  // Interação: hover em tech badge
  try {
    const badgeSel = "[data-slot='badge'], .badge, [class*='badge']"
    const badge = await page.$(badgeSel)
    if (badge) {
      await badge.scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
      const box = await badge.boundingBox()
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.waitForTimeout(700)
        await page.screenshot({ path: `${OUT}/vitrine-light-hover-badge.png`, fullPage: false })
        log("✓ vitrine-light-hover-badge.png")
      }
    } else {
      log("(badge não encontrado para hover)")
    }
  } catch (e) {
    log(`warn hover badge: ${e.message}`)
  }
  await page.close()

  // Vitrine dark
  log("vitrine dark…")
  page = await openPage(ctx, VITRINE_URL, "dark")
  await page.screenshot({ path: `${OUT}/vitrine-dark.png`, fullPage: false })
  log("✓ vitrine-dark.png")
  const inspectVitrineDark = await snapshotDom(page, "vitrine-dark")
  writeFileSync(`${OUT}/inspect-vitrine-dark.json`, JSON.stringify(inspectVitrineDark, null, 2))
  log("✓ inspect-vitrine-dark.json")
  await page.close()

  // ============================================================
  // 2) INSPECIONAR ORIGINAL (separado, em nova aba)
  // ============================================================
  log("=== FASE 2: INSPECIONAR ORIGINAL ===")
  page = await ctx.newPage()
  await page.emulateMedia({ colorScheme: "light" })
  try { await page.goto(ORIGINAL_URL, { waitUntil: "networkidle", timeout: 45000 }) }
  catch (e) { log(`warn: ${e.message}`) }
  await page.waitForTimeout(3500)
  const inspectOriginal = await snapshotDom(page, "original")
  writeFileSync(`${OUT}/inspect-original.json`, JSON.stringify(inspectOriginal, null, 2))
  log("✓ inspect-original.json")
  await page.close()

  await browser.close()
  log("=== DONE ===")
}

run().catch((e) => {
  console.error("FATAL:", e)
  process.exit(1)
})
