import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, AlertTriangle } from "lucide-react"
import type { Example } from "@/data/examples"

const alertDefaultExample: Example = {
  title: "Padrão",
  description: "Alerta informativo com ícone e título.",
  code: `<Alert>
  <Terminal className="size-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>`,
  render: (
    <Alert>
      <Terminal className="size-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
}

const alertDestructiveExample: Example = {
  title: "Destrutivo",
  description: "Alerta de erro ou ação destrutiva.",
  code: `<Alert variant="destructive">
  <AlertTriangle className="size-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>`,
  render: (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

export const examplesAlert: Record<string, Example[]> = {
  alert: [alertDefaultExample, alertDestructiveExample],
}
