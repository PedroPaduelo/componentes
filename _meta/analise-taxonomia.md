# Exploração: Taxonomia atual da Vitrine UI (grupos × componentes × composições)

> Pergunta: levantamento READ-ONLY pra reorganizar a taxonomia — mapa por grupo, primitivos mal-agrupados, composições disfarçadas de componentes, "SGT Maker Project" e inventário de grupos.
> Data: 2026-06-22 · Stack: React 19 + Vite + TS. Arquivos de dados puros: `src/data/groups.ts`, `src/data/components.ts`, `src/data/compositions.ts`, `src/data/families.ts`.

## Resposta direta

- **273 componentes** em `components.ts`, todos mapeados explicitamente em `SLUG_GROUP_MAP` (10 grupos). **0 caem no DEFAULT_GROUP** hoje (`DEFAULT_GROUP = "feedback-status"` só vale pra slugs futuros sem entrada).
- **Não existe componente/composição chamado "SGT Maker Project"**. A única ocorrência de "SGT Maker" é uma **string de demo** dentro da descrição da composição `dba-workbench` ("Postgres do SGT Maker"). Os vizinhos reais são: composição `dba-workbench`, composição `db-schema-designer` e o componente `db-schema-explorer`.
- **Primitivos mal-agrupados (claros): ~7** — `table`, `table-fluid`, `data-table` (tabelas presas em `dashboards-data`), `progress-bar-tremor`, `progress-circle-tremor`, `callout-tremor` (deviam estar em `feedback-status` com `progress`/`alert`), `radial-gauge` (gauge/chart preso em `dashboards-data`). + vários borderline.
- **Composições disfarçadas de componentes:** 1 clara (`db-schema-explorer` — é um mini-app/tela, e a composição `dba-workbench` é construída AO REDOR dele) + ~5 blocos grandes "borderline" (observability) que **foram extraídos de propósito** como blocos instaláveis.
- **Não há grupo primitivo dedicado a TABELAS** nem a CARDS (cards moram em `layout-containers` misturados com card-effects). CHARTS já têm grupo (`dashboards-charts`).

---

## Onde está

- `src/data/groups.ts:60` — `GROUP_IDS` (10 grupos) + `GROUPS[]` (label/description/domain/order/icon).
- `src/data/groups.ts` — `SLUG_GROUP_MAP` (slug → GroupId, 273 entradas), `DEFAULT_GROUP = "feedback-status"`, helpers `getGroup`/`listGroups`/`getGroupItems`.
- `src/data/components.ts` — registry (273 itens; `ComponentMeta {slug,name,category,description,tags,usage?}`; `CATEGORIES` = Actions/Layout/Forms/Feedback).
- `src/data/compositions.ts` — 43 composições (`Composition {slug,name,description,tags,category?,wide?}`).
- `src/data/families.ts` — derivação de família/origem (não tem campo de grupo).

---

## 1) Mapa atual por grupo (273 itens, 0 no DEFAULT_GROUP)

Formato: `slug` — Name *(category)*.

