// Validação funcional da composição chat-app (layout multi-painel interativo).
//
// Cobre os critérios de teste da task:
//  - TROCA DE CONVERSA: clicar num item da sidebar troca o histórico central.
//  - ENVIAR MENSAGEM: bolha do user na hora + resposta simulada após timeout;
//    a mensagem NÃO vaza pra outra conversa.
//  - NOVA CONVERSA: cria thread nova ativa (estado vazio com onboarding).
//  - RESPONSIVO 390px: painéis laterais colapsam, sem overflow horizontal.
//  - TEMA light/dark: bordas dos painéis visíveis em repouso nos dois temas.
//
// Uso: npm run dev (porta 5173) + `node _meta/playwright/val-chat-app.mjs`
import { chromium } from "playwright"
import { saveJSON, saveText } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/chat-app"
const results = []
function check(name, pass, detail = "") {
  results.push({ name, pass, detail })
  console.log(`${pass ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`)
}

// Heurística de borda visível (trata oklch/oklab/rgba), conforme memória do projeto.
function borderVisible(width, color) {
  const w = parseFloat(width)
  if (!Number.isFinite(w) || w <= 0) return false
  if (!color) return false
  const c = color.trim()
  const rgba = c.match(/rgba?\(([^)]+)\)/)
  if (rgba) {
    const parts = rgba[1].split(/[,/]/).map((s) => s.trim())
    const a = parts.length >= 4 ? parseFloat(parts[3]) : 1
    return a > 0.02
  }
  const ok = c.match(/ok(?:lch|lab)\(([^)]+)\)/)
  if (ok) {
    const slash = ok[1].split("/")[1]
    if (slash) {
      const a = slash.trim().endsWith("%")
        ? parseFloat(slash) / 100
        : parseFloat(slash)
      return a > 0.02
    }
    return true // sem alpha => opaco
  }
  return c !== "transparent"
}

const browser = await chromium.launch()

