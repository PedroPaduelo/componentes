/**
 * Tipos do `RequestFlowInspector` — inspetor detalhado de UMA request HTTP
 * (estilo DevTools Network / Datadog APM "Request" panel).
 *
 * Mantidos em arquivo separado do componente para:
 *  - reuso por consumers (playbooks, testes, mocks de APM);
 *  - clareza do contrato (consumers não precisam importar o JSX);
 *  - evitar o lint `react-refresh/only-export-components` (o .tsx
 *    exporta só o componente + tipos, sem helpers/constantes).
 */

export type HttpHeader = { key: string; value: string }

export type RequestCookie = {
  key: string
  value: string
  secure?: boolean
  httpOnly?: boolean
}

export type RequestTiming = {
  dnsMs: number
  tcpMs: number
  tlsMs: number
  serverMs: number
  transferMs: number
}

export type RequestGeo = {
  country: string
  city: string
  lat: number
  lng: number
  asn?: string
}

export type InspectedRequestMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"

export type InspectedRequestProtocol = "http/1.1" | "http/2" | "http/3"

export type InspectedRequestBodyType = "json" | "html" | "text" | "binary"

export type InspectedRequest = {
  id: string
  method: InspectedRequestMethod
  url: string
  status: number
  statusText: string
  protocol: InspectedRequestProtocol
  requestHeaders: HttpHeader[]
  responseHeaders: HttpHeader[]
  requestBody?: string
  responseBody?: string
  responseBodyType?: InspectedRequestBodyType
  ttfbMs: number
  durationMs: number
  sizeKB: number
  ip: string
  geo: RequestGeo
  userAgent: string
  referer?: string
  cookies: RequestCookie[]
  timing: RequestTiming
  traceId: string
  spanId: string
  parentSpanId?: string
  service: string
  environment: "prod" | "staging" | "dev"
}

export type RequestFlowInspectorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** A request inspecionada. Toda a UI é derivada dela. */
  request: InspectedRequest
}
