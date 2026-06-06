import {
  TypewriterEffect,
  TypewriterEffectSmooth,
} from "@/components/ui/typewriter-effect"

import type { Example } from "@/data/examples"

const typewriterBasic: Example = {
  title: "Básico",
  description:
    "Modo letra a letra: cada caractere entra com stagger de 0.1s quando o bloco aparece na viewport. Cursor azul (token --primary do shadcn) pisca em loop.",
  code: `<TypewriterEffect
  words={[
    { text: "Crie" },
    { text: "experiências" },
    { text: "incríveis", className: "text-primary" },
    { text: "com a", },
    { text: "vitrine.", className: "text-primary" },
  ]}
/>`,
  render: (
    <div className="min-h-[12rem] w-full items-center justify-center py-8">
      <TypewriterEffect
        words={[
          { text: "Crie" },
          { text: "experiências" },
          { text: "incríveis", className: "text-primary" },
          { text: "com a" },
          { text: "vitrine.", className: "text-primary" },
        ]}
      />
    </div>
  ),
}

const typewriterSmooth: Example = {
  title: "Smooth (máquina de escrever)",
  description:
    "Variante smooth: o container revela a linha inteira animando width 0% → fit-content em 2s. Ideal para frases curtas de impacto.",
  code: `<TypewriterEffectSmooth
  words={[
    { text: "Aceternity" },
    { text: "UI", className: "text-primary" },
    { text: "na", },
    { text: "vitrine.", className: "text-primary" },
  ]}
/>`,
  render: (
    <div className="min-h-[12rem] w-full items-center py-8">
      <TypewriterEffectSmooth
        words={[
          { text: "Aceternity" },
          { text: "UI", className: "text-primary" },
          { text: "na" },
          { text: "vitrine.", className: "text-primary" },
        ]}
      />
    </div>
  ),
}

const typewriterCursorCustom: Example = {
  title: "Cursor customizado",
  description:
    "Passe cursorClassName para trocar cor/largura/altura do cursor. Mantém o token do tema, só ajusta dimensões.",
  code: `<TypewriterEffect
  words={[
    { text: "Tema", },
    { text: "shadcn", className: "text-primary" },
    { text: "ativo.", },
  ]}
  className="text-2xl md:text-4xl"
  cursorClassName="bg-foreground h-6 md:h-8 w-[6px]"
/>`,
  render: (
    <div className="min-h-[12rem] w-full items-center justify-center py-8">
      <TypewriterEffect
        words={[
          { text: "Tema" },
          { text: "shadcn", className: "text-primary" },
          { text: "ativo." },
        ]}
        className="text-2xl md:text-4xl"
        cursorClassName="bg-foreground h-6 md:h-8 w-[6px]"
      />
    </div>
  ),
}

export const examplesTypewriterEffect: Record<string, Example[]> = {
  "typewriter-effect": [typewriterBasic, typewriterSmooth, typewriterCursorCustom],
}
