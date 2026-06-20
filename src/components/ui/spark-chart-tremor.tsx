/**
 * Tremor SparkChart [v1.0.0]
 *
 * Spark chart compacto baseado em Recharts — versão unificada dos 3 sub-componentes
 * `SparkAreaChart` / `SparkBarChart` / `SparkLineChart` que o Tremor Raw 3.x
 * ainda expõe separadamente. Aqui a escolha é feita via prop `type` para uma
 * API mais ergonômica.
 *
 * API intencionalmente SIMPLIFICADA em relação ao Tremor original:
 * - Recebe `data: number[]` (em vez de `Record<string, any>[] + categories + index`),
 *   o que casa com o caso de uso real em KPI cards e cards de dashboard.
 * - Aceita 1 cor (spark é uma série só); o array `colors` é tolerado só para
 *   espelhar a assinatura Tremor e permitir multi-série futura.
 *
 * Adaptado do https://github.com/tremorlabs/tremor (Apache-2.0) para a
 * convenção Vitrine UI (`data-slot`, `cn`, sem `"use client"`, sem `tv()`).
 */

import * as React from "react"
import {
  Area,
  Bar,
  Line,
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import type { AxisDomainItem } from "recharts/types/util/types"

import {
  AvailableChartColors,
  type AvailableChartColorsKeys,
  cx as tremorCx,
  getColorClassName,
  getYAxisDomain,
} from "@/lib/tremor-utils"
import { cn } from "@/lib/utils"

export type SparkChartType = "area" | "bar" | "line"
export type SparkCurveType = "linear" | "monotone" | "step"

export interface SparkChartTremorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Série de valores numéricos. Defaults para `[]` quando omitido. */
  data?: number[]
  /** Variante do spark chart. Default: `"area"`. */
  type?: SparkChartType
  /** Cores Tremor aplicadas ciclicamente (spark usa apenas a 1ª). */
  colors?: AvailableChartColorsKeys[]
  /** Habilita animação do Recharts. Default: `true`. */
  showAnimation?: boolean
  /** Conecta pontos com valor `null`/`NaN`. Default: `false`. */
  connectNulls?: boolean
  /** Curva usada em `type="area"` e `type="line"`. Default: `"linear"`. */
  curveType?: SparkCurveType
}

/**
 * Adapta um `number[]` simples para o shape mínimo que o Recharts aceita:
 * `[{ index: number, value: number }, …]`. Mantém a ordem dos pontos.
 */
const toChartData = (values: number[]): { index: number; value: number }[] =>
  values.map((value, index) => ({ index, value }))

const SparkChartTremor = React.forwardRef<HTMLDivElement, SparkChartTremorProps>(
  (props, forwardedRef) => {
    const {
      data = [],
      type = "area",
      colors = [...AvailableChartColors],
      showAnimation = true,
      connectNulls = false,
      curveType = "linear",
      className,
      ...other
    } = props

    const primaryColor = colors[0] ?? "blue"
    const chartData = toChartData(data)
    const yAxisDomain = getYAxisDomain(data) as [AxisDomainItem, AxisDomainItem]
    const gradientId = React.useId()
    const strokeClass = getColorClassName(primaryColor, "stroke")
    const fillClass = getColorClassName(primaryColor, "fill")

    const commonMargin = { bottom: 1, left: 1, right: 1, top: 1 }

    return (
      <div
        ref={forwardedRef}
        className={cn("h-12 w-28", className)}
        data-slot="spark-chart-tremor"
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer>
          {(() => {
            if (type === "bar") {
              return (
                <RechartsBarChart data={chartData} margin={commonMargin}>
                  <XAxis hide dataKey="index" />
                  <YAxis hide={true} domain={yAxisDomain} />
                  <Bar
                    className={tremorCx(fillClass)}
                    dataKey="value"
                    isAnimationActive={showAnimation}
                  />
                </RechartsBarChart>
              )
            }

            if (type === "line") {
              return (
                <RechartsLineChart data={chartData} margin={commonMargin}>
                  <XAxis hide dataKey="index" />
                  <YAxis hide={true} domain={yAxisDomain} />
                  <Line
                    className={tremorCx(strokeClass)}
                    dataKey="value"
                    dot={false}
                    stroke=""
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    type={curveType}
                    isAnimationActive={showAnimation}
                    connectNulls={connectNulls}
                  />
                </RechartsLineChart>
              )
            }

            // type === "area" (default)
            const fillUrl = `url(#${gradientId})`
            return (
              <RechartsAreaChart data={chartData} margin={commonMargin}>
                <XAxis hide dataKey="index" />
                <YAxis hide={true} domain={yAxisDomain} />
                <defs>
                  <linearGradient
                    className={tremorCx(strokeClass)}
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  className={tremorCx(strokeClass)}
                  dataKey="value"
                  dot={false}
                  stroke=""
                  strokeOpacity={1}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  type={curveType}
                  isAnimationActive={showAnimation}
                  connectNulls={connectNulls}
                  fill={fillUrl}
                />
              </RechartsAreaChart>
            )
          })()}
        </ResponsiveContainer>
      </div>
    )
  },
)

SparkChartTremor.displayName = "SparkChartTremor"

export { SparkChartTremor }
