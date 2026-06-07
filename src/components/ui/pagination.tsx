import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-item"
      className={cn("", className)}
      {...props}
    />
  )
}

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
  size?: "default" | "sm" | "lg" | "icon"
} & React.ComponentProps<"button">

function PaginationLink({
  className,
  isActive,
  disabled,
  size,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      disabled={disabled}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size: size ?? "icon",
        }),
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    />
  )
}

type PaginationPreviousProps = {
  disabled?: boolean
} & React.ComponentProps<"button">

function PaginationPrevious({
  className,
  disabled,
  ...props
}: PaginationPreviousProps) {
  return (
    <button
      aria-label="Go to previous page"
      data-slot="pagination-previous"
      disabled={disabled}
      className={cn(
        buttonVariants({ variant: "ghost", size: "default" }),
        "gap-1 pl-2.5",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span>Previous</span>
    </button>
  )
}

type PaginationNextProps = {
  disabled?: boolean
} & React.ComponentProps<"button">

function PaginationNext({
  className,
  disabled,
  ...props
}: PaginationNextProps) {
  return (
    <button
      aria-label="Go to next page"
      data-slot="pagination-next"
      disabled={disabled}
      className={cn(
        buttonVariants({ variant: "ghost", size: "default" }),
        "gap-1 pr-2.5",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="size-4" />
    </button>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
