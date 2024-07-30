import routify from '@roxi/routify/vite-plugin'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'
import preprocess from 'svelte-preprocess'
import { defineConfig } from 'vite'

const production = process.env.NODE_ENV === 'production'

export default defineConfig({
    clearScreen: false,
    resolve: { alias: { '@': resolve('src') } },
    plugins: [
        routify({
          ssr: { enable: false },
        }),
        svelte({
            compilerOptions: {
                dev: !production,
                hydratable: !!process.env.ROUTIFY_SSR_ENABLE,
            },
            extensions: ['.svelte'],
            preprocess: [preprocess()],
        }),
    ],

    server: { port: 1337 },
})


