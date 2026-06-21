import type { Example } from "@/data/examples"
import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Archive, Inbox, Plus } from "lucide-react"

const buttonGroupBasic: Example = {
  title: "Básico",
  description: "Botões agrupados com cantos e bordas unificados.",
  code: `<ButtonGroup>
  <Button variant="outline">Anterior</Button>
  <Button variant="outline">Próximo</Button>
</ButtonGroup>`,
  render: (
    <ButtonGroup>
      <Button variant="outline">Anterior</Button>
      <Button variant="outline">Próximo</Button>
    </ButtonGroup>
  ),
}

const buttonGroupText: Example = {
  title: "Com texto e separador",
  description:
    "ButtonGroupText para rótulos e ButtonGroupSeparator entre itens.",
  code: `<ButtonGroup>
  <ButtonGroupText>https://</ButtonGroupText>
  <Button variant="outline">vitrine.dev</Button>
  <ButtonGroupSeparator />
  <Button variant="outline">
    <Plus />
  </Button>
</ButtonGroup>`,
  render: (
    <ButtonGroup>
      <ButtonGroupText>https://</ButtonGroupText>
      <Button variant="outline">vitrine.dev</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">
        <Plus />
      </Button>
    </ButtonGroup>
  ),
}

const emptyBasic: Example = {
  title: "Estado vazio",
  description: "Empty com ícone, título, descrição e ação.",
  code: `<Empty className="border">
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Inbox />
    </EmptyMedia>
    <EmptyTitle>Nenhuma mensagem</EmptyTitle>
    <EmptyDescription>
      Quando você receber mensagens, elas aparecem aqui.
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Escrever mensagem</Button>
  </EmptyContent>
</Empty>`,
  render: (
    <Empty className="w-full max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>Nenhuma mensagem</EmptyTitle>
        <EmptyDescription>
          Quando você receber mensagens, elas aparecem aqui.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Escrever mensagem</Button>
      </EmptyContent>
    </Empty>
  ),
}

const itemBasic: Example = {
  title: "Item de lista",
  description: "Item com mídia, conteúdo e ações.",
  code: `<Item variant="outline">
  <ItemMedia variant="icon">
    <Archive />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Relatório anual</ItemTitle>
    <ItemDescription>PDF · 2,4 MB</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button variant="outline">Abrir</Button>
  </ItemActions>
</Item>`,
  render: (
    <div className="w-full max-w-md">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Archive />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Relatório anual</ItemTitle>
          <ItemDescription>PDF · 2,4 MB</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline">Abrir</Button>
        </ItemActions>
      </Item>
    </div>
  ),
}

const tooltipBasic: Example = {
  title: "Básico",
  description: "Dica ao passar o mouse ou focar o gatilho.",
  code: `<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">Passe o mouse</Button>
  </TooltipTrigger>
  <TooltipContent>Adicionar à biblioteca</TooltipContent>
</Tooltip>`,
  render: (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Passe o mouse</Button>
      </TooltipTrigger>
      <TooltipContent>Adicionar à biblioteca</TooltipContent>
    </Tooltip>
  ),
}

/** Lote de primitivos shadcn trazidos para a vitrine. */
export const examplesShadcn: Record<string, Example[]> = {
  "button-group": [buttonGroupBasic, buttonGroupText],
  empty: [emptyBasic],
  item: [itemBasic],
  tooltip: [tooltipBasic],
}
