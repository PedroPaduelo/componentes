/**
 * Examples — Team Section with Scales (Aceternity UI).
 *
 * Seção de equipe com cards sobre o pattern `Scales`. Avatares via picsum
 * (seeds estáveis). `code` e `render` mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { TeamSectionWithScales } from "@/components/ui/team-section-with-scales"

const basicExample: Example = {
  title: "Básico",
  description: "Seção de time com 3 membros e os textos padrão.",
  code: `<TeamSectionWithScales
  members={[
    {
      name: "Ana Souza",
      role: "Product Designer",
      image: "https://picsum.photos/seed/team-ana/200/200",
    },
    {
      name: "Bruno Lima",
      role: "Frontend Engineer",
      image: "https://picsum.photos/seed/team-bruno/200/200",
    },
    {
      name: "Carla Dias",
      role: "Engineering Manager",
      image: "https://picsum.photos/seed/team-carla/200/200",
    },
  ]}
/>`,
  render: (
    <TeamSectionWithScales
      members={[
        {
          name: "Ana Souza",
          role: "Product Designer",
          image: "https://picsum.photos/seed/team-ana/200/200",
        },
        {
          name: "Bruno Lima",
          role: "Frontend Engineer",
          image: "https://picsum.photos/seed/team-bruno/200/200",
        },
        {
          name: "Carla Dias",
          role: "Engineering Manager",
          image: "https://picsum.photos/seed/team-carla/200/200",
        },
      ]}
    />
  ),
}

const richExample: Example = {
  title: "Com bio e links sociais",
  description:
    "Cabeçalho customizado, bios curtas e links sociais (fallback textual) em cada card.",
  code: `<TeamSectionWithScales
  eyebrow="Quem somos"
  title="A equipe por trás do produto"
  description="Pessoas que cuidam de design, código e estratégia todos os dias."
  members={[
    {
      name: "Diego Martins",
      role: "CTO",
      image: "https://picsum.photos/seed/team-diego/200/200",
      bio: "Lidera a engenharia e a arquitetura da plataforma.",
      socials: [
        { label: "X", href: "https://x.com" },
        { label: "GitHub", href: "https://github.com" },
      ],
    },
    {
      name: "Elisa Rocha",
      role: "Head of Design",
      image: "https://picsum.photos/seed/team-elisa/200/200",
      bio: "Responsável pela identidade visual e pelo design system.",
      socials: [
        { label: "Dribbble", href: "https://dribbble.com" },
        { label: "LinkedIn", href: "https://linkedin.com" },
      ],
    },
    {
      name: "Felipe Nunes",
      role: "Backend Engineer",
      image: "https://picsum.photos/seed/team-felipe/200/200",
      bio: "Cuida da infraestrutura e das APIs de alto tráfego.",
      socials: [{ label: "GitHub", href: "https://github.com" }],
    },
  ]}
/>`,
  render: (
    <TeamSectionWithScales
      eyebrow="Quem somos"
      title="A equipe por trás do produto"
      description="Pessoas que cuidam de design, código e estratégia todos os dias."
      members={[
        {
          name: "Diego Martins",
          role: "CTO",
          image: "https://picsum.photos/seed/team-diego/200/200",
          bio: "Lidera a engenharia e a arquitetura da plataforma.",
          socials: [
            { label: "X", href: "https://x.com" },
            { label: "GitHub", href: "https://github.com" },
          ],
        },
        {
          name: "Elisa Rocha",
          role: "Head of Design",
          image: "https://picsum.photos/seed/team-elisa/200/200",
          bio: "Responsável pela identidade visual e pelo design system.",
          socials: [
            { label: "Dribbble", href: "https://dribbble.com" },
            { label: "LinkedIn", href: "https://linkedin.com" },
          ],
        },
        {
          name: "Felipe Nunes",
          role: "Backend Engineer",
          image: "https://picsum.photos/seed/team-felipe/200/200",
          bio: "Cuida da infraestrutura e das APIs de alto tráfego.",
          socials: [{ label: "GitHub", href: "https://github.com" }],
        },
      ]}
    />
  ),
}

export const examplesTeamSectionWithScales: Record<string, Example[]> = {
  "team-section-with-scales": [basicExample, richExample],
}
