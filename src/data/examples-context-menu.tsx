import type { Example } from "@/data/examples"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"

export const examplesContextMenu: Record<string, Example[]> = {
  "context-menu": [
    {
      title: "Menu de Contexto",
      description: "Menu de contexto (clique direito) com itens e separador.",
      code: `<ContextMenu>
  <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
    Clique direito aqui
  </ContextMenuTrigger>
  <ContextMenuContent className="w-64">
    <ContextMenuItem inset>Voltar</ContextMenuItem>
    <ContextMenuItem inset disabled>Avançar</ContextMenuItem>
    <ContextMenuItem inset>Recarregar</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuLabel inset>Ações</ContextMenuLabel>
    <ContextMenuItem inset>Salvar como...</ContextMenuItem>
    <ContextMenuItem inset>Imprimir...</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
      render: (
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Clique direito aqui
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem inset>Voltar</ContextMenuItem>
            <ContextMenuItem inset disabled>Avançar</ContextMenuItem>
            <ContextMenuItem inset>Recarregar</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuLabel inset>Ações</ContextMenuLabel>
            <ContextMenuItem inset>Salvar como...</ContextMenuItem>
            <ContextMenuItem inset>Imprimir...</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ),
    },
  ],
}
