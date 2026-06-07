import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Example } from "@/data/examples"

const radioGroupBasicExample: Example = {
  title: "Básico",
  description: "Grupo de radio buttons com seleção exclusiva e labels associados.",
  code: `<RadioGroup defaultValue="option-one">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option-three" id="option-three" />
    <Label htmlFor="option-three">Option Three</Label>
  </div>
</RadioGroup>`,
  render: (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <label htmlFor="option-one" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option One
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <label htmlFor="option-two" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option Two
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-three" id="option-three" />
        <label htmlFor="option-three" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option Three
        </label>
      </div>
    </RadioGroup>
  ),
}

const radioGroupDisabledExample: Example = {
  title: "Desabilitado",
  description: "Grupo inteiro ou itens individuais podem ser desabilitados.",
  code: `<RadioGroup defaultValue="option-one" disabled>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option-one" id="d-option-one" />
    <Label htmlFor="d-option-one">Option One</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option-two" id="d-option-two" />
    <Label htmlFor="d-option-two">Option Two</Label>
  </div>
</RadioGroup>`,
  render: (
    <RadioGroup defaultValue="option-one" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-one" id="d-option-one" />
        <label htmlFor="d-option-one" className="text-sm font-medium leading-none text-muted-foreground">
          Option One
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-two" id="d-option-two" />
        <label htmlFor="d-option-two" className="text-sm font-medium leading-none text-muted-foreground">
          Option Two
        </label>
      </div>
    </RadioGroup>
  ),
}

const radioGroupVerticalExample: Example = {
  title: "Layout vertical",
  description: "Empilhados verticalmente com espaçamento consistente para formulários.",
  code: `<div className="space-y-4">
  <div>
    <p className="text-sm font-medium mb-3">Notificações</p>
    <RadioGroup defaultValue="all">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="all" id="n-all" />
        <Label htmlFor="n-all">Todas</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="mentions" id="n-mentions" />
        <Label htmlFor="n-mentions">Apenas menções</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="none" id="n-none" />
        <Label htmlFor="n-none">Nenhuma</Label>
      </div>
    </RadioGroup>
  </div>
</div>`,
  render: (
    <div className="space-y-4">
      <div>
        <p className="mb-3 text-sm font-medium">Notificações</p>
        <RadioGroup defaultValue="all">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="n-all" />
            <label htmlFor="n-all" className="text-sm font-medium leading-none">
              Todas
            </label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="mentions" id="n-mentions" />
            <label htmlFor="n-mentions" className="text-sm font-medium leading-none">
              Apenas menções
            </label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="none" id="n-none" />
            <label htmlFor="n-none" className="text-sm font-medium leading-none">
              Nenhuma
            </label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
}

export const examplesRadioGroup: Record<string, Example[]> = {
  "radio-group": [
    radioGroupBasicExample,
    radioGroupDisabledExample,
    radioGroupVerticalExample,
  ],
}
