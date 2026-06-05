/**
 * Barrel do componente `Tree`.
 *
 * O componente vive em `./tree.tsx` (separado para evitar o lint
 * `react-refresh/only-export-components` que reclamaria se o `.tsx`
 * exportasse types/helpers junto com o componente). Os types/helpers
 * vivem em `./tree-types.ts`. Este barrel re-exporta ambos para que o
 * caminho externo `@/components/ui/tree` continue sendo o ponto único
 * de import.
 *
 * Os re-exports abaixo usam a extensão `.tsx`/`-types` explícita pra
 * evitar ambiguidade de resolução (`./tree` poderia resolver para
 * `./tree.ts` que é este próprio arquivo).
 */

export { Tree } from "./tree.tsx"
export type {
  TreeDensity,
  TreeGitStatus,
  TreeProps,
} from "./tree-types"
export { toNativeDensity } from "./tree-types"
