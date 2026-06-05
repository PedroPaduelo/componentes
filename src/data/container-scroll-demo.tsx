/**
 * Demo interno do Container Scroll Animation usado no example da vitrine.
 *
 * Precisa ser um componente próprio (com `useRef`) para passar a ref da área
 * scrollável (`overflow-y-auto`) ao `ContainerScroll` via `scrollRef`, de modo
 * que o efeito seja dirigido pela rolagem DENTRO do card de detalhe. Fica em
 * arquivo separado para satisfazer `react-refresh/only-export-components` (o
 * arquivo de examples só pode exportar não-componentes).
 */

import * as React from "react"

import { ContainerScroll } from "@/components/ui/container-scroll-animation"

function ContainerScrollDemo() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollRef}
      className="h-[500px] w-full overflow-y-auto rounded-lg border border-border bg-background"
    >
      <div className="flex min-h-[150vh] flex-col">
        <ContainerScroll
          scrollRef={scrollRef}
          titleComponent={
            <h1 className="text-3xl font-semibold text-foreground">
              Scroll para revelar <br />
              <span className="mt-1 block text-4xl leading-none font-bold md:text-[5rem]">
                Scroll Animations
              </span>
            </h1>
          }
        >
          <img
            src="https://picsum.photos/seed/scroll/1400/720"
            alt="Mockup"
            className="mx-auto h-full w-full rounded-2xl object-cover object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </div>
    </div>
  )
}

export { ContainerScrollDemo }
