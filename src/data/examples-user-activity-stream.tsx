import { UserActivityStream } from "@/components/ui/user-activity-stream"
import type { UserActivityEvent } from "@/components/ui/user-activity-stream-types"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                            dados pré-fabricados                            */
/* -------------------------------------------------------------------------- */

/**
 * PRNG determinístico (mulberry32). Usado para gerar o pool inicial de eventos
 * dos exemplos sem depender de `Math.random` (proibido pela política
 * zero-dívida do projeto).
 */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = [
  "Ana",
  "Bruno",
  "Camila",
  "Diego",
  "Elena",
  "Felipe",
  "Gabi",
  "Hugo",
  "Iris",
  "Jonas",
  "Karen",
  "Léo",
  "Marina",
  "Nina",
  "Otávio",
  "Paula",
  "Quinn",
  "Rafa",
  "Sofia",
  "Theo",
]
const LAST = [
  "Almeida",
  "Barbosa",
  "Costa",
  "Dias",
  "Esteves",
  "Ferreira",
  "Gomes",
  "Horta",
  "Iglesias",
  "Jardim",
  "Klein",
  "Lima",
  "Mendes",
  "Nunes",
  "Oliveira",
  "Pereira",
  "Queiroz",
  "Rocha",
  "Silva",
  "Teixeira",
]
const PAGES = [
  "/dashboard",
  "/settings",
  "/billing",
  "/reports",
  "/projects",
  "/integrations",
  "/admin/users",
  "/admin/audit",
  "/login",
  "/onboarding",
]
const ACTIONS = [
  "login",
  "page_view",
  "form_submit",
  "click",
  "error",
  "abuse_flag",
  "purchase",
  "signup",
  "logout",
] as const
const COUNTRIES: { country: string; city: string }[] = [
  { country: "BR", city: "São Paulo" },
  { country: "BR", city: "Rio de Janeiro" },
  { country: "US", city: "New York" },
  { country: "DE", city: "Berlin" },
  { country: "FR", city: "Paris" },
  { country: "GB", city: "London" },
  { country: "JP", city: "Tokyo" },
  { country: "IN", city: "Bengaluru" },
]
const ROLES = ["Admin", "Editor", "Viewer", "Owner", "Auditor"]

function buildEvents(count: number, seed: number): UserActivityEvent[] {
  const rng = mulberry32(seed)
  const out: UserActivityEvent[] = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const first = FIRST[Math.floor(rng() * FIRST.length)] ?? "Ana"
    const last = LAST[Math.floor(rng() * LAST.length)] ?? "Silva"
    const userId = `u-${i.toString(36).padStart(3, "0")}-${Math.floor(rng() * 1e6).toString(36)}`
    const action = ACTIONS[Math.floor(rng() * ACTIONS.length)] ?? "page_view"
    const page = PAGES[Math.floor(rng() * PAGES.length)] ?? "/"
    const geo = COUNTRIES[Math.floor(rng() * COUNTRIES.length)] ?? COUNTRIES[0]!
    const role = ROLES[Math.floor(rng() * ROLES.length)] ?? "Viewer"
    const flagged = action === "abuse_flag" || rng() < 0.05
    out.push({
      id: `e-${seed.toString(36)}-${i.toString(36).padStart(3, "0")}`,
      // mais novo no topo, com passos crescentes
      t: new Date(now - (count - i) * 1500).toISOString(),
      user: {
        id: userId,
        name: `${first} ${last}`,
        role,
        avatar: `https://i.pravatar.cc/64?u=${userId}`,
      },
      action,
      page,
      ip: `192.168.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}`,
      geo,
      flagged,
      durationMs: action === "page_view" ? Math.floor(rng() * 90_000) : undefined,
      payload:
        action === "purchase"
          ? [{ key: "plan", value: rng() < 0.5 ? "pro" : "team" }]
          : undefined,
    })
  }
  return out
}

/* -------------------------------------------------------------------------- */
/*                                exemplos                                    */
/* -------------------------------------------------------------------------- */

const livePool = buildEvents(30, 42)

const userActivityStreamLiveExample: Example = {
  title: "Modo live · 30 eventos",
  description:
    "Stream em tempo real que injeta 1 evento novo a cada 5s (PRNG seedado). Filtros por tipo de ação, busca por usuário e janela temporal (Tudo/1h/5m). Auto-scroll pro fim enquanto o usuário não rolar pra cima.",
  code: `<UserActivityStream
  events={events}
  live
  maxItems={200}
/>`,
  render: (
    <div className="h-[640px] w-full">
      <UserActivityStream events={livePool} live maxItems={200} />
    </div>
  ),
}

const groupedPool = buildEvents(28, 99)

const userActivityStreamGroupedExample: Example = {
  title: "Agrupado por usuário",
  description:
    "Mesmo feed, mas agrupado por usuário — cada troca de pessoa vira um header sticky. Útil pra triagem de suporte, onde o analista quer ver o histórico de um único usuário em sequência.",
  code: `<UserActivityStream
  events={events}
  groupBy="user"
  maxItems={200}
/>`,
  render: (
    <div className="h-[640px] w-full">
      <UserActivityStream events={groupedPool} groupBy="user" maxItems={200} />
    </div>
  ),
}

export const examplesUserActivityStream: Record<string, Example[]> = {
  "user-activity-stream": [userActivityStreamLiveExample, userActivityStreamGroupedExample],
}
