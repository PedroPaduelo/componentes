"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import {
  badgeColors,
  badgeFluidVariants,
  type BadgeColor,
} from "@/components/ui/badge-fluid-variants";

interface BadgeFluidProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeFluidVariants> {
  color?: BadgeColor;
}

const BadgeFluid = forwardRef<HTMLSpanElement, BadgeFluidProps>(
  (
    {
      className,
      variant = "solid",
      size = "md",
      color = "gray",
      children,
      style,
      ...props
    },
    ref
  ) => {
    const shape = useShape();
    const colorValue = badgeColors[color];
    const isSolid = variant === "solid";
    const dotSize = size === "sm" ? 6 : size === "lg" ? 8 : 7;

    const colorStyle = isSolid
      ? color === "gray"
        ? { backgroundColor: "var(--accent)", color: "var(--foreground)" }
        : {
            color: "var(--foreground)",
            backgroundColor: `color-mix(in srgb, ${colorValue} 15%, var(--background))`,
          }
      : {};

    const dotColor = color === "gray" ? "var(--muted-foreground)" : colorValue;

    return (
      <span
        ref={ref}
        data-slot="badge-fluid"
        className={cn(badgeFluidVariants({ variant, size }), shape.item, className)}
        style={{ ...colorStyle, ...style }}
        {...props}
      >
        {!isSolid && (
          <span
            className="shrink-0 rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: dotColor,
            }}
          />
        )}
        {children}
      </span>
    );
  }
);

BadgeFluid.displayName = "BadgeFluid";

export { BadgeFluid };
export type { BadgeFluidProps };
