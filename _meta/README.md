# `_meta/` — bastidor do workspace

Esta pasta concentra **todo o bastidor** do projeto: scripts de automação,
validadores headless, testes auxiliares, mockups, rascunhos e artefatos
efêmeros. O objetivo é manter a **raiz do repositório limpa** — só o que é
código de produção, configuração de build e documentação de produto fica fora
daqui.

> A documentação de **produto** continua em `docs/` na raiz (permitido). Caso
> um dia o projeto precise de documentação HTML estática (mini-site), crie
> `docs-html/` na raiz **sob demanda** — ela não existe ainda e não deve ser
> criada preventivamente.

## Estrutura

```
_meta/
├── README.md                 ← este manifesto
├── scripts/                  ← scripts versionados (automação)
│   ├── README.md
│   ├── lote/                 ← geração/build/enrich/auditoria em massa (ex.: chanhdai)
│   ├── db/                   ← scripts de banco/seed/migração auxiliar
│   └── lib/                  ← helpers compartilhados entre scripts
├── playwright/               ← validação headless (val-*.mjs + _shots.mjs)
│   └── README.md
├── tests/                    ← testes auxiliares / sandboxes de teste
│   └── README.md
├── mockups/                  ← mockups, protótipos visuais, referências
│   └── README.md
└── scratch/                  ← rascunhos e artefatos EFÊMEROS (gitignored)
    ├── README.md
    └── .gitignore
```

## Onde colocar cada coisa

| Tipo de arquivo | Onde vai | Versionado? |
| --- | --- | --- |
| Script de geração/build/auditoria em massa | `_meta/scripts/lote/` | ✅ sim |
| Script de banco/seed/migração auxiliar | `_meta/scripts/db/` | ✅ sim |
| Helper compartilhado entre scripts | `_meta/scripts/lib/` | ✅ sim |
| Validador Playwright de componente | `_meta/playwright/val-*.mjs` | ✅ sim |
| Helper de output do Playwright | `_meta/playwright/_shots.mjs` | ✅ sim |
| Script Playwright efêmero (probe/diag/inspect/debug) | `_meta/playwright/` | ❌ ignorado |
| Teste auxiliar / sandbox de teste | `_meta/tests/` | ✅ sim |
| Mockup / protótipo / referência visual | `_meta/mockups/` | ✅ sim |
| Screenshot / dump / JSON de inspeção | `_meta/scratch/shots/` | ❌ ignorado |
| Rascunho temporário, arquivo "de teste rápido" | `_meta/scratch/` | ❌ ignorado |
| **Documentação de produto** | `docs/` (raiz) | ✅ sim |
| **Documentação HTML estática** | `docs-html/` (raiz, sob demanda) | ✅ sim |
| **Código de produção** | `src/` (raiz) | ✅ sim |
| Upload de runtime do backend | `uploads/` (raiz) | ❌ ignorado |

## Regras

- **Nada de bastidor solto na raiz.** Scripts, rascunhos, prints e temporários
  vivem aqui dentro, nunca em `/workspace/`.
- **Artefatos efêmeros vão em `_meta/scratch/`** (gitignored) — nunca commite
  screenshots, dumps ou arquivos de "teste rápido".
- **`_meta/playwright/` só versiona `val-*.mjs`, `_shots.mjs` e `README.md`** —
  todo o resto (probes, diags, inspects) é ignorado.
- **Permissões**: `_meta/playwright/` e `_meta/scripts/` podem ser `root:root` no
  sandbox → use as tools `sandbox_fs_*` para criar/mover/editar (o shell dá
  `EACCES`). Output de runtime sempre em `_meta/scratch/` (gravável).
