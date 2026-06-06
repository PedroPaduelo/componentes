import {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle,
} from "@/components/ui/glowing-stars-effect"

import type { Example } from "@/data/examples"

const glowingStarsBasic: Example = {
  title: "Básico",
  description:
    "Card da Aceternity UI com uma malha de estrelinhas que brilham aleatoriamente (a cada 3s) e acendem todas no hover, com glows azuis sobre elas. Título + descrição abaixo da ilustração.",
  code: `<GlowingStarsBackgroundCard>
  <GlowingStarsTitle>Next.js 14</GlowingStarsTitle>
  <div className="flex items-end justify-between">
    <GlowingStarsDescription>
      The power of full-stack to the frontend. Read the release notes.
    </GlowingStarsDescription>
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsla(0,0%,100%,.1)]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 stroke-2 text-foreground"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 12l14 0" />
        <path d="M13 18l6 -6" />
        <path d="M13 6l6 6" />
      </svg>
    </div>
  </div>
</GlowingStarsBackgroundCard>`,
  render: (
    <div className="flex w-full items-center justify-center py-6">
      <GlowingStarsBackgroundCard>
        <GlowingStarsTitle>Next.js 14</GlowingStarsTitle>
        <div className="flex items-end justify-between">
          <GlowingStarsDescription>
            The power of full-stack to the frontend. Read the release notes.
          </GlowingStarsDescription>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsla(0,0%,100%,.1)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 stroke-2 text-foreground"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 12l14 0" />
              <path d="M13 18l6 -6" />
              <path d="M13 6l6 6" />
            </svg>
          </div>
        </div>
      </GlowingStarsBackgroundCard>
    </div>
  ),
}

const glowingStarsSimple: Example = {
  title: "Apenas título",
  description:
    "Variante mínima com somente o título sob a ilustração — útil para destacar um nome de produto ou versão.",
  code: `<GlowingStarsBackgroundCard className="max-w-sm">
  <GlowingStarsTitle>Glowing Stars</GlowingStarsTitle>
  <GlowingStarsDescription>
    Passe o mouse para acender toda a constelação.
  </GlowingStarsDescription>
</GlowingStarsBackgroundCard>`,
  render: (
    <div className="flex w-full items-center justify-center py-6">
      <GlowingStarsBackgroundCard className="max-w-sm">
        <GlowingStarsTitle>Glowing Stars</GlowingStarsTitle>
        <GlowingStarsDescription>
          Passe o mouse para acender toda a constelação.
        </GlowingStarsDescription>
      </GlowingStarsBackgroundCard>
    </div>
  ),
}

export const examplesGlowingStarsEffect: Record<string, Example[]> = {
  "glowing-stars-effect": [glowingStarsBasic, glowingStarsSimple],
}
