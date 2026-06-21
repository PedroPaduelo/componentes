/**
 * Examples — SlowQueryList
 *
 * Duas instâncias:
 *  1) "Banco de auditoria" — 6 queries com diferentes severidades,
 *     planos com Seq Scan + Index Scan, locks e sugestões mistas.
 *  2) "SGT Maker" — 4 queries com missing_index (DB menor, foco em
 *     diagnóstico de índices faltantes), threshold mais agressivo.
 */

import { SlowQueryList } from "@/components/ui/slow-query-list"
import type { Example } from "@/data/examples"
import type { SlowQuery } from "@/components/ui/slow-query-list-types"

/* ------------------------------------------------------------------ 1. auditoria */

/**
 * 6 queries do banco `audit_db` — mistura de warning/critical, plans
 * com Seq Scan problemático, lock contention e algumas sugestões.
 */
export const auditQueries: SlowQuery[] = [
  {
    id: "audit-001",
    t: "2026-06-15T14:32:18Z",
    database: "audit_db",
    schema: "public",
    table: "access_log",
    user: "report_user",
    durationMs: 4820,
    query: `SELECT a.user_id, a.action, a.created_at, u.email
FROM access_log a
JOIN users u ON u.id = a.user_id
WHERE a.created_at >= NOW() - INTERVAL '7 days'
ORDER BY a.created_at DESC
LIMIT 500;`,
    rowsExamined: 1_842_000,
    rowsReturned: 500,
    plan: {
      operation: "Limit",
      cost: 31250.4,
      rows: 500,
      actualTimeMs: 4820,
      children: [
        {
          operation: "Sort",
          cost: 31250.4,
          rows: 500,
          actualTimeMs: 4680,
          children: [
            {
              operation: "Hash Join",
              cost: 29812.0,
              rows: 500,
              actualTimeMs: 3810,
              children: [
                {
                  operation: "Seq Scan",
                  object: "access_log a",
                  cost: 14210.5,
                  rows: 1_842_000,
                  actualTimeMs: 2210,
                },
                {
                  operation: "Hash",
                  cost: 8210.0,
                  rows: 78_400,
                  actualTimeMs: 1340,
                  children: [
                    {
                      operation: "Seq Scan",
                      object: "users u",
                      cost: 4180.0,
                      rows: 78_400,
                      actualTimeMs: 720,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    locks: ["AccessShareLock on access_log", "AccessShareLock on users"],
    suggestions: [
      {
        type: "missing_index",
        description:
          "Coluna `access_log.created_at` é filtrada e ordenada sem índice — Seq Scan sobre 1.8M de linhas.",
        estimatedImprovementPct: 78,
        suggestedDdl: `CREATE INDEX CONCURRENTLY idx_access_log_created_at
  ON public.access_log (created_at DESC);`,
      },
      {
        type: "rewrite",
        description:
          "Considere paginação por cursor (`created_at, id`) em vez de OFFSET para grandes ranges.",
        estimatedImprovementPct: 22,
      },
    ],
    severity: "critical",
    callsLastHour: 184,
    lastSeen: "2026-06-15T14:31:55Z",
  },
  {
    id: "audit-002",
    t: "2026-06-15T14:31:50Z",
    database: "audit_db",
    schema: "audit",
    table: "policy_changes",
    user: "etl_job",
    durationMs: 2110,
    query: `SELECT policy_id, COUNT(*) AS total
FROM audit.policy_changes
WHERE changed_by = $1
  AND changed_at BETWEEN $2 AND $3
GROUP BY policy_id;`,
    rowsExamined: 612_400,
    rowsReturned: 1280,
    plan: {
      operation: "HashAggregate",
      cost: 14810.0,
      rows: 1280,
      actualTimeMs: 2110,
      children: [
        {
          operation: "Seq Scan",
          object: "audit.policy_changes",
          cost: 9410.0,
          rows: 612_400,
          actualTimeMs: 1620,
        },
      ],
    },
    locks: ["AccessShareLock on audit.policy_changes"],
    suggestions: [
      {
        type: "missing_index",
        description:
          "Filtro combinado `changed_by + changed_at` cobre a maior parte das queries deste job.",
        estimatedImprovementPct: 84,
        suggestedDdl: `CREATE INDEX CONCURRENTLY idx_policy_changes_changed_by_at
  ON audit.policy_changes (changed_by, changed_at);`,
      },
    ],
    severity: "critical",
    callsLastHour: 96,
    lastSeen: "2026-06-15T14:30:18Z",
  },
  {
    id: "audit-003",
    t: "2026-06-15T14:30:11Z",
    database: "audit_db",
    schema: "public",
    table: "sessions",
    user: "api_gateway",
    durationMs: 940,
    query: `SELECT id, expires_at
FROM public.sessions
WHERE expires_at < NOW();`,
    rowsExamined: 12_400,
    rowsReturned: 320,
    plan: {
      operation: "Index Scan",
      object: "public.sessions",
      cost: 220.0,
      rows: 320,
      actualTimeMs: 940,
    },
    locks: ["AccessShareLock on public.sessions"],
    suggestions: [
      {
        type: "vacuum",
        description:
          "Tabela com 12.4k linhas lidas para retornar 320 — alto bloat detectado. Vacuum full + reindex recomendado.",
        estimatedImprovementPct: 35,
      },
    ],
    severity: "warning",
    callsLastHour: 240,
    lastSeen: "2026-06-15T14:30:01Z",
  },
  {
    id: "audit-004",
    t: "2026-06-15T14:28:42Z",
    database: "audit_db",
    schema: "public",
    table: "users",
    user: "report_user",
    durationMs: 612,
    query: `UPDATE public.users
SET last_login_at = NOW()
WHERE id = $1;`,
    rowsExamined: 1,
    rowsReturned: 0,
    plan: {
      operation: "Index Scan",
      object: "public.users",
      cost: 8.1,
      rows: 1,
      actualTimeMs: 612,
    },
    locks: [
      "RowExclusiveLock on public.users",
      "AccessShareLock on public.users_pkey",
    ],
    suggestions: [
      {
        type: "lock",
        description:
          "RowExclusiveLock em pico (240 chamadas/h) está contendendo com relatórios de longa duração. Considere job assíncrono.",
        estimatedImprovementPct: 45,
      },
    ],
    severity: "warning",
    callsLastHour: 240,
    lastSeen: "2026-06-15T14:28:40Z",
  },
  {
    id: "audit-005",
    t: "2026-06-15T14:27:18Z",
    database: "audit_db",
    schema: "public",
    table: "access_log",
    user: "report_user",
    durationMs: 480,
    query: `SELECT COUNT(*) AS total
FROM public.access_log
WHERE action = 'login_failed'
  AND created_at >= NOW() - INTERVAL '1 hour';`,
    rowsExamined: 24_100,
    rowsReturned: 1,
    plan: {
      operation: "Aggregate",
      cost: 612.0,
      rows: 1,
      actualTimeMs: 480,
      children: [
        {
          operation: "Index Only Scan",
          object: "idx_access_log_action_at",
          cost: 612.0,
          rows: 24_100,
          actualTimeMs: 410,
        },
      ],
    },
    locks: ["AccessShareLock on public.access_log"],
    severity: "warning",
    callsLastHour: 60,
    lastSeen: "2026-06-15T14:26:00Z",
  },
  {
    id: "audit-006",
    t: "2026-06-15T14:25:10Z",
    database: "audit_db",
    schema: "public",
    table: "sessions",
    user: "cleanup_job",
    durationMs: 318,
    query: `DELETE FROM public.sessions
WHERE expires_at < NOW() - INTERVAL '30 days';`,
    rowsExamined: 8400,
    rowsReturned: 0,
    plan: {
      operation: "Delete",
      cost: 1100.0,
      rows: 8400,
      actualTimeMs: 318,
      children: [
        {
          operation: "Index Scan",
          object: "idx_sessions_expires_at",
          cost: 1100.0,
          rows: 8400,
          actualTimeMs: 280,
        },
      ],
    },
    locks: ["RowExclusiveLock on public.sessions"],
    suggestions: [
      {
        type: "stats",
        description:
          "Statistics em `sessions.expires_at` estão desatualizadas (último ANALYZE há 6h). Plano superestima cardinalidade.",
        estimatedImprovementPct: 18,
        suggestedDdl: "ANALYZE public.sessions;",
      },
    ],
    severity: "warning",
    callsLastHour: 4,
    lastSeen: "2026-06-15T14:25:00Z",
  },
]

/* ------------------------------------------------------------------ 2. SGT Maker */

export const sgtQueries: SlowQuery[] = [
  {
    id: "sgt-001",
    t: "2026-06-15T15:02:10Z",
    database: "sgt_maker",
    schema: "public",
    table: "orders",
    user: "dashboard_app",
    durationMs: 3240,
    query: `SELECT o.id, o.customer_id, o.status, o.total_cents, c.name
FROM public.orders o
JOIN public.customers c ON c.id = o.customer_id
WHERE o.status = 'open'
ORDER BY o.created_at DESC
LIMIT 200;`,
    rowsExamined: 482_000,
    rowsReturned: 200,
    plan: {
      operation: "Limit",
      cost: 18_240.0,
      rows: 200,
      actualTimeMs: 3240,
      children: [
        {
          operation: "Sort",
          cost: 18_240.0,
          rows: 200,
          actualTimeMs: 3110,
          children: [
            {
              operation: "Hash Join",
              cost: 16_810.0,
              rows: 200,
              actualTimeMs: 2410,
              children: [
                {
                  operation: "Seq Scan",
                  object: "public.orders o",
                  cost: 9810.0,
                  rows: 482_000,
                  actualTimeMs: 1620,
                },
                {
                  operation: "Hash",
                  cost: 4810.0,
                  rows: 22_400,
                  actualTimeMs: 720,
                  children: [
                    {
                      operation: "Seq Scan",
                      object: "public.customers c",
                      cost: 1810.0,
                      rows: 22_400,
                      actualTimeMs: 290,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    locks: ["AccessShareLock on public.orders", "AccessShareLock on public.customers"],
    suggestions: [
      {
        type: "missing_index",
        description:
          "Filtro `status = 'open'` + ordenação por `created_at` precisam de índice composto.",
        estimatedImprovementPct: 82,
        suggestedDdl: `CREATE INDEX CONCURRENTLY idx_orders_status_created_at
  ON public.orders (status, created_at DESC);`,
      },
    ],
    severity: "critical",
    callsLastHour: 312,
    lastSeen: "2026-06-15T15:02:05Z",
  },
  {
    id: "sgt-002",
    t: "2026-06-15T15:01:45Z",
    database: "sgt_maker",
    schema: "public",
    table: "products",
    user: "search_api",
    durationMs: 1980,
    query: `SELECT p.id, p.name, p.price_cents
FROM public.products p
WHERE LOWER(p.name) LIKE LOWER($1)
LIMIT 50;`,
    rowsExamined: 84_200,
    rowsReturned: 50,
    plan: {
      operation: "Limit",
      cost: 7210.0,
      rows: 50,
      actualTimeMs: 1980,
      children: [
        {
          operation: "Seq Scan",
          object: "public.products p",
          cost: 7210.0,
          rows: 84_200,
          actualTimeMs: 1810,
        },
      ],
    },
    locks: ["AccessShareLock on public.products"],
    suggestions: [
      {
        type: "missing_index",
        description:
          "Busca por nome usa `LOWER()` — habilite extensão `pg_trgm` e crie índice GIN.",
        estimatedImprovementPct: 88,
        suggestedDdl: `CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY idx_products_name_trgm
  ON public.products USING gin (LOWER(name) gin_trgm_ops);`,
      },
      {
        type: "rewrite",
        description:
          "Para buscas por prefixo exato, `text_pattern_ops` com `name LIKE 'abc%'` é mais barato que trigrama.",
        estimatedImprovementPct: 12,
      },
    ],
    severity: "critical",
    callsLastHour: 128,
    lastSeen: "2026-06-15T15:01:30Z",
  },
  {
    id: "sgt-003",
    t: "2026-06-15T15:00:12Z",
    database: "sgt_maker",
    schema: "public",
    table: "order_items",
    user: "report_user",
    durationMs: 1640,
    query: `SELECT order_id, SUM(quantity * unit_price_cents) AS total
FROM public.order_items
WHERE order_id IN (
  SELECT id FROM public.orders WHERE created_at >= NOW() - INTERVAL '30 days'
)
GROUP BY order_id;`,
    rowsExamined: 1_240_000,
    rowsReturned: 18_400,
    plan: {
      operation: "HashAggregate",
      cost: 28_410.0,
      rows: 18_400,
      actualTimeMs: 1640,
      children: [
        {
          operation: "Hash Join",
          cost: 24_810.0,
          rows: 18_400,
          actualTimeMs: 1410,
          children: [
            {
              operation: "Seq Scan",
              object: "public.order_items",
              cost: 14_210.0,
              rows: 18_400,
              actualTimeMs: 1100,
            },
            {
              operation: "Hash",
              cost: 4810.0,
              rows: 18_400,
              actualTimeMs: 280,
              children: [
                {
                  operation: "Index Scan",
                  object: "public.orders",
                  cost: 4810.0,
                  rows: 18_400,
                  actualTimeMs: 240,
                },
              ],
            },
          ],
        },
      ],
    },
    locks: ["AccessShareLock on public.order_items"],
    suggestions: [
      {
        type: "missing_index",
        description:
          "`order_items.order_id` é FK sem índice — todo join cai em hash + seq scan.",
        estimatedImprovementPct: 70,
        suggestedDdl: `CREATE INDEX CONCURRENTLY idx_order_items_order_id
  ON public.order_items (order_id);`,
      },
    ],
    severity: "critical",
    callsLastHour: 24,
    lastSeen: "2026-06-15T15:00:00Z",
  },
  {
    id: "sgt-004",
    t: "2026-06-15T14:58:30Z",
    database: "sgt_maker",
    schema: "public",
    table: "customers",
    user: "export_job",
    durationMs: 720,
    query: `SELECT id, name, email, created_at
FROM public.customers
WHERE created_at >= NOW() - INTERVAL '7 days';`,
    rowsExamined: 22_400,
    rowsReturned: 1840,
    plan: {
      operation: "Seq Scan",
      object: "public.customers",
      cost: 1810.0,
      rows: 22_400,
      actualTimeMs: 720,
    },
    locks: ["AccessShareLock on public.customers"],
    suggestions: [
      {
        type: "missing_index",
        description:
          "Filtro `created_at` sem índice — export recorrente faz Seq Scan semanal.",
        estimatedImprovementPct: 65,
        suggestedDdl: `CREATE INDEX CONCURRENTLY idx_customers_created_at
  ON public.customers (created_at DESC);`,
      },
    ],
    severity: "warning",
    callsLastHour: 1,
    lastSeen: "2026-06-15T14:58:00Z",
  },
]

/* ------------------------------------------------------------------ examples */

const auditExample: Example = {
  title: "Banco de auditoria (6 queries)",
  description:
    "Lista de queries lentas em `audit_db` (report + ETL + cleanup). Threshold 100ms, agrupado por tabela, ordenação por duração. Expanda a primeira query (aud-001) para ver plan tree, locks e sugestões.",
  code: `import { SlowQueryList } from "@/components/ui/slow-query-list"

const queries: SlowQuery[] = [
  {
    id: "audit-001",
    database: "audit_db",
    schema: "public",
    table: "access_log",
    user: "report_user",
    durationMs: 4820,
    severity: "critical",
    rowsExamined: 1842000,
    rowsReturned: 500,
    callsLastHour: 184,
    locks: ["AccessShareLock on access_log", "AccessShareLock on users"],
    suggestions: [
      {
        type: "missing_index",
        description: "Coluna access_log.created_at filtrada sem índice.",
        estimatedImprovementPct: 78,
        suggestedDdl:
          "CREATE INDEX CONCURRENTLY idx_access_log_created_at\\n  ON public.access_log (created_at DESC);",
      },
    ],
    // plan, query, lastSeen, t preenchidos no examples-slow-query-list.tsx
  },
  // ... mais 5 queries
]

<SlowQueryList
  queries={queries}
  groupBy="table"
  thresholdMs={100}
/>`,
  render: (
    <SlowQueryList queries={auditQueries} groupBy="table" thresholdMs={100} />
  ),
}

const sgtMakerExample: Example = {
  title: "SGT Maker (4 queries com missing index)",
  description:
    "Banco menor, foco em diagnóstico de índices faltantes. Threshold 50ms, agrupado por tabela. Expanda a primeira query (sgt-001) para ver o plan com 3 níveis de aninhamento e a sugestão de índice composto (status, created_at).",
  code: `import { SlowQueryList } from "@/components/ui/slow-query-list"

<SlowQueryList
  queries={sgtQueries}
  groupBy="table"
  thresholdMs={50}
  onQueryClick={(q) => console.log("Selected:", q.id)}
/>`,
  render: (
    <SlowQueryList
      queries={sgtQueries}
      groupBy="table"
      thresholdMs={50}
      onQueryClick={() => {
        /* seleção via callback */
      }}
    />
  ),
}

export const examplesSlowQueryList: Record<string, Example[]> = {
  "slow-query-list": [auditExample, sgtMakerExample],
}
