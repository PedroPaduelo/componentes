import type { ComponentOrigin } from "@/data/families"
import { ORIGIN_CLASSES } from "@/components/catalog/origin-meta"
import { cn } from "@/lib/utils"

type OriginBadgeProps = {
  origin: ComponentOrigin
  className?: string
}

/**
 * Badge colorido que identifica a ORIGEM de um componente/família.
 * Reutilizado no card do catálogo e no header de cada seção da página de família.
 */
export function OriginBadge({ origin, className }: OriginBadgeProps) {
  return (
    <span
      data-slot="origin-badge"
      data-origin={origin}
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ORIGIN_CLASSES[origin],
        className
      )}
    >
      {origin}
    </span>
  )
}
