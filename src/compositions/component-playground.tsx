/**
 * Composição "Quadro Kanban".
 *
 * Board de projeto interativo (estilo Trello/Linear) montado SÓ com componentes
 * do barrel `@/components/ui`. Estado real via `useState`: arrastar cards entre
 * colunas (drag-and-drop nativo HTML5), criar tarefa via Dialog, mover/excluir
 * via DropdownMenu, e filtrar por busca, prioridade e responsável.
 *
 * Componentes do catálogo usados (~12):
 * Card, Button, BadgeFluid, Input, Select, RadioGroup, Dialog, DropdownMenu,
 * Avatar, ScrollArea, Separator, Tabs, Toaster (sonner).
 */
import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Users,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  Clock,
  LayoutGrid,
  Inbox,
} from "lucide-react"

import {
  Card,
  Button,
  BadgeFluid,
  Input,
  Avatar,
  AvatarFallback,
  Separator,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Toaster,
} from "@/components/ui"
import type { BadgeColor } from "@/components/ui"
import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                  modelo                                     */
/* -------------------------------------------------------------------------- */

type Priority = "high" | "medium" | "low"
type ColumnId = "backlog" | "in-progress" | "in-review" | "done"

interface Member {
  id: string
  name: string
  initials: string
  /** classe literal Tailwind (sem interpolação) para o avatar */
  avatarClass: string
}

interface Task {
  id: string
  title: string
  priority: Priority
  assigneeId: string
  tags: string[]
  estimate?: string
  status: ColumnId
}

const MEMBERS: Member[] = [
  {
    id: "ana",
    name: "Ana Lima",
    initials: "AL",
    avatarClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  {
    id: "bruno",
    name: "Bruno Sá",
    initials: "BS",
    avatarClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    id: "carla",
    name: "Carla Reis",
    initials: "CR",
    avatarClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "diego",
    name: "Diego Nunes",
    initials: "DN",
    avatarClass: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
]

const MEMBER_BY_ID: Record<string, Member> = Object.fromEntries(
  MEMBERS.map((m) => [m.id, m])
)

const PRIORITY_META = {
  high: { label: "Alta", color: "red" },
  medium: { label: "Média", color: "amber" },
  low: { label: "Baixa", color: "blue" },
} satisfies Record<Priority, { label: string; color: BadgeColor }>

const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"]

interface Column {
  id: ColumnId
  title: string
  /** classe literal Tailwind do ponto de acento no topo da coluna */
  accent: string
}

const COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog", accent: "bg-muted-foreground/50" },
  { id: "in-progress", title: "Em progresso", accent: "bg-blue-500" },
  { id: "in-review", title: "Em revisão", accent: "bg-amber-500" },
  { id: "done", title: "Concluído", accent: "bg-emerald-500" },
]

const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Definir escopo do MVP",
    priority: "high",
    assigneeId: "ana",
    tags: ["produto", "discovery"],
    estimate: "3d",
    status: "backlog",
  },
  {
    id: "t2",
    title: "Pesquisa com usuários beta",
    priority: "medium",
    assigneeId: "carla",
    tags: ["ux"],
    estimate: "2d",
    status: "backlog",
  },
  {
    id: "t3",
    title: "Modelar schema do banco",
    priority: "low",
    assigneeId: "diego",
    tags: ["backend"],
    estimate: "1d",
    status: "backlog",
  },
  {
    id: "t4",
    title: "Tela de login com OAuth",
    priority: "high",
    assigneeId: "bruno",
    tags: ["frontend", "auth"],
    estimate: "2d",
    status: "in-progress",
  },
  {
    id: "t5",
    title: "Endpoint de billing",
    priority: "medium",
    assigneeId: "diego",
    tags: ["backend", "pagamentos"],
    estimate: "3d",
    status: "in-progress",
  },
  {
    id: "t6",
    title: "Revisar copy da landing",
    priority: "low",
    assigneeId: "ana",
    tags: ["marketing"],
    estimate: "4h",
    status: "in-review",
  },
  {
    id: "t7",
    title: "Acessibilidade do formulário",
    priority: "medium",
    assigneeId: "carla",
    tags: ["a11y", "frontend"],
    estimate: "1d",
    status: "in-review",
  },
  {
    id: "t8",
    title: "Configurar pipeline de CI",
    priority: "high",
    assigneeId: "bruno",
    tags: ["devops"],
    estimate: "1d",
    status: "done",
  },
  {
    id: "t9",
    title: "Design tokens do tema escuro",
    priority: "low",
    assigneeId: "carla",
    tags: ["design"],
    estimate: "1d",
    status: "done",
  },
]

