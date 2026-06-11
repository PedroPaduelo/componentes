import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CopyFetchButtonProps = {
  /** URL (mesma origem) cujo texto será buscado e copiado pro clipboard. */
  url: string
  /** Rótulo padrão. */
  label?: string
  /** Rótulo no estado "copiado". */
  copiedLabel?: string
  /** Duração (ms) do estado de feedback. Default 2000. */
  feedbackMs?: number
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
}

/**
 * Botão que BUSCA o texto de uma URL (fetch) e o copia pro clipboard.
 *
 * Usado para copiar conteúdos servidos como arquivos estáticos (ex.: o índice
 * `/llms.txt` ou uma skill `/skills/<slug>.md`) sem duplicar o conteúdo no
 * bundle — a fonte da verdade é o arquivo estático.
 *
 * Reusa a mecânica de clipboard do CopyButton (writeText + fallback
 * execCommand, feedback temporário, cleanup do timer no unmount) e adiciona um
 * estado de carregamento durante o fetch.
 */
export function CopyFetchButton({
  url,
  label = "Copiar",
  copiedLabel = "Copiado!",
  feedbackMs = 2000,
  variant = "outline",
  size = "sm",
  className,
}: CopyFetchButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">(
    "idle",
  )
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const copyText = useCallback(async (text: string) => {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text)
      return
    }
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.setAttribute("readonly", "")
    textarea.style.position = "absolute"
    textarea.style.left = "-9999px"
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(textarea)
    if (!ok) throw new Error("execCommand copy failed")
  }, [])

  const onClick = useCallback(async () => {
    clearTimer()
    setState("loading")
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      await copyText(text)
      setState("copied")
    } catch {
      setState("error")
    }
    timerRef.current = window.setTimeout(() => {
      setState("idle")
      timerRef.current = null
    }, feedbackMs)
  }, [url, copyText, clearTimer, feedbackMs])

  const currentLabel =
    state === "loading"
      ? "Copiando…"
      : state === "copied"
        ? copiedLabel
        : state === "error"
          ? "Falhou"
          : label
  const Icon =
    state === "loading" ? Loader2 : state === "copied" ? Check : Copy

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={state === "loading"}
      aria-live="polite"
      aria-label={currentLabel}
      className={cn(
        "transition-colors",
        state === "copied" &&
          "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
        state === "error" && "border-destructive/40 text-destructive",
        className,
      )}
    >
      <Icon className={cn("size-3.5", state === "loading" && "animate-spin")} />
      {currentLabel}
    </Button>
  )
}
