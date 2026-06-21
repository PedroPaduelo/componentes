import { cva } from "class-variance-authority"

/**
 * Variantes de tipografia no estilo shadcn/ui. Cada `variant` é um nível/estilo
 * tipográfico; o elemento HTML semântico correspondente vem de
 * {@link typographyTag} (h1 → `<h1>`, list → `<ul>`, inlineCode → `<code>`…).
 *
 * Classes literais Tailwind (sem interpolação) para o JIT da v4 detectar.
 * Cores via tokens shadcn (`text-muted-foreground`, `border-border`, `bg-muted`).
 */
export const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance lg:text-5xl",
      h2: "scroll-m-20 border-b border-border pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 border-border pl-6 italic text-muted-foreground",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      inlineCode:
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

/**
 * Elemento HTML padrão de cada variante. Mantém a semântica correta (headings,
 * parágrafo, lista, citação, código inline) sem o consumidor escolher a tag.
 */
export const typographyTag = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  blockquote: "blockquote",
  list: "ul",
  inlineCode: "code",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
} as const

/** Nomes das variantes de tipografia disponíveis. */
export type TypographyVariant = keyof typeof typographyTag
