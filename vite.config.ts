/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteYaml from '@modyfi/vite-plugin-yaml'
import { resolve } from 'path'

// https://vitejs.dev/config/
// https://stackoverflow.com/a/74397545/445757
export default defineConfig({
    plugins: [vue(), ViteYaml()],
    // Add UIKit alias : https://stackoverflow.com/a/75264118/445757
    resolve: {
        alias: {
            '../../images/backgrounds': 'uikit/src/images/backgrounds',
            '../../images/components': 'uikit/src/images/components',
            '../../images/icons': 'uikit/src/images/icons'
        }
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ThemeCRUD6',
            fileName: (format) => `theme-crud6.${format}.js`
        },
        rollupOptions: {
            external: [
                'vue',
                'vue-router',
                'pinia',
                'pinia-plugin-persistedstate',
                'axios',
                'uikit',
                '@userfrosting/sprinkle-core',
                '@userfrosting/sprinkle-account',
                '@userfrosting/theme-pink-cupcake',
                '@ssnukala/sprinkle-crud6'
            ],
            output: {
                globals: {
                    vue: 'Vue',
                    'vue-router': 'VueRouter',
                    pinia: 'Pinia',
                    axios: 'axios',
                    uikit: 'UIkit'
                }
            }
        }
    },
    test: {
        coverage: {
            reportsDirectory: './_meta/_coverage',
            include: ['src/**/*.*'],
        },
        setupFiles: ['src/tests/translator.setup.ts'],
        environment: 'happy-dom'
    }
})
