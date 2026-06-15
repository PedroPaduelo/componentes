import { DbOverviewGrid } from "@/components/ui/db-overview-grid"
import type { DatabaseInstance } from "@/components/ui/db-overview-grid-types"
import { DbOverviewGridCustomDetail } from "@/data/db-overview-grid-demo"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                       Helpers de geração de mock data                        */
/* -------------------------------------------------------------------------- */

/**
 * Tabela pseudo-aleatória com PRNG seedado (LCG). Determinística
 * entre renders para que o preview da vitrine seja estável.
 */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0xffffffff
  }
}

function buildTopTables(
  rand: () => number,
  prefix: string,
  count: number,
): DatabaseInstance["topTables"] {
  const names = [
    "users",
    "orders",
    "audit_events",
    "invoices",
    "products",
    "sessions",
    "notifications",
    "transactions",
    "subscriptions",
    "files",
  ]
  // embaralha e pega os N primeiros para garantir nomes únicos
  const shuffled = [...names]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = shuffled[i] as string
    shuffled[i] = shuffled[j] as string
    shuffled[j] = tmp
  }
  const picked = shuffled.slice(0, count)
  const tables: DatabaseInstance["topTables"] = picked.map((name) => ({
    name: `${prefix}_${name}`,
    sizeMB: Math.floor(rand() * 8000) + 50,
    rowCount: Math.floor(rand() * 8_000_000) + 1_000,
  }))
  return tables.sort((a, b) => b.sizeMB - a.sizeMB)
}

/* -------------------------------------------------------------------------- */
/*                       Example 1: 4 dbs (auditoria + SGT/NFS)               */
/* -------------------------------------------------------------------------- */

const fourDatabases: DatabaseInstance[] = [
  {
    id: "db-auditoria-prod",
    name: "auditoria-prod",
    role: "Auditoria de produção",
    env: "prod",
    engine: "postgresql",
    host: "pg-auditoria-prd.internal",
    port: 5432,
    version: "16.4",
    sizeMB: 184_320,
    sizeLimitMB: 512_000,
    maxConnections: 200,
    currentConnections: 87,
    replicationLagMs: 42,
    status: "healthy",
    queriesPerSec: 1240,
    slowQueriesCount: 3,
    transactionsPerSec: 380,
    cacheHitRatio: 0.984,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
    topTables: buildTopTables(seededRandom(1001), "audit", 5),
  },
  {
    id: "db-auditoria-homolog",
    name: "auditoria-homolog",
    role: "Auditoria de homologação",
    env: "homolog",
    engine: "postgresql",
    host: "pg-auditoria-hml.internal",
    port: 5432,
    version: "16.4",
    sizeMB: 12_400,
    maxConnections: 100,
    currentConnections: 23,
    status: "degraded",
    queriesPerSec: 84,
    slowQueriesCount: 12,
    transactionsPerSec: 22,
    cacheHitRatio: 0.872,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    topTables: buildTopTables(seededRandom(1002), "audit", 4),
  },
  {
    id: "db-sgt-maker",
    name: "sgt-maker",
    role: "SGT Maker",
    env: "prod",
    engine: "postgresql",
    host: "pg-sgt-mkr-prd.internal",
    port: 5432,
    version: "15.8",
    sizeMB: 96_200,
    sizeLimitMB: 256_000,
    maxConnections: 150,
    currentConnections: 142,
    replicationLagMs: 18,
    status: "degraded",
    queriesPerSec: 2810,
    slowQueriesCount: 27,
    transactionsPerSec: 612,
    cacheHitRatio: 0.928,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    topTables: buildTopTables(seededRandom(1003), "sgt", 6),
  },
  {
    id: "db-nota-fiscal-sync",
    name: "nota-fiscal-sync",
    role: "Nota Fiscal Sync",
    env: "prod",
    engine: "mysql",
    host: "mysql-nfsync-prd.internal",
    port: 3306,
    version: "8.0.39",
    sizeMB: 56_700,
    sizeLimitMB: 128_000,
    maxConnections: 300,
    currentConnections: 0,
    status: "offline",
    queriesPerSec: 0,
    slowQueriesCount: 0,
    transactionsPerSec: 0,
    cacheHitRatio: 0,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    topTables: buildTopTables(seededRandom(1004), "nf", 4),
  },
]

