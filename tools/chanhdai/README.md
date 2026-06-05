# tools/chanhdai/ — Validação do lote chanhdai

Scripts Playwright pra validar o lote de 20 componentes do chanhdai.com
na vitrine. Ficam em `tools/chanhdai/` (não em `scripts/`) pra não
conflitar com `scripts/{print,inspect,inspect-text,README}.md` da
raiz (que são root:root no sandbox e imutáveis).

## Como rodar

```bash
# 1. Subir dev server (porta 5173 ou 5174)
restart_managed_process label="fe" cmd="npm run dev" port=5173

# 2. Validar
node tools/chanhdai/validate-catalog.mjs    # conta cards do /
node tools/chanhdai/validate-examples.mjs   # confere que cada /components/<slug> tem examples
node tools/chanhdai/print.mjs               # tira prints light+dark de cada detalhe
```

## O que cada script faz

### `validate-catalog.mjs`
Abre `/`, conta links `/components/<slug>` únicos, imprime a lista. Espera 30 (10 originais + 20 chanhdai).

### `validate-examples.mjs`
Pra cada slug do lote chanhdai, abre `/components/<slug>` e checa:
- ✅ OK: tem `[role="tablist"]` (ExampleBlock renderizou)
- ❌ FAIL: tem texto "Exemplos em breve" (caiu no fallback = erro)

Exit 1 se algum FAIL.

### `print.mjs`
Pra cada slug do lote chanhdai, tira:
- `shots/vitrine-<slug>-light.png`
- `shots/vitrine-<slug>-dark.png`

Total: 38 PNGs (19 slugs × 2 temas). Útil pra diff visual de tema/CSS.
