import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CopyButtonProps = {
  /** Texto a ser copiado. */
  value: string
  /** Duração (ms) do estado "Copiado!". Default 2000. */
  feedbackMs?: number
  /** Variante visual. Default "outline" (combina com CodeBlock). */
  variant?: React.ComponentProps<typeof Button>["variant"]
  /** Tamanho. Default "sm" (encaixa no canto do bloco de código). */
  size?: React.ComponentProps<typeof Button>["size"]
  /** Quando true, renderiza apenas o ícone (sem texto do label). Default false. */
  iconOnly?: boolean
  className?: string
}

/**
 * Botão que copia `value` via navigator.clipboard.writeText.
 *
 * - Em contexto seguro (https / localhost) usa a API nativa.
 * - Trata a Promise (try/catch) e dá feedback de erro temporário.
 * - O label muda para "Copiado!" + ícone Check por `feedbackMs` (default 2s).
 * - Auto-reset mesmo se o componente for desmontado durante o feedback
 *   (limpa o timer no effect de cleanup).
 */
export function CopyButton({
  value,
  feedbackMs = 2000,
  variant = "outline",
  size = "sm",
  iconOnly = false,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const onClick = useCallback(async () => {
    clearTimer()
    setError(false)
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(value)
      } else {
        // Fallback mínimo (ambientes sem clipboard API): textarea + execCommand.
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
      timerRef.current = window.setTimeout(() => {
        setCopied(false)
        timerRef.current = null
      }, feedbackMs)
    } catch {
      setError(true)
      timerRef.current = window.setTimeout(() => {
        setError(false)
        timerRef.current = null
      }, feedbackMs)
    }
  }, [value, feedbackMs, clearTimer])

  const label = error ? "Falhou" : copied ? "Copiado!" : "Copiar"
  const Icon = error ? Copy : copied ? Check : Copy

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      aria-live="polite"
      aria-label={label}
      title={iconOnly ? label : undefined}
      className={cn(
        "transition-colors",
        copied && "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
        error && "border-destructive/40 text-destructive",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {iconOnly ? null : label}
    </Button>
  )
}