### forms-inputs — 36 itens (domínio: primitivos)
- `calendar` — Calendar *(Forms)*
- `calendar-tremor` — Calendar (Tremor) *(Forms)*
- `checkbox` — Checkbox *(Forms)*
- `checkbox-group-fluid` — Checkbox Group (Fluid) *(Forms)*
- `color-picker-fluid` — Color Picker (Fluid) *(Forms)*
- `consent-manager` — Consent Manager *(Forms)*
- `date-picker` — Date Picker *(Forms)*
- `date-range-picker-tremor` — Date Range Picker (Tremor) *(Forms)*
- `elastic-slider` — Elastic Slider *(Forms)*
- `file-thumbnail-fluid` — File Thumbnail (Fluid) *(Feedback)*
- `file-upload` — File Upload *(Forms)*
- `form` — Form *(Forms)*
- `gooey-input` — Gooey Input *(Forms)*
- `input` — Input *(Forms)*
- `input-copy-fluid` — Input Copy (Fluid) *(Forms)*
- `input-group-fluid` — Input Group (Fluid) *(Forms)*
- `input-otp` — Input OTP *(Forms)*
- `keyboard` — Keyboard *(Feedback)*
- `label-tremor` — Label (Tremor) *(Forms)*
- `middle-truncation` — Middle Truncation *(Forms)*
- `placeholders-and-vanish-input` — Placeholders and Vanish Input *(Forms)*
- `preference-row` — Preference Row *(Forms)*
- `radio-group` — Radio Group *(Forms)*
- `radio-group-fluid` — Radio Group (Fluid) *(Forms)*
- `radio-card-group-tremor` — Radio Card Group (Tremor) *(Forms)*
- `react-wheel-picker` — React Wheel Picker *(Forms)*
- `select` — Select *(Forms)*
- `select-fluid` — Select (Fluid) *(Forms)*
- `select-native-tremor` — Select Native (Tremor) *(Forms)*
- `slide-to-unlock` — Slide to Unlock *(Forms)*
- `slider` — Slider *(Forms)*
- `slider-fluid` — Slider (Fluid) *(Forms)*
- `switch` — Switch *(Forms)*
- `switch-fluid` — Switch (Fluid) *(Forms)*
- `textarea` — Textarea *(Forms)*
- `toggle-tremor` — Toggle (Tremor) *(Forms)*

> Nota: `keyboard` e `file-thumbnail-fluid` têm `category:"Feedback"` mas estão (corretamente) no grupo forms-inputs — exemplo de como grupo ≠ category.

### actions-navigation — 37 itens (domínio: primitivos)
- `animated-button` — Animated Button *(Actions)*
- `breadcrumb` — Breadcrumb *(Layout)*
- `button` — Button *(Actions)*
- `button-fluid` — Button (Fluid) *(Actions)*
- `chevrons-up-down-icon` — Chevrons Up Down Icon *(Actions)*
- `command` — Command *(Actions)*
- `context-menu` — Context Menu *(Actions)*
- `copy-button` — Copy Button *(Actions)*
- `creepy-button` — Creepy Button *(Actions)*
- `dashboard-user-menu` — Dashboard User Menu *(Actions)*
- `database-tab-bar` — Database Tab Bar *(Actions)*
- `dropdown-fluid` — Dropdown (Fluid) *(Actions)*
- `dropdown-menu` — Dropdown Menu *(Actions)*
- `floating-dock` — Floating Dock *(Actions)*
- `floating-navbar` — Floating Navbar *(Actions)*
- `glass-dock` — Glass Dock *(Actions)*
- `hover-border-gradient` — Hover Border Gradient *(Actions)*
- `icon-swap` — Icon Swap *(Actions)*
- `magnetic-button` — Magnetic Button *(Actions)*
- `menubar` — Menubar *(Actions)*
- `moving-border` — Moving Border *(Actions)*
- `navbar-menu` — Navbar Menu *(Layout)*
- `navigation-menu` — Navigation Menu *(Actions)*
- `notch` — Notch *(Layout)*
- `pagination` — Pagination *(Layout)*
- `popover` — Popover *(Actions)*
- `resizable-navbar` — Resizable Navbar *(Actions)*
- `sidebar` — Sidebar *(Layout)*
- `stateful-button` — Stateful Button *(Actions)*
- `tab-navigation-tremor` — Tab Navigation (Tremor) *(Layout)*
- `tabs` — Tabs *(Layout)*
- `tabs-fluid` — Tabs (Fluid) *(Layout)*
- `tabs-subtle-fluid` — Tabs Subtle (Fluid) *(Layout)*
- `theme-switcher` — Theme Switcher *(Actions)*
- `theme-toggle-effect` — Theme Toggle Effect *(Actions)*
- `toc-minimap` — TOC Minimap *(Layout)*
- `toggle` — Toggle *(Actions)*

