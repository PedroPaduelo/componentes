/**
 * RadioCardGroupTremor — radio group onde cada opção é um CARD selecionável
 * (não botão circular). Ideal para "escolha um plano", "escolha um método de
 * pagamento", "escolha um tipo de assinatura", etc.
 *
 * Diferente do `radio-group.tsx` shadcn (Radix RadioGroup com Circle indicator
 * em botões circulares), esta variante renderiza cada item como um card
 * horizontal com ícone + título + descrição. Mantém a acessibilidade de
 * radiogroup (radios verdadeiros, navegáveis por setas).
 *
 * Adaptado do Tremor Raw (https://github.com/tremorlabs/tremor/blob/main/src/components/RadioCardGroup/RadioCardGroup.tsx)
 * para o padrão Vitrine:
 *   • `cx()` → importado de `@/lib/tremor-utils` (não de `@/lib/utils`,
 *     alinhado com os demais `-tremor` da onda).
 *   • `forwardRef` + `displayName`, JSX raiz com `data-slot="radio-card-group-tremor"`
 *     e `tremor-id="tremor-raw"` (mantido! permite ao validador distinguir Tremor).
 *   • Sem `"use client"` (não usamos Next.js).
 *   • API simplificada: recebe `items: RadioCardGroupTremorItem[]` em vez
 *     de children — ergonomia melhor para "escolha um plano" e casa com o
 *     AC da task O4.2.
 *   • Controlled/uncontrolled via `value` + `defaultValue` + `onValueChange`
 *     (mesmo padrão dos Tabs shadcn).
 *   • Item com ícone opcional: aceita `React.ElementType` (ex.: `CreditCard`
 *     do lucide-react) — renderizado como `<Icon className="size-5" />` à
 *     esquerda do label.
 *   • Tailwind v4: classes Tremor copiadas 1:1 (literais, sem interpolação).
 *   • Acessibilidade: `role="radiogroup"` no container + Radix Item com
 *     `role="radio"` + `aria-checked` automático. Keyboard nav (setas) é
 *     responsabilidade do Radix (built-in).
 *
 * @see https://www.tremor.so/docs/components/radio-card-group
 */

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cx } from "@/lib/tremor-utils"

/**
 * Item individual do card. `value` é a chave semântica que identifica a
 * opção ativa; `label` é o título do card; `description` é a linha
 * secundária (opcional); `icon` é um component lucide-style (qualquer
 * `React.ElementType` que aceite `className`).
 */
export interface RadioCardGroupTremorItem {
  /** Chave única da opção (usada por `value`/`defaultValue`/`onValueChange`). */
  value: string
  /** Título em destaque (linha 1, com ícone à esquerda). */
  label: string
  /** Descrição secundária (linha 2, abaixo do label). */
  description?: string
  /** Ícone opcional à esquerda do label (ex.: `CreditCard` do lucide-react). */
  icon?: React.ElementType
  /** Desabilita cliques e esmaece o card. */
  disabled?: boolean
}

export interface RadioCardGroupTremorProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    "children"
  > {
  /**
   * Lista de cards. Renderizados na ordem fornecida; o card cujo `value`
   * casa com `value`/`defaultValue` recebe o estilo de selecionado.
   */
  items: RadioCardGroupTremorItem[]
}

/**
 * Versão "render-only" de um card individual — usada internamente e
 * exportada para consumidores que queiram montar layouts customizados.
 */
export interface RadioCardGroupTremorCardProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    "value" | "disabled"
  > {
  item: RadioCardGroupTremorItem
  selected: boolean
}

const RadioCardGroupTremorCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioCardGroupTremorCardProps
>(({ item, selected, className, children, ...props }, forwardedRef) => {
  const { label, description, icon: Icon, disabled } = item
  return (
    <RadioGroupPrimitive.Item
      ref={forwardedRef}
      value={item.value}
      disabled={disabled}
      className={cx(
        // base
        "group relative flex w-full rounded-md border p-4 text-left shadow-xs transition focus:outline-hidden",
        // background color (token de tema)
        "bg-card text-card-foreground",
        // border color (controlado via `selected`)
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-muted-foreground/40",
        // não-controlado: reflete o estado REAL do Radix (data-state) — sem
        // isso, com defaultValue (value=undefined) nenhum card destacava.
        "data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary/20",
        // disabled
        disabled
          ? "cursor-not-allowed border-border bg-muted opacity-60 shadow-none"
          : "cursor-pointer",
        // focus ring do tema (substitui o focusRing azul do Tremor)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {Icon ? (() => {
        const IconComponent = Icon as React.ComponentType<{
          className?: string
          "aria-hidden"?: boolean
        }>
        return (
          <IconComponent
            className="mr-3 size-5 shrink-0 text-muted-foreground group-data-[state=checked]:text-primary"
            aria-hidden={true}
          />
        )
      })() : null}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {label}
        </span>
        {description ? (
          <span className="text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </div>
      {/* Indicador visual à direita: bolinha preenchida quando selecionado. */}
      <span
        aria-hidden={true}
        className={cx(
          "ml-3 flex size-4 shrink-0 items-center justify-center rounded-full border transition",
          selected
            ? "border-primary bg-primary"
            : "border-border bg-card",
          // não-controlado: acompanha o data-state do Radix Item (group)
          "group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary",
        )}
      >
        <RadioGroupPrimitive.Indicator>
          <span className="size-1.5 rounded-full bg-primary-foreground" />
        </RadioGroupPrimitive.Indicator>
      </span>
      {children}
    </RadioGroupPrimitive.Item>
  )
})

RadioCardGroupTremorCard.displayName = "RadioCardGroupTremorCard"

const RadioCardGroupTremor = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioCardGroupTremorProps
>(
  (
    {
      items,
      value,
      className,
      ...props
    },
    forwardedRef,
  ) => {
    return (
      <RadioGroupPrimitive.Root
        ref={forwardedRef}
        data-slot="radio-card-group-tremor"
        tremor-id="tremor-raw"
        value={value}
        className={cx("grid gap-2", className)}
        {...props}
      >
        {items.map((item) => (
          <RadioCardGroupTremorCard
            key={item.value}
            item={item}
            selected={item.value === value}
          />
        ))}
      </RadioGroupPrimitive.Root>
    )
  },
)

RadioCardGroupTremor.displayName = "RadioCardGroupTremor"

export { RadioCardGroupTremor, RadioCardGroupTremorCard }
