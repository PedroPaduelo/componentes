/**
 * Examples — Container Scroll Animation (Aceternity UI).
 *
 * O efeito é dirigido por `useScroll`, então o example precisa de uma área
 * scrollável PRÓPRIA. O `ContainerScrollDemo` (arquivo separado) cria a ref
 * dessa área (`overflow-y-auto`) e a passa ao `ContainerScroll` via `scrollRef`,
 * de modo que o `scrollYProgress` evolua de 0 → 1 ao rolar DENTRO do card de
 * detalhe — sem depender da rolagem da janela. Espaço extra `min-h-[150vh]`
 * (NUNCA `min-h-screen`, que estoura o layout).
 *
 * Imagem do mockup via picsum.photos (estável, sem 404, sem dep nova) —
 * substitui o `/linear.webp` do demo original que não existe na vitrine.
 * `code` e `render` mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { ContainerScrollDemo } from "@/data/container-scroll-demo"

const containerScrollBasicExample: Example = {
  title: "Básico",
  description:
    "Role a área abaixo: o card rotaciona (rotateX), escala e o título sobe conforme o scroll.",
  code: `function ContainerScrollDemo() {
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
}`,
  render: <ContainerScrollDemo />,
}

export const examplesContainerScrollAnimation: Record<string, Example[]> = {
  "container-scroll-animation": [containerScrollBasicExample],
}
