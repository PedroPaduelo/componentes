// Barrel: keeps the upstream @fluid import path `@/lib/icon-context` stable
// while splitting hooks (icon-context-internal.ts) from the provider component
// (icon-context-provider.tsx) so each file obeys the
// react-refresh/only-export-components rule.

// Re-export types for consumers
export type { IconComponent, IconName, IconLibrary } from "@/lib/icon-map";
export { iconLibraryOrder, iconLibraryLabels } from "@/lib/icon-map";

export { useIcon, useIcons, useIconLibrary } from "@/lib/icon-context-internal";
export { IconProvider } from "@/lib/icon-context-provider";
