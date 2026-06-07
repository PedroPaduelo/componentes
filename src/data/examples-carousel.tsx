import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import type { Example } from "@/data/examples"

const carouselCardsExample: Example = {
  title: "Cards",
  description: "Carrossel de cards com controles anterior/próximo.",
  code: `<Carousel className="w-full max-w-xs">
  <CarouselContent>
    {[1, 2, 3, 4, 5].map((item) => (
      <CarouselItem key={item}>
        <Card>
          <CardContent className="flex aspect-square items-center justify-center p-6">
            <span className="text-4xl font-semibold">{item}</span>
          </CardContent>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`,
  render: (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {[1, 2, 3, 4, 5].map((item) => (
          <CarouselItem key={item}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-4xl font-semibold">{item}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

const carouselImagesExample: Example = {
  title: "Imagens",
  description: "Carrossel de imagens com proporção 16/9.",
  code: `<Carousel className="w-full max-w-sm">
  <CarouselContent>
    {[1, 2, 3].map((item) => (
      <CarouselItem key={item}>
        <div className="aspect-video overflow-hidden rounded-lg border border-border">
          <img
            src={\`https://picsum.photos/seed/carousel-\${item}/600/338\`}
            alt={\`Imagem \${item}\`}
            className="h-full w-full object-cover"
          />
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`,
  render: (
    <Carousel className="w-full max-w-sm">
      <CarouselContent>
        {[1, 2, 3].map((item) => (
          <CarouselItem key={item}>
            <div className="aspect-video overflow-hidden rounded-lg border border-border">
              <img
                src={`https://picsum.photos/seed/carousel-img-${item}/600/338`}
                alt={`Imagem ${item}`}
                className="h-full w-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const examplesCarousel: Record<string, Example[]> = {
  carousel: [carouselCardsExample, carouselImagesExample],
}
