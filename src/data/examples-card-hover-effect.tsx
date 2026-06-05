import { HoverEffect } from "@/components/ui/card-hover-effect"
import type { Example } from "@/data/examples"

const cardHoverEffectBasicExample: Example = {
  title: "Básico",
  description:
    "Grid de cards onde um fundo destacado desliza suavemente entre os itens ao passar o mouse.",
  code: `<HoverEffect
  items={[
    {
      title: "Stripe",
      description:
        "Plataforma de pagamentos online para a internet. Aceite cartões e gerencie negócios globalmente.",
      link: "https://stripe.com",
    },
    {
      title: "Netflix",
      description:
        "Serviço de streaming com filmes, séries e documentários premiados em milhares de dispositivos.",
      link: "https://netflix.com",
    },
    {
      title: "Google",
      description:
        "Mecanismo de busca líder mundial, organizando a informação do mundo e tornando-a acessível.",
      link: "https://google.com",
    },
    {
      title: "Meta",
      description:
        "Construindo tecnologias que ajudam pessoas a se conectar, encontrar comunidades e crescer negócios.",
      link: "https://meta.com",
    },
    {
      title: "Amazon",
      description:
        "Companhia de e-commerce e computação em nuvem, focada em conveniência e seleção para o cliente.",
      link: "https://amazon.com",
    },
    {
      title: "Microsoft",
      description:
        "Empresa de tecnologia que desenvolve software, serviços de nuvem e dispositivos para todos.",
      link: "https://microsoft.com",
    },
  ]}
/>`,
  render: (
    <div className="w-full px-4">
      <HoverEffect
        items={[
          {
            title: "Stripe",
            description:
              "Plataforma de pagamentos online para a internet. Aceite cartões e gerencie negócios globalmente.",
            link: "https://stripe.com",
          },
          {
            title: "Netflix",
            description:
              "Serviço de streaming com filmes, séries e documentários premiados em milhares de dispositivos.",
            link: "https://netflix.com",
          },
          {
            title: "Google",
            description:
              "Mecanismo de busca líder mundial, organizando a informação do mundo e tornando-a acessível.",
            link: "https://google.com",
          },
          {
            title: "Meta",
            description:
              "Construindo tecnologias que ajudam pessoas a se conectar, encontrar comunidades e crescer negócios.",
            link: "https://meta.com",
          },
          {
            title: "Amazon",
            description:
              "Companhia de e-commerce e computação em nuvem, focada em conveniência e seleção para o cliente.",
            link: "https://amazon.com",
          },
          {
            title: "Microsoft",
            description:
              "Empresa de tecnologia que desenvolve software, serviços de nuvem e dispositivos para todos.",
            link: "https://microsoft.com",
          },
        ]}
      />
    </div>
  ),
}

export const examplesCardHoverEffect: Record<string, Example[]> = {
  "card-hover-effect": [cardHoverEffectBasicExample],
}
