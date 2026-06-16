/**
 * Examples — ErrorTrackerFeed (Observability Center / Pulse).
 *
 * 1. "Feed completo com filtros" — 12 erros misturados em 3 ambientes,
 *    vários status e 4 categorias, com trend mini-sparkline e usuários
 *    afetados. Mostra a UI completa do componente.
 *
 * 2. "Feed filtrado por prod+error" — começa com 2 filtros pré-ativados
 *    (prod + status=new) via prop de estado inicial. Para isso, o example
 *    usa um wrapper com um <ErrorTrackerFeedControlled> que aceita a
 *    `initialFilters` e dispara dispatch via `onReady`... como o componente
 *    público não expõe isso, a forma mais simples e DIDÁTICA do example é
 *    renderizar 2 cards lado a lado: o esquerdo mostra o feed com TODOS os
 *    erros em prod, e o direito mostra o mesmo feed MAS com botão
 *    programático para o usuário ativar prod+new na própria UI.
 *
 * Para manter o example 100% determinístico (e zero `Math.random`), o
 * `seedHelpers` é exposto: `seedTrend(base, len, seed)` cria uma série
 * monotônica + ruído determinístico.
 *
 * Imagens via picsum.photos (avatar estável, sem 404).
 */

import type { Example } from "@/data/examples"
import { ErrorTrackerFeed } from "@/components/ui/error-tracker-feed"
import { ProdNewFilteredFeed } from "@/data/error-tracker-feed-demo"
import type { ErrorEventItem } from "@/components/ui/error-tracker-feed-types"

/* ------------------------------------------------------------------ */
/*  PRNG seedado (mulberry32) — zero Math.random                       */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedTrend(base: number, len: number, seed: number): number[] {
  const rng = mulberry32(seed)
  const out: number[] = []
  let v = base
  for (let i = 0; i < len; i++) {
    v = Math.max(0, Math.round(v + (rng() - 0.45) * base * 0.35))
    out.push(v)
  }
  return out
}

function trendPoints(values: number[]): { t: string; count: number }[] {
  const now = Date.parse("2024-05-12T14:00:00.000Z")
  const stepMs = 60 * 60 * 1000 // 1h
  return values.map((count, i) => {
    const t = new Date(now - (values.length - 1 - i) * stepMs).toISOString()
    return { t, count }
  })
}

/* ------------------------------------------------------------------ */
/*  Dataset 1 — 12 erros diversificados                                */
/* ------------------------------------------------------------------ */

