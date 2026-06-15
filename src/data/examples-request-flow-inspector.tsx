import { RequestFlowInspector } from "@/components/ui/request-flow-inspector"
import type { InspectedRequest } from "@/components/ui/request-flow-inspector-types"
import type { Example } from "@/data/examples"

/* ---------------------------------- GET ---------------------------------- */

const getMeRequest: InspectedRequest = {
  id: "req_01HMV3K8W6T5X3F2P0QAB4Z9N7",
  method: "GET",
  url: "https://api.vitrine.dev/v1/me?include=team,plan",
  status: 200,
  statusText: "OK",
  protocol: "http/2",
  requestHeaders: [
    { key: "Host", value: "api.vitrine.dev" },
    { key: "User-Agent", value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36" },
    { key: "Accept", value: "application/json, text/plain, */*" },
    { key: "Accept-Encoding", value: "gzip, deflate, br" },
    { key: "Accept-Language", value: "pt-BR,pt;q=0.9,en-US;q=0.8" },
    { key: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…" },
    { key: "X-Request-Id", value: "01HMV3K8W6T5X3F2P0QAB4Z9N7" },
    { key: "X-Trace-Id", value: "9b1c4e3a-7d2f-4f1a-bb5a-3a9d2e3a14c1" },
  ],
  responseHeaders: [
    { key: "Content-Type", value: "application/json; charset=utf-8" },
    { key: "Content-Encoding", value: "gzip" },
    { key: "Cache-Control", value: "private, max-age=0, must-revalidate" },
    { key: "Server", value: "edge/vitrine@3.4.1" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    { key: "X-Request-Id", value: "01HMV3K8W6T5X3F2P0QAB4Z9N7" },
    { key: "X-Trace-Id", value: "9b1c4e3a-7d2f-4f1a-bb5a-3a9d2e3a14c1" },
    { key: "Date", value: "Sun, 15 Jun 2026 14:22:09 GMT" },
  ],
  responseBody: JSON.stringify(
    {
      id: "user_2Kq1Xp0m",
      email: "ana.silva@vitrine.dev",
      name: "Ana Silva",
      role: "admin",
      team: { id: "team_8Z", name: "Platform" },
      plan: { id: "pro", seats: 25, used: 17 },
      createdAt: "2025-11-02T17:14:22Z",
    },
    null,
    2,
  ),
  responseBodyType: "json",
  ttfbMs: 42,
  durationMs: 168,
  sizeKB: 4.3,
  ip: "187.45.112.18",
  geo: { country: "BR", city: "São Paulo", lat: -23.55, lng: -46.63, asn: "AS28573" },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  referer: "https://app.vitrine.dev/dashboard",
  cookies: [
    { key: "session", value: "s%3A1f8aCq0X…", secure: true, httpOnly: true },
    { key: "pref_locale", value: "pt-BR", secure: true },
  ],
  timing: { dnsMs: 12, tcpMs: 28, tlsMs: 38, serverMs: 64, transferMs: 26 },
  traceId: "9b1c4e3a-7d2f-4f1a-bb5a-3a9d2e3a14c1",
  spanId: "7c2e9a40",
  service: "api-gateway",
  environment: "prod",
}

const getMeExample: Example = {
  title: "GET /v1/me 200",
  description:
    "Request bem-sucedida do gateway de API: profile do usuário com joins de team e plan. latência ~168 ms, 2xx (emerald).",
  code: `const request: InspectedRequest = {
  method: "GET",
  url: "https://api.vitrine.dev/v1/me?include=team,plan",
  status: 200,
  // …
}

<RequestFlowInspector request={request} />`,
  render: <RequestFlowInspector request={getMeRequest} />,
}

/* --------------------------------- POST ---------------------------------- */

const postCheckoutRequest: InspectedRequest = {
  id: "req_01HMV4B2R8P3K9J6T5V0W7Y1ZN",
  method: "POST",
  url: "https://api.vitrine.dev/v1/checkout",
  status: 500,
  statusText: "Internal Server Error",
  protocol: "http/2",
  requestHeaders: [
    { key: "Host", value: "api.vitrine.dev" },
    { key: "Content-Type", value: "application/json" },
    { key: "Content-Length", value: "412" },
    { key: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…" },
    { key: "Idempotency-Key", value: "1d3f0a5e-92c1-4f1a-bd2c-71e63a4a0f1b" },
    { key: "X-Request-Id", value: "01HMV4B2R8P3K9J6T5V0W7Y1ZN" },
    { key: "X-Trace-Id", value: "f4a01b6c-2c8e-49b1-9c2d-0e1a3b4f5d62" },
  ],
  responseHeaders: [
    { key: "Content-Type", value: "application/json; charset=utf-8" },
    { key: "Server", value: "edge/vitrine@3.4.1" },
    { key: "X-Request-Id", value: "01HMV4B2R8P3K9J6T5V0W7Y1ZN" },
    { key: "X-Trace-Id", value: "f4a01b6c-2c8e-49b1-9c2d-0e1a3b4f5d62" },
    { key: "X-Error-Code", value: "PAYMENT_PROVIDER_TIMEOUT" },
    { key: "Date", value: "Sun, 15 Jun 2026 14:24:51 GMT" },
  ],
  requestBody: JSON.stringify(
    {
      cartId: "cart_4X2",
      customer: { id: "user_2Kq1Xp0m", email: "ana.silva@vitrine.dev" },
      items: [
        { sku: "TSHIRT-BLK-M", quantity: 2, unitPriceCents: 4990 },
        { sku: "MUG-WHT-001", quantity: 1, unitPriceCents: 2490 },
      ],
      shipping: { zip: "01310-100", country: "BR" },
      paymentMethodId: "pm_card_1PqL2aX3",
    },
    null,
    2,
  ),
  responseBody: JSON.stringify(
    {
      error: "PAYMENT_PROVIDER_TIMEOUT",
      message:
        "Upstream payment provider did not respond within 4500ms. Charge not captured.",
      details: {
        provider: "stripe",
        providerRequestId: "req_1PqL2aX3",
        upstreamStatus: 504,
        retried: 1,
      },
      stack: [
        "PaymentProviderTimeoutError: upstream did not respond in 4500ms",
        "    at PaymentClient.charge (/srv/checkout/payment.ts:118:24)",
        "    at async CheckoutService.createOrder (/srv/checkout/service.ts:201:13)",
        "    at async ApiRouter.handle (/srv/api/router.ts:88:7)",
      ],
      requestId: "01HMV4B2R8P3K9J6T5V0W7Y1ZN",
      traceId: "f4a01b6c-2c8e-49b1-9c2d-0e1a3b4f5d62",
    },
    null,
    2,
  ),
  responseBodyType: "json",
  ttfbMs: 4512,
  durationMs: 4607,
  sizeKB: 1.2,
  ip: "201.20.55.101",
  geo: { country: "BR", city: "Rio de Janeiro", lat: -22.91, lng: -43.17, asn: "AS27693" },
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  referer: "https://app.vitrine.dev/checkout/cart_4X2",
  cookies: [
    { key: "session", value: "s%3A1f8aCq0X…", secure: true, httpOnly: true },
    { key: "cart_pin", value: "cart_4X2", secure: true },
  ],
  timing: { dnsMs: 8, tcpMs: 22, tlsMs: 31, serverMs: 4505, transferMs: 41 },
  traceId: "f4a01b6c-2c8e-49b1-9c2d-0e1a3b4f5d62",
  spanId: "a18d3c20",
  parentSpanId: "7c2e9a40",
  service: "checkout-service",
  environment: "prod",
}

const postCheckoutExample: Example = {
  title: "POST /v1/checkout 500",
  description:
    "Falha de upstream no checkout: timeout do payment provider. 5xx (rose), TTFB alto (4.5s), com stack trace no body.",
  code: `const request: InspectedRequest = {
  method: "POST",
  url: "https://api.vitrine.dev/v1/checkout",
  status: 500,
  // …
}

<RequestFlowInspector request={request} />`,
  render: <RequestFlowInspector request={postCheckoutRequest} />,
}

export const examplesRequestFlowInspector: Record<string, Example[]> = {
  "request-flow-inspector": [getMeExample, postCheckoutExample],
}
