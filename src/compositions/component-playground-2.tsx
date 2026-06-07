/**
 * Composição "Component Playground 2.0".
 *
 * Playground interativo com 4 abas:
 * - Hover: grid de 3 DirectionAwareHover cards com imagens picsum.
 * - Drag:  3 DraggableCard arrastáveis com perspectiva 3D.
 * - Compare: slider de comparação entre duas imagens picsum.
 * - Upload: FileUpload com drag & drop + preview de arquivos.
 *
 * Footer decorativo com GlowingStarsEffect.
 */

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover"
import {
  DraggableCardContainer,
  DraggableCardBody,
} from "@/components/ui/draggable-card"
import { Compare } from "@/components/ui/compare"
import { FileUpload } from "@/components/ui/file-upload"
import {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle,
} from "@/components/ui/glowing-stars-effect"

export function ComponentPlayground2() {
  return (
    <div className="flex flex-col gap-8 p-6">
      {/* ----------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ----------------------------------------------------------------- */}
      <header className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Playground
        </h1>
        <Badge variant="secondary" className="text-xs">
          v2.0
        </Badge>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Tabs                                                              */}
      {/* ----------------------------------------------------------------- */}
      <Tabs defaultValue="hover" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hover">Hover</TabsTrigger>
          <TabsTrigger value="drag">Drag</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        {/* --------------------------------------------------------------- */}
        {/* Hover Tab                                                       */}
        {/* --------------------------------------------------------------- */}
        <TabsContent value="hover" className="mt-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <DirectionAwareHover
              imageUrl="https://picsum.photos/seed/pg-hover-1/400/400"
              className="h-64 w-full md:h-72"
            >
              <div>
                <p className="text-lg font-semibold text-white">Montanhas</p>
                <p className="text-sm text-white/70">Paisagem natural</p>
              </div>
            </DirectionAwareHover>

            <DirectionAwareHover
              imageUrl="https://picsum.photos/seed/pg-hover-2/400/400"
              className="h-64 w-full md:h-72"
            >
              <div>
                <p className="text-lg font-semibold text-white">Cidade</p>
                <p className="text-sm text-white/70">Urbano à noite</p>
              </div>
            </DirectionAwareHover>

            <DirectionAwareHover
              imageUrl="https://picsum.photos/seed/pg-hover-3/400/400"
              className="h-64 w-full md:h-72"
            >
              <div>
                <p className="text-lg font-semibold text-white">Oceano</p>
                <p className="text-sm text-white/70">Mar aberto</p>
              </div>
            </DirectionAwareHover>
          </div>
        </TabsContent>

        {/* --------------------------------------------------------------- */}
        {/* Drag Tab                                                        */}
        {/* --------------------------------------------------------------- */}
        <TabsContent value="drag" className="mt-6">
          <div className="flex flex-wrap items-center justify-center gap-12">
            <DraggableCardContainer>
              <DraggableCardBody className="w-72">
                <Card className="border-0 bg-transparent shadow-none">
                  <div className="p-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Card Arrastável 1
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Arraste este card pela tela. Ele responde ao movimento do
                      cursor com rotação 3D e física de mola.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Badge>Drag</Badge>
                      <Badge variant="outline">3D</Badge>
                    </div>
                  </div>
                </Card>
              </DraggableCardBody>
            </DraggableCardContainer>

            <DraggableCardContainer>
              <DraggableCardBody className="w-72">
                <Card className="border-0 bg-transparent shadow-none">
                  <div className="p-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Card Arrastável 2
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cada card tem perspectiva própria e segue o gesto de
                      arrastar com inércia e bounce.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Badge>Spring</Badge>
                      <Badge variant="outline">Motion</Badge>
                    </div>
                  </div>
                </Card>
              </DraggableCardBody>
            </DraggableCardContainer>

            <DraggableCardContainer>
              <DraggableCardBody className="w-72">
                <Card className="border-0 bg-transparent shadow-none">
                  <div className="p-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Card Arrastável 3
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      A opacidade e o glare mudam conforme a posição do cursor
                      sobre o card.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Badge>Glare</Badge>
                      <Badge variant="outline">Physics</Badge>
                    </div>
                  </div>
                </Card>
              </DraggableCardBody>
            </DraggableCardContainer>
          </div>
        </TabsContent>

        {/* --------------------------------------------------------------- */}
        {/* Compare Tab                                                     */}
        {/* --------------------------------------------------------------- */}
        <TabsContent value="compare" className="mt-6">
          <div className="mx-auto max-w-3xl">
            <Compare
              firstImage="https://picsum.photos/seed/pg-compare-before/800/600"
              secondImage="https://picsum.photos/seed/pg-compare-after/800/600"
              slideMode="hover"
              className="rounded-xl border border-border"
            />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Passe o mouse sobre a imagem para comparar antes e depois.
            </p>
          </div>
        </TabsContent>

        {/* --------------------------------------------------------------- */}
        {/* Upload Tab                                                       */}
        {/* --------------------------------------------------------------- */}
        <TabsContent value="upload" className="mt-6">
          <div className="mx-auto max-w-2xl">
            <FileUpload multiple />
          </div>
        </TabsContent>
      </Tabs>

      {/* ----------------------------------------------------------------- */}
      {/* Stars Section — footer decorativo                                */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Efeito de Estrelas
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <GlowingStarsBackgroundCard>
            <GlowingStarsTitle>Interativo</GlowingStarsTitle>
            <GlowingStarsDescription>
              Passe o mouse sobre este card para ativar o brilho de todas as
              estrelas na matriz.
            </GlowingStarsDescription>
          </GlowingStarsBackgroundCard>

          <GlowingStarsBackgroundCard>
            <GlowingStarsTitle>Animado</GlowingStarsTitle>
            <GlowingStarsDescription>
              A cada 3 segundos, um grupo de estrelas aleatórias brilha com
              animação de escala e opacidade.
            </GlowingStarsDescription>
          </GlowingStarsBackgroundCard>
        </div>
      </section>
    </div>
  )
}
