import { CreepyButton } from "@/components/ui/creepy-button"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                            creepy-button                                   */
/* -------------------------------------------------------------------------- */

const creepyButtonDefault: Example = {
  title: "Básico",
  description:
    "Botão com olhos que seguem o cursor, piscar periódico e cover rotacionando em hover.",
  code: `<CreepyButton>Hover Me</CreepyButton>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <CreepyButton>Hover Me</CreepyButton>
    </div>
  ),
}

const creepyButtonCustomCover: Example = {
  title: "Cover customizado",
  description:
    "Sobrescreve as cores do cover (a parte que rotaciona) via coverClassName.",
  code: `<CreepyButton coverClassName="bg-red-500 text-white">
  Don't Click
</CreepyButton>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <CreepyButton coverClassName="bg-red-500 text-white">
        Don't Click
      </CreepyButton>
    </div>
  ),
}

const creepyButtonLongText: Example = {
  title: "Texto longo",
  description:
    "Largura mínima de 9em garante que o botão mantém tamanho confortável mesmo com texto mais longo.",
  code: `<CreepyButton>Creepy Long Button</CreepyButton>`,
  render: (
    <div className="flex items-center justify-center py-6">
      <CreepyButton>Creepy Long Button</CreepyButton>
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  registry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Registry of curated examples for the VengenceUI creepy-button batch.
 * Keyed by component slug; consumed by the showcase.
 */
export const creepyButtonExamples: Record<string, Example[]> = {
  "creepy-button": [
    creepyButtonDefault,
    creepyButtonCustomCover,
    creepyButtonLongText,
  ],
}
