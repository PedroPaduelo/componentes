import { Moon, Monitor, Sparkles, Sun, ArrowUpDown } from "lucide-react"
import { Notch } from "@/components/ui/notch"
import type { Example } from "@/data/examples"

const examplesNotchBasic: Example = {
  title: "Básico: 1 grupo (Tema)",
  description:
    "Notch único na base do viewport, centralizado, com um grupo Tema oferecendo três opções (Escuro, Claro, Sistema). Cores fixas (dark brand) — não segue tema shadcn.",
  code: `<Notch
  position="bottom"
  align="center"
  items={[
    {
      id: "theme",
      label: "Tema",
      options: [
        { id: "dark", label: "Escuro", icon: <Moon className="size-3.5" /> },
        { id: "light", label: "Claro", icon: <Sun className="size-3.5" /> },
        { id: "system", label: "Sistema", icon: <Monitor className="size-3.5" /> },
      ],
    },
  ]}
/>`,
  render: (
    <div className="relative h-[260px] w-full overflow-hidden rounded-lg border border-border bg-card">
      <Notch
        position="bottom"
        align="center"
        items={[
          {
            id: "theme",
            label: "Tema",
            options: [
              {
                id: "dark",
                label: "Escuro",
                icon: <Moon className="size-3.5" />,
              },
              {
                id: "light",
                label: "Claro",
                icon: <Sun className="size-3.5" />,
              },
              {
                id: "system",
                label: "Sistema",
                icon: <Monitor className="size-3.5" />,
              },
            ],
          },
        ]}
      />
    </div>
  ),
}

const examplesNotchFull: Example = {
  title: "Completo: 2 grupos com ícones (topo)",
  description:
    "Dois grupos (Categorias com Sparkles, Ordenar com ArrowUpDown) no topo do viewport, alinhados à direita, com dividers tracejados entre grupos e o valor selecionado exibido ao lado do label.",
  code: `<Notch
  position="top"
  align="end"
  showDividers
  showSelectedValue
  items={[
    {
      id: "category",
      label: "Categorias",
      icon: <Sparkles className="size-3.5" />,
      options: [
        { id: "all", label: "Todas" },
        { id: "design", label: "Design" },
        { id: "code", label: "Código" },
      ],
    },
    {
      id: "sort",
      label: "Ordenar",
      icon: <ArrowUpDown className="size-3.5" />,
      options: [
        { id: "recent", label: "Mais recentes" },
        { id: "popular", label: "Mais populares" },
        { id: "alpha", label: "A → Z" },
      ],
    },
  ]}
/>`,
  render: (
    <div className="relative h-[260px] w-full overflow-hidden rounded-lg border border-border bg-card">
      <Notch
        position="top"
        align="end"
        showDividers
        showSelectedValue
        items={[
          {
            id: "category",
            label: "Categorias",
            icon: <Sparkles className="size-3.5" />,
            options: [
              { id: "all", label: "Todas" },
              { id: "design", label: "Design" },
              { id: "code", label: "Código" },
            ],
          },
          {
            id: "sort",
            label: "Ordenar",
            icon: <ArrowUpDown className="size-3.5" />,
            options: [
              { id: "recent", label: "Mais recentes" },
              { id: "popular", label: "Mais populares" },
              { id: "alpha", label: "A → Z" },
            ],
          },
        ]}
      />
    </div>
  ),
}

export const examplesNotch: Record<string, Example[]> = {
  notch: [examplesNotchBasic, examplesNotchFull],
}
