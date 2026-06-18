/**
 * Sequência LINEAR de navegação das composições — lógica pura (sem UI).
 *
 * Reconstrói a ordem em que a `CompositionsSidebar` lista as composições para
 * alimentar a navegação "Anterior / Próxima" no rodapé das páginas de detalhe
 * (`/compositions/:slug`).
 *
 * Contrato de ordem (espelha EXATAMENTE o `CompositionsSidebar`):
 *  1. a sidebar parte da lista completa de `compositions` (sem busca);
 *  2. `groupCompositionsByCategory()` particiona as composições por `category`,
 *     ordenando os grupos por `CATEGORY_ORDER` (Marketing → Aplicação →
 *     Showcase) e, em seguida, qualquer categoria nova na ordem de aparição;
 *  3. dentro de cada grupo, preserva a ordem original do array `compositions`.
 *
 * Como cada composição pertence a exatamente UM grupo, a sequência aqui contém
 * cada composição uma única vez:
 * `buildCompositionSequence().length === compositions.length`.
 *
 * Mantido `.ts` puro (sem JSX) para respeitar `react-refresh/only-export-components`.
 */

import { compositions, type Composition } from "@/data/compositions"
import { groupCompositionsByCategory } from "@/lib/composition-filter"

/**
 * Reconstrói a ordem linear das composições EXATAMENTE como a
 * `CompositionsSidebar` as lista: agrupadas por categoria (na ordem de
 * `groupCompositionsByCategory`) e, dentro de cada categoria, na ordem original
 * do array `compositions`.
 *
 * @returns Composições na mesma ordem da sidebar (cada uma exatamente uma vez).
 */
export function buildCompositionSequence(): Composition[] {
  const groups = groupCompositionsByCategory(compositions)
  const sequence: Composition[] = []
  for (const group of groups) {
    for (const composition of group.compositions) {
      sequence.push(composition)
    }
  }
  return sequence
}

/** Resultado da navegação adjacente: vizinhos anterior/próximo (ou undefined nas bordas). */
export interface AdjacentCompositions {
  /** Composição anterior na sequência, ou `undefined` se for a primeira. */
  prev?: Composition
  /** Composição seguinte na sequência, ou `undefined` se for a última. */
  next?: Composition
}

/**
 * Devolve as composições adjacentes (anterior/próxima) a um slug na sequência
 * de navegação das composições.
 *
 * Bordas: `prev` da primeira composição é `undefined`; `next` da última é
 * `undefined`. Se o slug não existir na sequência, devolve `{}`.
 *
 * @param slug - slug da composição atualmente exibida.
 * @param sequence - sequência precomputada (default: {@link buildCompositionSequence}).
 */
export function getAdjacentCompositions(
  slug: string,
  sequence: Composition[] = buildCompositionSequence(),
): AdjacentCompositions {
  const index = sequence.findIndex((composition) => composition.slug === slug)
  if (index === -1) return {}
  return {
    prev: index > 0 ? sequence[index - 1] : undefined,
    next: index < sequence.length - 1 ? sequence[index + 1] : undefined,
  }
}
