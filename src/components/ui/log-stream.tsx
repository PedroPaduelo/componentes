/**
 * LogStream — stream de logs (terminal-like) com filtros por nível.
 *
 * Renderiza uma lista rolável de entradas de log em fonte monoespaçada, cada
 * linha com: horário, nível (colorido), origem/serviço, método + path, código
 * de status (tingido por faixa HTTP), duração e mensagem — todos opcionais. No
 * topo, uma barra de chips liga/desliga níveis (com contagem por nível).
 *
 * Os filtros funcionam em dois modos: CONTROLADO (passe `levels` + opcional
 * `onToggleLevel`) ou INTERNO (omita `levels` → o componente mantém o próprio
 * estado, tudo ligado por padrão). `showFilters={false}` esconde a barra.
 *
 * Extraído da composição `observability-center` (Pulse), com API genérica.
 * Autocontido (estilos por nível com defaults para debug/info/warn/error; sem
 * estado externo obrigatório). O elemento raiz é um <div> com
 * `data-slot="log-stream"`. As cores de nível/código são severidade de
 * data-viz, não tokens de tema.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/** Classes Tailwind por nível de log (texto da linha + chip de filtro). */
export interface LogStreamLevelStyle {
  /** Classe de cor do nível na linha. */
  text: string
  /** Classe do chip de filtro (bg/text/border). */
  chip: string
}

export interface LogStreamEntry {
  /** Id estável (key); default = índice. */
  id?: string | number
  /** Nível do log (ex.: "debug" | "info" | "warn" | "error"). */
  level: string
  /** Mensagem da entrada. */
  message?: React.ReactNode
  /** Código de status (ex.: HTTP) — colorido por faixa. */
  code?: number
  /** Método (ex.: "GET"). */
  method?: string
  /** Path/rota da requisição. */
  path?: React.ReactNode
  /** Rótulo curto da origem/serviço. */
  service?: React.ReactNode
  /** Duração em ms. */
  ms?: number
  /** Horário já formatado. */
  time?: React.ReactNode
}

export interface LogStreamProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Entradas a exibir (mais recentes primeiro — a ordem é preservada). */
  entries: LogStreamEntry[]
  /** Ordem/lista dos níveis nos chips. Default: debug/info/warn/error. */
  levelOrder?: string[]
  /** Estilos por nível. Default cobre debug/info/warn/error. */
  levelStyles?: Record<string, LogStreamLevelStyle>
  /** Mapa controlado de níveis ativos. Omitido = estado interno (todos on). */
  levels?: Record<string, boolean>
  /** Callback de toggle de um nível (modo controlado). */
  onToggleLevel?: (level: string) => void
  /** Renderiza a barra de filtros. Default: true. */
  showFilters?: boolean
  /** Mensagem quando nada passa no filtro. */
  emptyLabel?: React.ReactNode
  /** Classe extra da área rolável (ex.: altura). */
  scrollClassName?: string
}

const DEFAULT_LEVEL_ORDER = ["debug", "info", "warn", "error"]

const DEFAULT_LEVEL_STYLES: Record<string, LogStreamLevelStyle> = {
  debug: { text: "text-sky-400", chip: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  info: { text: "text-emerald-400", chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  warn: { text: "text-amber-400", chip: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  error: { text: "text-rose-400", chip: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
}

const FALLBACK_STYLE: LogStreamLevelStyle = {
  text: "text-foreground",
  chip: "bg-muted text-muted-foreground border-border",
}

function codeClass(code: number): string {
  return code >= 500 ? "text-rose-400" : code >= 400 ? "text-amber-400" : "text-emerald-400"
}

function LogStream({
  entries,
  levelOrder = DEFAULT_LEVEL_ORDER,
  levelStyles = DEFAULT_LEVEL_STYLES,
  levels,
  onToggleLevel,
  showFilters = true,
  emptyLabel = "Nenhum log no filtro atual.",
  scrollClassName,
  className,
  ...props
}: LogStreamProps) {
  const [internal, setInternal] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(levelOrder.map((l) => [l, true])),
  )
  const active = levels ?? internal
  const isActive = (lvl: string) => active[lvl] !== false

  const toggle = (lvl: string) => {
    if (onToggleLevel) onToggleLevel(lvl)
    else if (!levels) setInternal((s) => ({ ...s, [lvl]: s[lvl] === false }))
  }

  const counts = React.useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of entries) c[e.level] = (c[e.level] ?? 0) + 1
    return c
  }, [entries])

  const styleOf = (lvl: string) => levelStyles[lvl] ?? FALLBACK_STYLE
  const visible = entries.filter((e) => isActive(e.level))

  return (
    <div data-slot="log-stream" className={cn("flex min-h-0 flex-col", className)} {...props}>
      {showFilters && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
          {levelOrder.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => toggle(lvl)}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tabular-nums transition-opacity",
                styleOf(lvl).chip,
                !isActive(lvl) && "opacity-35",
              )}
            >
              {lvl} {counts[lvl] ?? 0}
            </button>
          ))}
        </div>
      )}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-2 py-1.5 font-mono text-[11px] leading-relaxed",
          scrollClassName,
        )}
      >
        {visible.length === 0 ? (
          <p className="px-2 py-6 text-center text-muted-foreground">{emptyLabel}</p>
        ) : (
          visible.map((entry, i) => {
            const st = styleOf(entry.level)
            return (
              <div
                key={entry.id ?? i}
                className="flex items-start gap-2 rounded px-2 py-0.5 hover:bg-muted/40"
              >
                {entry.time != null && (
                  <span className="shrink-0 text-muted-foreground">{entry.time}</span>
                )}
                <span className={cn("w-10 shrink-0 font-semibold uppercase", st.text)}>
                  {entry.level}
                </span>
                {entry.service != null && (
                  <span className="shrink-0 text-foreground/70">{entry.service}</span>
                )}
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {entry.method != null && <span className="text-foreground/80">{entry.method}</span>}
                  {entry.method != null && entry.path != null ? " " : null}
                  {entry.path}
                  {entry.code != null && (
                    <>
                      {" "}
                      <span className={codeClass(entry.code)}>{entry.code}</span>
                    </>
                  )}
                  {entry.ms != null && <> · {entry.ms}ms</>}
                  {entry.message != null && <> · {entry.message}</>}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export { LogStream }
