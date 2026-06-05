import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme/theme-provider"
import { chevronsUpDownIconVariants } from "@/components/ui/chevrons-up-down-icon-variants"

export type ChevronsUpDownIconHandle = {
  startAnimation: () => void
  stopAnimation: () => void
}

export type ChevronsUpDownIconProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  VariantProps<typeof chevronsUpDownIconVariants> & {
    /** Duração da animação de rotação em segundos. */
    duration?: number
  }

const ChevronsUpDownIcon = React.forwardRef<
  ChevronsUpDownIconHandle,
  ChevronsUpDownIconProps
>(
  (
    { className, size, duration = 0.2, ...props },
    ref
  ) => {
    const { resolvedTheme } = useTheme()
    const [isOpen, setIsOpen] = React.useState(false)
    const innerRef = React.useRef<HTMLSpanElement>(null)

    React.useImperativeHandle(ref, () => ({
      startAnimation: () => setIsOpen(true),
      stopAnimation: () => setIsOpen(false),
    }))

    return (
      <span
        ref={innerRef}
        data-slot="chevrons-up-down-icon"
        data-theme={resolvedTheme}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          chevronsUpDownIconVariants({ size }),
          `transition-transform duration-[${duration * 1000}ms]`,
          isOpen && "rotate-180",
          className
        )}
        style={{
          transitionDuration: `${duration}s`,
        }}
        {...props}
      >
        <ChevronsUpDown className={cn(chevronsUpDownIconVariants({ size }))} />
      </span>
    )
  }
)
ChevronsUpDownIcon.displayName = "ChevronsUpDownIcon"

export { ChevronsUpDownIcon }
