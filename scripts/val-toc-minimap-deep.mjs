// scripts/val-toc-minimap-deep.mjs
// Inspeção profunda: HTML interno do toc-minimap, tentar detectar barra de progresso,
// investigar estrutura e identificar onde o active state e progress bar deveriam estar

import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
})
const page = await ctx.newPage()
await page.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
await page.goto("http://localhost:5173/components/toc-minimap", { waitUntil: "networkidle" })
await page.waitForTimeout(3000)

const deep = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('[data-slot="toc-minimap"]'))
  return els.map((root) => {
    const r = root.getBoundingClientRect()
    // Pega todos os descendentes com tag, class, attrs de estado
    function walk(el, depth = 0, max = 6) {
      if (depth > max) return null
      const rect = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        tag: el.tagName.toLowerCase(),
        cls: (el.className && typeof el.className === "string" ? el.className.slice(0, 200) : "") || "",
        slot: el.dataset?.slot || null,
        role: el.getAttribute("role") || null,
        ariaCurrent: el.getAttribute("aria-current") || null,
        dataState: el.getAttribute("data-state") || null,
        dataActive: el.getAttribute("data-active") || null,
        dataAttr: Object.fromEntries(Object.entries(el.dataset || {}).map(([k, v]) => [k, v])),
        attrs: Array.from(el.attributes).filter(a => !["class","style"].includes(a.name)).map(a => `${a.name}="${a.value}"`).join(" "),
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        position: cs.position,
        bg: cs.backgroundColor,
        color: cs.color,
        border: cs.border,
        children: Array.from(el.children).map(c => walk(c, depth + 1, max)).filter(Boolean),
      }
    }
    return {
      root: { tag: root.tagName, slot: "toc-minimap", rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } },
      tree: walk(root),
    }
  })
})

writeFileSync("shots/toc-minimap/dom-tree-vitrine.json", JSON.stringify(deep, null, 2), "utf8")
console.log(`✓ dom-tree-vitrine.json — ${deep.length} instância(s)`)
deep.forEach((d, i) => console.log(`  [${i}] ${d.root.rect.w}×${d.root.rect.h} px em (${d.root.rect.x},${d.root.rect.y})`))

// Testa se rolar a página inteira ativa algum link do TOC no exemplo
const before = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('[data-slot="toc-minimap"] a[href^="#"]'))
  return {
    linkCount: links.length,
    samples: links.slice(0, 6).map(a => ({
      text: a.textContent.trim().slice(0, 30),
      href: a.getAttribute("href"),
      classes: a.className.slice(0, 80),
      ariaCurrent: a.getAttribute("aria-current"),
      dataActive: a.getAttribute("data-active"),
    })),
  }
})
console.log("\nLinks no DOM:")
console.log(JSON.stringify(before, null, 2))

// Verifica se as âncoras (#intro, #setup, #api, #exemplos) existem no documento
const anchors = await page.evaluate(() => {
  return ["intro", "setup", "api", "exemplos"].map(id => {
    const el = document.getElementById(id)
    return { id, exists: !!el, tag: el?.tagName?.toLowerCase() || null, text: el?.textContent?.trim().slice(0, 50) || null }
  })
})
console.log("\nÂncoras #intro, #setup, #api, #exemplos:")
console.log(JSON.stringify(anchors, null, 2))

// SCROLL: scrolla a página e checa se algum link fica com data-active / aria-current
console.log("\nTestando scroll na página inteira...")
const docH = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight))
console.log("  docHeight:", docH)
for (const pct of [0, 50, 100]) {
  const y = Math.round((docH - 900) * pct / 100)
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y)
  await page.waitForTimeout(600)
  const after = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('[data-slot="toc-minimap"] a[href^="#"]'))
    return {
      scrollY: window.scrollY,
      activeLinks: links.filter(a =>
        a.getAttribute("data-active") === "true" ||
        a.getAttribute("aria-current") !== null ||
        a.classList.contains("active") ||
        a.dataset?.state === "active"
      ).map(a => ({
        text: a.textContent.trim().slice(0, 30),
        href: a.getAttribute("href"),
        attrs: a.getAttribute("data-active") || a.getAttribute("aria-current") || a.classList.contains("active") || "?"
      })),
    }
  })
  console.log(`  pct=${pct}% y=${y} scrollY=${after.scrollY} activeLinks=${after.activeLinks.length}`, after.activeLinks)
}

await browser.close()
console.log("DONE")
