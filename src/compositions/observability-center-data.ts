/**
 * Dados e helpers puros da composição "Observability Command Center" (Pulse).
 *
 * Tudo aqui é determinístico — nenhum `Math.random`. A "vida" da tela vem de
 * um PRNG seedado pelo tick, então a simulação é reproduzível e estável.
 *
 * As cores de status (verde/âmbar/rosa) e a escala do heatmap são cores
 * SEMÂNTICAS de severidade / data-viz — não são tokens de tema. O "casco"
 * (cards, nós do mesh, textos) usa tokens shadcn (var(--card)/--border/...).
 */

/* ------------------------------------------------------------------ */
/*  PRNG determinístico                                                */
/* ------------------------------------------------------------------ */

/** mulberry32 — gerador pseudo-aleatório rápido e determinístico (0..1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Mistura tick + sal num seed estável de 32 bits. */
export function seedFor(tick: number, salt: number): number {
  return (((tick + 1) * 0x9e3779b1) ^ (salt * 0x85ebca77)) >>> 0
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}

/* ------------------------------------------------------------------ */
/*  Topologia do service mesh                                          */
/* ------------------------------------------------------------------ */

export type ServiceKind = "edge" | "gateway" | "service" | "datastore" | "queue"
export type ServiceStatus = "healthy" | "degraded" | "critical"

export type ServiceDef = {
  id: string
  name: string
  short: string
  kind: ServiceKind
  /** Coordenadas no viewBox do mesh (ver MESH_VIEWBOX). */
  x: number
  y: number
  /** Requests por segundo de referência. */
  baseRps: number
  /** Latência p95 de referência (ms). */
  baseLatency: number
}

export type EdgeDef = {
  id: string
  from: string
  to: string
  /** Curvatura perpendicular (px no viewBox); sinal define o lado. */
  bow: number
}

export const MESH_VIEWBOX = { w: 1000, h: 560 }

export const SERVICES: ServiceDef[] = [
  { id: "cdn", name: "CDN Edge", short: "Edge", kind: "edge", x: 95, y: 280, baseRps: 5200, baseLatency: 12 },
  { id: "gateway", name: "API Gateway", short: "GW", kind: "gateway", x: 275, y: 280, baseRps: 5000, baseLatency: 24 },
  { id: "auth", name: "Auth Service", short: "Auth", kind: "service", x: 480, y: 116, baseRps: 1700, baseLatency: 34 },
  { id: "orders", name: "Orders API", short: "Orders", kind: "service", x: 480, y: 280, baseRps: 2200, baseLatency: 62 },
  { id: "search", name: "Search API", short: "Search", kind: "service", x: 480, y: 444, baseRps: 1500, baseLatency: 48 },
  { id: "payments", name: "Payments", short: "Pay", kind: "service", x: 690, y: 192, baseRps: 940, baseLatency: 92 },
  { id: "inventory", name: "Inventory", short: "Inv", kind: "service", x: 690, y: 372, baseRps: 1120, baseLatency: 70 },
  { id: "pg", name: "Postgres", short: "PG", kind: "datastore", x: 905, y: 120, baseRps: 1850, baseLatency: 18 },
  { id: "redis", name: "Redis", short: "Redis", kind: "datastore", x: 905, y: 290, baseRps: 3100, baseLatency: 4 },
  { id: "kafka", name: "Kafka", short: "Kafka", kind: "queue", x: 905, y: 458, baseRps: 1250, baseLatency: 9 },
]

export const EDGES: EdgeDef[] = [
  { id: "e-cdn-gw", from: "cdn", to: "gateway", bow: 0 },
  { id: "e-gw-auth", from: "gateway", to: "auth", bow: -46 },
  { id: "e-gw-orders", from: "gateway", to: "orders", bow: 0 },
  { id: "e-gw-search", from: "gateway", to: "search", bow: 46 },
  { id: "e-auth-redis", from: "auth", to: "redis", bow: -28 },
  { id: "e-orders-pay", from: "orders", to: "payments", bow: -22 },
  { id: "e-orders-inv", from: "orders", to: "inventory", bow: 22 },
  { id: "e-orders-kafka", from: "orders", to: "kafka", bow: 64 },
  { id: "e-search-pg", from: "search", to: "pg", bow: 50 },
  { id: "e-pay-pg", from: "payments", to: "pg", bow: -18 },
  { id: "e-pay-kafka", from: "payments", to: "kafka", bow: 34 },
  { id: "e-inv-redis", from: "inventory", to: "redis", bow: -8 },
  { id: "e-inv-pg", from: "inventory", to: "pg", bow: -20 },
]

