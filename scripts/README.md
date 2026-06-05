# scripts/ — Validação visual de integrações

Scripts Playwright pra **comparar** o resultado de uma nova integração de biblioteca externa contra o site original.

## Como rodar

```bash
# 1. garantir que a vitrine tá no ar
restart_managed_process label="fe" cmd="npm run dev" port=5173

# 2. tirar prints (precisa de dev server rodando)
node scripts/print.mjs

# 3. inspecionar DOM (cores, alturas, items)
node scripts/inspect.mjs

# 4. inspecionar items em ambos os temas
node scripts/inspect-text.mjs
```

## O que cada script faz

### `print.mjs` — Tira screenshots

Cria PNGs em `shots/`:
- `original-site.png` (site oficial da lib)
- `vitrine-home.png` (`http://localhost:5173/`)
- `vitrine-<componente>.png` (página de detalhe em light)
- `vitrine-<componente>-dark.png` (página de detalhe em dark, forçando `localStorage.vitrine-theme = "dark"`)

Viewport padrão: 1440×900.

### `inspect.mjs` — Diagnóstico estrutural

Imprime no stdout um JSON com:
- `wrap.rect` (dimensões do wrapper shadcn)
- `wrap.bg`, `wrap.color` (cores computadas)
- `wc.bg`, `wc.color` (cores do web component interno)
- `wc.items` (5 primeiros items com dimensões e cores)

**Como diagnosticar:**
| Sintoma | Causa | Ação |
|---|---|---|
| `wrap.rect.h: 0` | shadow DOM sem altura | adicionar `--<lib>-height` no `src/index.css` |
| `wrap.bg` ≠ `wc.bg` | variáveis de override da lib não estão sendo aplicadas | adicionar `[data-slot=...][data-theme=...] { --<lib>-*-override: ... }` |
| `items: []` mas `wc.shadowRoot` populado | seletor errado — usar `[data-item-...]` ou outro próprio da lib |

### `inspect-text.mjs` — Diagnóstico de tema

Extrai 5 items com suas cores de fundo e texto, comparando original vs vitrine (light e dark). Útil pra detectar "tudo meio cinza" quando deveria ser preto/branco.

## Setup único

```bash
npm install --save-dev playwright
npx playwright install chromium
# (se faltar libs do sistema no Chromium)
sudo apt install libglib2.0-0 libnss3 libnspr4 libdbus-1-3 libatk1.0-0 \
  libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libatspi2.0-0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2
```

## Adaptação pra uma nova lib

1. Abrir os 3 scripts.
2. Trocar `<lib-site-oficial>` pela URL do site da lib nova.
3. Trocar `<slug>` e `<componente>` pelo nome do componente sendo integrado.
4. Trocar `[data-slot=<nome>]` pelo data-slot correto (kebab-case).
5. Trocar `<lib-web-component>` pelo seletor do web component (ex.: `file-tree-container`).
6. Rodar e inspecionar saída.
