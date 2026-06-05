import * as React from "react"
import { cn } from "@/lib/utils"

export type MiddleTruncationProps = React.HTMLAttributes<HTMLElement> & {
  /** Texto a ser truncado. */
  text: string
  /** Comprimento máximo antes de truncar (default 20). */
  maxLength?: number
  /** String de ellipsis (default "…"). */
  ellipsis?: string
  /** Tag HTML a renderizar (default "span"). */
  as?: "span" | "p" | "div"
  /** Se true, mostra tooltip no hover com texto completo (default true). */
  showTooltip?: boolean
}

/**
 * Trunca texto no meio, preservando início e fim.
 * Se `text.length <= maxLength`, retorna inteiro.
 * Senão, mantém `(maxLength - ellipsis.length) / 2` do início + ellipsis + mesmo tanto do fim.
 * Se ímpar, arredonda pro lado do início.
 */
function truncateMiddle(
  text: string,
  maxLength: number = 20,
  ellipsis: string = "…"
): string {
  if (text.length <= maxLength) return text

  const charsToShow = maxLength - ellipsis.length
  const startChars = Math.ceil(charsToShow / 2)
  const endChars = Math.floor(charsToShow / 2)

  return text.slice(0, startChars) + ellipsis + text.slice(-endChars)
}

function MiddleTruncation({
  text,
  maxLength = 20,
  ellipsis = "…",
  as: Tag = "span",
  showTooltip = true,
  className,
  ...props
}: MiddleTruncationProps) {
  const truncated = truncateMiddle(text, maxLength, ellipsis)

  return (
    <Tag
      data-slot="middle-truncation"
      title={showTooltip ? text : undefined}
      className={cn("inline", className)}
      {...props}
    >
      {truncated}
    </Tag>
  )
}

export { MiddleTruncation }
