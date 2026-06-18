import { ActivityFeed } from "@/components/ui/activity-feed"
import type { ActivityFeedItem } from "@/components/ui/activity-feed"

const EVENTS: ActivityFeedItem[] = [
  {
    id: "a1",
    name: "Aurora Vale",
    action: "fez upgrade para",
    target: "Enterprise",
    time: "há 4 min",
    avatar: "https://picsum.photos/seed/aurora.vale/64/64",
    fallback: "AV",
  },
  {
    id: "a2",
    name: "Noah Okafor",
    action: "criou uma fatura",
    target: "INV-20251104",
    time: "há 22 min",
    avatar: "https://picsum.photos/seed/noah.okafor/64/64",
    fallback: "NO",
  },
  {
    id: "a3",
    name: "Sofia Iglesias",
    action: "convidou",
    target: "2 membros",
    time: "há 1 h",
    avatar: "https://picsum.photos/seed/sofia.iglesias/64/64",
    fallback: "SI",
  },
  {
    id: "a4",
    name: "Pedro Almeida",
    action: "cancelou o plano",
    target: "Pro",
    time: "há 3 h",
    avatar: "https://picsum.photos/seed/pedro.almeida/64/64",
    fallback: "PA",
  },
]

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Atividade recente",
  description:
    "Feed de eventos da conta com avatar, ator/ação/alvo e timestamp relativo.",
  code: `import { ActivityFeed } from "@/components/ui/activity-feed"
import type { ActivityFeedItem } from "@/components/ui/activity-feed"

const events: ActivityFeedItem[] = [
  { id: "a1", name: "Aurora Vale", action: "fez upgrade para", target: "Enterprise", time: "há 4 min", avatar: "https://picsum.photos/seed/aurora.vale/64/64" },
  { id: "a2", name: "Noah Okafor", action: "criou uma fatura", target: "INV-20251104", time: "há 22 min", avatar: "https://picsum.photos/seed/noah.okafor/64/64" },
  { id: "a3", name: "Sofia Iglesias", action: "convidou", target: "2 membros", time: "há 1 h", avatar: "https://picsum.photos/seed/sofia.iglesias/64/64" },
]

export function Demo() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <ActivityFeed items={events} />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <ActivityFeed items={EVENTS} />
    </div>
  ),
}

const noAvatarExample: Example = {
  title: "Sem avatar e sem alvo",
  description:
    "Sem `avatar`, o item mostra só o fallback (iniciais); `target` é opcional.",
  code: `import { ActivityFeed } from "@/components/ui/activity-feed"

export function Demo() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <ActivityFeed
        items={[
          { id: "1", name: "Sistema", action: "concluiu o backup diário", time: "há 10 min" },
          { id: "2", name: "Mira Sandoval", action: "renovou a assinatura", target: "anual", time: "há 5 h", fallback: "MS" },
        ]}
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <ActivityFeed
        items={[
          {
            id: "1",
            name: "Sistema",
            action: "concluiu o backup diário",
            time: "há 10 min",
          },
          {
            id: "2",
            name: "Mira Sandoval",
            action: "renovou a assinatura",
            target: "anual",
            time: "há 5 h",
            fallback: "MS",
          },
        ]}
      />
    </div>
  ),
}

export const examplesActivityFeed: Record<string, Example[]> = {
  "activity-feed": [basicExample, noAvatarExample],
}
