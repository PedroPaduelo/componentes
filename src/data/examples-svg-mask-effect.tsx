import type { Example } from "@/data/examples"
import { MaskContainer } from "@/components/ui/svg-mask-effect"

/**
 * Examples do SVG Mask Effect (Aceternity UI).
 *
 * O `children` (texto base) é revelado por uma máscara circular que segue o
 * cursor; o `revealText` fica visível por padrão e some sob a camada mascarada
 * no hover. O wrapper é contido (`h-[420px]`) para não estourar a página de
 * detalhe.
 */
const svgMaskEffectBasicExample: Example = {
  title: "Básico",
  description:
    "Passe o mouse sobre a área: uma máscara circular segue o cursor e revela o texto base por baixo, crescendo no hover.",
  code: `<div className="h-[420px] w-full overflow-hidden rounded-lg">
  <MaskContainer
    revealText={
      <p className="mx-auto max-w-4xl text-center font-bold">
        The first rule of MRR Club is you do not talk about MRR Club. The
        second rule of MRR Club is you do not talk about MRR Club.
      </p>
    }
    className="text-white dark:text-black"
  >
    Discover the power of{" "}
    <span className="text-blue-500">Tailwind CSS v4</span> and build beautiful
    interfaces that reveal themselves.
  </MaskContainer>
</div>`,
  render: (
    <div className="h-[420px] w-full overflow-hidden rounded-lg">
      <MaskContainer
        revealText={
          <p className="mx-auto max-w-4xl text-center font-bold">
            The first rule of MRR Club is you do not talk about MRR Club. The
            second rule of MRR Club is you do not talk about MRR Club.
          </p>
        }
        className="text-white dark:text-black"
      >
        Discover the power of{" "}
        <span className="text-blue-500">Tailwind CSS v4</span> and build
        beautiful interfaces that reveal themselves.
      </MaskContainer>
    </div>
  ),
}

export const examplesSvgMaskEffect: Record<string, Example[]> = {
  "svg-mask-effect": [svgMaskEffectBasicExample],
}
