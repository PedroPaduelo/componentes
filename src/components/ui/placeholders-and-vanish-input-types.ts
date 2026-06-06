/**
 * Tipos do PlaceholdersAndVanishInput.
 *
 * Extraídos em arquivo .ts separado (sem JSX) para o eslint
 * `react-refresh/only-export-components` não reclamar de o
 * componente exportar tipos/utilitários junto com o JSX.
 */
import type * as React from "react"

/** Pixel branco extraído do canvas para animar a "dissolução" do texto. */
export type VanishPixel = {
  x: number
  y: number
  r: number
  g: number
  b: number
  a: number
}

export type PlaceholdersAndVanishInputProps = Omit<
  React.HTMLAttributes<HTMLFormElement>,
  "onChange" | "onSubmit" | "children"
> & {
  /** Lista de placeholders que rotacionam automaticamente no input. */
  placeholders: string[]
  /** Callback disparado a cada tecla digitada (após o estado interno atualizar). */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Callback disparado no submit do form (Enter ou click no botão). */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  /** Intervalo de rotação dos placeholders em ms. Padrão: 3000. */
  placeholderIntervalMs?: number
  /** Texto inicial do input (não-controlado). */
  defaultValue?: string
}

export const PLACEHOLDERS_DEFAULT_INTERVAL_MS = 3000
export const VANISH_CANVAS_SIZE = 800
export const VANISH_PIXEL_SIZE = 4
export const VANISH_PIXEL_STEP = 4
