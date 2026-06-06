/**
 * Demo interno da Timeline usado no example da vitrine.
 *
 * Precisa ser um componente próprio (com `useRef`) para passar a ref da área
 * scrollável (`overflow-y-auto`) à `Timeline` via `scrollRef`, de modo que a
 * barra de progresso seja dirigida pela rolagem DENTRO do card de detalhe. Fica
 * em arquivo separado para satisfazer `react-refresh/only-export-components` (o
 * arquivo de examples só pode exportar não-componentes).
 */

import * as React from "react"

import { Timeline } from "@/components/ui/timeline"
import type { TimelineEntry } from "@/components/ui/timeline-types"

const timelineData: TimelineEntry[] = [
  {
    title: "2024",
    content: (
      <div>
        <p className="mb-4 text-sm font-normal text-muted-foreground md:text-base">
          Lançamento da primeira versão pública, com foco em performance e
          acessibilidade.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://picsum.photos/seed/timeline-a1/500/300"
            alt="Marco 2024 - imagem 1"
            className="h-20 w-full rounded-lg object-cover shadow md:h-44 lg:h-60"
            draggable={false}
          />
          <img
            src="https://picsum.photos/seed/timeline-a2/500/300"
            alt="Marco 2024 - imagem 2"
            className="h-20 w-full rounded-lg object-cover shadow md:h-44 lg:h-60"
            draggable={false}
          />
        </div>
      </div>
    ),
  },
  {
    title: "Início de 2023",
    content: (
      <div>
        <p className="mb-4 text-sm font-normal text-muted-foreground md:text-base">
          Reestruturação completa do design system e migração para tokens
          semânticos.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://picsum.photos/seed/timeline-b1/500/300"
            alt="Marco 2023 - imagem 1"
            className="h-20 w-full rounded-lg object-cover shadow md:h-44 lg:h-60"
            draggable={false}
          />
          <img
            src="https://picsum.photos/seed/timeline-b2/500/300"
            alt="Marco 2023 - imagem 2"
            className="h-20 w-full rounded-lg object-cover shadow md:h-44 lg:h-60"
            draggable={false}
          />
        </div>
      </div>
    ),
  },
  {
    title: "2022",
    content: (
      <div>
        <p className="mb-4 text-sm font-normal text-muted-foreground md:text-base">
          Primeiros protótipos e validação da ideia com a comunidade.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-4 text-sm text-muted-foreground md:text-base">
          <li>Definição da arquitetura de componentes</li>
          <li>Escolha da stack (React + Tailwind)</li>
          <li>Primeira release interna</li>
        </ul>
        <img
          src="https://picsum.photos/seed/timeline-c1/1000/300"
          alt="Marco 2022"
          className="h-20 w-full rounded-lg object-cover shadow md:h-44 lg:h-60"
          draggable={false}
        />
      </div>
    ),
  },
]

function TimelineDemo() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollRef}
      className="h-[500px] w-full overflow-y-auto rounded-lg border border-border bg-background"
    >
      <Timeline
        data={timelineData}
        scrollRef={scrollRef}
        heading="Changelog da jornada"
        description="Role dentro deste card: a barra à esquerda cresce conforme o progresso."
      />
    </div>
  )
}

export { TimelineDemo }
