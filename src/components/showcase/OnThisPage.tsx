import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/** Uma entrada do índice "Nesta página". */
export interface TocSection {
  /** id do elemento alvo na página (sem `#`). */
  id: string
  /** Rótulo exibido no índice. */
  label: string
  /** Nível de indentação: 1 = topo, 2 = subseção. */
  depth?: 1 | 2
}

interface OnThisPageProps {
  /** Seções da página, em ordem de aparição vertical. */
  sections: readonly TocSection[]
  className?: string
}

/**
 * Índice "On this page" (coluna direita das docs), visível só em telas largas
 * (`xl+`). Lista as seções da página com âncoras que rolam suave ao clicar e
 * destaca o item ativo conforme o scroll via IntersectionObserver (scroll-spy).
 *
 * NÃO usa scroll da janela / useScroll (que pode travar) — observa diretamente
 * os elementos com `id` correspondentes às seções.
 */
export function OnThisPage({ sections, className }: OnThisPageProps) {
  const [activeId, setActiveId] = useState<string>("")
  // Mantém um mapa id -> está visível, para escolher o "primeiro visível".
  const visibilityRef = useRef<Map<string, boolean>>(new Map())

  useEffect(() => {
    if (sections.length === 0) return

    const ids = sections.map((s) => s.id)
    const visibility = visibilityRef.current
    visibility.clear()
    ids.forEach((id) => visibility.set(id, false))

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    // Default: primeira seção ativa antes de qualquer interseção.
    setActiveId((current) => (current && ids.includes(current) ? current : ids[0]))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting)
        }
        // Ativo = primeiro id (na ordem da página) que está visível.
        const firstVisible = ids.find((id) => visibility.get(id))
        if (firstVisible) {
          setActiveId(firstVisible)
        }
      },
      {
        // Recorte no topo: marca como ativa a seção logo abaixo do header.
        rootMargin: "-96px 0px -66% 0px",
        threshold: 0,
      }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      event.preventDefault()
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveId(id)
      // Atualiza a hash sem disparar um jump nativo.
      if (window.history.replaceState) {
        window.history.replaceState(null, "", `#${id}`)
      }
    },
    []
  )

  if (sections.length === 0) return null

  return (
    <nav
      aria-label="Nesta página"
      className={cn(
        "sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 self-start overflow-y-auto py-10 xl:block",
        className
      )}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Nesta página
      </p>
      <ul className="space-y-1 border-l border-border text-sm">
        {sections.map((section) => {
          const isActive = section.id === activeId
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(event) => handleClick(event, section.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "block border-l border-transparent py-1 leading-snug transition-colors",
                  section.depth === 2 ? "pl-7" : "pl-4",
                  isActive
                    ? "border-foreground font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {section.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
