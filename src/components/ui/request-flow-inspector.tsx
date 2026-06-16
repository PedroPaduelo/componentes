import * as React from "react"

import { cn } from "@/lib/utils"
import {
  type InspectedRequest,
  type InspectedRequestBodyType,
  type InspectedRequestMethod,
  type RequestFlowInspectorProps,
} from "@/components/ui/request-flow-inspector-types"

/* -------------------------------------------------------------------------- */
/*                            Helpers internos                               */
/* -------------------------------------------------------------------------- */

/** Cores semânticas por faixa de status code (2xx/3xx/4xx/5xx). */
function statusColor(status: number): {
  text: string
  bg: string
  border: string
  ring: string
} {
  if (status >= 500) {
    return {
      text: "text-rose-700 dark:text-rose-300",
      bg: "bg-rose-500/10 dark:bg-rose-400/10",
      border: "border-rose-500/30 dark:border-rose-400/30",
      ring: "ring-rose-500/30 dark:ring-rose-400/30",
    }
  }
  if (status >= 400) {
    return {
      text: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-500/10 dark:bg-amber-400/10",
      border: "border-amber-500/30 dark:border-amber-400/30",
      ring: "ring-amber-500/30 dark:ring-amber-400/30",
    }
  }
  if (status >= 300) {
    return {
      text: "text-sky-700 dark:text-sky-300",
      bg: "bg-sky-500/10 dark:bg-sky-400/10",
      border: "border-sky-500/30 dark:border-sky-400/30",
      ring: "ring-sky-500/30 dark:ring-sky-400/30",
    }
  }
  return {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    border: "border-emerald-500/30 dark:border-emerald-400/30",
    ring: "ring-emerald-500/30 dark:ring-emerald-400/30",
  }
}

/** Cor para método HTTP — discreta, mas distinta entre seguros e não-seguros. */
function methodColor(method: InspectedRequestMethod): string {
  switch (method) {
    case "GET":
    case "HEAD":
    case "OPTIONS":
      return "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
    case "POST":
      return "text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/30"
    case "PUT":
    case "PATCH":
      return "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30"
    case "DELETE":
      return "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/30"
    default:
      return "text-foreground bg-muted border-border"
  }
}

/** Cor do badge de ambiente. */
function envColor(env: InspectedRequest["environment"]): string {
  switch (env) {
    case "prod":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
    case "staging":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
    case "dev":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    default:
      return "bg-muted text-foreground border-border"
  }
}

/** PRNG determinístico (Mulberry32) — seeds estáveis p/ SSR e testes. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash32(input: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Cabeçalho resumido do user-agent (browser + SO), sem dependências externas. */
function summarizeUA(ua: string): string {
  const browser =
    /Edg\//.test(ua)
      ? "Edge"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : /curl\//.test(ua)
              ? "curl"
              : "Unknown"
  const os = /Windows NT/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown"
  return `${browser} • ${os}`
}

/* ----------------------------- Syntax highlight ---------------------------- */

/**
 * Realce de JSON simples e determinístico.
 *
 * Estratégia: tokenizar em 5 classes (chave, string, número, literal,
 * pontuação) com regex pre-compiladas, montar spans coloridos. Sem prism,
 * sem libs externas, sem `eval`/`new Function`. Trata o input como
 * texto — falhas de parsing caem para o `JSON.stringify(parsed, null, 2)`
 * como fallback (visualização de texto cru, sem realce).
 */
const JSON_RE_STRING = /"(?:[^"\\]|\\.)*"/
const JSON_RE_NUMBER = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/
const JSON_RE_LITERAL = /\b(?:true|false|null)\b/

type JsonToken = { type: "key" | "string" | "number" | "literal" | "punct"; value: string }

