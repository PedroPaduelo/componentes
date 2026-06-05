import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme/theme-provider"
import { cn } from "@/lib/utils"

export type ThemeToggleEffectProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> & {
  /** Ativa ou desativa o efeito visual de transição. Default: true. */
  withEffect?: boolean
}

function ThemeToggleEffect({
  withEffect = true,
  className,
  ...props
}: ThemeToggleEffectProps) {
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark"

    if (!withEffect || !document.startViewTransition) {
      setTheme(next)
      return
    }

    const transition = document.startViewTransition(() => {
      setTheme(next)
    })

    transition.ready.then(() => {
      const root = document.documentElement
      const { innerWidth, innerHeight } = window
      const maxDim = Math.max(innerWidth, innerHeight)

      root.animate(
        {
          clipPath: [
            `circle(0px at ${innerWidth / 2}px ${innerHeight / 2}px)`,
            `circle(${maxDim}px at ${innerWidth / 2}px ${innerHeight / 2}px)`,
          ],
        },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      )
    })
  }

  return (
    <button
      type="button"
      data-slot="theme-toggle-effect"
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
