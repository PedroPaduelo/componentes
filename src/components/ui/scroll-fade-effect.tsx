import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { scrollFadeEffectVariants } from "@/components/ui/scroll-fade-effect-variants"

// ─── Tipos públicos ────────────────────────────────────────────────

export type ScrollFadeEffectOrientation = "vertical" | "horizontal"

export type ScrollFadeEffectProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  VariantProps<typeof scrollFadeEffectVariants> & {
    /** Conteúdo renderizado dentro do container scrollável. */
    children: React.ReactNode

    /**
     * Direção do scroll.
     * @default "vertical"
     */
    orientation?: ScrollFadeEffectOrientation

    /**
     * Altura do gradiente de fade em pixels.
     * @default 32
     */
    fadeHeight?: number

    /**
     * Cor de fundo usada no gradiente de fade.
     * Se não informada, usa `var(--background)` do tema shadcn.
     */
    fadeColor?: string
  }

// ─── Componente ────────────────────────────────────────────────────

function ScrollFadeEffect({
  children,
  orientation = "vertical",
  fadeHeight = 32,
  // `fadeColor` é aceito na API pública mas não é mais necessário: a mask
  // CSS resolve a cor do fade automaticamente a partir do contexto.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fadeColor: _fadeColor,
  variant,
  className,
  ...hostProps
}: ScrollFadeEffectProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const isVertical = orientation === "vertical"

  // CSS mask: aplica gradiente para criar o fade nas bordas
  const maskStyle = React.useMemo<React.CSSProperties>(() => {
    const fh = `${fadeHeight}px`
    if (isVertical) {
      return {
        maskImage: `linear-gradient(to bottom, transparent 0, black ${fh}, black calc(100% - ${fh}), transparent 100%)`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent 0, black ${fh}, black calc(100% - ${fh}), transparent 100%)`,
      }
    }
    return {
      maskImage: `linear-gradient(to right, transparent 0, black ${fh}, black calc(100% - ${fh}), transparent 100%)`,
      WebkitMaskImage: `linear-gradient(to right, transparent 0, black ${fh}, black calc(100% - ${fh}), transparent 100%)`,
    }
  }, [fadeHeight, isVertical])

  return (
    <div
      data-slot="scroll-fade-effect"
      data-orientation={orientation}
      className={cn(
        scrollFadeEffectVariants({ variant, className })
      )}
      {...hostProps}
    >
      <div
        ref={scrollRef}
        className={cn(
          "relative",
          isVertical ? "overflow-y-auto" : "overflow-x-auto",
          "h-full w-full"
        )}
        style={maskStyle}
      >
        {children}
      </div>
    </div>
  )
}

export { ScrollFadeEffect }
