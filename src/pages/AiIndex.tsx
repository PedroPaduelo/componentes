import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Bot, ExternalLink, FileText, Sparkles, Boxes } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlockCommand } from "@/components/ui/code-block-command"
import { CopyButton } from "@/components/showcase/CopyButton"
import { CopyPromptButton } from "@/components/showcase/CopyPromptButton"
import { CopyFetchButton } from "@/components/showcase/CopyFetchButton"
import { OriginBadge } from "@/components/catalog/OriginBadge"
import { SearchInput } from "@/components/catalog/SearchInput"
import {
  CategoryFilter,
  ALL_CATEGORIES,
  type CategoryFilterValue,
} from "@/components/catalog/CategoryFilter"
import { groupByFamily } from "@/data/families"
import { filterFamilies } from "@/lib/family-filter"
import { buildComponentPrompt } from "@/data/component-prompt"
import { buildAiDefinition, LLMS_TXT_PATH } from "@/data/ai-index"
import { getRegistryAddCommand } from "@/data/component-install"
import { compositions } from "@/data/compositions"
import {
  buildCompositionPrompt,
  getCompositionAddCommand,
} from "@/data/composition-prompt"
import { aiSkills } from "@/data/ai-skills"

/** Texto pesquisável de uma composição. */
function compositionHaystack(c: (typeof compositions)[number]): string {
  return [c.slug, c.name, c.description, c.category ?? "", ...c.tags]
    .join(" ")
    .toLowerCase()
}

/**
 * Índice para IA (/ai).
 *
 * Uma página única, machine-friendly, que lista TODOS os componentes (por
 * família) e composições com: descrição, "definição para IA" copiável e o
 * comando de instalação via registry. No topo, ações para copiar/abrir o
 * `llms.txt` (índice completo) e atalhos para as skills.
 */
export function AiIndex() {
  const families = useMemo(() => groupByFamily(), [])
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryFilterValue>(ALL_CATEGORIES)

  const filteredFamilies = useMemo(
    () => filterFamilies(families, query, category),
    [families, query, category],
  )

  const q = query.trim().toLowerCase()
  const filteredCompositions = useMemo(
    () => (q ? compositions.filter((c) => compositionHaystack(c).includes(q)) : compositions),
    [q],
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Bot className="h-3.5 w-3.5" />
          Índice para IA
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Índice para IA
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          Um índice legível por máquina de todos os componentes e composições da
          vitrine: o que cada um é, uma <strong className="font-medium text-foreground">definição para IA</strong>{" "}
          e o comando de instalação via registry. Aponte sua IA (Claude, Cursor,
          etc.) para o <code className="font-mono text-sm text-foreground">llms.txt</code>{" "}
          ou cole o prompt de qualquer item.
        </p>

        {/* Ações globais */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <CopyFetchButton
            url={LLMS_TXT_PATH}
            label="Copiar índice (llms.txt)"
            copiedLabel="Índice copiado!"
          />
          <Button asChild variant="outline" size="sm">
            <a href={LLMS_TXT_PATH} target="_blank" rel="noreferrer">
              <FileText className="size-3.5" />
              Abrir llms.txt
              <ExternalLink className="size-3.5 opacity-60" />
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/instalacao#skills">
              <Sparkles className="size-3.5" />
              Skills para IA
            </Link>
          </Button>
        </div>
      </header>

      {/* Como uma IA usa */}
      <section className="mt-8 rounded-xl border border-border bg-muted/30 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <Bot className="h-4 w-4 text-primary" />
          Como uma IA usa este índice
        </h2>
        <ol className="mt-3 ml-4 list-decimal space-y-1.5 text-sm text-muted-foreground">
          <li>
            Faça <strong className="font-medium text-foreground">fetch</strong> do{" "}
            <code className="font-mono text-foreground">llms.txt</code> para
            descobrir o que existe e os slugs.
          </li>
          <li>
            Carregue a <strong className="font-medium text-foreground">skill</strong>{" "}
            correspondente ({aiSkills.map((s) => s.slug).join(" / ")}) — disponível
            na <Link to="/instalacao#skills" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">página de instalação</Link>.
          </li>
          <li>
            Instale pelo registry:{" "}
            <code className="font-mono text-foreground">
              npx shadcn@latest add &lt;base&gt;/r/&lt;slug&gt;.json
            </code>
            .
          </li>
          <li>Importe/renderize e personalize.</li>
        </ol>
      </section>

      {/* Filtros */}
      <div className="mt-10 space-y-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar componentes e composições..."
        />
        <CategoryFilter value={category} onChange={setCategory} />
        <p className="text-xs text-muted-foreground">
          O filtro de categoria acima se aplica aos componentes. As composições
          são filtradas pela busca por texto.
        </p>
      </div>

      {/* Componentes */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Boxes className="h-5 w-5 text-primary" />
            Componentes
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredFamilies.length} de {families.length}
          </span>
        </div>

        {filteredFamilies.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhum componente encontrado para a busca.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {filteredFamilies.map((family) => {
              const definition = buildAiDefinition(family)
              const addCommand = getRegistryAddCommand(family.representativeSlug)
              return (
                <li
                  key={family.base}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/components/${family.base}`}
                          className="text-lg font-semibold tracking-tight underline-offset-4 hover:underline"
                        >
                          {family.name}
                        </Link>
                        <Badge variant="secondary">{family.category}</Badge>
                        {family.origins.map((origin) => (
                          <OriginBadge key={origin} origin={origin} />
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {family.variants[0].description}
                      </p>
                    </div>
                    <CopyPromptButton
                      prompt={buildComponentPrompt(family)}
                      className="shrink-0"
                    />
                  </div>

                  {/* Definição para IA */}
                  <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Definição para IA
                      </span>
                      <CopyButton
                        value={definition}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground [&_svg]:size-3"
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {definition}
                    </p>
                  </div>

                  {/* Instalação */}
                  <div className="mt-3">
                    <CodeBlockCommand code={addCommand} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Composições / blocos */}
      <section className="mt-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Sparkles className="h-5 w-5 text-primary" />
            Composições (blocos)
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredCompositions.length} de {compositions.length}
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Telas inteiras instaláveis como um bloco único — o comando baixa a tela
          e todos os componentes da vitrine que ela usa.
        </p>

        {filteredCompositions.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhuma composição encontrada para a busca.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {filteredCompositions.map((composition) => (
              <li
                key={composition.slug}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/compositions/${composition.slug}`}
                        className="text-lg font-semibold tracking-tight underline-offset-4 hover:underline"
                      >
                        {composition.name}
                      </Link>
                      {composition.category ? (
                        <Badge variant="secondary">{composition.category}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {composition.description}
                    </p>
                  </div>
                  <CopyPromptButton
                    prompt={buildCompositionPrompt(composition)}
                    className="shrink-0"
                  />
                </div>

                <div className="mt-3">
                  <CodeBlockCommand
                    code={getCompositionAddCommand(composition.slug)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