const fourDatabasesExample: Example = {
  title: "4 databases — auditoria + SGT Maker + Nota Fiscal Sync",
  description:
    "Frota real do time: auditoria prod/homolog, SGT Maker e Nota Fiscal Sync. " +
    "Note o status `offline` do Nota Fiscal Sync (ordenado primeiro) e a conexão do SGT Maker em 94% (degraded).",
  code: `import { DbOverviewGrid } from "@/components/ui/db-overview-grid"

const databases: DatabaseInstance[] = [
  { id: "db-auditoria-prod", name: "auditoria-prod", env: "prod", /* ... */ },
  { id: "db-auditoria-homolog", name: "auditoria-homolog", env: "homolog", /* ... */ },
  { id: "db-sgt-maker", name: "sgt-maker", env: "prod", /* ... */ },
  { id: "db-nota-fiscal-sync", name: "nota-fiscal-sync", env: "prod", /* ... */ },
]

<DbOverviewGrid
  databases={databases}
  renderDetail={(db) => <DbSchemaExplorer database={db} />}
/>`,
  render: (
    <div className="w-full">
      <DbOverviewGrid
        databases={fourDatabases}
        renderDetail={(db) => <DbOverviewGridCustomDetail database={db} />}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                Example 2: 6 dbs mix (prod + staging + dev)                  */
/* -------------------------------------------------------------------------- */

const sixDatabases: DatabaseInstance[] = [
  {
    id: "db-checkout-prod",
    name: "checkout-prod",
    role: "Checkout transacional",
    env: "prod",
    engine: "postgresql",
    host: "pg-checkout-prd.internal",
    port: 5432,
    version: "16.4",
    sizeMB: 248_000,
    sizeLimitMB: 512_000,
    maxConnections: 250,
    currentConnections: 198,
    replicationLagMs: 8,
    status: "healthy",
    queriesPerSec: 4120,
    slowQueriesCount: 5,
    transactionsPerSec: 1140,
    cacheHitRatio: 0.992,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    topTables: buildTopTables(seededRandom(2001), "checkout", 6),
  },
  {
    id: "db-billing-prod",
    name: "billing-prod",
    role: "Faturamento e cobranças",
    env: "prod",
    engine: "oracle",
    host: "ora-billing-prd.internal",
    port: 1521,
    version: "19c",
    sizeMB: 412_000,
    sizeLimitMB: 1_024_000,
    maxConnections: 400,
    currentConnections: 305,
    replicationLagMs: 220,
    status: "degraded",
    queriesPerSec: 1840,
    slowQueriesCount: 18,
    transactionsPerSec: 410,
    cacheHitRatio: 0.901,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    topTables: buildTopTables(seededRandom(2002), "billing", 5),
  },
  {
    id: "db-cms-staging",
    name: "cms-staging",
    role: "CMS (staging)",
    env: "staging",
    engine: "mysql",
    host: "mysql-cms-stg.internal",
    port: 3306,
    version: "8.0.39",
    sizeMB: 6_400,
    maxConnections: 80,
    currentConnections: 12,
    status: "healthy",
    queriesPerSec: 64,
    slowQueriesCount: 0,
    transactionsPerSec: 8,
    cacheHitRatio: 0.987,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    topTables: buildTopTables(seededRandom(2003), "cms", 4),
  },
  {
    id: "db-cms-dev",
    name: "cms-dev",
    role: "CMS (dev local)",
    env: "dev",
    engine: "mysql",
    host: "localhost",
    port: 3306,
    version: "8.0.36",
    sizeMB: 240,
    maxConnections: 50,
    currentConnections: 3,
    status: "healthy",
    queriesPerSec: 0,
    slowQueriesCount: 0,
    transactionsPerSec: 0,
    cacheHitRatio: 0.95,
    topTables: buildTopTables(seededRandom(2004), "cms", 3),
  },
  {
    id: "db-events-staging",
    name: "events-staging",
    role: "Event bus (staging)",
    env: "staging",
    engine: "postgresql",
    host: "pg-events-stg.internal",
    port: 5432,
    version: "15.10",
    sizeMB: 34_800,
    sizeLimitMB: 96_000,
    maxConnections: 120,
    currentConnections: 11,
    status: "degraded",
    queriesPerSec: 142,
    slowQueriesCount: 6,
    transactionsPerSec: 18,
    cacheHitRatio: 0.812,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString(),
    topTables: buildTopTables(seededRandom(2005), "events", 4),
  },
  {
    id: "db-archive-cold",
    name: "archive-cold",
    role: "Cold archive (SQLite local)",
    env: "dev",
    engine: "sqlite",
    host: "/var/data/archive.db",
    port: 0,
    version: "3.46",
    sizeMB: 12,
    maxConnections: 1,
    currentConnections: 0,
    status: "offline",
    queriesPerSec: 0,
    slowQueriesCount: 0,
    transactionsPerSec: 0,
    cacheHitRatio: 0,
    topTables: buildTopTables(seededRandom(2006), "archive", 3),
  },
]

const sixDatabasesExample: Example = {
  title: "6 databases — mix prod + staging + dev",
  description:
    "Frota heterogênea cobrindo os 4 ambientes (prod, homolog, staging, dev) e 4 engines " +
    "(Postgres, Oracle, MySQL, SQLite). Tente o filtro buscando por `oracle` ou `staging`.",
  code: `import { DbOverviewGrid } from "@/components/ui/db-overview-grid"

const databases: DatabaseInstance[] = [
  { id: "db-checkout-prod", name: "checkout-prod", env: "prod", engine: "postgresql", /* ... */ },
  { id: "db-billing-prod",  name: "billing-prod",  env: "prod", engine: "oracle",      /* ... */ },
  { id: "db-cms-staging",   name: "cms-staging",   env: "staging", engine: "mysql",   /* ... */ },
  { id: "db-cms-dev",       name: "cms-dev",       env: "dev", engine: "mysql",        /* ... */ },
  { id: "db-events-staging",name: "events-staging",env: "staging", engine: "postgresql",/* ... */ },
  { id: "db-archive-cold",  name: "archive-cold",  env: "dev", engine: "sqlite",       /* ... */ },
]

<DbOverviewGrid
  databases={databases}
  sortBy="name"
  renderDetail={(db) => <DbSchemaExplorer database={db} />}
/>`,
  render: (
    <div className="w-full">
      <DbOverviewGrid
        databases={sixDatabases}
        sortBy="name"
        renderDetail={(db) => <DbOverviewGridCustomDetail database={db} />}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                Example 3: 5 dbs ordenados por conexões                      */
/* -------------------------------------------------------------------------- */

const fiveDatabases: DatabaseInstance[] = [
  {
    id: "db-search-prod",
    name: "search-prod",
    role: "Catálogo de busca",
    env: "prod",
    engine: "postgresql",
    host: "pg-search-prd.internal",
    port: 5432,
    version: "16.4",
    sizeMB: 88_000,
    sizeLimitMB: 256_000,
    maxConnections: 200,
    currentConnections: 178,
    replicationLagMs: 12,
    status: "healthy",
    queriesPerSec: 3210,
    slowQueriesCount: 4,
    transactionsPerSec: 720,
    cacheHitRatio: 0.973,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 31).toISOString(),
    topTables: buildTopTables(seededRandom(3001), "search", 5),
  },
  {
    id: "db-reports-prod",
    name: "reports-prod",
    role: "Relatórios analíticos",
    env: "prod",
    engine: "sqlserver",
    host: "mssql-reports-prd.internal",
    port: 1433,
    version: "2022",
    sizeMB: 124_000,
    sizeLimitMB: 256_000,
    maxConnections: 180,
    currentConnections: 95,
    replicationLagMs: 65,
    status: "healthy",
    queriesPerSec: 880,
    slowQueriesCount: 9,
    transactionsPerSec: 102,
    cacheHitRatio: 0.951,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    topTables: buildTopTables(seededRandom(3002), "report", 4),
  },
  {
    id: "db-iam-homolog",
    name: "iam-homolog",
    role: "Identidade e acesso (homolog)",
    env: "homolog",
    engine: "postgresql",
    host: "pg-iam-hml.internal",
    port: 5432,
    version: "15.10",
    sizeMB: 4_200,
    maxConnections: 80,
    currentConnections: 14,
    status: "healthy",
    queriesPerSec: 220,
    slowQueriesCount: 1,
    transactionsPerSec: 38,
    cacheHitRatio: 0.992,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    topTables: buildTopTables(seededRandom(3003), "iam", 3),
  },
  {
    id: "db-internal-tools-dev",
    name: "internal-tools-dev",
    role: "Ferramentas internas (dev)",
    env: "dev",
    engine: "postgresql",
    host: "localhost",
    port: 5432,
    version: "16.2",
    sizeMB: 320,
    maxConnections: 50,
    currentConnections: 2,
    status: "healthy",
    queriesPerSec: 8,
    slowQueriesCount: 0,
    transactionsPerSec: 1,
    cacheHitRatio: 0.96,
    topTables: buildTopTables(seededRandom(3004), "tools", 3),
  },
  {
    id: "db-reports-staging",
    name: "reports-staging",
    role: "Relatórios (staging)",
    env: "staging",
    engine: "sqlserver",
    host: "mssql-reports-stg.internal",
    port: 1433,
    version: "2022",
    sizeMB: 18_200,
    maxConnections: 80,
    currentConnections: 41,
    status: "degraded",
    queriesPerSec: 180,
    slowQueriesCount: 11,
    transactionsPerSec: 22,
    cacheHitRatio: 0.834,
    lastBackupAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    topTables: buildTopTables(seededRandom(3005), "report", 3),
  },
]

const fiveByConnectionsExample: Example = {
  title: "5 databases — ordenando por conexões",
  description:
    "Frota mista com `sortBy=\"connections\"`: o tile com maior % de pool ocupado fica primeiro, " +
    "ajudando a identificar hotspots antes de virarem incidente.",
  code: `<DbOverviewGrid
  databases={databases}
  sortBy="connections"
  renderDetail={(db) => <DbSchemaExplorer database={db} />}
/>`,
  render: (
    <div className="w-full">
      <DbOverviewGrid
        databases={fiveDatabases}
        sortBy="connections"
        renderDetail={(db) => <DbOverviewGridCustomDetail database={db} />}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  Exports                                    */
/* -------------------------------------------------------------------------- */

export const examplesDbOverviewGrid: Record<string, Example[]> = {
  "db-overview-grid": [
    fourDatabasesExample,
    sixDatabasesExample,
    fiveByConnectionsExample,
  ],
}
