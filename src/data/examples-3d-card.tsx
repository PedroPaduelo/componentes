/**
 * Examples — 3D Card Effect (Aceternity UI).
 *
 * O CardContainer inclina o cartão seguindo o cursor; cada CardItem flutua em
 * profundidade distinta (translateZ) no hover. `code` e `render` em sincronia.
 *
 * Imagem via picsum.photos com seed fixo (estável, sem dep nova).
 */

import type { Example } from "@/data/examples"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import { Button } from "@/components/ui/button"

const card3dBasicExample: Example = {
  title: "Básico",
  description:
    "Passe o mouse sobre o cartão: ele inclina seguindo o cursor e os elementos internos flutuam em profundidades distintas.",
  code: `<CardContainer className="inter-var">
  <CardBody className="group/card relative h-auto w-[22rem] rounded-xl border border-border bg-card p-6 text-card-foreground">
    <CardItem translateZ={50} className="text-xl font-bold">
      Make things float in air
    </CardItem>
    <CardItem
      as="p"
      translateZ={60}
      className="mt-2 max-w-sm text-sm text-muted-foreground"
    >
      Hover over this card to unleash the power of CSS perspective.
    </CardItem>
    <CardItem translateZ={100} className="mt-4 w-full">
      <img
        src="https://picsum.photos/seed/3dcard/600/400"
        height={400}
        width={600}
        className="h-60 w-full rounded-xl object-cover group-hover/card:shadow-xl"
        alt="thumbnail"
      />
    </CardItem>
    <div className="mt-6 flex items-center justify-between">
      <CardItem translateZ={20} as="a" href="#" className="text-xs font-normal">
        Try now →
      </CardItem>
      <CardItem translateZ={20}>
        <Button size="sm">Sign up</Button>
      </CardItem>
    </div>
  </CardBody>
</CardContainer>`,
  render: (
    <CardContainer className="inter-var">
      <CardBody className="group/card relative h-auto w-[22rem] rounded-xl border border-border bg-card p-6 text-card-foreground">
        <CardItem translateZ={50} className="text-xl font-bold">
          Make things float in air
        </CardItem>
        <CardItem
          as="p"
          translateZ={60}
          className="mt-2 max-w-sm text-sm text-muted-foreground"
        >
          Hover over this card to unleash the power of CSS perspective.
        </CardItem>
        <CardItem translateZ={100} className="mt-4 w-full">
          <img
            src="https://picsum.photos/seed/3dcard/600/400"
            height={400}
            width={600}
            className="h-60 w-full rounded-xl object-cover group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="mt-6 flex items-center justify-between">
          <CardItem
            translateZ={20}
            as="a"
            href="#"
            className="text-xs font-normal"
          >
            Try now →
          </CardItem>
          <CardItem translateZ={20}>
            <Button size="sm">Sign up</Button>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  ),
}

const card3dRotationExample: Example = {
  title: "Com rotação",
  description:
    "A imagem ganha inclinação (rotateX/rotateZ) e os botões deslizam lateralmente (translateX) ao passar o mouse.",
  code: `<CardContainer className="inter-var">
  <CardBody className="group/card relative h-auto w-[22rem] rounded-xl border border-border bg-card p-6 text-card-foreground">
    <CardItem translateZ={50} className="text-xl font-bold">
      Tilt & slide
    </CardItem>
    <CardItem translateZ={100} rotateX={20} rotateZ={-10} className="mt-4 w-full">
      <img
        src="https://picsum.photos/seed/3dcard/600/400"
        height={400}
        width={600}
        className="h-60 w-full rounded-xl object-cover group-hover/card:shadow-xl"
        alt="thumbnail"
      />
    </CardItem>
    <div className="mt-8 flex items-center justify-between">
      <CardItem translateX={-40} translateZ={20} as="a" href="#" className="text-xs font-normal">
        ← Back
      </CardItem>
      <CardItem translateX={40} translateZ={20}>
        <Button size="sm" variant="secondary">Next</Button>
      </CardItem>
    </div>
  </CardBody>
</CardContainer>`,
  render: (
    <CardContainer className="inter-var">
      <CardBody className="group/card relative h-auto w-[22rem] rounded-xl border border-border bg-card p-6 text-card-foreground">
        <CardItem translateZ={50} className="text-xl font-bold">
          Tilt & slide
        </CardItem>
        <CardItem
          translateZ={100}
          rotateX={20}
          rotateZ={-10}
          className="mt-4 w-full"
        >
          <img
            src="https://picsum.photos/seed/3dcard/600/400"
            height={400}
            width={600}
            className="h-60 w-full rounded-xl object-cover group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="mt-8 flex items-center justify-between">
          <CardItem
            translateX={-40}
            translateZ={20}
            as="a"
            href="#"
            className="text-xs font-normal"
          >
            ← Back
          </CardItem>
          <CardItem translateX={40} translateZ={20}>
            <Button size="sm" variant="secondary">
              Next
            </Button>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  ),
}

export const examples3dCard: Record<string, Example[]> = {
  "3d-card-effect": [card3dBasicExample, card3dRotationExample],
}
