import * as React from "react"

import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

interface CardTremorProps extends React.ComponentProps<"div"> {
  asChild?: boolean
}

const CardTremor = React.forwardRef<HTMLDivElement, CardTremorProps>(
  ({ className, asChild, ...props }, forwardedRef) => {
    const Component = asChild ? Slot : "div"
    return (
      <Component
        ref={forwardedRef}
        data-slot="card-tremor"
        tremor-id="tremor-raw"
        className={cn(
          // base
          "relative w-full rounded-lg border p-6 text-left shadow-xs",
          // background color
          "bg-white dark:bg-[#090E1A]",
          // border color
          "border-gray-200 dark:border-gray-900",
          className,
        )}
        {...props}
      />
    )
  },
)

CardTremor.displayName = "CardTremor"

export { CardTremor, type CardTremorProps }