function tokenizeJson(src: string): JsonToken[] {
  const tokens: JsonToken[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (ch === undefined) break
    if (ch === " " || ch === "\n" || ch === "\t" || ch === "\r") {
      let j = i + 1
      while (j < src.length) {
        const cj = src[j]
        if (cj !== " " && cj !== "\n" && cj !== "\t" && cj !== "\r") break
        j++
      }
      tokens.push({ type: "punct", value: src.slice(i, j) })
      i = j
      continue
    }
    if (ch === '"') {
      const m = JSON_RE_STRING.exec(src.slice(i))
      if (m && m.index === 0) {
        const value = m[0]
        const isKey = /[ \t]*:$/.test(src.slice(i + value.length, i + value.length + 8))
        tokens.push({ type: isKey ? "key" : "string", value })
        i += value.length
        continue
      }
    }
    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      const m = JSON_RE_NUMBER.exec(src.slice(i))
      if (m && m.index === 0) {
        tokens.push({ type: "number", value: m[0] })
        i += m[0].length
        continue
      }
    }
    if (/[a-z]/.test(ch)) {
      const m = JSON_RE_LITERAL.exec(src.slice(i))
      if (m && m.index === 0) {
        tokens.push({ type: "literal", value: m[0] })
        i += m[0].length
        continue
      }
    }
    // pontuação isolada ( , : { } [ ] )
    tokens.push({ type: "punct", value: ch })
    i++
  }
  return tokens
}

function tokenClass(t: JsonToken["type"]): string {
  switch (t) {
    case "key":
      return "text-sky-700 dark:text-sky-300"
    case "string":
      return "text-emerald-700 dark:text-emerald-300"
    case "number":
      return "text-amber-700 dark:text-amber-300"
    case "literal":
      return "text-rose-700 dark:text-rose-300"
    case "punct":
      return "text-muted-foreground"
    default:
      return ""
  }
}

function JsonView({ src }: { src: string }): React.ReactElement {
  // Tenta reformatar com indent=2; cai para o `src` cru se parse falhar.
  let pretty: string
  try {
    pretty = JSON.stringify(JSON.parse(src), null, 2)
  } catch {
    pretty = src
  }
  const tokens = React.useMemo(() => tokenizeJson(pretty), [pretty])
  return (
    <pre
      data-slot="request-flow-inspector-body-json"
      className={cn(
        "max-h-80 overflow-auto rounded-md border border-border bg-muted/30 p-3",
        "font-mono text-xs leading-relaxed",
      )}
    >
      <code>
        {tokens.map((t, idx) => (
          <span key={idx} className={tokenClass(t.type)}>
            {t.value}
          </span>
        ))}
      </code>
    </pre>
  )
}

/* --------------------------------- Tabs ----------------------------------- */

type TabId = "timing" | "headers" | "body" | "cookies" | "trace"

const TAB_IDS: readonly TabId[] = ["timing", "headers", "body", "cookies", "trace"] as const

const TAB_LABEL: Record<TabId, string> = {
  timing: "Timing",
  headers: "Headers",
  body: "Body",
  cookies: "Cookies",
  trace: "Trace",
}

