/**
 * ActivityFeed — lista de eventos recentes (feed) com avatar e timestamp.
 *
 * Cada item mostra o avatar do ator e uma frase "{ator} {ação} {alvo}" com o
 * timestamp relativo logo abaixo. Itens são separados por divisória, num
 * container rolável de altura limitada — ideal para o card "Atividade recente"
 * de um dashboard.
 *
 * Extraído da composição `saas-dashboard-pro`. SHARED — sem dependências novas
 * além de Avatar, sem estado. O elemento raiz expõe `data-slot="activity-feed"`
 * e aceita className/props padrão de um <div>.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/** Um evento do feed: ator, ação, alvo opcional e timestamp. */
export interface ActivityFeedItem {
  /** Identificador único (usado como key). */
  id: string
  /** Nome do ator. */
  name: string
  /** Ação realizada (texto secundário, ex.: "fez upgrade para"). */
  action: string
  /** Alvo da ação, destacado (ex.: "Enterprise"). Opcional. */
  target?: string
  /** Timestamp relativo (ex.: "há 4 min"). */
  time: string
  /** URL do avatar do ator. Sem ela, mostra só o fallback. */
  avatar?: string
  /** Texto do fallback do avatar. Default: as 2 primeiras letras do nome. */
  fallback?: string
}

export interface ActivityFeedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Eventos do feed, do mais recente ao mais antigo. */
  items: ActivityFeedItem[]
}

function ActivityFeed({ items, className, ...props }: ActivityFeedProps) {
  return (
    <div
      data-slot="activity-feed"
      className={cn("max-h-[280px] overflow-y-auto pr-1", className)}
      {...props}
    >
      <ul className="flex flex-col">
        {items.map((item, i) => (
          <li
            key={item.id}
            className={cn(
              "flex items-center gap-3 py-3",
              i === 0 ? "pt-0" : "",
              i === items.length - 1 ? "pb-0" : "border-b border-border"
            )}
          >
            <Avatar className="size-9 border border-border">
              {item.avatar ? (
                <AvatarImage src={item.avatar} alt={item.name} />
              ) : null}
              <AvatarFallback>
                {item.fallback ?? item.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">
                <span className="font-medium">{item.name}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>
                {item.target ? (
                  <>
                    {" "}
                    <span className="font-medium">{item.target}</span>
                  </>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { ActivityFeed }
