/**
 * Examples — AnimatedTestimonials (Aceternity UI).
 *
 * Carrossel de depoimentos com troca animada por AnimatePresence (motion v12):
 * cada testemunho tem imagem, nome, cargo e citação. A citação entra com
 * stagger de blur por palavra (10px → nítido). Botões Chevron navegam entre
 * depoimentos; `autoplay` faz o carrossel avançar a cada 5s.
 *
 * `code` e `render` em sincronia. Imagens via `picsum.photos/seed/<x>/...`
 * (estável, sem dep nova, sem 404).
 */

import type { Example } from "@/data/examples"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"

const animatedTestimonialsBasic: Example = {
  title: "Básico (3 depoimentos)",
  description:
    "Carrossel com 3 depoimentos, navegação manual via botões Chevron. Cada troca anima a imagem (rotateY aleatório + z index + scale) e revela o nome/cargo/citação com stagger de blur por palavra.",
  code: `<AnimatedTestimonials
  testimonials={[
    {
      quote:
        "This product changed my workflow. I cannot imagine going back to the old way of doing things.",
      name: "Sarah Chen",
      designation: "Senior Product Designer",
      src: "https://picsum.photos/seed/sarah-chen/500/500",
    },
    {
      quote:
        "The attention to detail is remarkable. Every micro-interaction feels considered and intentional.",
      name: "Marcus Williams",
      designation: "Frontend Engineer",
      src: "https://picsum.photos/seed/marcus-williams/500/500",
    },
    {
      quote:
        "It scales beautifully across teams. We rolled it out to 200+ designers without a single complaint.",
      name: "Priya Patel",
      designation: "Design Systems Lead",
      src: "https://picsum.photos/seed/priya-patel/500/500",
    },
  ]}
/>`,
  render: (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card p-2">
      <AnimatedTestimonials
        testimonials={[
          {
            quote:
              "This product changed my workflow. I cannot imagine going back to the old way of doing things.",
            name: "Sarah Chen",
            designation: "Senior Product Designer",
            src: "https://picsum.photos/seed/sarah-chen/500/500",
          },
          {
            quote:
              "The attention to detail is remarkable. Every micro-interaction feels considered and intentional.",
            name: "Marcus Williams",
            designation: "Frontend Engineer",
            src: "https://picsum.photos/seed/marcus-williams/500/500",
          },
          {
            quote:
              "It scales beautifully across teams. We rolled it out to 200+ designers without a single complaint.",
            name: "Priya Patel",
            designation: "Design Systems Lead",
            src: "https://picsum.photos/seed/priya-patel/500/500",
          },
        ]}
      />
    </div>
  ),
}

const animatedTestimonialsAutoplay: Example = {
  title: "Com autoplay",
  description:
    "Passe `autoplay` para o carrossel avançar sozinho a cada 5 segundos. O setInterval é limpo em unmount e respeita a prop — se a lista tiver só 1 testemunho, autoplay é no-op.",
  code: `<AnimatedTestimonials
  autoplay
  testimonials={[
    {
      quote:
        "Setup was painless. We were up and running in under an hour, and our team picked it up without any training.",
      name: "Jordan Rivera",
      designation: "Engineering Manager",
      src: "https://picsum.photos/seed/jordan-rivera/500/500",
    },
    {
      quote:
        "Customer support is top notch. They helped us debug an edge case at 2am without any hesitation.",
      name: "Aiko Tanaka",
      designation: "CTO",
      src: "https://picsum.photos/seed/aiko-tanaka/500/500",
    },
    {
      quote:
        "We replaced four different tools with this single one. The consolidation alone paid for the entire year.",
      name: "Lukas Schmidt",
      designation: "Head of Operations",
      src: "https://picsum.photos/seed/lukas-schmidt/500/500",
    },
  ]}
/>`,
  render: (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card p-2">
      <AnimatedTestimonials
        autoplay
        testimonials={[
          {
            quote:
              "Setup was painless. We were up and running in under an hour, and our team picked it up without any training.",
            name: "Jordan Rivera",
            designation: "Engineering Manager",
            src: "https://picsum.photos/seed/jordan-rivera/500/500",
          },
          {
            quote:
              "Customer support is top notch. They helped us debug an edge case at 2am without any hesitation.",
            name: "Aiko Tanaka",
            designation: "CTO",
            src: "https://picsum.photos/seed/aiko-tanaka/500/500",
          },
          {
            quote:
              "We replaced four different tools with this single one. The consolidation alone paid for the entire year.",
            name: "Lukas Schmidt",
            designation: "Head of Operations",
            src: "https://picsum.photos/seed/lukas-schmidt/500/500",
          },
        ]}
      />
    </div>
  ),
}

