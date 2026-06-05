// Validação visual Playwright do componente scroll-fade-effect.
// Compara https://chanhdai.com/components/scroll-fade-effect (original)
// com http://localhost:5173/components/scroll-fade-effect (vitrine).
//
// Saída em shots/scroll-fade-effect/.
// Usa contextos separados por tema (light/dark) para isolar localStorage.

import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

mkdirSync("shots/scroll-fade-effect", { recursive: true })

const URL_ORIGINAL = "https://chanhdai.com/components/scroll-fade-effect"
const URL_VITRINE  = "http://localhost:5173/components/scroll-fade-effect"

const browser = await chromium.launch()

// Cria contextos isolados por tema
async function makeContext(theme) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme, // garante prefers-color-scheme correto
  })
  if (theme) {
    await ctx.addInitScript((t) => {
      try { localStorage.setItem("vitrine-theme", t) } catch {}
    }, theme)
  }
  return ctx
}

const ctxLight = await makeContext("light")
const ctxDark  = await makeContext("dark")
const ctxOrig  = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// ---------- 1. PRINTS ESTÁTICOS (4) ----------
async function printStatic({ ctx, url, label, origin }) {
  const page = await ctx.newPage()
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`warn ${label}: ${e.message}`)
  }
  // Tempo extra para chanhdai (server externo) e para IntersectionObserver disparar
  const wait = url.startsWith("https") ? 3500 : 2500
  await page.waitForTimeout(wait)
  const out = `shots/scroll-fade-effect/${label}.png`
  await page.screenshot({ path: out, fullPage: false })
  console.log(`✓ ${out}`)
  await page.close()
}

console.log("→ 1. Prints estáticos")
await printStatic({ ctx: ctxOrig,  url: URL_ORIGINAL, label: "original-light", origin: "original" })
await printStatic({ ctx: ctxOrig,  url: URL_ORIGINAL, label: "original-dark",  origin: "original" })
await printStatic({ ctx: ctxLight, url: URL_VITRINE,  label: "vitrine-light",  origin: "vitrine"  })
await printStatic({ ctx: ctxDark,  url: URL_VITRINE,  label: "vitrine-dark",   origin: "vitrine"  })

// ---------- 2. INSPEÇÃO DOM (3 JSONs) ----------
async function inspect({ ctx, url, label, origin }) {
  const page = await ctx.newPage()
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`warn inspect ${label}: ${e.message}`)
  }
  await page.waitForTimeout(origin === "original" ? 3500 : 2500)

  const data = await page.evaluate(({ origin }) => {
    function describeEl(el) {
      if (!el) return null
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return {
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        overflow: `${s.overflowX}/${s.overflowY}`,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        maskImage: s.maskImage || s.webkitMaskImage,
        backgroundImage: s.backgroundImage,
        position: s.position,
        background: s.backgroundColor,
        color: s.color,
        border: s.border,
        borderRadius: s.borderRadius,
        maxHeight: s.maxHeight,
        height: s.height,
      }
    }
    function describeOverlay(el) {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        opacity: s.opacity,
        backgroundImage: s.backgroundImage,
        height: s.height,
        width: s.width,
        position: s.position,
        top: s.top,
        bottom: s.bottom,
        left: s.left,
        right: s.right,
        transition: s.transition,
        zIndex: s.zIndex,
        pointerEvents: s.pointerEvents,
        visible: s.opacity !== "0" && s.display !== "none",
      }
    }
    function describePseudo(el, pseudo) {
      if (!el) return null
      const s = getComputedStyle(el, pseudo)
      return {
        content: s.content,
        background: s.backgroundImage,
        opacity: s.opacity,
        position: s.position,
        top: s.top,
        height: s.height,
        display: s.display,
      }
    }

    const result = {
      origin,
      htmlClass: document.documentElement.className,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      localStorageTheme: localStorage.getItem("vitrine-theme"),
    }

    if (origin === "vitrine") {
      const wrap = document.querySelector("[data-slot='scroll-fade-effect']")
      result.wrapper = describeEl(wrap)
      result.wrapperDataSlot = wrap?.dataset.slot
      result.wrapperOrientation = wrap?.dataset.orientation
      const scrollContainer = wrap?.querySelector(":scope > div")
      result.scrollContainer = describeEl(scrollContainer)
      const overlays = wrap ? Array.from(wrap.children).filter((c) => {
        const s = getComputedStyle(c)
        return s.position === "absolute"
      }) : []
      result.overlays = overlays.map(describeOverlay)
      const sentinels = wrap ? Array.from(wrap.querySelectorAll(":scope > div > div[aria-hidden='true']")) : []
      result.sentinels = sentinels.length
      const inner = scrollContainer?.querySelector(":scope > div:not([aria-hidden='true'])")
      result.content = inner ? {
        tag: inner.tagName,
        className: inner.className,
        childCount: inner.children.length,
        firstChildText: inner.firstElementChild?.textContent?.trim().slice(0, 50),
        lastChildText: inner.lastElementChild?.textContent?.trim().slice(0, 50),
        textSample: inner.textContent?.trim().slice(0, 100),
      } : null
    } else {
      const candidates = Array.from(document.querySelectorAll("div")).filter((d) => {
        const s = getComputedStyle(d)
        const r = d.getBoundingClientRect()
        return (
          r.width > 200 && r.width < 800 && r.height > 100 && r.height < 500 &&
          (s.overflowY === "auto" || s.overflowY === "scroll" || s.overflow === "hidden" || s.overflow === "auto" || s.overflow === "scroll")
        )
      })
      result.candidates = candidates.slice(0, 5).map((el) => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return {
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          overflow: `${s.overflowX}/${s.overflowY}`,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          maxHeight: s.maxHeight,
          height: s.height,
          maskImage: s.maskImage || s.webkitMaskImage,
          backgroundImage: s.backgroundImage,
          className: el.className?.toString?.()?.slice(0, 200),
          hasBefore: !!describePseudo(el, "::before").content && describePseudo(el, "::before").content !== "none",
          hasAfter: !!describePseudo(el, "::after").content && describePseudo(el, "::after").content !== "none",
          before: describePseudo(el, "::before"),
          after: describePseudo(el, "::after"),
        }
      })
    }
    return result
  }, { origin })

  const out = `shots/scroll-fade-effect/inspect-${label}.json`
  writeFileSync(out, JSON.stringify(data, null, 2))
  console.log(`✓ ${out}`)
  await page.close()
  return data
}

