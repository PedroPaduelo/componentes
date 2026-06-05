import { TooltipCard } from "@/components/ui/tooltip-card"

import type { Example } from "@/data/examples"

const tooltipCardBasicExample: Example = {
  title: "Básico",
  description:
    "Tooltip de texto simples inline num parágrafo. Aparece no hover e segue o cursor.",
  code: `<p className="max-w-md text-center text-muted-foreground">
  A Aceternity UI é uma coleção de{" "}
  <TooltipCard content="Componentes React copy-paste com animações via motion/react.">
    <span className="cursor-help font-medium text-foreground underline decoration-dotted underline-offset-4">
      componentes animados
    </span>
  </TooltipCard>{" "}
  prontos pra produção.
</p>`,
  render: (
    <p className="max-w-md text-center text-muted-foreground">
      A Aceternity UI é uma coleção de{" "}
      <TooltipCard content="Componentes React copy-paste com animações via motion/react.">
        <span className="cursor-help font-medium text-foreground underline decoration-dotted underline-offset-4">
          componentes animados
        </span>
      </TooltipCard>{" "}
      prontos pra produção.
    </p>
  ),
}

const tooltipCardRichExample: Example = {
  title: "Card rico",
  description:
    "O content pode ser um card React completo: avatar, nome e bio.",
  code: `<p className="text-center text-muted-foreground">
  Feito por{" "}
  <TooltipCard
    content={
      <div className="flex items-center gap-3">
        <img
          src="https://picsum.photos/seed/tyler/80/80"
          alt="Tyler Durden"
          className="size-12 shrink-0 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-medium text-foreground">Tyler Durden</span>
          <span className="text-xs">Criador de interfaces e caos.</span>
        </div>
      </div>
    }
  >
    <span className="cursor-pointer font-medium text-foreground underline decoration-dotted underline-offset-4">
      @tyler
    </span>
  </TooltipCard>
</p>`,
  render: (
    <p className="text-center text-muted-foreground">
      Feito por{" "}
      <TooltipCard
        content={
          <div className="flex items-center gap-3">
            <img
              src="https://picsum.photos/seed/tyler/80/80"
              alt="Tyler Durden"
              className="size-12 shrink-0 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Tyler Durden</span>
              <span className="text-xs">Criador de interfaces e caos.</span>
            </div>
          </div>
        }
      >
        <span className="cursor-pointer font-medium text-foreground underline decoration-dotted underline-offset-4">
          @tyler
        </span>
      </TooltipCard>
    </p>
  ),
}

export const examplesTooltipCard: Record<string, Example[]> = {
  "tooltip-card": [tooltipCardBasicExample, tooltipCardRichExample],
}
