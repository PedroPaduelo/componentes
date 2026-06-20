/**
 * TabNavigationTremor — nav horizontal de tabs com ícone opcional, estado
 * ativo (sublinhado azul) e suporte a modo controlado/não-controlado.
 *
 * Diferente do `tabs.tsx` shadcn (Radix Tabs com painel de conteúdo por
 * aba), esta é uma nav "estilo admin" — sem painéis, apenas muda o valor
 * ativo e dispara `onValueChange`. Inspirada no navbar de dashboards
 * (Tremor, Tailwind UI, shadcn examples).
 *
 * Adaptado do Tremor Raw (https://github.com/tremorlabs/tremor/blob/main/src/components/TabNavigation/TabNavigation.tsx)
 * para o padrão Vitrine:
 *   • `cx()` → importado de `@/lib/tremor-utils` (não de `@/lib/utils`,
 *     alinhado com os demais `-tremor` da onda).
 *   • `forwardRef` + `displayName`, JSX raiz com `data-slot="tab-navigation-tremor"`
 *     e `tremor-id="tremor-raw"` (mantido! permite ao validador distinguir Tremor).
 *   • Sem `"use client"` (não usamos Next.js).
 *   • API simplificada: recebe `items: TabNavigationTremorItem[]` em vez
 *     de children — ergonomia melhor para o caso "nav de admin" e casa
 *     com o AC da task O3.2.
 *   • Controlled/uncontrolled via `value` + `defaultValue` + `onValueChange`
 *     (mesmo padrão dos Tabs shadcn).
 *   • Item com ícone opcional: aceita `React.ElementType` (ex.: `Home` do
 *     lucide-react) — renderizado como `<Icon className="size-4" />` à
 *     esquerda do label.
 *   • Tailwind v4: classes Tremor copiadas 1:1 (literais, sem interpolação).
 *   • Acessibilidade: `role="tablist"` + `role="tab"` + `aria-selected`
 *     em cada item, `aria-controls` opcional por item. Keyboard nav é
 *     responsabilidade do consumidor (a task não exige ArrowNav built-in).
 *
 * Mantém 100% da estética do Tremor: border-b-2 transparente no estado
 * inativo, hover acinzentado, ativo em azul (`border-blue-500 text-blue-500`).
 *
 * @see https://www.tremor.so/docs/components/tab-navigation
 */

import * as React from "react"

import { cx, focusRing } from "@/lib/tremor-utils"

/**
 * Item individual da nav. `value` é a chave semântica que identifica a
 * aba ativa; `label` é o texto exibido; `icon` é um component lucide-style
 * (qualquer `React.ElementType` que aceite `className`).
 *
 * `disabled` desabilita a aba (sem pointer, texto esmaecido).
 * `ariaControls` é o `id` do painel controlado por essa aba (opcional,
 * para quem quiser montar painéis manualmente).
 */
export interface TabNavigationTremorItem {
  /** Chave única da aba (usada por `value`/`defaultValue`/`onValueChange`). */
  value: string
  /** Texto exibido na aba. */
  label: string
  /** Ícone opcional à esquerda do label (ex.: `Home` do lucide-react). */
  icon?: React.ElementType
  /** Desabilita cliques e esmaece o texto. */
  disabled?: boolean
  /** `id` do painel controlado por essa aba (define `aria-controls`). */
  ariaControls?: string
}

export interface TabNavigationTremorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "defaultValue"> {
  /**
   * Lista de abas. Renderizadas na ordem fornecida; a aba cujo `value`
   * casa com `value`/`defaultValue` recebe o estilo de ativo.
   */
  items: TabNavigationTremorItem[]
  /**
   * Modo controlado: força qual aba está ativa. Combine com `onValueChange`
   * para reagir a cliques. Se ausente, cai no modo não-controlado.
   */
  value?: string
  /**
   * Valor inicial em modo não-controlado. Ignorado quando `value` é fornecido.
   */
  defaultValue?: string
  /**
   * Disparado quando o usuário clica numa aba não-desabilitada.
   * Recebe o `value` da aba clicada.
   */
  onValueChange?: (value: string) => void
}

/**
 * Versão "render-only" de uma aba individual — usada internamente e
 * exportada para consumidores que queiram montar layouts customizados.
 *
 * Omitimos `value`, `disabled` e `onSelect` de `ButtonHTMLAttributes`:
 * - `value` e `disabled` colidem com `item.value` e `item.disabled`.
 * - `onSelect` no DOM é `ReactEventHandler<HTMLButtonElement>` (evento de
 *   seleção de texto), conflita com nosso `(value: string) => void`.
 */
export interface TabNavigationTremorLinkProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "value" | "disabled" | "onSelect"
  > {
  item: TabNavigationTremorItem
  selected: boolean
  onSelect: (value: string) => void
}

const TabNavigationTremorLink = React.forwardRef<
  HTMLButtonElement,
  TabNavigationTremorLinkProps
>(({ item, selected, onSelect, className, ...props }, forwardedRef) => {
  const { value, label, icon: Icon, disabled, ariaControls } = item
  return (
    <button
      ref={forwardedRef}
      type="button"
      role="tab"
      id={`tab-${value}`}
      aria-selected={selected}
      {...(ariaControls ? { "aria-controls": ariaControls } : {})}
      aria-disabled={disabled}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onSelect(value)
      }}
      className={cx(
        // base
        "-mb-px flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 pb-2 text-sm font-medium transition-all",
        // text color (estado inativo)
        "text-gray-500 dark:text-gray-500",
        // hover
        "hover:text-gray-700 dark:hover:text-gray-400",
        // border hover
        "hover:border-gray-300 dark:hover:border-gray-400",
        // selected
        selected
          ? "border-blue-500 text-blue-500 dark:border-blue-500 dark:text-blue-500"
          : "",
        // disabled
        disabled ? "pointer-events-none text-gray-300 dark:text-gray-700" : "",
        focusRing,
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
            className="mr-1.5 size-4 shrink-0"
            aria-hidden={true}
          />
        )
      })() : null}
      {label}
    </button>
  )
})

TabNavigationTremorLink.displayName = "TabNavigationTremorLink"

const TabNavigationTremor = React.forwardRef<
  HTMLDivElement,
  TabNavigationTremorProps
>(
  (
    {
      items,
      value,
      defaultValue,
      onValueChange,
      className,
      ...props
    },
    forwardedRef,
  ) => {
    // Estado interno (modo não-controlado). Quando `value` é fornecido,
    // sincronizamos via prop em cada render.
    const [internalValue, setInternalValue] = React.useState<string | undefined>(
      defaultValue ?? items[0]?.value,
    )

    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const handleSelect = React.useCallback(
      (next: string) => {
        if (!isControlled) setInternalValue(next)
        onValueChange?.(next)
      },
      [isControlled, onValueChange],
    )

    return (
      <div
        ref={forwardedRef}
        role="tablist"
        data-slot="tab-navigation-tremor"
        tremor-id="tremor-raw"
        className={cx(
          // base
          "flex items-center justify-start whitespace-nowrap border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // border color
          "border-gray-200 dark:border-gray-800",
          className,
        )}
        {...props}
      >
        {items.map((item) => (
          <TabNavigationTremorLink
            key={item.value}
            item={item}
            selected={item.value === currentValue}
            onSelect={handleSelect}
          />
        ))}
      </div>
    )
  },
)

TabNavigationTremor.displayName = "TabNavigationTremor"

export { TabNavigationTremor, TabNavigationTremorLink }