import { QueryHistoryList } from "@/components/ui/query-history-list"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Histórico de queries",
  description:
    "Cada item é um cartão com o SQL colapsado em uma linha (truncado por `maxLength`) e uma linha de meta com duração + horário relativo já formatado (`timeLabel`).",
  code: `import { QueryHistoryList } from "@/components/ui/query-history-list"

export function Demo() {
  return (
    <QueryHistoryList
      onSelect={(item) => console.log(item.id)}
      items={[
        {
          id: "q1",
          sql: "SELECT count(*) FROM events WHERE created_at > now() - interval '1 hour'",
          durationMs: 42,
          timeLabel: "há 7 min",
        },
        {
          id: "q2",
          sql: "VACUUM (ANALYZE) orders",
          durationMs: 870,
          timeLabel: "há 14 min",
        },
      ]}
    />
  )
}`,
  render: (
    <div className="w-72 rounded-lg border border-border p-2">
      <QueryHistoryList
        onSelect={() => undefined}
        items={[
          {
            id: "q1",
            sql: "SELECT count(*) FROM events WHERE created_at > now() - interval '1 hour'",
            durationMs: 42,
            timeLabel: "há 7 min",
          },
          {
            id: "q2",
            sql: "SELECT id, email FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 50",
            durationMs: 18,
            timeLabel: "há 12 min",
          },
          {
            id: "q3",
            sql: "VACUUM (ANALYZE) orders",
            durationMs: 870,
            timeLabel: "há 21 min",
          },
        ]}
      />
    </div>
  ),
}

export const examplesQueryHistoryList: Record<string, Example[]> = {
  "query-history-list": [basicExample],
}
