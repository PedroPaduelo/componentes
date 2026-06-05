import { useEffect, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import type { LightLinesProps } from "./light-lines-types"

/**
 * LightLines — background animado de "light trails" em linhas verticais.
 *
 * Renderiza um SVG (viewBox `0 0 1920 1080`) com 17 luzes retangulares brancas
 * que se movem verticalmente em loop infinito (umas descendo, outras subindo),
 * sobre 17 linhas verticais estáticas translúcidas e um gradiente de fundo.
 * A animação é 100% `requestAnimationFrame` inline — zero dependências externas,
 * zero CSS global.
 *
 * Cores brand FIXAS por padrão (gradiente azul + luzes/linhas brancas) — decisão
 * intencional do lote VengenceUI: o efeito tem identidade visual própria e não
 * segue tokens semânticos do tema shadcn. Todas as cores são configuráveis.
 *
 * Os tipos públicos ficam em `./light-lines-types.ts` para satisfazer o lint
 * `react-refresh/only-export-components`.
 *
 * @example
 *   <div className="relative h-[320px] w-full overflow-hidden rounded-lg">
 *     <LightLines>
 *       <div className="relative z-10 flex h-full items-center justify-center text-2xl font-semibold text-white">
 *         Hero heading
 *       </div>
 *     </LightLines>
 *   </div>
 */

/** Número fixo de luzes animadas e de linhas verticais estáticas. */
const LIGHT_COUNT = 17
const LINE_COUNT = 17

/** Limites do viewBox. */
const VIEW_W = 1920
const VIEW_H = 1080

/** Dimensões das colunas onde luzes/linhas vivem. */
const COLUMN_GAP = VIEW_W / (LINE_COUNT + 1)
const LINE_WIDTH = 2
const LIGHT_WIDTH = 2
const LIGHT_HEIGHT = 180

/** Descritor estático de uma luz (posição da coluna + parâmetros do movimento). */
interface LightSpec {
  /** Coordenada X (centro da coluna) da luz. */
  x: number
  /** Direção: 1 desce, -1 sobe. */
  direction: number
  /** Velocidade base (px/segundo) antes do `speedMultiplier`. */
  speed: number
  /** Posição Y inicial (escalonada para não largarem todas juntas). */
  startY: number
}

/**
 * Gera a configuração determinística das luzes a partir das colunas.
 * Determinístico (sem `Math.random`) para SSR/hidratação estáveis e para que o
 * `code` dos examples reflita exatamente o render.
 */
function buildLights(): LightSpec[] {
  const lights: LightSpec[] = []
  for (let i = 0; i < LIGHT_COUNT; i++) {
    const column = (i % LINE_COUNT) + 1
    const x = column * COLUMN_GAP
    const direction = i % 2 === 0 ? 1 : -1
    // Velocidades variadas (220..360 px/s) em padrão determinístico.
    const speed = 220 + ((i * 53) % 140)
    // Espalha as posições iniciais ao longo do range vertical estendido.
    const span = VIEW_H + LIGHT_HEIGHT
    const startY = -LIGHT_HEIGHT + ((i * span) / LIGHT_COUNT)
    lights.push({ x, direction, speed, startY })
  }
  return lights
}

export function LightLines({
  className,
  linesOpacity = 0.05,
  lightsOpacity = 0.9,
  speedMultiplier = 1,
  gradientFrom = "#2462F6",
  gradientTo = "#5999F8",
  lightColor = "#fff",
  lineColor = "#fff",
  children,
}: LightLinesProps) {
  // Refs para cada `<rect>` de luz — manipuladas no loop via setAttribute.
  const lightRefs = useRef<(SVGRectElement | null)[]>([])

  // Specs estáticos das luzes (recriados só se as constantes mudarem — nunca).
  const lights = useMemo(() => buildLights(), [])

  // Props dinâmicas lidas pelo loop via ref auxiliar: evita reiniciar o rAF
  // (e o "piscar") a cada mudança de prop/hover/state.
  const dynamicRef = useRef({ speedMultiplier, lightsOpacity })
  dynamicRef.current = { speedMultiplier, lightsOpacity }

  useEffect(() => {
    let raf = 0
    let prev = performance.now()
    // Estado mutável da posição Y de cada luz (cópia dos startY).
    const ys = lights.map((l) => l.startY)
    const span = VIEW_H + LIGHT_HEIGHT

    const loop = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      const mult = dynamicRef.current.speedMultiplier

      for (let i = 0; i < lights.length; i++) {
        const spec = lights[i]
        let y = ys[i] + spec.direction * spec.speed * mult * dt
        // Wrap contínuo dentro do range estendido [-LIGHT_HEIGHT, VIEW_H].
        if (y > VIEW_H) {
          y -= span
        } else if (y < -LIGHT_HEIGHT) {
          y += span
        }
        ys[i] = y
        const node = lightRefs.current[i]
        if (node) {
          node.setAttribute("y", String(y))
        }
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
    }
  }, [lights])

  return (
    <div
      data-slot="light-lines"
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* Linhas verticais estáticas translúcidas */}
        {Array.from({ length: LINE_COUNT }, (_, i) => {
          const x = (i + 1) * COLUMN_GAP
          return (
            <rect
              key={`line-${i}`}
              className={`line${i + 1}`}
              x={x - LINE_WIDTH / 2}
              y={0}
              width={LINE_WIDTH}
              height={VIEW_H}
              fill={lineColor}
              opacity={linesOpacity}
            />
          )
        })}

        {/* Luzes animadas (movidas via rAF no setAttribute "y") */}
        {lights.map((spec, i) => (
          <rect
            key={`light-${i}`}
            ref={(el) => {
              lightRefs.current[i] = el
            }}
            className={`light${i + 1}`}
            x={spec.x - LIGHT_WIDTH / 2}
            y={spec.startY}
            width={LIGHT_WIDTH}
            height={LIGHT_HEIGHT}
            rx={LIGHT_WIDTH / 2}
            fill={lightColor}
            opacity={lightsOpacity}
          />
        ))}
      </svg>

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}
