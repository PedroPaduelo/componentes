/**
 * DashboardUserMenu — gatilho de avatar + DropdownMenu do usuário (topbar).
 *
 * Mostra o avatar do usuário (com chevron opcional) que abre um menu com um
 * cabeçalho de identidade (nome + e-mail) e uma lista de ações. As ações vêm por
 * props (`items`, cada uma com `id`/`label`/`icon?`) e disparam o callback
 * `onSelect(id)`; para casos mais livres, dá pra injetar conteúdo extra via
 * `children` no fim do menu.
 *
 * Extraído da composição `saas-dashboard-pro`. Usa Avatar e DropdownMenu do
 * barrel (viram registryDependency), sem estado próprio.
 */

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/** Uma ação do menu do usuário. */
export interface DashboardUserMenuItem {
  /** Identificador único (usado como key e passado ao `onSelect`). */
  id: string
  /** Rótulo da ação. */
  label: string
  /** Ícone opcional exibido antes do rótulo. */
  icon?: React.ComponentType<{ className?: string }>
  /** Estiliza o item como destrutivo (ex.: "Sair"). */
  destructive?: boolean
  /** Insere um separador ANTES deste item (ex.: para isolar o "Sair"). */
  separatorBefore?: boolean
}

export interface DashboardUserMenuProps {
  /** Nome do usuário (cabeçalho do menu + alt do avatar). */
  name: string
  /** E-mail/legenda do usuário (cabeçalho do menu). Opcional. */
  email?: string
  /** URL do avatar. Sem ela, mostra só o fallback. */
  avatar?: string
  /** Texto do fallback do avatar. Default: as 2 primeiras letras do nome. */
  fallback?: string
  /** Ações do menu. */
  items?: DashboardUserMenuItem[]
  /** Callback ao selecionar uma ação (recebe o `id`). */
  onSelect?: (id: string) => void
  /** Conteúdo livre, renderizado ao fim do menu (adição a `items`). */
  children?: React.ReactNode
  /** Mostra o chevron ao lado do avatar (oculto no mobile). Default: true. */
  showChevron?: boolean
  /** className do <button> gatilho. */
  className?: string
  /** Alinhamento do conteúdo do menu. Default: "end". */
  align?: "start" | "center" | "end"
}

function DashboardUserMenu({
  name,
  email,
  avatar,
  fallback,
  items,
  onSelect,
  children,
  showChevron = true,
  className,
  align = "end",
}: DashboardUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
          aria-label="Menu do usuário"
        >
          <Avatar className="size-8 border border-border">
            {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
            <AvatarFallback>{fallback ?? name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          {showChevron ? (
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-52">
        <DropdownMenuLabel>
          <p className="text-sm font-medium text-foreground">{name}</p>
          {email ? (
            <p className="text-xs font-normal text-muted-foreground">{email}</p>
          ) : null}
        </DropdownMenuLabel>
        {items && items.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            {items.map((item) => {
              const Icon = item.icon
              return (
                <React.Fragment key={item.id}>
                  {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem
                    variant={item.destructive ? "destructive" : "default"}
                    onSelect={() => onSelect?.(item.id)}
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    {item.label}
                  </DropdownMenuItem>
                </React.Fragment>
              )
            })}
          </>
        ) : null}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DashboardUserMenu }
