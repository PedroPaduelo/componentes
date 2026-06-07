"use client"

import * as React from "react"
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"

export type ToasterProps = React.ComponentPropsWithoutRef<typeof SonnerToaster>

function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      data-slot="sonner"
      className="toaster group"
      {...props}
    />
  )
}

export { Toaster, sonnerToast as toast }
