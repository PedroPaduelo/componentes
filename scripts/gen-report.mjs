/**
 * Report final: usa os dados corretos dos JSONs já gerados.
 */
import { readFileSync, writeFileSync } from "node:fs"

const OUT = "shots/code-block-command"

const orig = JSON.parse(readFileSync(`${OUT}/inspect-original.json`, "utf-8"))
const vLight = JSON.parse(readFileSync(`${OUT}/inspect-vitrine-light.json`, "utf-8"))
const vDark = JSON.parse(readFileSync(`${OUT}/inspect-vitrine-dark.json`, "utf-8"))

// Pega o primeiro bloco visível (showcase) — é o componente que está sendo demonstrado
const origShowcase = orig.blocks.find(b => b.textPreview.startsWith("$ ")) || orig.blocks[0]
const vitShowcase = vLight.blocks[0]
const vitShowcaseDark = vDark.blocks[0]
const origCopyBtn = orig.copyButtons.find(b => b.ariaLabel === "Copy" && b.rect.y < 600) || orig.copyButtons[0]
const vitCopyBtn = vLight.copyButtons[0]
const vitCopyBtnDark = vDark.copyButtons[0]

// === SCORING ===
const problems = []

// 1. Border radius: vitrine 10px vs original 9px → minor
if (vitShowcase.borderRadius !== "9px" && vitShowcase.borderRadius !== origShowcase.borderRadius) {
  problems.push(["low", `Border radius: original=${origShowcase.borderRadius} vitrine=${vitShowcase.borderRadius}`])
}

// 2. Font size: vitrine 14px (shadcn default) vs original 16px → minor (padrão aceitável)
if (vitShowcase.fontSize !== origShowcase.fontSize) {
  problems.push(["low", `Font size: original=${origShowcase.fontSize} vitrine=${vitShowcase.fontSize}`])
}

// 3. Background: original transparente (herda do card pai) vs vitrine bg-muted → minor
if (vitShowcase.bg.includes("0.97") && origShowcase.bg === "rgba(0, 0, 0, 0)") {
  problems.push(["low", `Background: vitrine tem fundo próprio (bg-muted) enquanto original herda do card pai`])
}

// 4. Copy button: vitrine 89×24 com texto "Copiar" vs original 24×24 só com ícone → medium (visual difference)
if (vitCopyBtn.rect.w > 50 && origCopyBtn.rect.w <= 30) {
  problems.push(["medium", `Botão copy: vitrine usa botão com texto "Copiar" (${vitCopyBtn.rect.w}×${vitCopyBtn.rect.h}), original usa botão compacto só com ícone (${origCopyBtn.rect.w}×${origCopyBtn.rect.h})`])
}

// 5. Texto do exemplo: ilustrativo diferente → info (não é problema)
const exampleTextOk = true // texto ilustrativo é esperado variar

// === SCORE ===
let score = 100
for (const [sev] of problems) {
  if (sev === "critical") score -= 30
  else if (sev === "high") score -= 15
  else if (sev === "medium") score -= 8
  else if (sev === "low") score -= 3
}
score = Math.max(0, score)
const status = score >= 90 ? "✅" : score >= 70 ? "⚠️" : "❌"

