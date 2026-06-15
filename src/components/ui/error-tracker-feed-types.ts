/**
 * Tipos públicos do componente `ErrorTrackerFeed`.
 *
 * Formato inspirado no padrão Sentry (issue group + count + environment +
 * status + firstSeen/lastSeen) e na estética do Pulse (ObservabilityCenter).
 *
 * Tudo é tipado nominalmente — nada de `as any` na fronteira do componente.
 */

export type ErrorEnvironment = "dev" | "staging" | "prod"
export type ErrorStatus = "new" | "resolved" | "ignored" | "suppressed"
export type ErrorCategory = "exception" | "api" | "db" | "auth" | "network" | "validation"

/** Um ponto na mini-sparkline de tendência (horas → contagem). */
export type ErrorTrendPoint = { t: string; count: number }

/** Um usuário afetado por um erro. */
export type ErrorAffectedUser = {
  id: string
  name: string
  avatar?: string
  count: number
}

/** Um evento/issue de erro. */
export type ErrorEventItem = {
  /** Identificador único do issue/grupo. */
  id: string
  /** Tipo do erro em mono font. Ex.: "TypeError: Cannot read..." */
  type: string
  /** Mensagem curta truncada em 2 linhas. */
  message: string
  category: ErrorCategory
  /** Número total de ocorrências. */
  count: number
  /** ISO 8601 — primeira ocorrência. */
  firstSeen: string
  /** ISO 8601 — última ocorrência. */
  lastSeen: string
  environment: ErrorEnvironment
  status: ErrorStatus
  /** Top 3 usuários afetados (opcional). */
  affectedUsers?: ErrorAffectedUser[]
  /** Mini-sparkline das últimas horas (opcional). */
  trend?: ErrorTrendPoint[]
  /** Preview de stack trace (opcional). */
  stackPreview?: string
  /** Versão / release (opcional). Ex.: "v2024.05.01-rc.1" */
  release?: string
  /** Serviço de origem. */
  service: string
}

/** Modos de agrupamento dos erros na lista. */
export type ErrorGroupBy = "type" | "service" | "user"

export type ErrorTrackerFeedProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Lista de erros/exception events a exibir. */
  errors: ErrorEventItem[]
  /** Estratégia de agrupamento (default: "type"). */
  groupBy?: ErrorGroupBy
  /** Quando true (default), mostra a barra de filtros. */
  filterable?: boolean
  /** Callback ao clicar em um item de erro. */
  onErrorClick?: (error: ErrorEventItem) => void
}
