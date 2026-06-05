/**
 * Helpers de geração de dados para os exemplos da vitrine.
 * Mantidos fora do examples.tsx para não inflar o arquivo principal.
 */

import type { ContributionDay } from "@/components/ui/github-contributions"

/**
 * Gera um ano de dados de contribuição determinísticos (pseudo-random
 * com seed fixa) para o heatmap do GitHubContributions. Determinístico
 * para que o preview seja estável entre renders.
 */
export function generateContributions(weeks = 52): ContributionDay[] {
  const days: ContributionDay[] = []
  const total = weeks * 7
  const today = new Date()
  // seed simples (LCG) para reprodutibilidade
  let seed = 1337

  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }

  for (let i = total - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const r = rand()
    // distribuição enviesada para muitos dias com 0-2 e poucos picos
    let count = 0
    if (r > 0.55) count = Math.floor(rand() * 4) + 1
    if (r > 0.85) count = Math.floor(rand() * 8) + 4
    if (r > 0.97) count = Math.floor(rand() * 12) + 8
    days.push({
      date: date.toISOString().slice(0, 10),
      count,
    })
  }

  return days
}