### layout-containers — 50 itens (domínio: primitivos)
- `3d-card-effect` — 3D Card Effect *(Layout)*
- `3d-pin` — 3D Pin *(Layout)*
- `accordion` — Accordion *(Layout)*
- `accordion-fluid` — Accordion (Fluid) *(Layout)*
- `alert-dialog` — Alert Dialog *(Feedback)*
- `animated-modal` — Animated Modal *(Feedback)*
- `animated-testimonials` — Animated Testimonials *(Feedback)*
- `apple-cards-carousel` — Apple Cards Carousel *(Layout)*
- `aspect-ratio` — Aspect Ratio *(Layout)*
- `bento-grid` — Bento Grid *(Layout)*
- `card` — Card *(Layout)*
- `card-tremor` — Card (Tremor) *(Layout)*
- `card-hover-effect` — Card Hover Effect *(Layout)*
- `card-spotlight` — Card Spotlight *(Feedback)*
- `card-stack` — Card Stack *(Layout)*
- `carousel` — Carousel *(Layout)*
- `collapsible` — Collapsible *(Layout)*
- `collapsible-section` — Collapsible Section *(Layout)*
- `comet-card` — Comet Card *(Layout)*
- `compare` — Compare *(Layout)*
- `dashboard-panel` — Dashboard Panel *(Layout)*
- `dashboard-sidebar-nav` — Dashboard Sidebar Nav *(Layout)*
- `dashboard-topbar` — Dashboard Topbar *(Layout)*
- `dialog` — Dialog *(Layout)*
- `dialog-fluid` — Dialog (Fluid) *(Layout)*
- `direction-aware-hover` — Direction Aware Hover *(Layout)*
- `divider-tremor` — Divider (Tremor) *(Layout)*
- `draggable-card` — Draggable Card *(Layout)*
- `drawer` — Drawer *(Layout)*
- `evervault-card` — Evervault Card *(Layout)*
- `expandable-cards` — Expandable Cards *(Layout)*
- `features-section-with-skeletons` — Features Section with Skeletons *(Layout)*
- `focus-cards` — Focus Cards *(Layout)*
- `glare-card` — Glare Card *(Layout)*
- `glow-card-grid` — Glow Card Grid *(Layout)*
- `glowing-stars-effect` — Glowing Stars Effect *(Feedback)*
- `images-slider` — Images Slider *(Layout)*
- `infinite-moving-cards` — Infinite Moving Cards *(Layout)*
- `layout-grid` — Layout Grid *(Layout)*
- `logo-slider` — Logo Slider *(Layout)*
- `resizable` — Resizable *(Layout)*
- `scroll-area` — Scroll Area *(Layout)*
- `scroll-fade-effect` — Scroll Fade Effect *(Layout)*
- `separator` — Separator *(Layout)*
- `sheet` — Sheet *(Layout)*
- `sticky-scroll-reveal` — Sticky Scroll Reveal *(Layout)*
- `team-section-with-scales` — Team Section with Scales *(Layout)*
- `tree` — Tree *(Layout)*
- `wobble-card` — Wobble Card *(Layout)*
- `work-experience-component` — Work Experience *(Layout)*

### feedback-status — 20 itens (domínio: primitivos)
- `alert` — Alert *(Feedback)*
- `animated-number` — Animated Number *(Feedback)*
- `animated-tooltip` — Animated Tooltip *(Feedback)*
- `avatar` — Avatar *(Feedback)*
- `badge` — Badge *(Feedback)*
- `badge-fluid` — Badge (Fluid) *(Feedback)*
- `hover-card` — Hover Card *(Feedback)*
- `images-badge` — Images Badge *(Feedback)*
- `link-preview` — Link Preview *(Feedback)*
- `loader` — Loader *(Feedback)*
- `mobius-loop-icon` — Mobius Loop Icon *(Actions)*
- `multi-step-loader` — Multi Step Loader *(Feedback)*
- `progress` — Progress *(Feedback)*
- `skeleton` — Skeleton *(Feedback)*
- `sonner` — Sonner *(Feedback)*
- `sticky-banner` — Sticky Banner *(Layout)*
- `toast` — Toast *(Feedback)*
- `tooltip-card` — Tooltip Card *(Feedback)*
- `tooltip-fluid` — Tooltip (Fluid) *(Feedback)*
- `workbench-status-bar` — Workbench Status Bar *(Feedback)*

