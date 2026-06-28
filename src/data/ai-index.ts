/**
 * Índice para IA — derivação da "definição para IA" de cada família de
 * componentes (dados puros, sem React).
 *
 * A definição é uma frase machine-oriented que diz, em uma linha, O QUE o
 * componente é, QUANDO usar e COMO instalar/importar. Reusa os helpers já
 * existentes (`buildUsageTip`, `getComponentInstall`, `getRegistryAddCommand`)
 * para não inventar API nem duplicar lógica.
 */

import {
  getComponentInstall,
  getRegistryAddCommand,
} from "@/data/component-install"
import { buildUsageTip } from "@/data/component-prompt"
import { getOrigin, type Family } from "@/data/families"
import { GROUP_BY_ID, getGroup } from "@/data/groups"

/** URL pública do índice completo legível por máquina (llms.txt). */
export const LLMS_TXT_PATH = "/llms.txt"

/**
 * Gera a "definição para IA" de uma família: 1 parágrafo conciso e orientado a
 * máquina (o que é + quando usar + como instalar/importar).
 */
export function buildAiDefinition(family: Family): string {
  const rep = family.variants[0]
  const origin = getOrigin(rep.slug, rep.tags)
  const install = getComponentInstall(family.representativeSlug)
  const tip = buildUsageTip(rep, origin)
  const addCommand = getRegistryAddCommand(family.representativeSlug)
  const groupLabel = GROUP_BY_ID[getGroup(family.representativeSlug)].label
  return (
    `${family.name} (${groupLabel}). ${rep.description} ` +
    `Quando usar: ${tip} ` +
    `Instale com \`${addCommand}\` e importe \`{ ${install.exportName} }\` de "${install.importPath}".`
  )
}
