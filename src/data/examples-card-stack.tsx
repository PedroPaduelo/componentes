import { CardStack, Highlight } from "@/components/ui/card-stack"
import type { Example } from "@/data/examples"

const cardStackBasicExample: Example = {
  title: "Básico",
  description:
    "Pilha de testimonials que rotaciona automaticamente a cada ~5s. Use <Highlight> pra destacar trechos em emerald.",
  code: `<CardStack
  items={[
    {
      id: 0,
      name: "Manu Arora",
      designation: "Senior Software Engineer",
      content: (
        <p>
          These cards are amazing, <Highlight>I want to use them</Highlight>{" "}
          in my project. Framer motion is a godsend.
        </p>
      ),
    },
    {
      id: 1,
      name: "Elon Musk",
      designation: "Senior Shitposter",
      content: (
        <p>
          I dont like this Twitter thing,{" "}
          <Highlight>deleting it right away</Highlight> because yolo. Instead, I
          would like to call it <Highlight>X.com</Highlight> so that it can be
          more inclusive.
        </p>
      ),
    },
    {
      id: 2,
      name: "Tyler Durden",
      designation: "Manager Project Mayhem",
      content: (
        <p>
          The first rule of <Highlight>Fight Club</Highlight> is that you do not
          talk about fight club. The second rule of{" "}
          <Highlight>Fight club</Highlight> is that you DO NOT TALK about fight
          club.
        </p>
      ),
    },
  ]}
/>`,
  render: (
    <div className="relative flex h-[420px] w-full items-center justify-center">
      <CardStack
        items={[
          {
            id: 0,
            name: "Manu Arora",
            designation: "Senior Software Engineer",
            content: (
              <p>
                These cards are amazing,{" "}
                <Highlight>I want to use them</Highlight> in my project. Framer
                motion is a godsend.
              </p>
            ),
          },
          {
            id: 1,
            name: "Elon Musk",
            designation: "Senior Shitposter",
            content: (
              <p>
                I dont like this Twitter thing,{" "}
                <Highlight>deleting it right away</Highlight> because yolo.
                Instead, I would like to call it <Highlight>X.com</Highlight> so
                that it can be more inclusive.
              </p>
            ),
          },
          {
            id: 2,
            name: "Tyler Durden",
            designation: "Manager Project Mayhem",
            content: (
              <p>
                The first rule of <Highlight>Fight Club</Highlight> is that you
                do not talk about fight club. The second rule of{" "}
                <Highlight>Fight club</Highlight> is that you DO NOT TALK about
                fight club.
              </p>
            ),
          },
        ]}
      />
    </div>
  ),
}

export const examplesCardStack: Record<string, Example[]> = {
  "card-stack": [cardStackBasicExample],
}
