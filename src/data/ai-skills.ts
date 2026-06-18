/**
 * Skills para IA — metadados das instruções (SKILL.md) que ensinam uma IA a
 * instalar e usar os componentes e as composições da vitrine.
 *
 * O CONTEÚDO canônico de cada skill é um arquivo markdown estático servido em
 * `/skills/<slug>.md` (ver `public/skills/`). Este módulo guarda só os
 * metadados consumidos pela UI (página de instalação + índice para IA): título,
 * descrição, quando usar e a URL pública do arquivo. A UI busca o `.md` por
 * fetch quando o usuário copia/baixa — sem duplicar o conteúdo aqui.
 */

import { REGISTRY_BASE_URL } from "@/data/component-install"

export interface AiSkill {
  /** Identificador/arquivo da skill (sem extensão). */
  slug: string
  /** Título legível. */
  title: string
  /** Descrição curta (o que a skill habilita). */
  description: string
  /** Quando a IA deve acionar a skill. */
  whenToUse: string
  /** Caminho público do `.md` (relativo à origem). Ex.: `/skills/<slug>.md`. */
  path: string
  /** URL pública absoluta do `.md`. */
  url: string
}

export const aiSkills: AiSkill[] = [
  {
    slug: "vitrine-ui-components",
    title: "Componentes da Vitrine UI",
    description:
      "Acervo de componentes React feito para IA — ensina uma IA a instalar e consumir qualquer um dos ~200 componentes via CLI do shadcn, incluindo o pré-requisito, a convenção de API única e os gotchas (tw-animate-css, alias @/).",
    whenToUse:
      "Quando o usuário pede para adicionar/usar um elemento de interface (botão, formulário, card, menu, efeito, background…).",
    path: "/skills/vitrine-ui-components.md",
    url: `${REGISTRY_BASE_URL}/skills/vitrine-ui-components.md`,
  },
  {
    slug: "vitrine-ui-compositions",
    title: "Composições (blocos) da Vitrine UI",
    description:
      "Acervo de componentes React feito para IA — ensina uma IA a instalar uma TELA inteira como bloco único (o comando baixa a composição e todos os componentes que ela usa) e a renderizá-la e personalizá-la.",
    whenToUse:
      "Quando o usuário pede uma tela/página completa (landing, dashboard, pricing, chat/IA, editor de fluxo, PDP, blog, onboarding…).",
    path: "/skills/vitrine-ui-compositions.md",
    url: `${REGISTRY_BASE_URL}/skills/vitrine-ui-compositions.md`,
  },
]

/** Busca uma skill pelo slug. */
export function getAiSkill(slug: string): AiSkill | undefined {
  return aiSkills.find((s) => s.slug === slug)
}

/** Skill recomendada para as composições (usada no prompt do botão de bloco). */
export const COMPOSITIONS_SKILL = aiSkills[1]

/** Skill recomendada para os componentes. */
export const COMPONENTS_SKILL = aiSkills[0]
