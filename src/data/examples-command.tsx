import {
  Calendar,
  Settings,
  User,
} from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { CommandDialogExample } from "./examples-command-dialog"

export const examplesCommand: Record<string, import("@/data/examples").Example[]> = {
  command: [
    {
      title: "Command Dialog",
      description: "Palette de comandos estilo Spotlight/Alfred ativada por botão, com busca e agrupamento de ações.",
      code: `<CommandDialog>
  <CommandInput placeholder="Digite um comando ou pesquise..." />
  <CommandList>
    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
    <CommandGroup heading="Sugestões">
      <CommandItem>
        <Calendar className="mr-2 h-4 w-4" />
        <span>Calendário</span>
      </CommandItem>
      <CommandItem>
        <Smile className="mr-2 h-4 w-4" />
        <span>Buscar Emoji</span>
      </CommandItem>
      <CommandItem>
        <Calculator className="mr-2 h-4 w-4" />
        <span>Calculadora</span>
      </CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Configurações">
      <CommandItem>
        <User className="mr-2 h-4 w-4" />
        <span>Perfil</span>
        <CommandShortcut>⌘P</CommandShortcut>
      </CommandItem>
      <CommandItem>
        <CreditCard className="mr-2 h-4 w-4" />
        <span>Faturamento</span>
        <CommandShortcut>⌘B</CommandShortcut>
      </CommandItem>
      <CommandItem>
        <Settings className="mr-2 h-4 w-4" />
        <span>Configurações</span>
        <CommandShortcut>⌘S</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`,
      render: <CommandDialogExample />,
    },
    {
      title: "Command Inline",
      description: "Command embedado diretamente no layout, sem dialog — ideal para toolbars e campos de busca.",
      code: `<Command className="rounded-lg border shadow-md">
  <CommandInput placeholder="Buscar comandos..." />
  <CommandList>
    <CommandEmpty>Nenhum comando encontrado.</CommandEmpty>
    <CommandGroup heading="Ações">
      <CommandItem>
        <Calendar className="mr-2 h-4 w-4" />
        <span>Novo evento</span>
        <CommandShortcut>⌘N</CommandShortcut>
      </CommandItem>
      <CommandItem>
        <User className="mr-2 h-4 w-4" />
        <span>Convidar membro</span>
      </CommandItem>
      <CommandItem>
        <Settings className="mr-2 h-4 w-4" />
        <span>Abrir configurações</span>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
      render: (
        <div className="w-full max-w-lg">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Buscar comandos..." />
            <CommandList>
              <CommandEmpty>Nenhum comando encontrado.</CommandEmpty>
              <CommandGroup heading="Ações">
                <CommandItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Novo evento</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Convidar membro</span>
                </CommandItem>
                <CommandItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Abrir configurações</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      ),
    },
  ],
}