console.log("\n→ 2. Inspeção DOM")
await inspect({ ctx: ctxOrig,  url: URL_ORIGINAL, label: "original",        origin: "original" })
await inspect({ ctx: ctxLight, url: URL_VITRINE,  label: "vitrine-light",   origin: "vitrine"  })
await inspect({ ctx: ctxDark,  url: URL_VITRINE,  label: "vitrine-dark",    origin: "vitrine"  })

// ---------- 3. INTERAÇÕES DE SCROLL ----------
async function scrollStates({ ctx, url, prefix, origin }) {
  const page = await ctx.newPage()
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  } catch (e) {
    console.warn(`warn scroll ${prefix}: ${e.message}`)
  }
  await page.waitForTimeout(origin === "original" ? 3500 : 2500)

  // Captura referência estável ao container (não re-busca a cada evaluate)
  const setup = await page.evaluate(({ origin }) => {
    let scrollEl, wrap
    if (origin === "vitrine") {
      wrap = document.querySelector("[data-slot='scroll-fade-effect']")
      scrollEl = wrap?.querySelector(":scope > div")
    } else {
      const all = Array.from(document.querySelectorAll("div"))
      const candidates = all.filter((d) => {
        const s = getComputedStyle(d)
        return (s.overflowY === "auto" || s.overflowY === "scroll") && d.scrollHeight > d.clientHeight + 20 && d.clientHeight > 100
      })
      const visible = candidates.find((d) => {
        const r = d.getBoundingClientRect()
        return r.top > 0 && r.top < 800 && r.width > 200
      }) || candidates[0]
      scrollEl = visible
      wrap = visible?.parentElement
    }
    if (!scrollEl) return { ok: false, reason: "scrollEl not found" }
    // Marca o elemento com um id único para re-encontrar entre calls
    const uniq = `__sfe_${Math.random().toString(36).slice(2, 8)}`
    scrollEl.dataset.sfeId = uniq
    if (wrap) wrap.dataset.sfeWrapId = uniq
    scrollEl.scrollIntoView({ block: "center" })
    const r = scrollEl.getBoundingClientRect()
    return {
      ok: true,
      kind: origin,
      uniq,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      scrollHeight: scrollEl.scrollHeight,
      clientHeight: scrollEl.clientHeight,
      hasOverflow: scrollEl.scrollHeight > scrollEl.clientHeight,
    }
  }, { origin })

  if (!setup.ok) {
    console.warn(`✗ scroll setup failed (${prefix}): ${setup.reason}`)
    await page.close()
    return
  }
  // Após scrollIntoView, espera o auto-scroll do browser assentar
  await page.waitForTimeout(400)
  // Reset scroll para 0 antes de testar estados
  await page.evaluate((uniq) => {
    const el = document.querySelector(`[data-sfe-id="${uniq}"]`)
    if (el) el.scrollTop = 0
  }, setup.uniq)
  await page.waitForTimeout(500)

  console.log(`  [${prefix}] rect=${JSON.stringify(setup.rect)} scrollHeight=${setup.scrollHeight} clientHeight=${setup.clientHeight} hasOverflow=${setup.hasOverflow}`)

  async function getState() {
    return await page.evaluate(({ uniq, origin }) => {
      const scroll = document.querySelector(`[data-sfe-id="${uniq}"]`)
      if (!scroll) return { error: "scroll not found" }
      if (origin === "vitrine") {
        const wrap = document.querySelector(`[data-sfe-wrap-id="${uniq}"]`)
        const overlays = wrap ? Array.from(wrap.children).filter((c) => {
          const s = getComputedStyle(c)
          return s.position === "absolute"
        }) : []
        return {
          scrollTop: scroll.scrollTop,
          scrollHeight: scroll.scrollHeight,
          clientHeight: scroll.clientHeight,
          atTop: scroll.scrollTop === 0,
          atBottom: (scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop) < 1,
          overlays: overlays.map((o) => {
            const s = getComputedStyle(o)
            return {
              opacity: s.opacity,
              visible: s.opacity !== "0",
              background: s.backgroundImage?.slice(0, 200),
              position: s.position,
            }
          }),
        }
      } else {
        const before = getComputedStyle(scroll, "::before")
        const after = getComputedStyle(scroll, "::after")
        const wrap = scroll.parentElement
        const overlays = wrap ? Array.from(wrap.children).filter((c) => {
          const s = getComputedStyle(c)
          return s.position === "absolute" && c !== scroll
        }) : []
        return {
          scrollTop: scroll.scrollTop,
          scrollHeight: scroll.scrollHeight,
          clientHeight: scroll.clientHeight,
          atTop: scroll.scrollTop === 0,
          atBottom: (scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop) < 1,
          before: { opacity: before.opacity, content: before.content, background: before.backgroundImage?.slice(0, 200) },
          after: { opacity: after.opacity, content: after.content, background: after.backgroundImage?.slice(0, 200) },
          overlays: overlays.map((o) => {
            const s = getComputedStyle(o)
            return { opacity: s.opacity, background: s.backgroundImage?.slice(0, 200) }
          }),
        }
      }
    }, { uniq: setup.uniq, origin })
  }

  async function scrollTo(top) {
    await page.evaluate(({ uniq, top }) => {
      const el = document.querySelector(`[data-sfe-id="${uniq}"]`)
      if (el) el.scrollTop = top
    }, { uniq: setup.uniq, top })
    await page.waitForTimeout(500) // espera transition de 200ms
  }

  // Estado 1: TOPO
  await scrollTo(0)
  const stateTop = await getState()
  const outTop = `shots/scroll-fade-effect/${prefix}-scroll-top.png`
  await page.screenshot({ path: outTop, fullPage: false })
  const topInfo = origin === "vitrine"
    ? `overlays=${stateTop.overlays.map(o => o.opacity).join(",")}`
    : `before=${stateTop.before?.opacity} after=${stateTop.after?.opacity}`
  console.log(`  ✓ ${outTop}  scrollTop=${stateTop.scrollTop}  ${topInfo}`)

  // Estado 2: MEIO
  const midTop = Math.floor((setup.scrollHeight - setup.clientHeight) / 2)
  await scrollTo(midTop)
  const stateMid = await getState()
  const outMid = `shots/scroll-fade-effect/${prefix}-scroll-middle.png`
  await page.screenshot({ path: outMid, fullPage: false })
  const midInfo = origin === "vitrine"
    ? `overlays=${stateMid.overlays.map(o => o.opacity).join(",")}`
    : `before=${stateMid.before?.opacity} after=${stateMid.after?.opacity}`
  console.log(`  ✓ ${outMid}  scrollTop=${stateMid.scrollTop}  ${midInfo}`)

  // Estado 3: FUNDO
  const maxTop = setup.scrollHeight - setup.clientHeight
  await scrollTo(maxTop)
  const stateBot = await getState()
  const outBot = `shots/scroll-fade-effect/${prefix}-scroll-bottom.png`
  await page.screenshot({ path: outBot, fullPage: false })
  const botInfo = origin === "vitrine"
    ? `overlays=${stateBot.overlays.map(o => o.opacity).join(",")}`
    : `before=${stateBot.before?.opacity} after=${stateBot.after?.opacity}`
  console.log(`  ✓ ${outBot}  scrollTop=${stateBot.scrollTop}  ${botInfo}`)

  writeFileSync(`shots/scroll-fade-effect/scroll-states-${prefix}.json`, JSON.stringify({
    setup,
    stateTop,
    stateMid,
    stateBot,
  }, null, 2))

  await page.close()
}

console.log("\n→ 3. Interações de scroll (vitrine)")
await scrollStates({ ctx: ctxLight, url: URL_VITRINE, prefix: "vitrine-light", origin: "vitrine" })
await scrollStates({ ctx: ctxDark,  url: URL_VITRINE, prefix: "vitrine-dark",  origin: "vitrine" })

console.log("\n→ 4. Interações de scroll (original)")
await scrollStates({ ctx: ctxOrig, url: URL_ORIGINAL, prefix: "original", origin: "original" })

await browser.close()
console.log("\n✅ Captura completa")