export const SERVICE_MAP: Record<string, ServiceDef> = SERVICES.reduce(
  (acc, s) => {
    acc[s.id] = s
    return acc
  },
  {} as Record<string, ServiceDef>,
)

/**
 * Consumidores diretos de cada serviço: nós cuja requisição depende dele.
 * Se `to` degrada, todos os `from` que o consomem sofrem em cascata.
 */
export const CONSUMERS_OF: Record<string, string[]> = EDGES.reduce(
  (acc, e) => {
    ;(acc[e.to] ??= []).push(e.from)
    return acc
  },
  {} as Record<string, string[]>,
)

/** Cadeia upstream (para o trace waterfall) a partir de um serviço. */
export const DOWNSTREAM_OF: Record<string, string[]> = EDGES.reduce(
  (acc, e) => {
    ;(acc[e.from] ??= []).push(e.to)
    return acc
  },
  {} as Record<string, string[]>,
)

/* ------------------------------------------------------------------ */
/*  Geometria das arestas (bézier quadrática)                          */
/* ------------------------------------------------------------------ */

export type Point = { x: number; y: number }

/** Ponto de controle da curva: meio do segmento deslocado na perpendicular. */
export function edgeControl(from: Point, to: Point, bow: number): Point {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  return { x: mx + (-dy / len) * bow, y: my + (dx / len) * bow }
}

/** Posição em t∈[0,1] de uma bézier quadrática P0–C–P1. */
export function quadAt(p0: Point, c: Point, p1: Point, t: number): Point {
  const u = 1 - t
  const a = u * u
  const b = 2 * u * t
  const d = t * t
  return { x: a * p0.x + b * c.x + d * p1.x, y: a * p0.y + b * c.y + d * p1.y }
}

export function edgePathD(from: Point, c: Point, to: Point): string {
  return `M ${from.x} ${from.y} Q ${c.x} ${c.y} ${to.x} ${to.y}`
}

/* ------------------------------------------------------------------ */
/*  Cores semânticas (status + heatmap) — NÃO são tokens de tema       */
/* ------------------------------------------------------------------ */

export const STATUS_HEX: Record<ServiceStatus, string> = {
  healthy: "#10b981",
  degraded: "#f59e0b",
  critical: "#f43f5e",
}

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  healthy: "Saudável",
  degraded: "Degradado",
  critical: "Crítico",
}

/**
 * Cor dos "pacotes" que fluem pelas arestas do mesh. Tráfego normal flui em
 * ciano (sky); degradação em âmbar; falha em rosa. Severidade de data-viz.
 */
export const PACKET_HEX: Record<ServiceStatus, string> = {
  healthy: "#38bdf8",
  degraded: "#f59e0b",
  critical: "#fb3a5d",
}

export const STATUS_RANK: Record<ServiceStatus, number> = {
  healthy: 0,
  degraded: 1,
  critical: 2,
}

/** Classes Tailwind literais por status (texto/fundo/borda) — sem interpolação. */
export const STATUS_CLASSES: Record<
  ServiceStatus,
  { text: string; dot: string; soft: string; ring: string }
> = {
  healthy: {
    text: "text-emerald-500",
    dot: "bg-emerald-500",
    soft: "bg-emerald-500/10 text-emerald-500",
    ring: "ring-emerald-500/30",
  },
  degraded: {
    text: "text-amber-500",
    dot: "bg-amber-500",
    soft: "bg-amber-500/10 text-amber-500",
    ring: "ring-amber-500/30",
  },
  critical: {
    text: "text-rose-500",
    dot: "bg-rose-500",
    soft: "bg-rose-500/10 text-rose-500",
    ring: "ring-rose-500/30",
  },
}

