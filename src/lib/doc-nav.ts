/**
 * Sequência LINEAR de navegação das docs — lógica pura (sem UI).
 *
 * Reconstrói a ordem em que a `DocsSidebar` lista as famílias para alimentar a
 * navegação "Anterior / Próxima" no rodapé das páginas de documentação.
 *
 * Contrato de ordem (espelha EXATAMENTE o `DocsSidebar`):
 *  1. `groupByFamily()` produz as famílias ordenadas alfabeticamente por base;
 *  2. a sidebar particiona essas famílias nas categorias canônicas, iterando na
 *     ordem fixa de `CATEGORIES` (Actions → Layout → Forms → Feedback) e, dentro
 *     de cada categoria, preservando a ordem alfabética herdada de (1).
 *
 * Como cada família pertence a exatamente UMA categoria (campo `category`, das 4
 * canônicas), a sequência aqui contém cada família uma única vez:
 * `buildDocSequence().length === groupByFamily().length`.
 *
 * Mantido `.ts` puro (sem JSX) para respeitar `react-refresh/only-export-components`.
 */

import { CATEGORIES } from "@/data/components"
import { getFamilyBase, groupByFamily, type Family } from "@/data/families"

/**
 * Reconstrói a ordem linear das famílias EXATAMENTE como a `DocsSidebar` as
 * lista: agrupadas por categoria (na ordem de `CATEGORIES`) e, dentro de cada
 * categoria, na ordem alfabética por base devolvida por `groupByFamily()`.
 *
 * @returns Famílias na mesma ordem da sidebar (cada família exatamente uma vez).
 */
export function buildDocSequence(): Family[] {
  const families = groupByFamily()
  const sequence: Family[] = []
  for (const category of CATEGORIES) {
    for (const family of families) {
      if (family.category === category) sequence.push(family)
    }
  }
  return sequence
}

/** Resultado da navegação adjacente: vizinhos anterior/próximo (ou undefined nas bordas). */
export interface AdjacentFamilies {
  /** Família anterior na sequência, ou `undefined` se for a primeira. */
  prev?: Family
  /** Família seguinte na sequência, ou `undefined` se for a última. */
  next?: Family
}

/**
 * Devolve as famílias adjacentes (anterior/próxima) a um base na sequência de
 * navegação das docs.
 *
 * O argumento é normalizado por {@link getFamilyBase}, então tanto o base
 * canônico (ex.: `"button"`) quanto um slug de variante (ex.: `"button-fluid"`)
 * resolvem para a mesma posição.
 *
 * Bordas: `prev` da primeira família é `undefined`; `next` da última é
 * `undefined`. Se o base não existir na sequência, devolve `{}`.
 *
 * @param base - base da família (ou slug de variante) atualmente exibida.
 * @param sequence - sequência precomputada (default: {@link buildDocSequence}).
 */
export function getAdjacentFamilies(
  base: string,
  sequence: Family[] = buildDocSequence(),
): AdjacentFamilies {
  const canonical = getFamilyBase(base)
  const index = sequence.findIndex((family) => family.base === canonical)
  if (index === -1) return {}
  return {
    prev: index > 0 ? sequence[index - 1] : undefined,
    next: index < sequence.length - 1 ? sequence[index + 1] : undefined,
  }
}
