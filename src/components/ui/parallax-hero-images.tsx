import { useEffect, useMemo, useRef } from "react"
import { motion, type TargetAndTransition } from "motion/react"
import { cn } from "@/lib/utils"
import type {
  ParallaxHeroImagesProps,
  ParallaxHeroVariant,
} from "./parallax-hero-images-types"

/**
 * ParallaxHeroImages — efeito parallax dirigido pelo mouse para hero sections.
 *
 * Cada imagem é posicionada em uma "profundidade" diferente e translada
 * proporcionalmente ao movimento do cursor: as imagens "mais próximas" (maior
 * fator de profundidade) se deslocam mais; as "mais distantes", menos — criando
 * o efeito de parallax. Na entrada (mount), cada imagem faz fade-in com blur.
 *
 * Implementação (padrão `light-lines.tsx`): o `mousemove` apenas grava a
 * posição-alvo normalizada num ref auxiliar; um único `requestAnimationFrame`
 * interpola suavemente (spring-like) em direção ao alvo e escreve o `transform`
 * de cada imagem via `style.transform` (inline, calculado em JS — NUNCA por
 * classe Tailwind interpolada, que seria purgada no build de produção). O
 * listener e o rAF têm cleanup no unmount; deps do effect são estáveis, então
 * o loop não reinicia a cada render.
 *
 * A entrada (opacity 0→1, blur 20px→0, scale 0.9→1) é declarativa via
 * `motion.div initial/animate`; o parallax (transform contínuo) é imperativo
 * via ref, de modo que ambos coexistem sem brigar (o motion controla a
 * `motion.div` externa; o parallax escreve numa `<div>` interna por ref).
 *
 * Os tipos públicos ficam em `./parallax-hero-images-types.ts` para satisfazer
 * o lint `react-refresh/only-export-components`.
 *
 * @example
 *   <div className="relative h-[420px] w-full overflow-hidden rounded-lg">
 *     <ParallaxHeroImages images={["https://picsum.photos/seed/a/400/300"]} />
 *   </div>
 */

/** Posições fixas (top + left/right) por índice — até 8 imagens. */
const POSITIONS: { top: string; left?: string; right?: string }[] = [
  { top: "8%", left: "4%" },
  { top: "8%", right: "4%" },
  { top: "38%", left: "6%" },
  { top: "38%", right: "6%" },
  { top: "68%", left: "4%" },
  { top: "68%", right: "4%" },
  { top: "52%", left: "2%" },
  { top: "52%", right: "2%" },
]

/**
 * Mapa de profundidade por índice e variante. Valores maiores = imagem "mais
 * próxima" (translada mais). `default` aproxima o miolo; `edge-focus` aproxima
 * as bordas — comportamento observavelmente distinto.
 */
const DEPTH_BY_VARIANT: Record<ParallaxHeroVariant, number[]> = {
  default: [0.3, 0.35, 0.9, 0.85, 0.4, 0.45, 0.25, 0.2],
  "edge-focus": [0.85, 0.9, 0.3, 0.35, 0.8, 0.85, 0.4, 0.45],
}

/** Deslocamento máximo (px) de uma imagem com profundidade 1. */
const MAX_OFFSET = 40

/** Fator de suavização do seguimento do cursor (0..1, por frame). */
const SMOOTHING = 0.12

/** Variante de entrada (mount): fade-in com blur — tipada para o motion v12. */
const ENTER_INITIAL = {
  opacity: 0,
  filter: "blur(20px)",
  scale: 0.9,
} as unknown as TargetAndTransition

const ENTER_ANIMATE = {
  opacity: 1,
  filter: "blur(0px)",
  scale: 1,
} as unknown as TargetAndTransition

export function ParallaxHeroImages({
  images,
  className,
  imageClassName,
  variant = "default",
}: ParallaxHeroImagesProps) {
  // Container raiz (define o sistema de coordenadas do parallax).
  const rootRef = useRef<HTMLDivElement | null>(null)
  // Refs das divs internas de cada imagem (onde o transform do parallax escreve).
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])

  // Descritor estático por imagem (posição + profundidade + delay de entrada).
  const items = useMemo(() => {
    const depths = DEPTH_BY_VARIANT[variant]
    return images.slice(0, 8).map((src, index) => ({
      src,
      position: POSITIONS[index],
      depth: depths[index],
      delay: index * 0.12,
    }))
  }, [images, variant])

  // Props dinâmicas lidas pelo loop via ref auxiliar: evita reiniciar o rAF e o
  // listener a cada render (mesmo padrão de light-lines.tsx).
  const dynamicRef = useRef({ items })
  dynamicRef.current = { items }

  useEffect(() => {
    let raf = 0
    // Posição-alvo do cursor normalizada em [-1, 1] (centro do container = 0).
    const target = { x: 0, y: 0 }
    // Posição atual suavizada (interpola em direção a `target`).
    const current = { x: 0, y: 0 }

    const handleMouseMove = (e: MouseEvent) => {
      const root = rootRef.current
      if (!root) return
      const rect = root.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      target.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      target.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
    }

    const loop = () => {
      current.x += (target.x - current.x) * SMOOTHING
      current.y += (target.y - current.y) * SMOOTHING
      const { items: layers } = dynamicRef.current
      for (let i = 0; i < layers.length; i++) {
        const node = layerRefs.current[i]
        if (!node) continue
        const depth = layers[i].depth
        const tx = current.x * MAX_OFFSET * depth
        const ty = current.y * MAX_OFFSET * depth
        node.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener("mousemove", handleMouseMove)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="parallax-hero-images"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {items.map((item, index) => (
        <motion.div
          key={`${item.src}-${index}`}
          className="absolute"
          style={{
            top: item.position.top,
            left: item.position.left,
            right: item.position.right,
            zIndex: Math.round(item.depth * 10),
          }}
          initial={ENTER_INITIAL}
          animate={ENTER_ANIMATE}
          transition={{
            duration: 0.8,
            delay: item.delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {/* Camada interna: o parallax escreve `transform` aqui via ref, sem
              brigar com a entrada animada da `motion.div` externa. */}
          <div
            ref={(el) => {
              layerRefs.current[index] = el
            }}
            data-parallax-layer={index}
            style={{ willChange: "transform" }}
          >
            <img
              src={item.src}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                "aspect-[4/3] h-20 w-32 rounded-lg object-cover shadow-sm ring-1 ring-black/10 sm:h-32 sm:w-48 md:h-40 md:w-60 dark:ring-white/10",
                imageClassName,
              )}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
