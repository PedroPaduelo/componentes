import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CopyPromptButtonProps = {
  /** Markdown a ser copiado pro clipboard. */
  prompt: string
  /** Duração (ms) do estado "Copiado!". Default 2000. */
  feedbackMs?: number
  className?: string
}

/**
 * Botão "Copiar prompt" — copia um markdown estruturado pro clipboard
 * com tudo que uma IA precisa pra trabalhar com o componente.
 *
 * Aparece no topo de cada página de componente (`/components/:slug`),
 * alinhado à direita ao lado dos badges.
 *
 * Reusa a mesma mecânica de clipboard de `CopyButton`:
 *  - navigator.clipboard.writeText (com fallback execCommand)
 *  - try/catch + feedback de erro temporário
 *  - cleanup do setTimeout no unmount
 *  - aria-live="polite" + aria-label dinâmico
 *  - estado "Copiado!" com borda + texto emerald (transição suave)
 *
 * Diferenças em relação ao `CopyButton`:
 *  - Label padrão "Copiar prompt" / "Copiado!" (não "Copiar")
 *  - Sempre renderiza o label (não tem modo iconOnly — fica ao lado dos badges)
 *  - Aceita `prompt: string` em vez de `value: string` (semântica do caso de uso)
 */
export function CopyPromptButton({
  prompt,
  feedbackMs = 2000,
  className,
}: CopyPromptButtonProps) {
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
        await navigator.clipboard.writeText(prompt)
      } else {
        // Fallback mínimo (ambientes sem clipboard API): textarea + execCommand.
        const textarea = document.createElement("textarea")
        textarea.value = prompt
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
  }, [prompt, feedbackMs, clearTimer])

  const label = error ? "Falhou" : copied ? "Copiado!" : "Copiar prompt"
  const Icon = error ? Copy : copied ? Check : Copy

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-slot="copy-prompt-button"
      onClick={onClick}
      aria-live="polite"
      aria-label={label}
      className={cn(
        "transition-colors",
        copied && "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
        error && "border-destructive/40 text-destructive",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </Button>
  )
}
