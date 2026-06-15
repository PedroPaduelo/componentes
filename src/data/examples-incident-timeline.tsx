/**
 * Examples — Incident Timeline.
 *
 * 2 examples:
 *  1. "Incidente resolvido" — 6 eventos cobrindo detect → page → escalate →
 *     deploy (rollback) → mitigate → resolve, com 3 atores, status=resolved,
 *     severidade=high. Duração ~28 min, com metadados de SLO.
 *  2. "Incidente em andamento" — 4 eventos abertos (detect → page → escalate
 *     → note), status=ongoing, severidade=critical, modo `live` ativo.
 *
 * Timestamps determinísticos (exemplo 1): calculados a partir de `BASE_TS`
 * (data fixa) para que o output do Playwright (relative time) seja estável.
 * Exemplo 2 usa `Date.now()` propositalmente — o modo `live` precisa refletir
 * "agora" de verdade, e o validador checa apenas que o slot está montado.
 *
 * Zero-dívida: sem console.*, sem eslint-disable, sem as any.
 */

import type { Example } from "@/data/examples"
import { IncidentTimeline } from "@/components/ui/incident-timeline"
import type { IncidentTimelineEvent } from "@/components/ui/incident-timeline-types"

/** Base fixa do exemplo 1 — 2024-03-15T13:00:00Z (determinístico). */
const BASE_TS = "2024-03-15T13:00:00.000Z"
const offset = (seconds: number): string =>
  new Date(new Date(BASE_TS).getTime() + seconds * 1000).toISOString()

/* -------------------------------------------------------------------------- */
/*  Example 1 — Incidente resolvido                                          */
/* -------------------------------------------------------------------------- */

const resolvedEvents: IncidentTimelineEvent[] = [
  {
    id: "ev-1",
    t: offset(0),
    type: "detect",
    severity: "high",
    title: "Latência p95 acima de 1.2s no checkout",
    description:
      "Alerta Prometheus disparou após 3 janelas consecutivas de 5min com latência p95 > 1.2s. Origem: api-checkout.",
    actor: { name: "Prometheus", role: "monitor" },
    meta: { janela: "5m", p95_ms: 1280, servico: "api-checkout" },
  },
  {
    id: "ev-2",
    t: offset(95),
    type: "page",
    severity: "critical",
    title: "PagerDuty disparou para a rotação primária",
    description:
      "Política S1 notificada. Engenheiro de plantão acordou e abriu o canal #inc-2024-0315.",
    actor: { name: "Marina Costa", role: "SRE · plantão" },
  },
  {
    id: "ev-3",
    t: offset(420),
    type: "escalate",
    severity: "critical",
    title: "Eng. de plataforma acionado — possível regressão de deploy",
    description:
      "Correlação com deploy api-checkout@v3.42.0 liberado 12min antes. Suspeita de migração de driver.",
    actor: { name: "Diego Almeida", role: "Platform" },
    meta: { deploy: "api-checkout@v3.42.0", delta_min: 12 },
  },
  {
    id: "ev-4",
    t: offset(890),
    type: "deploy",
    severity: "high",
    title: "Rollback para api-checkout@v3.41.7",
    description:
      "Pipeline de rollback executado. Tráfego migrado gradualmente (canary 5% → 25% → 100%).",
    actor: { name: "Diego Almeida", role: "Platform" },
    meta: { versao: "v3.41.7", duracao_s: 180 },
  },
  {
    id: "ev-5",
    t: offset(1320),
    type: "mitigate",
    severity: "medium",
    title: "Latência voltou ao SLO — p95 < 280ms",
    description: "3 janelas consecutivas abaixo do alvo. Erro estabilizado em 0.02%.",
    actor: { name: "Marina Costa", role: "SRE · plantão" },
    meta: { p95_ms: 274, err_pct: 0.02 },
  },
  {
    id: "ev-6",
    t: offset(1680),
    type: "resolve",
    severity: "low",
    title: "Incidente marcado como resolvido",
    actor: { name: "Marina Costa", role: "SRE · plantão" },
    meta: { duracao_total: "28m" },
  },
]

const RESOLVED_START = offset(0)
const RESOLVED_END = offset(1680)