/** Escala de calor (0..1 → rgba) usada no heatmap de latência. */
export function heatColor(v: number): string {
  const t = clamp(v, 0, 1)
  // 0 → teal/verde, 0.5 → âmbar, 1 → rosa
  let r: number
  let g: number
  let b: number
  if (t < 0.5) {
    const k = t / 0.5
    r = Math.round(16 + (245 - 16) * k)
    g = Math.round(185 + (158 - 185) * k)
    b = Math.round(129 + (11 - 129) * k)
  } else {
    const k = (t - 0.5) / 0.5
    r = Math.round(245 + (244 - 245) * k)
    g = Math.round(158 + (63 - 158) * k)
    b = Math.round(11 + (94 - 11) * k)
  }
  const alpha = 0.14 + 0.82 * t
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`
}

/* ------------------------------------------------------------------ */
/*  Logs                                                               */
/* ------------------------------------------------------------------ */

export type LogLevel = "debug" | "info" | "warn" | "error"

export type LogEntry = {
  id: number
  t: number
  level: LogLevel
  service: string
  method: string
  path: string
  status: number
  ms: number
  message: string
}

export const LOG_LEVEL_CLASSES: Record<
  LogLevel,
  { text: string; chip: string }
> = {
  debug: { text: "text-sky-400", chip: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  info: { text: "text-emerald-400", chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  warn: { text: "text-amber-400", chip: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  error: { text: "text-rose-400", chip: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
}

export const LOG_PATHS: Record<string, string[]> = {
  cdn: ["/static/app.js", "/assets/hero.webp", "/_next/chunk.js"],
  gateway: ["/v1/checkout", "/v1/me", "/v1/feed", "/health"],
  auth: ["/oauth/token", "/session/verify", "/login"],
  orders: ["/orders", "/orders/{id}", "/orders/{id}/items"],
  search: ["/search?q=", "/suggest", "/index/reload"],
  payments: ["/charge", "/refund", "/payout/status"],
  inventory: ["/stock/{sku}", "/reserve", "/sync"],
  pg: ["SELECT orders", "UPDATE stock", "INSERT events"],
  redis: ["GET sess:*", "SETEX cart", "INCR rate"],
  kafka: ["produce orders.v1", "consume events", "commit offset"],
}

export const LOG_MESSAGES: Record<LogLevel, string[]> = {
  debug: ["span iniciado", "trace propagado", "token validado", "cache lookup"],
  info: ["request concluído", "cache hit", "handshake ok", "lote processado"],
  warn: ["query lenta detectada", "retry 2/3", "pool perto do limite", "p95 acima do alvo"],
  error: ["upstream timeout", "conexão recusada", "circuit breaker aberto", "deadline excedido"],
}

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] as const

/* ------------------------------------------------------------------ */
/*  Alertas                                                            */
/* ------------------------------------------------------------------ */

export type AlertSeverity = "warning" | "critical"

export type AlertItem = {
  id: number
  service: string
  severity: AlertSeverity
  title: string
  firing: boolean
  acked: boolean
  t: number
  resolvedT: number | null
}

/* ------------------------------------------------------------------ */
/*  Trace waterfall                                                    */
/* ------------------------------------------------------------------ */

export type TraceSpan = {
  id: string
  service: string
  label: string
  depth: number
  startPct: number
  widthPct: number
  ms: number
  status: ServiceStatus
}

/* ------------------------------------------------------------------ */
/*  Formatação                                                         */
/* ------------------------------------------------------------------ */

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return Math.round(n).toString()
}

export function formatMs(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(2)}s`
  return `${Math.round(n)}ms`
}

export function formatPct(n: number, digits = 2): string {
  return `${(n * 100).toFixed(digits)}%`
}

export function formatClock(t: number): string {
  // t é o índice de tick; mapeia para um relógio fictício hh:mm:ss estável.
  const total = 38_000 + t
  const s = total % 60
  const m = Math.floor(total / 60) % 60
  const h = Math.floor(total / 3600) % 24
  const pad = (v: number) => v.toString().padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}
