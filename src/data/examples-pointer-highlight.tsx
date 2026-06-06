import { PointerHighlight } from "@/components/ui/pointer-highlight"
import type { Example } from "@/data/examples"

const pointerHighlightHeadline: Example = {
  title: "Headline com borda expansível",
  description:
    "A borda (border-neutral-800/200) se expande a partir do canto superior-esquerdo em ~1s easeInOut ao entrar no viewport; o cursor SVG azul aparece no canto inferior-direito. `containerClassName` controla o wrapper externo.",
  code: `<PointerHighlight containerClassName="rounded-md p-2">
  <h2 className="text-2xl font-semibold text-foreground md:text-4xl">
    Pointer Highlight
  </h2>
</PointerHighlight>`,
  render: (
    <div className="flex min-h-[160px] items-center justify-center p-6">
      <PointerHighlight containerClassName="rounded-md p-2">
        <h2 className="text-2xl font-semibold text-foreground md:text-4xl">
          Pointer Highlight
        </h2>
      </PointerHighlight>
    </div>
  ),
}

const pointerHighlightInline: Example = {
  title: "Bloco de texto em card",
  description:
    "Use dentro de um card/wrapper para destacar uma frase específica. O `ResizeObserver` re-mede as dimensões em mudanças de tamanho, então o retângulo sempre acompanha o conteúdo (incluindo trocas de tema).",
  code: `<PointerHighlight
  rectangleClassName="rounded-lg"
  containerClassName="rounded-lg p-4"
>
  <p className="text-base font-medium text-foreground md:text-lg">
    Realce a próxima feature com um pointer e uma borda animada.
  </p>
</PointerHighlight>`,
  render: (
    <div className="flex min-h-[160px] items-center justify-center p-6">
      <PointerHighlight
        rectangleClassName="rounded-lg"
        containerClassName="rounded-lg p-4"
      >
        <p className="text-base font-medium text-foreground md:text-lg">
          Realce a próxima feature com um pointer e uma borda animada.
        </p>
      </PointerHighlight>
    </div>
  ),
}

export const examplesPointerHighlight: Record<string, Example[]> = {
  "pointer-highlight": [pointerHighlightHeadline, pointerHighlightInline],
}
