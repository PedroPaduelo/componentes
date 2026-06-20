/**
 * TrackerTremor — faixa horizontal de blocos coloridos (estilo GitHub
 * contributions / calendário de uso). Cada bloco pode ter tooltip via
 * HoverCard do Radix.
 *
 * Adaptado do Tremor Raw (https://github.com/tremorlabs/tremor/blob/main/src/components/Tracker/Tracker.tsx)
 * para o padrão Vitrine:
 *   • `cn()` de `@/lib/utils` → `cx()` de `@/lib/tremor-utils`.
 *   • `forwardRef` + `displayName`, JSX raiz com `data-slot="tracker-tremor"`
 *     e `tremor-id="tremor-raw"` (mantido! permite ao validador distinguir Tremor).
 *   • Sem `"use client"` (não usamos Next.js).
 *   • Exporta `TrackerTremor` / `TrackerTremorBlock` / `TrackerTremorProps`
 *     para casar com a nomenclatura `-tremor` do restante da onda.
 *   • Tailwind v4: classes Tremor copiadas 1:1 (literais, sem interpolação).
 *
 * Mantém 100% da API e do visual do Tremor: blocos arredondados nas pontas,
 * HoverCard escuro (`bg-gray-900 dark:bg-gray-50`), `hoverEffect` opcional,
 * cores por bloco via prop `color`.
 */

import * as React from "react"
import * as HoverCardPrimitives from "@radix-ui/react-hover-card"

import { cx } from "@/lib/tremor-utils"

/**
 * Props de um bloco individual do Tracker.
 *
 * `key` aceita `string | number` (mesma semântica do Tremor original — usado
 * como `key` do React no map do `TrackerTremor`). NÃO é a `key` reservada
 * do React (essa é stripada via `key={props.key ?? index}` no map).
 */
export interface TrackerTremorBlock {
  key?: string | number
  color?: string
  tooltip?: string
  hoverEffect?: boolean
  defaultBackgroundColor?: string
}

const TrackerTremorBlockView = ({
  color,
  tooltip,
  defaultBackgroundColor,
  hoverEffect,
}: TrackerTremorBlock) => {
  const [open, setOpen] = React.useState(false)
  return (
    <HoverCardPrimitives.Root
      open={open}
      onOpenChange={setOpen}
      openDelay={0}
      closeDelay={0}
    >
      <HoverCardPrimitives.Trigger onClick={() => setOpen(true)} asChild>
        <div className="size-full overflow-hidden px-[0.5px] transition first:rounded-l-[4px] first:pl-0 last:rounded-r-[4px] last:pr-0 sm:px-px">
          <div
            className={cx(
              "size-full rounded-[1px]",
              color || defaultBackgroundColor,
              hoverEffect ? "hover:opacity-50" : ""
            )}
          />
        </div>
      </HoverCardPrimitives.Trigger>
      {tooltip ? (
        <HoverCardPrimitives.Portal>
          <HoverCardPrimitives.Content
            sideOffset={10}
            side="top"
            align="center"
            avoidCollisions
            className={cx(
              // base
              "w-auto rounded-md px-2 py-1 text-sm shadow-md",
              // text color
              "text-white dark:text-gray-900",
              // background color
              "bg-gray-900 dark:bg-gray-50"
            )}
          >
            {tooltip}
          </HoverCardPrimitives.Content>
        </HoverCardPrimitives.Portal>
      ) : null}
    </HoverCardPrimitives.Root>
  )
}

TrackerTremorBlockView.displayName = "TrackerTremorBlock"

export interface TrackerTremorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  data: TrackerTremorBlock[]
  defaultBackgroundColor?: string
  hoverEffect?: boolean
}

const TrackerTremor = React.forwardRef<HTMLDivElement, TrackerTremorProps>(
  (
    {
      data = [],
      defaultBackgroundColor = "bg-gray-400 dark:bg-gray-400",
      className,
      hoverEffect,
      ...props
    },
    forwardedRef
  ) => {
    return (
      <div
        ref={forwardedRef}
        data-slot="tracker-tremor"
        tremor-id="tremor-raw"
        className={cx("group flex h-8 w-full items-center", className)}
        {...props}
      >
        {data.map((block, index) => (
          <TrackerTremorBlockView
            key={block.key ?? index}
            defaultBackgroundColor={defaultBackgroundColor}
            hoverEffect={hoverEffect}
            {...block}
          />
        ))}
      </div>
    )
  }
)

TrackerTremor.displayName = "TrackerTremor"

export { TrackerTremor }
