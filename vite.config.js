import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'src/pages/about.html'),
                services: resolve(__dirname, 'src/pages/services.html'),
                contact: resolve(__dirname, 'src/pages/contact.html'),
                resources: resolve(__dirname, 'src/pages/resources.html'),
                privacy: resolve(__dirname, 'src/pages/privacy.html'),
            },
        },
    },
});