async function newPage({ width = 1440, height = 900, dark = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  const page = await ctx.newPage()
  if (dark) {
    await page.addInitScript(() =>
      localStorage.setItem("vitrine-theme", "dark")
    )
  }
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(900)
  return { ctx, page }
}

try {
  // ─── 1. TROCA DE CONVERSA ──────────────────────────────────────────────
  {
    const { ctx, page } = await newPage()
    const firstText = "Pode revisar esse mockup"
    const hasFirst = await page.getByText(firstText, { exact: false }).count()
    check("conversa inicial renderiza histórico", hasFirst > 0)

    // Clica na 2ª conversa (Refatorar hook).
    await page.locator('[data-conversation-id="refatorar-hook"]').click()
    await page.waitForTimeout(500)
    const hasHookMsg = await page
      .getByText("Refatora esse hook", { exact: false })
      .count()
    const stillFirst = await page
      .getByText(firstText, { exact: false })
      .count()
    check(
      "trocar conversa mostra histórico da conversa B",
      hasHookMsg > 0,
      `matches=${hasHookMsg}`
    )
    check(
      "histórico da conversa A some ao abrir B",
      stillFirst === 0,
      `restantes=${stillFirst}`
    )
    await ctx.close()
  }

  // ─── 2. ENVIAR MENSAGEM + resposta simulada + não-vazamento ────────────
  {
    const { ctx, page } = await newPage()
    const unique = "PALAVRACHAVE_" + Date.now()
    const textarea = page.locator("textarea").first()
    await textarea.click()
    await textarea.fill(unique)
    await textarea.press("Enter")
    await page.waitForTimeout(300)
    const userBubble = await page.getByText(unique, { exact: false }).count()
    check("enviar adiciona bolha do user na hora", userBubble > 0)

    // Conta mensagens assistant antes/depois do timeout.
    const assistantBefore = await page
      .locator('[data-slot="chat-message-fluid"]')
      .count()
      .catch(() => 0)
    await page.waitForTimeout(2200) // > REPLY_DELAY_MS (1500ms)
    const replyText = await page
      .getByText("navegação por teclado está quase", { exact: false })
      .count()
    check(
      "resposta simulada do assistente aparece após timeout",
      replyText > 0,
      `replyMatches=${replyText}`
    )

    // Troca pra outra conversa e confirma que o texto único NÃO está no
    // painel central (a sidebar legitimamente mostra o preview da origem,
    // por isso escopamos a verificação ao <section> da thread).
    const thread = page.locator("section").first()
    await page.locator('[data-conversation-id="analise-churn"]').click()
    await page.waitForTimeout(400)
    const leaked = await thread.getByText(unique, { exact: false }).count()
    check("mensagem NÃO vaza para outra conversa", leaked === 0, `leaked=${leaked}`)

    // Volta e confirma persistência na conversa original.
    await page.locator('[data-conversation-id="acessibilidade"]').click()
    await page.waitForTimeout(400)
    const persisted = await thread.getByText(unique, { exact: false }).count()
    check("mensagem persiste na conversa de origem", persisted > 0)
    void assistantBefore
    await ctx.close()
  }

  // ─── 3. NOVA CONVERSA ──────────────────────────────────────────────────
  {
    const { ctx, page } = await newPage()
    await page.getByRole("button", { name: "Nova conversa" }).first().click()
    await page.waitForTimeout(500)
    const onboarding = await page
      .getByText("Como posso ajudar?", { exact: false })
      .count()
    check("nova conversa abre thread vazia (onboarding)", onboarding > 0)
    const newItem = await page
      .locator('[data-conversation-id^="nova-"]')
      .count()
    check("nova conversa aparece na sidebar", newItem > 0, `itens=${newItem}`)
    await ctx.close()
  }

  // ─── 4. RESPONSIVO 390px ───────────────────────────────────────────────
  {
    const { ctx, page } = await newPage({ width: 390, height: 780 })
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement
      return {
        scrollW: doc.scrollWidth,
        clientW: doc.clientWidth,
      }
    })
    check(
      "sem overflow horizontal em 390px",
      overflow.scrollW <= overflow.clientW + 1,
      `scrollW=${overflow.scrollW} clientW=${overflow.clientW}`
    )
    // A sidebar estática deve estar escondida (md:flex) — botão PanelLeft visível.
    const sidebarBtn = await page
      .getByRole("button", { name: "Abrir conversas" })
      .isVisible()
      .catch(() => false)
    check("botão de abrir conversas visível em mobile", sidebarBtn)
    // Abre o drawer e troca de conversa por ele.
    if (sidebarBtn) {
      await page.getByRole("button", { name: "Abrir conversas" }).click()
      await page.waitForTimeout(400)
      const drawerItem = await page
        .locator('[data-conversation-id="conteudo-q3"]')
        .last()
      await drawerItem.click()
      await page.waitForTimeout(400)
      const q3 = await page
        .getByText("12 palavras-chave", { exact: false })
        .count()
      check("drawer mobile troca conversa", q3 > 0)
    }
    await ctx.close()
  }

  // ─── 5. BORDAS em light/dark ───────────────────────────────────────────
  for (const dark of [false, true]) {
    const label = dark ? "dark" : "light"
    const { ctx, page } = await newPage({ dark })
    const info = await page.evaluate(() => {
      const card = document.querySelector(
        ".rounded-2xl.border"
      )
      const aside = document.querySelector("aside")
      const read = (el) => {
        if (!el) return null
        const s = getComputedStyle(el)
        return {
          bw: s.borderLeftWidth || s.borderRightWidth || s.borderTopWidth,
          bc:
            s.borderLeftColor ||
            s.borderRightColor ||
            s.borderTopColor,
        }
      }
      // sidebar usa border-r → mede borderRightWidth/Color
      const asideStyle = aside ? getComputedStyle(aside) : null
      return {
        card: read(card),
        aside: asideStyle
          ? { bw: asideStyle.borderRightWidth, bc: asideStyle.borderRightColor }
          : null,
      }
    })
    const cardOk =
      info.card && borderVisible(info.card.bw, info.card.bc)
    const asideOk =
      info.aside && borderVisible(info.aside.bw, info.aside.bc)
    check(
      `borda do card visível (${label})`,
      !!cardOk,
      `${info.card?.bw} ${info.card?.bc}`
    )
    check(
      `borda da sidebar visível (${label})`,
      !!asideOk,
      `${info.aside?.bw} ${info.aside?.bc}`
    )
    await ctx.close()
  }
} catch (err) {
  check("execução sem exceção", false, String(err))
} finally {
  await browser.close()
}

const passed = results.filter((r) => r.pass).length
const total = results.length
const summary = `RESULT ${passed}/${total} checks passaram`
console.log("\n" + summary)
saveJSON("chat-app/val-results", { summary, results })
saveText(
  "chat-app/val-report.txt",
  summary + "\n\n" + results.map((r) => `${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  — " + r.detail : ""}`).join("\n")
)
process.exit(passed === total ? 0 : 1)
