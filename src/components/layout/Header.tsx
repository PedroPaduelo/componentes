import { Link, NavLink } from "react-router-dom"
import { Boxes, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type HeaderProps = {
  /** Slot para um campo de busca (preenchido na Task 2). */
  searchSlot?: React.ReactNode
}

const navItems = [
  { to: "/", label: "Início" },
  { to: "/components", label: "Componentes" },
  { to: "/compositions", label: "Composições" },
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

          {/* Mobile menu button - visible only below sm */}
          <Sheet>
            <SheetTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Link to="/" className="flex items-center gap-2">
                    <Boxes className="h-5 w-5 text-primary" />
                    <span className="text-base font-semibold tracking-tight">Vitrine UI</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                        isActive && "bg-accent text-foreground font-medium",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              {searchSlot ? (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Busca</p>
                  {searchSlot}
                </div>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
