import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import type { Example } from "@/data/examples"

const examplesPlaceholdersBasic: Example = {
  title: "Básico",
  description:
    "Campo de texto com placeholders animados que desaparecem ao focar. O texto 'vanish' ao enviar com loading no botão.",
  code: `<PlaceholdersAndVanishInput
  placeholders={[
    "Qual sua stack favorita?",
    "O que você está construindo?",
    "Qual seu maior desafio?",
  ]}
  onChange={(e) => console.log(e.target.value)}
  onSubmit={(e) => {
    e.preventDefault()
    console.log("submitted")
  }}
/>`,
  render: (
    <div className="flex w-full items-center justify-center p-6">
      <PlaceholdersAndVanishInput
        placeholders={[
          "Qual sua stack favorita?",
          "O que você está construindo?",
          "Qual seu maior desafio?",
        ]}
        onChange={() => {}}
        onSubmit={(e) => e.preventDefault()}
      />
    </div>
  ),
}

const examplesPlaceholdersSearch: Example = {
  title: "Busca",
  description:
    "Input de busca com placeholders sugestivos e intervalo de rotação personalizado.",
  code: `<PlaceholdersAndVanishInput
  placeholders={[
    "Buscar componentes...",
    "Ex: button, card, dialog",
    "Procurar na vitrine...",
  ]}
  placeholderIntervalMs={2500}
  onChange={(e) => console.log(e.target.value)}
  onSubmit={(e) => {
    e.preventDefault()
    console.log("search submitted")
  }}
/>`,
  render: (
    <div className="flex w-full items-center justify-center p-6">
      <PlaceholdersAndVanishInput
        placeholders={[
          "Buscar componentes...",
          "Ex: button, card, dialog",
          "Procurar na vitrine...",
        ]}
        placeholderIntervalMs={2500}
        onChange={() => {}}
        onSubmit={(e) => e.preventDefault()}
      />
    </div>
  ),
}

export const examplesPlaceholdersAndVanishInput: Record<string, Example[]> = {
  "placeholders-and-vanish-input": [examplesPlaceholdersBasic, examplesPlaceholdersSearch],
}
