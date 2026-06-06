import { CardSpotlight } from "@/components/ui/card-spotlight";
import type { Example } from "./examples";

export const examplesCardSpotlight: Record<string, Example[]> = {
  "card-spotlight": [
    {
      title: "Card com Spotlight",
      description:
        "Card com efeito de spotlight radial que segue o cursor e grid de dots no hover.",
      code: `<CardSpotlight className="max-w-sm">
  <h3 className="text-xl font-bold relative z-20 text-white">
    Card Spotlight
  </h3>
  <p className="text-neutral-300 mt-2 relative z-20 text-sm">
    Passe o mouse sobre este card para ver o efeito de spotlight
    com grid de dots animado.
  </p>
</CardSpotlight>`,
      render: (
        <div className="w-full max-w-sm">
          <CardSpotlight>
            <h3 className="text-xl font-bold relative z-20 text-white">
              Card Spotlight
            </h3>
            <p className="text-neutral-300 mt-2 relative z-20 text-sm">
              Passe o mouse sobre este card para ver o efeito de spotlight
              com grid de dots animado.
            </p>
          </CardSpotlight>
        </div>
      ),
    },
    {
      title: "Spotlight Customizado",
      description:
        "Card com cor de spotlight customizada e raio maior.",
      code: `<CardSpotlight
  radius={500}
  color="#1e1e2e"
  className="max-w-md"
>
  <div className="relative z-20">
    <h3 className="text-2xl font-bold text-white">
      Spotlight Customizado
    </h3>
    <p className="text-neutral-400 mt-3 text-sm leading-relaxed">
      Raio de 500px e cor de fundo customizada.
      O efeito CanvasRevealEffect usa gradiente azul/roxo.
    </p>
    <div className="mt-4 flex gap-2">
      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
        React
      </span>
      <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs">
        Motion
      </span>
    </div>
  </div>
</CardSpotlight>`,
      render: (
        <div className="w-full max-w-md">
          <CardSpotlight radius={500} color="#1e1e2e">
            <div className="relative z-20">
              <h3 className="text-2xl font-bold text-white">
                Spotlight Customizado
              </h3>
              <p className="text-neutral-400 mt-3 text-sm leading-relaxed">
                Raio de 500px e cor de fundo customizada.
                O efeito CanvasRevealEffect usa gradiente azul/roxo.
              </p>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                  React
                </span>
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs">
                  Motion
                </span>
              </div>
            </div>
          </CardSpotlight>
        </div>
      ),
    },
  ],
};
