/**
 * Composição "Database Schema Designer" (db-schema-designer).
 *
 * Editor visual de diagramas de banco de dados (ER) no estilo ChartDB / DBDraw
 * / Hubql, construído sobre o React Flow (@xyflow/react) já tematizado da
 * vitrine. O diferencial: cada nó é uma TABELA com MÚLTIPLOS handles — um por
 * coluna — e as relações (edges) ligam o handle de uma coluna FK ao handle da
 * coluna PK de outra tabela.
 *  - Canvas central <ReactFlow> (dentro de <ReactFlowProvider>) com Background
 *    pontilhado, Controls e MiniMap, `fitView`, estado via useNodesState/
 *    useEdgesState e onConnect → cria relação entre as colunas conectadas.
 *  - TableNode customizado (header + lista de colunas com ícone PK/FK, tipo e
 *    handles por linha).
 *  - Lista de tabelas à esquerda (clicar foca/seleciona; arrastar "Nova tabela"
 *    cria no canvas via screenToFlowPosition).
 *  - Inspetor à direita: renomeia a tabela, adiciona/remove colunas (nome +
 *    tipo via select + flag PK) e exclui a tabela.
 *  - Toolbar: nova tabela, auto-organizar (grade determinística), ajustar à
 *    tela (fitView), toggles MiniMap/Grade e "Exportar SQL" (gera os
 *    CREATE TABLE num dialog com copiar).
 *  - Barra de status: contagem de tabelas, colunas e relações.
 *
 * Determinístico (IDs por contador em ref, sem aleatoriedade); tema reativo via
 * tokens shadcn; o canvas herda o tema do React Flow pelo `colorMode`. Sem
 * backend.
 */
import * as React from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  type Edge,
  type NodeTypes,
  type Connection,
  type OnSelectionChangeParams,
} from "@xyflow/react"
import {
  Database,
  Table2,
  Plus,
  LayoutGrid,
  Maximize2,
  Map as MapIcon,
  Grid3x3,
  Trash2,
  KeyRound,
  Link2,
  FileCode2,
  Copy,
  Check,
  MousePointer2,
  X,
} from "lucide-react"

import "@xyflow/react/dist/style.css"

import { useTheme } from "@/components/theme/use-theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TableNode } from "@/compositions/db-schema-designer-nodes"
import {
  COLUMN_TYPES,
  TABLE_WIDTH,
  type TableNode as TableNodeType,
  type TableNodeData,
  type Column,
  type ColumnType,
} from "@/compositions/db-schema-designer-types"

/* -------------------------------------------------------------------------- */
/*  Modelo / dados                                                            */
/* -------------------------------------------------------------------------- */

const EDGE_BASE: Partial<Edge> = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
  label: "1—N",
}

function mkTable(
  id: string,
  name: string,
  columns: Column[],
  x: number,
  y: number,
): TableNodeType {
  return { id, type: "table", position: { x, y }, data: { name, columns } }
}

/** Relação coluna→coluna (FK source → PK target). */
function mkRelation(
  id: string,
  sourceTable: string,
  sourceCol: string,
  targetTable: string,
  targetCol: string,
): Edge {
  return {
    id,
    source: sourceTable,
    target: targetTable,
    sourceHandle: `${sourceTable}.${sourceCol}`,
    targetHandle: `${targetTable}.${targetCol}`,
    ...EDGE_BASE,
  }
}

const INITIAL_NODES: TableNodeType[] = [
  mkTable(
    "users",
    "users",
    [
      { name: "id", type: "uuid", pk: true },
      { name: "name", type: "varchar" },
      { name: "email", type: "varchar" },
      { name: "created_at", type: "timestamp" },
    ],
    40,
    40,
  ),
  mkTable(
    "posts",
    "posts",
    [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: true },
      { name: "title", type: "varchar" },
      { name: "body", type: "text", nullable: true },
      { name: "created_at", type: "timestamp" },
    ],
    400,
    20,
  ),
  mkTable(
    "comments",
    "comments",
    [
      { name: "id", type: "uuid", pk: true },
      { name: "post_id", type: "uuid", fk: true },
      { name: "user_id", type: "uuid", fk: true },
      { name: "body", type: "text" },
    ],
    760,
    0,
  ),
  mkTable(
    "tags",
    "tags",
    [
      { name: "id", type: "int", pk: true },
      { name: "name", type: "varchar" },
    ],
    400,
    320,
  ),
  mkTable(
    "post_tags",
    "post_tags",
    [
      { name: "post_id", type: "uuid", pk: true, fk: true },
      { name: "tag_id", type: "int", pk: true, fk: true },
    ],
    760,
    300,
  ),
]

