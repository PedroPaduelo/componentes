/**
 * Types — AnimatedTestimonials (Aceternity UI).
 *
 * Extraídos em arquivo separado para evitar warning de
 * `react-refresh/only-export-components` quando o componente importa
 * tipos daqui (padrão do projeto: ver `container-text-flip-types.ts`,
 * `colourful-text-types.ts`, `3d-card-types.ts`).
 */

export interface Testimonial {
  /** Frase do depoimento. Renderizada com stagger de blur por palavra. */
  quote: string
  /** Nome da pessoa que dá o depoimento. */
  name: string
  /** Cargo/função exibido abaixo do nome. */
  designation: string
  /** URL da imagem (picsum/seed/... é o recomendado). */
  src: string
}

export interface AnimatedTestimonialsProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    | "children"
    | "onDrag"
    | "onDragEnd"
    | "onDragStart"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
    | "onTransitionEnd"
  > {
  /** Lista de depoimentos exibidos pelo carrossel. Mínimo 1. */
  testimonials: Testimonial[]
  /**
   * Quando `true`, o carrossel avança sozinho a cada 5s.
   * @default false
   */
  autoplay?: boolean
}