### chat-ai — 5 itens (domínio: aplicações)
- `ask-user-questions-fluid` — Ask User Questions (Fluid) *(Forms)*
- `chat-message-fluid` — Chat Message (Fluid) *(Feedback)*
- `input-message-fluid` — Input Message (Fluid) *(Forms)*
- `thinking-indicator-fluid` — Thinking Indicator (Fluid) *(Feedback)*
- `thinking-steps-fluid` — Thinking Steps (Fluid) *(Feedback)*

### dashboards-charts — 15 itens (domínio: aplicações)
- `area-chart-tremor` — Area Chart (Tremor) *(Feedback)*
- `bar-chart` — Bar Chart *(Feedback)*
- `bar-chart-tremor` — Bar Chart (Tremor) *(Feedback)*
- `bar-list-tremor` — Bar List (Tremor) *(Feedback)*
- `category-bar-tremor` — Category Bar (Tremor) *(Feedback)*
- `combo-chart-tremor` — Combo Chart (Tremor) *(Feedback)*
- `donut-breakdown` — Donut Breakdown *(Feedback)*
- `donut-chart` — Donut Chart *(Feedback)*
- `donut-chart-tremor` — Donut Chart (Tremor) *(Feedback)*
- `h-bar-chart` — Horizontal Bar Chart *(Feedback)*
- `line-chart` — Line Chart *(Feedback)*
- `line-chart-tremor` — Line Chart (Tremor) *(Feedback)*
- `scatter-chart-tremor` — Scatter Chart (Tremor) *(Feedback)*
- `spark-chart-tremor` — Spark Chart (Tremor) *(Feedback)*
- `sparkline` — Sparkline *(Feedback)*

