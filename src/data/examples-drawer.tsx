import type { Example } from "@/data/examples"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const drawerBasicExample: Example = {
  title: "B\u00e1sico",
  description: "Drawer que abre a partir da base da tela com handle visual.",
  code: `<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Abrir drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>
        Conte\u00fado do drawer com descri\u00e7\u00e3o.
      </DrawerDescription>
    </DrawerHeader>
    <div className="p-4">
      <p className="text-sm text-muted-foreground">
        Este \u00e9 o conte\u00fado do drawer.
      </p>
    </div>
    <DrawerFooter>
      <Button>Salvar</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancelar</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`,
  render: (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>
            Conteúdo do drawer com descrição.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Este é o conteúdo do drawer.
          </p>
        </div>
        <DrawerFooter>
          <Button size="sm">Salvar</Button>
          <DrawerClose asChild>
            <Button size="sm" variant="outline">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

const drawerFormExample: Example = {
  title: "Com formul\u00e1rio",
  description: "Drawer com campos de entrada para edição rápida.",
  code: `<Drawer>
  <DrawerTrigger asChild>
    <Button>Novo item</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Criar item</DrawerTitle>
      <DrawerDescription>
        Preencha os dados e salve.
      </DrawerDescription>
    </DrawerHeader>
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome</label>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Nome do item"
        />
      </div>
    </div>
    <DrawerFooter>
      <Button>Criar</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancelar</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`,
  render: (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Novo item</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Criar item</DrawerTitle>
          <DrawerDescription>
            Preencha os dados e salve.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Nome do item"
            />
          </div>
        </div>
        <DrawerFooter>
          <Button size="sm">Criar</Button>
          <DrawerClose asChild>
            <Button size="sm" variant="outline">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const examplesDrawer: Record<string, Example[]> = {
  drawer: [drawerBasicExample, drawerFormExample],
}
