/**
 * Tipos públicos do componente `IncidentTimeline`.
 *
 * Um incidente é uma sequência ordenada de eventos: detecção, paging,
 * escalonamento, mitigação, resolução. A timeline lista esses eventos em ordem
 * cronológica com nó colorido por severidade, chip por tipo, autor opcional
 * e timestamp relativo + absoluto.
 */

/** Severidade de um evento individual. */
export type IncidentSeverity = "low" | "medium" | "high" | "critical"

/** Estado geral do incidente. */
export type IncidentStatus = "ongoing" | "mitigated" | "resolved"

/** Tipo do evento (categórico, mapeado para um chip). */
export type IncidentEventType =
  | "detect"
  | "page"
  | "escalate"
  | "note"
  | "deploy"
  | "mitigate"
  | "resolve"
  | "postmortem"
  | "rollback"

/** Autor humano que executou o evento. */
export type IncidentActor = {
  name: string
  avatar?: string
  role?: string
}

/** Evento individual da timeline. */
export type IncidentTimelineEvent = {
  /** Identificador estável do evento (usado como React key e em onEventClick). */
  id: string
  /** Timestamp ISO do evento. */
  t: string
  /** Tipo do evento (chip). */
  type: IncidentEventType
  /** Severidade do evento (cor do nó). */
  severity: IncidentSeverity
  /** Título curto do evento. */
  title: string
  /** Descrição opcional, exibida abaixo do título. */
  description?: string
  /** Autor humano que executou o evento. */
  actor?: IncidentActor
  /** Metadados livres (chave/valor) exibidos como pequenos badges. */
  meta?: Record<string, string | number | boolean>
}

/** Props públicas do componente. */
export type IncidentTimelineProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Lista de eventos exibidos na timeline, na ordem cronológica. */
  events: IncidentTimelineEvent[]
  /** Estado geral do incidente (cor do chip e do badge no header). */
  status: IncidentStatus
  /** Severidade global do incidente (cor do badge no header). */
  severity: IncidentSeverity
  /** Timestamp ISO de início do incidente (obrigatório). */
  startedAt: string
  /** Timestamp ISO de resolução (omitir enquanto ongoing/mitigated). */
  resolvedAt?: string
  /** Título curto do incidente exibido no header. */
  title?: string
  /**
   * Quando `true`, atualiza os tempos relativos a cada 30s via `setInterval`.
   * Cleanup correto via `useRef` + `useEffect` no unmount. Default: `false`.
   */
  live?: boolean
  /** Callback disparado ao clicar num evento. */
  onEventClick?: (event: IncidentTimelineEvent) => void
}
