import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import type { Example } from "@/data/examples"

const TESTIMONIALS = [
  {
    quote:
      "Foi a coisa mais doce, mais feliz dos nossos dias — e tudo o que vivemos depois ganhou cor por causa dela.",
    name: "Charles Dickens",
    title: "A Tale of Two Cities",
  },
  {
    quote:
      "Ser ou não ser, eis a questão: se é mais nobre na mente sofrer as flechadas da fortuna ultrajante.",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "Todos os animais são iguais, mas alguns são mais iguais que outros.",
    name: "George Orwell",
    title: "A Revolução dos Bichos",
  },
  {
    quote:
      "É uma verdade universalmente reconhecida que um homem solteiro com boa fortuna precisa de uma esposa.",
    name: "Jane Austen",
    title: "Orgulho e Preconceito",
  },
  {
    quote:
      "Chame-me Ishmael. Há alguns anos — não importa quanto exatamente — resolvi navegar um pouco e ver a parte aquosa do mundo.",
    name: "Herman Melville",
    title: "Moby Dick",
  },
]

const infiniteMovingCardsBasic: Example = {
  title: "Carrossel infinito",
  description:
    "Os cards rolam em loop contínuo da direita para a esquerda. Internamente os itens são duplicados em runtime e a animação CSS (--animation-duration) faz a esteira correr sem emendas. Passe direction, speed e pauseOnHover.",
  code: `<InfiniteMovingCards
  items={[
    {
      quote: "Foi a coisa mais doce, mais feliz dos nossos dias.",
      name: "Charles Dickens",
      title: "A Tale of Two Cities",
    },
    {
      quote: "Ser ou não ser, eis a questão.",
      name: "William Shakespeare",
      title: "Hamlet",
    },
    {
      quote: "Todos os animais são iguais, mas alguns são mais iguais.",
      name: "George Orwell",
      title: "A Revolução dos Bichos",
    },
  ]}
  direction="left"
  speed="fast"
/>`,
  render: (
    <div className="flex w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background py-6">
      <InfiniteMovingCards items={TESTIMONIALS} direction="left" speed="fast" />
    </div>
  ),
}

const infiniteMovingCardsSlow: Example = {
  title: "Direção e velocidade",
  description:
    "Aqui a esteira corre para a direita (direction=\"right\") em ritmo lento (speed=\"slow\"). Por padrão pauseOnHover pausa a animação ao passar o mouse, deixando o usuário ler com calma.",
  code: `<InfiniteMovingCards
  items={testimonials}
  direction="right"
  speed="slow"
  pauseOnHover
/>`,
  render: (
    <div className="flex w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background py-6">
      <InfiniteMovingCards
        items={TESTIMONIALS}
        direction="right"
        speed="slow"
        pauseOnHover
      />
    </div>
  ),
}

export const examplesInfiniteMovingCards: Record<string, Example[]> = {
  "infinite-moving-cards": [
    infiniteMovingCardsBasic,
    infiniteMovingCardsSlow,
  ],
}
