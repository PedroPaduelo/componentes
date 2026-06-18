/**
 * ServiceMesh — malha viva de serviços (topologia animada em SVG).
 *
 * Desenha um grafo de nós (serviços) ligados por arestas curvas (bézier
 * quadrática), com PACOTES de tráfego trafegando ao vivo entre os nós: cada
 * pacote é uma linha curta (cauda de cometa) que percorre uma aresta, é
 * recolocado numa nova aresta ao chegar ao fim e é colorido pela SEVERIDADE do
 * trecho (pior status entre origem/destino). A distribuição dos pacotes é
 * ponderada pelo `weight` de cada nó (ex.: rps), então arestas mais movimentadas
 * recebem mais tráfego. Nós em alarme ganham glow + radar pings.
 *
 * A animação é conduzida por `requestAnimationFrame` (sem re-render do React: o
 * loop escreve direto nos atributos das linhas via refs) e é SEMPRE cancelada no
 * unmount — zero leak. `paused` congela o tráfego e o fluxo tracejado das
 * arestas; `speed` multiplica a velocidade dos pacotes.
 *
 * Extraído da composição `observability-center` (Pulse), com API genérica para
 * reuso. Autocontido: traz o próprio PRNG determinístico, a geometria das
 * curvas e os estilos das animações CSS (escopados por `useId`, sem depender de
 * CSS global). As cores de status/pacote são valores CSS (hex/var) — severidade
 * de data-viz, não tokens de tema. O elemento raiz é o próprio <svg> com
 * `data-slot="service-mesh"`. `MeshNode` é interno (não exportado).
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/** Status semântico de saúde de um nó (deriva cor/realce). */
export type ServiceMeshStatus = "healthy" | "degraded" | "critical"

export interface ServiceMeshNode {
  /** Identificador único do nó (referenciado pelas arestas). */
  id: string
  /** Rótulo principal exibido no nó. */
  label: string
  /** Coordenada X no sistema do viewBox (ver `width`). */
  x: number
  /** Coordenada Y no sistema do viewBox (ver `height`). */
  y: number
  /** Status de saúde do nó. Default: "healthy". */
  status?: ServiceMeshStatus
  /** Sublabel (ex.: "5.2k rps · 12ms"). Omitido = sem segunda linha. */
  meta?: React.ReactNode
  /** Peso relativo para a distribuição de pacotes (ex.: rps). Default: 1. */
  weight?: number
}

export interface ServiceMeshEdge {
  /** Id opcional (usado como key; default derivado de from/to). */
  id?: string
  /** Id do nó de origem. */
  from: string
  /** Id do nó de destino. */
  to: string
  /** Curvatura perpendicular (px no viewBox); o sinal define o lado. Default: 0. */
  bow?: number
}

export interface ServiceMeshProps
  extends Omit<React.SVGProps<SVGSVGElement>, "onSelect"> {
  /** Nós da malha. */
  nodes: ServiceMeshNode[]
  /** Arestas (ligações) entre nós. */
  edges: ServiceMeshEdge[]
  /** Largura do viewBox (sistema de coordenadas dos nós). Default: 1000. */
  width?: number
  /** Altura do viewBox. Default: 560. */
  height?: number
  /** Id do nó selecionado (moldura tracejada + radar). */
  selectedId?: string | null
  /** Ids extra a destacar com radar pings (ex.: o nó em incidente). */
  pingIds?: string[]
  /** Congela o tráfego/fluxo (mantém a malha estática). */
  paused?: boolean
  /** Multiplicador de velocidade dos pacotes. Default: 1. */
  speed?: number
  /** Quantidade de pacotes em trânsito. Default: 64. */
  particleCount?: number
  /** Cores do nó (borda/glow) por status. */
  statusColors?: Record<ServiceMeshStatus, string>
  /** Cores dos pacotes/fluxo por severidade do trecho. */
  packetColors?: Record<ServiceMeshStatus, string>
  /** Rótulos de status (usados no aria-label dos nós). */
  statusLabels?: Record<ServiceMeshStatus, string>
  /** Callback ao clicar num nó. */
  onSelect?: (id: string) => void
}

