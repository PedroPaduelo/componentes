import { FloatingNavbarDemo } from "@/components/ui/floating-navbar-demo"
import type { Example } from "@/data/examples"

export const examplesFloatingNavbar: Record<string, Example[]> = {
  "floating-navbar": [
    {
      title: "Navbar flutuante",
      description:
        "A navbar aparece ao rolar para cima dentro da área scrollável e some ao rolar para baixo.",
      code: `import { FloatingNav } from "@/components/ui/floating-navbar"
import { Home, User, MessageSquare } from "lucide-react"

const navItems = [
  { name: "Início", link: "#inicio", icon: <Home className="size-4" /> },
  { name: "Sobre", link: "#sobre", icon: <User className="size-4" /> },
  { name: "Contato", link: "#contato", icon: <MessageSquare className="size-4" /> },
]

export function Example() {
  const scrollRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={scrollRef} className="h-[26rem] overflow-y-auto">
      <FloatingNav navItems={navItems} scrollContainer={scrollRef} />
      {/* conteúdo rolável */}
    </div>
  )
}`,
      render: <FloatingNavbarDemo />,
    },
    {
      title: "Sem ícones e sem CTA",
      description:
        "Apenas rótulos de texto e o botão de ação ocultado com `ctaLabel={null}`.",
      code: `const navItems = [
  { name: "Produtos", link: "#produtos" },
  { name: "Preços", link: "#precos" },
  { name: "Blog", link: "#blog" },
]

<FloatingNav navItems={navItems} ctaLabel={null} scrollContainer={scrollRef} />`,
      render: (
        <FloatingNavbarDemo
          navItems={[
            { name: "Produtos", link: "#produtos" },
            { name: "Preços", link: "#precos" },
            { name: "Blog", link: "#blog" },
          ]}
          ctaLabel={null}
        />
      ),
    },
  ],
}
