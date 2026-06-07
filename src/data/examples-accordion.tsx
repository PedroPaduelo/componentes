import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Example } from "@/data/examples"

const accordionBasicExample: Example = {
  title: "Básico",
  description: "Accordion com múltiplos itens. Por padrão permite apenas um item aberto por vez.",
  code: `<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles that match your
      design system.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Is it animated?</AccordionTrigger>
    <AccordionContent>
      Yes. It's animated by default, but you can disable it if
      you prefer.
    </AccordionContent>
  </AccordionItem>
</Accordion>`,
  render: (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match your design system.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you
          prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

const accordionMultipleExample: Example = {
  title: "Múltiplo",
  description: "Permite vários itens abertos simultaneamente com type=\"multiple\".",
  code: `<Accordion type="multiple" className="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>First section</AccordionTrigger>
    <AccordionContent>This section can stay open while you open others.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Second section</AccordionTrigger>
    <AccordionContent>Multiple items can be expanded at the same time.</AccordionContent>
  </AccordionItem>
</Accordion>`,
  render: (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>First section</AccordionTrigger>
        <AccordionContent>
          This section can stay open while you open others.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second section</AccordionTrigger>
        <AccordionContent>
          Multiple items can be expanded at the same time.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const examplesAccordion: Record<string, Example[]> = {
  accordion: [accordionBasicExample, accordionMultipleExample],
}