const fullFeed: ErrorEventItem[] = [
  {
    id: "e-1",
    type: "TypeError: Cannot read 'cart' of undefined",
    message:
      "Tentativa de acessar 'cart.items.length' quando o carrinho ainda não foi hidratado pelo carrinho-context após login silencioso.",
    category: "exception",
    count: 1842,
    firstSeen: "2024-05-11T08:14:00.000Z",
    lastSeen: "2024-05-12T13:48:00.000Z",
    environment: "prod",
    status: "new",
    service: "checkout-web",
    release: "v2024.05.10-rc.2",
    affectedUsers: [
      { id: "u-1", name: "Ana Souza", avatar: "https://picsum.photos/seed/u1/64/64", count: 12 },
      { id: "u-2", name: "Bruno Lima", avatar: "https://picsum.photos/seed/u2/64/64", count: 8 },
      { id: "u-3", name: "Carla Dias", avatar: "https://picsum.photos/seed/u3/64/64", count: 5 },
    ],
    trend: trendPoints(seedTrend(120, 12, 0x51a1)),
    stackPreview: "at CheckoutPage.useEffect (checkout.tsx:142)",
    stack: [
      { function: "CheckoutPage.useEffect", file: "src/pages/checkout.tsx", line: 142, column: 18, inApp: true },
      { function: "executeEffect", file: "node_modules/react-dom/cjs/react-dom.production.min.js", line: 14945, column: 6, inApp: false },
      { function: "runEffects", file: "node_modules/react-dom/cjs/react-dom.production.min.js", line: 15104, column: 8, inApp: false },
      { function: "commitHookEffectListMount", file: "node_modules/react-dom/cjs/react-dom.production.min.js", line: 23189, column: 4, inApp: false },
    ],
    breadcrumbs: [
      { t: "2024-05-12T13:48:02.115Z", type: "navigation", message: "navigate /cart → /checkout" },
      { t: "2024-05-12T13:48:02.190Z", type: "http", message: "GET /api/me 200", level: "info" },
      { t: "2024-05-12T13:48:02.318Z", type: "ui", message: "click #checkout-submit" },
      { t: "2024-05-12T13:48:02.421Z", type: "http", message: "POST /api/orders 500", level: "error" },
      { t: "2024-05-12T13:48:02.430Z", type: "error", message: "Cannot read 'cart' of undefined", level: "error" },
    ],
  },
  {
    id: "e-2",
    type: "DatabaseTimeout: query exceeded 5000ms",
    message:
      "Query SELECT … FROM orders o JOIN order_items oi … não termina dentro do budget (5s). Suspeita: índice ausente após migração 2024_05_09.",
    category: "db",
    count: 327,
    firstSeen: "2024-05-09T22:01:00.000Z",
    lastSeen: "2024-05-12T13:55:00.000Z",
    environment: "prod",
    status: "new",
    service: "orders-api",
    release: "v2024.05.09-prod",
    affectedUsers: [
      { id: "u-4", name: "Diego Martins", avatar: "https://picsum.photos/seed/u4/64/64", count: 41 },
      { id: "u-5", name: "Elisa Rocha", avatar: "https://picsum.photos/seed/u5/64/64", count: 28 },
    ],
    trend: trendPoints(seedTrend(40, 12, 0x52b2)),
  },
  {
    id: "e-3",
    type: "NetworkError: Failed to fetch (CORS preflight)",
    message:
      "OPTIONS /v1/payments/intents preflight falhou — header Access-Control-Allow-Methods ausente após deploy do gateway.",
    category: "network",
    count: 96,
    firstSeen: "2024-05-12T11:20:00.000Z",
    lastSeen: "2024-05-12T13:50:00.000Z",
    environment: "prod",
    status: "new",
    service: "payments-edge",
    affectedUsers: [
      { id: "u-6", name: "Felipe Nunes", avatar: "https://picsum.photos/seed/u6/64/64", count: 14 },
    ],
    trend: trendPoints(seedTrend(20, 12, 0x53c3)),
  },
  {
    id: "e-4",
    type: "ZodError: Invalid email",
    message: "Campo 'email' não passou na validação: esperado formato RFC5322.",
    category: "validation",
    count: 412,
    firstSeen: "2024-05-12T09:00:00.000Z",
    lastSeen: "2024-05-12T13:59:00.000Z",
    environment: "prod",
    status: "ignored",
    service: "signup-web",
    affectedUsers: [],
    trend: trendPoints(seedTrend(60, 12, 0x54d4)),
  },
  {
    id: "e-5",
    type: "AuthError: token_revoked",
    message: "Access token foi revogado pelo IdP (rotatividade de chaves a cada 24h).",
    category: "auth",
    count: 58,
    firstSeen: "2024-05-12T07:00:00.000Z",
    lastSeen: "2024-05-12T13:45:00.000Z",
    environment: "prod",
    status: "resolved",
    service: "auth-svc",
    release: "v2024.05.12-hotfix.1",
    affectedUsers: [
      { id: "u-7", name: "Gabriela Tavares", avatar: "https://picsum.photos/seed/u7/64/64", count: 22 },
    ],
    trend: trendPoints(seedTrend(15, 12, 0x55e5)),
  },
  {
    id: "e-6",
    type: "HttpError: 503 from /api/inventory",
    message: "Serviço de inventário retornou 503 por 38s durante deploy canary.",
    category: "api",
    count: 71,
    firstSeen: "2024-05-12T12:32:00.000Z",
    lastSeen: "2024-05-12T13:10:00.000Z",
    environment: "prod",
    status: "resolved",
    service: "inventory-svc",
    affectedUsers: [],
    trend: trendPoints(seedTrend(8, 12, 0x56f6)),
  },
  {
    id: "e-7",
    type: "TypeError: cart is null",
    message: "Carrinho foi limpo entre hidratação e render — race entre useCart() e useCartTotal().",
    category: "exception",
    count: 24,
    firstSeen: "2024-05-12T10:10:00.000Z",
    lastSeen: "2024-05-12T12:45:00.000Z",
    environment: "staging",
    status: "new",
    service: "checkout-web",
    affectedUsers: [],
    trend: trendPoints(seedTrend(5, 12, 0x5707)),
  },
  {
    id: "e-8",
    type: "SlowQuery: SELECT on events > 1500ms",
    message: "Tabela events cresceu para 480M linhas — partição mensal precisa ser ampliada.",
    category: "db",
    count: 132,
    firstSeen: "2024-05-10T00:00:00.000Z",
    lastSeen: "2024-05-12T13:30:00.000Z",
    environment: "staging",
    status: "new",
    service: "analytics-svc",
    affectedUsers: [],
    trend: trendPoints(seedTrend(15, 12, 0x5818)),
  },
  {
    id: "e-9",
    type: "NetworkError: WebSocket closed (1006)",
    message: "WS do dashboard de telemetria caiu após 90s ocioso — proxy fecha keepalive silenciosamente.",
    category: "network",
    count: 19,
    firstSeen: "2024-05-12T11:00:00.000Z",
    lastSeen: "2024-05-12T13:00:00.000Z",
    environment: "staging",
    status: "suppressed",
    service: "telemetry-fe",
    affectedUsers: [],
    trend: trendPoints(seedTrend(3, 12, 0x5929)),
  },
  {
    id: "e-10",
    type: "ReferenceError: __DEV__ is not defined",
    message: "Hot reload do dev server deixou referência ao flag de debug no bundle.",
    category: "exception",
    count: 8,
    firstSeen: "2024-05-12T13:00:00.000Z",
    lastSeen: "2024-05-12T13:50:00.000Z",
    environment: "dev",
    status: "new",
    service: "internal-tools",
    affectedUsers: [],
    trend: trendPoints(seedTrend(2, 12, 0x5a3a)),
  },
  {
    id: "e-11",
    type: "ValidationError: CPF inválido",
    message: "Máscara aceitou '000.000.000-00' como válido — algoritmo de dígito verificador não rejeita zeros.",
    category: "validation",
    count: 14,
    firstSeen: "2024-05-12T12:00:00.000Z",
    lastSeen: "2024-05-12T13:40:00.000Z",
    environment: "dev",
    status: "ignored",
    service: "checkout-web",
    affectedUsers: [],
    trend: trendPoints(seedTrend(2, 12, 0x5b4b)),
  },
  {
    id: "e-12",
    type: "AuthError: invalid_grant",
    message: "Refresh token expirou antes do access token — relógio do cliente dessincronizado.",
    category: "auth",
    count: 6,
    firstSeen: "2024-05-12T11:30:00.000Z",
    lastSeen: "2024-05-12T12:10:00.000Z",
    environment: "dev",
    status: "new",
    service: "auth-svc",
    affectedUsers: [],
    trend: trendPoints(seedTrend(1, 12, 0x5c5c)),
  },
]

