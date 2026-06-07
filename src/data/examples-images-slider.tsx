import { ImagesSlider } from "@/components/ui/images-slider"
import type { Example } from "@/data/examples"

const heroImages = [
  "https://picsum.photos/seed/slider-hero-1/1920/1080",
  "https://picsum.photos/seed/slider-hero-2/1920/1080",
  "https://picsum.photos/seed/slider-hero-3/1920/1080",
]

const galleryImages = [
  "https://picsum.photos/seed/slider-gallery-1/1920/1080",
  "https://picsum.photos/seed/slider-gallery-2/1920/1080",
  "https://picsum.photos/seed/slider-gallery-3/1920/1080",
  "https://picsum.photos/seed/slider-gallery-4/1920/1080",
]

const heroExample: Example = {
  title: "Hero com chamada centralizada",
  description:
    "Slider em autoplay com overlay escuro e conteúdo sobreposto. Use as setas do teclado (← →) para navegar manualmente.",
  code: `<div className="h-[28rem] w-full overflow-hidden rounded-xl">
  <ImagesSlider
    images={[
      "/img/1.jpg",
      "/img/2.jpg",
      "/img/3.jpg",
    ]}
  >
    <div className="z-50 flex flex-col items-center justify-center">
      <p className="text-center text-3xl font-bold text-white sm:text-5xl">
        Histórias que se movem <br /> em cada frame
      </p>
    </div>
  </ImagesSlider>
</div>`,
  render: (
    <div className="h-[28rem] w-full overflow-hidden rounded-xl">
      <ImagesSlider images={heroImages}>
        <div className="z-50 flex flex-col items-center justify-center">
          <p className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text px-4 text-center text-3xl font-bold text-transparent sm:text-5xl">
            Histórias que se movem <br /> em cada frame
          </p>
        </div>
      </ImagesSlider>
    </div>
  ),
}

const downwardExample: Example = {
  title: "Saída para baixo, sem overlay",
  description:
    "Direção de saída `down` e overlay desativado, deixando as imagens em evidência. Autoplay a cada 5s.",
  code: `<div className="h-80 w-full overflow-hidden rounded-xl">
  <ImagesSlider
    direction="down"
    overlay={false}
    images={[
      "/img/a.jpg",
      "/img/b.jpg",
      "/img/c.jpg",
      "/img/d.jpg",
    ]}
  >
    <div className="z-50 rounded-md bg-black/50 px-4 py-2 backdrop-blur">
      <p className="text-center text-xl font-semibold text-white">
        Galeria em loop
      </p>
    </div>
  </ImagesSlider>
</div>`,
  render: (
    <div className="h-80 w-full overflow-hidden rounded-xl">
      <ImagesSlider direction="down" overlay={false} images={galleryImages}>
        <div className="z-50 rounded-md bg-black/50 px-4 py-2 backdrop-blur">
          <p className="text-center text-xl font-semibold text-white">
            Galeria em loop
          </p>
        </div>
      </ImagesSlider>
    </div>
  ),
}

export const examplesImagesSlider: Record<string, Example[]> = {
  "images-slider": [heroExample, downwardExample],
}
