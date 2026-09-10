import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // Proxied at nexuscareersgh.com/register/* via nexus-webapp's next.config.ts
    // rewrite — this app is permanently mounted under /register for this
    // deployment (both proxied and direct access), so asset URLs need the
    // matching prefix. See src/router.ts's BASE_PATH for the routing half.
    base: '/register/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
server: {
      // With DISABLE_HMR=true the dev server skips HMR and file watching,
      // which avoids flickering/rebuild churn during automated agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
