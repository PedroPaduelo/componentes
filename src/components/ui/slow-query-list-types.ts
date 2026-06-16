/**
 * SlowQueryList — tipagem pública.
 *
 * Componente de observabilidade de banco de dados inspirado em pgAdmin,
 * DataDog Database Monitoring e pganalyze. Lista queries SQL lentas
 * com diagnóstico completo: tempo de execução, query SQL com syntax
 * highlight, plano do EXPLAIN em árvore, locks e sugestões automáticas
 * (índice faltante, rewrite, vacuum, stats, lock).
 *
 * Categorizado como "Feedback" (alinhado ao lote de Observabilidade
 * da vitrine, junto de incident-timeline/error-tracker-feed/etc.).
 */

import type { HTMLAttributes } from "react"

/** Tipos de sugestão automática que o componente renderiza. */
export type SuggestionType =
  | "missing_index"
  | "rewrite"
  | "vacuum"
  | "stats"
  | "lock"
  | "analyze"

/** Nó de plano do EXPLAIN (árvore recursiva). */
export type PlanNode = {
  /** Operação do nó (Seq Scan, Index Scan, Hash Join, Sort, etc.). */
  operation: string
  /** Objeto/tabela/índice referenciado. */
  object?: string
  /** Custo estimado pelo planner. */
  cost?: number
  /** Linhas estimadas pelo planner. */
  rows?: number
  /** Tempo real de execução em ms. */
  actualTimeMs?: number
  /** Filhos do plano (nós aninhados). */
  children?: PlanNode[]
}

/** Sugestão de otimização associada a uma query lenta. */
export type QuerySuggestion = {
  type: SuggestionType
  description: string
  /** Estimativa de melhoria (0-100). */
  estimatedImprovementPct?: number
  /** DDL sugerido (ex.: CREATE INDEX). Botão "copiar" habilitado quando presente. */
  suggestedDdl?: string
}

/** Severidade da query lenta — governa cor do badge e agrupamento. */
export type SlowQuerySeverity = "warning" | "critical"

/** Uma query lenta capturada pelo monitor. */
export type SlowQuery = {
  /** Identificador único. */
  id: string
  /** Timestamp ISO de quando a query foi capturada. */
  t: string
  /** Nome do banco de dados. */
  database: string
  /** Schema (public, audit, etc.). */
  schema: string
  /** Tabela principal envolvida (opcional). */
  table?: string
  /** Usuário que executou. */
  user: string
  /** Duração em milissegundos. */
  durationMs: number
  /** SQL completo (pode ser multi-linha). */
  query: string
  /** Linhas examinadas (scan). */
  rowsExamined: number
  /** Linhas retornadas (output). */
  rowsReturned: number
  /** Plano do EXPLAIN em árvore. */
  plan: PlanNode
  /** Locks ativos durante a execução. */
  locks: string[]
  /** Sugestões automáticas (opcional). */
  suggestions?: QuerySuggestion[]
  /** Severidade calculada. */
  severity: SlowQuerySeverity
  /** Quantas vezes essa query apareceu na última hora. */
  callsLastHour: number
  /** Timestamp ISO da última ocorrência. */
  lastSeen: string
}

/** Modo de agrupamento da lista. */
export type SlowQueryGroupBy = "table" | "database" | "user" | "none"

export type SlowQueryListProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Lista de queries lentas a exibir. */
  queries: SlowQuery[]
  /** Callback disparado ao clicar no card de uma query. */
  onQueryClick?: (q: SlowQuery) => void
  /**
   * Modo de agrupamento visual:
   * - "table" agrupa por `query.table` (default quando há table)
   * - "database" agrupa por `query.database`
   * - "user" agrupa por `query.user`
   * - "none" lista plana
   */
  groupBy?: SlowQueryGroupBy
  /**
   * Threshold em ms. Queries com `durationMs < threshold` ficam
   * esmaecidas/fantasma. Default 100.
   */
  thresholdMs?: number
}
