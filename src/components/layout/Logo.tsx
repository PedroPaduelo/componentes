import { cn } from "@/lib/utils"

/**
 * Logo autoral da Vitrine UI — grid 2×2 de quadrados arredondados
 * coerente com o favicon (O4.1, commit 0e54230).
 *
 * Os 3 quadrados "suaves" usam `currentColor` (acompanha o tema),
 * o quadrado inferior-direito é destacado em violeta sólido (`text-primary`),
 * espelhando o favicon.svg onde o canto destacado é `#863bff`.
 *
 * Props:
 *  - `showText` (default true): renderiza o wordmark "Vitrine UI" ao lado.
 *  - `className`: aplicada ao wrapper `<span>` externo.
 *  - `iconClassName`: aplicada ao `<svg>` (útil p/ sobrescrever tamanho/cor).
 *  - `textClassName`: aplicada ao `<span>` do wordmark.
 */
type LogoProps = {
  showText?: boolean
  className?: string
  iconClassName?: string
  textClassName?: string
}

export function Logo({
  showText = true,
  className,
  iconClassName,
  textClassName,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        role="img"
        aria-label="Vitrine UI"
        className={cn("h-5 w-5 text-muted-foreground", iconClassName)}
      >
        {/* Superior-esquerdo — suave */}
        <rect x="3" y="3" width="11" height="11" rx="2.5" fill="currentColor" fillOpacity={0.45} />
        {/* Superior-direito — suave */}
        <rect x="18" y="3" width="11" height="11" rx="2.5" fill="currentColor" fillOpacity={0.45} />
        {/* Inferior-esquerdo — suave */}
        <rect x="3" y="18" width="11" height="11" rx="2.5" fill="currentColor" fillOpacity={0.45} />
        {/* Inferior-direito — destacado (violeta sólido, espelha o favicon) */}
        <rect x="18" y="18" width="11" height="11" rx="2.5" className="text-primary" fill="currentColor" />
      </svg>
      {showText ? (
        <span className={cn("text-base font-semibold tracking-tight", textClassName)}>
          Vitrine UI
        </span>
      ) : null}
    </span>
  )
}
