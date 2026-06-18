import { useCallback, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { LayoutTemplate, Search } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { GROUP_ICONS } from "@/components/layout/category-icons"
import { compositions } from "@/data/compositions"
import { groupByFamily } from "@/data/families"
import { getGroup, GROUP_BY_ID, listGroups } from "@/data/groups"
import { cn } from "@/lib/utils"

/**
 * Command palette GLOBAL da vitrine (UX Vitrine v2 / ONDA 3).
 *
 * Atalho ⌘K / Ctrl+K (keydown global) abre um Dialog acessível (cmdk) que
 * indexa as TRÊS fontes de descoberta e navega ao selecionar:
 *
 *  - **Grupos** (9): `listGroups()` → `/components/grupo/:groupId`.
 *  - **Componentes**: famílias (`groupByFamily`) → group-page do componente,
 *    ancorada no slug representativo: `/components/grupo/:groupId#<slug>`
 *    (a `FamilyDetail` standalone foi superseded pela group-page na O2.4).
 *  - **Composições** (`compositions`): `/compositions/:slug`.
 *
 * O estado de abertura é LEVANTADO para o `Layout` (props `open`/`onOpenChange`)
 * para que o gatilho no Header (`CommandPaletteTrigger`, via `searchSlot`) e o
 * atalho de teclado compartilhem a mesma instância — o Dialog é renderizado uma
 * única vez no shell, evitando listeners/portais duplicados.
 */
type CommandPaletteProps = {
  open: boolean
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()

  // Atalho global ⌘K / Ctrl+K: alterna a palette de qualquer lugar do app.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onOpenChange])

  // Indexação memoizada das 3 fontes (derivadas dos dados, sem duplicar nada).
  const groups = useMemo(() => listGroups(), [])
  const families = useMemo(() => groupByFamily(), [])

  const handleSelect = useCallback(
    (to: string) => {
      onOpenChange(false)
      navigate(to)
    },
    [navigate, onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-2xl">
        {/* Título/descrição acessíveis (sr-only): Radix associa aria-* ao Dialog. */}
        <DialogTitle className="sr-only">Busca global</DialogTitle>
        <DialogDescription className="sr-only">
          Busque componentes, composições e grupos da Vitrine UI e navegue ao
          selecionar.
        </DialogDescription>

        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Buscar componentes, composições e grupos…" />
          <CommandList className="max-h-[60vh]">
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

            <CommandGroup heading="Grupos">
              {groups.map((group) => {
                const Icon = GROUP_ICONS[group.id]
                return (
                  <CommandItem
                    key={`group-${group.id}`}
                    value={`grupo ${group.label} ${group.id}`}
                    keywords={[group.id, group.domain, group.description]}
                    onSelect={() => handleSelect(`/components/grupo/${group.id}`)}
                  >
                    <Icon className="text-muted-foreground" />
                    <span className="truncate">{group.label}</span>
                    <span className="ml-auto shrink-0 pl-2 text-xs tabular-nums text-muted-foreground/70">
                      {group.componentCount}{" "}
                      {group.componentCount === 1 ? "componente" : "componentes"}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            <CommandGroup heading="Componentes">
              {families.map((family) => {
                const groupId = getGroup(family.representativeSlug)
                const Icon = GROUP_ICONS[groupId]
                const keywords = [
                  family.base,
                  ...family.variants.flatMap((variant) => [
                    variant.name,
                    variant.slug,
                    ...variant.tags,
                  ]),
                ]
                return (
                  <CommandItem
                    key={`family-${family.base}`}
                    value={`${family.name} ${family.base}`}
                    keywords={keywords}
                    onSelect={() =>
                      handleSelect(
                        `/components/grupo/${groupId}#${family.representativeSlug}`,
                      )
                    }
                  >
                    <Icon className="text-muted-foreground" />
                    <span className="truncate">{family.name}</span>
                    <span className="ml-auto shrink-0 truncate pl-2 text-xs text-muted-foreground/70">
                      {GROUP_BY_ID[groupId].label}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            <CommandGroup heading="Composições">
              {compositions.map((composition) => (
                <CommandItem
                  key={`composition-${composition.slug}`}
                  value={`${composition.name} ${composition.slug}`}
                  keywords={[
                    composition.slug,
                    composition.category ?? "",
                    ...composition.tags,
                  ]}
                  onSelect={() =>
                    handleSelect(`/compositions/${composition.slug}`)
                  }
                >
                  <LayoutTemplate className="text-muted-foreground" />
                  <span className="truncate">{composition.name}</span>
                  {composition.category ? (
                    <span className="ml-auto shrink-0 pl-2 text-xs text-muted-foreground/70">
                      {composition.category}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Gatilho de busca para o `searchSlot` do Header. É um botão leve (estilo de
 * input) que abre a {@link CommandPalette} e exibe o atalho ⌘K. Renderizado
 * tanto no header desktop quanto no menu mobile (Sheet) — ambos só chamam
 * `onClick`, sem estado próprio.
 */
export function CommandPaletteTrigger({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir busca global (Ctrl+K)"
      className={cn(
        "inline-flex h-9 w-full items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-56",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">Buscar…</span>
      <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
        <span className="text-xs leading-none">⌘</span>K
      </kbd>
    </button>
  )
}
