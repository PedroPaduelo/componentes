import {
  TextRevealCard,
  TextRevealCardDescription,
  TextRevealCardTitle,
} from "@/components/ui/text-reveal-card"

import type { Example } from "@/data/examples"

const textRevealCardBasic: Example = {
  title: "Básico",
  description:
    "Card da Aceternity UI com um texto escondido que é revelado progressivamente conforme o mouse arrasta da esquerda pra direita (clip-path animado por motion). Estrelinhas brancas piscam no fundo escuro do card (#1d1c20).",
  code: `<TextRevealCard
  text="This is a secret message you need to hover to reveal"
  revealText="Hover to reveal the secret"
>
  <TextRevealCardTitle>The secret is in the reveal</TextRevealCardTitle>
  <TextRevealCardDescription>
    Move the mouse across the card to reveal the hidden message.
  </TextRevealCardDescription>
</TextRevealCard>`,
  render: (
    <div className="flex w-full items-center justify-center py-6">
      <TextRevealCard
        text="This is a secret message you need to hover to reveal"
        revealText="Hover to reveal the secret"
      >
        <TextRevealCardTitle>The secret is in the reveal</TextRevealCardTitle>
        <TextRevealCardDescription>
          Move the mouse across the card to reveal the hidden message.
        </TextRevealCardDescription>
      </TextRevealCard>
    </div>
  ),
}

const textRevealCardCustom: Example = {
  title: "Custom (português)",
  description:
    "Variante com texto em português e título/descrição customizados — útil para CTAs misteriosos, easter eggs ou cards de marketing que precisam de uma camada extra de curiosidade.",
  code: `<TextRevealCard
  text="A resposta está escondida nas estrelas"
  revealText="✨ A resposta é você mesmo ✨"
>
  <TextRevealCardTitle>Aceternity UI</TextRevealCardTitle>
  <TextRevealCardDescription>
    Passe o mouse para descobrir o que brilha no escuro.
  </TextRevealCardDescription>
</TextRevealCard>`,
  render: (
    <div className="flex w-full items-center justify-center py-6">
      <TextRevealCard
        text="A resposta está escondida nas estrelas"
        revealText="✨ A resposta é você mesmo ✨"
      >
        <TextRevealCardTitle>Aceternity UI</TextRevealCardTitle>
        <TextRevealCardDescription>
          Passe o mouse para descobrir o que brilha no escuro.
        </TextRevealCardDescription>
      </TextRevealCard>
    </div>
  ),
}

export const examplesTextRevealCard: Record<string, Example[]> = {
  "text-reveal-card": [textRevealCardBasic, textRevealCardCustom],
}