/** Tabs autocontidas (estado interno, não dependem de Tabs shadcn). */
function TabBar({
  active,
  onChange,
  counts,
}: {
  active: TabId
  onChange: (id: TabId) => void
  counts: Record<TabId, number>
}): React.ReactElement {
  return (
    <div
      role="tablist"
      aria-label="Seções da request"
      data-slot="request-flow-inspector-tabs"
      className="flex flex-wrap items-center gap-1 border-b border-border"
    >
      {TAB_IDS.map((id) => {
        const isActive = id === active
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`rfi-panel-${id}`}
            data-active={isActive}
            onClick={() => onChange(id)}
            className={cn(
              "relative -mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded-t-sm",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {TAB_LABEL[id]}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                isActive ? "bg-foreground/10" : "bg-muted",
              )}
            >
              {counts[id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------- Timing ----------------------------------- */

const TIMING_LABELS: Record<keyof InspectedRequest["timing"], string> = {
  dnsMs: "DNS",
  tcpMs: "TCP",
  tlsMs: "TLS",
  serverMs: "Server",
  transferMs: "Transfer",
}

const TIMING_KEYS: ReadonlyArray<keyof InspectedRequest["timing"]> = [
  "dnsMs",
  "tcpMs",
  "tlsMs",
  "serverMs",
  "transferMs",
] as const

function TimingWaterfall({
  timing,
  durationMs,
}: {
  timing: InspectedRequest["timing"]
  durationMs: number
}): React.ReactElement {
  // Largura proporcional ao total; se durationMs = 0, fallback 1.
  const total = Math.max(durationMs, 1)
  let offset = 0
  return (
    <div
      data-slot="request-flow-inspector-timing"
      className="space-y-2 rounded-md border border-border bg-muted/30 p-3"
    >
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        Waterfall · {durationMs} ms total
      </div>
      <div className="space-y-1.5">
        {TIMING_KEYS.map((k) => {
          const value = timing[k]
          const widthPct = Math.max((value / total) * 100, value > 0 ? 1 : 0)
          const offsetPct = (offset / total) * 100
          offset += value
          const colorByBucket =
            k === "tlsMs"
              ? "bg-sky-500/80"
              : k === "serverMs"
                ? "bg-amber-500/80"
                : k === "transferMs"
                  ? "bg-emerald-500/80"
                  : k === "tcpMs"
                    ? "bg-violet-500/80"
                    : "bg-rose-500/80"
          return (
            <div
              key={k}
              data-timing-segment={k}
              className="grid grid-cols-[5rem_1fr] items-center gap-2"
            >
              <div className="text-xs font-medium text-muted-foreground">
                {TIMING_LABELS[k]}
              </div>
              <div className="relative h-4 overflow-hidden rounded-sm bg-muted">
                <div
                  className={cn("absolute top-0 h-full rounded-sm", colorByBucket)}
                  style={{
                    left: `${offsetPct}%`,
                    width: `${widthPct}%`,
                  }}
                  title={`${TIMING_LABELS[k]}: ${value} ms`}
                  data-timing-width={Math.round(widthPct)}
                />
                <span
                  className="absolute inset-0 flex items-center pl-1 text-[10px] font-semibold text-white mix-blend-difference"
                  aria-hidden="true"
                >
                  {value} ms
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ----------------------------- Headers table ------------------------------ */

function HeadersTable({
  title,
  headers,
  slotAttr,
}: {
  title: string
  headers: InspectedRequest["requestHeaders"]
  slotAttr: string
}): React.ReactElement {
  return (
    <div
      data-slot={slotAttr}
      className="overflow-hidden rounded-md border border-border"
    >
      <div className="border-b border-border bg-muted/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title} · {headers.length}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="w-[40%] px-3 py-1.5 font-medium">Key</th>
            <th className="px-3 py-1.5 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {headers.map((h, idx) => (
            <tr
              key={`${h.key}-${idx}`}
              className="border-b border-border/50 last:border-b-0 align-top"
            >
              <td className="px-3 py-1.5 font-mono text-foreground">{h.key}</td>
              <td className="px-3 py-1.5 font-mono text-muted-foreground break-all">
                {h.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------ Cookies table ----------------------------- */

function CookiesTable({
  cookies,
}: {
  cookies: InspectedRequest["cookies"]
}): React.ReactElement {
  if (cookies.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
        Nenhum cookie nesta request.
      </div>
    )
  }
  return (
    <div
      data-slot="request-flow-inspector-cookies"
      className="overflow-hidden rounded-md border border-border"
    >
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-1.5 font-medium">Key</th>
            <th className="px-3 py-1.5 font-medium">Value</th>
            <th className="px-3 py-1.5 font-medium">Flags</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((c, idx) => (
            <tr
              key={`${c.key}-${idx}`}
              className="border-b border-border/50 last:border-b-0 align-top"
            >
              <td className="px-3 py-1.5 font-mono text-foreground">{c.key}</td>
              <td className="px-3 py-1.5 font-mono text-muted-foreground break-all">
                {c.value}
              </td>
              <td className="px-3 py-1.5">
                <div className="flex flex-wrap gap-1">
                  {c.secure ? (
                    <span className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      Secure
                    </span>
                  ) : null}
                  {c.httpOnly ? (
                    <span className="rounded-sm border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                      HttpOnly
                    </span>
                  ) : null}
                  {!c.secure && !c.httpOnly ? (
                    <span className="rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      —
                    </span>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------- Body ---------------------------------- */

function BodyView({
  body,
  type,
  side,
}: {
  body: string | undefined
  type: InspectedRequestBodyType | undefined
  side: "request" | "response"
}): React.ReactElement {
  if (!body) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
        Sem body {side === "request" ? "na request" : "na response"}.
      </div>
    )
  }
  const inferred: InspectedRequestBodyType = type ?? guessBodyType(body)
  if (inferred === "json") {
    return <JsonView src={body} />
  }
  if (inferred === "html") {
    return (
      <pre
        data-slot={`request-flow-inspector-body-${side}`}
        className="max-h-80 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs leading-relaxed text-foreground"
      >
        <code>{body}</code>
      </pre>
    )
  }
  return (
    <pre
      data-slot={`request-flow-inspector-body-${side}`}
      className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 font-mono text-xs leading-relaxed text-foreground"
    >
      <code>{body}</code>
    </pre>
  )
}

function guessBodyType(body: string): InspectedRequestBodyType {
  const t = body.trim()
  if (t.startsWith("{") || t.startsWith("[")) return "json"
  if (t.startsWith("<")) return "html"
  return "text"
}

/* ---------------------------------- Trace --------------------------------- */

function TraceView({
  request,
}: {
  request: InspectedRequest
}): React.ReactElement {
  const rows: { label: string; value: string; href: string | undefined }[] = [
    { label: "Trace ID", value: request.traceId, href: `#trace/${request.traceId}` },
    { label: "Span ID", value: request.spanId, href: `#span/${request.spanId}` },
    ...(request.parentSpanId
      ? [
          {
            label: "Parent Span",
            value: request.parentSpanId,
            href: `#span/${request.parentSpanId}`,
          },
        ]
      : []),
    { label: "Service", value: request.service, href: undefined },
  ]
  return (
    <div
      data-slot="request-flow-inspector-trace"
      className="overflow-hidden rounded-md border border-border"
    >
      <table className="w-full text-xs">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-border/50 last:border-b-0">
              <td className="w-[8rem] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {r.label}
              </td>
              <td className="px-3 py-2 font-mono text-foreground">
                {r.href ? (
                  <a
                    href={r.href}
                    className="text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
                    data-trace-link={r.label}
                  >
                    {r.value}
                  </a>
                ) : (
                  r.value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------- Geo ----------------------------------- */

function GeoCard({ request }: { request: InspectedRequest }): React.ReactElement {
  // geolocalização "estável" — derivada de hash do IP (sem Math.random).
  const seed = hash32(request.ip)
  const rng = mulberry32(seed)
  // coordenadas precisas vêm do próprio request; aqui só geramos
  // código de país (bandeira emoji) + label de lat/lng.
  const flag = countryFlag(request.geo.country)
  return (
    <aside
      data-slot="request-flow-inspector-geo"
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 text-xs"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Cliente
        </span>
        <span
          className={cn(
            "rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase",
            envColor(request.environment),
          )}
        >
          {request.environment}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-xl leading-none">
          {flag}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-foreground">{request.ip}</div>
          <div className="truncate text-muted-foreground">
            {request.geo.city} · {request.geo.country}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px]">
        <div>
          <div className="text-muted-foreground">Lat</div>
          <div className="font-mono text-foreground">{request.geo.lat.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Lng</div>
          <div className="font-mono text-foreground">{request.geo.lng.toFixed(2)}</div>
        </div>
      </div>
      {request.geo.asn ? (
        <div className="rounded-sm border border-border bg-muted/40 px-2 py-1 font-mono text-[11px] text-foreground">
          ASN {request.geo.asn}
        </div>
      ) : null}
      <div className="border-t border-border pt-2 text-[11px] text-muted-foreground">
        {summarizeUA(request.userAgent)}
      </div>
      {/* use rng para silenciar lint "unused" caso futuro queira jitter visual */}
      <span data-rng-warmup={rng() < 0 ? 1 : 0} className="hidden" />
    </aside>
  )
}

/**
 * Converte código ISO-3166-1 alpha-2 em bandeira emoji (Regional Indicator
 * Symbol Letters). Sem deps externas.
 */
function countryFlag(cc: string): string {
  if (cc.length !== 2) return "🏳️"
  const A = 0x1f1e6
  const codeA = "A".charCodeAt(0)
  const upper0 = cc.charCodeAt(0) - codeA + A
  const upper1 = cc.charCodeAt(1) - codeA + A
  return String.fromCodePoint(upper0, upper1)
}

/* ------------------------------- Componente -------------------------------- */

function RequestFlowInspector({
  request,
  className,
  ...props
}: RequestFlowInspectorProps): React.ReactElement {
  const [tab, setTab] = React.useState<TabId>("timing")
  const sc = statusColor(request.status)
  const counts: Record<TabId, number> = {
    timing: 5,
    headers: request.requestHeaders.length + request.responseHeaders.length,
    body:
      (request.requestBody ? 1 : 0) + (request.responseBody ? 1 : 0),
    cookies: request.cookies.length,
    trace: request.parentSpanId ? 3 : 2,
  }

  return (
    <div
      data-slot="request-flow-inspector"
      className={cn(
        "grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]",
        "rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-3">
        {/* Status bar */}
        <div
          data-slot="request-flow-inspector-statusbar"
          className={cn(
            "flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between",
            sc.bg,
            sc.border,
          )}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-sm border px-1.5 py-0.5 font-mono text-xs font-semibold uppercase",
                methodColor(request.method),
              )}
              data-method={request.method}
            >
              {request.method}
            </span>
            <code
              data-slot="request-flow-inspector-url"
              className="min-w-0 flex-1 truncate font-mono text-xs text-foreground"
            >
              {request.url}
            </code>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              data-slot="request-flow-inspector-status"
              className={cn(
                "rounded-sm border px-2 py-0.5 font-mono text-xs font-semibold",
                sc.text,
                "border-current/30 bg-background/40",
              )}
            >
              {request.status} {request.statusText}
            </span>
            <span className="rounded-sm border border-border bg-background/40 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {request.protocol}
            </span>
            <span
              data-slot="request-flow-inspector-duration"
              className={cn(
                "rounded-sm border px-1.5 py-0.5 font-mono text-[11px]",
                sc.text,
                "border-current/30 bg-background/40",
              )}
            >
              {request.durationMs} ms · TTFB {request.ttfbMs} ms
            </span>
          </div>
        </div>

        <TabBar active={tab} onChange={setTab} counts={counts} />

        <div
          id={`rfi-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`rfi-tab-${tab}`}
          className="min-w-0"
        >
          {tab === "timing" ? (
            <div className="space-y-2">
              <TimingWaterfall timing={request.timing} durationMs={request.durationMs} />
              <div className="text-[11px] text-muted-foreground">
                Barras em escala proporcional ao tempo total (
                {request.durationMs} ms). TTFB = {request.ttfbMs} ms.
              </div>
            </div>
          ) : null}

          {tab === "headers" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <HeadersTable
                title="Request"
                headers={request.requestHeaders}
                slotAttr="request-flow-inspector-headers-request"
              />
              <HeadersTable
                title="Response"
                headers={request.responseHeaders}
                slotAttr="request-flow-inspector-headers-response"
              />
            </div>
          ) : null}

          {tab === "body" ? (
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Request body
                </div>
                <BodyView
                  body={request.requestBody}
                  type={
                    request.requestBody
                      ? detectRequestBodyType(request.requestBody)
                      : undefined
                  }
                  side="request"
                />
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Response body
                </div>
                <BodyView
                  body={request.responseBody}
                  type={request.responseBodyType}
                  side="response"
                />
              </div>
            </div>
          ) : null}

          {tab === "cookies" ? <CookiesTable cookies={request.cookies} /> : null}

          {tab === "trace" ? <TraceView request={request} /> : null}
        </div>
      </div>

      <GeoCard request={request} />
    </div>
  )
}

function detectRequestBodyType(body: string): InspectedRequestBodyType {
  const t = body.trim()
  if (t.startsWith("{") || t.startsWith("[")) return "json"
  if (t.startsWith("<")) return "html"
  return "text"
}

export { RequestFlowInspector }
export type { RequestFlowInspectorProps }
