/**
 * ComboChartTremor — Recharts `ComposedChart` combinando Bar + Line.
 *
 * Portado de https://github.com/tremorlabs/tremor (Tremor Raw v3,
 * src/components/ComboChart/ComboChart.tsx) e simplificado para ~280 linhas.
 *
 * **API**
 * - `data`: array de objetos (linha por tick do eixo X).
 * - `index`: nome da chave em `data` que define o eixo X (ex.: `"month"`).
 * - `categories`: pode ser `string[]` (todas viram `bar`) ou
 *   `ComboCategory[]` (`string | { name: string; type: "bar" | "line" }`)
 *   para misturar Bar + Line no mesmo chart.
 * - `colors?`: pool de cores Tremor (default: todos os 18 `AvailableChartColors`).
 * - `valueFormatter?`: formata valores no Tooltip e nos ticks do eixo Y.
 * - `showLegend?` (default `true`) e `showAnimation?` (default `true`).
 *
 * Helpers reusados de `@/lib/tremor-utils` (portados uma única vez para
 * evitar dependência do pacote Tremor e do `tailwind-variants`). Helpers
 * internos `deepEqual` / `getYAxisDomainCombo` ficam LOCAIS porque são
 * específicos desta combinação Bar+Line.
 *
 * Sem "use client" (Vitrine não é Next.js). Sem dependências novas: recharts já
 * está no package.json (instalado pelo O0.1 do plano Tremor).
 */

import * as React from "react"
import {
  Bar,
  CartesianGrid,
  ComposedChart as ReChartsComboChart,
  Legend as ReChartsLegend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  type AvailableChartColorsKeys,
  AvailableChartColors,
  constructCategoryColors,
  cx,
  getColorClassName,
} from "@/lib/tremor-utils"

// ──────────────────────────────────────────────────────────────────────────────
// Tipos públicos
// ──────────────────────────────────────────────────────────────────────────────

/** Uma categoria pode ser um nome simples (default `"bar"`) ou um objeto. */
export type ComboCategory = string | { name: string; type: "bar" | "line" }

/** Forma normalizada internamente após o `normalizeCategories`. */
interface NormalizedCategory {
  name: string
  type: "bar" | "line"
}

export interface ComboChartTremorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, unknown>[]
  index: string
  categories: ComboCategory[]
  colors?: AvailableChartColorsKeys[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showAnimation?: boolean
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers internos (locais; não reusados fora deste componente nesta task)
// ──────────────────────────────────────────────────────────────────────────────

/** Deep-equal minimalista para comparar payloads do Recharts (active bar/dot). */
function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false
  }
  const keysA = Object.keys(a as Record<string, unknown>)
  const keysB = Object.keys(b as Record<string, unknown>)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false
    }
  }
  return true
}

/** Domínio [min, max] do eixo Y respeitando overrides explícitos. */
function getYAxisDomainCombo(
  values: number[],
  minValue: number | undefined,
  maxValue: number | undefined,
): [number | "auto", number | "auto"] {
  if (minValue !== undefined || maxValue !== undefined) {
    return [minValue ?? "auto", maxValue ?? "auto"]
  }
  if (values.length === 0) return [0, "auto"]

  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min) * 0.2
  return [min < 0 ? min - pad : 0, max + pad]
}

