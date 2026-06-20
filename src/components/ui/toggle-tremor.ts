/**
 * Barrel do `ToggleTremor`.
 *
 * Workaround para a regra `react-refresh/only-export-components` do ESLint:
 * o `.tsx` exporta APENAS o componente (`ToggleTremor`) e seu tipo de props
 * (`ToggleTremorProps`); as variants `cva` vivem em `-variants.ts`. Este
 * barrel re-exporta ambos para que o caminho externo
 * `@/components/ui/toggle-tremor` continue sendo o ponto único de import.
 *
 * Re-exports com extensão explícita (mesma convenção de `tree.ts` e
 * `callout-tremor.ts`) para evitar ambiguidade de resolução entre
 * `./toggle-tremor.ts` e `./toggle-tremor.tsx` — o TS strict mode marca
 * o alias como circular sem a extensão explícita.
 *
 * Padrão idêntico ao de `callout-tremor.ts` (ver Pilar 3 da memória do
 * projeto).
 */
export { ToggleTremor } from "./toggle-tremor.tsx"
export type { ToggleTremorProps } from "./toggle-tremor.tsx"
export { toggleTremorVariants } from "./toggle-tremor-variants.ts"
export type { ToggleTremorVariant } from "./toggle-tremor-variants.ts"
