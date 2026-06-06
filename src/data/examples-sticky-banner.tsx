import { StickyBanner } from "@/components/ui/sticky-banner"
import { Button } from "@/components/ui/button"
import type { Example } from "./examples"

export const examplesStickyBanner: Record<string, Example[]> = {
  "sticky-banner": [
    {
      title: "Básico com CTA",
      description:
        "Banner fixo no topo com texto e botão de ação. Cores brand-dark (fundo escuro, texto branco).",
      code: `<StickyBanner className="bg-zinc-900 dark:bg-zinc-950">
  <div className="flex items-center gap-3 text-white">
    <span className="text-sm">
      🚀 Nova versão disponível — confira as novidades!
    </span>
    <Button size="sm" variant="secondary">
      Ver mais
    </Button>
  </div>
</StickyBanner>`,
      render: (
        <StickyBanner className="bg-zinc-900 dark:bg-zinc-950">
          <div className="flex items-center gap-3 text-white">
            <span className="text-sm">
              🚀 Nova versão disponível — confira as novidades!
            </span>
            <Button size="sm" variant="secondary">
              Ver mais
            </Button>
          </div>
        </StickyBanner>
      ),
    },
    {
      title: "Com hideOnScroll",
      description:
        "Banner que se oculta ao rolar a página para baixo e reaparece ao rolar para cima.",
      code: `<StickyBanner
  hideOnScroll
  className="bg-zinc-900 dark:bg-zinc-950"
>
  <div className="flex items-center gap-3 text-white">
    <span className="text-sm">
      📢 Promoção relâmpago — 50% off por tempo limitado!
    </span>
    <Button size="sm" variant="secondary">
      Aproveitar
    </Button>
  </div>
</StickyBanner>`,
      render: (
        <StickyBanner
          hideOnScroll
          className="bg-zinc-900 dark:bg-zinc-950"
        >
          <div className="flex items-center gap-3 text-white">
            <span className="text-sm">
              📢 Promoção relâmpago — 50% off por tempo limitado!
            </span>
            <Button size="sm" variant="secondary">
              Aproveitar
            </Button>
          </div>
        </StickyBanner>
      ),
    },
  ],
}
