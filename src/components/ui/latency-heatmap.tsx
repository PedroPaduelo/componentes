/**
 * LatencyHeatmap — grade (heatmap) de latência/intensidade para dashboards.
 *
 * Desenha uma matriz coluna-maior (`columns`): cada coluna é um array de
 * valores por linha (0..1), e cada célula recebe uma cor via `colorScale`.
 * Eixos opcionais: rótulos verticais (lento/rápido) à esquerda e rótulos
 * horizontais (janela/agora) abaixo. Só renderiza — totalmente desacoplado de
 * qualquer modelo de simulação: o consumidor passa a matriz (ex.: a janela
 * rolante de um tick) e, se quiser, a escala de cor.
 *
 * Extraído da composição `observability-center`. Sem dependências novas, sem
 * estado. O elemento raiz expõe `data-slot="latency-heatmap"` e aceita
 * className/props padrão de um <div>.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export interface LatencyHeatmapProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Matriz COLUNA-MAIOR: cada item é uma coluna com um valor por linha
   * (espera-se 0..1, mas a `colorScale` pode interpretar como quiser).
   */
  columns: number[][]
  /** Nº de linhas. Default: tamanho da maior coluna. */
  rows?: number
  /** Mapeia um valor de célula → cor CSS. Default: escala teal→âmbar→rosa. */
  colorScale?: (value: number) => string
  /** Rótulos do eixo Y (topo, base). `false` esconde. Default: ["lento","rápido"]. */
  rowLabels?: [string, string] | false
  /** Rótulos do eixo X (início, fim). `false` esconde. Default: [`−Nt`,"agora"]. */
  colLabels?: [string, string] | false
}

/** Escala de cor padrão: 0 → teal/verde, 0.5 → âmbar, 1 → rosa. */
function defaultColorScale(v: number): string {
  const t = Math.min(1, Math.max(0, v))
  let r: number
  let g: number
  let b: number
  if (t < 0.5) {
    const k = t / 0.5
    r = Math.round(16 + (245 - 16) * k)
    g = Math.round(185 + (158 - 185) * k)
    b = Math.round(129 + (11 - 129) * k)
  } else {
    const k = (t - 0.5) / 0.5
    r = Math.round(245 + (244 - 245) * k)
    g = Math.round(158 + (63 - 158) * k)
    b = Math.round(11 + (94 - 11) * k)
  }
  const alpha = 0.14 + 0.82 * t
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`
}

function LatencyHeatmap({
  columns,
  rows,
  colorScale = defaultColorScale,
  rowLabels = ["lento", "rápido"],
  colLabels,
  className,
  ...props
}: LatencyHeatmapProps) {
  const nCols = columns.length
  const nRows = rows ?? columns.reduce((max, col) => Math.max(max, col.length), 0)
  const resolvedColLabels: [string, string] | false =
    colLabels === undefined ? [`−${nCols}t`, "agora"] : colLabels

  return (
    <div
      data-slot="latency-heatmap"
      className={cn("flex gap-2", className)}
      {...props}
    >
      {rowLabels ? (
        <div className="flex flex-col justify-between py-0.5 text-[10px] text-muted-foreground">
          <span>{rowLabels[0]}</span>
          <span>{rowLabels[1]}</span>
        </div>
      ) : null}
      <div className="flex-1">
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${nCols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: nRows }, (_, row) =>
            columns.map((col, c) => (
              <div
                key={`${row}-${c}`}
                className="aspect-square rounded-[2px]"
                style={{ backgroundColor: colorScale(col[row] ?? 0) }}
              />
            ))
          )}
        </div>
        {resolvedColLabels ? (
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
            <span>{resolvedColLabels[0]}</span>
            <span>{resolvedColLabels[1]}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { LatencyHeatmap }
