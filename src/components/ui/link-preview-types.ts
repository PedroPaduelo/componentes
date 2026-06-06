import * as React from "react"

export type LinkPreviewProps = Omit<
  React.HTMLAttributes<HTMLAnchorElement>,
  "children"
> & {
  children: React.ReactNode
  url: string
  className?: string
  width?: number
  height?: number
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
)
