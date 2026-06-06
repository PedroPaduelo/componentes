import { GlareCard } from "@/components/ui/glare-card"
import { Sparkles } from "lucide-react"

import type { Example } from "@/data/examples"

const glareCardBasicExample: Example = {
  title: "Básico",
  description:
    "Passe o mouse sobre o card para ver o brilho/glare 3D e o gradiente rainbow seguirem o cursor.",
  code: `<GlareCard className="max-w-xs">
  <div className="flex h-full flex-col items-start justify-end p-6 text-white">
    <Sparkles className="mb-2 size-6 text-white/80" />
    <h3 className="text-lg font-semibold">Hover me</h3>
    <p className="mt-1 text-sm text-white/70">
      Card Aceternity com efeito glare/foil.
    </p>
  </div>
</GlareCard>`,
  render: (
    <div className="flex w-full justify-center py-8">
      <GlareCard className="max-w-xs">
        <div className="flex h-full flex-col items-start justify-end p-6 text-white">
          <Sparkles className="mb-2 size-6 text-white/80" />
          <h3 className="text-lg font-semibold">Hover me</h3>
          <p className="mt-1 text-sm text-white/70">
            Card Aceternity com efeito glare/foil.
          </p>
        </div>
      </GlareCard>
    </div>
  ),
}

export const examplesGlareCard: Record<string, Example[]> = {
  "glare-card": [glareCardBasicExample],
}
