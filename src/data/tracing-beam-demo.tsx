import * as React from "react"

import { TracingBeam } from "@/components/ui/tracing-beam"

const SECTIONS = [
  {
    badge: "Introdução",
    title: "O beam segue a sua leitura",
    body: "Conforme você rola a área abaixo, o feixe luminoso à esquerda preenche o caminho com um gradiente que evolui do ciano ao violeta — guiando o olhar pelo conteúdo, seção a seção.",
  },
  {
    badge: "Como funciona",
    title: "Dirigido por scroll",
    body: "O componente usa motion (useScroll + useSpring) para transformar o progresso de rolagem em duas coordenadas do gradiente do SVG. O resultado é um movimento suave, com inércia, que acompanha a velocidade da leitura.",
  },
  {
    badge: "Conteúdo rico",
    title: "Combina com qualquer markup",
    body: "Coloque parágrafos, imagens, cards ou listas dentro do TracingBeam: o feixe se ajusta automaticamente à altura total do conteúdo, mantendo a marcação visual ao lado de tudo.",
  },
  {
    badge: "Conclusão",
    title: "Pronto para destacar artigos",
    body: "Ideal para posts longos, documentação e landing pages narrativas, o Tracing Beam adiciona uma camada de storytelling visual sem competir com o texto.",
  },
]

function TracingBeamDemo() {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollRef}
      className="h-[460px] w-full overflow-y-auto rounded-lg border border-border bg-background"
    >
      <div className="px-6 py-10 md:px-24">
        <TracingBeam scrollRef={scrollRef}>
          <div className="flex flex-col gap-12">
            {SECTIONS.map((s) => (
              <div key={s.title} className="flex flex-col gap-3">
                <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {s.badge}
                </span>
                <h3 className="text-xl font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(s.title)}/800/320`}
                  alt=""
                  className="mt-2 h-40 w-full rounded-xl object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </TracingBeam>
      </div>
    </div>
  )
}

export { TracingBeamDemo }