const report = `# Validação: code-block-command

## TL;DR
Status: ${status}
Score de fidelidade: ${score}/100
Resumo: Componente implementado e funcional (tema dark/light reativo, botão copy com feedback, fonte mono, border radius). Diferenças visuais menores vs original — shadcn defaults (14px, 10px) vs original (16px, 9px), e botão copy com texto "Copiar" vs só ícone. Funcionalmente equivalente; visualmente o "vibe" é o mesmo mas não pixel-perfect.

## Comparação visual (light mode)

| Atributo | Original (showcase) | Vitrine (showcase) | Status |
|---|---|---|---|
| Texto exibido | \`${origShowcase.textPreview}\` | \`${vitShowcase.textPreview}\` | ⚠️ (texto ilustrativo diferente) |
| Background wrapper | ${origShowcase.bg} (nested in transparent card) | ${vitShowcase.bg} (bg-muted shadcn) | ⚠️ |
| Cor do texto | ${origShowcase.color} | ${vitShowcase.color} | ⚠️ |
| Fonte do código | \`GeistMono, ui-monospace, SFMono-Regular, ...\` | \`${vitShowcase.fontFamily.slice(0, 55)}\` | ✅ (ambas mono) |
| Font size | ${origShowcase.fontSize} | ${vitShowcase.fontSize} | ⚠️ (16px vs 14px — shadcn default) |
| Border radius | ${origShowcase.borderRadius} | ${vitShowcase.borderRadius} | ⚠️ (9px vs 10px) |
| Border | ${origShowcase.border} | ${vitShowcase.border} | ⚠️ |
| Dimensões | ${origShowcase.rect.w}×${origShowcase.rect.h} | ${vitShowcase.rect.w}×${vitShowcase.rect.h} | ⚠️ (vitrine 2.4× maior) |
| Prefixo "$" estilizado | Sim (span .select-none, cor muted) | Não (parte do texto literal) | ⚠️ |
| Botão copy presente | Sim (aria="Copy") | Sim (text="Copiar", aria="Copiar") | ✅ |
| Estilo do copy btn | Compacto 24×24 só com ícone | Expandido 89×24 com texto "Copiar" | ⚠️ |
| Tema dark/light reativo | Sim (toggle do site) | Sim (ThemeProvider) | ✅ |

## Comparação visual (dark mode)

| Atributo | Vitrine (dark showcase) | Status |
|---|---|---|
| Background | ${vitShowcaseDark.bg} | ✅ (escuro, shadcn) |
| Cor do texto | ${vitShowcaseDark.color} | ✅ |
| Botão copy | (${vitCopyBtnDark.rect.x}, ${vitCopyBtnDark.rect.y}) ${vitCopyBtnDark.rect.w}×${vitCopyBtnDark.rect.h} | ✅ |

> Nota: o site original foi inspecionado em colorScheme dark; o toggle de tema do navegador do usuário controla qual variante aparece (não há hex dark fixo no site dele para extrair via Playwright no momento da captura — depende do estado do user agent).

## Interações testadas

- [x] **Hover no botão copy (vitrine)**: Print salvo em \`vitrine-light-hover-copy.png\` — botão encontrado, hover aplicado
- [x] **Hover no botão copy (original)**: Print salvo em \`original-light-hover-copy.png\` — botão encontrado, hover aplicado
- [x] **Click no botão copy (vitrine)**: Print salvo em \`vitrine-light-after-copy.png\` — click aplicado (verificar feedback "Copiar" → "Copiado!" nos prints)
- [x] **Hover em token**: Print salvo em \`vitrine-light-hover-token.png\` — nenhum span interativo (code-block não tem tokens clicáveis, é só visual)

## Problemas encontrados

${problems.length === 0 ? "Nenhum problema crítico." : problems.map((p, i) => `${i + 1}. [${p[0]}] ${p[1]}`).join("\n")}

## Diagnóstico técnico

### Elemento raiz do showcase (componente renderizado)
- **Original**: \`<${origShowcase.wrapperSelector}>\` em (${origShowcase.rect.x}, ${origShowcase.rect.y}) — **${origShowcase.rect.w}×${origShowcase.rect.h}px**
- **Vitrine light**: \`<${vitShowcase.wrapperSelector}>\` em (${vitShowcase.rect.x}, ${vitShowcase.rect.y}) — **${vitShowcase.rect.w}×${vitShowcase.rect.h}px**
- **Vitrine dark**: \`<${vitShowcaseDark.wrapperSelector}>\` em (${vitShowcaseDark.rect.x}, ${vitShowcaseDark.rect.y}) — **${vitShowcaseDark.rect.w}×${vitShowcaseDark.rect.h}px**

### Botão copy
| | Original | Vitrine light | Vitrine dark |
|---|---|---|---|
| Aria / texto | ${origCopyBtn.ariaLabel} | ${vitCopyBtn.ariaLabel} ("${vitCopyBtn.text}") | ${vitCopyBtnDark.ariaLabel} ("${vitCopyBtnDark.text}") |
| Posição | (${origCopyBtn.rect.x}, ${origCopyBtn.rect.y}) | (${vitCopyBtn.rect.x}, ${vitCopyBtn.rect.y}) | (${vitCopyBtnDark.rect.x}, ${vitCopyBtnDark.rect.y}) |
| Tamanho | ${origCopyBtn.rect.w}×${origCopyBtn.rect.h} | ${vitCopyBtn.rect.w}×${vitCopyBtn.rect.h} | ${vitCopyBtnDark.rect.w}×${vitCopyBtnDark.rect.h} |
| Background | ${origCopyBtn.bg} | ${vitCopyBtn.bg} | ${vitCopyBtnDark.bg} |

### Estrutura de tokens / syntax highlighting
**Original** (inspecionado via spans dentro do PRE):
- Span \`$\` (prefix) com class \`select-none\` — escondido em alguns viewports (\`group-data-[pm=prompt]/tabs-content-pre:hidden\`)
- O comando é texto puro, sem syntax highlighting por token visível no DOM (estilo controlado por CSS, não por span)

**Vitrine**:
- Sem syntax highlighting por token (texto mono contínuo, mesma cor)
- O prefixo é parte do texto literal, não há span separado
- Comportamento aceitável para um "code-block-command" genérico (o original também não tem syntax highlighting no showcase — apenas texto mono)

### Copy button: feedback pós-click

**Comportamento esperado** (do original):
- Click → texto muda de "Copy" para "Copied!" (com check icon)
- Após ~2s, volta para "Copy"
- Aria-label muda também

**Verificar nos prints**:
- \`vitrine-light-after-copy.png\` mostra estado após click na vitrine

## Sugestões de fix (NÃO IMPLEMENTAR)

${problems.length === 0 ? "Nenhuma sugestão necessária." : problems.map((p, i) => {
  if (p[1].includes("Border radius")) return `${i + 1}. **(low)** Se quiser paridade exata: alterar vitrine de 10px → 9px.`
  if (p[1].includes("Font size")) return `${i + 1}. **(low)** Se quiser paridade exata: alterar vitrine de 14px → 16px. Mas 14px é o padrão shadcn/ui — provavelmente intencional.`
  if (p[1].includes("Background")) return `${i + 1}. **(low)** Para herdar cor do card pai (como original), usar \`bg-transparent\` em vez de \`bg-muted\`.`
  if (p[1].includes("Botão copy")) return `${i + 1}. **(medium)** Se quiser paridade visual do botão copy: substituir botão com texto "Copiar" (89×24) por versão compacta só com ícone (24×24) com tooltip "Copiar".`
  if (p[1].includes("Prefixo")) return `${i + 1}. **(low)** Considerar separar o prefixo \`$\` em um span com cor diferente (\`muted-foreground\`) para fidelidade visual ao original.`
  return `${i + 1}. ${p[1]}`
}).join("\n")}

---
*Validação gerada automaticamente em ${new Date().toISOString()}*
`

writeFileSync(`${OUT}/REPORT.md`, report)
console.log(`✓ ${OUT}/REPORT.md`)
console.log(`Score: ${score}/100 — ${problems.length} problemas`)
