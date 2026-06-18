import { Badge } from "@/components/ui/badge"
import { LeaderboardList } from "@/components/ui/leaderboard-list"
import type { LeaderboardItem } from "@/components/ui/leaderboard-list"

import type { Example } from "./examples"

const TOP: LeaderboardItem[] = [
  {
    id: "c1",
    name: "Aurora Vale",
    value: "$1,200",
    progress: 100,
    avatar: "https://picsum.photos/seed/aurora.vale/64/64",
    fallback: "AV",
    badge: <Badge>Enterprise</Badge>,
  },
  {
    id: "c2",
    name: "Theo Bauer",
    value: "$1,200",
    progress: 100,
    avatar: "https://picsum.photos/seed/theo.bauer/64/64",
    fallback: "TB",
    badge: <Badge>Enterprise</Badge>,
  },
  {
    id: "c3",
    name: "Noah Okafor",
    value: "$290",
    progress: 24,
    avatar: "https://picsum.photos/seed/noah.okafor/64/64",
    fallback: "NO",
    badge: <Badge variant="secondary">Pro</Badge>,
  },
  {
    id: "c4",
    name: "Sofia Iglesias",
    value: "$290",
    progress: 24,
    avatar: "https://picsum.photos/seed/sofia.iglesias/64/64",
    fallback: "SI",
    badge: <Badge variant="secondary">Pro</Badge>,
  },
]

const basicExample: Example = {
  title: "Top clientes por MRR",
  description:
    "Ranking com posição, avatar, barra de progresso, badge de plano e valor formatado.",
  code: `import { Badge } from "@/components/ui/badge"
import { LeaderboardList } from "@/components/ui/leaderboard-list"
import type { LeaderboardItem } from "@/components/ui/leaderboard-list"

const top: LeaderboardItem[] = [
  { id: "c1", name: "Aurora Vale", value: "$1,200", progress: 100, avatar: "https://picsum.photos/seed/aurora.vale/64/64", badge: <Badge>Enterprise</Badge> },
  { id: "c2", name: "Noah Okafor", value: "$290", progress: 24, avatar: "https://picsum.photos/seed/noah.okafor/64/64", badge: <Badge variant="secondary">Pro</Badge> },
]

export function Demo() {
  return (
    <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5">
      <LeaderboardList items={top} />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5">
      <LeaderboardList items={TOP} />
    </div>
  ),
}

const noBadgeExample: Example = {
  title: "Sem badge e com rank explícito",
  description:
    "O badge à direita é opcional; `rank` pode ser passado para sobrescrever a numeração automática.",
  code: `import { LeaderboardList } from "@/components/ui/leaderboard-list"

export function Demo() {
  return (
    <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5">
      <LeaderboardList
        items={[
          { id: "p1", name: "Plano Pro", value: "62%", progress: 100, rank: 1, fallback: "PR" },
          { id: "p2", name: "Plano Enterprise", value: "28%", progress: 45, rank: 2, fallback: "EN" },
          { id: "p3", name: "Plano Free", value: "10%", progress: 16, rank: 3, fallback: "FR" },
        ]}
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5">
      <LeaderboardList
        items={[
          {
            id: "p1",
            name: "Plano Pro",
            value: "62%",
            progress: 100,
            rank: 1,
            fallback: "PR",
          },
          {
            id: "p2",
            name: "Plano Enterprise",
            value: "28%",
            progress: 45,
            rank: 2,
            fallback: "EN",
          },
          {
            id: "p3",
            name: "Plano Free",
            value: "10%",
            progress: 16,
            rank: 3,
            fallback: "FR",
          },
        ]}
      />
    </div>
  ),
}

export const examplesLeaderboardList: Record<string, Example[]> = {
  "leaderboard-list": [basicExample, noBadgeExample],
}
