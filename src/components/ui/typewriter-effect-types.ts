/**
 * Tipos públicos do componente Typewriter Effect (Aceternity).
 *
 * Extraídos para um arquivo `.ts` separado para respeitar a regra
 * `react-refresh/only-export-components` do projeto — o componente
 * `.tsx` exporta apenas componentes, e os tipos ficam aqui.
 */

/** Uma palavra do efeito, com classe opcional para destacar trechos. */
export interface TypewriterWord {
  /** Texto da palavra. */
  text: string
  /** Classes extras aplicadas aos caracteres dessa palavra. */
  className?: string
}

/** Props compartilhadas entre TypewriterEffect e TypewriterEffectSmooth. */
export interface TypewriterEffectBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Palavras que serão "datilografadas" em sequência. */
  words: TypewriterWord[]
  /** Classes adicionais aplicadas ao container. */
  className?: string
  /** Classes adicionais aplicadas ao cursor piscante. */
  cursorClassName?: string
}

/** Props do TypewriterEffect (modo letra a letra, com stagger). */
export type TypewriterEffectProps = TypewriterEffectBaseProps

/** Props do TypewriterEffectSmooth (modo "máquina de escrever" com width animado). */
export type TypewriterEffectSmoothProps = TypewriterEffectBaseProps
