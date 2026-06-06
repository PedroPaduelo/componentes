import * as React from "react"

export type NavbarMenuProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: React.ReactNode
}

export type MenuItemProps = {
  setActive: (item: string) => void
  active: string | null
  item: string
  children?: React.ReactNode
}

export type MenuProps = {
  setActive: (item: string | null) => void
  children: React.ReactNode
}

export type ProductItemProps = {
  title: string
  description: string
  href: string
  src: string
}

export type HoveredLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
> & {
  children: React.ReactNode
}
