// scripts/inspect-ncdai-glow.mjs
// Inspeciona DOM do ncdai e da vitrine para glow-card-grid
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// ── helpers ──────────────────────────────────────────────────────────

function safeJson(v) {
  try {
    return JSON.parse(JSON.stringify(v))
  } catch {
    return String(v)
  }
}

async function inspectPage(url, label, opts = {}) {
  const page = await ctx.newPage()
  if (opts.dark) {
    await page.addInitScript(() => {
      localStorage.setItem("vitrine-theme", "dark")
    })
  }
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`warn ${label}: ${e.message}`)
  }
  await page.waitForTimeout(2500)

  const info = await page.evaluate(() => {
    // ── grid wrapper ──
    const grid =
      document.querySelector("[data-slot=glow-card-grid]") ||
      document.querySelector(".grid") ||
      document.querySelector("[class*=grid]")

    const gridInfo = grid
      ? {
          tag: grid.tagName,
          className: grid.className,
          rect: (() => {
            const r = grid.getBoundingClientRect()
            return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
          })(),
          computed: {
            display: getComputedStyle(grid).display,
            gap: getComputedStyle(grid).gap,
            gridTemplateColumns: getComputedStyle(grid).gridTemplateColumns,
            backgroundColor: getComputedStyle(grid).backgroundColor,
            padding: getComputedStyle(grid).padding,
          },
          cssVars: (() => {
            const s = getComputedStyle(grid)
            const vars = {}
            for (let i = 0; i < s.length; i++) {
              const name = s[i]
              if (name.startsWith("--card-")) vars[name] = s.getPropertyValue(name).trim()
            }
            return vars
          })(),
        }
      : null

    // ── cards ──
    const cardEls =
      grid?.querySelectorAll("[data-slot=glow-card]") ||
      grid?.querySelectorAll("[class*=card]") ||
      document.querySelectorAll("[class*=card]")

    const cards = Array.from(cardEls).slice(0, 12).map((card, idx) => {
      const cs = getComputedStyle(card)
      const rect = card.getBoundingClientRect()

      // children structure
      const children = Array.from(card.children).map((ch) => ({
        tag: ch.tagName,
        className: ch.className,
        text: ch.textContent?.trim().slice(0, 80) || null,
      }))

      // img/icon inside
      const img = card.querySelector("img")
      const imgInfo = img
        ? {
            src: img.src,
            alt: img.alt,
            className: img.className,
            rect: (() => {
              const r = img.getBoundingClientRect()
              return { w: Math.round(r.width), h: Math.round(r.height) }
            })(),
            computed: {
              filter: cs.getPropertyValue("filter"),
              opacity: cs.getPropertyValue("opacity"),
            },
          }
        : null

      // text elements
      const textEls = Array.from(card.querySelectorAll("span, p, h1, h2, h3, h4, div")).filter(
        (el) => el.children.length === 0 && el.textContent?.trim(),
      )
      const texts = textEls.slice(0, 5).map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().slice(0, 60),
        className: el.className,
        computed: {
          fontSize: getComputedStyle(el).fontSize,
          fontWeight: getComputedStyle(el).fontWeight,
          color: getComputedStyle(el).color,
          lineHeight: getComputedStyle(el).lineHeight,
        },
      }))

      return {
        index: idx,
        className: card.className,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        computed: {
          backgroundColor: cs.backgroundColor,
          borderRadius: cs.borderRadius,
          border: cs.border,
          padding: cs.padding,
          overflow: cs.overflow,
          position: cs.position,
          boxShadow: cs.boxShadow,
          backdropFilter: cs.backdropFilter || cs.getPropertyValue("backdrop-filter"),
        },
        cssVars: (() => {
          const vars = {}
          for (let i = 0; i < cs.length; i++) {
            const name = cs[i]
            if (name.startsWith("--")) vars[name] = cs.getPropertyValue(name).trim()
          }
          return vars
        })(),
        img: imgInfo,
        texts,
        children,
      }
    })

    // ── page-level info ──
    const bodyCs = getComputedStyle(document.body)
    const htmlClass = document.documentElement.className

    return {
      url: location.href,
      title: document.title,
      htmlClass,
      bodyBg: bodyCs.backgroundColor,
      bodyColor: bodyCs.color,
      grid: gridInfo,
      cardCount: cards.length,
      cards,
    }
  })

  console.log(`[${label}] cards: ${info.cardCount}, grid: ${info.grid ? "found" : "NOT FOUND"}`)
  await page.close()
  return info
}

// ── run ──────────────────────────────────────────────────────────────

const ncdaiInfo = await inspectPage(
  "https://chanhdai.com/components/glow-card-grid",
  "NCDAI-LIGHT",
)

const vitrineLightInfo = await inspectPage(
  "http://localhost:5173/components/glow-card-grid",
  "VITRINE-LIGHT",
)

const vitrineDarkInfo = await inspectPage(
  "http://localhost:5173/components/glow-card-grid",
  "VITRINE-DARK",
  { dark: true },
)

// ── save JSONs ───────────────────────────────────────────────────────
writeFileSync("shots/inspect-ncdai-glow.json", JSON.stringify(ncdaiInfo, null, 2))
writeFileSync("shots/inspect-vitrine-glow.json", JSON.stringify({ light: vitrineLightInfo, dark: vitrineDarkInfo }, null, 2))
console.log("✓ shots/inspect-ncdai-glow.json")
console.log("✓ shots/inspect-vitrine-glow.json")

await browser.close()
console.log("done")
