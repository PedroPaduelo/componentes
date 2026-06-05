import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"
import {
  type ThemeToggleEffectVariant,
  getVariantKeyframes,
  getVariantOptions,
  getVariantOrigin,
} from "@/components/ui/theme-toggle-effect-variants"

export type ThemeToggleEffectProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> & {
  /** Ativa ou desativa o efeito visual de transição. Default: true. */
  withEffect?: boolean
  /**
   * Variante de animação do toggle.
   * @default "circle"
   */
  variant?: ThemeToggleEffectVariant
}

function ThemeToggleEffect({
  withEffect = true,
  variant = "circle",
  className,
  ...props
}: ThemeToggleEffectProps) {
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = resolvedTheme === "dark" ? "light" : "dark"

    if (!withEffect || !document.startViewTransition) {
      setTheme(next)
      return
    }

    const buttonRect =
      event.currentTarget.getBoundingClientRect()

    const transition = document.startViewTransition(() => {
      setTheme(next)
    })

    transition.ready.then(() => {
      const root = document.documentElement
      const { innerWidth, innerHeight } = window
      const maxDim = Math.max(innerWidth, innerHeight)

      const origin = getVariantOrigin(
        variant,
        innerWidth,
        innerHeight,
        buttonRect,
      )

      const keyframes = getVariantKeyframes(variant, origin, maxDim)
      const options = getVariantOptions(variant)

      root.animate(keyframes, {
        ...options,
        pseudoElement: "::view-transition-new(root)",
      })
    })
  }

  return (
    <button
      type="button"
      data-slot="theme-toggle-effect"
      data-variant={variant}
      data-with-effect={withEffect ? "true" : "false"}
      aria-label="Alternar tema"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={toggleTheme}
      {...props}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
      <span className="sr-only">
        Tema atual: {resolvedTheme === "dark" ? "escuro" : "claro"}
      </span>
    </button>
  )
}

export { ThemeToggleEffect }
