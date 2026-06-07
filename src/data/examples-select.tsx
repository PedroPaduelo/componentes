import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Example } from "@/data/examples"

const selectBasicExample: Example = {
  title: "Básico",
  description: "Select simples com placeholder e lista de opções.",
  code: `<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Selecione um tema" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>`,
  render: (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione um tema" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  ),
}

const selectWithGroupsExample: Example = {
  title: "Com grupos",
  description: "Select com grupos de opções e separadores.",
  code: `<Select>
  <SelectTrigger className="w-[240px]">
    <SelectValue placeholder="Escolha um framework" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>React</SelectLabel>
      <SelectItem value="next">Next.js</SelectItem>
      <SelectItem value="remix">Remix</SelectItem>
      <SelectItem value="gatsby">Gatsby</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Vue</SelectLabel>
      <SelectItem value="nuxt">Nuxt</SelectItem>
      <SelectItem value="quasar">Quasar</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Outros</SelectLabel>
      <SelectItem value="svelte">Svelte</SelectItem>
      <SelectItem value="astro">Astro</SelectItem>
      <SelectItem value="solid">Solid</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`,
  render: (
    <Select>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Escolha um framework" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>React</SelectLabel>
          <SelectItem value="next">Next.js</SelectItem>
          <SelectItem value="remix">Remix</SelectItem>
          <SelectItem value="gatsby">Gatsby</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vue</SelectLabel>
          <SelectItem value="nuxt">Nuxt</SelectItem>
          <SelectItem value="quasar">Quasar</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Outros</SelectLabel>
          <SelectItem value="svelte">Svelte</SelectItem>
          <SelectItem value="astro">Astro</SelectItem>
          <SelectItem value="solid">Solid</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

const selectDisabledExample: Example = {
  title: "Desabilitado",
  description: "Select desabilitado e com tamanho customizado.",
  code: `<Select disabled>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Indisponível" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opção 1</SelectItem>
    <SelectItem value="option2">Opção 2</SelectItem>
  </SelectContent>
</Select>`,
  render: (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Indisponível" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Opção 1</SelectItem>
        <SelectItem value="option2">Opção 2</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const examplesSelect: Record<string, Example[]> = {
  select: [selectBasicExample, selectWithGroupsExample, selectDisabledExample],
}