const DEFAULT_STATUS_COLORS: Record<ServiceMeshStatus, string> = {
  healthy: "#10b981",
  degraded: "#f59e0b",
  critical: "#f43f5e",
}

const DEFAULT_PACKET_COLORS: Record<ServiceMeshStatus, string> = {
  healthy: "#38bdf8",
  degraded: "#f59e0b",
  critical: "#fb3a5d",
}

const DEFAULT_STATUS_LABELS: Record<ServiceMeshStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  critical: "Critical",
}

const STATUS_RANK: Record<ServiceMeshStatus, number> = {
  healthy: 0,
  degraded: 1,
  critical: 2,
}

type Point = { x: number; y: number }
type EdgeGeo = { from: Point; c: Point; to: Point }

/** mulberry32 — PRNG determinístico (0..1) para distribuir os pacotes. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function worse(a: ServiceMeshStatus, b: ServiceMeshStatus): ServiceMeshStatus {
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b
}

/** Ponto de controle da curva: meio do segmento deslocado na perpendicular. */
function edgeControl(from: Point, to: Point, bow: number): Point {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  return { x: mx + (-dy / len) * bow, y: my + (dx / len) * bow }
}

/** Posição em t∈[0,1] de uma bézier quadrática P0–C–P1. */
function quadAt(p0: Point, c: Point, p1: Point, t: number): Point {
  const u = 1 - t
  const a = u * u
  const b = 2 * u * t
  const d = t * t
  return { x: a * p0.x + b * c.x + d * p1.x, y: a * p0.y + b * c.y + d * p1.y }
}

function edgePathD(from: Point, c: Point, to: Point): string {
  return `M ${from.x} ${from.y} Q ${c.x} ${c.y} ${to.x} ${to.y}`
}

function MeshNode({
  node,
  selected,
  pinging,
  color,
  statusLabel,
  glowId,
  radarClass,
  onSelect,
}: {
  node: ServiceMeshNode
  selected: boolean
  pinging: boolean
  color: string
  statusLabel: string
  glowId: string
  radarClass: string
  onSelect?: (id: string) => void
}) {
  const status = node.status ?? "healthy"
  const w = 124
  const h = 46
  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      onClick={onSelect ? () => onSelect(node.id) : undefined}
      style={{ cursor: onSelect ? "pointer" : undefined }}
      role={onSelect ? "button" : undefined}
      aria-label={`${node.label} — ${statusLabel}`}
    >
      {/* radar pings (atenção: selecionado ou em alarme) */}
      {pinging && (
        <>
          <circle r={26} fill="none" stroke={color} strokeWidth={2} className={radarClass} />
          <circle r={26} fill="none" stroke={color} strokeWidth={2} className={radarClass} style={{ animationDelay: "1.3s" }} />
        </>
      )}
      {selected && (
        <rect
          x={-w / 2 - 6}
          y={-h / 2 - 6}
          width={w + 12}
          height={h + 12}
          rx={14}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1.6}
          strokeDasharray="5 5"
          opacity={0.9}
        />
      )}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={11}
        fill="var(--card)"
        stroke={status === "healthy" ? "var(--border)" : color}
        strokeWidth={status === "healthy" ? 1 : 1.5}
        style={status === "healthy" ? undefined : { filter: `drop-shadow(0 0 5px ${color})` }}
      />
      <rect x={-w / 2} y={-h / 2} width={4} height={h} rx={2} fill={color} />
      <circle cx={w / 2 - 12} cy={-h / 2 + 12} r={3.4} fill={color} filter={`url(#${glowId})`} />
      <text x={-w / 2 + 14} y={node.meta != null ? -3 : 5} fill="var(--foreground)" fontSize={13} fontWeight={600}>
        {node.label}
      </text>
      {node.meta != null && (
        <text x={-w / 2 + 14} y={14} fill="var(--muted-foreground)" fontSize={10.5} fontFamily="ui-monospace, monospace">
          {node.meta}
        </text>
      )}
    </g>
  )
}

