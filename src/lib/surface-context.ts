// Barrel: keeps the upstream @fluid import path `@/lib/surface-context` stable
// while splitting the hook (surface-context-internal.ts) and the provider
// component (surface-context-provider.tsx) into separate files so each obeys
// the react-refresh/only-export-components rule.
export { useSurface, SurfaceContext } from "@/lib/surface-context-internal";
export { SurfaceProvider } from "@/lib/surface-context-provider";
