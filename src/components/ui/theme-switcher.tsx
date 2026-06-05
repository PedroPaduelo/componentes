import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/components/theme/theme-provider"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export type ThemeOption = "light" | "dark" | "system"

const themeOptions: { value: ThemeOption; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export interface ThemeSwitcherProps {
  /** Classes adicionais para o botão trigger. */
  className?: string
}

/**
 * Seletor de tema com dropdown (Light / Dark / System).
 *
 * Reusa o `useTheme()` do `ThemeProvider` caseiro da vitrine.
 * O ícone do botão reflete o tema atualmente ativo.
 */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const currentIcon =
    theme === "system" ? Monitor : theme === "dark" ? Moon : Sun
  const Icon = currentIcon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className
        )}
        aria-label="Toggle theme"
      >
        <Icon className="size-4" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.map((option) => {
          const OptionIcon = option.icon
          const isActive = theme === option.value
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex items-center gap-2",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <OptionIcon className="size-4" />
              <span className="flex-1">{option.label}</span>
              {isActive && (
                <span className="text-xs text-muted-foreground">
                  {resolvedTheme === "dark" ? "🌙" : "☀️"}
                </span>
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
