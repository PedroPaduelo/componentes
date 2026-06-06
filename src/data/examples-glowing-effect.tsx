import { GlowingEffect } from "@/components/ui/glowing-effect"
import type { Example } from "@/data/examples"

const items: Array<{ title: string; description: string; meta: string }> = [
  {
    title: "Edge Tracking",
    description:
      "O gradiente cônico gira seguindo o ponteiro, criando um anel luminoso em movimento contínuo.",
    meta: "spread 20°",
  },
  {
    title: "Inactive Zone",
    description:
      "Uma zona morta no centro mantém o efeito discreto quando o cursor está sobre o conteúdo do card.",
    meta: "inactiveZone 0.7",
  },
  {
    title: "Proximity",
    description:
      "O halo já começa a aparecer antes de o cursor tocar a borda, dando tempo à transição.",
    meta: "proximity 64px",
  },
  {
    title: "Border Width",
    description:
      "A espessura do anel revelado pela máscara pode ser afinada para bordas mais sutis.",
    meta: "borderWidth 2px",
  },
]

const glowingEffectBasicExample: Example = {
  title: "Básico",
  description:
    "Quatro cards com efeito de borda luminosa que segue o cursor. Mova o mouse para ver o feixe girar; o glow é atualizado a cada movimento do ponteiro via requestAnimationFrame e interpolado com easing suave do motion.",
  code: `<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
  {items.map((item) => (
    <div
      key={item.title}
      className="relative h-56 rounded-2xl border border-border bg-card p-6"
    >
      <GlowingEffect
        blur={0}
        inactiveZone={0.7}
        proximity={64}
        spread={20}
        variant="default"
        borderWidth={2}
      />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {item.meta}
        </span>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>`,
  render: (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="relative h-56 rounded-2xl border border-border bg-card p-6"
        >
          <GlowingEffect
            blur={0}
            inactiveZone={0.7}
            proximity={64}
            spread={20}
            variant="default"
            borderWidth={2}
          />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {item.meta}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const examplesGlowingEffect: Record<string, Example[]> = {
  "glowing-effect": [glowingEffectBasicExample],
}