function normalizeCategories(
  categories: ComboCategory[],
): NormalizedCategory[] {
  return categories.map((c) =>
    typeof c === "string" ? { name: c, type: "bar" as const } : { name: c.name, type: c.type },
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Render helpers (shape custom para destacar a barra ativa + tooltip)
// ──────────────────────────────────────────────────────────────────────────────

interface BarShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  payload?: Record<string, unknown>
  value?: number
  fillOpacity?: number
}

function renderBarShape(
  props: BarShapeProps,
  activeBar: { payload: Record<string, unknown>; value: number } | undefined,
  activeLegend: string | undefined,
) {
  const { fillOpacity, name, payload, width, x } = props
  // `value` pode ser undefined quando o Bar renderiza com payload "vazio".
  const value: number = props.value ?? 0
  const yIn = props.y
  const heightIn = props.height
  // Faltando qualquer coordenada essencial: não desenha (em vez de quebrar).
  if (
    yIn === undefined ||
    heightIn === undefined ||
    width === undefined ||
    x === undefined
  ) {
    return <g aria-hidden="true" />
  }
  // Após o guard, todos são `number` garantido — cópias locais com tipo estreito.
  const y0: number = yIn
  const h0: number = heightIn
  const flipped = h0 < 0
  const y: number = flipped ? y0 + h0 : y0
  const height: number = Math.abs(h0)
  const isOtherActive = activeLegend !== undefined && activeLegend !== name
  // Reconstrói o payload idêntico ao activeBar (apenas os campos que importam
  // para o deepEqual). Cast explícito porque o spread de `Record<string,
  // unknown> | undefined` não é seguro pelo type-checker do TS.
  const candidatePayload: { payload: Record<string, unknown>; value: number } = {
    payload: payload ?? {},
    value,
  }
  const isThisActive =
    activeBar !== undefined && deepEqual(activeBar, candidatePayload)
  const opacity =
    activeBar === undefined && !isOtherActive
      ? (fillOpacity ?? 1)
      : isThisActive
        ? (fillOpacity ?? 1)
        : 0.3
  return <rect x={x} y={y} width={width} height={height} opacity={opacity} />
}

interface PayloadItem {
  category: string
  value: number
  chartType: "bar" | "line"
  barColor: AvailableChartColorsKeys
  lineColor: AvailableChartColorsKeys
}

function ComboTooltip({
  active,
  payload,
  label,
  valueFormatter,
  categories,
}: {
  active: boolean | undefined
  payload: PayloadItem[]
  label: string
  valueFormatter: (value: number) => string
  categories: NormalizedCategory[]
}) {
  if (!active || !payload || payload.length === 0) return null
  // Mantém só items que casam com uma categoria (descarta decoys do recharts).
  const filtered = payload.filter((p) =>
    categories.some((c) => c.name === p.category),
  )
  if (filtered.length === 0) return null

  return (
    <div
      className={cx(
        "rounded-md border text-sm shadow-md",
        "border-border",
        "bg-popover text-popover-foreground",
      )}
    >
      <div className="border-inherit border-b px-4 py-2">
        <p className="font-medium text-gray-900 dark:text-gray-50">{label}</p>
      </div>
      <div className="space-y-1 px-4 py-2">
        {filtered.map((item, idx) => {
          const color = item.chartType === "bar" ? item.barColor : item.lineColor
          return (
            <div
              key={`combo-tip-${idx}`}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cx(
                    item.chartType === "bar"
                      ? "size-2 shrink-0 rounded-xs"
                      : "h-[3px] w-3.5 shrink-0 rounded-full",
                    getColorClassName(color, "fill") // bg-<color>-500; reutiliza helper
                      .replace("fill-", "bg-"),
                  )}
                />
                <p className="whitespace-nowrap text-gray-700 dark:text-gray-300">
                  {item.category}
                </p>
              </div>
              <p className="whitespace-nowrap text-right font-medium tabular-nums text-gray-900 dark:text-gray-50">
                {valueFormatter(item.value)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente
// ──────────────────────────────────────────────────────────────────────────────

const ComboChartTremor = React.forwardRef<HTMLDivElement, ComboChartTremorProps>(
  (props, forwardedRef) => {
    const {
      data = [],
      index,
      categories,
      colors = [...AvailableChartColors],
      valueFormatter = (value: number) => value.toString(),
      showLegend = true,
      showAnimation = true,
      className,
      ...rest
    } = props

    const normalized = React.useMemo(
      () => normalizeCategories(categories),
      [categories],
    )
    const barNames = React.useMemo(
      () => normalized.filter((c) => c.type === "bar").map((c) => c.name),
      [normalized],
    )
    const lineNames = React.useMemo(
      () => normalized.filter((c) => c.type === "line").map((c) => c.name),
      [normalized],
    )

    // Um único mapa de cores sobre TODAS as categorias (na ordem declarada),
    // para que bar e line recebam cores distintas. Antes bar e line eram
    // coloridos por mapas separados — ambos começavam no índice 0 da paleta e
    // saíam com a mesma cor (ex.: tudo azul).
    const categoryColors = React.useMemo(
      () => constructCategoryColors(normalized.map((c) => c.name), colors),
      [normalized, colors],
    )
    const barCategoryColors = categoryColors
    const lineCategoryColors = categoryColors

    const [activeLegend, setActiveLegend] = React.useState<string | undefined>()
    const [activeBar, setActiveBar] = React.useState<
      { payload: Record<string, unknown>; value: number } | undefined
    >(undefined)

    // Coleta valores por eixo (para o YAxis domain — usa o range combinado).
    const { barValues, lineValues } = React.useMemo(() => {
      const b: number[] = []
      const l: number[] = []
      for (const row of data) {
        for (const name of barNames) {
          const v = row[name]
          if (typeof v === "number" && Number.isFinite(v)) b.push(v)
        }
        for (const name of lineNames) {
          const v = row[name]
          if (typeof v === "number" && Number.isFinite(v)) l.push(v)
        }
      }
      return { barValues: b, lineValues: l }
    }, [data, barNames, lineNames])

    // Combo biaxial: bar e line costumam ter magnitudes MUITO diferentes
    // (ex.: receita ~10k vs pedidos ~200). Com um eixo único a série menor fica
    // achatada no zero (em cima das labels do X). Por isso cada tipo ganha seu
    // próprio eixo Y com domínio independente: barras à esquerda, linha à direita.
    const biaxial = barNames.length > 0 && lineNames.length > 0
    const barDomain = React.useMemo(
      () =>
        getYAxisDomainCombo(
          biaxial ? barValues : [...barValues, ...lineValues],
          undefined,
          undefined,
        ),
      [barValues, lineValues, biaxial],
    )
    const lineDomain = React.useMemo(
      () => getYAxisDomainCombo(lineValues, undefined, undefined),
      [lineValues],
    )

    function onBarClick(barData: unknown) {
      if (barData === null || typeof barData !== "object") return
      const d = barData as {
        payload?: Record<string, unknown>
        value?: number
        tooltipPayload?: { dataKey?: string }[]
      }
      if (d.payload === undefined || d.value === undefined) return
      // Após o guard, narrowing garante que ambos são definidos.
      const payload: Record<string, unknown> = d.payload
      const value: number = d.value
      // Reconstrói no formato exato do state para satisfazer o deepEqual.
      const next: { payload: Record<string, unknown>; value: number } = {
        payload,
        value,
      }
      if (activeBar !== undefined && deepEqual(activeBar, next)) {
        setActiveBar(undefined)
        setActiveLegend(undefined)
      } else {
        setActiveBar({ payload, value })
        setActiveLegend(d.tooltipPayload?.[0]?.dataKey)
      }
    }

    function onLegendItemClick(name: string) {
      setActiveLegend((prev) => (prev === name ? undefined : name))
      setActiveBar(undefined)
    }

    return (
      <div
        ref={forwardedRef}
        data-slot="combo-chart-tremor"
        className={cx("h-80 w-full", className)}
        tremor-id="tremor-raw"
        {...rest}
      >
        <ResponsiveContainer>
          <ReChartsComboChart data={data}>
            <CartesianGrid
              className="stroke-gray-200 stroke-1 dark:stroke-gray-800"
              horizontal
              vertical={false}
            />
            <XAxis
              dataKey={index}
              className={cx("mt-4 text-xs", "fill-gray-500 dark:fill-gray-500")}
              tickLine={false}
              axisLine={false}
              minTickGap={5}
            />
            <YAxis
              yAxisId="left"
              width={56}
              className={cx("text-xs", "fill-gray-500 dark:fill-gray-500")}
              tickLine={false}
              axisLine={false}
              type="number"
              domain={barDomain}
              tickFormatter={valueFormatter}
              allowDecimals
            />
            {biaxial ? (
              <YAxis
                yAxisId="right"
                orientation="right"
                width={56}
                className={cx("text-xs", "fill-gray-500 dark:fill-gray-500")}
                tickLine={false}
                axisLine={false}
                type="number"
                domain={lineDomain}
                tickFormatter={valueFormatter}
                allowDecimals
              />
            ) : null}
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              isAnimationActive={showAnimation}
              animationDuration={100}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              offset={20}
              content={({ active, payload, label }: { active?: boolean; payload?: unknown[]; label?: unknown }) => {
                const cleanPayload: PayloadItem[] = []
                if (Array.isArray(payload)) {
                  for (const raw of payload) {
                    const item = raw as {
                      dataKey?: string
                      value?: number
                      type?: string
                    }
                    const dataKey = item.dataKey
                    if (dataKey === undefined || typeof item.value !== "number") continue
                    const norm = normalized.find((c) => c.name === dataKey)
                    if (!norm) continue
                    cleanPayload.push({
                      category: dataKey,
                      value: item.value,
                      chartType: norm.type,
                      barColor: barCategoryColors.get(dataKey) ?? "gray",
                      lineColor: lineCategoryColors.get(dataKey) ?? "gray",
                    })
                  }
                }
                return (
                  <ComboTooltip
                    active={active}
                    payload={cleanPayload}
                    label={typeof label === "string" ? label : String(label ?? "")}
                    valueFormatter={valueFormatter}
                    categories={normalized}
                  />
                )
              }}
            />
            {showLegend ? (
              <ReChartsLegend
                verticalAlign="top"
                height={36}
                content={({ payload }: { payload?: unknown[] }) => {
                  type LegendEntry = { value: string; type?: string }
                  const items: LegendEntry[] = (payload ?? []).filter(
                    (p: unknown): p is LegendEntry =>
                      typeof p === "object" &&
                      p !== null &&
                      typeof (p as { value?: unknown }).value === "string",
                  )
                  return (
                    <ul className="flex flex-wrap items-center justify-end gap-1.5 pb-2 pr-12">
                      {items.map((item: LegendEntry, idx: number) => {
                        const norm = normalized.find((c) => c.name === item.value)
                        const color =
                          norm?.type === "line"
                            ? (lineCategoryColors.get(item.value) ?? "gray")
                            : (barCategoryColors.get(item.value) ?? "gray")
                        const faded =
                          activeLegend !== undefined && activeLegend !== item.value
                        return (
                          <li
                            key={`combo-leg-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              onLegendItemClick(item.value)
                            }}
                            className={cx(
                              "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-1 transition",
                              "hover:bg-gray-100 dark:hover:bg-gray-800",
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cx(
                                norm?.type === "bar"
                                  ? "size-2 shrink-0 rounded-xs"
                                  : "h-[3px] w-3.5 shrink-0 rounded-full",
                                getColorClassName(color, "fill")
                                  .replace("fill-", "bg-"),
                                faded ? "opacity-40" : "opacity-100",
                              )}
                            />
                            <p
                              className={cx(
                                "truncate whitespace-nowrap text-xs text-gray-700 dark:text-gray-300",
                                faded ? "opacity-40" : "opacity-100",
                              )}
                            >
                              {item.value}
                            </p>
                          </li>
                        )
                      })}
                    </ul>
                  )
                }}
              />
            ) : null}
            {barNames.map((name) => {
              const color = barCategoryColors.get(name) ?? "gray"
              return (
                <Bar
                  key={`bar-${name}`}
                  yAxisId="left"
                  dataKey={name}
                  name={name}
                  type="linear"
                  className={cx(getColorClassName(color, "fill"))}
                  isAnimationActive={showAnimation}
                  fill=""
                  shape={(shapeProps: unknown) =>
                    renderBarShape(
                      shapeProps as BarShapeProps,
                      activeBar,
                      activeLegend,
                    )
                  }
                  onClick={(d: unknown) =>
                    onBarClick(d as Parameters<typeof onBarClick>[0])
                  }
                />
              )
            })}
            {lineNames.map((name) => {
              const color = lineCategoryColors.get(name) ?? "gray"
              return (
                <Line
                  key={`line-${name}`}
                  yAxisId={biaxial ? "right" : "left"}
                  type="linear"
                  dataKey={name}
                  name={name}
                  className={cx(getColorClassName(color, "stroke"))}
                  strokeOpacity={
                    activeLegend !== undefined && activeLegend !== name ? 0.3 : 1
                  }
                  stroke=""
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  isAnimationActive={showAnimation}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                  connectNulls={false}
                />
              )
            })}
          </ReChartsComboChart>
        </ResponsiveContainer>
      </div>
    )
  },
)
ComboChartTremor.displayName = "ComboChartTremor"

export { ComboChartTremor }
