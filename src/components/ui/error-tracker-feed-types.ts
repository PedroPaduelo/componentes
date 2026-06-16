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

/**
 * Um frame de stack trace.
 * Inspirado em V8 stack frames: function/file/line/col/type.
 */
export type ErrorStackFrame = {
  function: string
  file?: string
  line?: number
  column?: number
  /** Frame de aplicação (true) vs frame de runtime/biblioteca (false). */
  inApp?: boolean
}

/**
 * Um breadcrumb (evento que precedeu o erro) — padrão Sentry.
 * Pode ser navegação, requisição HTTP, log de console, etc.
 */
export type ErrorBreadcrumb = {
  t: string
  type: "navigation" | "http" | "ui" | "console" | "info" | "error"
  message: string
  level?: "info" | "warning" | "error"
  data?: Record<string, string | number | boolean>
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
  /** Preview de stack trace (opcional — usado na lista). */
  stackPreview?: string
  /** Stack trace completo (frames) — exibido na tab "Stack" do detail dialog. */
  stack?: ErrorStackFrame[]
  /** Breadcrumbs que precederam o erro — exibidos na tab "Breadcrumbs". */
  breadcrumbs?: ErrorBreadcrumb[]
  /** Versão / release (opcional). Ex.: "v2024.05.01-rc.1" */
  release?: string
  /** Serviço de origem. */
  service: string
}

/** Modos de agrupamento dos erros na lista. */
export type ErrorGroupBy = "type" | "service" | "user"

/** Callback para uma ação sobre um erro a partir do detail dialog. */
export type ErrorAction = (
  error: ErrorEventItem,
  action: "resolve" | "ignore" | "copy-stack",
) => void

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
  /**
   * Callback opcional ao clicar em um item. Quando fornecido, o detail
   * dialog built-in NÃO abre — o consumidor fica responsável por
   * mostrar os detalhes como preferir (window.alert, navegação,
   * outro dialog customizado, etc.).
   *
   * Quando omitido, o componente abre seu próprio Dialog com tabs
   * Stack/Breadcrumbs/Contexto/Histórico/Usuários.
   */
  onErrorClick?: (error: ErrorEventItem) => void
  /**
   * Callback opcional para ações de "Marcar como resolvido",
   * "Marcar como ignorado" e "Copiar stack" no detail dialog.
   * Se omitido, os botões continuam visíveis (UI não muda) mas a
   * ação é apenas local (fecha o dialog sem efeito colateral).
   */
  onErrorAction?: ErrorAction
}
