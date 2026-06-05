import * as React from "react"
import { Check, Copy } from "lucide-react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"

export type CopyButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> &
  VariantProps<typeof buttonVariants> & {
    /** Texto (ou código) a ser copiado para a área de transferência. */
    value: string
    /** Label exibido ao lado do ícone. Default: "Copiar". */
    label?: string
    /** Callback disparado após copiar com sucesso. */
    onCopy?: () => void
    /** Duração (ms) do feedback visual. Default 2000. */
    feedbackMs?: number
  }

function CopyButton({
  value,
  label = "Copiar",
  onCopy,
  feedbackMs = 2000,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timerRef = React.useRef<number | null>(null)

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  React.useEffect(() => clearTimer, [clearTimer])

  const handleClick = React.useCallback(async () => {
    clearTimer()
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(value)
      } else {
        // Fallback: textarea temporário + execCommand
        const textarea = document.createElement("textarea")
        textarea.value = value
        textarea.setAttribute("readonly", "")
        textarea.style.position = "absolute"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.select()
        const ok = document.execCommand("copy")
        document.body.removeChild(textarea)
        if (!ok) throw new Error("execCommand copy failed")
      }
      setCopied(true)
      onCopy?.()
      timerRef.current = window.setTimeout(() => {
        setCopied(false)
        timerRef.current = null
      }, feedbackMs)
    } catch {
      // Silently fail — o usuário pode tentar de novo
    }
  }, [value, feedbackMs, onCopy, clearTimer])

  const Icon = copied ? Check : Copy
  const displayLabel = copied ? "Copiado!" : label

  return (
    <button
      type="button"
      data-slot="copy-button"
      className={cn(
        buttonVariants({ variant, size }),
        "transition-colors",
        copied && "text-emerald-600 dark:text-emerald-400",
        className,
      )}
      onClick={handleClick}
      aria-live="polite"
      aria-label={displayLabel}
      {...props}
    >
      <Icon className="size-3.5" />
      {displayLabel}
    </button>
  )
}

export { CopyButton }
