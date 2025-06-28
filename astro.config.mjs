import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server', // 🔥 Necesario para usar rutas POST/API
  integrations: [tailwind()],
});
