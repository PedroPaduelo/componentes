import * as React from "react"
import { IconMenu2, IconX } from "@tabler/icons-react"
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react"

import { cn } from "@/lib/utils"

export interface ResizableNavbarProps {
  children: React.ReactNode
  className?: string
}

export interface NavBodyProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

export interface NavItem {
  name: string
  link: string
}

export interface NavItemsProps {
  items: NavItem[]
  className?: string
  onItemClick?: () => void
}

export interface MobileNavProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

export interface MobileNavHeaderProps {
  children: React.ReactNode
  className?: string
}

export interface MobileNavMenuProps {
  children: React.ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
}

export interface MobileNavToggleProps {
  isOpen: boolean
  onClick: () => void
}

export type NavbarButtonProps = {
  href?: string
  as?: React.ElementType
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary" | "dark" | "gradient"
} & Omit<
  React.ComponentPropsWithoutRef<"button">,
  "href" | "as" | "children" | "className"
>

const SHADOW =
  "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"

function ResizableNavbar({ children, className }: ResizableNavbarProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const [visible, setVisible] = React.useState<boolean>(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100)
  })

  return (
    <motion.div
      ref={ref}
      data-slot="resizable-navbar"
      className={cn("sticky inset-x-0 top-20 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  )
}

function NavBody({ children, className, visible }: NavBodyProps) {
  return (
    <motion.div
      data-slot="resizable-navbar-body"
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible ? SHADOW : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex dark:bg-transparent",
        visible && "bg-white/80 dark:bg-neutral-950/80",
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

function NavItems({ items, className, onItemClick }: NavItemsProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)

  return (
    <motion.div
      data-slot="resizable-navbar-items"
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-gray-100 dark:bg-neutral-800"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  )
}

function MobileNav({ children, className, visible }: MobileNavProps) {
  return (
    <motion.div
      data-slot="resizable-navbar-mobile"
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible ? SHADOW : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && "bg-white/80 dark:bg-neutral-950/80",
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

function MobileNavHeader({ children, className }: MobileNavHeaderProps) {
  return (
    <div
      data-slot="resizable-navbar-mobile-header"
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  )
}

function MobileNavMenu({ children, className, isOpen }: MobileNavMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-slot="resizable-navbar-mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MobileNavToggle({ isOpen, onClick }: MobileNavToggleProps) {
  return isOpen ? (
    <IconX className="text-black dark:text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-black dark:text-white" onClick={onClick} />
  )
}

function NavbarLogo() {
  return (
    <a
      href="#"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <img
        src="https://picsum.photos/seed/resizable-navbar-logo/30/30"
        alt="logo"
        width={30}
        height={30}
        className="rounded-full"
      />
      <span className="font-medium text-black dark:text-white">Startup</span>
    </a>
  )
}

function NavbarButton({
  href,
  as,
  children,
  className,
  variant = "primary",
  ...props
}: NavbarButtonProps) {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center"

  const variantStyles: Record<NonNullable<NavbarButtonProps["variant"]>, string> = {
    primary:
      "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  }

  const Tag = as ?? "a"

  return React.createElement(
    Tag,
    {
      href: href || undefined,
      "data-slot": "resizable-navbar-button",
      className: cn(baseStyles, variantStyles[variant], className),
      ...props,
    } as React.HTMLAttributes<HTMLElement> & {
      href?: string
      "data-slot"?: string
    },
    children,
  )
}

export {
  ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
}
