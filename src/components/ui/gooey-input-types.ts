/**
 * Tipos do GooeyInput.
 *
 * Extraídos em arquivo .ts separado (sem JSX) para o eslint
 * `react-refresh/only-export-components` não reclamar de o
 * componente exportar tipos/utilitários junto com o JSX.
 */

export interface GooeyInputClassNames {
  root?: string
  filterWrap?: string
  buttonRow?: string
  trigger?: string
  input?: string
  bubble?: string
  bubbleSurface?: string
}

export interface GooeyInputProps {
  placeholder?: string
  className?: string
  classNames?: GooeyInputClassNames
  /** Collapsed control width in px */
  collapsedWidth?: number
  /** Expanded control width in px */
  expandedWidth?: number
  /** Horizontal offset when expanded (px), aligns detached bubble */
  expandedOffset?: number
  /** Gaussian blur amount for the gooey SVG filter */
  gooeyBlur?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}
