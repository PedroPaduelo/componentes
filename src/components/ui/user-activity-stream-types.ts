/**
 * Tipos públicos do `UserActivityStream`.
 *
 * O componente modela um feed de eventos de usuário estilo Hotjar/FullStory/
 * Mixpanel Live — cada item é uma ação observada no app (login, page_view,
 * form_submit, error etc.) com timestamp, usuário, geo e IP opcional.
 */

/** Ações que o stream reconhece. */
export type UserActivityAction =
  | "login"
  | "logout"
  | "page_view"
  | "form_submit"
  | "click"
  | "error"
  | "abuse_flag"
  | "purchase"
  | "signup"

/** Identidade do ator do evento. */
export type UserActivityUser = {
  id: string
  name: string
  avatar?: string
  role?: string
}

/** Localização geográfica opcional. */
export type UserActivityGeo = {
  country: string
  city: string
  lat?: number
  lng?: number
}

/**
 * Par chave/valor arbitrário anexado a um evento (ex.: `{ key: "plan",
 * value: "pro" }` para um `purchase`).
 */
export type UserActivityPayload = {
  key: string
  value: string | number | boolean
}

/** Um evento do stream. */
export type UserActivityEvent = {
  id: string
  /** ISO timestamp do instante em que o evento foi observado. */
  t: string
  user: UserActivityUser
  action: UserActivityAction
  /** Rota / página onde a ação aconteceu (quando aplicável). */
  page?: string
  payload?: UserActivityPayload[]
  ip?: string
  geo?: UserActivityGeo
  durationMs?: number
  flagged?: boolean
}

/**
 * Modo de agrupamento visual:
 * - `"none"`: lista plana na ordem de chegada.
 * - `"user"`: insere um header sticky sempre que o usuário muda.
 * - `"action"": header sticky por tipo de ação.
 * - `"page"`: header sticky por página.
 */
export type UserActivityGroupBy = "none" | "user" | "action" | "page"

export type UserActivityStreamProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onClick"
> & {
  events: UserActivityEvent[]
  groupBy?: UserActivityGroupBy
  /**
   * Quando `true`, o componente entra em modo "live":
   * - injeta um evento novo a cada 5s (simulação determinística);
   * - faz auto-scroll pro fim enquanto o usuário não tiver rolado pra cima.
   * Use `onUserClick` / `onEventClick` para reações customizadas.
   */
  live?: boolean
  /** Cap de itens renderizados (default 200). Itens mais antigos são descartados. */
  maxItems?: number
  onUserClick?: (userId: string) => void
  onEventClick?: (event: UserActivityEvent) => void
}
