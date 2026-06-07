import type { Example } from "@/data/examples"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

export const examplesMenubar: Record<string, Example[]> = {
  menubar: [
    {
      title: "Barra de Menus",
      description: "Barra de menus estilo desktop com menus File, Edit e View.",
      code: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>Arquivo</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        Nova aba <MenubarShortcut>⌘T</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>Nova janela</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Compartilhar</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Imprimir</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Editar</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        Desfazer <MenubarShortcut>⌘Z</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Refazer <MenubarShortcut>⇧⌘Z</MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Ver</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Recarregar</MenubarItem>
      <MenubarItem>Tela cheia</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
      render: (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Arquivo</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Nova aba <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Nova janela</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Compartilhar</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Imprimir</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Editar</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Desfazer <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Refazer <MenubarShortcut>⇧⌘Z</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Ver</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Recarregar</MenubarItem>
              <MenubarItem>Tela cheia</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      ),
    },
  ],
}