type PriorityFilter = Priority | "all"
type AssigneeFilter = string | "all"

/* -------------------------------------------------------------------------- */
/*                              card de tarefa                                 */
/* -------------------------------------------------------------------------- */

function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onMove,
  onDelete,
}: {
  task: Task
  isDragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onMove: (id: string, to: ColumnId) => void
  onDelete: (id: string) => void
}) {
  const member = MEMBER_BY_ID[task.assigneeId]
  const priority = PRIORITY_META[task.priority]
  const moveTargets = COLUMNS.filter((c) => c.id !== task.status)

  return (
    <Card
      data-slot="kanban-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", task.id)
        onDragStart(task.id)
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab gap-0 rounded-lg border-border p-3 shadow-sm transition-all hover:border-foreground/20 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <BadgeFluid variant="dot" color={priority.color} size="sm">
          {priority.label}
        </BadgeFluid>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="-mr-1 -mt-1 opacity-60 transition-opacity group-hover:opacity-100"
              aria-label={`Ações de "${task.title}"`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Mover para</DropdownMenuLabel>
            {moveTargets.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => onMove(task.id, c.id)}
              >
                <ArrowRight className="text-muted-foreground" />
                {c.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-2 text-sm font-medium leading-snug text-foreground">
        {task.title}
      </p>

      {task.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback
              className={cn("text-[10px] font-semibold", member.avatarClass)}
            >
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{member.name}</span>
        </div>
        {task.estimate && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            {task.estimate}
          </span>
        )}
      </div>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                            diálogo de criação                               */
/* -------------------------------------------------------------------------- */

function NewTaskDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (task: Omit<Task, "id">) => void
}) {
  const [title, setTitle] = React.useState("")
  const [priority, setPriority] = React.useState<Priority>("medium")
  const [status, setStatus] = React.useState<ColumnId>("backlog")
  const [assigneeId, setAssigneeId] = React.useState<string>(MEMBERS[0].id)
  const [tags, setTags] = React.useState("")

  function reset() {
    setTitle("")
    setPriority("medium")
    setStatus("backlog")
    setAssigneeId(MEMBERS[0].id)
    setTags("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onCreate({
      title: trimmed,
      priority,
      status,
      assigneeId,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 3),
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Nova tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova tarefa</DialogTitle>
            <DialogDescription>
              Defina os detalhes e escolha em qual coluna o card aparece.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="kanban-title"
                className="text-sm font-medium text-foreground"
              >
                Título
              </label>
              <Input
                id="kanban-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Implementar busca global"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-foreground">
                Prioridade
              </span>
              <RadioGroup
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
                className="grid grid-cols-3 gap-2"
              >
                {PRIORITY_ORDER.map((p) => (
                  <label
                    key={p}
                    htmlFor={`prio-${p}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-accent",
                      priority === p && "border-primary bg-accent"
                    )}
                  >
                    <RadioGroupItem id={`prio-${p}`} value={p} />
                    <span>{PRIORITY_META[p].label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <span className="text-sm font-medium text-foreground">
                  Coluna
                </span>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as ColumnId)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium text-foreground">
                  Responsável
                </span>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="kanban-tags"
                className="text-sm font-medium text-foreground"
              >
                Tags{" "}
                <span className="font-normal text-muted-foreground">
                  (separadas por vírgula)
                </span>
              </label>
              <Input
                id="kanban-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="frontend, urgente"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Criar tarefa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   board                                     */
/* -------------------------------------------------------------------------- */

export function ComponentPlayground() {
  const { resolvedTheme } = useTheme()
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS)
  const [query, setQuery] = React.useState("")
  const [priorityFilter, setPriorityFilter] =
    React.useState<PriorityFilter>("all")
  const [assigneeFilter, setAssigneeFilter] =
    React.useState<AssigneeFilter>("all")
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = React.useState<ColumnId | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const idRef = React.useRef(100)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false
      if (assigneeFilter !== "all" && t.assigneeId !== assigneeFilter)
        return false
      return true
    })
  }, [tasks, query, priorityFilter, assigneeFilter])

  const tasksByColumn = React.useMemo(() => {
    const map: Record<ColumnId, Task[]> = {
      backlog: [],
      "in-progress": [],
      "in-review": [],
      done: [],
    }
    for (const t of filtered) map[t.status].push(t)
    return map
  }, [filtered])

  const columnTitle = React.useCallback(
    (id: ColumnId) => COLUMNS.find((c) => c.id === id)?.title ?? id,
    []
  )

  function moveTask(id: string, to: ColumnId) {
    const task = tasks.find((t) => t.id === id)
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: to } : t))
    )
    if (task && task.status !== to) {
      toast.success("Tarefa movida", {
        description: `"${task.title}" → ${columnTitle(to)}.`,
      })
    }
  }

  function deleteTask(id: string) {
    const task = tasks.find((t) => t.id === id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (task) {
      toast("Tarefa excluída", { description: `"${task.title}" foi removida.` })
    }
  }

  function createTask(data: Omit<Task, "id">) {
    idRef.current += 1
    const newTask: Task = { ...data, id: `t${idRef.current}` }
    setTasks((prev) => [newTask, ...prev])
    toast.success("Tarefa criada", {
      description: `"${newTask.title}" em ${columnTitle(newTask.status)}.`,
    })
  }

  function handleDrop(to: ColumnId, droppedId: string) {
    // Lê o id do dataTransfer (fonte primária, robusta a timing) com fallback
    // ao estado de arraste corrente.
    const id = droppedId || draggingId
    if (id) moveTask(id, to)
    setDraggingId(null)
    setDragOverCol(null)
  }

  const totalFiltered = filtered.length
  const totalAll = tasks.length
  const hasFilters =
    query.trim() !== "" || priorityFilter !== "all" || assigneeFilter !== "all"

  const assigneeLabel =
    assigneeFilter === "all"
      ? "Todos"
      : MEMBER_BY_ID[assigneeFilter]?.name ?? "Todos"

  return (
    <div
      data-slot="component-playground"
      className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:p-6"
    >
      {/* Cabeçalho / toolbar */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutGrid className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Quadro Kanban
              </h1>
              <p className="text-sm text-muted-foreground">
                {totalFiltered === totalAll
                  ? `${totalAll} tarefas no board`
                  : `${totalFiltered} de ${totalAll} tarefas`}
              </p>
            </div>
          </div>

          <NewTaskDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onCreate={createTask}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título…"
              className="pl-9"
              aria-label="Buscar tarefas"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="high">Alta</TabsTrigger>
                <TabsTrigger value="medium">Média</TabsTrigger>
                <TabsTrigger value="low">Baixa</TabsTrigger>
              </TabsList>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users />
                  {assigneeLabel}
                  <ChevronDown className="opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Responsável</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setAssigneeFilter("all")}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {MEMBERS.map((m) => (
                  <DropdownMenuItem
                    key={m.id}
                    onClick={() => setAssigneeFilter(m.id)}
                  >
                    <Avatar className="size-5">
                      <AvatarFallback
                        className={cn(
                          "text-[9px] font-semibold",
                          m.avatarClass
                        )}
                      >
                        {m.initials}
                      </AvatarFallback>
                    </Avatar>
                    {m.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("")
                  setPriorityFilter("all")
                  setAssigneeFilter("all")
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </header>

      <Separator />

      {/* Colunas */}
      <div className="flex gap-4 overflow-x-auto pb-3">
        {COLUMNS.map((col) => {
          const colTasks = tasksByColumn[col.id]
          const isOver = dragOverCol === col.id
          return (
            <section
              key={col.id}
              data-slot="kanban-column"
              data-column={col.id}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
                if (dragOverCol !== col.id) setDragOverCol(col.id)
              }}
              onDragLeave={(e) => {
                // só limpa se realmente saiu da coluna (não para um filho)
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverCol((cur) => (cur === col.id ? null : cur))
                }
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(col.id, e.dataTransfer.getData("text/plain"))
              }}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/40 transition-colors",
                isOver &&
                  "border-primary/60 bg-accent/50 ring-2 ring-primary/40"
              )}
            >
              <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("size-2.5 rounded-full", col.accent)}
                    aria-hidden
                  />
                  <h2 className="text-sm font-semibold text-foreground">
                    {col.title}
                  </h2>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              <ScrollArea className="h-[460px] px-3">
                <div className="flex flex-col gap-2.5 pb-3">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-10 text-center">
                      <Inbox className="size-5 text-muted-foreground/60" />
                      <p className="text-xs text-muted-foreground">
                        {hasFilters
                          ? "Nenhuma tarefa no filtro"
                          : "Arraste cards para cá"}
                      </p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isDragging={draggingId === task.id}
                        onDragStart={setDraggingId}
                        onDragEnd={() => {
                          setDraggingId(null)
                          setDragOverCol(null)
                        }}
                        onMove={moveTask}
                        onDelete={deleteTask}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </section>
          )
        })}
      </div>

      {/* Toaster local da composição (Sonner) */}
      <Toaster position="bottom-right" richColors theme={resolvedTheme} />
    </div>
  )
}
