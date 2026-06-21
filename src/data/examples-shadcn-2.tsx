import type { Example } from "@/data/examples"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Bold, Italic, Search, Underline } from "lucide-react"

const labelBasic: Example = {
  title: "Com input",
  description: "Label associado a um campo via htmlFor.",
  code: `<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="voce@exemplo.com" />
</div>`,
  render: (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="email-ex">Email</Label>
      <Input id="email-ex" type="email" placeholder="voce@exemplo.com" />
    </div>
  ),
}

const fieldBasic: Example = {
  title: "Campo de formulário",
  description: "Field agrupa label, controle e descrição.",
  code: `<Field>
  <FieldLabel htmlFor="user">Usuário</FieldLabel>
  <Input id="user" placeholder="@manus" />
  <FieldDescription>Seu nome público no perfil.</FieldDescription>
</Field>`,
  render: (
    <div className="w-full max-w-sm">
      <Field>
        <FieldLabel htmlFor="user-ex">Usuário</FieldLabel>
        <Input id="user-ex" placeholder="@manus" />
        <FieldDescription>Seu nome público no perfil.</FieldDescription>
      </Field>
    </div>
  ),
}

const toggleGroupBasic: Example = {
  title: "Múltipla seleção",
  description: "ToggleGroup type='multiple' para formatação de texto.",
  code: `<ToggleGroup type="multiple">
  <ToggleGroupItem value="bold">
    <Bold />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic">
    <Italic />
  </ToggleGroupItem>
  <ToggleGroupItem value="underline">
    <Underline />
  </ToggleGroupItem>
</ToggleGroup>`,
  render: (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Negrito">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Itálico">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Sublinhado">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

const kbdBasic: Example = {
  title: "Atalho de teclado",
  description: "Kbd e KbdGroup para representar teclas e combinações.",
  code: `<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>`,
  render: (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
}

const spinnerBasic: Example = {
  title: "Básico",
  description: "Indicador de carregamento giratório.",
  code: `<Spinner />`,
  render: <Spinner />,
}

const inputGroupBasic: Example = {
  title: "Com ícone",
  description: "InputGroup com addon de ícone alinhado ao início.",
  code: `<InputGroup>
  <InputGroupAddon align="inline-start">
    <Search />
  </InputGroupAddon>
  <InputGroupInput placeholder="Buscar..." />
</InputGroup>`,
  render: (
    <div className="w-full max-w-sm">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Buscar..." />
      </InputGroup>
    </div>
  ),
}

/** Segundo lote de primitivos shadcn (forms, toggle-group, kbd, spinner). */
export const examplesShadcn2: Record<string, Example[]> = {
  label: [labelBasic],
  field: [fieldBasic],
  "toggle-group": [toggleGroupBasic],
  kbd: [kbdBasic],
  spinner: [spinnerBasic],
  "input-group": [inputGroupBasic],
}