### dashboards-data — 46 itens (domínio: aplicações)
- `activity-feed` — Activity Feed *(Feedback)*
- `callout-tremor` — Callout (Tremor) *(Feedback)*  ⚠️ primitivo (alert/callout)
- `chart-template-gallery` — Chart Template Gallery *(Feedback)*
- `chart-widget` — Chart Widget *(Feedback)*
- `code-block` — Code Block *(Feedback)*  ⚠️ display genérico
- `code-block-command` — Code Block Command *(Feedback)*  ⚠️ display genérico
- `connection-list` — Connection List *(Feedback)*
- `container-resource-panel` — Container Resource Panel *(Feedback)*
- `dashboard-filter-bar` — Dashboard Filter Bar *(Feedback)*
- `data-table` — Data Table *(Layout)*  ⚠️ TABELA primitiva
- `db-overview-grid` — Db Overview Grid *(Feedback)*  ⚠️ bloco grande (borderline composição)
- `db-schema-explorer` — DB Schema Explorer *(Feedback)*  ⚠️ TELA/app (composição disfarçada)
- `detail-stat-cell` — Detail Stat Cell *(Feedback)*
- `ecg-strip` — ECG Strip *(Feedback)*
- `error-tracker-feed` — Error Tracker Feed *(Feedback)*  ⚠️ bloco grande (borderline)
- `favorites-list` — Favorites List *(Feedback)*
- `fleet-server-grid` — Fleet Server Grid *(Feedback)*  ⚠️ bloco grande (borderline)
- `github-contributions` — GitHub Contributions *(Feedback)*
- `incident-timeline` — Incident Timeline *(Feedback)*
- `invoice-table` — Invoice Table *(Layout)*  (tabela específica de fatura)
- `kpi-card` — KPI Card *(Feedback)*
- `latency-heatmap` — Latency Heatmap *(Feedback)*
- `leaderboard-list` — Leaderboard List *(Feedback)*
- `log-stream` — Log Stream *(Feedback)*
- `metric-glow-card` — Metric Glow Card *(Feedback)*
- `progress-bar-tremor` — Progress Bar (Tremor) *(Feedback)*  ⚠️ primitivo (progress)
- `progress-circle-tremor` — Progress Circle (Tremor) *(Feedback)*  ⚠️ primitivo (progress)
- `query-history-list` — Query History List *(Feedback)*
- `radial-gauge` — Radial Gauge *(Feedback)*  ⚠️ gauge/chart
- `react-flow` — React Flow *(Layout)*  (suite de diagramas — primitivo de grafo)
- `request-flow-inspector` — Request Flow Inspector *(Feedback)*  ⚠️ bloco grande (borderline)
- `server-overview-card` — Server Overview Card *(Feedback)*
- `service-mesh` — Service Mesh *(Feedback)*  ⚠️ bloco grande (borderline)
- `signal-card` — Signal Card *(Feedback)*
- `slow-query-list` — Slow Query List *(Feedback)*
- `stat-tile` — Stat Tile *(Feedback)*
- `table` — Table *(Layout)*  ⚠️ TABELA primitiva (citada pelo usuário)
- `table-fluid` — Table (Fluid) *(Layout)*  ⚠️ TABELA primitiva
- `table-info-panel` — Table Info Panel *(Feedback)*
- `terminal` — Terminal *(Feedback)*  (display animado)
- `tracker-tremor` — Tracker (Tremor) *(Feedback)*  ⚠️ KPI/progress primitivo
- `timeline` — Timeline *(Layout)*  (Aceternity scroll timeline — mais layout que data)
- `trace-waterfall` — Trace Waterfall *(Feedback)*
- `upgrade-card` — Upgrade Card *(Feedback)*
- `user-activity-stream` — User Activity Stream *(Feedback)*  ⚠️ bloco grande (borderline)
- `user-list-item` — User List Item *(Feedback)*

### text-effects — 18 itens (domínio: visual)
- `canvas-text`, `colourful-text`, `container-cover`, `container-text-flip`, `cyber-glitch-text`, `encrypted-text`, `flip-fade-text`, `flip-text`, `flip-words`, `fluid-gradient-text`, `layout-text-flip`, `shimmering-text`, `squiggly-text`, `text-flipping-board`, `text-generate-effect`, `text-hover-effect`, `text-reveal-card`, `typewriter-effect` (todos *(Feedback)* exceto `fluid-gradient-text` *(Layout)*)

### backgrounds-fx — 43 itens (domínio: visual)
- `3d-marquee`, `ascii-art`, `aurora-background`, `background-beams`, `background-beams-with-collision`, `background-boxes`, `background-gradient`, `background-gradient-animation`, `background-lines`, `background-ripple-effect`, `canvas-reveal-effect`, `container-scroll-animation`, `dither-shader`, `dot-grid-spotlight`, `dotted-glow-background`, `following-pointer`, `glowing-effect`, `google-gemini-effect`, `grid-and-dot-backgrounds`, `hero-highlight`, `hero-parallax`, `hero-section-with-mousemove`, `lamp-effect`, `lens`, `light-lines`, `macbook-scroll`, `meteors`, `noise-background`, `parallax-hero-images`, `parallax-hero-images-2`, `parallax-scroll`, `perspective-grid`, `pixelated-canvas`, `scales`, `shooting-stars-and-stars-background`, `sparkles`, `spotlight`, `spotlight-new`, `svg-mask-effect`, `tracing-beam`, `vortex`, `wavy-background`, `webcam-pixel-grid` (mix de Feedback/Layout categoria)

