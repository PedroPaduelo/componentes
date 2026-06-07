import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { toggleVariants } from "./toggle-variants"

export type ToggleProps = Omit<
  React.HTMLAttributes<HTMLButtonElement>,
  "children"
> &
  VariantProps<typeof toggleVariants> &
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & {
    children?: React.ReactNode
  }
