import { LinkPreview } from "@/components/ui/link-preview"
import type { Example } from "./examples"

const linkPreviewDynamicExample: Example = {
  title: "Preview dinâmico (microlink)",
  description:
    "Hover sobre o link mostra um screenshot da URL via API microlink.io.",
  code: `<LinkPreview url="https://github.com">
  github.com
</LinkPreview>`,
  render: (
    <div className="flex items-center justify-center min-h-[280px]">
      <LinkPreview url="https://github.com">
        <span className="font-medium underline underline-offset-4">
          github.com
        </span>
      </LinkPreview>
    </div>
  ),
}

const linkPreviewStaticExample: Example = {
  title: "Preview estático (imagem local)",
  description:
    "Preview com imagem estática (picsum) — sem chamada à API microlink.",
  code: `<LinkPreview
  url="https://picsum.photos/seed/preview/600/400"
  isStatic
  imageSrc="https://picsum.photos/seed/preview/600/400"
>
  Foto aleatória
</LinkPreview>`,
  render: (
    <div className="flex items-center justify-center min-h-[280px]">
      <LinkPreview
        url="https://picsum.photos/seed/preview/600/400"
        isStatic
        imageSrc="https://picsum.photos/seed/preview/600/400"
      >
        <span className="font-medium underline underline-offset-4">
          Foto aleatória
        </span>
      </LinkPreview>
    </div>
  ),
}

export const examplesLinkPreview: Record<string, Example[]> = {
  "link-preview": [linkPreviewDynamicExample, linkPreviewStaticExample],
}