function ServiceMesh({
  nodes,
  edges,
  width = 1000,
  height = 560,
  selectedId = null,
  pingIds,
  paused = false,
  speed = 1,
  particleCount = 64,
  statusColors = DEFAULT_STATUS_COLORS,
  packetColors = DEFAULT_PACKET_COLORS,
  statusLabels = DEFAULT_STATUS_LABELS,
  onSelect,
  className,
  style,
  ...props
}: ServiceMeshProps) {
  const rawId = React.useId()
  const uid = `sm-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`
  const glowId = `${uid}-glow`
  const gridId = `${uid}-grid`
  const scopeId = `${uid}-scope`
  const radarClass = `${uid}-radar-ring`
  const flowClass = `${uid}-flow-edge`

  const nodeMap = React.useMemo(() => {
    const m = new Map<string, ServiceMeshNode>()
    for (const n of nodes) m.set(n.id, n)
    return m
  }, [nodes])

  const geo = React.useMemo<EdgeGeo[]>(
    () =>
      edges.map((e) => {
        const a = nodeMap.get(e.from)
        const b = nodeMap.get(e.to)
        const from = { x: a?.x ?? 0, y: a?.y ?? 0 }
        const to = { x: b?.x ?? 0, y: b?.y ?? 0 }
        return { from, c: edgeControl(from, to, e.bow ?? 0), to }
      }),
    [edges, nodeMap],
  )

  // refs lidos pelo rAF (mantêm o loop estável durante todo o ciclo de vida)
  const nodeMapRef = React.useRef(nodeMap)
  const edgesRef = React.useRef(edges)
  const geoRef = React.useRef(geo)
  const runningRef = React.useRef(!paused)
  const speedRef = React.useRef(speed)
  const packetColorsRef = React.useRef(packetColors)
  nodeMapRef.current = nodeMap
  edgesRef.current = edges
  geoRef.current = geo
  runningRef.current = !paused
  speedRef.current = speed
  packetColorsRef.current = packetColors

  const particlesRef = React.useRef<{ e: number; t: number; sp: number }[]>([])
  const lineRefs = React.useRef<(SVGLineElement | null)[]>([])

  // (re)inicializa o pool de pacotes quando a quantidade muda
  if (particlesRef.current.length !== particleCount) {
    const rng = mulberry32(1337)
    const next: { e: number; t: number; sp: number }[] = []
    const edgeN = Math.max(1, edges.length)
    for (let i = 0; i < particleCount; i++) {
      next.push({ e: Math.floor(rng() * edgeN), t: rng(), sp: 0.16 + rng() * 0.24 })
    }
    particlesRef.current = next
  }

  React.useEffect(() => {
    const rng = mulberry32(0xc0ffee)
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 1000
      last = now
      if (runningRef.current) {
        const map = nodeMapRef.current
        const eds = edgesRef.current
        const g = geoRef.current
        const ps = particlesRef.current
        const colors = packetColorsRef.current
        const sp = Math.max(0.1, speedRef.current)
        let total = 0
        for (const e of eds) total += map.get(e.from)?.weight ?? 1
        if (total <= 0) total = eds.length || 1
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i]
          p.t += p.sp * sp * dt
          if (p.t >= 1) {
            p.t -= 1
            let pick = rng() * total
            let chosen = 0
            for (let k = 0; k < eds.length; k++) {
              pick -= map.get(eds[k].from)?.weight ?? 1
              if (pick <= 0) {
                chosen = k
                break
              }
            }
            p.e = chosen
            p.sp = 0.16 + rng() * 0.26
          }
          const ge = g[p.e]
          const el = lineRefs.current[i]
          if (!ge || !el) continue
          const head = quadAt(ge.from, ge.c, ge.to, p.t)
          const tail = quadAt(ge.from, ge.c, ge.to, Math.max(0, p.t - 0.05))
          const edge = eds[p.e]
          const sev = worse(
            map.get(edge.from)?.status ?? "healthy",
            map.get(edge.to)?.status ?? "healthy",
          )
          el.setAttribute("x1", tail.x.toFixed(1))
          el.setAttribute("y1", tail.y.toFixed(1))
          el.setAttribute("x2", head.x.toFixed(1))
          el.setAttribute("y2", head.y.toFixed(1))
          el.setAttribute("stroke", colors[sev])
          el.setAttribute("stroke-width", sev === "healthy" ? "3" : "4")
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg
      data-slot="service-mesh"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("block w-full", className)}
      style={{ aspectRatio: `${width} / ${height}`, ...style }}
      {...props}
    >
      <defs>
        <style>{`
@keyframes ${uid}-radar { 0% { transform: scale(0.45); opacity: 0.55; } 100% { transform: scale(2.6); opacity: 0; } }
@keyframes ${uid}-flow { to { stroke-dashoffset: -24; } }
.${radarClass} { transform-box: fill-box; transform-origin: center; animation: ${uid}-radar 2.6s ease-out infinite; }
.${flowClass} { stroke-dasharray: 3 9; animation: ${uid}-flow 0.7s linear infinite; }
`}</style>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.6" opacity="0.5" />
        </pattern>
        <radialGradient id={scopeId} cx="50%" cy="46%" r="65%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="var(--background)" stopOpacity="0.65" />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={width} height={height} fill={`url(#${gridId})`} />

      {/* arestas: base + fluxo tracejado + tinta de severidade */}
      {edges.map((e, i) => {
        const sev = worse(
          nodeMap.get(e.from)?.status ?? "healthy",
          nodeMap.get(e.to)?.status ?? "healthy",
        )
        const d = edgePathD(geo[i].from, geo[i].c, geo[i].to)
        return (
          <g key={e.id ?? `${e.from}-${e.to}-${i}`}>
            <path d={d} fill="none" stroke="var(--border)" strokeWidth={2.4} strokeLinecap="round" />
            <path
              d={d}
              fill="none"
              stroke={sev === "healthy" ? packetColors.healthy : statusColors[sev]}
              strokeWidth={1.4}
              strokeLinecap="round"
              opacity={0.5}
              className={!paused ? flowClass : undefined}
            />
            {sev !== "healthy" && (
              <path d={d} fill="none" stroke={statusColors[sev]} strokeWidth={3} strokeLinecap="round" opacity={0.28} />
            )}
          </g>
        )
      })}

      {/* pacotes de tráfego (com cauda de cometa) */}
      <g filter={`url(#${glowId})`}>
        {Array.from({ length: particleCount }, (_, i) => (
          <line
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el
            }}
            x1={-10}
            y1={-10}
            x2={-10}
            y2={-10}
            stroke={packetColors.healthy}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* nós */}
      {nodes.map((n) => {
        const status = n.status ?? "healthy"
        const pinging =
          selectedId === n.id || status === "critical" || (pingIds?.includes(n.id) ?? false)
        return (
          <MeshNode
            key={n.id}
            node={n}
            selected={selectedId === n.id}
            pinging={pinging}
            color={statusColors[status]}
            statusLabel={statusLabels[status]}
            glowId={glowId}
            radarClass={radarClass}
            onSelect={onSelect}
          />
        )
      })}

      {/* vinheta de escopo */}
      <rect x={0} y={0} width={width} height={height} fill={`url(#${scopeId})`} pointerEvents="none" />
    </svg>
  )
}

export { ServiceMesh }
