/**
 * Examples — Tracing Beam (Aceternity UI).
 *
 * O feixe é dirigido por `useScroll`, então o example precisa de uma área
 * scrollável PRÓPRIA. O `TracingBeamDemo` (arquivo separado) cria a ref dessa
 * área (`overflow-y-auto`) e a passa ao `TracingBeam` via `scrollRef`, de modo
 * que o gradiente evolua de 0 → 1 ao rolar DENTRO do card de detalhe — sem
 * depender da rolagem da janela.
 *
 * Imagens via picsum.photos (estáveis, sem dep nova). `code` e `render`
 * mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { TracingBeamDemo } from "@/data/tracing-beam-demo"

const tracingBeamBasicExample: Example = {
  title: "Básico",
  description:
    "Role a área abaixo: o feixe à esquerda preenche com um gradiente conforme o conteúdo avança.",
  code: `function TracingBeamDemo() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollRef}
      className="h-[460px] w-full overflow-y-auto rounded-lg border border-border bg-background"
    >
      <div className="px-6 py-10 md:px-24">
        <TracingBeam scrollRef={scrollRef}>
          <div className="flex flex-col gap-12">
            <section className="flex flex-col gap-3">
              <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs">
                Introdução
              </span>
              <h3 className="text-xl font-semibold">O beam segue a leitura</h3>
              <p className="text-sm text-muted-foreground">
                Conforme você rola, o feixe luminoso preenche o caminho.
              </p>
            </section>
            {/* ...mais seções... */}
          </div>
        </TracingBeam>
      </div>
    </div>
  )
}`,
  render: <TracingBeamDemo />,
}

export const examplesTracingBeam: Record<string, Example[]> = {
  "tracing-beam": [tracingBeamBasicExample],
}
