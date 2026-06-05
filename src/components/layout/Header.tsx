import { Link, NavLink } from "react-router-dom"
import { Boxes } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { cn } from "@/lib/utils"

type HeaderProps = {
  /** Slot para um campo de busca (preenchido na Task 2). */
  searchSlot?: React.ReactNode
}

const navItems = [
  { to: "/", label: "Início" },
  { to: "/components", label: "Componentes" },
]

export function Header({ searchSlot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Boxes className="h-5 w-5 text-primary" />
          <span className="text-base tracking-tight">Vitrine UI</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {searchSlot ? <div className="hidden md:block">{searchSlot}</div> : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
