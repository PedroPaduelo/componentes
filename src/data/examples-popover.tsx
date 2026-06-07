import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Example } from "@/data/examples"

const popoverBasicExample: Example = {
  title: "Básico",
  description: "Popover simples com trigger e conteúdo.",
  code: `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Abrir popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-2">
      <h4 className="font-medium">Bem-vindo</h4>
      <p className="text-sm text-muted-foreground">
        Este é um popover básico com conteúdo livre.
      </p>
    </div>
  </PopoverContent>
</Popover>`,
  render: (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium">Bem-vindo</h4>
          <p className="text-sm text-muted-foreground">
            Este é um popover básico com conteúdo livre.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

const popoverFormExample: Example = {
  title: "Com formulário e posicionamento",
  description: "Popover alinhado à direita com formulário de notificações.",
  code: `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Notificações</Button>
  </PopoverTrigger>
  <PopoverContent align="end" className="w-80">
    <div className="space-y-2">
      <h4 className="font-medium">Notificações</h4>
      <p className="text-sm text-muted-foreground">
        Configure como deseja receber notificações.
      </p>
      <Input type="email" placeholder="seu@email.com" />
      <div className="flex justify-end">
        <Button size="sm">Salvar</Button>
      </div>
    </div>
  </PopoverContent>
</Popover>`,
  render: (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Notificações</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Notificações</h4>
          <p className="text-sm text-muted-foreground">
            Configure como deseja receber notificações.
          </p>
          <Input type="email" placeholder="seu@email.com" />
          <div className="flex justify-end">
            <Button size="sm">Salvar</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const examplesPopover: Record<string, Example[]> = {
  popover: [popoverBasicExample, popoverFormExample],
}
