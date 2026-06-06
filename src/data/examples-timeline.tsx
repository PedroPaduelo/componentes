/**
 * Examples — Timeline (Aceternity UI).
 *
 * A barra de progresso é dirigida por `useScroll`, então o example precisa de
 * uma área scrollável PRÓPRIA. O `TimelineDemo` (arquivo separado) cria a ref
 * dessa área (`overflow-y-auto`) e a passa à `Timeline` via `scrollRef`, de modo
 * que o progresso evolua de 0 → 1 ao rolar DENTRO do card de detalhe — sem
 * depender da rolagem da janela. Fica em arquivo separado para satisfazer
 * `react-refresh/only-export-components`.
 *
 * Imagens via picsum.photos (estável, sem 404, sem dep nova).
 * `code` e `render` mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { TimelineDemo } from "@/data/timeline-demo"

const timelineBasicExample: Example = {
  title: "Básico",
  description:
    "Role dentro do card: a linha vertical à esquerda cresce com um gradiente roxo→azul conforme o progresso.",
  code: `const data = [
  {
    title: "2024",
    content: (
      <p className="text-muted-foreground">
        Lançamento da primeira versão pública.
      </p>
    ),
  },
  {
    title: "2023",
    content: (
      <p className="text-muted-foreground">
        Reestruturação do design system.
      </p>
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
        data={data}
        scrollRef={scrollRef}
        heading="Changelog da jornada"
        description="Role dentro deste card: a barra à esquerda cresce conforme o progresso."
      />
    </div>
  )
}`,
  render: <TimelineDemo />,
}

export const examplesTimeline: Record<string, Example[]> = {
  timeline: [timelineBasicExample],
}