### globes-maps — 3 itens (domínio: visual)
- `3d-globe` — 3D Globe *(Feedback)*
- `github-globe` — GitHub Globe *(Feedback)*
- `world-map` — World Map *(Feedback)*

### DEFAULT_GROUP
- **0 slugs** caem no fallback hoje (`SLUG_GROUP_MAP` cobre os 273). `DEFAULT_GROUP = "feedback-status"` — só captura itens NOVOS ainda não classificados.

---

## 2) Primitivos mal-agrupados (PRIORIDADE)

### Claros (recomendado mover)
| slug | grupo atual | grupo primitivo correto | porquê |
|---|---|---|---|
| `table` | dashboards-data | **tabelas/data-display** (novo) ou layout | tabela semântica HTML pura — primitivo. Citado pelo usuário. |
| `table-fluid` | dashboards-data | **tabelas/data-display** (novo) | tabela primitiva (variante Fluid). |
| `data-table` | dashboards-data | **tabelas/data-display** (novo) | tabela tanstack (ordenação/paginação) — primitivo de dados. |
| `progress-bar-tremor` | dashboards-data | **feedback-status** | barra de progresso primitiva — irmã de `progress`. |
| `progress-circle-tremor` | dashboards-data | **feedback-status** | progresso circular primitivo. |
| `callout-tremor` | dashboards-data | **feedback-status** | callout/alert primitivo — irmão de `alert`. |
| `radial-gauge` | dashboards-data | **dashboards-charts** (ou "gauges") | medidor radial SVG = visualização/chart. |

### Borderline (avaliar)
- `tracker-tremor` (dashboards-data) — Tremor "tracker"/progress; poderia ir pra feedback-status ou charts.
- `code-block` / `code-block-command` (dashboards-data) — exibição de código genérica; poderiam ir pra um grupo "código/display" ou feedback.
- `kpi-card`, `stat-tile`, `metric-glow-card` (dashboards-data) — KPIs reusáveis; se criarem um grupo "cards/KPIs primitivo", caberiam lá.
- `divider-tremor` (layout-containers) — OK onde está (com `separator`), só registrando que é primitivo.
- `terminal` / `ecg-strip` (dashboards-data) — mais "display animado" que dado; borderline visual.

### Observações sobre o que o usuário citou
- **"table está em dashboards-data"** → CONFIRMADO. `table`, `table-fluid`, `data-table` estão todos em `dashboards-data` (misturados com observability/dev tools). **Não existe grupo primitivo de tabelas** — é o gap mais claro.
- **"card deveria estar no grupo de cards"** → `card` e `card-tremor` JÁ estão em `layout-containers` (o grupo de containers/cards), então tecnicamente não estão "errados". Mas `layout-containers` mistura **cards primitivos** (`card`, `card-tremor`, `dialog`, `drawer`, `sheet`) com **card-effects visuais** (`glare-card`, `comet-card`, `wobble-card`, `evervault-card`, `card-hover-effect`, `card-spotlight`, `3d-card-effect`, `3d-pin`, `draggable-card`, `direction-aware-hover`). Se a intenção é um grupo "cards" limpo, o caminho é **separar cards-primitivos de card-effects** (os effects poderiam ir pra `backgrounds-fx`/um grupo de efeitos).
- **"gráficos no grupo de charts"** → JÁ FEITO. Charts vivem em `dashboards-charts`. Único chart-ish fora dele: `radial-gauge` (em dashboards-data).

---

## 3) Composições disfarçadas de componentes (PRIORIDADE)

> Contexto importante: a iniciativa "nada inline → tudo componente instalável" (memória do projeto) **extraiu de propósito** blocos grandes das telas de dashboard e os registrou como componentes (`registry:ui`) para serem instaláveis e reutilizados DENTRO das composições. Então a maioria dos blocos "grandes" abaixo é intencional. O critério aqui é "isto é uma TELA/app, não um bloco?".

