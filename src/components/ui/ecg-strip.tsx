/**
 * EcgStrip — faixa de "batimento" (ECG) animada em SVG.
 *
 * Desenha uma onda de eletrocardiograma que varre horizontalmente (loop sem
 * costura via dois traçados emendados) com glow na cor do traço. A animação é
 * conduzida por `requestAnimationFrame`, com velocidade (`speed`) e amplitude
 * (`amplitude`) controláveis e a opção de congelar (`paused`). O rAF é sempre
 * cancelado no unmount.
 *
 * Extraído da composição `observability-center` (Pulse), com API genérica para
 * reuso. Sem dependências novas. O elemento raiz é o próprio <svg> com
 * `data-slot="ecg-strip"` (ocupa a altura/largura do container por padrão);
 * `height` controla apenas o sistema de coordenadas do viewBox. A cor (`color`)
 * é um valor CSS (hex/var) — pode ser uma cor de severidade/data-viz.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

const ECG_W = 1200
const ECG_CYCLE = 150
/** px/s a `speed = 1` (≈ uma batida a cada 0,92 s). */
const PX_PER_SEC_BASE = ECG_CYCLE / 0.92

export interface EcgStripProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  /** Cor do traço/glow (CSS). Default: var(--primary). */
  color?: string
  /** Altura do viewBox (sistema de coordenadas). Default: 84. */
  height?: number
  /** Multiplicador de velocidade da varredura. Default: 1. */
  speed?: number
  /** Amplitude do pico R da onda. Default: 24. */
  amplitude?: number
  /** Quando true, congela a animação (mantém o traço estático). */
  paused?: boolean
}

function ecgPath(midY: number, amp: number): string {
  const cycles = Math.round(ECG_W / ECG_CYCLE)
  const pts: string[] = []
  for (let i = 0; i < cycles; i++) {
    const x = i * ECG_CYCLE
    pts.push(
      `${x} ${midY}`,
      `${x + ECG_CYCLE * 0.42} ${midY}`,
      `${x + ECG_CYCLE * 0.48} ${midY - amp * 0.16}`,
      `${x + ECG_CYCLE * 0.53} ${midY}`,
      `${x + ECG_CYCLE * 0.57} ${midY + amp * 0.14}`,
      `${x + ECG_CYCLE * 0.61} ${midY - amp}`,
      `${x + ECG_CYCLE * 0.65} ${midY + amp * 0.4}`,
      `${x + ECG_CYCLE * 0.69} ${midY}`,
      `${x + ECG_CYCLE * 0.8} ${midY - amp * 0.26}`,
      `${x + ECG_CYCLE * 0.9} ${midY}`,
      `${x + ECG_CYCLE} ${midY}`,
    )
  }
  return `M ${pts.join(" L ")}`
}

function EcgStrip({
  color = "var(--primary)",
  height = 84,
  speed = 1,
  amplitude = 24,
  paused = false,
  className,
  style,
  ...props
}: EcgStripProps) {
  const gRef = React.useRef<SVGGElement>(null)
  const offsetRef = React.useRef(0)
  const speedRef = React.useRef(speed)
  const pausedRef = React.useRef(paused)
  speedRef.current = speed
  pausedRef.current = paused

  const midY = height / 2
  const path = React.useMemo(() => ecgPath(midY, amplitude), [midY, amplitude])

  React.useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 1000
      last = now
      if (!pausedRef.current) {
        const pxPerSec = PX_PER_SEC_BASE * Math.max(0.1, speedRef.current)
        let o = offsetRef.current - pxPerSec * dt
        if (o <= -ECG_W) o += ECG_W
        offsetRef.current = o
        if (gRef.current) {
          gRef.current.setAttribute("transform", `translate(${o.toFixed(1)} 0)`)
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg
      data-slot="ecg-strip"
      viewBox={`0 0 ${ECG_W} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-full w-full", className)}
      style={{ filter: `drop-shadow(0 0 6px ${color})`, ...style }}
      {...props}
    >
      <line x1={0} y1={midY} x2={ECG_W} y2={midY} stroke="var(--border)" strokeWidth={1} />
      <g ref={gRef}>
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <g transform={`translate(${ECG_W} 0)`}>
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  )
}

export { EcgStrip }