const animatedTestimonialsLong: Example = {
  title: "Lista maior (5 depoimentos)",
  description:
    "O componente cicla por N depoimentos sem limite. Cada testemunho é animado em z-index (mais antigos ficam atrás) e em rotação 3D aleatória no eixo Y para a entrada/saída.",
  code: `<AnimatedTestimonials
  testimonials={[
    {
      quote: "Componentes com comportamento previsível e acessibilidade nativa.",
      name: "Ana Souza",
      designation: "Tech Lead",
      src: "https://picsum.photos/seed/ana-souza/500/500",
    },
    {
      quote:
        "A documentação é um modelo. Cada prop explicada com exemplo real de uso.",
      name: "Bruno Lima",
      designation: "Staff Engineer",
      src: "https://picsum.photos/seed/bruno-lima/500/500",
    },
    {
      quote: "Integrei em três projetos sem uma única regressão de tema.",
      name: "Camila Reis",
      designation: "Frontend Architect",
      src: "https://picsum.photos/seed/camila-reis/500/500",
    },
    {
      quote:
        "Os exemplos da vitrine são didáticos — cada componente já vem com 2-3 casos de uso reais.",
      name: "Diego Alves",
      designation: "Senior Developer",
      src: "https://picsum.photos/seed/diego-alves/500/500",
    },
    {
      quote: "Performance excelente mesmo com 20+ componentes na home.",
      name: "Erika Campos",
      designation: "Web Performance Engineer",
      src: "https://picsum.photos/seed/erika-campos/500/500",
    },
  ]}
/>`,
  render: (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card p-2">
      <AnimatedTestimonials
        testimonials={[
          {
            quote:
              "Componentes com comportamento previsível e acessibilidade nativa.",
            name: "Ana Souza",
            designation: "Tech Lead",
            src: "https://picsum.photos/seed/ana-souza/500/500",
          },
          {
            quote:
              "A documentação é um modelo. Cada prop explicada com exemplo real de uso.",
            name: "Bruno Lima",
            designation: "Staff Engineer",
            src: "https://picsum.photos/seed/bruno-lima/500/500",
          },
          {
            quote:
              "Integrei em três projetos sem uma única regressão de tema.",
            name: "Camila Reis",
            designation: "Frontend Architect",
            src: "https://picsum.photos/seed/camila-reis/500/500",
          },
          {
            quote:
              "Os exemplos da vitrine são didáticos — cada componente já vem com 2-3 casos de uso reais.",
            name: "Diego Alves",
            designation: "Senior Developer",
            src: "https://picsum.photos/seed/diego-alves/500/500",
          },
          {
            quote:
              "Performance excelente mesmo com 20+ componentes na home.",
            name: "Erika Campos",
            designation: "Web Performance Engineer",
            src: "https://picsum.photos/seed/erika-campos/500/500",
          },
        ]}
      />
    </div>
  ),
}

export const examplesAnimatedTestimonials: Record<string, Example[]> = {
  "animated-testimonials": [
    animatedTestimonialsBasic,
    animatedTestimonialsAutoplay,
    animatedTestimonialsLong,
  ],
}
