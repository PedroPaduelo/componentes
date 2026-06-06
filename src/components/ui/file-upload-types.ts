/**
 * FileUpload — Aceternity UI.
 *
 * Componente de upload de arquivos com drag-and-drop, grid de fundo
 * decorativo e lista animada dos arquivos carregados. Suporta seleção
 * por clique no container OU por arrastar arquivos para dentro.
 */

export type FileUploadProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "children"
  | "onChange"
  | "onDrag"
  | "onDragEnd"
  | "onDragStart"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
> & {
  /**
   * Callback disparado sempre que novos arquivos são adicionados
   * (vindo de drop OU da seleção nativa via input).
   */
  onChange?: (files: File[]) => void
  /**
   * Permite selecionar mais de um arquivo. Padrão: `false` (single).
   */
  multiple?: boolean
  /**
   * Tipos MIME aceitos. Encaminhado para o `accept` do `<input>`.
   * Ex.: `"image/*"`, `"application/pdf"`, `".png,.jpg"`.
   */
  accept?: string
}
