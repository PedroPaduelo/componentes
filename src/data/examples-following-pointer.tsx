import { FollowerPointerCard } from "@/components/ui/following-pointer"

import type { Example } from "@/data/examples"

export const examplesFollowingPointer: Record<string, Example[]> = {
  "following-pointer": [
    {
      title: "Card de blog",
      description:
        "Ponteiro customizado com avatar e nome do autor sobre um card de artigo.",
      code: `<FollowerPointerCard
  title={
    <div className="flex items-center space-x-2">
      <img
        src="https://picsum.photos/seed/author/40"
        height={20}
        width={20}
        alt="Autora"
        className="rounded-full border-2 border-white"
      />
      <p>Manu Arora</p>
    </div>
  }
  className="w-full max-w-sm"
>
  <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl">
    <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
      <img
        src="https://picsum.photos/seed/blogcard/600/375"
        alt="Capa"
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
    </div>
    <div className="p-4">
      <h3 className="text-base font-semibold">
        O ponteiro que segue você
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Passe o mouse sobre o card e veja o cursor virar um indicador
        animado com o nome do autor.
      </p>
    </div>
  </div>
</FollowerPointerCard>`,
      render: (
        <FollowerPointerCard
          title={
            <div className="flex items-center space-x-2">
              <img
                src="https://picsum.photos/seed/author/40"
                height={20}
                width={20}
                alt="Manu Arora"
                className="rounded-full border-2 border-white"
              />
              <p>Manu Arora</p>
            </div>
          }
          className="w-full max-w-sm"
        >
          <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl">
            <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
              <img
                src="https://picsum.photos/seed/blogcard/600/375"
                alt="Capa"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold">
                O ponteiro que segue você
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Passe o mouse sobre o card e veja o cursor virar um
                indicador animado com o nome do autor.
              </p>
            </div>
          </div>
        </FollowerPointerCard>
      ),
    },
    {
      title: "Bloco de texto",
      description:
        "Título simples como string e cor do badge escolhida via colorIndex.",
      code: `<FollowerPointerCard
  title="Leia com calma"
  colorIndex={3}
  className="w-full max-w-md"
>
  <div className="rounded-xl border border-border bg-card p-6">
    <h3 className="text-lg font-semibold">Sobre o componente</h3>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
      O FollowerPointerCard esconde o cursor nativo e desenha um ponteiro
      animado em motion/react que segue o mouse enquanto ele estiver
      dentro da área. Ideal para destacar conteúdo interativo.
    </p>
  </div>
</FollowerPointerCard>`,
      render: (
        <FollowerPointerCard
          title="Leia com calma"
          colorIndex={3}
          className="w-full max-w-md"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Sobre o componente</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              O FollowerPointerCard esconde o cursor nativo e desenha um
              ponteiro animado em motion/react que segue o mouse enquanto
              ele estiver dentro da área. Ideal para destacar conteúdo
              interativo.
            </p>
          </div>
        </FollowerPointerCard>
      ),
    },
  ],
}
