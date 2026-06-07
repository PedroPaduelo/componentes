import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"

import { cn } from "@/lib/utils"
import { toggleVariants } from "./toggle-variants"
import type { ToggleProps } from "./toggle-types"

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, children, ...props }, ref) => (
    <TogglePrimitive.Root
      ref={ref}
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </TogglePrimitive.Root>
  )
)
Toggle.displayName = "Toggle"

export { Toggle }
