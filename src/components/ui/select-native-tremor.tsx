"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export type SelectNativeTremorOption = {
  value: string
  label: string
}

export type SelectNativeTremorProps = {
  /** Opções a renderizar. Cada `option` vira um `<option>`. */
  options: SelectNativeTremorOption[]
  /** Valor controlado. */
  value?: string
  /** Callback de mudança (passa o novo value). */
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  /** Placeholder — renderizado como `<option>` desabilitado e selecionado quando vazio. */
  placeholder?: string
  /** Desabilita o select. */
  disabled?: boolean
  /** Nome do campo (formulários). */
  name?: string
  /** id do campo (formulários). */
  id?: string
  /** required HTML. */
  required?: boolean
  /** Classes extras. */
  className?: string
}

function SelectNativeTremor({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  name,
  id,
  required,
  className,
}: SelectNativeTremorProps) {
  const hasValue = value !== undefined && value !== ""
  return (
    <div
      data-slot="select-native-tremor"
      data-tremor-id="tremor-raw"
      className={cn("relative w-full", className)}
    >
      <select
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        name={name}
        id={id}
        required={required}
        className={cn(
          "block w-full appearance-none rounded-md border bg-white dark:bg-[#090E1A] border-gray-200 dark:border-gray-800 h-9 px-3 text-sm",
          // text color
          "text-gray-900 dark:text-gray-50",
          // placeholder / option color
          "placeholder-gray-400 dark:placeholder-gray-500",
          // hover
          "hover:bg-gray-50 dark:hover:bg-gray-950/50",
          // disabled
          "disabled:pointer-events-none",
          "disabled:bg-gray-100 disabled:text-gray-400",
          "dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500",
          // focus (Tremor-like)
          "outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white",
          "dark:focus:ring-blue-700 dark:focus:ring-offset-gray-950",
        )}
      >
        {placeholder !== undefined && (
          <option value="" disabled={!hasValue ? undefined : true}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
      />
    </div>
  )
}
SelectNativeTremor.displayName = "SelectNativeTremor"

export { SelectNativeTremor }