// Barrel: keeps the upstream @fluid import path `@/hooks/use-merge-split` stable
// while splitting the hook + types (use-merge-split-internal.ts) from the
// SelectionBackgrounds component (selection-backgrounds.tsx) so each file obeys
// the react-refresh/only-export-components rule.
export { useMergeSplitBlocks } from "@/hooks/use-merge-split-internal";
export type { SelBlock, Run } from "@/hooks/use-merge-split-internal";
export { SelectionBackgrounds } from "@/hooks/selection-backgrounds";
