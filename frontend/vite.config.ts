import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default ({ mode }: any) => {

  process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};

  return defineConfig({
    base: process.env.SERVER_PATH,
    plugins: [
      vue(),
      createHtmlPlugin({
        entry: mode === 'debug' ? '/src/main-debug.ts' : '/src/main.ts',
        inject: {
          data: {
            title: mode === 'debug' ? 'Vite App (Debug)' : 'Vite App',
          },
        },
        template: './index.html'
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  })
}