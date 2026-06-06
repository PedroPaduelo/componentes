import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import type { Example } from "./examples"

const TEAM_MEMBERS = [
  {
    id: 1,
    name: "João Silva",
    designation: "Frontend Engineer",
    image: "https://picsum.photos/seed/tooltip-1/200/200",
  },
  {
    id: 2,
    name: "Maria Santos",
    designation: "Product Designer",
    image: "https://picsum.photos/seed/tooltip-2/200/200",
  },
  {
    id: 3,
    name: "Pedro Costa",
    designation: "Tech Lead",
    image: "https://picsum.photos/seed/tooltip-3/200/200",
  },
  {
    id: 4,
    name: "Ana Oliveira",
    designation: "Full Stack Dev",
    image: "https://picsum.photos/seed/tooltip-4/200/200",
  },
]

const SMALL_TEAM = [
  {
    id: 1,
    name: "Alice",
    designation: "CEO",
    image: "https://picsum.photos/seed/tooltip-5/200/200",
  },
  {
    id: 2,
    name: "Bob",
    designation: "CTO",
    image: "https://picsum.photos/seed/tooltip-6/200/200",
  },
  {
    id: 3,
    name: "Carol",
    designation: "Designer",
    image: "https://picsum.photos/seed/tooltip-7/200/200",
  },
]

const TeamTooltipExample: Example = {
  title: "Equipe",
  description:
    "Fileira de avatares com tooltip animado que segue o cursor — useSpring + useTransform + AnimatePresence.",
  code: `<AnimatedTooltip
  items={[
    { id: 1, name: "João Silva", designation: "Frontend Engineer", image: "https://picsum.photos/seed/tooltip-1/200/200" },
    { id: 2, name: "Maria Santos", designation: "Product Designer", image: "https://picsum.photos/seed/tooltip-2/200/200" },
    { id: 3, name: "Pedro Costa", designation: "Tech Lead", image: "https://picsum.photos/seed/tooltip-3/200/200" },
    { id: 4, name: "Ana Oliveira", designation: "Full Stack Dev", image: "https://picsum.photos/seed/tooltip-4/200/200" },
  ]}
/>`,
  render: (
    <div className="flex items-center justify-center py-8">
      <AnimatedTooltip items={TEAM_MEMBERS} />
    </div>
  ),
}

const SmallTeamTooltipExample: Example = {
  title: "Equipe enxuta",
  description:
    "Versão compacta com 3 avatares — tooltip com gradiente emerald/sky na borda inferior.",
  code: `<AnimatedTooltip
  items={[
    { id: 1, name: "Alice", designation: "CEO", image: "https://picsum.photos/seed/tooltip-5/200/200" },
    { id: 2, name: "Bob", designation: "CTO", image: "https://picsum.photos/seed/tooltip-6/200/200" },
    { id: 3, name: "Carol", designation: "Designer", image: "https://picsum.photos/seed/tooltip-7/200/200" },
  ]}
/>`,
  render: (
    <div className="flex items-center justify-center py-8">
      <AnimatedTooltip items={SMALL_TEAM} />
    </div>
  ),
}

export const examplesAnimatedTooltip: Record<string, Example[]> = {
  "animated-tooltip": [TeamTooltipExample, SmallTeamTooltipExample],
}
