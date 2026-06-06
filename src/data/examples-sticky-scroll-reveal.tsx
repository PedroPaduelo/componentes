import {
  StickyScroll,
  type StickyScrollContentItem,
} from "@/components/ui/sticky-scroll-reveal"
import type { Example } from "./examples"

const featuresContent: StickyScrollContentItem[] = [
  {
    title: "Performance brutal",
    description:
      "Renderiza 10.000 linhas virtualizadas com 60fps constantes. Memoização por linha, scroll pooling e diff de altura preditivo mantêm o frame budget folgada mesmo em mobile de entrada.",
    content: (
      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">
        ⚡ 60fps
      </div>
    ),
  },
  {
    title: "Segurança fim a fim",
    description:
      "Sandbox de execução por workspace, E2EE no sync entre devices e rotação automática de tokens. Cada operação passa por policy engine auditável e log imutável.",
    content: (
      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">
        🔒 E2EE
      </div>
    ),
  },
  {
    title: "UX que respeita o usuário",
    description:
      "Zero loading spinners: cada ação é otimista e reverte com grace. Atalhos vim-like em todo canto, command palette global e undo/redo de 100 passos para qualquer mudança.",
    content: (
      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">
        ⌘ K
      </div>
    ),
  },
]

const stackContent: StickyScrollContentItem[] = [
  {
    title: "Frontend",
    description:
      "React 19 + TypeScript estrito, Tailwind v4 com tokens semânticos, motion/react para animações declarativas, TanStack Query para cache invalidado por evento. Tudo buildado com Vite 6 e testado em Playwright.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white">
        <span className="text-lg font-semibold">React 19</span>
        <span className="text-sm opacity-80">TypeScript · Tailwind v4</span>
      </div>
    ),
  },
  {
    title: "Backend",
    description:
      "Fastify 5 com roteamento tipado, Prisma 6 para queries SQL auditáveis, BullMQ para filas duráveis e Zod para validação de payload em todo boundary. Deploy em containers Linux efêmeros.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white">
        <span className="text-lg font-semibold">Fastify 5</span>
        <span className="text-sm opacity-80">Prisma · BullMQ · Zod</span>
      </div>
    ),
  },
  {
    title: "Inteligência",
    description:
      "Modelos multimodais roteados por latência/custo, streaming de tokens com cancelamento, embeddings vetoriais em pgvector e guardrails contra prompt injection em todo tool call.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white">
        <span className="text-lg font-semibold">LLM Router</span>
        <span className="text-sm opacity-80">pgvector · guardrails</span>
      </div>
    ),
  },
]

export const examplesStickyScrollReveal: Record<string, Example[]> = {
  "sticky-scroll-reveal": [
    {
      title: "Features de produto",
      description:
        "Painel à esquerda com descrições longas que revelam o tópico ativo enquanto o usuário rola. O card sticky à direita troca de gradiente e mostra um destaque visual sincronizado.",
      code: `<StickyScroll
  content={[
    {
      title: "Performance brutal",
      description:
        "Renderiza 10.000 linhas virtualizadas com 60fps constantes...",
      content: <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">⚡ 60fps</div>,
    },
    {
      title: "Segurança fim a fim",
      description:
        "Sandbox de execução por workspace, E2EE no sync entre devices...",
      content: <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">🔒 E2EE</div>,
    },
    {
      title: "UX que respeita o usuário",
      description:
        "Zero loading spinners: cada ação é otimista e reverte com grace...",
      content: <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">⌘ K</div>,
    },
  ]}
/>`,
      render: (
        <div className="w-full">
          <StickyScroll content={featuresContent} />
        </div>
      ),
    },
    {
      title: "Stack de tecnologia",
      description:
        "Mesma mecânica, três seções sobre o stack técnico. O card sticky alterna entre gradientes cyan→emerald, pink→indigo e orange→yellow, reforçando a separação visual entre os tópicos.",
      code: `<StickyScroll
  content={[
    {
      title: "Frontend",
      description:
        "React 19 + TypeScript estrito, Tailwind v4 com tokens semânticos...",
      content: <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white"><span className="text-lg font-semibold">React 19</span><span className="text-sm opacity-80">TypeScript · Tailwind v4</span></div>,
    },
    {
      title: "Backend",
      description:
        "Fastify 5 com roteamento tipado, Prisma 6 para queries SQL auditáveis...",
      content: <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white"><span className="text-lg font-semibold">Fastify 5</span><span className="text-sm opacity-80">Prisma · BullMQ · Zod</span></div>,
    },
    {
      title: "Inteligência",
      description:
        "Modelos multimodais roteados por latência/custo, streaming de tokens...",
      content: <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white"><span className="text-lg font-semibold">LLM Router</span><span className="text-sm opacity-80">pgvector · guardrails</span></div>,
    },
  ]}
/>`,
      render: (
        <div className="w-full">
          <StickyScroll content={stackContent} />
        </div>
      ),
    },
  ],
}
