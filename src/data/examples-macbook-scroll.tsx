import type { Example } from "./examples"
import { MacbookScrollDemo, MacbookScrollDemoMinimal } from "./macbook-scroll-demo"

export const examplesMacbookScroll: Record<string, Example[]> = {
  "macbook-scroll": [
    {
      title: "Completo",
      description:
        "MacBook com imagem, título customizado e badge. Wrapper com área scrollável própria (scrollRef) para o useScroll funcionar na página de detalhe.",
      code: `<MacbookScrollDemo />`,
      render: <MacbookScrollDemo />,
    },
    {
      title: "Minimal",
      description:
        "MacBook sem imagem, sem gradiente, sem badge — apenas o título padrão e o efeito de scroll.",
      code: `<MacbookScrollDemoMinimal />`,
      render: <MacbookScrollDemoMinimal />,
    },
  ],
}