const INITIAL_EDGES: Edge[] = [
  mkRelation("r1", "posts", "user_id", "users", "id"),
  mkRelation("r2", "comments", "post_id", "posts", "id"),
  mkRelation("r3", "comments", "user_id", "users", "id"),
  mkRelation("r4", "post_tags", "post_id", "posts", "id"),
  mkRelation("r5", "post_tags", "tag_id", "tags", "id"),
]

/** SQL string `DEFAULT`/`PRIMARY KEY`-ish para os tipos. */
const SQL_TYPE: Record<ColumnType, string> = {
  int: "INTEGER",
  bigint: "BIGINT",
  uuid: "UUID",
  varchar: "VARCHAR(255)",
  text: "TEXT",
  bool: "BOOLEAN",
  timestamp: "TIMESTAMP",
  date: "DATE",
  numeric: "NUMERIC(12,2)",
  json: "JSONB",
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Layout determinístico em grade (colunas × linhas). */
function gridLayout(nodes: TableNodeType[]): TableNodeType[] {
  const COL = TABLE_WIDTH + 120
  const ROW = 340
  const perRow = 3
  return nodes.map((n, i) => ({
    ...n,
    position: { x: (i % perRow) * COL + 40, y: Math.floor(i / perRow) * ROW + 20 },
  }))
}

/** Gera o `CREATE TABLE …` do schema atual (com FOREIGN KEY pelas edges). */
function buildSql(nodes: TableNodeType[], edges: Edge[]): string {
  const byHandleCol = (handle: string | null | undefined) =>
    handle ? handle.split(".").slice(1).join(".") : ""

  return nodes
    .map((table) => {
      const lines: string[] = []
      for (const col of table.data.columns) {
        const parts = [`  "${col.name}"`, SQL_TYPE[col.type]]
        if (col.pk) parts.push("NOT NULL")
        else if (!col.nullable) parts.push("NOT NULL")
        lines.push(parts.join(" "))
      }
      const pks = table.data.columns.filter((c) => c.pk).map((c) => `"${c.name}"`)
      if (pks.length > 0) lines.push(`  PRIMARY KEY (${pks.join(", ")})`)

      for (const e of edges) {
        if (e.source !== table.id) continue
        const fromCol = byHandleCol(e.sourceHandle)
        const toCol = byHandleCol(e.targetHandle)
        if (!fromCol || !toCol) continue
        lines.push(
          `  FOREIGN KEY ("${fromCol}") REFERENCES "${e.target}" ("${toCol}")`,
        )
      }

      return `CREATE TABLE "${table.data.name}" (\n${lines.join(",\n")}\n);`
    })
    .join("\n\n")
}

/* -------------------------------------------------------------------------- */
/*  Componente interno (dentro do ReactFlowProvider)                          */
/* -------------------------------------------------------------------------- */

function DbSchemaDesignerInner() {
  const { resolvedTheme } = useTheme()
  const { fitView, screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeType>(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES)
  const [selectedId, setSelectedId] = React.useState<string | null>("posts")
  const [showMiniMap, setShowMiniMap] = React.useState(true)
  const [showGrid, setShowGrid] = React.useState(true)
  const [copied, setCopied] = React.useState(false)
  const [newColName, setNewColName] = React.useState("")
  const [newColType, setNewColType] = React.useState<ColumnType>("varchar")
  const [newColPk, setNewColPk] = React.useState(false)

  const tableCounterRef = React.useRef(0)

  const nodeTypes = React.useMemo<NodeTypes>(() => ({ table: TableNode }), [])

  const selectedTable = React.useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  )

  const columnCount = React.useMemo(
    () => nodes.reduce((acc, n) => acc + n.data.columns.length, 0),
    [nodes],
  )

  const onConnect = React.useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `rel-${connection.sourceHandle ?? connection.source}-${
              connection.targetHandle ?? connection.target
            }`,
            ...EDGE_BASE,
          },
          eds,
        ),
      )
    },
    [setEdges],
  )

  const onSelectionChange = React.useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      setSelectedId(sel.length > 0 ? sel[0].id : null)
    },
    [],
  )

  const addTable = React.useCallback(
    (position?: { x: number; y: number }) => {
      tableCounterRef.current += 1
      const n = tableCounterRef.current
      const id = `table_${n}`
      const pos = position ?? { x: 120 + (n % 4) * 60, y: 120 + (n % 4) * 60 }
      const table = mkTable(
        id,
        `table_${n}`,
        [{ name: "id", type: "uuid", pk: true }],
        pos.x,
        pos.y,
      )
      setNodes((nds) => nds.concat(table))
      setSelectedId(id)
    },
    [setNodes],
  )

  const onDragStart = React.useCallback((event: React.DragEvent) => {
    event.dataTransfer.setData("application/db-table", "1")
    event.dataTransfer.effectAllowed = "move"
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      if (!event.dataTransfer.getData("application/db-table")) return
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addTable(position)
    },
    [addTable, screenToFlowPosition],
  )

  const updateTableData = React.useCallback(
    (id: string, patch: Partial<TableNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      )
    },
    [setNodes],
  )

  const renameTable = React.useCallback(
    (name: string) => {
      if (!selectedId) return
      updateTableData(selectedId, { name })
    },
    [selectedId, updateTableData],
  )

  const addColumn = React.useCallback(() => {
    if (!selectedId || !selectedTable) return
    const name = newColName.trim()
    if (!name) return
    if (selectedTable.data.columns.some((c) => c.name === name)) return
    const column: Column = {
      name,
      type: newColType,
      pk: newColPk || undefined,
    }
    updateTableData(selectedId, {
      columns: [...selectedTable.data.columns, column],
    })
    setNewColName("")
    setNewColType("varchar")
    setNewColPk(false)
  }, [selectedId, selectedTable, newColName, newColType, newColPk, updateTableData])

  const removeColumn = React.useCallback(
    (colName: string) => {
      if (!selectedId || !selectedTable) return
      updateTableData(selectedId, {
        columns: selectedTable.data.columns.filter((c) => c.name !== colName),
      })
      setEdges((eds) =>
        eds.filter(
          (e) =>
            e.sourceHandle !== `${selectedId}.${colName}` &&
            e.targetHandle !== `${selectedId}.${colName}`,
        ),
      )
    },
    [selectedId, selectedTable, updateTableData, setEdges],
  )

  const deleteTable = React.useCallback(() => {
    if (!selectedId) return
    setNodes((nds) => nds.filter((n) => n.id !== selectedId))
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedId && e.target !== selectedId),
    )
    setSelectedId(null)
  }, [selectedId, setNodes, setEdges])

  const focusTable = React.useCallback(
    (id: string) => {
      setSelectedId(id)
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === id })))
      window.setTimeout(
        () => fitView({ duration: 400, padding: 0.4, nodes: [{ id }] }),
        20,
      )
    },
    [fitView, setNodes],
  )

  const autoLayout = React.useCallback(() => {
    setNodes((nds) => gridLayout(nds))
    window.setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 50)
  }, [fitView, setNodes])

  const sql = React.useMemo(() => buildSql(nodes, edges), [nodes, edges])

  const copySql = React.useCallback(() => {
    void navigator.clipboard?.writeText(sql)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }, [sql])

  return (
    <div
      data-slot="db-schema-designer"
      className="flex h-[78vh] min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-2 pr-1">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Database className="size-4" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">Schema Designer</p>
            <p className="text-[11px] text-muted-foreground">Diagrama ER</p>
          </div>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button size="sm" variant="default" className="gap-1.5" onClick={() => addTable()}>
          <Plus className="size-4" /> Nova tabela
        </Button>

        <Button size="sm" variant="outline" className="gap-1.5" onClick={autoLayout}>
          <LayoutGrid className="size-4" />
          <span className="hidden md:inline">Auto-organizar</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => fitView({ duration: 400, padding: 0.2 })}
        >
          <Maximize2 className="size-4" />
          <span className="hidden md:inline">Ajustar à tela</span>
        </Button>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <Button
          size="sm"
          variant={showMiniMap ? "secondary" : "ghost"}
          aria-pressed={showMiniMap}
          className="gap-1.5"
          onClick={() => setShowMiniMap((v) => !v)}
        >
          <MapIcon className="size-4" />
          <span className="hidden lg:inline">MiniMap</span>
        </Button>
        <Button
          size="sm"
          variant={showGrid ? "secondary" : "ghost"}
          aria-pressed={showGrid}
          className="gap-1.5"
          onClick={() => setShowGrid((v) => !v)}
        >
          <Grid3x3 className="size-4" />
          <span className="hidden lg:inline">Grade</span>
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <FileCode2 className="size-4" />
                <span className="hidden sm:inline">Exportar SQL</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schema SQL</DialogTitle>
                <DialogDescription>
                  Instruções <code className="font-mono">CREATE TABLE</code> geradas
                  a partir do diagrama atual.
                </DialogDescription>
              </DialogHeader>
              <div className="relative">
                <pre className="max-h-[60vh] overflow-auto rounded-lg border border-border bg-muted/50 p-3 text-[11px] leading-relaxed">
                  <code>{sql}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-2 gap-1.5"
                  onClick={copySql}
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Corpo: lista | canvas | inspetor */}
      <div className="flex min-h-0 flex-1">
        {/* Lista de tabelas */}
        <aside className="hidden w-56 shrink-0 flex-col gap-3 overflow-y-auto border-r border-border bg-card/40 p-3 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tabelas
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Clique para focar
            </p>
          </div>

          <div
            draggable
            onDragStart={onDragStart}
            className="group flex cursor-grab items-center gap-2.5 rounded-lg border border-dashed border-border bg-card px-3 py-2.5 text-sm shadow-sm transition-colors hover:border-primary/50 hover:bg-accent active:cursor-grabbing"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Plus className="size-4" />
            </span>
            <span className="font-medium">Nova tabela</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {nodes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => focusTable(n.id)}
                aria-current={n.id === selectedId ? "true" : undefined}
                className={
                  n.id === selectedId
                    ? "flex items-center gap-2.5 rounded-lg border border-primary/50 bg-accent px-3 py-2 text-left text-sm font-medium"
                    : "flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                }
              >
                <Table2 className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate">{n.data.name}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {n.data.columns.length}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-auto rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
            Dica: ligue uma coluna <span className="font-medium text-foreground">FK</span>{" "}
            à coluna <span className="font-medium text-foreground">PK</span> de outra
            tabela arrastando entre os pontos das linhas.
          </div>
        </aside>

        {/* Canvas */}
        <div className="relative min-w-0 flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <div data-slot="react-flow" className="absolute inset-0">
            <ReactFlow
              colorMode={resolvedTheme}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              {showGrid ? (
                <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
              ) : null}
              <Controls />
              {showMiniMap ? (
                <MiniMap pannable zoomable nodeColor="var(--primary)" />
              ) : null}
            </ReactFlow>
          </div>
        </div>

        {/* Inspetor */}
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-card/40 p-4 lg:flex">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Inspetor
          </p>
          {selectedTable ? (
            <div className="mt-3 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Nome da tabela
                </span>
                <Input
                  value={selectedTable.data.name}
                  onChange={(e) => renameTable(e.target.value)}
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Colunas ({selectedTable.data.columns.length})
                </span>
                <div className="flex flex-col gap-1">
                  {selectedTable.data.columns.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5"
                    >
                      <span className="flex w-4 shrink-0 justify-center">
                        {col.pk ? (
                          <KeyRound className="size-3.5 text-amber-500" />
                        ) : col.fk ? (
                          <Link2 className="size-3.5 text-muted-foreground" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium">
                        {col.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                        {col.type}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remover coluna ${col.name}`}
                        onClick={() => removeColumn(col.name)}
                        className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Adicionar coluna
                </span>
                <Input
                  value={newColName}
                  placeholder="nome_da_coluna"
                  onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addColumn()
                  }}
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newColType}
                    onChange={(e) => setNewColType(e.target.value as ColumnType)}
                    aria-label="Tipo da coluna"
                    className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                  >
                    {COLUMN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={newColPk}
                      onChange={(e) => setNewColPk(e.target.checked)}
                      className="size-3.5 accent-primary"
                    />
                    PK
                  </label>
                </div>
                <Button size="sm" variant="secondary" className="gap-1.5" onClick={addColumn}>
                  <Plus className="size-3.5" /> Adicionar
                </Button>
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="mt-1 gap-1.5"
                onClick={deleteTable}
              >
                <Trash2 className="size-4" /> Excluir tabela
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MousePointer2 className="size-5" />
              </span>
              <p className="text-sm font-medium">Nenhuma tabela selecionada</p>
              <p className="max-w-[12rem] text-xs text-muted-foreground">
                Clique numa tabela do canvas ou da lista para editar suas colunas.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Barra de status */}
      <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Table2 className="size-3.5" /> {nodes.length} tabelas
        </span>
        <span className="flex items-center gap-1.5">
          <Database className="size-3.5" /> {columnCount} colunas
        </span>
        <span className="flex items-center gap-1.5">
          <Link2 className="size-3.5" /> {edges.length} relações
        </span>
        <span className="hidden truncate sm:inline">
          {selectedTable ? (
            <>
              Selecionada:{" "}
              <span className="font-medium text-foreground">
                {selectedTable.data.name}
              </span>
            </>
          ) : (
            "Nada selecionado"
          )}
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                    */
/* -------------------------------------------------------------------------- */

export function DbSchemaDesigner() {
  return (
    <ReactFlowProvider>
      <DbSchemaDesignerInner />
    </ReactFlowProvider>
  )
}