const incidentResolvedExample: Example = {
  title: "Incidente resolvido",
  description:
    "Sequência completa: detecção → paging → escalonamento → rollback → mitigação → resolução, com 3 atores e metadados de SLO.",
  code: `const events: IncidentTimelineEvent[] = [
  {
    id: "ev-1",
    t: "2024-03-15T13:00:00Z",
    type: "detect",
    severity: "high",
    title: "Latência p95 acima de 1.2s no checkout",
    description: "Alerta Prometheus disparou após 3 janelas consecutivas.",
    actor: { name: "Prometheus", role: "monitor" },
    meta: { janela: "5m", p95_ms: 1280, servico: "api-checkout" },
  },
  {
    id: "ev-2",
    t: "2024-03-15T13:01:35Z",
    type: "page",
    severity: "critical",
    title: "PagerDuty disparou para a rotação primária",
    actor: { name: "Marina Costa", role: "SRE · plantão" },
  },
  {
    id: "ev-3",
    t: "2024-03-15T13:07:00Z",
    type: "escalate",
    severity: "critical",
    title: "Eng. de plataforma acionado — possível regressão de deploy",
    actor: { name: "Diego Almeida", role: "Platform" },
    meta: { deploy: "api-checkout@v3.42.0", delta_min: 12 },
  },
  {
    id: "ev-4",
    t: "2024-03-15T13:14:50Z",
    type: "deploy",
    severity: "high",
    title: "Rollback para api-checkout@v3.41.7",
    actor: { name: "Diego Almeida", role: "Platform" },
    meta: { versao: "v3.41.7", duracao_s: 180 },
  },
  {
    id: "ev-5",
    t: "2024-03-15T13:22:00Z",
    type: "mitigate",
    severity: "medium",
    title: "Latência voltou ao SLO — p95 < 280ms",
    actor: { name: "Marina Costa", role: "SRE · plantão" },
    meta: { p95_ms: 274, err_pct: 0.02 },
  },
  {
    id: "ev-6",
    t: "2024-03-15T13:28:00Z",
    type: "resolve",
    severity: "low",
    title: "Incidente marcado como resolvido",
    actor: { name: "Marina Costa", role: "SRE · plantão" },
    meta: { duracao_total: "28m" },
  },
]

<IncidentTimeline
  events={events}
  status="resolved"
  severity="high"
  startedAt="2024-03-15T13:00:00Z"
  resolvedAt="2024-03-15T13:28:00Z"
  title="INC-2024-0315 · checkout degradado"
  onEventClick={() => {
    /* ex.: navegar para detalhe do evento */
  }}
/>`,
  render: (
    <div className="w-full">
      <IncidentTimeline
        events={resolvedEvents}
        status="resolved"
        severity="high"
        startedAt={RESOLVED_START}
        resolvedAt={RESOLVED_END}
        title="INC-2024-0315 · checkout degradado"
        onEventClick={() => {
          /* ex.: navegar para detalhe do evento */
        }}
      />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*  Example 2 — Incidente em andamento                                       */
/* -------------------------------------------------------------------------- */

const ONGOING_T0 = Date.now() - 1000 * 60 * 10
const ongoingEvents: IncidentTimelineEvent[] = [
  {
    id: "ev-live-1",
    t: new Date(ONGOING_T0 + 1000 * 60 * 2).toISOString(),
    type: "detect",
    severity: "critical",
    title: "Erro 500 sustentado em /api/orders",
    description:
      "16% das requisições falham com 500. SLO de disponibilidade em risco.",
    actor: { name: "Datadog", role: "monitor" },
    meta: { servico: "api-orders", err_pct: 16.3 },
  },
  {
    id: "ev-live-2",
    t: new Date(ONGOING_T0 + 1000 * 60 * 4).toISOString(),
    type: "page",
    severity: "critical",
    title: "PagerDuty → time de pagamentos",
    description: "S2 disparado. Engenheiro de pagamentos entrou no canal.",
    actor: { name: "Helena Pires", role: "SRE · pagamentos" },
  },
  {
    id: "ev-live-3",
    t: new Date(ONGOING_T0 + 1000 * 60 * 7).toISOString(),
    type: "escalate",
    severity: "critical",
    title: "Escalado para o time de plataforma",
    description: "Suspeita de regressão no pool de conexões do Postgres.",
    actor: { name: "Roberto Sá", role: "Platform Lead" },
  },
  {
    id: "ev-live-4",
    t: new Date(ONGOING_T0 + 1000 * 60 * 9.5).toISOString(),
    type: "note",
    severity: "medium",
    title: "Conexões saturadas — investigando fail-over do RDS",
    actor: { name: "Helena Pires", role: "SRE · pagamentos" },
    meta: { conexoes: 198, max: 200 },
  },
]

const ONGOING_START = new Date(ONGOING_T0).toISOString()

const incidentOngoingExample: Example = {
  title: "Incidente em andamento",
  description:
    "Status `ongoing` + modo `live`: tempos relativos re-renderizam a cada 30s. Eventos ainda sem mitigação/resolução.",
  code: `// timestamps calculados a partir de um instante T0 (snapshot no render)
const t0 = Date.now() - 10 * 60_000
const events: IncidentTimelineEvent[] = [
  {
    id: "ev-live-1",
    t: new Date(t0 + 2 * 60_000).toISOString(),
    type: "detect",
    severity: "critical",
    title: "Erro 500 sustentado em /api/orders",
    actor: { name: "Datadog", role: "monitor" },
    meta: { servico: "api-orders", err_pct: 16.3 },
  },
  {
    id: "ev-live-2",
    t: new Date(t0 + 4 * 60_000).toISOString(),
    type: "page",
    severity: "critical",
    title: "PagerDuty → time de pagamentos",
    actor: { name: "Helena Pires", role: "SRE · pagamentos" },
  },
  {
    id: "ev-live-3",
    t: new Date(t0 + 7 * 60_000).toISOString(),
    type: "escalate",
    severity: "critical",
    title: "Escalado para o time de plataforma",
    actor: { name: "Roberto Sá", role: "Platform Lead" },
  },
  {
    id: "ev-live-4",
    t: new Date(t0 + 9.5 * 60_000).toISOString(),
    type: "note",
    severity: "medium",
    title: "Conexões saturadas — investigando fail-over do RDS",
    actor: { name: "Helena Pires", role: "SRE · pagamentos" },
    meta: { conexoes: 198, max: 200 },
  },
]

<IncidentTimeline
  events={events}
  status="ongoing"
  severity="critical"
  startedAt={new Date(t0).toISOString()}
  title="INC-2024-0321 · api-orders degradado"
  live
  onEventClick={() => {
    /* ex.: abrir side-panel com detalhes */
  }}
/>`,
  render: (
    <div className="w-full">
      <IncidentTimeline
        events={ongoingEvents}
        status="ongoing"
        severity="critical"
        startedAt={ONGOING_START}
        title="INC-2024-0321 · api-orders degradado"
        live
        onEventClick={() => {
          /* ex.: abrir side-panel com detalhes */
        }}
      />
    </div>
  ),
}

export const examplesIncidentTimeline: Record<string, Example[]> = {
  "incident-timeline": [incidentResolvedExample, incidentOngoingExample],
}
