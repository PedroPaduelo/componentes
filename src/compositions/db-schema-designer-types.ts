/**
 * Tipos e constantes de layout da composição "Database Schema Designer".
 *
 * Mantidos num módulo `.ts` separado (sem componentes) para respeitar a regra
 * `react-refresh/only-export-components` — o arquivo de nodes (`.tsx`) só pode
 * exportar componentes.
 */
import type { Node } from "@xyflow/react"

/** Tipos de coluna suportados pelo designer. */
export type ColumnType =
  | "int"
  | "bigint"
  | "uuid"
  | "varchar"
  | "text"
  | "bool"
  | "timestamp"
  | "date"
  | "numeric"
  | "json"

/** Lista ordenada de tipos (usada no select do inspetor). */
export const COLUMN_TYPES: ColumnType[] = [
  "int",
  "bigint",
  "uuid",
  "varchar",
  "text",
  "bool",
  "timestamp",
  "date",
  "numeric",
  "json",
]

/** Uma coluna de uma tabela. */
export type Column = {
  /** Nome da coluna (único dentro da tabela). */
  name: string
  /** Tipo SQL simplificado. */
  type: ColumnType
  /** Chave primária. */
  pk?: boolean
  /** Chave estrangeira (a relação é desenhada pelas edges). */
  fk?: boolean
  /** Permite nulo. */
  nullable?: boolean
}

/** Formato do `data` de cada nó-tabela. */
export type TableNodeData = {
  /** Nome da tabela. */
  name: string
  /** Colunas da tabela, em ordem. */
  columns: Column[]
}

export type TableNode = Node<TableNodeData, "table">

/* ---------------------------------------------------------------------- */
/*  Geometria — usada no `style.top` dos handles e no layout em grade      */
/* ---------------------------------------------------------------------- */

/** Altura do header da tabela (px). */
export const HEADER_HEIGHT = 40
/** Altura de cada linha de coluna (px). */
export const ROW_HEIGHT = 30
/** Largura fixa do nó-tabela (px). */
export const TABLE_WIDTH = 240

/** Centro vertical (px) do handle da coluna no índice `index`. */
export function columnHandleTop(index: number): number {
  return HEADER_HEIGHT + index * ROW_HEIGHT + ROW_HEIGHT / 2
}
