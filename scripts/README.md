# Scripts

## `check-theme-toggle-variants.mjs`

Validação Playwright — testa cada variante do `ThemeToggleEffect` em light e dark.

**Uso:**
```bash
node scripts/check-theme-toggle-variants.mjs
```

**O que faz:**
- Para cada variante (circle, circle-blur, circle-blur-top-left, triangle, triangle-blur, polygon, polygon-gradient) + sem efeito:
  - Abre a page `/components/theme-toggle-effect` com tema inicial (light/dark)
  - Clica no botão da variante
  - Verifica se o tema alternou corretamente
  - Tira prints em `shots/`

**Saída:** `16/16 OK` (8 configs × 2 temas).
