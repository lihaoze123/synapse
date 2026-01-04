import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'

  return {
    plugins: [
      isDev && devtools(),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      viteReact(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          ws: true,
        },
        '^/uploads/.*\\.(jpg|jpeg|png|gif|webp)$': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': [
              '@tanstack/react-router',
              '@tanstack/react-query',
            ],
            'vendor-codemirror': [
              'codemirror',
              '@codemirror/view',
              '@codemirror/state',
              '@codemirror/commands',
              '@codemirror/language',
            ],
            'vendor-cm-lang-web': [
              '@codemirror/lang-javascript',
              '@codemirror/lang-html',
              '@codemirror/lang-css',
              '@codemirror/lang-json',
            ],
            'vendor-cm-lang-systems': [
              '@codemirror/lang-cpp',
              '@codemirror/lang-go',
              '@codemirror/lang-rust',
            ],
            'vendor-cm-lang-scripting': [
              '@codemirror/lang-python',
              '@codemirror/lang-php',
              '@codemirror/lang-sql',
            ],
            'vendor-cm-lang-other': [
              '@codemirror/lang-java',
              '@codemirror/lang-markdown',
            ],
            'vendor-markdown': [
              'react-markdown',
              'remark-gfm',
              'remark-math',
              'rehype-katex',
              'rehype-sanitize',
            ],
            'vendor-syntax': ['react-syntax-highlighter'],
            'vendor-katex': ['katex'],
            'vendor-ui': [
              'lucide-react',
              '@radix-ui/react-dialog',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
            ],
          },
        },
      },
    },
  }
})
