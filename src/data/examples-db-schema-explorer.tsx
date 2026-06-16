/**
 * Examples — db-schema-explorer.
 *
 * Two realistic fixtures:
 *   1. `audit-db` — Postgres 16 audit warehouse, 5 schemas, 24 tables.
 *   2. `sgt-maker` — Postgres 16 SGT Maker app, 3 schemas, 12 tables.
 *
 * FKs cross-link the tables so the "click FK → jump" UX is exercised
 * (e.g. clicking audit.events.actor_id jumps to iam.users).
 */

import { DbSchemaExplorer } from "@/components/ui/db-schema-explorer"
import type { Example } from "@/data/examples"
import type { DatabaseSchema } from "@/components/ui/db-schema-explorer-types"

export const auditDb: DatabaseSchema = {
  id: "audit-db",
  name: "audit-prod-01",
  engine: "postgresql",
  host: "audit-prod-01.internal",
  port: 5432,
  version: "16.4",
  sizeMB: 12_480,
  tables: 24,
  schemas: [
    {
      name: "iam",
      tables: [
        {
          name: "users",
          schema: "iam",
          description: "Identidades de usuários humanos e service accounts.",
          rowCount: 4_812,
          sizeMB: 18,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true, defaultValue: "gen_random_uuid()" },
            { name: "email", type: "citext", nullable: false, isPrimary: false, comment: "Único por tenant" },
            { name: "display_name", type: "text", nullable: true, isPrimary: false },
            { name: "kind", type: "user_kind", nullable: false, isPrimary: false, defaultValue: "'human'" },
            { name: "tenant_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "tenants", column: "id" } },
            { name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
            { name: "disabled_at", type: "timestamptz", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "users_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "users_email_key", columns: ["tenant_id", "email"], unique: true, type: "btree" },
            { name: "users_kind_idx", columns: ["kind"], unique: false, type: "btree" },
            { name: "users_search_idx", columns: ["email", "display_name"], unique: false, type: "gin" },
          ],
          foreignKeys: [
            { name: "users_tenant_fk", columns: ["tenant_id"], references: { schema: "iam", table: "tenants", column: "id" }, onDelete: "RESTRICT" },
          ],
        },
        {
          name: "tenants",
          schema: "iam",
          description: "Organizações clientes do produto (multi-tenant).",
          rowCount: 38,
          sizeMB: 1,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true, defaultValue: "gen_random_uuid()" },
            { name: "slug", type: "text", nullable: false, isPrimary: false, comment: "Identificador URL-safe" },
            { name: "plan", type: "tenant_plan", nullable: false, isPrimary: false, defaultValue: "'free'" },
            { name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "tenants_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "tenants_slug_key", columns: ["slug"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
        {
          name: "roles",
          schema: "iam",
          description: "Papéis atribuíveis a usuários (admin, analyst, viewer…).",
          rowCount: 12,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "name", type: "text", nullable: false, isPrimary: false },
            { name: "permissions", type: "text[]", nullable: false, isPrimary: false, defaultValue: "'{}'::text[]" },
          ],
          indexes: [
            { name: "roles_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "roles_name_key", columns: ["name"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
        {
          name: "user_roles",
          schema: "iam",
          description: "Atribuição N:N de papéis a usuários (com escopo de tenant).",
          rowCount: 18_204,
          sizeMB: 4,
          primaryKey: ["user_id", "role_id", "tenant_id"],
          columns: [
            { name: "user_id", type: "uuid", nullable: false, isPrimary: true, isForeign: true, references: { table: "users", column: "id" } },
            { name: "role_id", type: "uuid", nullable: false, isPrimary: true, isForeign: true, references: { table: "roles", column: "id" } },
            { name: "tenant_id", type: "uuid", nullable: false, isPrimary: true, isForeign: true, references: { table: "tenants", column: "id" } },
            { name: "granted_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "user_roles_pkey", columns: ["user_id", "role_id", "tenant_id"], unique: true, type: "btree" },
            { name: "user_roles_role_idx", columns: ["role_id", "tenant_id"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "user_roles_user_fk", columns: ["user_id"], references: { schema: "iam", table: "users", column: "id" }, onDelete: "CASCADE" },
            { name: "user_roles_role_fk", columns: ["role_id"], references: { schema: "iam", table: "roles", column: "id" }, onDelete: "RESTRICT" },
            { name: "user_roles_tenant_fk", columns: ["tenant_id"], references: { schema: "iam", table: "tenants", column: "id" }, onDelete: "CASCADE" },
          ],
        },
        {
          name: "api_keys",
          schema: "iam",
          description: "Tokens de longa duração para integrações server-to-server.",
          rowCount: 612,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "user_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "users", column: "id" } },
            { name: "prefix", type: "text", nullable: false, isPrimary: false, comment: "Primeiros 8 chars do token (lookup)" },
            { name: "hash", type: "bytea", nullable: false, isPrimary: false, comment: "Argon2id do segredo" },
            { name: "scopes", type: "text[]", nullable: false, isPrimary: false, defaultValue: "'{}'::text[]" },
            { name: "expires_at", type: "timestamptz", nullable: true, isPrimary: false },
            { name: "last_used_at", type: "timestamptz", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "api_keys_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "api_keys_prefix_key", columns: ["prefix"], unique: true, type: "btree" },
            { name: "api_keys_user_idx", columns: ["user_id"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "api_keys_user_fk", columns: ["user_id"], references: { schema: "iam", table: "users", column: "id" }, onDelete: "CASCADE" },
          ],
        },
        {
          name: "sessions",
          schema: "iam",
          description: "Sessões web ativas e histórico recente (90 dias).",
          rowCount: 24_881,
          sizeMB: 22,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "user_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "users", column: "id" } },
            { name: "ip", type: "inet", nullable: true, isPrimary: false },
            { name: "user_agent", type: "text", nullable: true, isPrimary: false },
            { name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
            { name: "revoked_at", type: "timestamptz", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "sessions_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "sessions_user_idx", columns: ["user_id", "created_at"], unique: false, type: "brin" },
          ],
          foreignKeys: [
            { name: "sessions_user_fk", columns: ["user_id"], references: { schema: "iam", table: "users", column: "id" }, onDelete: "CASCADE" },
          ],
        },
      ],
    },
    {
      name: "audit",
      views: 8,
      functions: 3,
      tables: [
        {
          name: "events",
          schema: "audit",
          description: "Stream append-only de eventos de auditoria (imutável).",
          rowCount: 184_391_402,
          sizeMB: 9_140,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "bigint", nullable: false, isPrimary: true, comment: "Sequence local, monotonic" },
            { name: "occurred_at", type: "timestamptz", nullable: false, isPrimary: false },
            { name: "actor_id", type: "uuid", nullable: true, isPrimary: false, isForeign: true, references: { table: "users", column: "id" } },
            { name: "actor_kind", type: "actor_kind", nullable: false, isPrimary: false, defaultValue: "'user'" },
            { name: "action", type: "text", nullable: false, isPrimary: false, comment: "ex.: user.login, role.assign" },
            { name: "target_type", type: "text", nullable: true, isPrimary: false },
            { name: "target_id", type: "text", nullable: true, isPrimary: false },
            { name: "metadata", type: "jsonb", nullable: true, isPrimary: false, defaultValue: "'{}'::jsonb" },
            { name: "ip", type: "inet", nullable: true, isPrimary: false },
            { name: "request_id", type: "uuid", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "events_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "events_occurred_brin", columns: ["occurred_at"], unique: false, type: "brin" },
            { name: "events_actor_idx", columns: ["actor_id", "occurred_at"], unique: false, type: "btree" },
            { name: "events_action_idx", columns: ["action"], unique: false, type: "btree" },
            { name: "events_metadata_gin", columns: ["metadata"], unique: false, type: "gin" },
          ],
          foreignKeys: [
            { name: "events_actor_fk", columns: ["actor_id"], references: { schema: "iam", table: "users", column: "id" }, onDelete: "SET NULL" },
          ],
        },
        {
          name: "policy_changes",
          schema: "audit",
          description: "Mudanças de política (RBAC, feature flags) com diff JSON.",
          rowCount: 1_204,
          sizeMB: 12,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "bigint", nullable: false, isPrimary: true },
            { name: "changed_at", type: "timestamptz", nullable: false, isPrimary: false },
            { name: "changed_by", type: "uuid", nullable: true, isPrimary: false, isForeign: true, references: { table: "users", column: "id" } },
            { name: "policy_type", type: "text", nullable: false, isPrimary: false },
            { name: "before", type: "jsonb", nullable: true, isPrimary: false },
            { name: "after", type: "jsonb", nullable: false, isPrimary: false },
          ],
          indexes: [
            { name: "policy_changes_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "policy_changes_type_idx", columns: ["policy_type", "changed_at"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "policy_changes_user_fk", columns: ["changed_by"], references: { schema: "iam", table: "users", column: "id" }, onDelete: "SET NULL" },
          ],
        },
        {
          name: "login_attempts",
          schema: "audit",
          description: "Tentativas de login (sucesso e falha) — base do rate limiting.",
          rowCount: 8_402_881,
          sizeMB: 240,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "bigint", nullable: false, isPrimary: true },
            { name: "occurred_at", type: "timestamptz", nullable: false, isPrimary: false },
            { name: "email", type: "citext", nullable: true, isPrimary: false },
            { name: "ip", type: "inet", nullable: false, isPrimary: false },
            { name: "user_agent", type: "text", nullable: true, isPrimary: false },
            { name: "success", type: "boolean", nullable: false, isPrimary: false },
            { name: "reason", type: "text", nullable: true, isPrimary: false, comment: "Motivo da falha (ex.: bad_password)" },
          ],
          indexes: [
            { name: "login_attempts_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "login_attempts_email_brin", columns: ["occurred_at"], unique: false, type: "brin" },
            { name: "login_attempts_ip_idx", columns: ["ip", "occurred_at"], unique: false, type: "btree" },
          ],
          foreignKeys: [],
        },
        {
          name: "data_exports",
          schema: "audit",
          description: "Exportações de dados pessoais (LGPD) — exige aprovação.",
          rowCount: 1_842,
          sizeMB: 6,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "requested_by", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "users", column: "id" } },
            { name: "approved_by", type: "uuid", nullable: true, isPrimary: false, isForeign: true, references: { table: "users", column: "id" } },
            { name: "subject_user_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "users", column: "id" } },
            { name: "format", type: "export_format", nullable: false, isPrimary: false },
            { name: "status", type: "export_status", nullable: false, isPrimary: false, defaultValue: "'pending'" },
            { name: "created_at", type: "timestamptz", nullable: false, isPrimary: false },
            { name: "completed_at", type: "timestamptz", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "data_exports_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "data_exports_status_idx", columns: ["status", "created_at"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "data_exports_requester_fk", columns: ["requested_by"], references: { schema: "iam", table: "users", column: "id" }, onDelete: "RESTRICT" },
            { name: "data_exports_approver_fk", columns: ["approved_by"], references: { schema: "iam", table: "users", column: "id" }, onDelete: "SET NULL" },
            { name: "data_exports_subject_fk", columns: ["subject_user_id"], references: { schema: "iam", table: "users", column: "id" }, onDelete: "RESTRICT" },
          ],
        },
        {
          name: "retention_policies",
          schema: "audit",
          description: "Regras de retenção por categoria de dado (LGPD/GDPR).",
          rowCount: 18,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "category", type: "text", nullable: false, isPrimary: false },
            { name: "retention_days", type: "integer", nullable: false, isPrimary: false },
            { name: "legal_basis", type: "text", nullable: true, isPrimary: false },
            { name: "created_at", type: "timestamptz", nullable: false, isPrimary: false },
          ],
          indexes: [
            { name: "retention_policies_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "retention_policies_category_key", columns: ["category"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
      ],
    },
    {
      name: "billing",
      views: 4,
      tables: [
        {
          name: "plans",
          schema: "billing",
          description: "Catálogo de planos (free / pro / enterprise).",
          rowCount: 5,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "text", nullable: false, isPrimary: true, comment: "Slug do plano" },
            { name: "name", type: "text", nullable: false, isPrimary: false },
            { name: "monthly_cents", type: "integer", nullable: false, isPrimary: false },
            { name: "features", type: "jsonb", nullable: false, isPrimary: false, defaultValue: "'{}'::jsonb" },
          ],
          indexes: [
            { name: "plans_pkey", columns: ["id"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
        {
          name: "subscriptions",
          schema: "billing",
          description: "Assinatura atual por tenant (apenas 1 ativa por tenant).",
          rowCount: 38,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "tenant_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "tenants", column: "id" } },
            { name: "plan_id", type: "text", nullable: false, isPrimary: false, isForeign: true, references: { table: "plans", column: "id" } },
            { name: "status", type: "sub_status", nullable: false, isPrimary: false, defaultValue: "'active'" },
            { name: "started_at", type: "timestamptz", nullable: false, isPrimary: false },
            { name: "canceled_at", type: "timestamptz", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "subscriptions_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "subscriptions_tenant_key", columns: ["tenant_id"], unique: true, type: "btree" },
          ],
          foreignKeys: [
            { name: "subscriptions_tenant_fk", columns: ["tenant_id"], references: { schema: "iam", table: "tenants", column: "id" }, onDelete: "CASCADE" },
            { name: "subscriptions_plan_fk", columns: ["plan_id"], references: { schema: "billing", table: "plans", column: "id" }, onDelete: "RESTRICT" },
          ],
        },
        {
          name: "invoices",
          schema: "billing",
          description: "Faturas mensais emitidas por subscription.",
          rowCount: 1_204,
          sizeMB: 8,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "subscription_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "subscriptions", column: "id" } },
            { name: "period_start", type: "date", nullable: false, isPrimary: false },
            { name: "period_end", type: "date", nullable: false, isPrimary: false },
            { name: "amount_cents", type: "integer", nullable: false, isPrimary: false },
            { name: "status", type: "invoice_status", nullable: false, isPrimary: false, defaultValue: "'open'" },
            { name: "paid_at", type: "timestamptz", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "invoices_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "invoices_sub_period_key", columns: ["subscription_id", "period_start"], unique: true, type: "btree" },
            { name: "invoices_status_idx", columns: ["status"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "invoices_sub_fk", columns: ["subscription_id"], references: { schema: "billing", table: "subscriptions", column: "id" }, onDelete: "CASCADE" },
          ],
        },
        {
          name: "payment_methods",
          schema: "billing",
          description: "Métodos de pagamento salvos (tokenizados, sem PAN).",
          rowCount: 92,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "tenant_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "tenants", column: "id" } },
            { name: "provider", type: "text", nullable: false, isPrimary: false, comment: "stripe | mercadopago | …" },
            { name: "provider_token", type: "text", nullable: false, isPrimary: false },
            { name: "brand", type: "text", nullable: true, isPrimary: false },
            { name: "last4", type: "char(4)", nullable: true, isPrimary: false },
            { name: "is_default", type: "boolean", nullable: false, isPrimary: false, defaultValue: "false" },
          ],
          indexes: [
            { name: "payment_methods_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "payment_methods_tenant_idx", columns: ["tenant_id"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "payment_methods_tenant_fk", columns: ["tenant_id"], references: { schema: "iam", table: "tenants", column: "id" }, onDelete: "CASCADE" },
          ],
        },
        {
          name: "credit_notes",
          schema: "billing",
          description: "Notas de crédito (estornos e descontos manuais).",
          rowCount: 18,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "invoice_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "invoices", column: "id" } },
            { name: "amount_cents", type: "integer", nullable: false, isPrimary: false },
            { name: "reason", type: "text", nullable: false, isPrimary: false },
            { name: "issued_at", type: "timestamptz", nullable: false, isPrimary: false },
          ],
          indexes: [
            { name: "credit_notes_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "credit_notes_invoice_idx", columns: ["invoice_id"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "credit_notes_invoice_fk", columns: ["invoice_id"], references: { schema: "billing", table: "invoices", column: "id" }, onDelete: "CASCADE" },
          ],
        },
      ],
    },
    {
      name: "observability",
      views: 2,
      functions: 1,
      tables: [
        {
          name: "ingest_batches",
          schema: "observability",
          description: "Lote de ingestão de métricas/traces (idempotente por source_key).",
          rowCount: 4_120,
          sizeMB: 32,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "source", type: "text", nullable: false, isPrimary: false },
            { name: "source_key", type: "text", nullable: false, isPrimary: false, comment: "Chave de idempotência do produtor" },
            { name: "received_at", type: "timestamptz", nullable: false, isPrimary: false },
            { name: "items", type: "integer", nullable: false, isPrimary: false },
            { name: "bytes", type: "bigint", nullable: false, isPrimary: false },
            { name: "tenant_id", type: "uuid", nullable: true, isPrimary: false, isForeign: true, references: { table: "tenants", column: "id" } },
          ],
          indexes: [
            { name: "ingest_batches_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "ingest_batches_source_key", columns: ["source", "source_key"], unique: true, type: "btree" },
            { name: "ingest_batches_received_brin", columns: ["received_at"], unique: false, type: "brin" },
          ],
          foreignKeys: [
            { name: "ingest_batches_tenant_fk", columns: ["tenant_id"], references: { schema: "iam", table: "tenants", column: "id" }, onDelete: "SET NULL" },
          ],
        },
        {
          name: "alert_rules",
          schema: "observability",
          description: "Regras declarativas de alerta (PromQL-like).",
          rowCount: 84,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "tenant_id", type: "uuid", nullable: true, isPrimary: false, isForeign: true, references: { table: "tenants", column: "id" } },
            { name: "name", type: "text", nullable: false, isPrimary: false },
            { name: "expression", type: "text", nullable: false, isPrimary: false },
            { name: "severity", type: "alert_severity", nullable: false, isPrimary: false, defaultValue: "'warning'" },
            { name: "enabled", type: "boolean", nullable: false, isPrimary: false, defaultValue: "true" },
          ],
          indexes: [
            { name: "alert_rules_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "alert_rules_tenant_idx", columns: ["tenant_id"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "alert_rules_tenant_fk", columns: ["tenant_id"], references: { schema: "iam", table: "tenants", column: "id" }, onDelete: "CASCADE" },
          ],
        },
        {
          name: "alert_incidents",
          schema: "observability",
          description: "Incidentes abertos pelo engine de alerta (1:N com events de acknowledgement).",
          rowCount: 412,
          sizeMB: 4,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "rule_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "alert_rules", column: "id" } },
            { name: "started_at", type: "timestamptz", nullable: false, isPrimary: false },
            { name: "resolved_at", type: "timestamptz", nullable: true, isPrimary: false },
            { name: "acknowledged_by", type: "uuid", nullable: true, isPrimary: false, isForeign: true, references: { table: "users", column: "id" } },
          ],
          indexes: [
            { name: "alert_incidents_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "alert_incidents_rule_idx", columns: ["rule_id", "started_at"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "alert_incidents_rule_fk", columns: ["rule_id"], references: { schema: "observability", table: "alert_rules", column: "id" }, onDelete: "CASCADE" },
            { name: "alert_incidents_ack_fk", columns: ["acknowledged_by"], references: { schema: "iam", table: "users", column: "id" }, onDelete: "SET NULL" },
          ],
        },
        {
          name: "metric_samples",
          schema: "observability",
          description: "Amostras de métrica (10s resolution) — partitionada por dia.",
          rowCount: 2_810_410_220,
          sizeMB: 1_980,
          primaryKey: ["ts", "name", "tenant_id", "labels_hash"],
          columns: [
            { name: "ts", type: "timestamptz", nullable: false, isPrimary: true },
            { name: "name", type: "text", nullable: false, isPrimary: true },
            { name: "tenant_id", type: "uuid", nullable: false, isPrimary: true, isForeign: true, references: { table: "tenants", column: "id" } },
            { name: "labels_hash", type: "bigint", nullable: false, isPrimary: true, comment: "Hash do jsonb de labels (lookups)" },
            { name: "labels", type: "jsonb", nullable: false, isPrimary: false, defaultValue: "'{}'::jsonb" },
            { name: "value", type: "double precision", nullable: false, isPrimary: false },
          ],
          indexes: [
            { name: "metric_samples_pkey", columns: ["ts", "name", "tenant_id", "labels_hash"], unique: true, type: "btree" },
            { name: "metric_samples_name_brin", columns: ["ts"], unique: false, type: "brin" },
            { name: "metric_samples_labels_gin", columns: ["labels"], unique: false, type: "gin" },
          ],
          foreignKeys: [
            { name: "metric_samples_tenant_fk", columns: ["tenant_id"], references: { schema: "iam", table: "tenants", column: "id" }, onDelete: "CASCADE" },
          ],
        },
      ],
    },
    {
      name: "public",
      views: 0,
      functions: 0,
      tables: [
        {
          name: "schema_migrations",
          schema: "public",
          description: "Tracking de migrations aplicadas (idempotente).",
          rowCount: 184,
          sizeMB: 0,
          primaryKey: ["version"],
          columns: [
            { name: "version", type: "bigint", nullable: false, isPrimary: true },
            { name: "name", type: "text", nullable: false, isPrimary: false },
            { name: "applied_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
            { name: "checksum", type: "text", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "schema_migrations_pkey", columns: ["version"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
      ],
    },
  ],
}

export const sgtMaker: DatabaseSchema = {
  id: "sgt-maker",
  name: "sgt-maker-app",
  engine: "postgresql",
  host: "sgt-maker-prod.cluster.local",
  port: 5432,
  version: "16.2",
  sizeMB: 1_240,
  tables: 12,
  schemas: [
    {
      name: "app",
      views: 6,
      functions: 4,
      tables: [
        {
          name: "organizations",
          schema: "app",
          description: "Organizações (tenants) do SGT Maker.",
          rowCount: 142,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "name", type: "text", nullable: false, isPrimary: false },
            { name: "slug", type: "text", nullable: false, isPrimary: false },
            { name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "organizations_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "organizations_slug_key", columns: ["slug"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
        {
          name: "members",
          schema: "app",
          description: "Membros por organização (papel interno).",
          rowCount: 1_204,
          sizeMB: 2,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "organization_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "organizations", column: "id" } },
            { name: "email", type: "citext", nullable: false, isPrimary: false },
            { name: "role", type: "member_role", nullable: false, isPrimary: false, defaultValue: "'viewer'" },
            { name: "joined_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "members_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "members_org_email_key", columns: ["organization_id", "email"], unique: true, type: "btree" },
          ],
          foreignKeys: [
            { name: "members_org_fk", columns: ["organization_id"], references: { schema: "app", table: "organizations", column: "id" }, onDelete: "CASCADE" },
          ],
        },
        {
          name: "projects",
          schema: "app",
          description: "Projetos dentro de uma organização.",
          rowCount: 612,
          sizeMB: 4,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "organization_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "organizations", column: "id" } },
            { name: "name", type: "text", nullable: false, isPrimary: false },
            { name: "status", type: "project_status", nullable: false, isPrimary: false, defaultValue: "'active'" },
            { name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "projects_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "projects_org_idx", columns: ["organization_id"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "projects_org_fk", columns: ["organization_id"], references: { schema: "app", table: "organizations", column: "id" }, onDelete: "CASCADE" },
          ],
        },
        {
          name: "documents",
          schema: "app",
          description: "Documentos do projeto (propostas, contratos, atas).",
          rowCount: 14_812,
          sizeMB: 88,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "project_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "projects", column: "id" } },
            { name: "kind", type: "document_kind", nullable: false, isPrimary: false },
            { name: "title", type: "text", nullable: false, isPrimary: false },
            { name: "storage_key", type: "text", nullable: false, isPrimary: false, comment: "Chave S3/MinIO do blob" },
            { name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "documents_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "documents_project_idx", columns: ["project_id", "kind"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "documents_project_fk", columns: ["project_id"], references: { schema: "app", table: "projects", column: "id" }, onDelete: "CASCADE" },
          ],
        },
        {
          name: "tasks",
          schema: "app",
          description: "Tarefas (kanban) por projeto.",
          rowCount: 84_120,
          sizeMB: 88,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "project_id", type: "uuid", nullable: false, isPrimary: false, isForeign: true, references: { table: "projects", column: "id" } },
            { name: "assignee_id", type: "uuid", nullable: true, isPrimary: false, isForeign: true, references: { table: "members", column: "id" } },
            { name: "title", type: "text", nullable: false, isPrimary: false },
            { name: "status", type: "task_status", nullable: false, isPrimary: false, defaultValue: "'todo'" },
            { name: "due_at", type: "timestamptz", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "tasks_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "tasks_project_status_idx", columns: ["project_id", "status"], unique: false, type: "btree" },
            { name: "tasks_assignee_idx", columns: ["assignee_id"], unique: false, type: "btree" },
            { name: "tasks_due_brin", columns: ["due_at"], unique: false, type: "brin" },
          ],
          foreignKeys: [
            { name: "tasks_project_fk", columns: ["project_id"], references: { schema: "app", table: "projects", column: "id" }, onDelete: "CASCADE" },
            { name: "tasks_assignee_fk", columns: ["assignee_id"], references: { schema: "app", table: "members", column: "id" }, onDelete: "SET NULL" },
          ],
        },
      ],
    },
    {
      name: "analytics",
      tables: [
        {
          name: "page_views",
          schema: "analytics",
          description: "Page views agregados (mat + SPA route).",
          rowCount: 12_410_120,
          sizeMB: 480,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "bigint", nullable: false, isPrimary: true },
            { name: "occurred_at", type: "timestamptz", nullable: false, isPrimary: false },
            { name: "organization_id", type: "uuid", nullable: true, isPrimary: false, isForeign: true, references: { table: "organizations", column: "id" } },
            { name: "route", type: "text", nullable: false, isPrimary: false },
            { name: "referrer", type: "text", nullable: true, isPrimary: false },
            { name: "session_id", type: "uuid", nullable: false, isPrimary: false },
          ],
          indexes: [
            { name: "page_views_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "page_views_occurred_brin", columns: ["occurred_at"], unique: false, type: "brin" },
            { name: "page_views_org_idx", columns: ["organization_id", "occurred_at"], unique: false, type: "btree" },
          ],
          foreignKeys: [
            { name: "page_views_org_fk", columns: ["organization_id"], references: { schema: "app", table: "organizations", column: "id" }, onDelete: "SET NULL" },
          ],
        },
        {
          name: "feature_flags",
          schema: "analytics",
          description: "Toggles de feature flag (com roll-out %).",
          rowCount: 28,
          sizeMB: 0,
          primaryKey: ["key"],
          columns: [
            { name: "key", type: "text", nullable: false, isPrimary: true },
            { name: "description", type: "text", nullable: true, isPrimary: false },
            { name: "enabled", type: "boolean", nullable: false, isPrimary: false, defaultValue: "false" },
            { name: "rollout_pct", type: "integer", nullable: false, isPrimary: false, defaultValue: "0", comment: "0..100" },
            { name: "updated_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "feature_flags_pkey", columns: ["key"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
        {
          name: "experiment_assignments",
          schema: "analytics",
          description: "Atribuição A/B/n por usuário e experimento.",
          rowCount: 482_410,
          sizeMB: 24,
          primaryKey: ["experiment_key", "member_id"],
          columns: [
            { name: "experiment_key", type: "text", nullable: false, isPrimary: true },
            { name: "member_id", type: "uuid", nullable: false, isPrimary: true, isForeign: true, references: { table: "members", column: "id" } },
            { name: "variant", type: "text", nullable: false, isPrimary: false },
            { name: "assigned_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "experiment_assignments_pkey", columns: ["experiment_key", "member_id"], unique: true, type: "btree" },
          ],
          foreignKeys: [
            { name: "experiment_assignments_member_fk", columns: ["member_id"], references: { schema: "app", table: "members", column: "id" }, onDelete: "CASCADE" },
          ],
        },
      ],
    },
    {
      name: "public",
      tables: [
        {
          name: "schema_migrations",
          schema: "public",
          description: "Tracking de migrations aplicadas.",
          rowCount: 64,
          sizeMB: 0,
          primaryKey: ["version"],
          columns: [
            { name: "version", type: "bigint", nullable: false, isPrimary: true },
            { name: "name", type: "text", nullable: false, isPrimary: false },
            { name: "applied_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "schema_migrations_pkey", columns: ["version"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
        {
          name: "health",
          schema: "public",
          description: "Tabela ping do load balancer (1 linha, atualizada por trigger).",
          rowCount: 1,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "integer", nullable: false, isPrimary: true, defaultValue: "1" },
            { name: "updated_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "health_pkey", columns: ["id"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
        {
          name: "waitlist",
          schema: "public",
          description: "Lista de espera para acesso antecipado.",
          rowCount: 8_412,
          sizeMB: 1,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "email", type: "citext", nullable: false, isPrimary: false },
            { name: "referral_source", type: "text", nullable: true, isPrimary: false },
            { name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, defaultValue: "now()" },
          ],
          indexes: [
            { name: "waitlist_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "waitlist_email_key", columns: ["email"], unique: true, type: "btree" },
          ],
          foreignKeys: [],
        },
        {
          name: "feature_announcements",
          schema: "public",
          description: "Banner de novidade (markdown) exibido no app.",
          rowCount: 14,
          sizeMB: 0,
          primaryKey: ["id"],
          columns: [
            { name: "id", type: "uuid", nullable: false, isPrimary: true },
            { name: "title", type: "text", nullable: false, isPrimary: false },
            { name: "body_md", type: "text", nullable: false, isPrimary: false },
            { name: "published_at", type: "timestamptz", nullable: false, isPrimary: false },
            { name: "expires_at", type: "timestamptz", nullable: true, isPrimary: false },
          ],
          indexes: [
            { name: "feature_announcements_pkey", columns: ["id"], unique: true, type: "btree" },
            { name: "feature_announcements_published_idx", columns: ["published_at"], unique: false, type: "btree" },
          ],
          foreignKeys: [],
        },
      ],
    },
  ],
}

const auditExample: Example = {
  title: "Auditoria Postgres — 5 schemas · 24 tabelas",
  description:
    "Warehouse de auditoria multi-tenant com schemas iam/audit/billing/observability/public. Clique nas FKs do painel Foreign keys para navegar entre tabelas.",
  code: `import { DbSchemaExplorer } from "@/components/ui/db-schema-explorer"

const database = {
  id: "audit-db",
  name: "audit-prod-01",
  engine: "postgresql",
  host: "audit-prod-01.internal",
  port: 5432,
  version: "16.4",
  sizeMB: 12_480,
  tables: 24,
  schemas: [/* … 5 schemas · 24 tabelas … */],
}

<DbSchemaExplorer database={database} />`,
  render: (
    <div className="w-full max-w-5xl">
      <DbSchemaExplorer database={auditDb} />
    </div>
  ),
}

const sgtMakerExample: Example = {
  title: "SGT Maker Postgres — 3 schemas · 12 tabelas",
  description:
    "App SGT Maker com schemas app/analytics/public. Tabelas com FKs cruzadas entre app e analytics (page_views, experiment_assignments).",
  code: `import { DbSchemaExplorer } from "@/components/ui/db-schema-explorer"

const database = {
  id: "sgt-maker",
  name: "sgt-maker-app",
  engine: "postgresql",
  host: "sgt-maker-prod.cluster.local",
  port: 5432,
  version: "16.2",
  sizeMB: 1_240,
  tables: 12,
  schemas: [/* … 3 schemas · 12 tabelas … */],
}

<DbSchemaExplorer database={database} />`,
  render: (
    <div className="w-full max-w-5xl">
      <DbSchemaExplorer database={sgtMaker} />
    </div>
  ),
}

export const examplesDbSchemaExplorer: Record<string, Example[]> = {
  "db-schema-explorer": [auditExample, sgtMakerExample],
}
