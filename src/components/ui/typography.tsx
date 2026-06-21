/**
 * Typography — primitivos de tipografia no estilo shadcn/ui.
 *
 * Um único componente com `variant` que renderiza o elemento HTML semântico
 * adequado (h1–h4, p, blockquote, ul, code, small) e aplica os estilos
 * tipográficos correspondentes. Para compor artigos/prose, encadeie títulos +
 * parágrafos. `asChild` (Radix Slot) aplica os estilos a um elemento próprio
 * (ex.: um `<Link>`), preservando a tag do filho.
 *
 * Elemento raiz com `data-slot="typography"`; cores via tokens shadcn.
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  typographyTag,
  typographyVariants,
  type TypographyVariant,
} from "./typography-variants"

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  /**
   * Renderiza no elemento filho (Radix Slot) em vez da tag padrão da variante.
   * Útil para aplicar os estilos a um `<a>`/`<Link>` etc.
   */
  asChild?: boolean
}

function Typography({
  className,
  variant,
  asChild = false,
  ...props
}: TypographyProps) {
  const resolved = (variant ?? "p") as TypographyVariant
  const Comp: React.ElementType = asChild ? Slot : typographyTag[resolved]

  return (
    <Comp
      data-slot="typography"
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Typography }
