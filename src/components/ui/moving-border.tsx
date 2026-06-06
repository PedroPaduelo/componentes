import * as React from "react"
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

export type MovingBorderProps = {
  /** Conteúdo que viaja ao longo do perímetro (ex.: bola de gradiente). */
  children: React.ReactNode
  /** Duração (ms) de uma volta completa ao longo do perímetro. Default: 3000. */
  duration?: number
  /** Raio-X do `<rect>` invisível que define o caminho SVG. Default: "30%". */
  rx?: string
  /** Raio-Y do `<rect>` invisível que define o caminho SVG. Default: "30%". */
  ry?: string
  /** Props adicionais aplicadas ao `<svg>` que define o caminho. */
  svgProps?: React.SVGAttributes<SVGSVGElement>
}

/**
 * MovingBorder (Aceternity UI) — núcleo que renderiza um SVG invisível
 * (`<rect>` 100%×100% com `rx`/`ry`) percorrido por um `motion.div` filho
 * (`children`). A cada frame de animação, `useAnimationFrame` calcula o
 * comprimento do `<rect>` e move um `useMotionValue<number>` (progress) de 0
 * a `length`. `useTransform` mapeia esse progresso num par (x, y) usando
 * `getPointAtLength(progress)` e o template `translateX/Y(...)` desloca o
 * `children` exatamente sobre o perímetro do retângulo, com `translateX/Y
 * -50%)` para centralizar o "ponteiro" no traço.
 *
 * O `pathRef` precisa ser `<rect>` (não `<path>`) porque o Aceternity usa o
 * perímetro do retângulo (mais previsível que um `<path>` calculado). A
 * referência tipada como `SVGRectElement` ativa `getTotalLength()` e
 * `getPointAtLength()` da SVGGeometryElement.
 *
 * Renderiza um Fragment (svg + motion.div) — sem `data-slot` próprio. O
 * `data-slot="moving-border"` fica no **wrapper** (`MovingBorderButton`).
 */
function MovingBorder({
  children,
  duration = 3000,
  rx,
  ry,
  svgProps,
}: MovingBorderProps) {
  const pathRef = React.useRef<SVGRectElement>(null)
  const progress = useMotionValue<number>(0)

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength()
    if (length) {
      const pxPerMillisecond = length / duration
      progress.set((time * pxPerMillisecond) % length)
    }
  })

  const x = useTransform(progress, (val) => {
    const point = pathRef.current?.getPointAtLength(val)
    return point?.x ?? 0
  })
  const y = useTransform(progress, (val) => {
    const point = pathRef.current?.getPointAtLength(val)
    return point?.y ?? 0
  })

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...svgProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  )
}

/**
 * Polimórfico: `T` é inferido a partir de `as` (default `"button"`), e o
 * spread propaga as props HTML do elemento escolhido (ex.: `href`/`target`
 * para `as="a"`, `type`/`disabled` para `as="button"`). Mesmo padrão do
 * `HoverBorderGradient` Aceternity.
 */
export type MovingBorderButtonProps<
  T extends React.ElementType = "button"
> = Omit<React.ComponentPropsWithoutRef<T>, "children"> & {
  /** Conteúdo do botão (texto/ícone). */
  children: React.ReactNode
  /** Raio da borda (CSS `border-radius`). Default: "1.75rem". */
  borderRadius?: string
  /** Elemento raiz a renderizar (polimórfico). Default: "button". */
  as?: T
  /** Classes extras aplicadas ao container externo (onde a borda se move). */
  containerClassName?: string
  /** Classes extras aplicadas à bola de gradiente que viaja. */
  borderClassName?: string
  /** Duração (ms) de uma volta completa. Default: 3000. */
  duration?: number
}

/**
 * MovingBorderButton (Aceternity UI) — wrapper polimórfico pronto para uso
 * que aplica a "borda que se move" do `MovingBorder` sobre um botão com
 * fundo escuro (slate-900), borda fina slate-800 e backdrop-blur. Cores são
 * fixas (brand do efeito), alinhado com glare-card / text-reveal-card /
 * hover-border-gradient.
 *
 * Estrutura: o container externo (radius=`borderRadius`) tem padding de 1px
 * (`p-[1px]`) e dentro dele um div absolute que renderiza o `MovingBorder`
 * com a "bola" gradiente. A camada visual do botão (texto, fundo escuro,
 * borda fina) é um div relativo por cima, com o mesmo border-radius
 * levemente menor (`* 0.96`) para o gradiente aparecer como uma borda de
 * ~1px no perímetro.
 */
function MovingBorderButton<T extends React.ElementType = "button">({
  borderRadius = "1.75rem",
  children,
  as,
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: MovingBorderButtonProps<T>) {
  const Component = (as ?? "button") as React.ElementType
  return (
    <Component
      data-slot="moving-border"
      className={cn(
        "relative h-16 w-40 overflow-hidden bg-transparent p-[1px] text-xl",
        containerClassName,
      )}
      style={{ borderRadius }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div
            className={cn(
              "h-20 w-20 bg-[radial-gradient(#0ea5e9_40%,transparent_60%)] opacity-[0.8]",
              borderClassName,
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center border border-slate-800 bg-slate-900/[0.8] text-sm text-white antialiased backdrop-blur-xl",
          className,
        )}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        {children}
      </div>
    </Component>
  )
}

export { MovingBorder, MovingBorderButton }
