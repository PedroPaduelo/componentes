import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"

export const examplesCollapsible: Record<string, Example[]> = {
  collapsible: [
    {
      title: "Básico",
      description:
        "Expande e recolhe conteúdo com um gatilho clicável e transição CSS suave.",
      code: `<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="outline" className="w-full justify-between">
      Detalhes do pedido
      <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="mt-2 rounded-md border border-border p-4 text-sm text-muted-foreground">
    <p>Pedido #12345 • Status: Em trânsito</p>
    <p className="mt-1">Entrega estimada: 15 de junho</p>
  </CollapsibleContent>
</Collapsible>`,
      render: (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Detalhes do pedido
              <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-md border border-border p-4 text-sm text-muted-foreground">
            <p>Pedido #12345 • Status: Em trânsito</p>
            <p className="mt-1">Entrega estimada: 15 de junho</p>
          </CollapsibleContent>
        </Collapsible>
      ),
    },
    {
      title: "FAQ",
      description:
        "Perguntas frequentes com abertura em cascata — cada item abre independentemente.",
      code: `<div className="space-y-2">
  <Collapsible className="rounded-md border border-border p-4">
    <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
      Como faço para redefinir minha senha?
      <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
    <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
      Acesse Configurações → Segurança → Redefinir senha. Um
      link será enviado para seu e-mail cadastrado em até 2 minutos.
    </CollapsibleContent>
  </Collapsible>
  <Collapsible className="rounded-md border border-border p-4">
    <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
      Posso exportar meus dados?
      <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
    <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
      Sim. Vá até Configurações → Privacidade → Exportar dados e
      escolha o formato (JSON ou CSV). O download começa automaticamente.
    </CollapsibleContent>
  </Collapsible>
</div>`,
      render: (
        <div className="space-y-2">
          <Collapsible className="rounded-md border border-border p-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
              Como faço para redefinir minha senha?
              <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
              Acesse Configurações → Segurança → Redefinir senha. Um
              link será enviado para seu e-mail cadastrado em até 2 minutos.
            </CollapsibleContent>
          </Collapsible>
          <Collapsible className="rounded-md border border-border p-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
              Posso exportar meus dados?
              <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
              Sim. Vá até Configurações → Privacidade → Exportar dados e
              escolha o formato (JSON ou CSV). O download começa automaticamente.
            </CollapsibleContent>
          </Collapsible>
        </div>
      ),
    },
    {
      title: "Aninhado",
      description:
        "Collapsibles aninhados para criar hierarquias de informação expansíveis.",
      code: `<Collapsible className="rounded-md border border-border p-4">
  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
    Configurações avançadas
    <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
  </CollapsibleTrigger>
  <CollapsibleContent className="mt-3 space-y-2">
    <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Notificações</p>
      <p className="mt-1">Gerencie preferências de e-mail e push.</p>
    </div>
    <Collapsible className="rounded-md border border-border/60 p-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between text-sm">
        Segurança extra
        <ChevronDownIcon className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
        Ative autenticação em dois fatores e apps de autenticação.
      </CollapsibleContent>
    </Collapsible>
  </CollapsibleContent>
</Collapsible>`,
      render: (
        <Collapsible className="rounded-md border border-border p-4">
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
            Configurações avançadas
            <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Notificações</p>
              <p className="mt-1">Gerencie preferências de e-mail e push.</p>
            </div>
            <Collapsible className="rounded-md border border-border/60 p-3">
              <CollapsibleTrigger className="flex w-full items-center justify-between text-sm">
                Segurança extra
                <ChevronDownIcon className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
                Ative autenticação em dois fatores e apps de autenticação.
              </CollapsibleContent>
            </Collapsible>
          </CollapsibleContent>
        </Collapsible>
      ),
    },
  ],
}

type Example = {
  title: string
  description?: string
  code: string
  render: React.ReactNode
}
