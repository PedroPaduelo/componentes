# Plano — Lote shadcn/ui (Lote 1)

**Requisito:** cmq34i3id013frz0ip7qnmgcv
**Data:** 2026-06-07
**Status:** Planejado

## Componentes a integrar

| # | Componente | Slug | Categoria | Deps novas |
|---|-----------|------|-----------|------------|
| 1 | Calendar | `calendar` | Forms | react-day-picker, date-fns |
| 2 | DatePicker | `date-picker` | Forms | (mesmas do Calendar) |
| 3 | Carousel | `carousel` | Layout | embla-carousel-react |
| 4 | Collapsible | `collapsible` | Layout | nenhuma (já instalado) |
| 5 | Command | `command` | Actions | cmdk |
| 6 | ContextMenu | `context-menu` | Actions | @radix-ui/react-context-menu |

## Tasks

| ID | Title | Status |
|----|-------|--------|
| cmq34lhgj0141rz0ic79ph8ur | Integrar Calendar (shadcn/ui) na vitrine | todo |
| cmq34lhgv0143rz0i0lk9pfv1 | Integrar Carousel (shadcn/ui) na vitrine | todo |
| cmq34lhgw0145rz0i0vphx9e0 | Integrar Collapsible (shadcn/ui) na vitrine | todo |
| cmq34lhhk0148rz0ichgfkov0 | Integrar Command (shadcn/ui) na vitrine | todo |
| cmq34lhhk0149rz0i3c54zlsd | Integrar ContextMenu (shadcn/ui) na vitrine | todo |

## Dependências a instalar

```json
{
  "react-day-picker": "^9.x",
  "date-fns": "^4.x",
  "embla-carousel-react": "^8.x",
  "cmdk": "^1.x",
  "@radix-ui/react-context-menu": "^2.x"
}
```

Nota: `@radix-ui/react-collapsible` já está em node_modules.

## Padrão de integração (por componente)

1. `src/components/ui/<slug>.tsx` — componente com data-slot, cn(), named exports
2. `src/data/examples-<slug>.tsx` — Record<string, Example[]> com ≥2 examples
3. `src/data/components.ts` — entry no registry (slug, name, category, description, tags)
4. `src/components/ui/index.ts` — export no bloco `// Lote shadcn`
5. `src/data/examples.tsx` — import + spread

## Gotchas conhecidos

- **EACCES no package.json**: usar fs_edit para declarar deps + `npm install --no-save`
- **Worktree compartilhada**: commit só com `paths` próprios, nunca `git add .`
- **Button API mismatch**: os componentes shadcn v2 usam Button com variant/size específicos — verificar compatibilidade com nosso Button existente
- **Command "use client"**: remover do source shadcn
- **Collapsible animação**: animate-collapse/animate-expand podem não existir no Tailwind v4 — remover se necessário
- **Calendar/DatePicker**: DatePicker = Popover + Calendar. Se Popover não estiver instalado, usar state manual

## Validação por componente

```bash
npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep -i "<slug>"  # deve ser vazio
npm run build   # 0 erros
npm run lint    # 0 erros 0 warnings
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/components/<slug>  # 200
```

## Próximo passo

Despachar task-executors para cada task (5 executores paralelos recomendados).
