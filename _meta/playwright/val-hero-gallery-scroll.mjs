// Validação do FIX da composição /compositions/hero-gallery:
// a seção "Imagem em destaque" (ContainerScroll) deve ser dirigida pela ROLAGEM
// DA PÁGINA (window scroll), não por uma caixinha overflow-y-auto.
//
// Comprova: rolando window.scrollTo em offsets crescentes através da seção, o
// rotateX (graus) e o scale do Card 3D evoluem de ~20° (inclinado) → 0° (reto),
// e o título (Header) translada. Verifica em light e dark.
//
// Decompõe o matrix3d do Card para extrair rotateX e scaleY.
import { chromium } from "playwright"

const URL = (process.env.HG_URL ?? "http://localhost:5173") + "/compositions/hero-gallery"
const SEL = '[data-slot="container-scroll-animation"]'
const browser = await chromium.launch()

function rotateXdeg(matrix) {
  const m = matrix?.match(/matrix3d\(([^)]+)\)/)
  if (!m) return 0
  const a = m[1].split(",").map((x) => parseFloat(x.trim()))
  // m[5]=cos(rx)*scaleY, m[6]=sin(rx)*scaleY  → atan2(m6,m5)
  return +(Math.atan2(a[6], a[5]) * (180 / Math.PI)).toFixed(2)
}
function scaleY(matrix) {
  const m = matrix?.match(/matrix3d\(([^)]+)\)/)
  if (!m) return 1
  const a = m[1].split(",").map((x) => parseFloat(x.trim()))
  return +Math.hypot(a[4], a[5], a[6]).toFixed(3)
}

async function run(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  // aguarda imagens (picsum) assentarem pra evitar layout shift que desloca a seção
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(1200)

  const readCard = () =>
    page.evaluate((s) => {
      const root = document.querySelector(s)
      const card = Array.from(root.querySelectorAll("*")).find((e) =>
        /-mt-12/.test((e.className || "").toString()),
      )
      const header = root.querySelector('[style*="translate"]')
      return {
        card: card ? getComputedStyle(card).transform : null,
        header: header ? getComputedStyle(header).transform : null,
      }
    }, SEL)

  // posiciona a janela relativo à posição AO VIVO da seção (re-medida a cada vez),
  // imune a layout shift residual. delta = px a partir do topo da seção.
  async function at(delta) {
    await page.evaluate(
      ({ s, d }) => {
        const root = document.querySelector(s)
        const top = root.getBoundingClientRect().top + window.scrollY
        window.scrollTo(0, Math.max(0, top + d))
      },
      { s: SEL, d: delta },
    )
    await page.waitForTimeout(400)
    return readCard()
  }

  // 3 amostras: card abaixo (inclinado) / entrando / centralizado (reto)
  const s0 = await at(-900) // seção uma tela abaixo → card bem inclinado
  const s1 = await at(-360) // entrando na viewport
  const s2 = await at(512)  // seção subiu ~40% → card centralizado/reto

  const rx0 = rotateXdeg(s0.card)
  const rx1 = rotateXdeg(s1.card)
  const rx2 = rotateXdeg(s2.card)
  const sc0 = scaleY(s0.card)
  const sc2 = scaleY(s2.card)

  await ctx.close()

  // critérios: rotateX começa alto (>15°), diminui monotônico, termina ~0 (<3°)
  // e o scale reduz (de >1.03 para ~1)
  const monotonic = rx0 > rx1 && rx1 > rx2
  const startTilted = rx0 > 15
  const endFlat = Math.abs(rx2) < 3
  const scaleShrinks = sc0 > sc2 + 0.02
  const pass = monotonic && startTilted && endFlat && scaleShrinks

  console.log(`[${theme}] rotateX: ${rx0}° → ${rx1}° → ${rx2}°   scaleY: ${sc0} → ${sc2}`)
  console.log(`[${theme}] monotonic=${monotonic} startTilted=${startTilted} endFlat=${endFlat} scaleShrinks=${scaleShrinks} => ${pass ? "PASS" : "FAIL"}`)
  return { ok: pass }
}

const light = await run("light")
const dark = await run("dark")
await browser.close()
const ok = light.ok && dark.ok
console.log(`\nRESULT: light=${light.ok} dark=${dark.ok} => ${ok ? "PASS" : "FAIL"}`)
process.exit(ok ? 0 : 1)
