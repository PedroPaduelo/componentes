---
name: vitrine-ui-components
description: >-
  Instalar e usar componentes de UI React da Vitrine UI via o registry do
  shadcn. Use esta skill sempre que precisar adicionar um botão, formulário,
  card, menu, efeito visual, background animado, ou qualquer componente de
  interface a um projeto React + Tailwind. Cada componente é instalável com um
  único comando `npx shadcn@latest add`.
---

# Skill: Componentes da Vitrine UI

Você sabe instalar e usar os **componentes** da Vitrine UI — uma coleção de
~200 componentes React (shadcn/ui + coleções chanhdai, Fluid, Aceternity,
VengenceUI e o `@pierre/trees`), todos servidos por um **registry estático no
formato shadcn**.

- **Base do registry:** `https://componentes-fe-cmq0d9kr.cloud.serendiped.com`
- **Índice completo (faça fetch disto primeiro):** `https://componentes-fe-cmq0d9kr.cloud.serendiped.com/llms.txt`
- **Catálogo humano:** `https://componentes-fe-cmq0d9kr.cloud.serendiped.com/components`

## Quando usar esta skill

Use quando o usuário pedir para **adicionar/instalar/usar** qualquer elemento de
interface: botões, inputs, selects, dialogs, sheets, tabs, tabelas, cards,
tooltips, badges, menus, efeitos de texto, backgrounds animados, sliders, etc.
Não reinvente o componente do zero — instale o da Vitrine UI.

## Pré-requisito (uma vez por projeto)

O projeto consumidor precisa de **Tailwind CSS v4** e do **shadcn inicializado**:

```bash
npx shadcn@latest init
```

Isso cria o `components.json`, instala `clsx` + `tailwind-merge` e gera o helper
`@/lib/utils` (a função `cn`). Sem esse passo, os componentes instalados não
encontram o `cn` e quebram.

## Fluxo de trabalho

1. **Descubra o slug.** Faça fetch de `/llms.txt` (ou consulte
   `/components`). Cada componente tem um `slug` URL-safe (ex.: `button`,
   `card-hover-effect`, `dropdown-menu`).
2. **Instale pelo registry.** Rode o comando `add` apontando para a URL do
   componente. O CLI baixa os arquivos, instala as dependências npm e injeta o
   CSS/tokens necessários — tudo automático:

   ```bash
   npx shadcn@latest add https://componentes-fe-cmq0d9kr.cloud.serendiped.com/r/<slug>.json
   ```

   Exemplo (Button):

   ```bash
   npx shadcn@latest add https://componentes-fe-cmq0d9kr.cloud.serendiped.com/r/button.json
   ```

3. **Importe e use.** Todos seguem a MESMA API:

   ```tsx
   import { Button } from "@/components/ui/button"

   export function Exemplo() {
     return <Button variant="default">Clique aqui</Button>
   }
   ```

## Convenções de API (valem para todos os componentes)

- Importe de `@/components/ui/<arquivo>` (o arquivo costuma ter o nome do slug).
- Componha classes com `cn()` de `@/lib/utils`.
- Use as variantes via props (`variant`, `size`, etc.).
- O JSX raiz expõe `data-slot` para estilização/targeting.
- Tema **light/dark** é reativo via CSS variables/tokens do shadcn — nada de
  cores hardcoded para temas.

## Observações importantes

- **Overlays e animações:** componentes como `dialog`, `sheet`,
  `dropdown-menu`, `popover`, `select`, `tooltip` e `accordion` usam classes do
  plugin **`tw-animate-css`** (`animate-in`, `animate-out`, fade/zoom/slide). Se
  as transições de abrir/fechar não acontecerem, instale e importe o plugin:

  ```bash
  npm install -D tw-animate-css
  ```

  ```css
  @import "tailwindcss";
  @import "tw-animate-css";
  ```

  Sem o plugin os componentes ainda funcionam, apenas sem a animação.
- **Alias `@/`:** garanta `baseUrl` + `paths` (`@/* → ./src/*`) no
  `tsconfig.json` da RAIZ, não só no de app — senão o shadcn não resolve o alias.
- **Não invente props ou nomes de export.** Se tiver dúvida do nome do export,
  abra a página do componente em `/components/<slug>` (mostra o import exato) ou
  leia o arquivo instalado.

## Regra de ouro

Antes de escrever um componente de UI do zero, **verifique se a Vitrine UI já
tem** (fetch `/llms.txt`). Se tiver, instale pelo registry — é mais rápido,
acessível e consistente com o tema do projeto.