### Clara (é uma tela/app)
| slug | name | grupo atual | porquê é composição |
|---|---|---|---|
| `db-schema-explorer` | DB Schema Explorer | dashboards-data | É um **mini-app DBeaver/Navicat completo**: árvore lateral (banco→schemas→tabelas) com busca + painel de detalhe com 4 abas (Columns/Indexes/FKs/DDL) + FK clicável que navega. A composição **`dba-workbench` é construída AO REDOR dele** (ele é o protagonista). Tem layout de tela inteira, não é um "bloco" pontual. |

### Borderline (blocos grandes — provavelmente intencionais como blocos instaláveis)
- `db-overview-grid` — grid de frota de bancos com Dialog de detalhe (integra com db-schema-explorer). Quase uma tela, mas é um widget self-contained.
- `service-mesh` — grafo de topologia vivo com pacotes animados. Viz complexa, mas single-block.
- `error-tracker-feed` — feed Sentry-like com filtros/agrupamento.
- `user-activity-stream` — feed live Hotjar/FullStory-like.
- `fleet-server-grid` — grid de servidores com modal de detalhe.
- `request-flow-inspector`, `server-overview-card`, `container-resource-panel` — painéis densos de observability.

→ Recomendação: mover só `db-schema-explorer` é defensável; os demais são, por design, blocos reusáveis. Decisão é do time.

### Checagem de duplicação com `compositions.ts`
- `db-schema-explorer` (componente) **NÃO** tem equivalente em compositions; o que existe é `db-schema-designer` (composição) — coisa **diferente** (designer ER em React Flow vs explorer read-only). Não há duplicata; mover não colide.
- `react-flow` (componente, suite de diagramas) ≠ as composições react-flow (`workflow-builder`, `mind-map`, etc.) — é a lib-base, fica como componente.
- Nenhum componente duplica `saas-dashboard`, `observability-center`, etc. (essas só existem em compositions.ts).

---

## 4) "SGT Maker Project"

**Não existe** componente nem composição com slug/name "SGT Maker", "Segment Maker", "Schema Maker", "SaaS Maker" ou "Project Maker". A transcrição de voz casou com **dados de demonstração**:

- A única string "SGT Maker" do repo está em `src/data/compositions.ts`, na descrição da composição **`dba-workbench`** ("2 bancos pré-abertos: Postgres da auditoria de produção + **Postgres do SGT Maker**"). É só o nome fictício de um banco no demo — **não é um item da taxonomia**.

Itens reais "parecidos" que o usuário pode estar pensando:
- Composição `dba-workbench` — "DBA Workbench" (workbench IDE-like de banco). **É composição** (correto).
- Composição `db-schema-designer` — "Database Schema Designer" (editor ER React Flow). **É composição** (correto).
- Componente `db-schema-explorer` — "DB Schema Explorer". **É componente** hoje (ver seção 3 — candidato a virar composição).

Se a intenção do usuário era "mover o tal maker/workbench pra composições": `dba-workbench` e `db-schema-designer` **já estão** em composições; o único que poderia migrar é `db-schema-explorer`.

---

## 5) Inventário de grupos (GroupIds existentes)

| order | id | label | domínio | descrição (resumo) |
|---|---|---|---|---|
| 1 | `forms-inputs` | Forms & Inputs | primitivos | campos, seleção, captura de dados |
| 2 | `actions-navigation` | Actions & Navegação | primitivos | botões + menus/abas/breadcrumbs/navbars |
| 3 | `layout-containers` | Layout & Containers | primitivos | cards, grids, carrosséis, modais, drawers, separadores |
| 4 | `feedback-status` | Feedback & Status | primitivos | badges, alertas, toasts, progress, skeletons, tooltips |
| 5 | `chat-ai` | Chat & IA | aplicações | mensagens, raciocínio, prompts |
| 6 | `dashboards-charts` | Dashboards & Charts | aplicações | gráficos (área/barra/linha/pizza/dispersão/sparkline/combo) |
| 7 | `dashboards-data` | Dashboards & Data | aplicações | KPIs, tabelas, timelines, observability, trace, logs, dev tools |
| 7* | `text-effects` | Efeitos de Texto | visual | tipografia animada |
| 8 | `backgrounds-fx` | Backgrounds & FX | visual | fundos/efeitos imersivos |
| 9 | `globes-maps` | Globos & Mapas | visual | globos e mapas-múndi |

