import { LayoutTextFlip } from "@/components/ui/layout-text-flip"
import type { Example } from "@/data/examples"

const layoutTextFlipHero: Example = {
  title: "Hero básico",
  description:
    "Padrão Aceternity: título fixo + palavra que rotaciona com flip vertical (y -40 → 0 → 50) e blur. O layoutId do título permite transição suave entre seções. A pill rotativa usa tokens semânticos shadcn (bg-card + ring-border), respeitando o tema.",
  code: `<div className="flex min-h-[160px] items-center justify-center py-8">
  <LayoutTextFlip
    text="Build Amazing"
    words={["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"]}
    duration={3000}
  />
</div>`,
  render: (
    <div className="flex min-h-[160px] items-center justify-center py-8">
      <LayoutTextFlip
        text="Build Amazing"
        words={["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"]}
        duration={3000}
      />
    </div>
  ),
}

const layoutTextFlipCustom: Example = {
  title: "Ritmo + separador customizado",
  description:
    "duration controla o intervalo entre trocas; o children opcional entra entre o título fixo e a palavra rotativa (útil para separadores como '·' ou '—').",
  code: `<div className="flex min-h-[160px] items-center justify-center py-8">
  <LayoutTextFlip
    text="Construa coisas"
    words={["rápido", "bonitas", "modernas", "acessíveis"]}
    duration={2000}
  >
    <span className="text-2xl font-bold text-muted-foreground md:text-4xl">·</span>
  </LayoutTextFlip>
</div>`,
  render: (
    <div className="flex min-h-[160px] items-center justify-center py-8">
      <LayoutTextFlip
        text="Construa coisas"
        words={["rápido", "bonitas", "modernas", "acessíveis"]}
        duration={2000}
      >
        <span className="text-2xl font-bold text-muted-foreground md:text-4xl">·</span>
      </LayoutTextFlip>
    </div>
  ),
}

export const examplesLayoutTextFlip: Record<string, Example[]> = {
  "layout-text-flip": [layoutTextFlipHero, layoutTextFlipCustom],
}
