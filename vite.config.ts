import path from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Dev-only SPA fallback para a rota nua `/components`.
 *
 * A rota de docs `/components` (sem segmento) colide com o arquivo de config
 * `components.json` na raiz: o middleware do Vite resolve `/components` para
 * esse arquivo e o serve como módulo JS (`text/javascript`), impedindo o React
 * de montar em acesso direto/refresh. Este plugin intercepta requisições HTML
 * para exatamente `/components` e devolve o `index.html`, deixando o roteador
 * client-side resolver. Em produção o fallback do servidor estático já cobre
 * isso, então o plugin só atua no dev server.
 */
function componentsRouteSpaFallback(): PluginOption {
  return {
    name: 'components-route-spa-fallback',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]
        const wantsHtml = (req.headers.accept ?? '').includes('text/html')
        if (url === '/components' && wantsHtml) {
          const indexPath = path.resolve(__dirname, 'index.html')
          const html = readFileSync(indexPath, 'utf-8')
          server
            .transformIndexHtml(req.url ?? '/components', html)
            .then((transformed) => {
              res.setHeader('Content-Type', 'text/html')
              res.end(transformed)
            })
            .catch(next)
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), componentsRouteSpaFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    // Vendors pesados viram chunks próprios e só são baixados nas rotas que os
    // usam (globe, world-map, pdf viewer…). O outlier conhecido é `vendor-three`
    // (~1.6MB: three + three-globe + cobe), inerente à lib e lazy-loaded. O
    // limite fica logo acima dele pra que o aviso volte a sinalizar apenas algo
    // realmente fora da curva (uma regressão nova), não esse caso esperado.
    chunkSizeWarningLimit: 1700,
    rollupOptions: {
      output: {
        // Code-splitting de vendor: agrupa libs pesadas em chunks estáveis e
        // cacheáveis, separados do código de aplicação. Cada grupo só entra no
        // grafo quando uma rota/composição lazy o importa.
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (id.includes("/three/") || id.includes("three-globe") || id.includes("/cobe/"))
            return "vendor-three"
          if (id.includes("pdfjs-dist")) return "vendor-pdf"
          if (id.includes("recharts") || id.includes("/d3-") || id.includes("victory"))
            return "vendor-charts"
          if (id.includes("/motion/") || id.includes("framer-motion"))
            return "vendor-motion"
          if (id.includes("@xyflow")) return "vendor-flow"
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("react-router") ||
            id.includes("scheduler")
          )
            return "vendor-react"
        },
      },
    },
  },
})