**Grupos primitivos que NÃO existem hoje e fariam sentido criar:**
- **Tables / Data Display** (primitivo) — não existe. Hoje `table`/`table-fluid`/`data-table` estão em `dashboards-data`. Destino natural de tabelas + (opcional) listas/feeds simples.
- **Cards** (primitivo dedicado) — não existe separado; cards primitivos + card-effects estão fundidos em `layout-containers`. Criar exigiria separar effects.
- **Charts** (primitivo) — **JÁ EXISTE** (`dashboards-charts`). Só falta puxar `radial-gauge`.

---

## Pontos de atenção

- **`group` é derivado, não armazenado**: a vinculação slug→grupo vive 100% em `SLUG_GROUP_MAP` (`groups.ts`). Reorganizar = editar esse mapa (e, se criar grupo novo, `GROUP_IDS` + `GROUPS` + ícone em `category-icons.ts`). **Não toca `components.ts` nem `families.ts`** (decisão de design aditiva e desacoplada — confirmada no header do `groups.ts`).
- **`category` (4 canônicas) ≠ grupo**: muitos slugs têm `category:"Feedback"` mas grupo diferente (charts, dashboards, text-effects). Não tente usar `category` como base da reorg — use só o mapa de grupo. As 4 categorias canônicas estão "poluídas" (Feedback é lixão) e mudá-las é invasivo (toca llms.txt, AiIndex, prompts) — fora de escopo recomendado.
- **Bug de `order` em `GROUPS`** (`groups.ts`): `dashboards-data` e `text-effects` têm ambos `order: 7` (duplicado), e `globes-maps` é `order: 9` apesar de serem 10 grupos. `listGroups()` ordena por `order` → empate em 7 fica não-determinístico. Vale corrigir a numeração (1..10) ao mexer na taxonomia.
- **Gotcha histórico (memória)**: já houve no `groups.ts` um comentário com `\n` LITERAL que comentou a entrada seguinte de `area-chart-tremor` (jogava no DEFAULT_GROUP). No estado ATUAL lido, `area-chart-tremor` está mapeado corretamente em `dashboards-charts` (linha presente, sem `\n` literal) — então esse bug específico parece já resolvido. Reconfira ao editar.
- **Build/registry não afetado**: os scripts `_meta/scripts/lote/*` parseiam `components.ts`/`compositions.ts` por regex e **ignoram** `groups.ts`. Reagrupar não exige `registry:build`. Mover um slug de `components.ts`→`compositions.ts` (caso `db-schema-explorer`) SIM exige regenerar registry + llms.txt + criar `src/compositions/<slug>.tsx` e religar quem o usa (ex.: `dba-workbench`).
- **Famílias**: `families.ts` agrupa por base de slug (remove `-fluid` + `FAMILY_BASE_MAP`). `table`+`table-fluid` já são família "Table"; `progress`+`progress-bar-tremor`+`progress-circle-tremor` NÃO são família (slugs distintos). Mover de grupo não mexe em família.

## Lacunas
- Não inspecionei o conteúdo de `src/compositions/*.tsx` nem `src/components/ui/db-schema-explorer.tsx` para contar com precisão quantos sub-componentes cada bloco usa (a classificação "tela vs bloco" da seção 3 baseou-se nas descrições do registry, que são detalhadas). Se for decidir mover `db-schema-explorer`, vale abrir o `.tsx` pra medir o tamanho/dependências antes.
- A decisão de criar grupos novos (Tables, Cards) é de produto — aqui só mapeei o estado e os gaps.
