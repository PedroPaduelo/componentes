// Barrel: keeps the upstream @fluid import path `@/lib/shape-context` stable
// while splitting hooks/constants (shape-context-internal.ts) from the provider
// component (shape-context-provider.tsx) so each file obeys the
// react-refresh/only-export-components rule.
export { useShape, useShapeContext, shapeMap } from "@/lib/shape-context-internal";
export { ShapeProvider } from "@/lib/shape-context-provider";
export type { ShapeVariant, ShapeClasses } from "@/lib/shape-context-internal";
