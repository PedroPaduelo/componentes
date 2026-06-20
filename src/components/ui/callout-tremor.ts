/**
 * Barrel do `CalloutTremor`.
 *
 * Workaround para a regra `react-refresh/only-export-components` do ESLint:
 * o `.tsx` exporta APENAS o componente (`CalloutTremor`) e seu tipo de props
 * (`CalloutTremorProps`); as variants `cva` vivem em `-variants.ts`. Este
 * barrel re-exporta ambos para que o caminho externo
 * `@/components/ui/callout-tremor` continue sendo o ponto único de import.
 *
 * Re-exports com extensão explícita (mesma convenção de `tree.ts`) para
 * evitar ambiguidade de resolução entre `./callout-tremor.ts` e
 * `./callout-tremor.tsx` — o TS strict mode marca o alias como circular
 * sem a extensão explícita.
 *
 * Padrão idêntico ao de `tree.ts` (ver Pilar 3 da memória do projeto).
 */
export { CalloutTremor } from "./callout-tremor.tsx"
export type { CalloutTremorProps } from "./callout-tremor.tsx"
export { calloutTremorVariants } from "./callout-tremor-variants.ts"
export type { CalloutTremorVariant } from "./callout-tremor-variants.ts"
