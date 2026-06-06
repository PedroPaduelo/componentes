import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import type { Example } from "@/data/examples"

const hoverBorderGradientButton: Example = {
  title: "Botão com borda gradiente",
  description:
    "Passe o mouse no botão: a borda deixa de ciclar e preenche com o highlight azul (#3275F8). `duration` controla a velocidade do ciclo (1s = uma rotação por segundo). `as='button'` é o default.",
  code: `<div className="flex min-h-[120px] items-center justify-center">
  <HoverBorderGradient
    containerClassName="rounded-full"
    className="px-6 py-2 text-sm font-medium"
  >
    Hover me
  </HoverBorderGradient>
</div>`,
  render: (
    <div className="flex min-h-[120px] items-center justify-center">
      <HoverBorderGradient
        containerClassName="rounded-full"
        className="px-6 py-2 text-sm font-medium"
      >
        Hover me
      </HoverBorderGradient>
    </div>
  ),
}

const hoverBorderGradientLink: Example = {
  title: "Como link (polimórfico)",
  description:
    "Use `as='a'` (ou qualquer outro tag) e propague `href`. As cores de borda/miolo continuam fixas — a paleta é parte do efeito visual, não segue o tema.",
  code: `<div className="flex min-h-[120px] items-center justify-center">
  <HoverBorderGradient
    as="a"
    href="https://ui.aceternity.com/components/hover-border-gradient"
    target="_blank"
    rel="noreferrer"
    containerClassName="rounded-full"
    className="px-6 py-2 text-sm font-medium"
  >
    Ver referência ↗
  </HoverBorderGradient>
</div>`,
  render: (
    <div className="flex min-h-[120px] items-center justify-center">
      <HoverBorderGradient
        as="a"
        href="https://ui.aceternity.com/components/hover-border-gradient"
        target="_blank"
        rel="noreferrer"
        containerClassName="rounded-full"
        className="px-6 py-2 text-sm font-medium"
      >
        Ver referência ↗
      </HoverBorderGradient>
    </div>
  ),
}

export const examplesHoverBorderGradient: Record<string, Example[]> = {
  "hover-border-gradient": [hoverBorderGradientButton, hoverBorderGradientLink],
}
