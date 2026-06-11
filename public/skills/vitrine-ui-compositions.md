---
name: vitrine-ui-compositions
description: >-
  Instalar blocos/composições inteiras (telas prontas) da Vitrine UI via o
  registry do shadcn. Use esta skill quando precisar de uma TELA completa pronta
  — landing page, dashboard, pricing, chat, IDE com IA, editor de fluxo
  (React Flow), página de produto, blog, onboarding, etc. — em vez de montar do
  zero. Um único comando baixa a tela inteira e todos os componentes que ela usa.
---

# Skill: Composições (blocos) da Vitrine UI

Você sabe instalar e usar as **composições** da Vitrine UI: telas inteiras
("blocos") montadas a partir dos componentes da vitrine — landing pages,
dashboards, pricing, chat/IA, IDE com IA, editores de nó (React Flow), PDP de
e-commerce, blog editorial, onboarding wizard, e mais.

- **Base do registry:** `https://componentes-fe-cmq0d9kr.cloud.serendiped.com`
- **Índice completo (fetch primeiro):** `https://componentes-fe-cmq0d9kr.cloud.serendiped.com/llms.txt`
- **Galeria humana:** `https://componentes-fe-cmq0d9kr.cloud.serendiped.com/compositions`

## Quando usar esta skill

Use quando o usuário pedir uma **tela/página/seção completa** ("monta uma
landing", "quero um dashboard", "uma tela de pricing", "um chat com IA", "um
editor de workflow"). Em vez de compor dezenas de componentes na mão, instale a
composição correspondente como um bloco e ajuste o conteúdo.

## Como um bloco funciona

Cada composição é instalável exatamente como um componente, mas é do tipo
`registry:block`: o comando baixa a TELA (`src/compositions/<slug>.tsx` e seus
arquivos companheiros) **e** instala automaticamente, via `registryDependencies`,
todos os componentes da vitrine que ela usa, além das dependências npm.

## Pré-requisito (uma vez por projeto)

```bash
npx shadcn@latest init
```

Tailwind v4 + shadcn inicializado (cria `components.json` e `@/lib/utils`).

## Fluxo de trabalho

1. **Descubra o slug da composição.** Fetch de `/llms.txt` (seção "Composições")
   ou consulte `/compositions`. Ex.: `landing-page`, `saas-dashboard`,
   `pricing-page`, `chat-app`, `ai-ide`, `workflow-builder`, `product-detail`.
2. **Instale o bloco inteiro:**

   ```bash
   npx shadcn@latest add https://componentes-fe-cmq0d9kr.cloud.serendiped.com/r/<slug>.json
   ```

   Exemplo (Landing page):

   ```bash
   npx shadcn@latest add https://componentes-fe-cmq0d9kr.cloud.serendiped.com/r/landing-page.json
   ```

3. **Renderize a tela.** O arquivo principal fica em
   `@/compositions/<slug>` exportando um componente em PascalCase:

   ```tsx
   import { LandingPage } from "@/compositions/landing-page"

   export default function Page() {
     return <LandingPage />
   }
   ```

4. **Personalize.** A composição é TSX comum usando `@/components/ui/*` e tokens
   shadcn — edite textos, dados, seções e estilos à vontade. É um ponto de
   partida, não uma caixa-preta.

## Observações importantes

- As composições já tratam **light/dark** via tokens shadcn.
- Algumas usam **`tw-animate-css`** (animações de overlay) e/ou pacotes pesados
  (ex.: `@xyflow/react` para editores de nó, `three`/`cobe` para 3D); o CLI
  instala as dependências declaradas automaticamente.
- O alias `@/` precisa estar configurado no `tsconfig.json` da RAIZ
  (`@/* → ./src/*`).
- Blocos com efeito de scroll/parallax pressupõem rolagem da janela — renderize
  a composição em uma página própria, não dentro de um contêiner com altura fixa.

## Regra de ouro

Se o usuário descreve uma TELA inteira, prefira instalar a **composição** mais
próxima como bloco e ajustar — entrega muito mais rápida e consistente do que
montar tudo componente por componente.
