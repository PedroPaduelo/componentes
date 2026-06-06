import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card"

import type { Example } from "@/data/examples"

const draggableCardBasic: Example = {
  title: "Básico",
  description:
    "Card arrastável da Aceternity UI com rotação 3D seguindo o cursor e física de mola (spring) ao soltar. Mova o mouse para inclinar e arraste para jogar o card — o bounce é proporcional à velocidade do gesto.",
  code: `<DraggableCardContainer className="relative h-[400px] w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center">
  <DraggableCardBody>
    <h3 className="mb-2 text-xl font-semibold text-neutral-800 dark:text-neutral-100">
      Arraste-me
    </h3>
    <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
      Mova o cursor para inclinar e segure para arrastar.
    </p>
    <p className="text-xs text-neutral-500 dark:text-neutral-500">
      Solte com velocidade e veja o card ganhar um spring com bounce.
    </p>
  </DraggableCardBody>
</DraggableCardContainer>`,
  render: (
    <div className="flex w-full justify-center py-4">
      <DraggableCardContainer className="relative h-[400px] w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center">
        <DraggableCardBody>
          <h3 className="mb-2 text-xl font-semibold text-neutral-800 dark:text-neutral-100">
            Arraste-me
          </h3>
          <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
            Mova o cursor para inclinar e segure para arrastar.
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Solte com velocidade e veja o card ganhar um spring com bounce.
          </p>
        </DraggableCardBody>
      </DraggableCardContainer>
    </div>
  ),
}

const draggableCardStacked: Example = {
  title: "Cards empilhados",
  description:
    "Dois DraggableCardBody lado-a-lado no mesmo container, cada um com sua própria cor de fundo. Demonstra como compor múltiplos cards arrastáveis dentro de um único DraggableCardContainer (que provê a perspectiva 3D compartilhada).",
  code: `<DraggableCardContainer className="relative flex h-[400px] w-full items-center justify-center gap-8 overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
  <DraggableCardBody className="bg-neutral-100 dark:bg-neutral-900">
    <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-100">
      Card A
    </h3>
    <p className="text-sm text-neutral-600 dark:text-neutral-400">
      Paleta neutra clássica da Aceternity.
    </p>
  </DraggableCardBody>
  <DraggableCardBody className="bg-emerald-50 dark:bg-emerald-950">
    <h3 className="mb-2 text-lg font-semibold text-emerald-900 dark:text-emerald-100">
      Card B
    </h3>
    <p className="text-sm text-emerald-700 dark:text-emerald-300">
      Variante colorida para destacar CTAs.
    </p>
  </DraggableCardBody>
</DraggableCardContainer>`,
  render: (
    <div className="flex w-full justify-center py-4">
      <DraggableCardContainer className="relative flex h-[400px] w-full items-center justify-center gap-8 overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
        <DraggableCardBody className="bg-neutral-100 dark:bg-neutral-900">
          <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Card A
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Paleta neutra clássica da Aceternity.
          </p>
        </DraggableCardBody>
        <DraggableCardBody className="bg-emerald-50 dark:bg-emerald-950">
          <h3 className="mb-2 text-lg font-semibold text-emerald-900 dark:text-emerald-100">
            Card B
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Variante colorida para destacar CTAs.
          </p>
        </DraggableCardBody>
      </DraggableCardContainer>
    </div>
  ),
}

export const examplesDraggableCard: Record<string, Example[]> = {
  "draggable-card": [draggableCardBasic, draggableCardStacked],
}
