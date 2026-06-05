# Vitrine UI

Catálogo interativo de componentes React baseados em [shadcn/ui](https://ui.shadcn.com). Explore, copie código e use em seus projetos.

## Demo

Acesse a versão online: [componentes-fe-cmq0d9kr.cloud.serendiped.com](https://componentes-fe-cmq0d9kr.cloud.serendiped.com)

## Stack

- **React 19** + **TypeScript** (strict)
- **Vite 6** (build e dev server)
- **Tailwind CSS v4** (sem `tailwind.config.js`, via plugin `@tailwindcss/vite`)
- **shadcn/ui** (estilo New York, base color Neutral, CSS variables)
- **React Router v6** (SPA com `BrowserRouter`)
- **Lucide React** (ícones)

## Como rodar

```bash
# Instalar dependências
npm install

# Dev server (porta 5173)
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Como buildar

```bash
# Build de produção (vai para dist/)
npm run build

# Preview do build (porta 4173)
npm run preview
```

## Como fazer lint

```bash
npm run lint
```

## Funcionalidades

- **Catálogo** (`/`): grid de componentes com busca por nome/tags e filtro por categoria.
- **Detalhe** (`/components/:slug`): página com preview ao vivo, código copiável (tabs Preview/Código).
- **Tema dark/light**: toggle manual + respeita `prefers-color-scheme` no primeiro acesso. Persistido em `localStorage`.
- **Responsivo**: header colapsa em menu lateral (Sheet) no mobile; grid e blocos adaptam a telas estreitas.
- **Rotas**: catch-all `*` para páginas não encontradas; deep-links em `/components/:slug` funcionam em dev e preview.

## Componentes documentados

| Componente | Categoria | Slug | Fonte |
|---|---|---|---|
| Button | Actions | `button` | shadcn/ui |
| Dropdown Menu | Actions | `dropdown-menu` | shadcn/ui |
| Card | Layout | `card` | shadcn/ui |
| Dialog | Layout | `dialog` | shadcn/ui |
| Sheet | Layout | `sheet` | shadcn/ui |
| Tabs | Layout | `tabs` | shadcn/ui |
| **Tree** | Layout | `tree` | [`@pierre/trees`](https://trees.software) (adaptado) |
| Input | Forms | `input` | shadcn/ui |
| Checkbox | Forms | `checkbox` | shadcn/ui |
| Badge | Feedback | `badge` | shadcn/ui |

## Adicionando novos componentes

Todo componente adicionado — próprio shadcn **ou** adaptador de uma lib externa — segue a mesma API padronizada:

- **Localização**: `src/components/ui/<nome>.tsx` (+ `<nome>-variants.ts` se tiver variantes)
- **Variants via `cva`** (class-variance-authority)
- **Props com `data-slot`** no JSX raiz, **`cn()`** para merge de className
- **Tipo**: `Props = Omit<HTMLAttributes<...>,'children'> & VariantProps<typeof variants> & { ...específicas }`
- **Re-exportado** em `src/components/ui/index.ts` (barrel)
- **Registrado** em `src/data/components.ts` (slug, name, category, description, tags)
- **≥1 example** em `src/data/examples.tsx`
- Se importar **lib externa**, declarar a dep em `package.json` + `npm install` (build reproduzível obrigatório)
- Build (`npm run build`) e lint (`npm run lint`) devem passar **0 erros / 0 warnings** antes de commitar

Exemplo de adaptador: `Tree` consome `@pierre/trees` real por baixo e expõe `data` (array de paths) + `header` + `initialExpansion` + `search` + `density` + `variant` + `onSelectionChange` — mesma forma de consumo de Button, Card, etc.

## Estrutura do projeto

```
src/
├── App.tsx                    # Rotas (BrowserRouter)
├── main.tsx                   # Entry (ThemeProvider + BrowserRouter)
├── index.css                  # Tailwind v4 + tokens shadcn
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Nav desktop + Sheet mobile
│   │   ├── Footer.tsx         # Rodapé
│   │   └── Layout.tsx         # Outlet + Header/Footer
│   ├── catalog/
│   │   ├── ComponentCard.tsx  # Card no grid
│   │   ├── SearchInput.tsx    # Campo de busca
│   │   ├── CategoryFilter.tsx # Filtro por categoria
│   │   └── EmptyState.tsx     # Estado vazio da busca
│   ├── showcase/
│   │   ├── ExampleBlock.tsx   # Tabs Preview/Código
│   │   ├── CodeBlock.tsx      # Bloco de código + CopyButton
│   │   └── CopyButton.tsx     # Botão copiar com feedback
│   ├── theme/
│   │   ├── theme-provider.tsx # Context/Provider (dark/light/system)
│   │   └── theme-toggle.tsx   # Botão toggle Sun/Moon
│   └── ui/                    # Componentes shadcn (button, card, ...)
├── data/
│   ├── components.ts          # Registry de componentes
│   └── examples.tsx           # Exemplos por slug
└── pages/
    ├── Home.tsx               # Catálogo + hero
    ├── ComponentDetail.tsx    # Detalhe /components/:slug
    └── NotFound.tsx           # 404 (variant component | page)
```

## Convenções

- Path alias `@/` → `./src` (configurado em `tsconfig.app.json` e `vite.config.ts`)
- Sem `tailwind.config.js`: tokens via `@theme inline` e CSS variables em `index.css`
- Componentes shadcn com `data-slot` attribute para compatibilidade com Tailwind v4
