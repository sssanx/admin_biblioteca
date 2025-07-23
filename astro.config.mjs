import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import path from 'path'; // 👈 importa path

export default defineConfig({
  output: 'server', // Necesario para usar rutas POST/API
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'), // 👈 este alias es clave
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
        supported: {
          'top-level-await': true,
        },
      },
    },
  },
});