/* ------------------------------------------------------------------ */
/*  Example 1 — feed completo com filtros                              */
/* ------------------------------------------------------------------ */

const errorTrackerFeedFullExample: Example = {
  title: "Feed completo com filtros",
  description:
    "12 erros em 3 ambientes, com trend mini-sparkline, usuários afetados e filtros funcionais (ambiente, status, busca por tipo).",
  code: `<ErrorTrackerFeed
  errors={errors}
  groupBy="type"
  filterable
  // Sem onErrorClick: o componente abre seu próprio Dialog built-in
  // com tabs Stack/Breadcrumbs/Contexto/Histórico/Usuários.
/>`,
  render: (
    <div className="w-full">
      <ErrorTrackerFeed
        errors={fullFeed}
        groupBy="type"
        filterable
        onErrorAction={(e, action) =>
          console.log("Action:", action, "on", e.id)
        }
      />
    </div>
  ),
}

/* ------------------------------------------------------------------ */
/*  Example 2 — feed filtrado por prod + status="new"                  */
/* ------------------------------------------------------------------ */

const errorTrackerFeedFilteredExample: Example = {
  title: "Filtrado por prod + status 'new'",
  description:
    "Aplica automaticamente os filtros `prod` e `new` — o feed mostra apenas erros críticos do ambiente de produção ainda não triados.",
  code: `// Use o componente ProdNewFilteredFeed (auto-aplica prod+new na primeira renderização)
<ProdNewFilteredFeed errors={errors} />`,
  render: <ProdNewFilteredFeed errors={fullFeed} />,
}

export const examplesErrorTrackerFeed: Record<string, Example[]> = {
  "error-tracker-feed": [
    errorTrackerFeedFullExample,
    errorTrackerFeedFilteredExample,
  ],
}
