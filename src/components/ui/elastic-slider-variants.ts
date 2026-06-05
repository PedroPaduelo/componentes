import { cva } from "class-variance-authority"

export const sliderVariants = cva(
  "relative h-[var(--elastic-slider-height)]",
  {
    variants: {
      density: {
        compact: "[--elastic-slider-height:--spacing(7)]",
        default: "[--elastic-slider-height:--spacing(9)]",
        relaxed: "[--elastic-slider-height:--spacing(11)]",
      },
      variant: {
        default:
          "[--elastic-slider-radius:var(--radius-lg)] [--elastic-slider-bg:var(--muted)] [--elastic-slider-fill:color-mix(in_oklab,var(--muted-foreground)_10%,transparent)] [--elastic-slider-fill-active:color-mix(in_oklab,var(--muted-foreground)_20%,transparent)] [--elastic-slider-hash:color-mix(in_oklab,var(--muted-foreground)_30%,transparent)] [--elastic-slider-handle:var(--foreground)] [--elastic-slider-label:var(--muted-foreground)] [--elastic-slider-focus:var(--foreground)]",
        ghost: "[--elastic-slider-radius:var(--radius-lg)] [--elastic-slider-bg:transparent] [--elastic-slider-fill:color-mix(in_oklab,var(--muted-foreground)_6%,transparent)] [--elastic-slider-fill-active:color-mix(in_oklab,var(--muted-foreground)_12%,transparent)] [--elastic-slider-hash:color-mix(in_oklab,var(--muted-foreground)_20%,transparent)] [--elastic-slider-handle:var(--foreground)] [--elastic-slider-label:var(--muted-foreground)] [--elastic-slider-focus:var(--foreground)]",
      },
    },
    defaultVariants: {
      density: "default",
      variant: "default",
    },
  }
)

export type SliderVariants = typeof sliderVariants
