import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlockCommand } from "@/components/ui/code-block-command"
import { CodeBlock } from "@/components/showcase/CodeBlock"
import { cn } from "@/lib/utils"
import {
  PACKAGE_MANAGERS,
  getComponentInstall,
  getRegistryAddCommands,
  type PackageManager,
} from "@/data/component-install"

/**
 * Valor da aba "Manual" — propositalmente fora do conjunto de package managers
 * (`PACKAGE_MANAGERS`) para distinguir o caminho sem CLI.
 */
const MANUAL_TAB = "manual"

/** Aba ativa: um package manager (pnpm/npm/yarn/bun) ou a aba "Manual". */
type InstallTab = PackageManager | typeof MANUAL_TAB

interface InstallTabsProps {
  /**
   * Slug do componente. Deriva, internamente, tanto os comandos de instalação
   * por package manager (`getRegistryAddCommands`) quanto os dados de import
   * manual (`getComponentInstall`). Mantém o componente autocontido para reuso
   * (ex.: na página de grupo).
   */
  slug: string
  className?: string
}

/**
 * Abas de instalação de um componente: uma por package manager
 * (pnpm/npm/yarn/bun), cada uma com o comando `shadcn add` apontando para o
 * registry da vitrine + botão de copiar (via `CodeBlockCommand`), mais uma aba
 * "Manual" com o caminho/nome de import e a dica de copiar o código do
 * componente exibido acima.
 *
 * Genérico e autocontido: recebe apenas o `slug` e deriva tudo a partir dele,
 * podendo ser reusado em qualquer página que documente um componente.
 */
export function InstallTabs({ slug, className }: InstallTabsProps) {
  const [active, setActive] = useState<InstallTab>(PACKAGE_MANAGERS[0])

  const commands = getRegistryAddCommands(slug)
  const install = getComponentInstall(slug)
  const importSnippet = `import { ${install.exportName} } from "${install.importPath}"`

  return (
    <Tabs
      value={active}
      onValueChange={(value) => setActive(value as InstallTab)}
      className={cn("gap-3", className)}
    >
      <TabsList className="flex-wrap">
        {PACKAGE_MANAGERS.map((pm) => (
          <TabsTrigger key={pm} value={pm}>
            {pm}
          </TabsTrigger>
        ))}
        <TabsTrigger value={MANUAL_TAB}>Manual</TabsTrigger>
      </TabsList>

      {/* Uma aba por package manager: comando `shadcn add` + copy. */}
      {PACKAGE_MANAGERS.map((pm) => (
        <TabsContent key={pm} value={pm}>
          <CodeBlockCommand code={commands[pm]} />
        </TabsContent>
      ))}

      {/* Aba "Manual": import path/export name + dica de copiar o código. */}
      <TabsContent value={MANUAL_TAB} className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Sem CLI: copie o código do componente acima para o seu projeto e
          importe a partir do caminho abaixo.
        </p>
        <CodeBlock code={importSnippet} language="tsx" />
        {!install.exportConfirmed ? (
          <p className="text-xs text-muted-foreground">
            O nome do export é derivado do componente — confira o arquivo fonte
            para o nome e a API exatos.
          </p>
        ) : null}
      </TabsContent>
    </Tabs>
  )
}
